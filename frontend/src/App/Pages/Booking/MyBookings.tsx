import { useEffect, useState } from "react";
import type { Booking, Listing } from "../../../lib/types";
import { getMyBookings, updateBookingStatus } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

function getListingInfo(listing: Booking["listing"]) {
  if(!listing) {
    return{ title: "Listing (unavailable)", image: undefined}
  }
  if (typeof listing === "string") {
    return { title: "Listing", image: undefined }
  }
  const l = listing as Listing;
  return { title: l.title, image: l.images?.[0]?.url }
}

function formatDate(dateString: string): string {
  if(!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

export default function MyBookingsPage() {
  const [items, setItems] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pending, setPending] = useState<Record<string, boolean>>({})

  const {token} = useAuth()

  async function load() {
    setLoading(true)
    setError("")
    try {
      const res = await getMyBookings()
      setItems(res.data)
    } catch (e) {
      setError("Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(! token ) return
     load() }, 
     [token])
    async function handleCancel(id: string) {
    const ok = window.confirm("Cancel this booking?")
    if (!ok) return

    setPending((p) => ({...p, [id]: true}))
    const prev = items

    setItems((list) =>
      list.map((b) => (b._id === id ? {...b, status: "cancelled" as any} : b ))
    )
    try {
      await updateBookingStatus(id, {status: "cancelled"})
    } catch (err: any) {
      setItems(prev)
      alert(err?.response?.data?.message || "Cancel failed")
    } finally {
      setPending((p) => ({...p, [id]: false}))
    }
  }

  const viseibleItes = items.filter(
    (b) => (b.status || "").toLowerCase() !== "cancelled"
  )

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-white">My bookings</h1>

      {loading && <p>Loading…</p>}
      {!loading && viseibleItes.length === 0 && error && <p className="text-red-400">{error}</p>}
      {!loading &&  viseibleItes.length === 0 && <p>No bookings yet</p>}

      <div className="space-y-3">
        { viseibleItes.map((b) => {
          const info = getListingInfo(b.listing);
          const totalGuests = (b.guests?.adults ?? 0) + (b.guests?.children ?? 0);
          return (
            <div key={b._id} className="bg-surface rounded-2xl border border-white/10 p-3 flex gap-3">
              {info.image ? (
                <img
                  src={info.image}
                  alt={info.title}
                  className="w-20 h-20 object-cover rounded-2xl border border-white/10"
                />
              ):(
                <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-xs text-white/50">No image</div>
              
              )}

              <div className="flex-1">
                <div className="text-white font-medium">{info.title}</div>
                <div className="/70 text-sm">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                </div>
                <div className="text-white/90 text-sm">{b.totalPrice?.toLocaleString?.()} SEK</div>
                <div className="text-white/50 text-xs mt-1">Status: {b.status}</div>
              </div>

            {b.status.toLowerCase() !== "cancelled"  && (
              <button
                className="self-center rounded-2xl px-3 py-2 btn"
                onClick={() =>  handleCancel(b._id)} disabled={!!pending[b._id]}
              >
                {pending[b._id] ? "Cancelling.." : "Cancel"}
              </button>

            )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
