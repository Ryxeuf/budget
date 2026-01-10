"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function ExpensesByTagChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  if (chartData.length === 0) return <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Aucune donnée à afficher</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}€`} />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}€`, "Dépensé"]}
            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
          <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetSummaryPie({ spent, remaining }: { spent: number, remaining: number }) {
  const data = [
    { name: "Payé", value: spent },
    { name: "À payer", value: remaining > 0 ? remaining : 0 },
  ];

  if (spent === 0 && remaining <= 0) return <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Aucune donnée à afficher</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value.toFixed(2)}€`, ""]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
          <span>Payé</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
          <span>À payer</span>
        </div>
      </div>
    </div>
  );
}
