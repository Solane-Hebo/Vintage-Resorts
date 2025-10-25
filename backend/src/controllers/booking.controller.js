import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import Booking from "../models/booking.models.js";
import Listing from "../models/listing.model.js";
import ROLES from "../constant/role.js";

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

    const user = req.user._id

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
        status: 'confirmed',
        user
    })

    const populatedBooking = await booking.populate('listing')
    res.status(201).json(populatedBooking)
})


//Get All
export const getBookings = asyncHandler (async (req, res, next) => {
    const { listingId, from, to} = req.query

    const isAdmin = req.user.role === ROLES.ADMIN
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

    if(!isAdmin) {
        q.user = req.user._id
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

    const isAdmin = req.user.role === ROLES.ADMIN
    const isOwner = booking.user.toString() === req.user._id.toString()

    if(!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied. Not your booking"})
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

export const updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid booking id" });
    }

    const current = await Booking.findById(id)
    if(!current) {
        return res.status(400).json({ message: "Can't find booking" });
    }

    const isAdmin = req.user.role === ROLES.ADMIN
    const isOwner = current.user?.toString() === req.user._id?.toString();

    if(!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied. Not your booking"});
    }

    const updatedBooking = await Booking.findOneAndUpdate(
        filter,
        { new: true }
    ).populate('listing');

    if (!updatedBooking) {
        return res.status(404).json({ message: "Can't find booking" });
    }

    res.status(200).json(updatedBooking);
})

// PATCH  todo : tar bort sin egen bokning eller admin
export const deleteBooking = asyncHandler(async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
      }


    const booking = await Booking.findById(id)    
    if(!booking) { 
        return res.status(404).json({message: "Can't find booking"})
    }

    const isAdmin = req.user.role === ROLES.ADMIN
    const isOwner = booking.user.toString() === req.user._id.toString()

    if(!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied. Not your booking"})
    }

    
    console.log('DELETE /api/bookings/:id', req.params.id);
    await booking.deleteOne()
    return res.status(200).json({ message:"Booking deleted successfully"})

})
