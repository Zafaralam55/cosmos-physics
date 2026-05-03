import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const announcementsTable = pgTable("announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull().default("info"),
  sentBy: text("sent_by"),
  pushSent: integer("push_sent").notNull().default(0),
  pushTotal: integer("push_total").notNull().default(0),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
