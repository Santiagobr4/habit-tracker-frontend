import { useEffect, useMemo, useState } from "react";
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

const formatLeaderNames = (leaders) => {
  if (!leaders.length) return "";
  if (leaders.length === 1) return leaders[0].display_name;
  if (leaders.length === 2) {
    return `${leaders[0].display_name} and ${leaders[1].display_name}`;
  }
  return `${leaders[0].display_name}, ${leaders[1].display_name} and others`;
};

const getMetricValue = (row, metricKey) => {
  if (metricKey === "daily") return row.daily_completion;
  if (metricKey === "weekly") return row.weekly_completion;
  return row.historical_completion;
};

/**
 * Build a contextual leaderboard insight card for a metric window.
 */
const buildHighlightInsight = ({
  metricKey,
  title,
  highlight,
  perfectCount,
  metricLabel,
  ranking,
}) => {
  const perfectNote =
    perfectCount > 0
      ? metricLabel === "day"
        ? " A perfect score is already on the board today."
        : metricLabel === "week"
          ? " A perfect weekly run is already in play."
          : " A perfect all-time standard has already been set."
      : "";

  const noPerfectNote =
    metricLabel === "day"
      ? " No perfect score yet today."
      : metricLabel === "week"
        ? " No perfect weekly run yet."
        : " No perfect all-time score yet.";

  const score = highlight?.score;
  const leaders = highlight?.leaders || [];
  const totalParticipants = highlight?.total || 0;

  const scoredRows = (ranking || [])
    .filter((row) => getMetricValue(row, metricKey) !== null)
    .sort(
      (a, b) => getMetricValue(b, metricKey) - getMetricValue(a, metricKey),
    );

  const leaderNameSet = new Set(leaders.map((row) => row.username));
  const firstChaser = scoredRows.find(
    (row) => !leaderNameSet.has(row.username),
  );
  const chaserScore = firstChaser
    ? getMetricValue(firstChaser, metricKey)
    : null;
  const leadGap =
    chaserScore !== null && score !== null && score !== undefined
      ? score - chaserScore
      : null;

  if (score === null || score === undefined || totalParticipants === 0) {
    return {
      metricKey,
      title,
      text: `No clear leaderboard signal yet for ${metricLabel.toLowerCase()}.`,
      tone: "neutral",
    };
  }

  if (leaders.length === totalParticipants) {
    if (score === 100) {
      return {
        metricKey,
        title,
        text: "Everyone is tied at 100%. It is a dead heat right now, and consistency will decide it.",
        tone: "neutral",
      };
    }

    return {
      metricKey,
      title,
      text: `Everyone is tied at ${formatPercent(score)}. Any small win can change the order.${perfectNote}`,
      tone: "neutral",
    };
  }

  if (leaders.length > 1) {
    if (score === 100) {
      return {
        metricKey,
        title,
        text: `${formatLeaderNames(leaders)} share a perfect lead. It is neck and neck at the top.`,
        tone: "info",
      };
    }

    return {
      metricKey,
      title,
      text: `${formatLeaderNames(leaders)} are tied at ${formatPercent(score)}. The top spot is still up for grabs.${perfectNote}`,
      tone: "info",
    };
  }

  if (score === 100) {
    if (firstChaser && chaserScore !== null) {
      return {
        metricKey,
        title,
        text: `${leaders[0].display_name} sets the pace at 100%, with ${firstChaser.display_name} chasing at ${formatPercent(chaserScore)}.`,
        tone: "good",
      };
    }

    return {
      metricKey,
      title,
      text: `${leaders[0].display_name} is alone at the top with a perfect score.`,
      tone: "good",
    };
  }

  if (leadGap !== null && leadGap <= 5) {
    return {
      metricKey,
      title,
      text: `${leaders[0].display_name} leads at ${formatPercent(score)}, with only a narrow margin.${perfectCount > 0 ? perfectNote : noPerfectNote}`,
      tone: "good",
    };
  }

  if (leadGap !== null && leadGap >= 15) {
    return {
      metricKey,
      title,
      text: `${leaders[0].display_name} leads with ${formatPercent(score)} and has built real separation.${perfectCount > 0 ? perfectNote : noPerfectNote}`,
      tone: "good",
    };
  }

  return {
    metricKey,
    title,
    text: `${leaders[0].display_name} leads with ${formatPercent(score)}. The race is still active.${perfectCount > 0 ? perfectNote : noPerfectNote}`,
    tone: "good",
  };
};

const insightCardClass = {
  daily:
    "border-amber-200/90 dark:border-amber-700/70 bg-linear-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900",
  weekly:
    "border-sky-200/90 dark:border-sky-700/70 bg-linear-to-br from-sky-50 to-white dark:from-sky-950/20 dark:to-slate-900",
  historical:
    "border-emerald-200/90 dark:border-emerald-700/70 bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900",
  neutral:
    "border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/70",
};

const insightBadgeClass = {
  daily: "text-amber-700 dark:text-amber-300",
  weekly: "text-sky-700 dark:text-sky-300",
  historical: "text-emerald-700 dark:text-emerald-300",
  neutral: "text-slate-600 dark:text-slate-300",
};

/**
 * Ranking panel showing leaderboard table and scenario-aware insight cards.
 */
export default function RankingPanel() {
  const [ranking, setRanking] = useState([]);
  const [highlights, setHighlights] = useState(null);
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
          setHighlights(payload.highlights || null);
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

  const rankingInsights = useMemo(() => {
    const dailyPerfect = ranking.filter(
      (row) => row.daily_completion === 100,
    ).length;
    const weeklyPerfect = ranking.filter(
      (row) => row.weekly_completion === 100,
    ).length;
    const historicalPerfect = ranking.filter(
      (row) => row.historical_completion === 100,
    ).length;

    return [
      buildHighlightInsight({
        metricKey: "daily",
        title: "Daily leader",
        highlight: highlights?.daily,
        perfectCount: dailyPerfect,
        metricLabel: "day",
        ranking,
      }),
      buildHighlightInsight({
        metricKey: "weekly",
        title: "Weekly leader",
        highlight: highlights?.weekly,
        perfectCount: weeklyPerfect,
        metricLabel: "week",
        ranking,
      }),
      buildHighlightInsight({
        metricKey: "historical",
        title: "All-time completion leader",
        highlight: highlights?.historical,
        perfectCount: historicalPerfect,
        metricLabel: "all-time",
        ranking,
      }),
    ];
  }, [highlights, ranking]);

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

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {rankingInsights.map((insight) => (
          <div
            key={`${insight.title}-${insight.text}`}
            className={`rounded-2xl border p-4 shadow-sm ${insightCardClass[insight.metricKey] || insightCardClass.neutral}`}
          >
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${insightBadgeClass[insight.metricKey] || insightBadgeClass.neutral}`}
            >
              {insight.title}
            </p>
            <p className="text-sm mt-2 leading-6 opacity-90">{insight.text}</p>
          </div>
        ))}
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
              <th className="py-2">All-time</th>
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
                <td
                  className={`py-3 pr-3 font-semibold ${getCompletionTailwindClass(row.historical_completion)}`}
                >
                  {formatPercent(row.historical_completion)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
