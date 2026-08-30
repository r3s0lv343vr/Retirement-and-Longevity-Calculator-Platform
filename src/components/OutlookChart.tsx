"use client";

import type { YearRow } from "@/lib/engine";
import { buildOutlookChartModel } from "@/lib/chart/outlookChart";
import { formatMoney } from "@/lib/format";

type Props = {
  years: YearRow[];
};

export function OutlookChart({ years }: Props) {
  const model = buildOutlookChartModel(years);
  const line = model.line
    .map((point, i) => `${i === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const last = model.line.at(-1);
  const first = model.line[0];
  const base = model.pad.top + (model.height - model.pad.top - model.pad.bottom);
  const area =
    first && last
      ? `${line} L ${last.x.toFixed(1)} ${base} L ${first.x.toFixed(1)} ${base} Z`
      : "";

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${model.width} ${model.height}`}
        className="h-auto w-full min-w-[520px]"
        role="img"
        aria-label="Portfolio balance and spending by age"
      >
        <rect x="0" y="0" width={model.width} height={model.height} fill="transparent" />
        {Array.from({ length: 4 }, (_, i) => {
          const yy = model.pad.top + ((model.height - model.pad.top - model.pad.bottom) * i) / 3;
          return (
            <line
              key={i}
              x1={model.pad.left}
              x2={model.width - model.pad.right}
              y1={yy}
              y2={yy}
              stroke="#14221c"
              strokeOpacity="0.08"
            />
          );
        })}
        {model.bars.map((bar, i) => (
          <g key={i}>
            <rect x={bar.x} y={bar.totalY} width={bar.width} height={bar.totalH} fill="#c4a35a" opacity="0.35" />
            <rect x={bar.x} y={bar.medicalY} width={bar.width} height={bar.medicalH} fill="#b85c38" opacity="0.55" />
          </g>
        ))}
        {area ? <path d={area} fill="#1d4a38" opacity="0.12" /> : null}
        <path d={line} fill="none" stroke="#1d4a38" strokeWidth="2.25" />
        {model.ageTicks.map((age) => {
          const span = Math.max(model.maxAge - model.minAge, 1);
          const x =
            model.pad.left +
            ((age - model.minAge) / span) * (model.width - model.pad.left - model.pad.right);
          return (
            <text key={age} x={x} y={model.height - 12} textAnchor="middle" fontSize="11" fill="#5a6b62">
              {age}
            </text>
          );
        })}
        <text x="8" y="16" fontSize="11" fill="#5a6b62">
          Peak {formatMoney(model.maxBalance)}
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-pine" /> Portfolio
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-gold/70" /> Total spending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 bg-clay/80" /> Healthcare, care & housing
        </span>
      </div>
    </div>
  );
}
