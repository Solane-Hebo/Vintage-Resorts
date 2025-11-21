import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        listing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
            index: true
        }, 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        guestName: { type: String},
        guestEmail: { type: String},

        guests: { 
            adults: {type: Number, default: 1, min: 1},
            children: {type: Number, default: 0, min: 0},  
        },

        checkIn: {type: Date, required: true},
        checkOut: {type: Date, required: true},

        totalPrice: {type: Number, required: true, min: 0},

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'confirmed'
        },

    }, {timestamps: true}
)

bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1})

bookingSchema.statics.isBookingAvailable = async function (
    listingId,
    checkIn,
    checkOut,
) {
    const bookingsOverlap = await this.findOne({
        listing: listingId,
        status: {$ne: 'cancelled'},
        checkIn: {$lt: checkOut},
        checkOut: {$gt: checkIn},
    }).lean()
    return !bookingsOverlap
}
const Booking = mongoose.model('Booking', bookingSchema)
export default Booking