interface BarDatum {
  label: string;
  value: number;
  display?: string;
}

interface Props {
  data: BarDatum[];
  maxValue?: number;
  accentColor?: string;
  highlightLabel?: string;
}

// Simple, dependency-free horizontal bar chart. Values must already be numeric.
export function HorizontalBars({ data, maxValue, accentColor = 'bg-accent-500', highlightLabel }: Props) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.max(2, Math.round((d.value / max) * 100));
        const isHighlight = highlightLabel && d.label === highlightLabel;
        return (
          <div key={d.label} className="group">
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className={`font-medium ${isHighlight ? 'text-ink-900' : 'text-ink-700'}`}>{d.label}</span>
              <span className="text-ink-600 tabular-nums">{d.display ?? d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${isHighlight ? 'bg-ink-800' : accentColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
