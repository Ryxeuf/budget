import { getDashboardStats, getTags } from "@/app/actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { ExpensesByTagChart, BudgetSummaryPie, QuotesByTagChart } from "@/components/DashboardCharts";
import { formatCurrency, cn } from "@/lib/utils";
import { TagManager } from "@/components/Forms";
import { Wallet, Receipt, CreditCard, PiggyBank, Scale, TrendingDown, Target, Home, FileText } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-900 border-2 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Coût Total Projeté</CardTitle>
            <Home className="h-5 w-5 text-slate-900" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
              {formatCurrency(stats.totalProjectCost)}
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Déjà payé (total) :</span>
                <span className="font-medium text-slate-900">{formatCurrency(stats.totalSpent)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Reste à payer (devis) :</span>
                <span className="font-medium text-orange-600">+{formatCurrency(stats.remainingToPay)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses Hors Devis</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(stats.expensesOutsideQuotes)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Achats directs sans devis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avancement Travaux</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.budgetExecutionRate.toFixed(1)}%</div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, stats.budgetExecutionRate)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Payé sur devis acceptés</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
            <CreditCard className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenus</CardTitle>
            <PiggyBank className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(stats.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Engagé</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalAcceptedQuotes)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payé sur Devis</CardTitle>
            <TrendingDown className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.spentOnAcceptedQuotes)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Suivi du budget travaux</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetSummaryPie 
              spent={stats.spentOnAcceptedQuotes} 
              remaining={stats.remainingToPay} 
            />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Dépenses par pôle</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesByTagChart data={stats.expensesByTag} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Devis par pôle</CardTitle>
          </CardHeader>
          <CardContent>
            <QuotesByTagChart data={stats.quotesByTag} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TagManager tags={tags} />
      </div>
    </div>
  );
}
