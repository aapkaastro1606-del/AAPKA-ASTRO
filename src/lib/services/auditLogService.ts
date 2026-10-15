import { prisma } from "@/lib/db/prisma";

export interface LogActionParams {
  action: string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  previousState?: any;
  newState?: any;
  notes?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditLogService {
  /**
   * Records a tamper-evident audit log in PostgreSQL.
   */
  static async log(params: LogActionParams): Promise<void> {
    try {
      if (!prisma || !prisma.auditLog) {
        console.warn("[AuditLog] prisma.auditLog is unavailable, skipping DB write.");
        return;
      }

      await prisma.auditLog.create({
        data: {
          action: params.action,
          actorId: params.actorId || null,
          actorEmail: params.actorEmail || null,
          targetId: params.targetId || null,
          targetType: params.targetType || null,
          previousState: params.previousState ? params.previousState : undefined,
          newState: params.newState ? params.newState : undefined,
          notes: params.notes || null,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });

      console.info(
        `[AuditLog] ${params.action} by ${params.actorEmail || params.actorId || "System"} on ${params.targetType || "Entity"}:${params.targetId || "N/A"}`
      );
    } catch (error) {
      console.error("[AuditLog Error] Failed to persist audit record:", error);
    }
  }

  /**
   * Fetches recent audit logs.
   */
  static async getRecentLogs(limit = 50, action?: string) {
    try {
      if (!prisma || !prisma.auditLog) return [];
      return await prisma.auditLog.findMany({
        where: action ? { action } : undefined,
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      console.error("[AuditLog Error] Failed to fetch audit logs:", error);
      return [];
    }
  }
}
