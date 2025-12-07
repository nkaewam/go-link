import { pgTable, serial, text, timestamp, vector, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  description: text("description"),
  visits: integer("visits").default(0).notNull(),
  owner: text("owner"),
  embedding: vector("embedding", { dimensions: 384 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const linkVisits = pgTable("link_visits", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => links.id, { onDelete: "cascade" }),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
  referrer: text("referrer"),
  owner: text("owner"),
});

export const linksRelations = relations(links, ({ many }) => ({
  visits: many(linkVisits),
}));

export const linkVisitsRelations = relations(linkVisits, ({ one }) => ({
  link: one(links, {
    fields: [linkVisits.linkId],
    references: [links.id],
  }),
}));

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
export type LinkVisit = typeof linkVisits.$inferSelect;
export type NewLinkVisit = typeof linkVisits.$inferInsert;
