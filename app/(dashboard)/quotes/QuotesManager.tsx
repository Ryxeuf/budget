"use client";

import { useState, useTransition } from "react";
import { getQuotes, getTags, updateQuoteStatus, deleteQuote, uploadQuoteFile, deleteQuoteFile } from "@/app/actions";
import { QuoteForm } from "@/components/Forms";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Input } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { Edit2, Trash2, Search, Filter, X, FileText, Paperclip, Download, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FilePreviewModal } from "@/components/FilePreviewModal";

function QuoteFiles({ quoteId, files, onRefresh, onPreview }: { quoteId: number, files: any[], onRefresh: () => void, onPreview: (file: any) => void }) {
  const [isPending, startTransition] = useTransition();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    startTransition(async () => {
      try {
        await uploadQuoteFile(quoteId, formData);
        onRefresh();
      } catch (error) {
        alert("Erreur lors de l'envoi du fichier");
      }
    });
    
    // Reset input
    e.target.value = "";
  }

  async function handleDelete(fileId: number) {
    if (confirm("Supprimer ce fichier ?")) {
      await deleteQuoteFile(fileId);
      onRefresh();
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
          <Paperclip className="h-3 w-3" /> Pièces jointes
        </h4>
        <label className="cursor-pointer">
          <Input type="file" className="hidden" onChange={handleUpload} disabled={isPending} />
          <span className={cn(
            "text-[10px] px-2 py-1 rounded font-medium transition-colors flex items-center gap-1",
            isPending ? "bg-slate-50 text-slate-400" : "bg-slate-100 hover:bg-slate-200 text-slate-900"
          )}>
            {isPending && <Loader2 className="h-2 w-2 animate-spin" />}
            {isPending ? "Envoi..." : "Ajouter"}
          </span>
        </label>
      </div>
      
      <div className="grid gap-2">
        {files.length === 0 && <p className="text-[10px] text-slate-400 italic">Aucun fichier</p>}
        {files.map(file => (
          <div key={file.id} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100 group">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-600 truncate font-medium" title={file.name}>{file.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onPreview(file)}
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                title="Visualiser"
              >
                <Eye className="h-3 w-3" />
              </button>
              <a 
                href={`/api/files/${file.path}?download=1`} 
                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                title="Télécharger"
              >
                <Download className="h-3 w-3" />
              </a>
              <button 
                onClick={() => handleDelete(file.id)}
                className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-500"
                title="Supprimer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuotesManager({ 
  initialQuotes, 
  tags 
}: { 
  initialQuotes: any[], 
  tags: any[] 
}) {
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const refreshQuotes = async () => {
    const updatedQuotes = await getQuotes();
    setQuotes(updatedQuotes);
  };

  async function toggleStatus(id: number, current: boolean) {
    await updateQuoteStatus(id, !current);
    await refreshQuotes();
  }

  async function handleDelete(id: number) {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      await deleteQuote(id);
      await refreshQuotes();
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.need.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.company?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTagId === null || 
      quote.tags.some((t: any) => t.tagId === selectedTagId);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>{editingQuote ? "Modifier le Devis" : "Nouveau Devis"}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteForm 
              tags={tags} 
              initialData={editingQuote} 
              onComplete={() => {
                setEditingQuote(null);
                refreshQuotes();
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
              placeholder="Rechercher un devis ou une entreprise..." 
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

        {filteredQuotes.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-500">
              Aucun devis ne correspond à vos critères.
            </CardContent>
          </Card>
        )}
        {filteredQuotes.map((quote) => (
          <Card key={quote.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>{quote.need}</CardTitle>
                <p className="text-sm text-slate-500">{quote.company || "Entreprise non spécifiée"}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xl font-bold">{formatCurrency(quote.price)}</div>
                <div className="flex gap-2">
                  {quote.isEstimated && <Badge variant="warning">Estimatif</Badge>}
                  {quote.isAccepted ? (
                    <Badge variant="success">Accepté</Badge>
                  ) : (
                    <Badge variant="outline">En attente</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-4">
                {quote.tags.map((qt: any) => (
                  <Badge key={qt.tagId} variant="secondary">{qt.tag.name}</Badge>
                ))}
              </div>

              {quote.isAccepted && (
                <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-sm font-medium text-slate-600">Suivi du paiement</div>
                    <div className="text-sm font-bold">
                      {formatCurrency(quote.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)} / {formatCurrency(quote.price)}
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div 
                      className={cn(
                        "h-2.5 rounded-full transition-all",
                        (quote.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0) >= quote.price 
                          ? "bg-green-600" 
                          : "bg-blue-600"
                      )}
                      style={{ 
                        width: `${Math.min(100, ((quote.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0) / quote.price) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  {quote.expenses && quote.expenses.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {quote.expenses.map((exp: any) => (
                        <div key={exp.id} className="text-xs flex justify-between text-slate-500">
                          <span>• {exp.purpose} ({format(new Date(exp.date), "dd/MM/yy", { locale: fr })})</span>
                          <span className="font-medium">{formatCurrency(exp.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <QuoteFiles 
                quoteId={quote.id} 
                files={quote.files || []} 
                onRefresh={refreshQuotes} 
                onPreview={setPreviewFile}
              />

              <div className="flex items-center justify-between mt-6">
                <Button 
                  onClick={() => toggleStatus(quote.id, quote.isAccepted)}
                  variant={quote.isAccepted ? "outline" : "primary"} 
                  size="sm"
                >
                  {quote.isAccepted ? "Annuler l'acceptation" : "Accepter le devis"}
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setEditingQuote(quote);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(quote.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
