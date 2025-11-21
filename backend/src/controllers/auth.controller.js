import User from "../models/auth.models.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/genereteToken.js";


export const register = asyncHandler(async (req, res) => {
    const { name, email, password} = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error("Please fill all the fields")
    }

    const normalizedEmail = email.trim().toLowerCase()

    if(await User.exists({ email: normalizedEmail})) {
        return res.status(400).json({ message: "User already exists"} )
    }
   
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
    })

    const token = generateToken(user)

    res.status(201).json({ 
       user:{ _id: user._id, name: user.name, email: user.email, role: user.role}, 
                         token
        })

   })

   export const login = asyncHandler(async (req, res) => {
    const { email, password} = req.body

    if(!email || !password) {
       return res.status(400).json({message: "Please fill all the fields"})
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await User.findOne({ email: normalizedEmail }).exec()

    if(!user) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match) {
        return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user)

    res.status(201).json({ 
         user:{ _id: user._id, name: user.name, email: user.email, role: user.role}, 
                         token
        })


   })