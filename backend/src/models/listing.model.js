import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description:{type: String, required: true},
    price:{type: Number, required: true, min:0},
    pricingNote:{type: String},
    location: {type: String, required: true},
    images: [{ url: { type: String },
    caption: String
}]
},
{timestamps: true})

const Listing = mongoose.model('Listing', listingSchema)

export default Listing