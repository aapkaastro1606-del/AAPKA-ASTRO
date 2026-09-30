import { NextRequest, NextResponse } from "next/server";
import { generateWalletStatementCSV, StatementItem } from "@/lib/services/statementService";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_client_demo";

    // Attempt to pull real transactions from Prisma DB, with rich fallback for local dev
    let transactions: StatementItem[] = [];
    let userName = "Aapka Astro Seeker";
    let userIdentifier = "seeker@aapkaastro.com";

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
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
          referenceId: tx.razorpayPaymentId || tx.razorpayOrderId || "N/A",
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
          referenceId: "sess_live_9011",
        },
        {
          id: "TXN-89012",
          date: "2026-09-18 10:15:00",
          type: "RECHARGE",
          description: "Consultation Payment via UPI (Razorpay)",
          amount: 1051,
          balanceAfter: 1051,
          referenceId: "pay_rzp_demo_88219",
        },
      ];
    }

    const csvContent = generateWalletStatementCSV(userName, userIdentifier, transactions);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="AapkaAstro_Statement_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate statement" },
      { status: 500 }
    );
  }
}
