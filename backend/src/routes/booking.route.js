import express from 'express'
import { createBooking, deleteBooking, getBookingById, getBookings} from '../controllers/booking.controller.js'
import ROLES from '../constant/role.js'

const router = express.Router()


router.route('/')
 .get(getBookings)
 .post(createBooking)


router.route('/:id')
.get(getBookingById)
.delete(deleteBooking)


// router.delete('/:id/booking', cancelBooking)



export default router