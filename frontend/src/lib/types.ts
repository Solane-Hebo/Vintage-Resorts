export type PayWhen = "today" | "30days";
export type PayMethod = "card" | "paypal" | "apple" | "klarna";

export type Image = { url: string; caption?: string; _id: string}
export type ImageInput = {url: string; caption?: string}
export type Listing = {
    _id: string
    title: string
    description: string
    price: number
    pricingNote?: string
    location: string
    images: ImageInput[]
    from: string
    to: string
    amenities?: string[]
    rating?: number
    reviewsCount?: number
    maxGuests?: number
    guests: number
}

export type BookingCreatePayload = {
    listingId: string
    from: string
    to: string
    checkIn: string
    checkOut: string
    guests: { adults: number; children: number}
    guestName: string
    guestEmail: string
    meta: {payWhen: string; method: string; message?: string; cardLast4?: string; mockPaid?: boolean;}
}

export type Guests ={ adults: number; children?: number}
export type Booking = {
    _id: string
    listing: Listing | string
    user: string
    guestName: string
    guestEmail: string
    checkIn: string
    checkOut: string
    guests: Guests
    totalPrice: number
    status: "Pending" | "Confirmed" | "Cancelled" | "Completed"
    
}

export type SearchParams = {
    place: string
    from: string
    to: string
    guests: number
}