import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Booking from "../models/booking.models.js";
import Listing from "../models/listing.model.js";

const MS_PER_DAY = 1000 * 60 * 60 * 24

function getNights(checkIn, checkOut){
    const start = new Date(checkIn)
    const end = new Date(checkOut)

    start.setHours(0,0,0,0) 
    end.setHours(0,0,0,0)
    return Math.ceil((end - start)/ MS_PER_DAY)
}

// Post /api/booking
export const createBooking = asyncHandler(async (req, res) => {
    const {
        listingId,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail
    } = req.body

    if (!listingId || !checkIn || !checkOut){
        return res.status(400).json({ message: 'listingId, checkIn, checkOut are required'})
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const start = new Date(checkIn)
    const end = new Date(checkOut)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())){
        return res.status(400).json({ message: 'Invalid date format'})
    }

    if (end <= start){
        return res.status(400).json({ message: 'checkOut must be after checkIn'})
    }

    //Availability
    const isAvailable = await Booking.isBookingAvailable(listingId, start, end)

    if(!isAvailable) {
        return res.status(400).json({ message: 'Date is not available'})
    }

    const listing = await Listing.findById(listingId).lean()
    if(!listing) return res.status(404).json({ message: "Can't find listing"})


    // Price calculation
    const nights = getNights(start, end)
    const unitPrice = Number(listing.price) || 0 
    const totalPrice = nights * unitPrice

    const booking = await Booking.create({
        listing: listingId,
        checkIn: start,
        checkOut:end,
        guests,
        guestName,
        guestEmail,
        totalPrice,
        status: 'confirmed'
    })

    const populatedBooking = await booking.populate('listing')
    res.status(201).json(populatedBooking)
})


//Get All
export const getBookings = asyncHandler (async (req, res, next) => {
    const { listingId, from, to} = req.query
    const q = {}
    if(listingId) q.listing = listingId

    if(from || to) {
        q.checkIn = {}
        q.checkOut = {}
        if (from) {
            const f = new Date(from)
            q.checkOut.$gt = f 
        }

        if (to) {
            const t = new Date(to)
            q.checkIn.$lt = t
        }
    }

    const bookings = await Booking.find(q).sort({ checkIn: 1}).populate('listing')
    res.json(bookings)
})


export const getBookingById =asyncHandler(async (req, res) => {
    const { id } = req.params

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid booking id'})
    }
    const booking = await Booking.findById(id).populate('listing')
    if(!booking) {
        return res.status(404).json({message: "Booking not found"})
    }
    res.status(200).json(booking)
 })
 

export const checkAvailability = asyncHandler(async (req, res) => {
    
    const { listingId, checkIn, checkOut} = req.body
    if(!listingId || !checkIn || !checkOut) {
        return res.status(400).json({message: 'listingId, checkIn, checkOut are required' })
    }
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const isAvailable = await Booking.isBookingAvailable(listingId, start, end)
    res.status(200).json({ isAvailable})
})


// PATCH
export const cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
      }

    const booking = await Booking.findByIdAndUpdate(
        id, 
        {status: "cancelled"}, 
        { new: true})
        .populate('listing')
        

    if(!booking) { return res.status(404)
            .json({message: "Can't find booking"})
    }

    return res.status(200).json({ message:"Booking cancelled", booking})
})
