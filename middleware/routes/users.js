import express from 'express'

// This will help us connect to the database
import db from '../connection.js'

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from 'mongodb'
import 'dotenv/config'

const router = express.Router()
let collection = db.collection('users')

// This section will help you get a list of all the users.
router.get('/', async (req, res) => {
	let results = await collection.find({}).toArray()
	res.send(results).status(200)
  })

export default router