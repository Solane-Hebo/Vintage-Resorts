import express from 'express'
import {createNewListing, deleteListing, getAllListings, getListing, updateListing } from '../controllers/listing.controller.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.middelware.js'
import { searchListing } from '../controllers/searchListing.controller.js'
import Listing from '../models/listing.model.js'
// import ROLES from '../constant/role.js'

const router = express.Router()

//CRUD

router.get("/search", searchListing)
router.get('/', getAllListings ) //Read

router.get('/me', authenticateToken, async (req, res) => {
    const listings = await Listing.find({ author: req.user?._id }).exec()
    res.status(200).json(listings)
}) //Read user's listings
router.get('/:id', getListing ) //Read

// router.post('/',authenticateToken, authorizeRoles( 
//     ROLES.ADMIN, ROLES.USER) , createNewListing ) //Create

router.post('/',authenticateToken, createNewListing ) //Create

router.put('/:id', authenticateToken, updateListing ) //Update
    
router.delete('/:id', authenticateToken, deleteListing)//Delete


export default router