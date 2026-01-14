import { getExpenses, getPayers, getTags, getQuotes } from "@/app/actions";
import { ExpensesManager } from "./ExpensesManager";

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const payers = await getPayers();
  const tags = await getTags();
  const quotes = await getQuotes();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dépenses</h2>
      </div>

      <ExpensesManager 
        initialExpenses={expenses} 
        payers={payers} 
        tags={tags} 
        quotes={quotes} 
      />
    </div>
  );
}
