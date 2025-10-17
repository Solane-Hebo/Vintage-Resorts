import express from 'express'

import { errorHandler, notFound } from './middleware/error.meddleware.js'
import listingRoutes from './routes/listing.route.js'
import bookingRoutes from './routes/booking.route.js'

const app = express()
app.use(express.json())


app.use('/api/listing', listingRoutes)
app.use('/api/bookings', bookingRoutes)

app.use(notFound) // notFound
app.use(errorHandler) // errorHandler


export default app