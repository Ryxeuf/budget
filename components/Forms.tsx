"use client";

import { useState } from "react";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "./ui";
import { createQuote, createExpense, createIncome, addPayer, addTag } from "@/app/actions";
import { Plus, X } from "lucide-react";

export function QuoteForm({ tags, onComplete }: { tags: any[], onComplete?: () => void }) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  async function action(formData: FormData) {
    const data = {
      company: formData.get("company") as string || undefined,
      need: formData.get("need") as string,
      price: parseFloat(formData.get("price") as string),
      isEstimated: formData.get("isEstimated") === "on",
      isAccepted: formData.get("isAccepted") === "on",
      tagIds: selectedTags,
    };
    await createQuote(data);
    if (onComplete) onComplete();
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="company">Entreprise (optionnel)</Label>
        <Input id="company" name="company" placeholder="Nom de l'entreprise" />
      </div>
      <div>
        <Label htmlFor="need">Besoin</Label>
        <Input id="need" name="need" required placeholder="Description du besoin" />
      </div>
      <div>
        <Label htmlFor="price">Prix</Label>
        <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isEstimated" /> Devis estimatif
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isAccepted" /> Devis accepté
        </label>
      </div>
      <div>
        <Label>Tags (Pôles)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
              )}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.id) 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">Enregistrer le devis</Button>
    </form>
  );
}

export function ExpenseForm({ 
  payers, 
  tags, 
  quotes, 
  onComplete 
}: { 
  payers: any[], 
  tags: any[], 
  quotes: any[],
  onComplete?: () => void 
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isAddingPayer, setIsAddingPayer] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");

  async function action(formData: FormData) {
    const data = {
      payerId: parseInt(formData.get("payerId") as string),
      amount: parseFloat(formData.get("amount") as string),
      purpose: formData.get("purpose") as string,
      label: formData.get("label") as string || undefined,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      quoteId: formData.get("quoteId") ? parseInt(formData.get("quoteId") as string) : undefined,
      tagIds: selectedTags,
    };
    await createExpense(data);
    if (onComplete) onComplete();
  }

  async function handleAddPayer() {
    if (newPayerName) {
      await addPayer(newPayerName);
      setNewPayerName("");
      setIsAddingPayer(false);
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="payerId">Qui a payé ?</Label>
          <select 
            id="payerId" 
            name="payerId" 
            required 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            <option value="">Sélectionner un payeur</option>
            {payers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button type="button" variant="outline" size="md" onClick={() => setIsAddingPayer(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAddingPayer && (
        <div className="flex gap-2 rounded-md border p-2 bg-slate-50">
          <Input 
            placeholder="Nom du nouveau payeur" 
            value={newPayerName} 
            onChange={(e) => setNewPayerName(e.target.value)} 
          />
          <Button type="button" size="sm" onClick={handleAddPayer}>Ajouter</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingPayer(false)}><X className="h-4 w-4"/></Button>
        </div>
      )}

      <div>
        <Label htmlFor="purpose">Pour quoi ?</Label>
        <Input id="purpose" name="purpose" required placeholder="Description de la dépense" />
      </div>
      <div>
        <Label htmlFor="label">Libellé (optionnel)</Label>
        <Input id="label" name="label" placeholder="Note ou précision supplémentaire" />
      </div>
      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
      </div>
      <div>
        <Label htmlFor="date">Quand ? (optionnel)</Label>
        <Input id="date" name="date" type="date" />
      </div>
      <div>
        <Label htmlFor="quoteId">Lié à un devis ? (optionnel)</Label>
        <select 
          id="quoteId" 
          name="quoteId" 
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          <option value="">Aucun devis</option>
          {quotes.filter(q => q.isAccepted).map(q => (
            <option key={q.id} value={q.id}>{q.need} ({q.company}) - {q.price}€</option>
          ))}
        </select>
      </div>
      <div>
        <Label>Tags (Pôles)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
              )}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.id) 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">Enregistrer la dépense</Button>
    </form>
  );
}

export function IncomeForm({ 
  payers, 
  tags, 
  onComplete 
}: { 
  payers: any[], 
  tags: any[], 
  onComplete?: () => void 
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isAddingPayer, setIsAddingPayer] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");

  async function action(formData: FormData) {
    const data = {
      payerId: parseInt(formData.get("payerId") as string),
      amount: parseFloat(formData.get("amount") as string),
      purpose: formData.get("purpose") as string,
      label: formData.get("label") as string || undefined,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      tagIds: selectedTags,
    };
    await createIncome(data);
    if (onComplete) onComplete();
  }

  async function handleAddPayer() {
    if (newPayerName) {
      await addPayer(newPayerName);
      setNewPayerName("");
      setIsAddingPayer(false);
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="payerId">Qui reçoit ?</Label>
          <select 
            id="payerId" 
            name="payerId" 
            required 
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
          >
            <option value="">Sélectionner un bénéficiaire</option>
            {payers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button type="button" variant="outline" size="md" onClick={() => setIsAddingPayer(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {isAddingPayer && (
        <div className="flex gap-2 rounded-md border p-2 bg-slate-50">
          <Input 
            placeholder="Nom" 
            value={newPayerName} 
            onChange={(e) => setNewPayerName(e.target.value)} 
          />
          <Button type="button" size="sm" onClick={handleAddPayer}>Ajouter</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingPayer(false)}><X className="h-4 w-4"/></Button>
        </div>
      )}

      <div>
        <Label htmlFor="purpose">Source / Motif</Label>
        <Input id="purpose" name="purpose" required placeholder="Description du revenu" />
      </div>
      <div>
        <Label htmlFor="label">Libellé (optionnel)</Label>
        <Input id="label" name="label" placeholder="Note ou précision supplémentaire" />
      </div>
      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" />
      </div>
      <div>
        <Label htmlFor="date">Quand ? (optionnel)</Label>
        <Input id="date" name="date" type="date" />
      </div>
      <div>
        <Label>Tags (Pôles)</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTags(prev => 
                prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
              )}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTags.includes(tag.id) 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">Enregistrer le revenu</Button>
    </form>
  );
}

export function TagManager({ tags }: { tags: any[] }) {
  const [newName, setNewName] = useState("");

  async function handleAdd() {
    if (newName) {
      await addTag(newName);
      setNewName("");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gérer les Pôles (Tags)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Nouveau pôle" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <Button onClick={handleAdd}>Ajouter</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <div key={tag.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {tag.name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
