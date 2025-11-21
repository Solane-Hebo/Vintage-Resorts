import express from 'express'
import { createBooking, deleteBooking, getBookingById, getBookings, updateBookingStatus} from '../controllers/booking.controller.js'


const router = express.Router()


router.route('/')
 .get(getBookings)
 .post(createBooking)


router.route('/:id')
.get(getBookingById)
.patch(updateBookingStatus)
.delete(deleteBooking)






export default router