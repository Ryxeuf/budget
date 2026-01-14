import { getIncomes, getPayers, getTags } from "@/app/actions";
import { IncomesManager } from "./IncomesManager";

export default async function IncomesPage() {
  const incomes = await getIncomes();
  const payers = await getPayers();
  const tags = await getTags();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Revenus</h2>
      </div>

      <IncomesManager initialIncomes={incomes} payers={payers} tags={tags} />
    </div>
  );
}
