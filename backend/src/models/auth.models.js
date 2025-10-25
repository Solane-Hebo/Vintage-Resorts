import mongoose from "mongoose";
import ROLES from "../constant/role.js"

const authSckema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true, lowerCase:true},
    password: { type: String, required: true},
    role: { type: String, enum: [...Object.values(ROLES)], default: ROLES.USER}, 
}, {
    timestamps: true,
})

const User = mongoose.model('User', authSckema)
export default User