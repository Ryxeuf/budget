"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from "./ui";
import { 
  createQuote, updateQuote, 
  createExpense, updateExpense, 
  createIncome, updateIncome, 
  addPayer, addTag, deleteTag 
} from "@/app/actions";
import { Plus, X } from "lucide-react";

export function QuoteForm({ 
  tags, 
  initialData,
  onComplete 
}: { 
  tags: any[], 
  initialData?: any,
  onComplete?: () => void 
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>(
    initialData?.tags?.map((t: any) => t.tagId) || []
  );

  useEffect(() => {
    if (initialData) {
      setSelectedTags(initialData.tags?.map((t: any) => t.tagId) || []);
    }
  }, [initialData]);

  async function action(formData: FormData) {
    const data = {
      company: formData.get("company") as string || undefined,
      need: formData.get("need") as string,
      price: parseFloat(formData.get("price") as string),
      isEstimated: formData.get("isEstimated") === "on",
      isAccepted: formData.get("isAccepted") === "on",
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      tagIds: selectedTags,
    };

    if (initialData) {
      await updateQuote(initialData.id, data);
    } else {
      await createQuote(data);
    }

    if (onComplete) onComplete();
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="company">Entreprise (optionnel)</Label>
        <Input 
          id="company" 
          name="company" 
          defaultValue={initialData?.company || ""} 
          placeholder="Nom de l'entreprise" 
        />
      </div>
      <div>
        <Label htmlFor="need">Besoin</Label>
        <Input 
          id="need" 
          name="need" 
          required 
          defaultValue={initialData?.need || ""} 
          placeholder="Description du besoin" 
        />
      </div>
      <div>
        <Label htmlFor="price">Prix</Label>
        <Input 
          id="price" 
          name="price" 
          type="number" 
          step="0.01" 
          required 
          defaultValue={initialData?.price || ""} 
          placeholder="0.00" 
        />
      </div>
      <div>
        <Label htmlFor="date">Date (optionnel)</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ""} 
        />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            name="isEstimated" 
            defaultChecked={initialData?.isEstimated} 
          /> Devis estimatif
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input 
            type="checkbox" 
            name="isAccepted" 
            defaultChecked={initialData?.isAccepted} 
          /> Devis accepté
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
      <Button type="submit" className="w-full">
        {initialData ? "Modifier le devis" : "Enregistrer le devis"}
      </Button>
      {initialData && (
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onComplete}
        >
          Annuler
        </Button>
      )}
    </form>
  );
}

export function ExpenseForm({ 
  payers, 
  tags, 
  quotes, 
  initialData,
  onComplete 
}: { 
  payers: any[], 
  tags: any[], 
  quotes: any[],
  initialData?: any,
  onComplete?: () => void 
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>(
    initialData?.tags?.map((t: any) => t.tagId) || []
  );
  const [isAddingPayer, setIsAddingPayer] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");

  useEffect(() => {
    if (initialData) {
      setSelectedTags(initialData.tags?.map((t: any) => t.tagId) || []);
    }
  }, [initialData]);

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

    if (initialData) {
      await updateExpense(initialData.id, data);
    } else {
      await createExpense(data);
    }

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
            defaultValue={initialData?.payerId || ""}
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
        <Input 
          id="purpose" 
          name="purpose" 
          required 
          defaultValue={initialData?.purpose || ""}
          placeholder="Description de la dépense" 
        />
      </div>
      <div>
        <Label htmlFor="label">Libellé (optionnel)</Label>
        <Input 
          id="label" 
          name="label" 
          defaultValue={initialData?.label || ""}
          placeholder="Note ou précision supplémentaire" 
        />
      </div>
      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input 
          id="amount" 
          name="amount" 
          type="number" 
          step="0.01" 
          required 
          defaultValue={initialData?.amount || ""}
          placeholder="0.00" 
        />
      </div>
      <div>
        <Label htmlFor="date">Quand ? (optionnel)</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ""}
        />
      </div>
      <div>
        <Label htmlFor="quoteId">Lié à un devis ? (optionnel)</Label>
        <select 
          id="quoteId" 
          name="quoteId" 
          defaultValue={initialData?.quoteId || ""}
          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
        >
          <option value="">Aucun devis</option>
          {quotes.filter(q => q.isAccepted || q.id === initialData?.quoteId).map(q => (
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
      <Button type="submit" className="w-full">
        {initialData ? "Modifier la dépense" : "Enregistrer la dépense"}
      </Button>
      {initialData && (
        <Button type="button" variant="outline" className="w-full" onClick={onComplete}>Annuler</Button>
      )}
    </form>
  );
}

export function IncomeForm({ 
  payers, 
  tags, 
  initialData,
  onComplete 
}: { 
  payers: any[], 
  tags: any[], 
  initialData?: any,
  onComplete?: () => void 
}) {
  const [selectedTags, setSelectedTags] = useState<number[]>(
    initialData?.tags?.map((t: any) => t.tagId) || []
  );
  const [isAddingPayer, setIsAddingPayer] = useState(false);
  const [newPayerName, setNewPayerName] = useState("");

  useEffect(() => {
    if (initialData) {
      setSelectedTags(initialData.tags?.map((t: any) => t.tagId) || []);
    }
  }, [initialData]);

  async function action(formData: FormData) {
    const data = {
      payerId: parseInt(formData.get("payerId") as string),
      amount: parseFloat(formData.get("amount") as string),
      purpose: formData.get("purpose") as string,
      label: formData.get("label") as string || undefined,
      date: formData.get("date") ? new Date(formData.get("date") as string) : undefined,
      tagIds: selectedTags,
    };

    if (initialData) {
      await updateIncome(initialData.id, data);
    } else {
      await createIncome(data);
    }

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
            defaultValue={initialData?.payerId || ""}
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
        <Input 
          id="purpose" 
          name="purpose" 
          required 
          defaultValue={initialData?.purpose || ""}
          placeholder="Description du revenu" 
        />
      </div>
      <div>
        <Label htmlFor="label">Libellé (optionnel)</Label>
        <Input 
          id="label" 
          name="label" 
          defaultValue={initialData?.label || ""}
          placeholder="Note ou précision supplémentaire" 
        />
      </div>
      <div>
        <Label htmlFor="amount">Montant</Label>
        <Input 
          id="amount" 
          name="amount" 
          type="number" 
          step="0.01" 
          required 
          defaultValue={initialData?.amount || ""}
          placeholder="0.00" 
        />
      </div>
      <div>
        <Label htmlFor="date">Quand ? (optionnel)</Label>
        <Input 
          id="date" 
          name="date" 
          type="date" 
          defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ""}
        />
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
      <Button type="submit" className="w-full">
        {initialData ? "Modifier le revenu" : "Enregistrer le revenu"}
      </Button>
      {initialData && (
        <Button type="button" variant="outline" className="w-full" onClick={onComplete}>Annuler</Button>
      )}
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

  async function handleDelete(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce pôle ? Cela le retirera de tous les devis, dépenses et revenus associés.")) {
      await deleteTag(id);
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
            <div key={tag.id} className="group relative flex items-center gap-1 rounded-full bg-slate-100 pl-3 pr-1 py-1 text-xs font-medium text-slate-600">
              {tag.name}
              <button 
                onClick={() => handleDelete(tag.id)}
                className="rounded-full p-0.5 hover:bg-slate-200 text-slate-400 hover:text-red-500 transition-colors"
                title="Supprimer le pôle"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
