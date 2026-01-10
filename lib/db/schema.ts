import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const payers = sqliteTable("payers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company"),
  need: text("need").notNull(),
  price: real("price").notNull(),
  isEstimated: integer("is_estimated", { mode: "boolean" }).notNull().default(false),
  isAccepted: integer("is_accepted", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  payerId: integer("payer_id").references(() => payers.id),
  amount: real("amount").notNull(),
  purpose: text("purpose").notNull(),
  label: text("label"),
  date: integer("date", { mode: "timestamp" }),
  quoteId: integer("quote_id").references(() => quotes.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const incomes = sqliteTable("incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  payerId: integer("payer_id").references(() => payers.id),
  amount: real("amount").notNull(),
  purpose: text("purpose").notNull(),
  label: text("label"),
  date: integer("date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

// Many-to-many tables for tags
export const quoteTags = sqliteTable("quote_tags", {
  quoteId: integer("quote_id").notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.quoteId, t.tagId] }),
}));

export const expenseTags = sqliteTable("expense_tags", {
  expenseId: integer("expense_id").notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.expenseId, t.tagId] }),
}));

export const incomeTags = sqliteTable("income_tags", {
  incomeId: integer("income_id").notNull().references(() => incomes.id, { onDelete: 'cascade' }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.incomeId, t.tagId] }),
}));

// Relations
export const quotesRelations = relations(quotes, ({ many }) => ({
  expenses: many(expenses),
  tags: many(quoteTags),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  payer: one(payers, { fields: [expenses.payerId], references: [payers.id] }),
  quote: one(quotes, { fields: [expenses.quoteId], references: [quotes.id] }),
  tags: many(expenseTags),
}));

export const incomesRelations = relations(incomes, ({ one, many }) => ({
  payer: one(payers, { fields: [incomes.payerId], references: [payers.id] }),
  tags: many(incomeTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  quoteTags: many(quoteTags),
  expenseTags: many(expenseTags),
  incomeTags: many(incomeTags),
}));

export const payersRelations = relations(payers, ({ many }) => ({
  expenses: many(expenses),
  incomes: many(incomes),
}));

export const quoteTagsRelations = relations(quoteTags, ({ one }) => ({
  quote: one(quotes, { fields: [quoteTags.quoteId], references: [quotes.id] }),
  tag: one(tags, { fields: [quoteTags.tagId], references: [tags.id] }),
}));

export const expenseTagsRelations = relations(expenseTags, ({ one }) => ({
  expense: one(expenses, { fields: [expenseTags.expenseId], references: [expenses.id] }),
  tag: one(tags, { fields: [expenseTags.tagId], references: [tags.id] }),
}));

export const incomeTagsRelations = relations(incomeTags, ({ one }) => ({
  income: one(incomes, { fields: [incomeTags.incomeId], references: [incomes.id] }),
  tag: one(tags, { fields: [incomeTags.tagId], references: [tags.id] }),
}));
