import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workspace notes / records
export const workspaceNotes = pgTable('workspace_notes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  source: text('source').notNull(),
  snippet: text('snippet'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Google Tasks synchronized to Cloud SQL
export const googleTasksSync = pgTable('google_tasks_sync', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  taskId: text('task_id').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  status: text('status').notNull().default('needsAction'),
  due: text('due'),
  syncedAt: timestamp('synced_at').defaultNow(),
});

// Titan Sovereign Security Audit Logs
export const securityAuditLogs = pgTable('security_audit_logs', {
  id: serial('id').primaryKey(),
  nodeId: text('node_id').notNull(),
  event: text('event').notNull(),
  entropy: text('entropy'),
  stateRoot: text('state_root'),
  uccSeal: text('ucc_seal'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(workspaceNotes),
}));
