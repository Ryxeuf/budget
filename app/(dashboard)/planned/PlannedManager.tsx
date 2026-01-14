"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Input, Button } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Building2, Tag, Search, CheckCircle, FileText, Paperclip, Download, X, Loader2, Eye } from "lucide-react";
import { updateQuoteStatus, getQuotes, uploadQuoteFile, deleteQuoteFile } from "@/app/actions";
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

export function PlannedManager({ 
  initialQuotes, 
  tags 
}: { 
  initialQuotes: any[], 
  tags: any[] 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const refreshQuotes = async () => {
    const allQuotes = await getQuotes();
    setQuotes(allQuotes.filter(q => !q.isAccepted));
  };

  async function handleAccept(id: number) {
    if (confirm("Voulez-vous accepter ce devis ? Il sera ajouté au coût total du projet.")) {
      await updateQuoteStatus(id, true);
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

  const totalPlanned = filteredQuotes.reduce((sum, q) => sum + q.price, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dépenses envisagées</h2>
        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Total filtré</p>
          <p className="text-3xl font-black text-blue-600">{formatCurrency(totalPlanned)}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* FILTERS */}
        <div className="space-y-4">
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

        <div className="grid gap-6 md:grid-cols-2">
          {filteredQuotes.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-10 text-center text-slate-500">
                Aucun devis envisagé ne correspond à vos critères.
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.sort((a, b) => b.price - a.price).map((quote) => (
              <Card key={quote.id} className="overflow-hidden border-l-4 border-blue-400">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{quote.need}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Building2 className="h-3 w-3" />
                        {quote.company || "Entreprise non spécifiée"}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{formatCurrency(quote.price)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      {quote.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Prévu le {format(new Date(quote.date), "dd MMMM yyyy", { locale: fr })}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {quote.tags.length} pôle(s)
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {quote.tags.map((qt: any) => (
                        <Badge key={qt.tagId} variant="secondary" className="text-[10px]">
                          {qt.tag.name}
                        </Badge>
                      ))}
                    {quote.isEstimated && (
                      <Badge variant="warning" className="text-[10px]">Estimatif</Badge>
                    )}
                  </div>

                  <QuoteFiles 
                    quoteId={quote.id} 
                    files={quote.files || []} 
                    onRefresh={refreshQuotes} 
                    onPreview={setPreviewFile}
                  />

                  <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      className="gap-2"
                      onClick={() => handleAccept(quote.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accepter le devis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
