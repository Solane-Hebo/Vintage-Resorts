import express from 'express'
import {createNewListing, deleteListing, getAllListings, getListing, updateListing } from '../controllers/listing.controller.js'
const router = express.Router()

//CRUD

router.post('/', createNewListing) //Create
router.get('/', getAllListings ) //Read
router.get('/:id', getListing ) //Read
router.put('/:id', updateListing ) //Update
router.delete('/:id', deleteListing)//Delete
router.get('/:id', () => {}) //Read


export default router