import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getHistory } from "../api/habits";
import { getCompletionColor } from "../utils/completion";

const RANGE_OPTIONS = [30, 90, 180, 365];

export default function HistoryPanel() {
  const [days, setDays] = useState(90);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await getHistory({ days });
        setHistory(payload);
      } catch {
        setError("Could not load historical metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [days]);

  const chartData = useMemo(() => {
    if (!history) return { daily: [], weekly: [], monthly: [] };

    return {
      daily: history.daily.map((row) => ({
        label: row.date.slice(5),
        completion: row.completion,
      })),
      weekly: history.weekly.map((row) => ({
        label: row.start_date.slice(5),
        completion: row.completion,
      })),
      monthly: history.monthly.map((row) => ({
        label: row.month,
        completion: row.completion,
      })),
    };
  }, [history]);

  const hasAnyMetricData =
    (history?.daily || []).some((row) => row.completion !== null) ||
    (history?.weekly || []).some((row) => row.completion !== null) ||
    (history?.monthly || []).some((row) => row.completion !== null);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        Loading history...
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 dark:bg-slate-900/80 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-xl font-semibold">History & Analytics</h2>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Average completion
            </p>
            <p className="text-2xl font-bold mt-1">
              {history?.summary?.average_daily_completion !== null
                ? `${history.summary.average_daily_completion}%`
                : "N/A"}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Active days
            </p>
            <p className="text-2xl font-bold mt-1">
              {history?.summary?.active_days ?? 0}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-300">Range</p>
            <p className="text-sm font-medium mt-2">
              {history?.range?.start_date} to {history?.range?.end_date}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
              Metrics baseline: {history?.range?.baseline_date}
            </p>
          </div>
        </div>

        {!hasAnyMetricData && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 bg-slate-50/70 dark:bg-slate-800/70">
            No metrics available yet for this period. Metrics start from your
            account and habit start dates.
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-medium mb-3">Daily completion trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (
                        payload?.completion === null ||
                        payload?.completion === undefined
                      ) {
                        return null;
                      }

                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill={getCompletionColor(payload.completion)}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-medium mb-3">Weekly comparison</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
                      {chartData.weekly.map((entry, index) => (
                        <Cell
                          key={`weekly-cell-${entry.label}-${index}`}
                          fill={getCompletionColor(entry.completion)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-medium mb-3">Monthly comparison</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis dataKey="label" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
                      {chartData.monthly.map((entry, index) => (
                        <Cell
                          key={`monthly-cell-${entry.label}-${index}`}
                          fill={getCompletionColor(entry.completion)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
