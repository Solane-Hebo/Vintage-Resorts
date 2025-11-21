import { useMemo, useState } from "react";

export type CalendarRangeProps = {
  from?: string;              
  to?: string;               
  onChange: (from?: string, to?: string) => void;
  minDate?: string;           
  months?: number;           
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return startOfDay(new Date(y, m - 1, d));
}
function addMonths(d: Date, months: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + months, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function CalendarRange({
  from,
  to,
  onChange,
  minDate,
  months = 1,
}: CalendarRangeProps) {
  const today = useMemo(() => formatISO(startOfDay(new Date())), []);
  const minDateISO = minDate ?? today;

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = parseISO(from) ?? startOfDay(new Date());
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const minDateObj = parseISO(minDateISO)!;

  function isSameDay(a?: Date, b?: Date): boolean {
    if (!a || !b) return false;
    return a.getTime() === b.getTime();
  }
  function isBetween(d: Date, a?: Date, b?: Date): boolean {
    if (!a || !b) return false;
    return d > a && d < b;
  }

  function handleSelect(iso: string, d: Date) {
    if (Number.isNaN(d.getTime()) || d < minDateObj) return;

    if (!fromDate || (fromDate && toDate)) {
      onChange(iso, undefined);
      return;
    }
    if (d < fromDate) {
      onChange(iso, undefined);
    } else if (d.getTime() === fromDate.getTime()) {
      onChange(iso, iso); 
    } else {
      onChange(from, iso);
    }
  }

  function MonthGrid({ base }: { base: Date }) {
    const year = base.getFullYear();
    const monthIndex = base.getMonth();
    const monthName = base.toLocaleString(undefined, { month: "long", year: "numeric" });

    const dim = daysInMonth(base);
    const firstWeekday = (() => {
      const d = new Date(year, monthIndex, 1);
      const js = d.getDay(); 
      return (js + 6) % 7;   
    })();

    const cells: Array<{ date: Date; iso: string; disabled: boolean }> = [];
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ date: new Date(NaN), iso: "", disabled: true });
    }
    for (let day = 1; day <= dim; day++) {
      const d = startOfDay(new Date(year, monthIndex, day));
      const iso = formatISO(d);
      const disabled = d < minDateObj;
      cells.push({ date: d, iso, disabled });
    }

    return (
      <div className="rounded-2xl bg-[#1a1a1c] border border-white/10 p-3 w-full">
        {/* Header för månaden */}
        <div className="flex items-center justify-center mb-2">
          <div className="text-sm font-semibold text-white">{monthName}</div>
        </div>

        {/* Veckodagar */}
        <div className="grid grid-cols-7 gap-1 text-[11px] text-white/60 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, idx) => {
            if (!cell.iso) return <div key={`e-${idx}`} className="h-10" />;
            const d = cell.date;
            const selectedStart = isSameDay(d, fromDate);
            const selectedEnd = isSameDay(d, toDate);
            const inRange = isBetween(d, fromDate, toDate);

            const classes = [
              "h-10 flex items-center justify-center rounded-md border text-sm",
              cell.disabled
                ? "opacity-30 cursor-not-allowed border-white/10"
                : "cursor-pointer hover:bg-white/10 border-white/10",
              selectedStart || selectedEnd
                ? "bg-accent text-[#0f0f10] font-semibold border-transparent"
                : inRange
                ? "bg-accent/20 text-white"
                : "text-white",
            ].join(" ");

            return (
              <button
                key={cell.iso}
                type="button"
                className={classes}
                onClick={() => handleSelect(cell.iso, d)}
                disabled={cell.disabled}
                aria-pressed={selectedStart || selectedEnd || inRange}
                aria-label={cell.iso}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-40"
          onClick={() => setViewMonth(addMonths(viewMonth, -1))}
          disabled={addMonths(viewMonth, -1) < new Date(minDateObj.getFullYear(), minDateObj.getMonth(), 1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-xs text-white/60">Select dates</div>
        <button
          type="button"
          className="px-2 py-1 rounded-lg border border-white/10 hover:bg-white/10"
          onClick={() => setViewMonth(addMonths(viewMonth, +1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: Math.max(1, months) }).map((_, i) => (
          <MonthGrid key={i} base={addMonths(viewMonth, i)} />
        ))}
      </div>

      <div className="mt-3 text-xs text-white/70 flex gap-4 items-center">
        <div><span className="opacity-70">From:</span> <span>{from ?? "—"}</span></div>
        <div><span className="opacity-70">To:</span> <span>{to ?? "—"}</span></div>
      </div>
    </div>
  );
}
