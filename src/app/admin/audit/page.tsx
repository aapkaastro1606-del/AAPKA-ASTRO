import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { canAccessRoute } from "@/lib/auth/permissionPolicy";
import AccessDeniedView from "@/components/auth/AccessDeniedView";
import { prisma } from "@/lib/db/prisma";
import AuditLogClient, { AuditLogItem } from "./AuditLogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Trail & Activity Log | Aapka Astro Admin",
  description: "Inspect platform security events, content edits, and administrative actions.",
};

export default async function AuditLogPage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin/audit");
  }

  // Canonical permission check: Owner Only
  const decision = canAccessRoute(auth, "/admin/audit");
  if (!decision.allowed) {
    return (
      <AccessDeniedView
        sectionTitle="Audit Trail & Security Logs"
        message={decision.reason || "You don't have access to this section. Audit logs are strictly reserved for the Platform Owner."}
        userEmail={auth.email}
        userRole={auth.role}
        returnHref={decision.returnUrl}
        returnLabel={decision.returnLabel}
      />
    );
  }

  let initialLogs: AuditLogItem[] = [];
  try {
    if (prisma && prisma.auditLog) {
      const records = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      initialLogs = records.map((r) => ({
        id: r.id,
        action: r.action,
        actorId: r.actorId,
        actorEmail: r.actorEmail || "System",
        targetId: r.targetId,
        targetType: r.targetType,
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  }

  return (
    <AuditLogClient
      initialLogs={initialLogs}
      ownerEmail={auth.email || "aapkaastro1606@gmail.com"}
    />
  );
}
