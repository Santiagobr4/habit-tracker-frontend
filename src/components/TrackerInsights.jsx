import CompletionRing from "./CompletionRing";
import { formatPercent, getCompletionColor } from "../utils/completion";
import {
  getIsoDayNameShort,
  formatReadableDateRange,
} from "../utils/dateLabels";
import CardHeader from "./CardHeader";

const getBarHeight = (value) => {
  if (value === null || value === undefined) return 8;
  return Math.max(8, Math.round((value / 100) * 120));
};

export default function TrackerInsights({ metrics }) {
  const daily = metrics?.daily || [];
  const focus = metrics?.focus;
  const week = metrics?.week;
  const isCurrentWeek = metrics?.is_current_week;
  const focusLabel = isCurrentWeek
    ? "Today completion"
    : `Completion on ${metrics?.focus_date}`;
  const weekLabel = isCurrentWeek
    ? "Current week completion"
    : "Selected week completion";
  const showTrendInline = daily.length > 0 && daily.length <= 7;

  return (
    <div className="mt-7 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-semibold">Current performance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Baseline starts at {metrics?.baseline_date}
        </p>
      </div>

      <div
        className={`grid grid-cols-1 ${showTrendInline ? "lg:grid-cols-3" : "md:grid-cols-2"} gap-4 mb-6`}
      >
        <CompletionRing
          value={focus?.completion}
          title={focusLabel}
          subtitle={`${focus?.done ?? 0} completed out of ${focus?.total ?? 0}`}
        />

        <CompletionRing
          value={week?.completion}
          title={weekLabel}
          subtitle={formatReadableDateRange(week?.start_date, week?.end_date)}
        />

        {showTrendInline && (
          <div className="h-full rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70 flex flex-col">
            <CardHeader
              title="Week trend"
              badge={formatPercent(week?.completion)}
            />
            <div className="flex-1 flex items-end gap-2 pb-1 justify-between min-h-32">
              {daily.map((row) => (
                <div key={row.date} className="flex-1 min-w-8 text-center">
                  <div className="h-32 flex items-end justify-center">
                    <div
                      className="w-full max-w-7 rounded-t-md"
                      style={{ height: `${getBarHeight(row.completion)}px` }}
                      title={formatPercent(row.completion)}
                      aria-label={`${row.date} ${formatPercent(row.completion)}`}
                    >
                      <div
                        className="w-full h-full rounded-t-md"
                        style={{
                          backgroundColor: getCompletionColor(row.completion),
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {getIsoDayNameShort(row.date)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center min-h-8">
              {formatReadableDateRange(week?.start_date, week?.end_date)}
            </p>
          </div>
        )}
      </div>

      {!showTrendInline && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
          <CardHeader
            title="Week trend"
            badge={formatPercent(week?.completion)}
          />
          <div className="flex items-end gap-3 h-36 overflow-x-auto pb-1">
            {daily.length === 0 && (
              <p className="text-sm text-slate-500">
                No data for this week yet.
              </p>
            )}

            {daily.map((row) => (
              <div key={row.date} className="min-w-10 text-center">
                <div className="h-32 flex items-end justify-center">
                  <div
                    className="w-7 rounded-t-md"
                    style={{ height: `${getBarHeight(row.completion)}px` }}
                    title={formatPercent(row.completion)}
                    aria-label={`${row.date} ${formatPercent(row.completion)}`}
                  >
                    <div
                      className="w-full h-full rounded-t-md"
                      style={{
                        backgroundColor: getCompletionColor(row.completion),
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getIsoDayNameShort(row.date)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center min-h-8">
            {formatReadableDateRange(week?.start_date, week?.end_date)}
          </p>
        </div>
      )}
    </div>
  );
}
