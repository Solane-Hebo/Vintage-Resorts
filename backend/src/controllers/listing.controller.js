import mongoose from 'mongoose'
import Listing from '../models/listing.model.js'
import asyncHandler from 'express-async-handler'


export const createNewListing = asyncHandler (async(req, res, next) => {
    let { 
        title, 
        description, 
        price, 
        pricingNote, 
        location, 
        images = [],
        amenities = [],
        maxGuests,
     } = req.body
    const author = req.user?._id

    price = Number(price)
    maxGuests = Number (maxGuests)

    if (!title || !description || Number.isNaN(price) || !location || !Array.isArray(images) || Number.isNaN(maxGuests)) {
        return res.status(400).json({ message: 'Please provide all required fields',
            debug: { title, description, price, pricingNote, location, imagesType: typeof images, maxGuests },
        })
    }
    const newListing = await Listing.create({ title, description, price, pricingNote: pricingNote?.trim() ? pricingNote: undefined, location, images, author, maxGuests, amenities: Array.isArray(amenities) ? amenities : [], })
    
    res.status(201).json(newListing)
    console.log(req.body)
})


export const getAllListings = asyncHandler (async(req, res) => {
    const listings = await Listing.find()
    .populate('author', 'name')
    .exec()
    res.status(200).json(listings)
})

export const getListing = asyncHandler (async(req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message: 'Invalid listing id'})
    }

    const listing = await Listing.findById(id)
    .populate('author', 'name email')
    .exec()


    if(!listing){
    return res.status(404).json({message: `Can't find listing`})
    }
    res.status(200).json(listing)
})

export const updateListing = asyncHandler (async(req, res) => {
    const {id} = req.params 
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message: 'Invalid listing id'})
    }

    const userId = req.user?._id
    if(!userId) return res.status(401).json({message: 'Unauthorized'})

    const listing = await Listing.findById(id).exec()
    if(!listing) {
        return res.status(404).json({message: `Can't find listing`})
    }

    if(listing.author.toString() !== userId.toString()){
        return res.status(403).json({message: 'Forbidden: You are not the author of this listing'})
    }
   


    const { title, description, price, pricingNote, location, images, amenities, maxGuests } = req.body

    const toUpdate = {}
    if(title) toUpdate.title = title
    if(description) toUpdate.description = description
    if(price) toUpdate.price = price
    if(pricingNote) toUpdate.pricingNote = pricingNote
    if(location) toUpdate.location = location
    if(Array.isArray(images)) toUpdate.images = images
    if(Array.isArray(amenities)) toUpdate.amenities = amenities
    if(typeof maxGuests === 'number') toUpdate.maxGuests = maxGuests

    if(Object.keys(toUpdate).length === 0){
        return res.status(400).json({message: 'Please provide at least one field to update'})
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, toUpdate, {new: true}).exec()
    if(!updatedListing){
        return res.status(404).json({message: `Can't find listing`})
}

    res.status(200).json(updatedListing)
})

export const deleteListing = asyncHandler (async(req, res) => {
    const {id} = req.params
     if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(400).json({message: 'Invalid listing id'})
    }

    const userId = req.user?._id
    if(!userId) return res.status(401).json({message: 'Unauthorized'})

    const listing = await Listing.findById(id).exec()

     if(!listing){
        return res.status(404).json({message: `Can't find listing`})
}

    if(listing.author.toString() !== userId.toString()){
        return res.status(403).json({message: 'Forbidden: You are not the author of this listing'})
    }

    await Listing.findByIdAndDelete(id).exec()
    res.status(200).json({message: 'Listing deleted successfully'})
})