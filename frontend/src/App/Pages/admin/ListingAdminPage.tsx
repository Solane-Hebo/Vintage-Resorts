import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Listing } from "../../../lib/types";
import { deleteListing, getMyListings } from "../../../lib/api";

export default function ListingsAdminPage() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  async function load() {
    setLoading(true)
    setErr("")
    try {
      const res = await getMyListings()
      setItems(res.data)
    } catch (e) {
      setErr("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(); }, [])

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">My Listings</h1>
        <Link to="/account/listings/new" className="btn">+ New listing</Link>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-400">{err}</p>}

      <div className="space-y-3">
        {items.map((l) => (
          <div key={l._id} className="bg-surface rounded-2xl border border-white/10 p-3 flex flex-col sm:flex-row gap-3">
            <img
              src={l.images?.[0]?.url}
              alt={l.title}
              className="w-24 h-24 object-cover rounded-2xl border border-white/10"
            />
            <div className="flex-1">
              <div className="text-white font-medium">{l.title}</div>
              <div className="text-white/60 text-sm">{l.location}</div>
              <div className="text-white/80 text-sm">
                {l.price.toLocaleString()} SEK / night · Max {l.maxGuests} guests
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link to={`/account/listings/${l._id}/edit`} className="px-3 py-2 rounded-2xl bg-white/15 hover:bg-white/30">
                Edit
              </Link>
              <button
                className="px-3 py-2 rounded-2xl bg-red-500/20 text-red-300 hover:bg-red-500/50"
                onClick={async () => {
                  if (!confirm("Delete this listing?")) return;
                  await deleteListing(l._id);
                  load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="text-white/70">No listings yet.</p>}
      </div>
    </div>
  );
}
