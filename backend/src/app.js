import express from 'express'

import { errorHandler, notFound } from './middleware/error.meddleware.js'
import listingRoutes from './routes/listing.route.js'
import bookingRoutes from './routes/booking.route.js'
import userRoutes from './routes/auth.route.js'
import { authenticateToken, authorizeRoles } from './middleware/auth.middelware.js'
import ROLES from './constant/role.js'
import cors from 'cors'

const app = express()
app.use(express.json())


app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:5174',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        credentials: true
    })
) 

app.get("/", (req, res) => {
    res.status(200).send("Vintage-Resorts API is running")
})
app.get("/health", (req, res) => {
    res.status(200).json({ ok: true})
})

app.use('/api/listing', listingRoutes)
app.use('/api/bookings', authenticateToken, authorizeRoles( ROLES.ADMIN, ROLES.USER), bookingRoutes)
app.use('/api/user', userRoutes)


app.use(notFound) // notFound
app.use(errorHandler) // errorHandler


export default app