import express from 'express'
import {createNewListing, deleteListing, getAllListings, getListing, updateListing } from '../controllers/listing.controller.js'
import { authenticateToken, authorizeRoles } from '../middleware/auth.middelware.js'
import ROLES from '../constant/role.js'
const router = express.Router()

//CRUD

router.post('/',authenticateToken, authorizeRoles( 
    ROLES.ADMIN), createNewListing ) //Create
router.get('/', getAllListings ) //Read
router.get('/:id', getListing ) //Read
router.put('/:id', authenticateToken, authorizeRoles( 
    ROLES.ADMIN), updateListing ) //Update
router.delete('/:id', authenticateToken, authorizeRoles( 
    ROLES.ADMIN), deleteListing)//Delete
router.get('/:id', () => {}) //Read


export default router