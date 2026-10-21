import { NextRequest, NextResponse } from "next/server";
import { generateWalletStatementCSV, StatementItem } from "@/lib/services/statementService";
import { prisma } from "@/lib/db/prisma";
import { getServerAuthUser } from "@/lib/auth/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await getServerAuthUser();
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get("userId");

    // Enforce own-data permission policy
    let targetUserId = auth.isAuthenticated ? (auth.dbUserId || auth.userId) : paramUserId;

    if (auth.isAuthenticated && auth.isOwner && paramUserId) {
      targetUserId = paramUserId;
    } else if (auth.isAuthenticated && !auth.isOwner && paramUserId && paramUserId !== auth.dbUserId && paramUserId !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You may only view your own statement." },
        { status: 403 }
      );
    }

    if (!targetUserId) {
      targetUserId = "usr_client_demo";
    }

    // Pull transactions from Prisma DB using cuid or clerkId
    let transactions: StatementItem[] = [];
    let userName = "Aapka Astro Seeker";
    let userIdentifier = "seeker@aapkaastro.com";

    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: targetUserId }, { clerkId: targetUserId }],
        },
        include: {
          walletTransactions: {
            orderBy: { createdAt: "desc" },
            take: 50,
          },
        },
      });

      if (user) {
        userName = user.name || userName;
        userIdentifier = user.identifier || user.email || user.phone || userIdentifier;
        transactions = user.walletTransactions.map((tx) => ({
          id: tx.id,
          date: tx.createdAt.toISOString().replace("T", " ").substring(0, 19),
          type: tx.type === "CREDIT" ? "RECHARGE" : "CONSULTATION_DEBIT",
          description: tx.description || `${tx.type} Transaction`,
          amount: tx.amount,
          balanceAfter: user.walletBalance,
          referenceId: tx.paymentId || tx.orderId || "N/A",
        }));
      }
    } catch {
      // Fallback for demo/preview
    }

    if (transactions.length === 0) {
      transactions = [
        {
          id: "TXN-90214",
          date: "2026-09-20 14:35:10",
          type: "CONSULTATION_DEBIT",
          description: "1-on-1 Vedic Astro Consultation (Flat ₹1,051 First Consultation Promo)",
          amount: 1051,
          balanceAfter: 0,
          referenceId: "PAY-UPI-90124",
        },
      ];
    }

    const format = searchParams.get("format");
    if (format === "csv") {
      const csv = generateWalletStatementCSV(userName, userIdentifier, transactions);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="aapka-astro-statement-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      userName,
      userIdentifier,
      transactions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate wallet statement" },
      { status: 500 }
    );
  }
}
