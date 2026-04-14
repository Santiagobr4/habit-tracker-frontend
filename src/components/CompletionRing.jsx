import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatPercent, getCompletionColor } from "../utils/completion";

export default function CompletionRing({ value, title, subtitle }) {
  const safeValue = value === null || value === undefined ? 0 : value;
  const data = [
    { name: "value", value: safeValue },
    { name: "remaining", value: 100 - safeValue },
  ];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
      <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <div className="h-36 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={38}
              outerRadius={56}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={getCompletionColor(value)} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="-mt-16 mb-12 text-center text-2xl font-semibold">
        {formatPercent(value)}
      </p>
      <p className="text-xs text-slate-500 mt-2 text-center">{subtitle}</p>
    </div>
  );
}
