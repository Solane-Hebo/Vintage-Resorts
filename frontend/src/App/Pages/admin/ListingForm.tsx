import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Listing } from "../../../lib/types";
import { createListing, getListingById, updateListing } from "../../../lib/api";

type Props = { mode: "create" | "edit" }

type ImageInput = { url: string; caption?: string }

export default function ListingForm({ mode }: Props) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [pricingNote, setPricingNote] = useState("")
  const [location, setLocation] = useState("")
  const [maxGuests, setMaxGuests] = useState<number>(1)
  const [amenities, setAmenities] = useState<string>("");
  const [images, setImages] = useState<ImageInput[]>([{ url: "" }])

  const [loading, setLoading] = useState(mode === "edit")
  const [error, setError] = useState("")

  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true)
      getListingById(id)
        .then((res) => {
          const l = res.data as Listing
          setTitle(l.title)
          setDescription(l.description)
          setPrice(l.price)
          setPricingNote(l.pricingNote ?? "")
          setLocation(l.location)
          setMaxGuests(l.maxGuests ?? 1)
          setAmenities((l.amenities ?? []).join(", "))
          setImages(l.images?.length ? l.images.map(i => ({ url: i.url, caption: i.caption })) : [{ url: "" }])
        })
        .catch(() => setError("Failed to load listing"))
        .finally(() => setLoading(false))
    }
  }, [id, mode])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    const payload: Partial<Listing> = {
      title,
      description,
      price: Number(price),
      pricingNote: pricingNote || undefined,
      location,
      maxGuests: Number(maxGuests),
      amenities: amenities.split(",").map(s => s.trim()).filter(Boolean),
      images: images.filter(i => i.url.trim().length > 0),
    };

    try {
      if (mode === "create") {
        await createListing(payload )
      } else if (mode === "edit" && id) {
        await updateListing(id, payload)
      }
      navigate("/admin/listings")
    } catch (e) {
      setError("Save failed")
    }
  }

  function updateImage(idx: number, patch: Partial<ImageInput>) {
    setImages(prev => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)))
  }

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <form onSubmit={onSubmit} 
          className="max-w-3xl mx-auto space-y-4 bg-surface rounded-2xl border 
                   border-white/10 p-4 text-white"
    >
      <h1 className="text-2xl font-semibold">{
          mode === "create" ? "Create listing" : "Edit listing"}
      </h1>
        {error && <p className="text-red-400">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-sm text-white/70">Title</span>
          <input 
            className="w-full rounded-2xl bg-[#1f1f21] p-3" 
            value={title} 
            onChange={e => setTitle(e.currentTarget.value)} required 
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-white/70">Location</span>
          <input 
            className="w-full rounded-2xl bg-[#1f1f21] p-3" 
            value={location} 
            onChange={e => setLocation(e.currentTarget.value)} required 
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-white/70">Price (SEK / night)</span>
          <input type="number" min={0} 
                 className="w-full rounded-2xl bg-[#1f1f21] p-3" 
                 value={price} 
                 onChange={e => setPrice(parseInt(e.currentTarget.value, 10) || 0)} required 
          />
        </label>

        <label className="space-y-1">
          <span className="text-sm text-white/70">Max guests</span>
          <input type="number" min={1} 
                 className="w-full rounded-2xl bg-[#1f1f21] p-3" 
                 value={maxGuests} 
                 onChange={e => setMaxGuests(parseInt(e.currentTarget.value, 10) || 1)} required 
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-sm text-white/70">Pricing note (optional)</span>
        <input className="w-full rounded-2xl bg-[#1f1f21] p-3" 
               value={pricingNote} 
               onChange={e => setPricingNote(e.currentTarget.value)} 
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-sm text-white/70">Description</span>
        <textarea 
            className="w-full rounded-2xl bg-[#1f1f21] p-3 min-h-[120px]" 
            value={description} 
            onChange={e => setDescription(e.currentTarget.value)} required 
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-sm text-white/70">Amenities (comma separated)</span>
        <input 
          className="w-full rounded-2xl bg-[#1f1f21] p-3" 
          value={amenities} 
          onChange={e => setAmenities(e.currentTarget.value)} 
        />
      </label>

      <div className="space-y-2">
        <div className="text-sm text-white/70">Images (URLs)</div>
        {images.map((img, idx) => (
          <div key={idx} className="grid md:grid-cols-2 gap-2">
            <input
              placeholder="https://…"
              className="rounded-xl2 bg-[#1f1f21] p-3"
              value={img.url}
              onChange={(e) => updateImage(idx, { url: e.currentTarget.value })}
            />
            <div className="flex flex-col sm:flex-row gap-2 ">
              <input
                placeholder="Caption (optional)"
                className="flex-1min-w-0 rounded-2xl bg-[#1f1f21] p-3"
                value={img.caption ?? ""}
                onChange={(e) => updateImage(idx, { caption: e.currentTarget.value })}
              />
              <button type="button" className="px-3 rounded-2xl bg-white/10 hover:bg-white/30 shirink-0"
                onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                Remove
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15"
          onClick={() => setImages(prev => [...prev, { url: "" }])}>
          + Add image
        </button>
      </div>

      <div className="pt-2 flex gap-2">
        <button className="btn" type="submit">
          {mode === "create" ? "Create" : "Save changes"}
        </button>
        <button type="button" className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
