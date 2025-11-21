import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description:{type: String, required: true},
    price:{type: Number, required: true, min:0},
    pricingNote:{type: String},
    location: {type: String, required: true},
    images: [{ url: { type: String },
    caption: String
}],
amenities: {
    type: [String],
    default: []
},

maxGuests: {
    type: Number,
    required: true,
    min: 1
},
    author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
}
},
{timestamps: true})

const Listing = mongoose.model('Listing', listingSchema)

export default Listing