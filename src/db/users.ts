import { db } from './index.ts';
import { users, workspaceNotes, googleTasksSync, securityAuditLogs } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Database getOrCreateUser failed:", error);
    throw new Error("Failed to synchronize user in database", { cause: error });
  }
}

export async function getAuditLogs() {
  try {
    return await db.select().from(securityAuditLogs).orderBy(desc(securityAuditLogs.createdAt)).limit(50);
  } catch (error) {
    console.error("Database getAuditLogs failed:", error);
    throw new Error("Failed to retrieve audit logs from database", { cause: error });
  }
}

export async function insertAuditLog(data: { nodeId: string; event: string; entropy?: string; stateRoot?: string; uccSeal?: string }) {
  try {
    return await db.insert(securityAuditLogs).values(data).returning();
  } catch (error) {
    console.error("Database insertAuditLog failed:", error);
    throw new Error("Failed to record audit log in database", { cause: error });
  }
}

export async function getUserTasks(userId: string) {
  try {
    return await db.select().from(googleTasksSync).where(eq(googleTasksSync.userId, userId));
  } catch (error) {
    console.error("Database getUserTasks failed:", error);
    throw new Error("Failed to retrieve tasks from database", { cause: error });
  }
}

export async function syncUserTask(data: { userId: string; taskId: string; title: string; notes?: string; status: string; due?: string }) {
  try {
    return await db.insert(googleTasksSync).values(data).returning();
  } catch (error) {
    console.error("Database syncUserTask failed:", error);
    throw new Error("Failed to save task to database", { cause: error });
  }
}
