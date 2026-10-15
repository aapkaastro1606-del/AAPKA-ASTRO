import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { KundliLeadService } from "../src/lib/services/kundliLeadService";
import { GET as adminLeadsGet, DELETE as adminLeadsDelete } from "../src/app/api/admin/leads/route";
import { GET as adminLeadsExportGet } from "../src/app/api/admin/leads/export/route";
import { POST as leadCapturePost } from "../src/app/api/kundli/lead/route";
import { prisma } from "../src/lib/db/prisma";

describe("Free Kundli Lead Capture & DPDP Compliance", () => {
  const testPhone = "+919999988888";

  beforeEach(async () => {
    // Clean up test leads if any exist
    try {
      if (prisma && prisma.kundliLead) {
        await prisma.kundliLead.deleteMany({
          where: {
            phone: { in: [testPhone, "+919999977777", "+919876543210"] },
          },
        });
      }
    } catch {
      // ignore
    }
  });

  test("rejects submission if explicit consent checkbox is unticked", async () => {
    await assert.rejects(
      async () => {
        await KundliLeadService.captureLead({
          name: "Arjun Verma",
          phone: testPhone,
          birthDate: "1994-08-15",
          birthTime: "10:30",
          birthPlace: "Varanasi, Uttar Pradesh, India",
          consentGiven: false, // Unticked
          consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
        });
      },
      {
        message: /Consent is required/,
      }
    );
  });

  test("rejects bot submission when honeypot field is populated", async () => {
    await assert.rejects(
      async () => {
        await KundliLeadService.captureLead({
          name: "Spam Bot",
          phone: testPhone,
          birthDate: "1990-01-01",
          birthTime: "12:00",
          birthPlace: "Cyberia",
          consentGiven: true,
          consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
          honeypot: "https://spamlink.com", // Honeypot populated by bot
        });
      },
      {
        message: /Spam submission rejected/,
      }
    );
  });

  test("rejects script automation when submission velocity is under 1.2 seconds", async () => {
    await assert.rejects(
      async () => {
        await KundliLeadService.captureLead({
          name: "Script Runner",
          phone: testPhone,
          birthDate: "1990-01-01",
          birthTime: "12:00",
          birthPlace: "ScriptCity",
          consentGiven: true,
          consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
          formRenderedAt: Date.now() - 200, // Only 200ms elapsed
        });
      },
      {
        message: /completed suspiciously fast/,
      }
    );
  });

  test("rejects invalid or short phone numbers", async () => {
    await assert.rejects(
      async () => {
        await KundliLeadService.captureLead({
          name: "Pooja",
          phone: "12345", // Less than 10 digits
          birthDate: "1995-02-14",
          birthTime: "06:15",
          birthPlace: "Delhi, India",
          consentGiven: true,
          consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
        });
      },
      {
        message: /at least 10 digits/,
      }
    );
  });

  test("captures valid lead with consent and deduplicates subsequent submissions by phone", async () => {
    // 1. Initial capture
    const res1 = await KundliLeadService.captureLead({
      name: "Meera Sen",
      phone: testPhone,
      email: "meera@example.com",
      gender: "female",
      birthDate: "1996-03-20",
      birthTime: "15:45",
      birthPlace: "Jaipur, Rajasthan, India",
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 5.5,
      consentGiven: true,
      consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
      consentVersion: "v1.0",
    });

    assert.equal(res1.success, true);
    assert.equal(res1.isUpdate, false);
    assert.ok(res1.leadId);

    // Verify in database
    const saved = await prisma.kundliLead.findUnique({
      where: { id: res1.leadId },
    });
    assert.ok(saved);
    assert.equal(saved?.name, "Meera Sen");
    assert.equal(saved?.phone, testPhone);
    assert.equal(saved?.consentGiven, true);

    // 2. Second capture with same phone number but updated birth details
    const res2 = await KundliLeadService.captureLead({
      name: "Meera Sen Sharma",
      phone: testPhone,
      email: "meera.sharma@example.com",
      gender: "female",
      birthDate: "1996-03-20",
      birthTime: "15:50",
      birthPlace: "Udaipur, Rajasthan, India",
      latitude: 24.5854,
      longitude: 73.7125,
      timezone: 5.5,
      consentGiven: true,
      consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
      consentVersion: "v1.0",
    });

    assert.equal(res2.success, true);
    assert.equal(res2.isUpdate, true);
    assert.equal(res2.leadId, res1.leadId, "Must update existing row, not create duplicate");

    // Check updated fields in DB
    const updated = await prisma.kundliLead.findUnique({
      where: { id: res1.leadId },
    });
    assert.equal(updated?.name, "Meera Sen Sharma");
    assert.equal(updated?.placeOfBirth, "Udaipur, Rajasthan, India");
    assert.equal(updated?.email, "meera.sharma@example.com");

    // Check count for this phone is strictly 1
    const totalWithPhone = await prisma.kundliLead.count({
      where: { phone: testPhone },
    });
    assert.equal(totalWithPhone, 1);
  });

  test("non-owner request to admin leads routes is blocked with 403 Forbidden", async () => {
    // Unauthorized client request without owner session
    const req = new NextRequest("http://localhost:3000/api/admin/leads", {
      headers: {
        cookie: `aapka_astro_session=active; aapka_astro_role=CLIENT; aapka_astro_email=visitor@example.com`,
      },
    });

    const res = await adminLeadsGet(req);
    assert.equal(res.status, 403);

    const exportReq = new NextRequest("http://localhost:3000/api/admin/leads/export", {
      headers: {
        cookie: `aapka_astro_session=active; aapka_astro_role=CLIENT; aapka_astro_email=visitor@example.com`,
      },
    });

    const exportRes = await adminLeadsExportGet(exportReq);
    assert.equal(exportRes.status, 403);
  });

  test("owner can query leads, export RFC 4180 CSV, and delete-on-request with audit logging", async () => {
    const ownerEmail = "aapkaastro1606@gmail.com";

    // Create a lead to test export & deletion
    const lead = await KundliLeadService.captureLead({
      name: "Rohit DPDP",
      phone: "+919999977777",
      email: "rohit.dpdp@example.com",
      gender: "male",
      birthDate: "1991-07-11",
      birthTime: "08:15",
      birthPlace: "Pune, Maharashtra, India",
      consentGiven: true,
      consentText: KundliLeadService.DEFAULT_CONSENT_TEXT,
    });

    // 1. Owner GET leads list
    const getReq = new NextRequest("http://localhost:3000/api/admin/leads?search=Rohit", {
      headers: {
        cookie: `aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=${ownerEmail}`,
      },
    });
    const getRes = await adminLeadsGet(getReq);
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.equal(getData.success, true);
    assert.ok(getData.leads.some((l: any) => l.name === "Rohit DPDP"));

    // 2. Owner CSV export
    const exportReq = new NextRequest("http://localhost:3000/api/admin/leads/export", {
      headers: {
        cookie: `aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=${ownerEmail}`,
      },
    });
    const exportRes = await adminLeadsExportGet(exportReq);
    assert.equal(exportRes.status, 200);
    assert.equal(exportRes.headers.get("content-type"), "text/csv; charset=utf-8");
    const csvText = await exportRes.text();
    assert.ok(csvText.includes("Lead ID,Name,Phone"));
    assert.ok(csvText.includes("Rohit DPDP"));

    // Check AuditLog for export event
    const exportLog = await prisma.auditLog.findFirst({
      where: { action: "EXPORT_KUNDLI_LEADS", actorEmail: ownerEmail },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(exportLog, "Must log EXPORT_KUNDLI_LEADS in AuditLog");

    // 3. Owner Delete on Request (Right to Erasure)
    const deleteReq = new NextRequest("http://localhost:3000/api/admin/leads", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        cookie: `aapka_astro_session=active; aapka_astro_role=OWNER; aapka_astro_email=${ownerEmail}`,
      },
      body: JSON.stringify({
        leadId: lead.leadId,
        reason: "User requested data erasure under DPDP Act",
      }),
    });
    const delRes = await adminLeadsDelete(deleteReq);
    const delData = await delRes.json();
    assert.equal(delRes.status, 200);
    assert.equal(delData.success, true);

    // Verify lead was deleted from DB
    const deletedCheck = await prisma.kundliLead.findUnique({
      where: { id: lead.leadId },
    });
    assert.equal(deletedCheck, null, "Lead must be deleted from DB");

    // Check AuditLog for deletion event
    const delLog = await prisma.auditLog.findFirst({
      where: { action: "DELETE_KUNDLI_LEAD", targetId: lead.leadId },
      orderBy: { createdAt: "desc" },
    });
    assert.ok(delLog, "Must log DELETE_KUNDLI_LEAD in AuditLog");
    assert.equal(delLog?.actorEmail, ownerEmail);
  });
});
