import asyncHandler from "express-async-handler";
import Listing from "../models/listing.model.js";
import Booking from "../models/booking.models.js";


export const searchListing = asyncHandler(async (req, res) => {
    const { place, from, to, guests } = req.query
    const query= {}

    if(place && place.trim() !== "") {
        query.$or = [
            {location: {$regex: place.trim(), $options: "i"}},
            {title: {$regex: place.trim(), $options: "i"}}
        ]
    }

    if(guests) {
        const g = Number(guests)
        if(!Number.isNaN(g) && g > 0) {
            query.maxGuests = { $gte: g}
        }
    }


    const listings = await Listing.find(query).lean()

    if(!from || !to) {
        return res.status(200).json(listings)
    }

    const start = new Date(from)
    const end = new Date(to)

    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return res.status(400).json({message: "Invalid date format"})
    }
    if (end <= start) {
        return res
        .status(400)
        .json({message: "ChechOut must be after check in"})
    }

    const overlappingBookings = await Booking.find({
        checkIn: { $lt: end},
        checkOut:{$gt: start},
        status: {$ne: "cancelled"},
    }).select("listing")

    const bookedListingIds = overlappingBookings.map(b => b.listing.toString())

    const availableListings = listings.filter(
        (l) => !bookedListingIds.includes(l._id.toString())
    )

    res.status(200).json(availableListings)
})