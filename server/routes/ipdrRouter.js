const express = require("express")
const ipdrController = require("./../controllers/ipdr.controller")
const utils = require("./../utils/utils")
const ipdrRouter = express.Router()

// Returns all records in the db
ipdrRouter.get('/getAllIPDRRecords',
    ipdrController.getAllIPDRRecords
)

// A route to add ipdr record registration
ipdrRouter.post('/addIPDRRecord', 
    utils.initializeLocal,
    ipdrController.validateIPDRRecord,
    ipdrController.addIPDRRecord
)

// Getting a specific phone number's records
ipdrRouter.post('/getIPDRRecordsgivenNumber',
    ipdrController.getIPDRRecordsgivenNumber
)

// Getting all the records for a time duration with respect to a specific location
ipdrRouter.post('/getIPDRRecords',
    ipdrController.getIPDRRecords
)

//Gets list of 5 locations connected to location search string
ipdrRouter.post('/getIPDRLocationsList',
    ipdrController.getIPDRLocationsList
)

// Getting the latitude, longitude and country for a given location (address) in string form
ipdrRouter.post('/getIPDRLatLong',
    ipdrController.getIPDRLatLong
)

// Returns the month wise count of all IPDR records
ipdrRouter.get('/getStatistics',
	ipdrController.getStatistics
)

module.exports = {
    ipdrRouter : ipdrRouter
}
