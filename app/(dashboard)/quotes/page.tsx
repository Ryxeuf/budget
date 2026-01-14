import { getQuotes, getTags } from "@/app/actions";
import { QuotesManager } from "./QuotesManager";

export default async function QuotesPage() {
  const quotes = await getQuotes();
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gestion des Devis</h2>
      </div>

      <QuotesManager initialQuotes={quotes} tags={tags} />
    </div>
  );
}
