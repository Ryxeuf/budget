"use server";

import { db } from "@/lib/db";
import { 
  payers, tags, quotes, expenses, incomes, 
  quoteTags, expenseTags, incomeTags 
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// PAYERS
export async function getPayers() {
  return await db.select().from(payers);
}

export async function addPayer(name: string) {
  const result = await db.insert(payers).values({ name }).returning();
  revalidatePath("/");
  return result[0];
}

// TAGS
export async function getTags() {
  return await db.select().from(tags);
}

export async function addTag(name: string) {
  const result = await db.insert(tags).values({ name }).returning();
  revalidatePath("/");
  return result[0];
}

// QUOTES
export async function getQuotes() {
  const allQuotes = await db.query.quotes.findMany({
    with: {
      tags: { with: { tag: true } },
      expenses: true,
    },
  });
  return allQuotes;
}

export async function createQuote(data: {
  company?: string;
  need: string;
  price: number;
  isEstimated: boolean;
  isAccepted: boolean;
  tagIds: number[];
}) {
  const { tagIds, ...quoteData } = data;
  const result = await db.insert(quotes).values(quoteData).returning();
  const quoteId = result[0].id;

  if (tagIds.length > 0) {
    await db.insert(quoteTags).values(
      tagIds.map(tagId => ({ quoteId, tagId }))
    );
  }

  revalidatePath("/quotes");
  revalidatePath("/");
  return result[0];
}

export async function updateQuoteStatus(id: number, isAccepted: boolean) {
  await db.update(quotes).set({ isAccepted }).where(eq(quotes.id, id));
  revalidatePath("/quotes");
  revalidatePath("/");
}

// EXPENSES
export async function getExpenses() {
  return await db.query.expenses.findMany({
    with: {
      payer: true,
      quote: true,
      tags: { with: { tag: true } },
    },
  });
}

export async function createExpense(data: {
  payerId: number;
  amount: number;
  purpose: string;
  label?: string;
  date?: Date;
  quoteId?: number;
  tagIds: number[];
}) {
  const { tagIds, ...expenseData } = data;
  const result = await db.insert(expenses).values(expenseData).returning();
  const expenseId = result[0].id;

  if (tagIds.length > 0) {
    await db.insert(expenseTags).values(
      tagIds.map(tagId => ({ expenseId, tagId }))
    );
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return result[0];
}

// INCOMES
export async function getIncomes() {
  return await db.query.incomes.findMany({
    with: {
      payer: true,
      tags: { with: { tag: true } },
    },
  });
}

export async function createIncome(data: {
  payerId: number;
  amount: number;
  purpose: string;
  label?: string;
  date?: Date;
  tagIds: number[];
}) {
  const { tagIds, ...incomeData } = data;
  const result = await db.insert(incomes).values(incomeData).returning();
  const incomeId = result[0].id;

  if (tagIds.length > 0) {
    await db.insert(incomeTags).values(
      tagIds.map(tagId => ({ incomeId, tagId }))
    );
  }

  revalidatePath("/incomes");
  revalidatePath("/");
  return result[0];
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const allExpenses = await getExpenses();
  const allQuotes = await getQuotes();
  const allIncomes = await getIncomes();

  const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = allIncomes.reduce((sum, i) => sum + i.amount, 0);
  
  // Total accepted quotes value
  const totalAcceptedQuotes = allQuotes
    .filter(q => q.isAccepted)
    .reduce((sum, q) => sum + q.price, 0);

  // Remaining to pay (Accepted quotes - Expenses linked to those quotes)
  // Wait, the user said "knowing expenses by pole (tag), knowing what was spent, and what is left to pay"
  // Remaining to pay is usually (Sum of accepted quotes) - (Sum of expenses linked to those quotes)
  
  const spentOnAcceptedQuotes = allExpenses
    .filter(e => e.quoteId !== null)
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingToPay = totalAcceptedQuotes - spentOnAcceptedQuotes;

  // Expenses by tag
  const expensesByTag: Record<string, number> = {};
  allExpenses.forEach(e => {
    e.tags.forEach(et => {
      const tagName = et.tag.name;
      expensesByTag[tagName] = (expensesByTag[tagName] || 0) + e.amount;
    });
  });

  return {
    totalSpent,
    totalIncome,
    totalAcceptedQuotes,
    remainingToPay,
    expensesByTag,
    allExpenses,
    allQuotes,
    allIncomes
  };
}
