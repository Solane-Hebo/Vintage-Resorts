import express from 'express'
import listingRoutes from './routes/listing.route.js'
import { errorHandler, notFound } from './middleware/error.meddleware.js'

const app = express()
app.use(express.json())


app.use('/api/listing', listingRoutes)

app.use(notFound) // notFound
app.use(errorHandler) // errorHandler


export default app