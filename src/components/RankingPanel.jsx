import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/habits";
import { formatPercent, getCompletionTailwindClass } from "../utils/completion";

const RANGE_OPTIONS = [30, 90, 180];

export default function RankingPanel() {
  const [days, setDays] = useState(30);
  const [ranking, setRanking] = useState([]);
  const [range, setRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRanking = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await getLeaderboard({ days });
        setRanking(payload.results || []);
        setRange(payload.range || null);
      } catch {
        setError("Could not load ranking.");
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [days]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        Loading ranking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 text-red-600 p-6 dark:bg-red-950/30 dark:border-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold">Community ranking</h2>

        <div className="inline-flex rounded-xl border border-slate-300 dark:border-slate-600 p-1 bg-slate-100/70 dark:bg-slate-800/80">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                days === option
                  ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
        {range?.start_date} to {range?.end_date}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-155 text-left">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">#</th>
              <th className="py-2">User</th>
              <th className="py-2">Average completion</th>
              <th className="py-2">Active days</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row, index) => (
              <tr
                key={`${row.username}-${index}`}
                className="border-b border-slate-100 dark:border-slate-800"
              >
                <td className="py-3 font-semibold">{index + 1}</td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        row.avatar_file_url ||
                        "https://via.placeholder.com/40x40.png?text=U"
                      }
                      alt={row.display_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                    />
                    <div>
                      <p className="font-medium">{row.display_name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-300">
                        @{row.username}
                      </p>
                    </div>
                  </div>
                </td>
                <td
                  className={`py-3 font-semibold ${getCompletionTailwindClass(row.average_completion)}`}
                >
                  {formatPercent(row.average_completion)}
                </td>
                <td className="py-3">{row.active_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
