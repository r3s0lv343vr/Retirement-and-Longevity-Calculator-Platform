"use client";

import type { YearRow } from "@/lib/engine";
import { formatMoney } from "@/lib/format";

type Props = {
  years: YearRow[];
};

export function OutlookChart({ years }: Props) {
  const retired = years.filter((y) => y.phase !== "working");
  const series = retired.length > 0 ? retired : years;
  const width = 720;
  const height = 280;
  const pad = { top: 20, right: 16, bottom: 36, left: 58 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxBalance = Math.max(...series.map((y) => y.endBalance), 1);
  const maxSpend = Math.max(...series.map((y) => y.totalSpend), 1);
  const minAge = series[0].age;
  const maxAge = series[series.length - 1].age;
  const span = Math.max(maxAge - minAge, 1);

  const x = (age: number) => pad.left + ((age - minAge) / span) * innerW;
  const yBal = (v: number) => pad.top + innerH - (v / maxBalance) * innerH;
  const ySpend = (v: number) => pad.top + innerH - (v / maxSpend) * innerH * 0.45;

  const line = series
    .map((row, i) => `${i === 0 ? "M" : "L"} ${x(row.age).toFixed(1)} ${yBal(row.endBalance).toFixed(1)}`)
    .join(" ");

  const area = `${line} L ${x(maxAge).toFixed(1)} ${pad.top + innerH} L ${x(minAge).toFixed(1)} ${pad.top + innerH} Z`;

  const ticks = 5;
  const ageTicks = Array.from({ length: ticks }, (_, i) => Math.round(minAge + (span * i) / (ticks - 1)));

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full min-w-[520px]" role="img" aria-label="Portfolio balance and spending by age">
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        {Array.from({ length: 4 }, (_, i) => {
          const yy = pad.top + (innerH * i) / 3;
          return <line key={i} x1={pad.left} x2={width - pad.right} y1={yy} y2={yy} stroke="#14221c" strokeOpacity="0.08" />;
        })}
        {series.map((row) => {
          const medical = row.healthcareSpend + row.longTermCareSpend;
          const barW = Math.max(innerW / series.length - 2, 2);
          return (
            <g key={row.age}>
              <rect
                x={x(row.age) - barW / 2}
                y={ySpend(row.totalSpend)}
                width={barW}
                height={Math.max(pad.top + innerH - ySpend(row.totalSpend), 0)}
                fill="#c4a35a"
                opacity="0.35"
              />
              <rect
                x={x(row.age) - barW / 2}
                y={ySpend(medical)}
                width={barW}
                height={Math.max(pad.top + innerH - ySpend(medical), 0)}
                fill="#b85c38"
                opacity="0.55"
              />
            </g>
          );
        })}
        <path d={area} fill="#1d4a38" opacity="0.12" />
        <path d={line} fill="none" stroke="#1d4a38" strokeWidth="2.25" />
        {ageTicks.map((age) => (
          <text key={age} x={x(age)} y={height - 12} textAnchor="middle" fontSize="11" fill="#5a6b62">
            {age}
          </text>
        ))}
        <text x="8" y="16" fontSize="11" fill="#5a6b62">
          {formatMoney(maxBalance)}
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
          <span className="h-2.5 w-2.5 bg-clay/80" /> Healthcare & care
        </span>
      </div>
    </div>
  );
}
