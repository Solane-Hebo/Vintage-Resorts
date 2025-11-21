export default function ListingDetailSkeleton(){
    return (
     <div className="animate-pulse max-w-5xl mx-auto p-4 space-y-6">
       <div className="h-64 bg-white/5 rounded-xl2" />
       <div className="h-6 bg-white/5 rounded w-2/3" />
       <div className="h-4 bg-white/5 rounded w-1/2" />
       <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div className="h-4 bg-white/5 rounded" />
          <div className="h-4 bg-white/5 rounded w-5/6" />
          <div className="h-4 bg-white/5 rounded w-4/6" />
          <div className="h-48 bg-white/5 rounded-xl2" />
        </div>
       <div className="h-56 bg-white/5 rounded-xl2" />
      </div>

     </div>
    )
}