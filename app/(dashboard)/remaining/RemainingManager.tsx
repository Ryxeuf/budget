"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Input, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, FileText, Paperclip, Download, Eye } from "lucide-react";
import { FilePreviewModal } from "@/components/FilePreviewModal";

function QuoteFiles({ files, onPreview }: { files: any[], onPreview: (file: any) => void }) {
  return (
    <div className="mt-4 space-y-2 border-t pt-4">
      <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1 mb-2">
        <Paperclip className="h-3 w-3" /> Pièces jointes
      </h4>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RemainingManager({ 
  initialQuotes, 
  tags 
}: { 
  initialQuotes: any[], 
  tags: any[] 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);

  const filteredQuotes = initialQuotes.filter(quote => {
    const matchesSearch = 
      quote.need.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.company?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTagId === null || 
      quote.tags.some((t: any) => t.tagId === selectedTagId);

    return matchesSearch && matchesTag;
  });

  const totalRemaining = filteredQuotes.reduce((sum, q) => sum + q.remaining, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Détail des restes à payer</h2>
        <div className="text-right">
          <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Total filtré</p>
          <p className="text-3xl font-black text-orange-600">{formatCurrency(totalRemaining)}</p>
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

        <div className="grid gap-6">
          {filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                Aucun reste à payer ne correspond à vos critères.
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.sort((a, b) => b.remaining - a.remaining).map((quote) => (
              <Card key={quote.id} className="overflow-hidden">
                <div className="border-l-4 border-orange-500">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{quote.need}</CardTitle>
                      <p className="text-sm text-slate-500">{quote.company || "Entreprise non spécifiée"}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Reste à payer</div>
                      <div className="text-2xl font-black text-orange-600">{formatCurrency(quote.remaining)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <span>Progression du paiement</span>
                          <span>{((quote.paid / quote.price) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${(quote.paid / quote.price) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Payé : {formatCurrency(quote.paid)}</span>
                          <span>Total devis : {formatCurrency(quote.price)}</span>
                        </div>
                      </div>

                      {/* Expenses detail */}
                      {quote.expenses && quote.expenses.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-bold text-slate-600 uppercase mb-2">Historique des paiements</p>
                          <div className="space-y-2">
                            {quote.expenses.map((exp: any) => (
                              <div key={exp.id} className="flex justify-between items-center text-sm border-b border-slate-200 last:border-0 pb-1 last:pb-0">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-700">{exp.purpose}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {exp.date ? format(new Date(exp.date), "dd MMMM yyyy", { locale: fr }) : "Date inconnue"}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-900">{formatCurrency(exp.amount)}</span>
                              </div>
                            ))}
                          </div>
                      </div>
                    )}

                    <QuoteFiles files={quote.files || []} onPreview={setPreviewFile} />

                    {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {quote.tags.map((qt: any) => (
                          <Badge key={qt.tagId} variant="secondary" className="text-[10px]">
                            {qt.tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
