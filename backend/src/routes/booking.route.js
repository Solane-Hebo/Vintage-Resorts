import express from 'express'
import { cancelBooking, checkAvailability, createBooking, getBookingById, getBookings } from '../controllers/booking.controller.js'
const router = express.Router()


router.route('/')
 .get(getBookings)
 .post(createBooking)

router.get('/availability', checkAvailability)
router.get('/:id', getBookingById)
router.patch('/:id/cancel', cancelBooking)




export default router