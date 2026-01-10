import { getIncomes, getPayers, getTags, createIncome, addPayer } from "@/app/actions";
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Input, Label } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, X } from "lucide-react";
// We can't use Client components here easily for the whole form if we want to keep it simple,
// so I'll create a small IncomeForm component inside or use the same pattern as others.

// Let's create a dedicated IncomeForm in components/Forms.tsx for consistency.

import { IncomeForm } from "@/components/Forms";

export default async function IncomesPage() {
  const incomes = await getIncomes();
  const payers = await getPayers();
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Revenus</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nouveau Revenu</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeForm payers={payers} tags={tags} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {incomes.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                Aucun revenu enregistré.
              </CardContent>
            </Card>
          )}
          {incomes.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)).map((income) => (
            <Card key={income.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <CardTitle>{income.purpose}</CardTitle>
                    {income.label && (
                      <span className="text-sm text-slate-400 font-normal">({income.label})</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    Reçu par <span className="font-medium text-slate-900">{income.payer?.name}</span>
                    {income.date && ` le ${format(income.date, "d MMMM yyyy", { locale: fr })}`}
                  </p>
                </div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(income.amount)}</div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {income.tags.map((it: any) => (
                    <Badge key={it.tagId} variant="secondary">{it.tag.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
