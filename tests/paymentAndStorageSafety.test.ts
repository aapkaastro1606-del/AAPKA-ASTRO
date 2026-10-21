import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/db/prisma";
import {
  PlatformSettingsService,
  isValidUpiId,
  maskUpiId,
} from "../src/lib/services/platformSettingsService";
import {
  BookingWorkflowService,
  isBase64Payload,
} from "../src/lib/services/bookingWorkflowService";
import { stripExifData, stripJpegExif, stripPngExif } from "../src/lib/utils/imageExifStripper";
import { S3StorageProvider } from "../src/lib/providers/storage/S3StorageProvider";
import { MockStorageProvider } from "../src/lib/providers/storage/MockStorageProvider";
import { GET as diagnosticsHandler } from "../src/app/api/admin/diagnostics/route";
import { __setTestAuthUser } from "../src/lib/auth/serverAuth";
import { NextRequest } from "next/server";

describe("Payment & Storage Safety Comprehensive Suite", { concurrency: 1 }, () => {
  const testUserId = `test-safety-${Date.now()}`;
  const testUserEmail = `safety-${Date.now()}@aapkaastro.com`;

  before(async () => {
    try {
      await prisma.session.deleteMany({
        where: { userEmail: { contains: "safety" } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: "safety" } },
      });
    } catch {}
  });

  after(async () => {
    try {
      await prisma.session.deleteMany({
        where: { userEmail: { contains: "safety" } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: "safety" } },
      });
    } catch {}
  });

  test("1. UPI ID format validation strictly enforces NPCI VPA standards", () => {
    // Valid VPAs
    assert.strictEqual(isValidUpiId("9311215564@okbizaxis"), true);
    assert.strictEqual(isValidUpiId("acharya@okhdfcbank"), true);
    assert.strictEqual(isValidUpiId("user.name-123@paytm"), true);
    assert.strictEqual(isValidUpiId("test_vpa@ybl"), true);
    assert.strictEqual(isValidUpiId("aapkaastro@icici"), true);

    // Invalid VPAs
    assert.strictEqual(isValidUpiId(""), false);
    assert.strictEqual(isValidUpiId(null), false);
    assert.strictEqual(isValidUpiId(undefined), false);
    assert.strictEqual(isValidUpiId("invalid"), false);
    assert.strictEqual(isValidUpiId("user@"), false);
    assert.strictEqual(isValidUpiId("@bank"), false);
    assert.strictEqual(isValidUpiId("a@b"), false); // Too short
    assert.strictEqual(isValidUpiId("spaced upi@okaxis"), false);
    assert.strictEqual(isValidUpiId("user@@okaxis"), false);
    assert.strictEqual(isValidUpiId("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA"), false);
  });

  test("2. UPI ID masking securely redacts identifier while retaining provider handle", () => {
    assert.strictEqual(maskUpiId("9311215564@okbizaxis"), "93***64@okbizaxis");
    assert.strictEqual(maskUpiId("anmol@okaxis"), "an***ol@okaxis");
    assert.strictEqual(maskUpiId("ab@okhdfcbank"), "a***@okhdfcbank");
    assert.strictEqual(maskUpiId("abc@okhdfcbank"), "ab***@okhdfcbank");
    assert.strictEqual(maskUpiId(null), "Unconfigured");
    assert.strictEqual(maskUpiId("invalid-format"), "***");
  });

  test("3. Diagnostics endpoint returns payee name, masked UPI ID, and storage configuration", async () => {
    __setTestAuthUser({ isAuthenticated: true, isOwner: true, role: "OWNER", email: "aapkaastro1606@gmail.com" });
    const ownerCookie = encodeURIComponent(
      JSON.stringify({
        role: "OWNER",
        email: "aapkaastro1606@gmail.com",
      })
    );

    const req = new NextRequest("http://localhost:3000/api/admin/diagnostics", {
      headers: { cookie: `aapka_astro_mock_user=${ownerCookie}` },
    });

    const res = await diagnosticsHandler(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.success, true);
    assert.ok(body.diagnostics.payment);
    assert.ok(typeof body.diagnostics.payment.payeeName === "string");
    assert.ok(typeof body.diagnostics.payment.maskedUpiId === "string");
    assert.ok(body.diagnostics.payment.maskedUpiId.includes("***"));
    assert.ok(typeof body.diagnostics.payment.storageProvider === "string");
    assert.ok(typeof body.diagnostics.payment.unpaidExpiryDays === "number");
  });

  test("4. Payment-settings change triggers transactional security alert and rejects invalid UPI", async () => {
    // Attempt invalid UPI ID
    await assert.rejects(
      async () => {
        await PlatformSettingsService.updatePaymentSettings({
          updates: { upiId: "malicious-invalid-upi" },
          actorEmail: "aapkaastro1606@gmail.com",
        });
      },
      /Invalid UPI ID format/i
    );

    // Valid update triggers successfully
    const updated = await PlatformSettingsService.updatePaymentSettings({
      updates: {
        upiId: "9311215564@okbizaxis",
        payeeName: "Aapka Astro Official",
        unpaidExpiryDays: 3,
      },
      actorEmail: "aapkaastro1606@gmail.com",
    });

    assert.strictEqual(updated.upiId, "9311215564@okbizaxis");
    assert.strictEqual(updated.payeeName, "Aapka Astro Official");
  });

  test("5. Base64 screenshot payload is strictly prohibited in database and rejected", async () => {
    const base64Sample = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    assert.strictEqual(isBase64Payload(base64Sample), true);
    assert.strictEqual(isBase64Payload("ASTRO-12345"), false);
    assert.strictEqual(isBase64Payload("428901284910"), false);

    // Create a real booking for test
    const booking = await BookingWorkflowService.createBooking({
      userId: testUserId,
      clientName: "Safety Tester",
      clientPhone: "+91 99999 88888",
      clientEmail: testUserEmail,
      productType: "astro",
      format: "Google Meet",
    });

    // Attempting to submit base64 as UTR must be rejected
    await assert.rejects(
      async () => {
        await BookingWorkflowService.claimPayment({
          bookingId: booking.bookingId,
          utr: base64Sample,
        });
      },
      /Base64 screenshot data is strictly prohibited/i
    );
  });

  test("6. Pure TypeScript EXIF stripper removes APP1 and metadata chunks", () => {
    // 1. Synthetic JPEG with APP1 (EXIF) segment: 0xFF 0xD8, 0xFF 0xE1 [len], [data], 0xFF 0xDA (SOS), 0x00, 0xFF 0xD9 (EOI)
    const exifData = Buffer.from("Exif\0\0SomeSensitiveLocationData", "utf8");
    const app1Length = exifData.length + 2;
    const lenHi = (app1Length >> 8) & 0xff;
    const lenLo = app1Length & 0xff;

    const mockJpeg = Buffer.concat([
      Buffer.from([0xff, 0xd8]), // SOI
      Buffer.from([0xff, 0xe1, lenHi, lenLo]), // APP1 marker + length
      exifData, // Exif metadata
      Buffer.from([0xff, 0xda, 0x00, 0x02]), // SOS (Start of Scan)
      Buffer.from([0x12, 0x34]), // Image payload
      Buffer.from([0xff, 0xd9]), // EOI
    ]);

    assert.ok(mockJpeg.includes(Buffer.from("Exif")), "Raw test JPEG should contain Exif marker");

    const sanitizedJpeg = stripJpegExif(mockJpeg);
    assert.ok(!sanitizedJpeg.includes(Buffer.from("Exif")), "Sanitized JPEG must NOT contain Exif marker");
    assert.ok(sanitizedJpeg.subarray(0, 2).equals(Buffer.from([0xff, 0xd8])), "JPEG SOI header preserved");
    assert.ok(sanitizedJpeg.includes(Buffer.from([0xff, 0xd9])), "JPEG EOI preserved");

    // 2. Synthetic PNG with eXIf chunk
    const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const exifChunkType = Buffer.from("eXIf", "ascii");
    const exifChunkData = Buffer.from("CameraModelXYZGPS123", "ascii");
    const exifLenBuf = Buffer.alloc(4);
    exifLenBuf.writeUInt32BE(exifChunkData.length, 0);
    const fakeCrc = Buffer.from([0xaa, 0xbb, 0xcc, 0xdd]);

    const iendLen = Buffer.alloc(4);
    const iendChunk = Buffer.concat([iendLen, Buffer.from("IEND", "ascii"), fakeCrc]);

    const mockPng = Buffer.concat([
      pngHeader,
      exifLenBuf,
      exifChunkType,
      exifChunkData,
      fakeCrc,
      iendChunk,
    ]);

    assert.ok(mockPng.includes(Buffer.from("eXIf")), "Raw PNG should contain eXIf chunk");
    const sanitizedPng = stripPngExif(mockPng);
    assert.ok(!sanitizedPng.includes(Buffer.from("eXIf")), "Sanitized PNG must NOT contain eXIf chunk");
    assert.ok(sanitizedPng.subarray(0, 8).equals(pngHeader), "PNG header preserved");
  });

  test("7. Storage provider enforces 5MB limit, image types, random keys, and signed URLs", async () => {
    const s3 = new S3StorageProvider();
    const mock = new MockStorageProvider();

    // Oversized buffer (> 5 MB)
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    await assert.rejects(
      async () => {
        await s3.uploadFile(largeBuffer, "large.jpg", "image/jpeg");
      },
      /exceeds maximum allowable limit of 5 MB/i
    );

    // Disallowed MIME type
    const textBuffer = Buffer.from("Hello world");
    await assert.rejects(
      async () => {
        await mock.uploadFile(textBuffer, "notes.txt", "text/plain");
      },
      /Invalid image format/i
    );

    // Valid small image upload generates random UUID key
    const validImage = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xd9])]);
    const storageKey = await mock.uploadFile(validImage, "receipt.jpg", "image/jpeg", { folder: "screenshots" });

    assert.ok(storageKey.startsWith("screenshots/"));
    assert.ok(storageKey.endsWith(".jpg"));
    assert.strictEqual(storageKey.includes("receipt"), false, "Random UUID key must NOT leak client filename");

    // Short-lived signed URL generated
    const signedUrl = await mock.getSignedDownloadUrl(storageKey, 900);
    assert.ok(signedUrl.includes("expires="));
    assert.ok(signedUrl.includes("sig="));
  });

  test("8. Duplicate UTR submission across bookings is strictly blocked", async () => {
    const testUtr = `UTR-UNIQUE-${Date.now()}`;
    const userA = `user-a-${Date.now()}`;
    const userB = `user-b-${Date.now()}`;

    // Create Booking A and claim payment
    const bookingA = await BookingWorkflowService.createBooking({
      userId: userA,
      clientName: "Client A",
      clientPhone: `+9198${Date.now().toString().slice(-8)}`,
      clientEmail: `${userA}@test.com`,
      productType: "vaastu",
      format: "Google Meet",
    });

    const claimARes = await BookingWorkflowService.claimPayment({
      bookingId: bookingA.bookingId,
      utr: testUtr,
    });
    assert.strictEqual(claimARes.success, true);

    // Create Booking B
    const bookingB = await BookingWorkflowService.createBooking({
      userId: userB,
      clientName: "Client B",
      clientPhone: `+9197${Date.now().toString().slice(-8)}`,
      clientEmail: `${userB}@test.com`,
      productType: "vaastu",
      format: "Google Meet",
    });

    // Attempting to claim Booking B with the same UTR must throw duplicate error
    await assert.rejects(
      async () => {
        await BookingWorkflowService.claimPayment({
          bookingId: bookingB.bookingId,
          utr: testUtr,
        });
      },
      /Duplicate UTRs are not permitted/i
    );
  });

  test("9. Overdue unpaid bookings auto-expire and cannot be claimed", async () => {
    const userExpired = `user-expired-${Date.now()}`;

    const booking = await BookingWorkflowService.createBooking({
      userId: userExpired,
      clientName: "Expired Booking Seeker",
      clientPhone: `+9196${Date.now().toString().slice(-8)}`,
      clientEmail: `${userExpired}@test.com`,
      productType: "vaastu",
      format: "Google Meet",
    });

    // Manually backdate expiresAt into the past
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    await prisma.session.update({
      where: { bookingId: booking.bookingId },
      data: { expiresAt: pastDate },
    });

    // Run expiration job
    const expiredCount = await BookingWorkflowService.expireUnpaidBookings();
    assert.ok(expiredCount >= 1, "At least one overdue booking must be expired");

    const reloaded = await prisma.session.findUnique({
      where: { bookingId: booking.bookingId },
    });
    assert.strictEqual(reloaded?.bookingStatus, "EXPIRED");

    // Attempting to claim payment on expired booking must be rejected
    await assert.rejects(
      async () => {
        await BookingWorkflowService.claimPayment({
          bookingId: booking.bookingId,
          utr: "428901284910",
        });
      },
      /This booking has expired/i
    );
  });

  test("10. First-time ₹1,051 rule cannot be gamed by simultaneous concurrent bookings", async () => {
    const concurrentUserId = `concurrent-user-${Date.now()}`;
    const concurrentEmail = `concurrent-${Date.now()}@test.com`;
    const concurrentPhone = `+9195${Date.now().toString().slice(-8)}`;

    // Attempt two simultaneous bookings concurrently in parallel for the same user
    const bookingPromises = [
      BookingWorkflowService.createBooking({
        userId: concurrentUserId,
        clientName: "Racer One",
        clientPhone: concurrentPhone,
        clientEmail: concurrentEmail,
        productType: "astro",
        format: "Google Meet",
        topic: "Simultaneous request race 1",
      }),
      BookingWorkflowService.createBooking({
        userId: concurrentUserId,
        clientName: "Racer Two",
        clientPhone: concurrentPhone,
        clientEmail: concurrentEmail,
        productType: "astro",
        format: "WhatsApp call",
        topic: "Simultaneous request race 2",
      }),
    ];

    const results = await Promise.allSettled(bookingPromises);

    // Exactly one booking must succeed, and the simultaneous attempt must be rejected
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.strictEqual(fulfilled.length, 1, "Exactly ONE booking may succeed in concurrent attempt");
    assert.strictEqual(rejected.length, 1, "The simultaneous duplicate attempt must be rejected");

    const successfulBooking = (fulfilled[0] as PromiseFulfilledResult<any>).value;
    assert.strictEqual(successfulBooking.lockedAmount, 1051, "The successful first booking gets the ₹1,051 rate");

    const rejectionReason = (rejected[0] as PromiseRejectedResult).reason;
    assert.match(
      rejectionReason?.message || "",
      /already have an active Astro consultation booking in progress/i,
      "Second simultaneous booking was blocked by the active Astro consultation guard"
    );

    // Verify in database: user has only ONE booking
    const userSessions = await prisma.session.findMany({
      where: { userEmail: concurrentEmail },
    });
    assert.strictEqual(userSessions.length, 1, "User must only possess 1 booking in database");
    assert.strictEqual(userSessions[0].lockedAmount, 1051);
  });

  test("11. 90-day retention job purges screenshots older than 90 days", async () => {
    const retentionUser = `retention-${Date.now()}`;
    const oldKey = "screenshots/mock-old-receipt.jpg";

    const testUser = await prisma.user.create({
      data: {
        clerkId: retentionUser,
        identifier: `${retentionUser}@test.com`,
        name: "Retention Old Client",
        phone: `+9194${Date.now().toString().slice(-8)}`,
        email: `${retentionUser}@test.com`,
        role: "CLIENT",
      },
    });

    // Create a session with past creation date > 90 days ago
    const ancientDate = new Date();
    ancientDate.setDate(ancientDate.getDate() - 95);

    const oldSession = await prisma.session.create({
      data: {
        bookingId: `RETENTION-${Date.now()}`,
        clientId: testUser.id,
        userName: testUser.name || "Retention Old Client",
        userPhone: testUser.phone,
        userEmail: testUser.email,
        productType: "astro",
        format: "Google Meet",
        type: "VIDEO",
        totalCost: 1051,
        lockedAmount: 1051,
        bookingStatus: "COMPLETED",
        paymentStatus: "CREDITED",
        paymentScreenshotUrl: oldKey,
        createdAt: ancientDate,
      },
    });

    const retentionResult = await BookingWorkflowService.cleanExpiredPaymentScreenshots(90);
    assert.ok(retentionResult.count >= 1, "At least one aged screenshot must be cleaned");
    assert.ok(retentionResult.deletedKeys.includes(oldKey));

    const reloadedSession = await prisma.session.findUnique({
      where: { id: oldSession.id },
    });
    assert.strictEqual(reloadedSession?.paymentScreenshotUrl, null, "Database paymentScreenshotUrl must be cleared");
  });
});
