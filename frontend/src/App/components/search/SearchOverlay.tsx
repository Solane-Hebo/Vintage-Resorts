import { useMemo, useState } from "react";
import CalendarRange from "./CalendarRange"; 

type Props = {
  onClose: () => void;
  initialPlace?: string;
  initialFrom?: string;
  initialTo?: string;
  initialGuests?: number;
  initialAdult?: number;
  onFinish: (params: string) => void; 
};

function fmt(d: string): string {
  if (!d) return "";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function SearchOverlay({
  onClose,
  initialPlace = "",
  initialFrom = "",
  initialTo = "",
  initialAdult = 1,
  onFinish,
}: Props) {
  const [step, setStep] = useState<"where" | "when" | "who">("where");

  const [place, setPlace] = useState<string>(initialPlace);
  const [from, setFrom] = useState<string>(initialFrom);
  const [to, setTo] = useState<string>(initialTo);
 const [adults, setAdults] = useState<number>(Math.max(1, initialAdult || 1));
const [children, setChildren] = useState<number>(0);
const [pets, setPets] = useState<number>(0); 

const totalGuests = adults + children;

  // Validering
 const errors = useMemo(() => {
  const list: string[] = [];
  if (adults < 1) list.push("Guests must be at least 1 adult.");
  if ((from && !to) || (!from && to)) list.push("Choose both check-in and check-out.");
  if (from && to && new Date(to) < new Date(from)) list.push("Check-out cannot be earlier than check-in.");
  return list;
}, [from, to, adults]);

  const canContinueFromWhere = true; 
  const canContinueFromWhen = from !== "" && to !== "" && errors.length === 0;
const canSearch = totalGuests >= 1 && errors.length === 0;

  function submitSearch(): void {
  const q = new URLSearchParams();
  if (place) q.set("place", place);
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  q.set("guests", String(totalGuests));
  onClose();
  onFinish(q.toString());
}

  // Header
  function Header() {
    return (
      <div className="flex items-center justify-between border-b border-white/10 p-4 text-white">
        {step !== "where" ? (
          <button
            className="text-sm text-white/70"
            onClick={() => setStep(step === "who" ? "when" : "where")}
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        <div className="text-sm font-semibold tracking-wide text-accent">
          {step === "where" && "Where?"}
          {step === "when" && "When?"}
          {step === "who" && "Who?"}
        </div>

        <button className="text-white/60 text-lg leading-none" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
    );
  }

  function StepWhere() {
    return (
      <div className="p-4 space-y-4 text-white">
        <div className="space-y-2">
          <label className="text-sm text-white/70 block">Search location</label>
          <input
            className="w-full rounded-2xl bg-[#1f1f21] p-3 text-white border border-white/10"
            placeholder="Stockholm, Gothenburg..."
            value={place}
            onChange={(e) => setPlace(e.currentTarget.value)}
          />
        </div>

        <div className="bg-[#1f1f21]  rounded-2xl border border-white/10 divide-y divide-white/5">
          <button
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/5"
            onClick={() => setPlace("Stockholm")}
          >
            <span className="text-xl leading-none">📍</span>
            <div className="flex-1">
              <div className="text-sm text-white">Nearby locations</div>
              <div className="text-xs text-white/50">View nearby locations</div>
            </div>
          </button>
          <button
            className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/5"
            onClick={() => setPlace("Gothenburg")}
          >
            <span className="text-xl leading-none">🏰</span>
            <div className="flex-1">
              <div className="text-sm text-white">Other location</div>
              <div className="text-xs text-white/50">Lorem ipsum sit amet</div>
            </div>
          </button>
        </div>

      
        <div className="pt-2">
          <button
            disabled={!canContinueFromWhere}
            className="w-full rounded-2xl bg-accent text-[#0f0f10] font-medium py-3 hover:bg-accent2 disabled:opacity-50"
            onClick={() => setStep("when")}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  function StepWhen() {
    return (
      <div className="p-4 space-y-3 text-white">
        <div className="flex items-center gap-2 text-xs text-white/70">
          {place && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">{place}</span>}
          {from && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">From {fmt(from)}</span>}
          {to && <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10">To {fmt(to)}</span>}
        </div>

        
        <CalendarRange
          from={from}
          to={to}
          onChange={(f, t) => {
            setFrom(f ?? "");
            setTo(t ?? "");
          }}
        />

        {errors.length > 0 && (
          <div className="text-xs text-red-400 mt-1">{errors[0]}</div>
        )}

        <div className="flex gap-2 pt-1">
          <button
            className="flex-1  rounded-2xl bg-surface border border-white/20 text-white py-3 hover:bg-white/10"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
          >
            Clear
          </button>
          <button
            disabled={!canContinueFromWhen}
            className="flex-1  rounded-2xl bg-accent text-[#0f0f10] font-medium py-3 hover:bg-accent2 disabled:opacity-50"
            onClick={() => setStep("who")}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  function StepWho() {
  return (
    <div className="p-4 space-y-4 text-white">
      {/* Adults */}
      <div className="rounded-xl2 bg-[#1f1f21] border border-white/10">
        <div className="flex items-center justify-between p-3">
          <div className="text-left">
            <div className="text-sm text-white">Adults</div>
            <div className="text-xs text-white/50">Add guests</div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setAdults(a => Math.max(1, a - 1))}>-</button>
            <span>{adults}</span>
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setAdults(a => a + 1)}>+</button>
          </div>
        </div>
      </div>

      {/* Children */}
      <div className="rounded-xl2 bg-[#1f1f21] border border-white/10">
        <div className="flex items-center justify-between p-3">
          <div className="text-left">
            <div className="text-sm text-white">Children</div>
            <div className="text-xs text-white/50">Add children</div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setChildren(c => Math.max(0, c - 1))}>-</button>
            <span>{children}</span>
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setChildren(c => c + 1)}>+</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl2 bg-[#1f1f21] border border-white/10">
        <div className="flex items-center justify-between p-3">
          <div className="text-left">
            <div className="text-sm text-white">Pets</div>
            <div className="text-xs text-white/50">Add pets</div>
          </div>
        <div className="flex items-center gap-3">
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setPets(p => Math.max(0, p - 1))}>-</button>
            <span>{pets}</span>
            <button type="button" className="px-2 py-1 bg-surface rounded-lg border border-white/10"
              onClick={() => setPets(p => p + 1)}>+</button>
          </div>
        </div>
      </div>

      {errors.length > 0 && <div className="text-xs text-red-400">{errors[0]}</div>}

      <div className="flex gap-2">
        <button
          className="flex-1 rounded-2xl bg-surface border border-white/20 text-white py-3 hover:bg-white/10"
          onClick={() => { setAdults(1); setChildren(0); setPets(0); }}
        >
          Clear
        </button>
        <button
          disabled={!canSearch}
          className="flex-1  rounded-2xl bg-accent text-[#0f0f10] font-medium py-3 hover:bg-accent2 disabled:opacity-50"
          onClick={submitSearch}
        >
          Search
        </button>
      </div>
    </div>
  );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60"
   
    role="dialog"
    aria-modal="true"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                 w-full md:w-[720px] max-w-[95vw]
                 max-h-[85vh] overflow-y-auto
                 bg-[#0f0f10] border border-white/20
                 rounded-2xl shadow-xl"
       >

        <Header />
        {step === "where" && <StepWhere />}
        {step === "when" && <StepWhen />}
        {step === "who" && <StepWho />}
      </div>
    </div>
  );
}
