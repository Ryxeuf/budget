import { getExpenses, getPayers, getTags, getQuotes } from "@/app/actions";
import { ExpenseForm } from "@/components/Forms";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Dépense</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm payers={payers} tags={tags} quotes={quotes} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {expenses.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                Aucune dépense enregistrée.
              </CardContent>
            </Card>
          )}
          {expenses.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)).map((expense) => (
            <Card key={expense.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <CardTitle>{expense.purpose}</CardTitle>
                    {expense.label && (
                      <span className="text-sm text-slate-400 font-normal">({expense.label})</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Payé par <span className="font-medium text-slate-900">{expense.payer?.name}</span>
                    {expense.date && ` le ${format(expense.date, "d MMMM yyyy", { locale: fr })}`}
                  </p>
                </div>
                <div className="text-xl font-bold">{formatCurrency(expense.amount)}</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-2">
                  {expense.tags.map((et: any) => (
                    <Badge key={et.tagId} variant="secondary">{et.tag.name}</Badge>
                  ))}
                </div>
                {expense.quote && (
                  <div className="text-xs text-slate-500 italic">
                    Lié au devis: {expense.quote.need} ({expense.quote.company})
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
