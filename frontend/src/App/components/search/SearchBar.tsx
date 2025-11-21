import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchOverlay from "./SearchOverlay";
import CalendarRange from "./CalendarRange";

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function SearchBar() {
  const navigate = useNavigate();

  
  const [overlayOpen, setOverlayOpen] = useState(false);

  const [place, setPlace] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0); 
  const totalGuests = adults + children;

  const [openPanel, setOpenPanel] = useState<null | "where" | "when" | "who">(null);

  const errors = useMemo(() => {
  const e: string[] = [];
  if (adults < 1) e.push("Guests must be at least 1");
  if ((from && !to) || (!from && to)) e.push("Choose both check-in and check-out");
  if (from && to && new Date(to) < new Date(from)) e.push("Check-out cannot be earlier than check-in");
  return e;
  }, [from, to, adults]);

  const isValid = errors.length === 0;

  function submit(params?: URLSearchParams) {
  const q = params ?? new URLSearchParams();
  if (place) q.set("place", place);
  if (from) q.set("from", from);
  if (to) q.set("to", to);
  q.set("guests", String(totalGuests));   
  navigate(`/search?${q.toString()}`);
  }

  function handleFinishSearch(params: string) {
    setOverlayOpen(false);
    navigate(`/search?${params}`);
  }

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    if (!isValid) return;
    submit();
  }

  return (
    <>
      {/* DESKTOP BAR */}
      <form
        onSubmit={onSubmit}
        className="hidden md:flex items-center gap-2 bg-surface rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/90 max-w-full flex-wrap lg:flex-nowrap relative"
      >
        {/* WHERE */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "where" ? null : "where")}
          className="flex flex-col text-left px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <span className="text-[14px] uppercase tracking-wide text-white/50">Where</span>
          <span className="text-white/80 min-w-[10rem]">{place || "Search location"}</span>
        </button>

        <div className="hidden lg:block w-px self-stretch bg-white/20" />

        {/* WHEN */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "when" ? null : "when")}
          className="flex flex-col text-left px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <span className="text-[14px] uppercase tracking-wide text-white/50">When</span>
          <span className="text-white/80 min-w-[10rem]">
            {from && to ? `${from} – ${to}` : "Add dates"}
          </span>
        </button>

        <div className="hidden md:block w-px self-stretch bg-white/20" />

        {/* WHO */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "who" ? null : "who")}
          className="flex flex-col text-left px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <span className="text-[14px] uppercase tracking-wide text-white/50">Who</span>
          <span className="text-white/80 min-w-[10rem]">
            {totalGuests} guest{totalGuests > 1 ? "s" : ""}
          </span>
        </button>

        <button type="submit" className="btn" disabled={!isValid}>
          Search
        </button>

        {!isValid && (
          <div className="absolute -bottom-8 left-0 text-xs text-red-400">{errors[0]}</div>
        )}

        {/* DESKTOP PANELS */}
        {openPanel !== null && (
          <div
            className="absolute top-[110%] left-0 z-50 w-full max-w-3xl bg-[#1a1a1c] border border-white/10 rounded-2xl p-4 shadow-2xl"
            onMouseLeave={() => setOpenPanel(null)}
          >
            {/* WHERE PANEL */}
            {openPanel === "where" && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Where</h3>
                <input
                  className="w-full rounded-2xl bg-[#1f1f21] p-3 text-white border border-white/10"
                  placeholder="Stockholm, Gothenburg..."
                  value={place}
                  onChange={(e) => setPlace(e.currentTarget.value)}
                />
                <div className="divide-y divide-white/10 rounded-2xl overflow-hidden border border-white/10 bg-[#171719]">
                  <button
                    type="button"
                    className="w-full text-left p-3 hover:bg-white/5"
                    onClick={() => setPlace("Stockholm")}
                  >
                    📍 Stockholm
                  </button>
                  <button
                    type="button"
                    className="w-full text-left p-3 hover:bg-white/5"
                    onClick={() => setPlace("Gothenburg")}
                  >
                    🏰 Gothenburg
                  </button>
                </div>
              </div>
            )}

            {/* WHEN PANEL (CalendarRange + Clear/Save, 2 months) */}
            {openPanel === "when" && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">When</h3>

                <CalendarRange
                  from={from}
                  to={to}
                  minDate={todayISO()}
                  months={2} 
                  onChange={(f, t) => {
                    setFrom(f ?? "");
                    setTo(t ?? "");
                  }}
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    className="text-sm text-white/80 hover:text-white underline underline-offset-4"
                    onClick={() => {
                      setFrom("");
                      setTo("");
                    }}
                  >
                    Clear dates
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-2xl bg-accent hover:bg-accent2 text-[#0f0f10] font-medium disabled:opacity-50"
                    onClick={() => setOpenPanel(null)}
                    disabled={!(from && to)}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* WHO PANEL */}
            {openPanel === "who" && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Who</h3>

             {/* Adults */}
              <div className="flex items-center justify-between bg-[#1f1f21] rounded-2xl border border-white/10 p-3">
                  <span>Adults</span>
                <div className="flex items-center gap-3">
                <button
                 type="button"
                 className="px-2 py-1 bg-surface border border-white/10 rounded-md"
                 onClick={() => setAdults(a => Math.max(1, a - 1))}
                >–      
                </button>
                 <span className="min-w-6 text-center">{adults}</span>
                <button
                 type="button"
                 className="px-2 py-1 bg-surface border border-white/10 rounded-md"
                 onClick={() => setAdults(a => a + 1)}
                >+
                </button>
             </div>
           </div>

            {/* Children */}
          <div className="flex items-center justify-between bg-[#1f1f21] rounded-2xl border border-white/10 p-3">
             <span>Children</span>
            <div className="flex items-center gap-3">
            <button
             type="button"
             className="px-2 py-1 bg-surface border border-white/10 rounded-md"
             onClick={() => setChildren(c => Math.max(0, c - 1))}
            >
              –
            </button>
             <span className="min-w-6 text-center">{children}</span>
            <button
             type="button"
             className="px-2 py-1 bg-surface border border-white/10 rounded-md"
             onClick={() => setChildren(c => c + 1)}
            >
            +</button>
          </div>
         </div>
       </div>
       )}
     </div>
    )}
  </form>

      {/* MOBILE BUTTON + OVERLAY */}
      <button
        className="md:hidden w-full flex h-10 items-center justify-between rounded-2xl bg-surface border border-white/20 px-4 py-3 text-left shadow-card hover:bg-white/5"
        onClick={() => setOverlayOpen(true)}
      >
        <div className="flex flex-col">
          <span className="text-sm text-white font-medium">Where to?</span>
          <span className="text-xs text-white/60">Add dates · Add guests</span>
        </div>
        <span className="btn">Search</span>
      </button>

      {overlayOpen && (
        <SearchOverlay onClose={() => setOverlayOpen(false)} onFinish={handleFinishSearch} />
      )}
    </>
  );
}
