import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerAuthUser } from "@/lib/auth/serverAuth";
import { prisma } from "@/lib/db/prisma";
import AdminHomeClient, { ActivityItem } from "./AdminHomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Home — Control Centre | Aapka Astro",
  description: "Central administrative control centre to manage website content, consultation bookings, pricing, and staff.",
};

export default async function AdminHomePage() {
  const auth = await getServerAuthUser();

  if (!auth.isAuthenticated) {
    redirect("/login?redirect_url=/admin");
  }

  // Admin section strictly requires Owner or staff with active permissions
  const hasAccess = auth.isOwner || (auth.permissions && auth.permissions.length > 0);

  if (!hasAccess) {
    redirect("/account");
  }

  // 1. Fetch pending approvals count (UPI verification queue)
  let pendingApprovalsCount = 0;
  try {
    if (prisma && prisma.session) {
      pendingApprovalsCount = await prisma.session.count({
        where: { bookingStatus: "PAYMENT_CLAIMED" },
      });
    }
  } catch (err) {
    console.error("AdminHome error counting pending sessions:", err);
  }

  // 2. Fetch unanswered chatbot questions count (Owner only)
  let unansweredChatCount = 0;
  if (auth.isOwner) {
    try {
      if (prisma && prisma.unansweredQuestion) {
        unansweredChatCount = await prisma.unansweredQuestion.count({
          where: { resolved: false },
        });
      }
    } catch (err) {
      console.error("AdminHome error counting unanswered questions:", err);
    }
  }

  // 3. Fetch recent audit logs for activity feed
  let recentActivity: ActivityItem[] = [];
  try {
    if (prisma && prisma.auditLog) {
      const logs = await prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      });

      recentActivity = logs.map((l) => ({
        id: l.id,
        action: l.action,
        actorEmail: l.actorEmail || "System",
        targetId: l.targetId,
        notes: l.notes,
        createdAt: l.createdAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error("AdminHome error loading audit logs:", err);
  }

  return (
    <AdminHomeClient
      user={{
        email: auth.email || "",
        name: auth.email ? auth.email.split("@")[0] : null,
        isOwner: auth.isOwner,
        role: auth.role || "STAFF",
        permissions: auth.permissions as string[],
      }}
      pendingApprovalsCount={pendingApprovalsCount}
      unansweredChatCount={unansweredChatCount}
      recentActivity={recentActivity}
    />
  );
}
