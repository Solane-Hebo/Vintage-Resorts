import { useEffect, useState } from "react";
import type { Listing } from "../../lib/types";
import { Link, useSearchParams } from "react-router-dom";
import { searchListings } from "../../lib/api";
import { ArrowRight} from "lucide-react";

export default function SearchPage() {
    const [searchParams] = useSearchParams()


    const place = searchParams.get("place") ?? ""
    const from = searchParams.get("from") ?? ""
    const to = searchParams.get("to") ?? ""
    const guests = Number(searchParams.get("guests") ?? "1")

    const [results, setResults] = useState<Listing[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

useEffect(() =>{
    async function run(): Promise<void> {
        
        setLoading(true)
        setError(null)

        try {
            const res = await searchListings({ place, from, to, guests })
            setResults(res.data)
        } catch (err) {
            setError("Can't find searching result")
        } finally {
            setLoading(false)
        }
    }
    run()

}, [place, from, to, guests])

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
         <section className="bg-surface  rounded-2xl border border-white/10 p-4 space-y-2">
            <h2 className="text-x2 font-semibold tracking-tight text-accent">
                {place ? `Listing in ${place}` : "Listing"}
            </h2>
            <p className="text-sm text-white/70">
            {from && to ? (
                <>
                {from} <ArrowRight className="inline w-4 h-4 mx-1"/>{to}
                </>
            ) : (
                "choose date"
            )}
            . {guests} guest{guests>1?"s" : ""}
            </p>
         </section>

           {loading && <p className="text-white/80">Loading..</p>}
           {error && <p className="text-white/80">{error}</p>}

           {!loading && !error && results.length === 0 && (
            <p className="text-white/80">No matches right now</p>   
        )}

        <div className="space-y-4">
            {results.map((item) => (
                <Link
                key={item._id}
                to={`/listing/${item._id}`}
                className="block bg-surface  rounded-2xl overflow-hidden shadow-card border border-white/10"
                >
                 <div className="w-full aspect-[16/9]">
                    <img
                    src={item.images?.[0]?.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    />
                 </div>
                    <div className="p-4 space-y-1">
                      < h3 className="text-lg font-semibold text-white">
                       {item.title}
                      </h3>
                      <p className="text-md text-white/60">{item.location}</p>
                      <p className="text-md text-white">
                        <span className="font-bold">
                        {item.price.toLocaleString()} SEK
                        </span> {" "}
                        / night
                        </p>
                      
                    </div>
                
                </Link>
            ))}
        </div>

        </div>
    )

}
