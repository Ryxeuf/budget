import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Budget Maison</h1>
          <div className="flex gap-4">
            <a href="/" className="text-sm font-medium hover:underline">Tableau de bord</a>
            <a href="/quotes" className="text-sm font-medium hover:underline">Devis</a>
            <a href="/planned" className="text-sm font-medium hover:underline">Envisagé</a>
            <a href="/remaining" className="text-sm font-medium hover:underline">Reste à payer</a>
            <a href="/expenses" className="text-sm font-medium hover:underline">Dépenses</a>
            <a href="/incomes" className="text-sm font-medium hover:underline">Revenus</a>
            <a href="/api/auth/logout" className="text-sm font-medium text-red-600 hover:underline ml-4">Déconnexion</a>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </>
  );
}
