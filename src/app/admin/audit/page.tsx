import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
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

  // Strictly Owner-only
  if (!auth.isOwner) {
    redirect("/admin");
  }

  let initialLogs: AuditLogItem[] = [];
  try {
    if (prisma && prisma.auditLog) {
      const records = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      });

      initialLogs = records.map((l) => ({
        id: l.id,
        action: l.action,
        actorEmail: l.actorEmail || "System",
        targetId: l.targetId,
        targetType: l.targetType,
        notes: l.notes,
        createdAt: l.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error("Error loading initial audit logs:", err);
  }

  return (
    <AuditLogClient
      initialLogs={initialLogs}
      ownerEmail={auth.email || "aapkaastro1606@gmail.com"}
    />
  );
}
