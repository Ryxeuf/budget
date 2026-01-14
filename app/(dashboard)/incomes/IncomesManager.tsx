"use client";

import { useState } from "react";
import { getIncomes, deleteIncome } from "@/app/actions";
import { IncomeForm } from "@/components/Forms";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit2, Trash2, Search } from "lucide-react";

export function IncomesManager({ 
  initialIncomes, 
  payers, 
  tags 
}: { 
  initialIncomes: any[], 
  payers: any[], 
  tags: any[] 
}) {
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [incomes, setIncomes] = useState(initialIncomes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const refreshIncomes = async () => {
    const updatedIncomes = await getIncomes();
    setIncomes(updatedIncomes);
  };

  async function handleDelete(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce revenu ?")) {
      await deleteIncome(id);
      await refreshIncomes();
    }
  }

  const filteredIncomes = incomes.filter(income => {
    const matchesSearch = 
      income.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (income.label?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (income.payer?.name.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTagId === null || 
      income.tags.some((t: any) => t.tagId === selectedTagId);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>{editingIncome ? "Modifier le Revenu" : "Nouveau Revenu"}</CardTitle>
          </CardHeader>
          <CardContent>
            <IncomeForm 
              payers={payers} 
              tags={tags} 
              initialData={editingIncome}
              onComplete={() => {
                setEditingIncome(null);
                refreshIncomes();
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
              placeholder="Rechercher par description, bénéficiaire..." 
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

        {filteredIncomes.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              Aucun revenu ne correspond à vos critères.
            </CardContent>
          </Card>
        )}
        {filteredIncomes.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)).map((income) => (
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
                  {income.date && ` le ${format(new Date(income.date), "d MMMM yyyy", { locale: fr })}`}
                </p>
              </div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(income.amount)}</div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {income.tags.map((it: any) => (
                  <Badge key={it.tagId} variant="secondary">{it.tag.name}</Badge>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setEditingIncome(income);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(income.id)}
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
