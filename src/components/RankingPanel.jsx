import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/habits";
import { formatPercent, getCompletionTailwindClass } from "../utils/completion";
import LoadingSpinner from "./LoadingSpinner";
import defaultAvatar from "../assets/default-avatar.svg";

const getRankLabel = (index) => {
  if (index === 0) return "#1";
  if (index === 1) return "#2";
  if (index === 2) return "#3";
  return `#${index + 1}`;
};

const getRowStyle = (index) => {
  if (index === 0) {
    return "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-700/50";
  }
  if (index === 1) {
    return "bg-slate-100/90 dark:bg-slate-800/70 border-slate-300/70 dark:border-slate-600/70";
  }
  if (index === 2) {
    return "bg-orange-50/80 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-700/50";
  }
  return "bg-white/80 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-700/60";
};

export default function RankingPanel() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadRanking = async () => {
      try {
        if (!isCancelled) {
          setLoading(true);
          setError("");
        }
        const payload = await getLeaderboard();
        if (!isCancelled) {
          setRanking(payload.results || []);
        }
      } catch {
        if (!isCancelled) {
          setError("Could not load ranking.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadRanking();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        <LoadingSpinner label="Loading ranking..." />
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
      <div className="mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Community ranking</h2>

          <span className="text-xs font-semibold uppercase tracking-wide rounded-full px-2.5 py-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Live period
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-300 mt-2">
          Ranking based on current day, current week, and current month
          completion.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-155 text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">#</th>
              <th className="py-2">User</th>
              <th className="py-2">Daily</th>
              <th className="py-2">Weekly</th>
              <th className="py-2">Monthly</th>
              <th className="py-2">Active days</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row, index) => (
              <tr
                key={`${row.username}-${index}`}
                className={`border ${getRowStyle(index)}`}
              >
                <td className="py-3 pl-3">
                  <span className="inline-flex items-center justify-center min-w-10 h-8 rounded-lg border border-slate-300/80 dark:border-slate-600 bg-white/80 dark:bg-slate-900/80 text-sm font-semibold">
                    {getRankLabel(index)}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={row.avatar_file_url || defaultAvatar}
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
                  className={`py-3 font-semibold ${getCompletionTailwindClass(row.daily_completion)}`}
                >
                  {formatPercent(row.daily_completion)}
                </td>
                <td
                  className={`py-3 font-semibold ${getCompletionTailwindClass(row.weekly_completion)}`}
                >
                  {formatPercent(row.weekly_completion)}
                </td>
                <td
                  className={`py-3 font-semibold pr-3 ${getCompletionTailwindClass(row.monthly_completion)}`}
                >
                  {formatPercent(row.monthly_completion)}
                </td>
                <td className="py-3 pr-3">{row.active_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
