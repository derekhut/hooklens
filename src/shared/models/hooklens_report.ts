import { and, desc, eq } from 'drizzle-orm';

import { hooklensReport } from '@/config/db/schema';
import { db } from '@/core/db';

export type HooklensReportRow = typeof hooklensReport.$inferSelect;
export type NewHooklensReport = typeof hooklensReport.$inferInsert;

export async function createHooklensReport(
  row: NewHooklensReport
): Promise<HooklensReportRow> {
  const [result] = await db().insert(hooklensReport).values(row).returning();
  return result;
}

export async function findPublicHooklensReportById(
  id: string
): Promise<HooklensReportRow | null> {
  const [result] = await db()
    .select()
    .from(hooklensReport)
    .where(and(eq(hooklensReport.id, id), eq(hooklensReport.isPublic, true)))
    .limit(1);

  return result ?? null;
}

export async function listRecentPublicHooklensReports(
  limit = 20
): Promise<HooklensReportRow[]> {
  return db()
    .select()
    .from(hooklensReport)
    .where(eq(hooklensReport.isPublic, true))
    .orderBy(desc(hooklensReport.createdAt))
    .limit(limit);
}
