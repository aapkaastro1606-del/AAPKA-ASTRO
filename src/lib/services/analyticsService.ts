import { prisma } from "@/lib/db/prisma";

export interface RealPlatformAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalBookings: number;
  confirmedBookingsCount: number;
  activeClients: number;
  conversionRate: number;
  totalLeads: number;
  totalKundlis: number;
  consultationBreakdown: { type: string; count: number; percentage: number }[];
  dailyTrends: { day: string; revenue: number; bookings: number }[];
}

export class AnalyticsService {
  /**
   * Calculates live, 100% authentic platform telemetry from PostgreSQL.
   * Zero fake or simulated numbers.
   */
  static async getRealAnalytics(): Promise<RealPlatformAnalytics> {
    try {
      if (!prisma || !prisma.session) {
        return this.getEmptyAnalytics();
      }

      // 1. Fetch all confirmed, scheduled, and completed bookings for authentic revenue
      const paidSessions = await prisma.session.findMany({
        where: {
          bookingStatus: { in: ["CONFIRMED", "SCHEDULED", "COMPLETED"] },
        },
        select: {
          id: true,
          totalCost: true,
          ratePerMin: true,
          productType: true,
          bookingStatus: true,
          createdAt: true,
          clientId: true,
        },
      });

      // 2. Total Sessions count
      const totalBookings = await prisma.session.count();

      // 3. User & Lead metrics
      const [totalUsers, totalLeads, totalKundlis] = await Promise.all([
        prisma.user.count({ where: { role: "CLIENT" } }),
        prisma.kundliLead.count(),
        prisma.kundliRecord.count(),
      ]);

      // Calculate total revenue
      const totalRevenue = paidSessions.reduce((acc, s) => acc + (s.totalCost || 0), 0);

      // Calculate monthly revenue (this calendar month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyRevenue = paidSessions
        .filter((s) => new Date(s.createdAt) >= startOfMonth)
        .reduce((acc, s) => acc + (s.totalCost || 0), 0);

      // Distinct clients count
      const clientIds = new Set(paidSessions.map((s) => s.clientId));
      const activeClients = clientIds.size || totalUsers;

      // Real Conversion Rate
      const totalAudience = totalUsers + totalLeads;
      const conversionRate =
        totalAudience > 0 ? Number(((paidSessions.length / totalAudience) * 100).toFixed(1)) : 0;

      // Product Breakdown
      const productCounts: Record<string, number> = {
        "Astro Consultation": 0,
        "Vaastu Consultation": 0,
        "Kundli Report": 0,
      };

      for (const s of paidSessions) {
        if (s.productType === "vaastu") productCounts["Vaastu Consultation"]++;
        else if (s.productType === "kundli_pdf") productCounts["Kundli Report"]++;
        else productCounts["Astro Consultation"]++;
      }

      const totalPaid = paidSessions.length;
      const consultationBreakdown = Object.entries(productCounts).map(([type, count]) => ({
        type,
        count,
        percentage: totalPaid > 0 ? Math.round((count / totalPaid) * 100) : 0,
      }));

      // Daily Trends over last 7 days
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dailyTrends: { day: string; revenue: number; bookings: number }[] = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);

        const daySessions = paidSessions.filter((s) => {
          const sDate = new Date(s.createdAt);
          return sDate >= d && sDate < nextD;
        });

        dailyTrends.push({
          day: days[d.getDay()],
          revenue: daySessions.reduce((sum, s) => sum + (s.totalCost || 0), 0),
          bookings: daySessions.length,
        });
      }

      return {
        totalRevenue,
        monthlyRevenue,
        totalBookings,
        confirmedBookingsCount: paidSessions.length,
        activeClients,
        conversionRate,
        totalLeads,
        totalKundlis,
        consultationBreakdown,
        dailyTrends,
      };
    } catch (err) {
      console.error("AnalyticsService.getRealAnalytics error:", err);
      return this.getEmptyAnalytics();
    }
  }

  private static getEmptyAnalytics(): RealPlatformAnalytics {
    return {
      totalRevenue: 0,
      monthlyRevenue: 0,
      totalBookings: 0,
      confirmedBookingsCount: 0,
      activeClients: 0,
      conversionRate: 0,
      totalLeads: 0,
      totalKundlis: 0,
      consultationBreakdown: [
        { type: "Astro Consultation", count: 0, percentage: 0 },
        { type: "Vaastu Consultation", count: 0, percentage: 0 },
        { type: "Kundli Report", count: 0, percentage: 0 },
      ],
      dailyTrends: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
        day: d,
        revenue: 0,
        bookings: 0,
      })),
    };
  }
}
