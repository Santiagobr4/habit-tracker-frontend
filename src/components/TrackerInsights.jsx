import CompletionRing from "./CompletionRing";
import { formatPercent, getCompletionColor } from "../utils/completion";
import { getIsoDateLabel, getIsoDayNameShort } from "../utils/dateLabels";

const getBarHeight = (value) => {
  if (value === null || value === undefined) return 8;
  return Math.max(8, Math.round((value / 100) * 120));
};

export default function TrackerInsights({ metrics }) {
  const daily = metrics?.daily || [];
  const today = metrics?.today;
  const week = metrics?.week;

  return (
    <div className="mt-7 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-semibold">Current performance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Baseline starts at {metrics?.baseline_date}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CompletionRing
          value={today?.completion}
          title="Today completion"
          subtitle={`${today?.done ?? 0} completed out of ${today?.total ?? 0}`}
        />

        <CompletionRing
          value={week?.completion}
          title="Current week completion"
          subtitle={`${week?.start_date} to ${week?.end_date}`}
        />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
        <p className="font-medium mb-3">Current week trend</p>

        <div className="flex items-end gap-3 h-36 overflow-x-auto pb-1">
          {daily.length === 0 && (
            <p className="text-sm text-slate-500">No data for this week yet.</p>
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
              <p className="text-[11px] text-slate-500">
                {getIsoDateLabel(row.date)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
