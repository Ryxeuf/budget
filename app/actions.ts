"use server";

import { db } from "@/lib/db";
import { 
  payers, tags, quotes, expenses, incomes, 
  quoteTags, quoteFiles, expenseTags, incomeTags 
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.NODE_ENV === 'production' ? '/app/uploads' : path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

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

export async function deleteTag(id: number) {
  await db.delete(tags).where(eq(tags.id, id));
  revalidatePath("/");
}

// QUOTES
export async function getQuotes() {
  const allQuotes = await db.query.quotes.findMany({
    with: {
      tags: { with: { tag: true } },
      expenses: true,
      files: true,
    },
  });
  return allQuotes;
}

export async function uploadQuoteFile(quoteId: number, formData: FormData) {
  console.log("Starting upload for quote:", quoteId);
  try {
    await ensureUploadDir();
    const file = formData.get("file") as File;
    if (!file) {
      console.log("No file found in formData");
      return;
    }

    console.log("File received:", file.name, "size:", file.size);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    console.log("Writing file to:", filePath);
    await fs.writeFile(filePath, buffer);
    console.log("File written successfully");

    await db.insert(quoteFiles).values({
      quoteId,
      name: file.name,
      path: fileName,
      type: file.type,
    });
    console.log("Database entry created");

    revalidatePath("/quotes");
    revalidatePath("/planned");
    revalidatePath("/remaining");
    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function deleteQuoteFile(id: number) {
  const [fileRecord] = await db.select().from(quoteFiles).where(eq(quoteFiles.id, id));
  if (!fileRecord) return;

  const filePath = path.join(UPLOAD_DIR, fileRecord.path);
  try {
    await fs.unlink(filePath);
  } catch (e) {
    console.error("Error deleting file from disk:", e);
  }

  await db.delete(quoteFiles).where(eq(quoteFiles.id, id));

  revalidatePath("/quotes");
  revalidatePath("/planned");
  revalidatePath("/remaining");
}

export async function createQuote(data: {
  company?: string;
  need: string;
  price: number;
  isEstimated: boolean;
  isAccepted: boolean;
  date?: Date;
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

export async function updateQuote(id: number, data: {
  company?: string;
  need: string;
  price: number;
  isEstimated: boolean;
  isAccepted: boolean;
  date?: Date;
  tagIds: number[];
}) {
  const { tagIds, ...quoteData } = data;
  
  await db.update(quotes).set(quoteData).where(eq(quotes.id, id));

  // Update tags: delete old ones and insert new ones
  await db.delete(quoteTags).where(eq(quoteTags.quoteId, id));
  
  if (tagIds.length > 0) {
    await db.insert(quoteTags).values(
      tagIds.map(tagId => ({ quoteId: id, tagId }))
    );
  }

  revalidatePath("/quotes");
  revalidatePath("/");
}

export async function deleteQuote(id: number) {
  await db.delete(quotes).where(eq(quotes.id, id));
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
  revalidatePath("/quotes");
  revalidatePath("/");
  return result[0];
}

export async function updateExpense(id: number, data: {
  payerId: number;
  amount: number;
  purpose: string;
  label?: string;
  date?: Date;
  quoteId?: number;
  tagIds: number[];
}) {
  const { tagIds, ...expenseData } = data;
  
  await db.update(expenses).set(expenseData).where(eq(expenses.id, id));

  await db.delete(expenseTags).where(eq(expenseTags.expenseId, id));
  if (tagIds.length > 0) {
    await db.insert(expenseTags).values(
      tagIds.map(tagId => ({ expenseId: id, tagId }))
    );
  }

  revalidatePath("/expenses");
  revalidatePath("/quotes");
  revalidatePath("/");
}

export async function deleteExpense(id: number) {
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/expenses");
  revalidatePath("/quotes");
  revalidatePath("/");
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

export async function updateIncome(id: number, data: {
  payerId: number;
  amount: number;
  purpose: string;
  label?: string;
  date?: Date;
  tagIds: number[];
}) {
  const { tagIds, ...incomeData } = data;
  
  await db.update(incomes).set(incomeData).where(eq(incomes.id, id));

  await db.delete(incomeTags).where(eq(incomeTags.incomeId, id));
  if (tagIds.length > 0) {
    await db.insert(incomeTags).values(
      tagIds.map(tagId => ({ incomeId: id, tagId }))
    );
  }

  revalidatePath("/incomes");
  revalidatePath("/");
}

export async function deleteIncome(id: number) {
  await db.delete(incomes).where(eq(incomes.id, id));
  revalidatePath("/incomes");
  revalidatePath("/");
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

  // Calcul du reste à vivre réel (Revenus - Toutes dépenses effectuées)
  const netBalance = totalIncome - totalSpent;

  // Calcul du budget total projeté (Revenus - (Dépenses non liées + Devis acceptés))
  // Dépenses non liées = totalSpent - spentOnAcceptedQuotes
  const unlinkedExpenses = totalSpent - spentOnAcceptedQuotes;
  const projectedBalance = totalIncome - (unlinkedExpenses + totalAcceptedQuotes);

  // Taux d'exécution du budget (Dépenses sur devis / Total devis acceptés)
  const budgetExecutionRate = totalAcceptedQuotes > 0 
    ? (spentOnAcceptedQuotes / totalAcceptedQuotes) * 100 
    : 0;

  // Coût total du projet (Tout ce qui est payé + ce qu'il reste à payer sur devis)
  const totalProjectCost = totalSpent + remainingToPay;

  // Dépenses hors devis
  const expensesOutsideQuotes = totalSpent - spentOnAcceptedQuotes;

  // Dépenses par tag
  const expensesByTag: Record<string, number> = {};
  allExpenses.forEach(e => {
    e.tags.forEach(et => {
      const tagName = et.tag.name;
      expensesByTag[tagName] = (expensesByTag[tagName] || 0) + e.amount;
    });
  });

  // Devis acceptés par tag
  const quotesByTag: Record<string, number> = {};
  allQuotes
    .filter(q => q.isAccepted)
    .forEach(q => {
      q.tags.forEach(qt => {
        const tagName = qt.tag.name;
        quotesByTag[tagName] = (quotesByTag[tagName] || 0) + q.price;
      });
    });

  return {
    totalSpent,
    totalIncome,
    totalAcceptedQuotes,
    remainingToPay,
    netBalance,
    projectedBalance,
    budgetExecutionRate,
    totalProjectCost,
    spentOnAcceptedQuotes,
    expensesOutsideQuotes,
    expensesByTag,
    quotesByTag,
    allExpenses,
    allQuotes,
    allIncomes
  };
}
