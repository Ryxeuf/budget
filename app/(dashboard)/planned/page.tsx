import { getQuotes, getTags } from "@/app/actions";
import { PlannedManager } from "./PlannedManager";

export default async function PlannedPage() {
  const allQuotes = await getQuotes();
  const plannedQuotes = allQuotes.filter(q => !q.isAccepted);
  const tags = await getTags();

  return (
    <PlannedManager initialQuotes={plannedQuotes} tags={tags} />
  );
}
