import { getQuotes, getTags, updateQuoteStatus } from "@/app/actions";
import { QuoteForm } from "@/components/Forms";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export default async function QuotesPage() {
  const quotes = await getQuotes();
  const tags = await getTags();

  async function toggleStatus(id: number, current: boolean) {
    "use server";
    await updateQuoteStatus(id, !current);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Devis</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Nouveau Devis</CardTitle>
            </CardHeader>
            <CardContent>
              <QuoteForm tags={tags} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {quotes.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-slate-500">
                Aucun devis enregistré.
              </CardContent>
            </Card>
          )}
          {quotes.map((quote) => (
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
                <form action={toggleStatus.bind(null, quote.id, quote.isAccepted)}>
                  <Button variant={quote.isAccepted ? "outline" : "primary"} size="sm">
                    {quote.isAccepted ? "Annuler l'acceptation" : "Accepter le devis"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
