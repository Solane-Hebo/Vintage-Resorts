import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getListings } from "../../lib/api";
import type { Listing } from "../../lib/types";
import { Heart, Star } from "lucide-react";

function ListingCard({ item }: { item: Listing }) {
   const [liked, setLiked] = useState(false)
   const mockRating = 4.8
   const mockReviews = 23
  
  return (
    <Link
      to={`/listing/${item._id}`}
      className="group rounded-xl overflow-hidden bg-surface border border-white/10 hover:border-white/20 transition"
    >
      <div className="relative ">
        <img
          src={item.images?.[0]?.url}
          alt={item.title}
          className="w-full aspect-[4/3] object-cover"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 rounded-full bg-accent text-[13px] text-[#0f0f10]  px-2 py-1 font-semibold">
          Guest favourite
        </div>
         <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            setLiked((prev) => !prev)
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-accent backdrop-blur-sm hover:bg-black/50 transition"
        >
          <Heart
            className={`w-5 h-5 transition ${
              liked ? "fill-red-500 stroke-red-500" : "stroke-black"
            }`}
          />
        </button>
      </div>

      <div className="p-3">
        <div className="text-[18px] font-semibold text-white leading-tight line-clamp-1">
          {item.title}
        </div>
        <div className="text-xs text-white/60 mt-1">{item.location}</div>
        <div className="text-[15px] text-white mt-1">
          <span className="-semibold">{item.price.toLocaleString()} SEK</span>{" "}
          <span className="text-white/70">/ night</span>
        </div>
        
       <div className="flex items-center gap-1 text-white/80 text-[13px] mt-1">
          <Star className="w-4 h-4 fill-yellow-100 stroke-yellow-200" />
          <span>{mockRating.toFixed(1)}</span>
          <span className="text-white/50">· {mockReviews} reviews</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [data, setData] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getListings()
      .then(({ data }) => setData(data))
      .catch((e) => {
        console.error(e)
        setError(e?.response?.data?.message ?? "Failed to load listing")
      })
      .finally(() => setLoading(false))
  }, [])

  const byPlace = useMemo(() => {
    const m = new Map<string, Listing[]>()
    for (const l of data) {
      const k = l.location || "Other"
      m.set(k, [...(m.get(k) ?? []), l])
    }
    return Array.from(m.entries())
  }, [data])

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!data.length) return <div className="p-6">No listings yet</div>

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
      <h1 className="text-2xl md:text-4xl -heading tracking-tight ">
        Stay in an Era You Love
      </h1>

      <section className="space-y-3">
        <h2 className="text-sm md:text-base text-white/80">Over 1,000 homes</h2>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-3 md:gap-4">
          {data.slice(0, 8).map((item) => (
            <ListingCard key={item._id} item={item} />
          ))}
        </div>
      </section>

      {byPlace[0] && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base text-white/80">
              Popular historic stays in {byPlace[0][0]}
            </h2>
            <Link
              to={`/search?place=${encodeURIComponent(byPlace[0][0])}`}
              className="text-white/70 hover:text-white text-sm"
            >
              View all ›
            </Link>
          </div>
          <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-3 md:gap-4">
            {byPlace[0][1].slice(0, 8).map((item) => (
              <ListingCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm md:text-base text-white/80">All about 50s</h2>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-3 md:gap-4">
          {data.slice(8, 16).map((item) => (
            <ListingCard key={item._id} item={item} />
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4 bg-surface rounded-2xl border border-white/10 p-4 md:p-5 text-sm text-white/70">
        <div>
          <h3 className="text-white font-medium mb-2">Best Stay Resorts in Vintage Resort</h3>
          <p>If you’re looking for an unforgettable stay experience in Vintage Resorts, look no further than Vintage Resort.</p>
          <p>The resort boasts well-appointed rooms that are designed to provide the utmost comfort</p>
          <p>We offers a range of amenities to ensure an enjoyable stay. </p>
        </div>
        <div>
          <h3 className="text-white font-medium mb-2">Resorts to stay in Vintage Resort</h3>
          <p>What sets Vintage Resort apart from other</p>
          <p>its commitment to providing personalized service.</p>
          <p>The friendly staff goes above and beyond to cater to your every need.</p>
        </div>
       <div>
          <h3 className="text-white font-medium mb-2">Resorts to stay in Vintage Resort</h3>
          <p>What sets Vintage Resort apart from other</p>
          <p>its commitment to providing personalized service.</p>
          <p>The friendly staff goes above and beyond to cater to your every need.</p>
        </div>
      </section>
    </div>
  );
}
