import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import type { AxiosError } from "axios";
import type { Listing } from "../../lib/types";
import { getListingById } from "../../lib/api";
import ListingDetailSkeleton from "../components/ListingDetailSkeleton";
import CalendarRange from "../components/search/CalendarRange";
import { WhatThisPlaceOffers } from "../../ui/Offers";

const CLEANING_FEE = 300
const SERVICE_FEE_RATE = 0.08

function diffNights(from: string, to: string): number {
  if (!from || !to) return 0
  const a = new Date(from + "T00:00:00").getTime()
  const b = new Date(to + "T00:00:00").getTime()
  const ms = b - a
  if (ms <= 0) return 0
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  const [from, setFrom] = useState<string>(params.get("from") ?? "")
  const [to, setTo] = useState<string>(params.get("to") ?? "")
  const [guests, setGuests] = useState<number>(Number(params.get("guests") ?? "1"))

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError("")
    getListingById(id)
      .then((res) => setListing(res.data))
      .catch((e: AxiosError<{ message: string }>) =>
        setError(e.response?.data?.message ?? "Failed to load listing")
      )
      .finally(() => setLoading(false));
  }, [id])

  useEffect(() => {
    const q = new URLSearchParams()
    if (from) q.set("from", from)
    if (to) q.set("to", to)
    q.set("guests", String(guests))
    setParams(q, { replace: true })
  }, [from, to, guests, setParams])

  const nights = useMemo(() => diffNights(from, to), [from, to])

  const price = useMemo(() => {
    if (!listing || nights <= 0) {
      return { nights, subtotal: 0, serviceFee: 0, cleaningFee: 0, total: 0 }
    }
    const subtotal = listing.price * nights
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
    const cleaningFee = CLEANING_FEE
    const total = subtotal + serviceFee + cleaningFee
    return { nights, subtotal, serviceFee, cleaningFee, total }
  }, [listing, nights])

  if (loading) return <ListingDetailSkeleton />
  if (error) return <div className="p-6 text-red-400">{error}</div>
  if (!listing) return <div className="p-6">Not found</div>

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      <div className="grid gap-2 md:grid-cols-2">
        <img
          src={listing.images?.[0]?.url}
          alt={listing.title}
          className="h-64 md:h-[420px] w-full object-cover rounded-2xl border border-white/10"
        />
        <div className="hidden md:grid grid-cols-2 gap-2">
          {listing.images?.slice(1, 5).map((img) => (
            <img
              key={img.url}
              src={img.url}
              alt={listing.title}
              className="h-52 w-full object-cover rounded-2xl border border-white/10"
            />
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white">{listing.title}</h1>
          <p className="text-white/70">{listing.location}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {listing.description && (
            <div>
              <h3 className="font-semibold text-white mb-2">About this place</h3>
              <p className="text-white/80 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {listing.amenities && listing.amenities.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-2">What this place offers</h3>
              <ul className="grid sm:grid-cols-2 gap-2 text-white/80">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2">
                    <span>•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <WhatThisPlaceOffers className="mt-6"/>
            <h3 className="font-semibold text-white mb-3">Select check-in date</h3>
            <div className="lg:hidden">
              <CalendarRange
                from={from}
                to={to}
                onChange={(f, t) => { setFrom(f ?? ""); setTo(t ?? ""); }}
                months={1}
              />
              
            </div>
            <div className="hidden lg:block">
              <CalendarRange
                from={from}
                to={to}
                onChange={(f, t) => { setFrom(f ?? ""); setTo(t ?? ""); }}
                months={3}
              />
            </div>
          </div>
        </div>

        <aside className="bg-surface rounded-2xl border border-white/10 p-4 md:p-5 h-fit md:sticky md:top-20">
          <div className="text-white text-xl font-semibold">
            {listing.price.toLocaleString()} SEK{" "}
            <span className="text-white/60 text-sm font-normal">/ night</span>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-white/60 mb-1">Guests</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-2 py-1 bg-[#1f1f21] rounded-lg border border-white/10"
                onClick={() => setGuests((g) => Math.max(1, g - 1))}
              >
                −
              </button>
              <span className="min-w-6 text-center">{guests}</span>
              <button
                type="button"
                className="px-2 py-1 bg-[#1f1f21] rounded-lg border border-white/10"
                onClick={() => setGuests((g) => (listing.maxGuests ? Math.min(listing.maxGuests, g + 1) : g + 1))}
              >
                +
              </button>
            </div>
            {listing.maxGuests && (
              <p className="text-xs text-white/50 mt-1">Max {listing.maxGuests} guests</p>
            )}
          </div>

          <div className="mt-4 text-sm text-white/80 space-y-1">
            {nights > 0 ? (
              <>
                <div className="flex justify-between">
                  <span>
                    {listing.price.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
                  </span>
                  <span>{price.subtotal.toLocaleString()} SEK</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning fee</span>
                  <span>{price.cleaningFee.toLocaleString()} SEK</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>{price.serviceFee.toLocaleString()} SEK</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span>{price.total.toLocaleString()} SEK</span>
                </div>
              </>
            ) : (
              <p>Select dates to see the total price.</p>
            )}
          </div>

          <button
            disabled={nights <= 0}
            className="mt-4 w-full rounded-2xl bg-accent hover:bg-accent2 text-[#0f0f10] py-3 font-medium disabled:opacity-50"
            onClick={() => {
              const q = new URLSearchParams();
              q.set("listingId", listing._id);
              if (from) q.set("from", from);
              if (to) q.set("to", to);
              q.set("guests", String(guests));
              navigate(`/booking/confirm?${q.toString()}`);
            }}
          >
            Reserve
          </button>

          <p className="text-xs text-white/50 mt-2">You won’t be charged yet</p>
        </aside>
      </div>

      <div className="text-sm text-white/60">
        <Link to="/search" className="underline">Back to search</Link>
      </div>
    </div>
  );
}
