import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../../lib/auth"
import { type Listing } from "../../../lib/types"
import { useEffect, useMemo, useState } from "react"
import { createBooking, getListingById } from "../../../lib/api"
import type { AxiosError } from "axios"
import { Apple, BadgePercent, Banknote, CalendarDays, ChevronDown, ChevronUp, CreditCard, Users, Wallet } from "lucide-react"


const CLEANING_FEE = 300
const SERVICE_FEE_RATE = 0.08

function diffNights(from: string, to: string): number {
if(!from || !to) return 0
const a = new Date(from + "T00:00:00").getTime()
const b = new Date(to+ "T00:00:00").getTime()
const ms = b - a
if (ms <= 0) return 0
return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

type PayWhen = "today" | "30days"
type PayMethod = "card" | "paypal" | "apple" | "klarna"

function MethodIcon({ method, className }: { method: PayMethod; className?: string }) {
  if (method === "card") return <CreditCard className={className} />
  if (method === "paypal") return <Banknote className={className} />
  if (method === "apple") return <Apple className={className} />
  return <BadgePercent className={className} />
}

export default function BookingFlowPage(){
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const auth = useAuth()


  const listingId = params.get("listingId") ?? ""
  const from = params.get("from") ?? ""
  const to = params.get("to") ?? ""
  const initialAdult = Number(params.get("guests") ?? "")

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setloading] = useState(true)
  const [error, setError] = useState("")


  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [adults] = useState(Math.max(1, initialAdult))

  const [children] = useState(0)
  const totalGuests = adults + children

  const [payWhen, setPayWhen] = useState<PayWhen>("today")
  const [method, setMethod] = useState<PayMethod>("card")

  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardCountry, setCardCountry] = useState("")

  const [message, setMessage] = useState("")

  const [guestName, setGuestName] = useState(auth.user?.name ?? "")
  const [guestEmail, setGuestEmail] = useState(auth.user?.email ?? "")


  useEffect(() =>{
    if(!listingId) {
      setError("Missing listingId")
      setloading(false)
      return
    }
    setloading(true)
    setError("")
    getListingById(listingId)
      .then((res) => setListing(res.data))
      .catch((e: AxiosError<{ message: string }>) =>
         setError(e.response?.data?.message ?? "Failed to load listing"))
      .finally(() => setloading(false))
  }, [listingId])


  const nights = useMemo(() => diffNights(from, to), [from, to])
  const price = useMemo(() => {
    if(!listing || nights <= 0)
      return { subtotal: 0, serviceFee: 0, cleaningFee: 0, total: 0}
    const subtotal = listing.price * nights
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE)
    const cleaningFee = CLEANING_FEE
    return { subtotal, serviceFee, cleaningFee, total: subtotal  + serviceFee + cleaningFee}
  }, [listing, nights])


  const canNext1 = ["today", "30days"].includes(payWhen)
  const canNext2 = ["card", "paypal", "apple", "klarna"].includes(method)
  const canNext3 = 
        method !== "card" ||
        (cardNumber.trim().length >= 12 &&
         cardName.trim().length >= 2 &&
         cardCvv.trim().length >= 3 )
   
  const canSend =
        !!listing &&
        nights > 0 &&
        totalGuests >= 1 &&
        guestName.trim().length > 1 && 
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)   
        
  async function handleSend() {
    if (!auth.user || !auth.token) {
      navigate("/login?redirect=" + encodeURIComponent(location.pathname + location.search))
      return
    }
    if(!listing) return

    try {
      await createBooking({
        listingId: listing._id,
        from,
        to,
        checkIn: from,
        checkOut: to,
        guests: { adults, children},
        guestName,
        guestEmail,
        meta: {
          payWhen,
          method,
          message,
          cardLast4: method === "card" ? cardNumber.slice(-4) : undefined,
        },
      })

      navigate("/booking/thanks")
    } catch (err) {
      const ax = err as AxiosError<{ message: string }>
      setError(ax.response?.data?.message ?? "Booking failed")
    }
  } 
  
  if (loading) return <div className="p-6 text-accent">Loading...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>
  if (!listing) return <div className="p-6 text-accent">Not found</div>
  if (nights<=0) return <div className="p-6 text-accent">Select valid dates on the listing.</div>

  const Header = ({
    title,
    subtitle,
    open,
    onClick,
    icon
  } : {
    title: string
    subtitle?: string
    open: boolean
    onClick: () => void
    icon? : React.ReactNode
  }) => (
    <header
      className="flex items-center justify-between p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
       <div className="rounded-xl2 bg-white/10 p-2 text-white">{icon}</div>
       <div>
        <div className="text-white font-medium">{title}</div>
        {subtitle && <div className="text-white/60 text-xs">{subtitle}</div>}
       </div>
      </div>
      {open ? <ChevronUp className="text-white/70"/> :<ChevronDown className="text-white/70" />}
    </header>
  )


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-2xl font-semibold text-white mb-2">Send booking request</h1>

          {/* Step 1 */}
        <section className="rounded-xl2 bg-surface border border-white/10">
          <Header
           title="Choose when to pay"
           subtitle={payWhen === "today" ? "Pay 50% today" : "Pay within 30 days"}
           open={step === 1}
           onClick={() => setStep(1)}
           icon={<Wallet size={20}/>}
          />
          {step === 1 && (
            <div className="p-4 border-t border-white/10 space-y-3">
              <label className="flex items-center justify-between bg-[#171719] border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <BadgePercent className="text-white/70" size={20} />
                <div>
                 <div className="text-white">Pay 50% today</div>
                 <div className="text-white/50 text-xs">Pay the rest when your stay approaches</div>
                </div>
              </div>
              <input type="radio" checked={payWhen === "today"} onChange={() => setPayWhen("today")} />
              </label>

              <label className="flex items-center justify-between bg-[#171719] border border-white/10 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-white/70" size={20} />
                <div>
                 <div className="text-white">Pay within 30 days</div>
                 <div className="text-white/50 text-xs">Secure the booking now, pay later</div>
                </div>
              </div>
              <input 
                type="radio" 
                name="payWhen"
                checked={payWhen === "30days"} 
                onChange={() => setPayWhen("30days")} />
              </label>

              <div className="pt-2 flex justify-end">
                <button
                 disabled={!canNext1}
                 className="btn"
                 onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Step 2 -Payment method */}
        <section className="rounded-xl2 bg-surface border border-white/10">
         <Header
           title="Payment method"
           subtitle={method}
           open={step === 2}
           onClick={() => setStep(2)}
           icon={<MethodIcon method={method} className="text-white/80"/>}
          />

          {step === 2 && (
            <div className="p-4 border-t border-white/10 space-y-3">
              {[
                { id: "card", label: "Credit card", icon: <CreditCard size={20} />},
                { id: "paypal", label: "PayPal", icon: <Banknote size={20} />},
                { id: "apple", label: "Apple Pay", icon: <Apple size={20} />},
                { id: "klarna", label: "Klarna", icon: <BadgePercent size={20} />},
              ].map((m) =>(
                <label
                 key={m.id}
                 className="flex items-center justify-between bg-[#171719] border border-white/10 rounded-2xl p-3"
                >
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-white/80">{m.icon}</span>
                    <span>{m.label}</span>
                  </div>
                   <input 
                   type="radio" 
                   name="method"
                   checked={method === (m.id as PayMethod)} 
                   onChange={() => setMethod(m.id as PayMethod)} 
                   />
                </label>
              ))}

               <div className="pt-2 flex justify-between">
                 <button
                  className="btn"
                  onClick={() => setStep(1)}
                 >
                  Back
                 </button>
                 <button
                  disabled={!canNext2}
                  className="btn"
                  onClick={() => setStep(3)}
                 >
                  Next
                </button>
                </div>  
            </div>
          )}
        </section>

        {/* Step 3 -Card detail (only if card) ? message*/}
         <section className="rounded-xl2 bg-surface border border-white/10">
         <header
           className="flex items-center justify-between p-4 cursor-pointer"
           onClick={() => setStep(3)}
          >
            <div className="text-white font-medium">
              {method === "card" ? "Add card details" : "Write a message to your host"}
            </div>
         </header>   
         {step === 3 && (
            <div className="p-4 border-t border-white/10 space-y-3">
              {method === "card" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                   className="rounded-xl2 bg-[#1f1f21] p-3 text-white border border-white/10 sm:col-span-2"
                   placeholder="Card number"
                   value={cardNumber}
                   onChange={(e) => setCardNumber(e.currentTarget.value)}
                  />
                  <input
                   className="rounded-xl2 bg-[#1f1f21] p-3 text-white border border-white/10 sm:col-span-2"
                   placeholder="Name on card"
                   value={cardName}
                   onChange={(e) => setCardName(e.currentTarget.value)}
                  />
                  <input
                   className="rounded-xl2 bg-[#1f1f21] p-3 text-white border border-white/10 sm:col-span-2"
                   placeholder="CVV"
                   value={cardCvv}
                   onChange={(e) => setCardCvv(e.currentTarget.value)}
                  />
                  <input
                   className="rounded-xl2 bg-[#1f1f21] p-3 text-white border border-white/10 sm:col-span-2"
                   placeholder="Country / Region"
                   value={cardCountry}
                   onChange={(e) => setCardCountry(e.currentTarget.value)}
                  /> 
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs text-white/60">Message to your host</label>
                <textarea
                  className=" w-full min-h-28 rounded-2xl bg-[#1f1f21] p-3 text-white border border-white/10"
                   placeholder="(Optional) Add information for your stay"
                   value={message}
                   onChange={(e) => setMessage(e.currentTarget.value)}
                />   
              </div>

              <div className="pt-2 flex justify-between">
                 <button
                  className="btn"
                  onClick={() => setStep(2)}
                 >
                  Back
                 </button>
                 <button
                  disabled={!canNext3}
                  className="btn"
                 onClick={() => setStep(4)}
                 >
                  Next
                </button>
                </div>  
            </div>
         )}
         </section> 

         {/* Step 4 -Send request (review) */}

        <section className="rounded-xl2 bg-surface border border-white/10">
         <header
           className="flex items-center justify-between p-4 cursor-pointer"
           onClick={() => setStep(4)}
          >
            <div className="text-white font-medium">Send booking request</div>
         </header> 
         {step === 4 && (
            <div className="p-4 border-t border-white/10 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                 <label className="block text-xs text-white//60 mb-1">Guest name</label>
                 <input
                   className="w-full rounded-2xl bg-[#1f1f21] p-3 text-white border border-white/10"
                   placeholder="Full name"
                   value={guestName}
                   onChange={(e) => setGuestName(e.currentTarget.value)}
                  /> 
                </div> 
                <div>
                 <label className="block text-xs text-white//60 mb-1">Guest email</label>
                 <input
                   className="w-full rounded-2xl bg-[#1f1f21] p-3 text-white border border-white/10"
                   placeholder="name@example.com"
                   type="email"
                   value={guestEmail}
                   onChange={(e) => setGuestEmail(e.currentTarget.value)}
                  /> 
                </div> 
              </div>

              <div className="pt-2 flex justify-between">
                 <button
                  className="btn"
                  onClick={() => setStep(3)}
                 >
                  Back
                 </button>
                 <button
                  disabled={!canSend}
                  className="btn"
                  onClick={handleSend}
                 >
                  Send booking request
                </button>
                </div>  
                {!canSend && (
                  <p className="text-xs text-white/50">
                    Fill in your name and a valiid email to continue.
                  </p>
                )}
            </div>
              )}
        </section> 
        </div>

      <aside className="bg-surface rounded-2xl border-white/10 p-4 h-fit sticky top-20">
       <div className="flex item-center gap-3">
        <img
        src={listing.images?.[0]?.url}
        alt={listing.title}
        className="h-20 w-20 object-cover rounded-2xl border border-white/10"
        />

        <div>
          <div className="text-white font-semibold">Your booking</div>
          <div className="text-white/60 text-sm truncate max-w-[14rem]">{listing.title}</div>
        </div>   
       </div>

       <div className="mt-4 text-sm text-white/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Users size={16}/>Guest{totalGuests>1?"s":""} </span>
            <span>{totalGuests}</span>
        </div>
        <div className="flex item-center justify-between">
          <span className="flex items-center gap-2"><CalendarDays size={16} /></span>
          <span>{from} → {to}</span>

        </div>

        <div className="border-t border-white/10 pt-2" />
        <div className="flex justify-between">
          <span>{listing.price.toLocaleString()} X {nights} night{nights>1?"s":""}</span>
          <span>{price.subtotal.toLocaleString()} SEK</span>
        </div>
        <div className="flex justify-between"><span>Cleaning fee</span>
          <span>{price.cleaningFee.toLocaleString()} SEK</span>
        </div>
        <div className="flex justify-between"><span>Service fee</span>
          <span>{price.serviceFee.toLocaleString()} SEK</span>
        </div>
        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-semibold">
         <span>Total</span><span>{price.total.toLocaleString()} SEK</span>
        </div> 

        <div className="border-t border-white/10 pt-2 space-y-1 text-xs">
         <div className="flex items-center justify-between">
          <span className="flex items-center gap-2"><Wallet size={14} />Pay</span>
          <span>{payWhen === "today" ? "50% today" : "Within 30 days"}</span>
         </div>
         <div className="flex items-center justify-between">
           <span className="flex items-center gap-2"><MethodIcon method={method} className="w-3.5 h-3.5" />Method</span>
           <span className="capitalize">{method}</span>
         </div>
        </div>

        <Link className="text-accent underline block mt-2"
         to={`/listing/${listing._id}?from=${from}&to=${to}&guests=${totalGuests}`}
        >
          Change date
        </Link>
      </div>  
      </aside>
    </div>
  </div>
  )
}
