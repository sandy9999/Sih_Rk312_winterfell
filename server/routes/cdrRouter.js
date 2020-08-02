const express = require("express")
const cdrController = require("./../controllers/cdr.controller")
const utils = require("./../utils/utils")
const cdrRouter = express.Router()

// Returns all records in the db
cdrRouter.get('/getAllRecords',
    cdrController.getAllRecords
)

// A route to add cdr record registration
cdrRouter.post('/addRecord', 
    utils.initializeLocal,
    cdrController.validateRecord,
    cdrController.addRecord
)

// Getting a specific phone number's records
cdrRouter.post('/getCallerRecords',
    cdrController.getCallerRecords
)

// Getting all the records for a time duration with respect to a specific location
cdrRouter.post('/getRecords',
    cdrController.getRecords
)

// Getting the adjacency list for given phone numbers
cdrRouter.post('/getAdjacency',
    cdrController.getAdjacency
)

//Gets list of 5 locations connected to location search string
cdrRouter.post('/getLocationsList',
    cdrController.getLocationsList
)

// Getting the latitude, longitude and country for a given location (address) in string form
cdrRouter.post('/getLatLong',
    cdrController.getLatLong
)

// Getting the logs between 2 callers
cdrRouter.post('/getLogs',
    cdrController.getLogs
)

// Getting the number of calls for each month
cdrRouter.get('/getStatistics',
    cdrController.getStatistics
)

// Getting the heatmap locations
cdrRouter.post('/getHeatmapLocations',
    cdrController.getHeatmapLocations
)

// // Getting the details for a particular record
// cdrRouter.get('/getOrder', 
//     customerController.getOrder
// )

// // Updating a record
// cdrRouter.put('/updateRecord', 
//     utils.initializeLocal,    
// )

// Removing a record
// cdrRouter.delete('/deleteRecord',
//     cdrController.removeRecord
// )

module.exports = {
    cdrRouter : cdrRouter
}
