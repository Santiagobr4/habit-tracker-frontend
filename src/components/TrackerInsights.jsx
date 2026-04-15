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

const formatInsightDate = (isoDate) => {
  if (!isoDate) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
};

const formatDateList = (dates) => {
  if (!dates.length) return "";
  if (dates.length === 1) return dates[0];
  if (dates.length === 2) return `${dates[0]} and ${dates[1]}`;
  return `${dates[0]}, ${dates[1]}, +${dates.length - 2} more`;
};

const toneStyles = {
  success:
    "border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/80 dark:bg-emerald-950/20",
  warning:
    "border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/20",
  critical:
    "border-rose-200 dark:border-rose-800/70 bg-rose-50/80 dark:bg-rose-950/20",
  info: "border-sky-200 dark:border-sky-800/70 bg-sky-50/80 dark:bg-sky-950/20",
};

const getTrendDirection = (values) => {
  if (values.length < 2) return null;
  const first = values[0];
  const last = values[values.length - 1];
  if (first === null || last === null) return null;
  if (last > first) return "up";
  if (last < first) return "down";
  return "flat";
};

const buildInsights = ({ daily, focus, week }) => {
  const validDaily = daily.filter(
    (row) => row && row.completion !== null && row.completion !== undefined,
  );
  const values = validDaily.map((row) => row.completion);
  const observedDays = values.length;
  const weakDays = validDaily.filter((row) => row.completion < 50);
  const weakRatio = weakDays.length / Math.max(observedDays, 1);
  const trend = getTrendDirection(values);

  const bestDay = validDaily.reduce(
    (best, row) =>
      best === null || (row.completion ?? -1) > (best.completion ?? -1)
        ? row
        : best,
    null,
  );

  const maxCompletion = bestDay?.completion ?? null;
  const topDays =
    maxCompletion === null
      ? []
      : validDaily.filter((row) => row.completion === maxCompletion);

  const perfectDays = validDaily.filter((row) => row.completion === 100);
  const hasMultiplePerfectDays = perfectDays.length > 1;

  const cards = [];

  if (focus?.completion !== null && focus?.completion !== undefined) {
    if (focus.completion >= 80) {
      cards.push({
        tone: "success",
        title: "Strong today",
        text: "Great job showing up today. Keep this same rhythm and your week will feel much easier to sustain.",
      });
    } else if (focus.completion >= 50) {
      cards.push({
        tone: "warning",
        title: "Room to sharpen today",
        text: "You are closer than it seems. Completing one more habit today can shift your whole week.",
      });
    } else {
      cards.push({
        tone: "critical",
        title: "Today needs recovery",
        text: "Keep it simple today. Start with your minimum routine and build from there.",
      });
    }
  }

  if (week?.completion !== null && week?.completion !== undefined) {
    if (week.completion >= 80) {
      cards.push({
        tone: "success",
        title: "Very strong week",
        text: "This is excellent consistency. Keep your routine simple, repeatable, and realistic.",
      });
    } else if (week.completion >= 60) {
      cards.push({
        tone: "info",
        title: "Solid weekly base",
        text: "You built a solid base this week. Improving one low day can raise your score quickly.",
      });
    } else {
      cards.push({
        tone: "warning",
        title: "Week needs a push",
        text: "This week can still recover. Focus on one core habit early each day and rebuild momentum step by step.",
      });
    }
  }

  if (trend === "up") {
    cards.push({
      tone: "info",
      title: "Trend is improving",
      text: "Your trend is improving. Repeat what worked on your best recent days and keep it steady.",
    });
  } else if (trend === "down") {
    cards.push({
      tone: "warning",
      title: "Trend is drifting down",
      text: "Small dips are normal. Simplify your hardest habit this week and get back to consistency.",
    });
  }

  if (weakDays.length > 0) {
    cards.push({
      tone: weakRatio >= 0.35 ? "critical" : "warning",
      title: `${weakDays.length} low-completion day${weakDays.length === 1 ? "" : "s"}`,
      text:
        weakRatio >= 0.35
          ? "Low days are pulling your week down. Create a lighter fallback routine so hard days still count."
          : "Your next improvement is in low days. Plan a fallback version so one hard day does not become two.",
    });
  }

  if (bestDay) {
    if (hasMultiplePerfectDays) {
      const formattedPerfectDates = perfectDays.map((row) =>
        formatInsightDate(row.date),
      );
      cards.push({
        tone: "success",
        title: `${perfectDays.length} perfect days this week`,
        text: `You hit 100% on ${formatDateList(formattedPerfectDates)}. That is strong proof your system works, so protect that rhythm.`,
      });
    } else if (topDays.length > 1) {
      const tiedDates = topDays.map((row) => formatInsightDate(row.date));
      cards.push({
        tone: "info",
        title: `Best days this week: ${formatPercent(maxCompletion)}`,
        text: `Your top score was shared by ${formatDateList(tiedDates)}. You are building repeatable wins, keep reinforcing that pattern.`,
      });
    } else {
      cards.push({
        tone: "info",
        title: `Best day of the week: ${formatInsightDate(bestDay.date)}`,
        text: `${formatPercent(bestDay.completion)} was your peak. Recreate that setup and turn one good day into your new normal.`,
      });
    }
  }

  if (cards.length === 0) {
    cards.push({
      tone: "info",
      title: "Not enough signal yet",
      text: "Keep showing up this week. A little more data will unlock sharper coaching insights.",
    });
  }

  const hasCriticalWeakSignal = weakRatio >= 0.35;
  const orderedCards = hasCriticalWeakSignal
    ? cards.sort((a, b) => {
        const rank = { critical: 0, warning: 1, info: 2, success: 3 };
        return (rank[a.tone] ?? 99) - (rank[b.tone] ?? 99);
      })
    : cards;

  return orderedCards.slice(0, 3);
};

export default function TrackerInsights({ metrics }) {
  const daily = metrics?.daily || [];
  const safeDaily = daily.filter((row) => row && row.date);
  const focus = metrics?.focus;
  const week = metrics?.week;
  const isCurrentWeek = metrics?.is_current_week;
  const insights = buildInsights({ daily: safeDaily, focus, week });
  const focusLabel = isCurrentWeek
    ? "Today completion"
    : `Completion on ${metrics?.focus_date}`;
  const weekLabel = isCurrentWeek
    ? "Current week completion"
    : "Selected week completion";
  const showTrendInline = safeDaily.length > 0 && safeDaily.length <= 7;

  return (
    <div className="mt-7 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-lg font-semibold">Current performance</h3>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          Baseline starts at {metrics?.baseline_date}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {insights.map((insight) => (
          <div
            key={`${insight.title}-${insight.text}`}
            className={`rounded-2xl border p-4 shadow-sm ${toneStyles[insight.tone]}`}
          >
            <p className="text-sm font-semibold">{insight.title}</p>
            <p className="text-sm mt-2 leading-6 opacity-90">{insight.text}</p>
          </div>
        ))}
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
              {safeDaily.map((row) => (
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
            {safeDaily.length === 0 && (
              <p className="text-sm text-slate-500">
                No data for this week yet.
              </p>
            )}

            {safeDaily.map((row) => (
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
