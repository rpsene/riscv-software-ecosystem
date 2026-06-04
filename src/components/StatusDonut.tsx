import React, { useEffect, useMemo, useRef, useState } from "react";

interface StatusDonutProps {
  data: any[];
}

const STATUS_COLORS: Record<string, string> = {
  Enabled: "#D4F5DF",       // soft green
  "In Progress": "#D6E4FF", // soft blue
  TBD: "#E5F3FF",           // very light cyan/blue
  Optimized: "#EBDDFF",     // soft lavender
};

interface SegmentDatum {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// A single bar segment whose label font size adapts to its measured width,
// so narrow segments (e.g. a 12% slice) shrink their text to fit instead of
// overflowing.
const BarSegment: React.FC<{ seg: SegmentDatum }> = ({ seg }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const label = `${seg.status} (${seg.count})`;
  const pct = `${seg.percentage.toFixed(1)}%`;

  // Longest line drives the fit. Approx avg glyph advance ≈ 0.58em.
  const longest = Math.max(label.length, pct.length);
  // Reserve horizontal padding (~8px) before fitting text.
  const usable = Math.max(0, width - 8);
  const fitted = usable / (longest * 0.58);
  // Clamp so text stays legible but never overflows the slice.
  const labelSize = Math.max(7, Math.min(14, fitted));
  const pctSize = Math.max(6, labelSize * 0.82);

  return (
    <div
      ref={ref}
      style={{ width: `${seg.percentage}%`, backgroundColor: seg.color }}
      className="flex items-center justify-center h-10 px-1 overflow-hidden"
    >
      <div className="text-center font-semibold text-[#003262] leading-tight">
        <div className="whitespace-nowrap" style={{ fontSize: `${labelSize}px` }}>
          {label}
        </div>
        <div
          className="whitespace-nowrap font-normal"
          style={{ fontSize: `${pctSize}px` }}
        >
          {pct}
        </div>
      </div>
    </div>
  );
};

const StatusDonut: React.FC<StatusDonutProps> = ({ data }) => {
  const { segments, total } = useMemo(() => {
    const counts: Record<string, number> = {};

    data.forEach((item) => {
      const status = item.status || "Unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    const total = data.length || 0;
    const entries = Object.entries(counts);

    if (!total || !entries.length) {
      return { segments: [], total: 0 };
    }

    // Compute base fractions by count
    const base = entries.map(([status, count]) => ({
      status,
      count,
      fraction: count / total,
    }));

    // Enforce a minimum visual fraction so segments are never too small to read
    const MIN_FRACTION = 0.12; // 12% minimum width per segment

    const small = base.filter((b) => b.fraction < MIN_FRACTION);
    const large = base.filter((b) => b.fraction >= MIN_FRACTION);

    let segments;

    // If the minimum for all segments would exceed 100%, just distribute evenly
    if (MIN_FRACTION * base.length >= 1) {
      const equalFraction = 1 / base.length;
      segments = base.map((b) => ({
        status: b.status,
        count: b.count,
        percentage: equalFraction * 100,
        color: STATUS_COLORS[b.status] || "#CBD5E1",
      }));
    } else {
      const forcedSmallTotal = MIN_FRACTION * small.length;
      const remaining = 1 - forcedSmallTotal;
      const largeFractionSum = large.reduce((sum, b) => sum + b.fraction, 0);

      segments = base.map((b) => {
        let fraction;
        if (b.fraction < MIN_FRACTION) {
          fraction = MIN_FRACTION;
        } else if (largeFractionSum > 0) {
          fraction = (b.fraction / largeFractionSum) * remaining;
        } else {
          fraction = 1 / base.length;
        }

        return {
          status: b.status,
          count: b.count,
          percentage: fraction * 100,
          color: STATUS_COLORS[b.status] || "#CBD5E1",
        };
      });
    }

    return { segments, total };
  }, [data]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-100 px-4 py-3">
      <div className="flex items-center gap-6">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex w-full rounded-xl overflow-hidden">
            {segments.map((seg) => (
              <BarSegment key={seg.status} seg={seg} />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center md:w-32 text-center">
          <div className="text-3xl font-bold text-[#003262]">{total}</div>
          <span className="block text-xs font-normal text-slate-500">
            total packages
          </span>
        </div>
      </div>
    </section>
  );
};

// Memoized: the snapshot bar is driven by the full (unfiltered) dataset, which
// is stable after load — so it should not re-render while the user types in the
// search box or pages through the table.
export default React.memo(StatusDonut);