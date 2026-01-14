"use client";

import { useState } from "react";
import { getExpenses, deleteExpense } from "@/app/actions";
import { ExpenseForm } from "@/components/Forms";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit2, Trash2, Search } from "lucide-react";

export function ExpensesManager({ 
  initialExpenses, 
  payers, 
  tags, 
  quotes 
}: { 
  initialExpenses: any[], 
  payers: any[], 
  tags: any[], 
  quotes: any[] 
}) {
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const refreshExpenses = async () => {
    const updatedExpenses = await getExpenses();
    setExpenses(updatedExpenses);
  };

  async function handleDelete(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      await deleteExpense(id);
      await refreshExpenses();
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = 
      expense.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.label?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (expense.payer?.name.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTagId === null || 
      expense.tags.some((t: any) => t.tagId === selectedTagId);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>{editingExpense ? "Modifier la Dépense" : "Nouvelle Dépense"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm 
              payers={payers} 
              tags={tags} 
              quotes={quotes}
              initialData={editingExpense}
              onComplete={() => {
                setEditingExpense(null);
                refreshExpenses();
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-4">
        {/* FILTERS */}
        <div className="space-y-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Rechercher par description, payeur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <Button 
              variant={selectedTagId === null ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setSelectedTagId(null)}
              className="whitespace-nowrap"
            >
              Tous
            </Button>
            {tags.map(tag => (
              <Button 
                key={tag.id}
                variant={selectedTagId === tag.id ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setSelectedTagId(tag.id)}
                className="whitespace-nowrap"
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredExpenses.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              Aucune dépense ne correspond à vos critères.
            </CardContent>
          </Card>
        )}
        {filteredExpenses.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)).map((expense) => (
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
                  {expense.date && ` le ${format(new Date(expense.date), "d MMMM yyyy", { locale: fr })}`}
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
                <div className="text-xs text-slate-500 italic mb-4">
                  Lié au devis: {expense.quote.need} ({expense.quote.company})
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditingExpense(expense);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(expense.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
