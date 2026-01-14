import { getQuotes, getTags } from "@/app/actions";
import { RemainingManager } from "./RemainingManager";

export default async function RemainingPage() {
  const allQuotes = await getQuotes();
  const tags = await getTags();
  
  const acceptedQuotes = allQuotes.filter(q => q.isAccepted);
  
  const quotesWithRemaining = acceptedQuotes.map(quote => {
    const paid = quote.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    const remaining = quote.price - paid;
    return { ...quote, paid, remaining };
  }).filter(q => q.remaining > 0.01);

  return (
    <RemainingManager initialQuotes={quotesWithRemaining} tags={tags} />
  );
}
