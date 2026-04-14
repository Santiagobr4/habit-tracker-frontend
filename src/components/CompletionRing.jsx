import { formatPercent, getCompletionColor } from "../utils/completion";

export default function CompletionRing({ value, title, subtitle }) {
  const safeValue = value === null || value === undefined ? 0 : value;
  const clamped = Math.max(0, Math.min(100, safeValue));
  const radius = 42;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800/70">
      <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
      <div className="mt-3 flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            aria-label={formatPercent(value)}
          >
            <circle
              cx="50"
              cy="50"
              r={normalizedRadius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
            <circle
              cx="50"
              cy="50"
              r={normalizedRadius}
              fill="transparent"
              stroke={getCompletionColor(value)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dashoffset 220ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-semibold leading-none">
              {formatPercent(value)}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-3 text-center">{subtitle}</p>
    </div>
  );
}
