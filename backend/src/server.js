import app from './app.js'
import mongoose from 'mongoose'

const PORT = process.env.PORT || 8888

const MONGO_URI = process.env.MONGO_URI

const connectDb = async () => {
    try {
        const mongo = await mongoose.connect(MONGO_URI)
        console.log(`MongoDB Connected: ${mongo.connection.host}`)
    } catch (err) {
      console.log(`MongoDB Connection Error: ${err.message}`)
      process.exit(1)  
    }
}


const startServer = async () => {
    try {
        await connectDb()
        app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
    } catch (error) {
        console.log('Faild to start server:', error.message)
        process.exit(1)
    }
}

startServer()