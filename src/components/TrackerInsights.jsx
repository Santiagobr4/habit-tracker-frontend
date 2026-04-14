const getBarHeight = (value) => {
  if (value === null || value === undefined) return 8;
  return Math.max(8, Math.round((value / 100) * 120));
};

const formatPercent = (value) =>
  value === null || value === undefined ? "N/A" : `${value}%`;

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
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Today completion
          </p>
          <p className="text-2xl font-semibold mt-2">
            {formatPercent(today?.completion)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {today?.done ?? 0} completed out of {today?.total ?? 0}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Current week completion
          </p>
          <p className="text-2xl font-semibold mt-2">
            {formatPercent(week?.completion)}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {week?.start_date} to {week?.end_date}
          </p>
        </div>
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
                  className={`w-7 rounded-t-md ${
                    row.completion === null
                      ? "bg-slate-300 dark:bg-slate-600"
                      : "bg-slate-900 dark:bg-slate-200"
                  }`}
                  style={{ height: `${getBarHeight(row.completion)}px` }}
                  title={formatPercent(row.completion)}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {row.date.slice(5)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
