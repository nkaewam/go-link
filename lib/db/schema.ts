import { pgTable, serial, text, timestamp, vector, integer } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  description: text("description"),
  visits: integer("visits").default(0).notNull(),
  owner: text("owner"),
  embedding: vector("embedding", { dimensions: 1536 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
