const {CustomError} = require("../utils/utils")
const {CDR} = require("./../models/callDetails")
const {Notes} = require("./../models/noteDetails")
const {calculateDistance} = require("./../utils/utils")
const nodeGeocoder = require('node-geocoder')

// Return all the CDR Records
let getAllRecords = async (req, res) => {
    let records = await CDR.find({})
    return res.json(records);
}

// Checks if the call data record is valid 
let validateRecord = async(req, res, next) => {
    let cdrRecord = req.body
    
    try{
        if(!cdrRecord){
            return res.status(400).send({
                message : "No cdr data received",
                code : 400
            })
        }

        // Validating all required fields
        let requiredFields = ["callerNumber", "calledNumber", "startTime", "endTime", "callDuration", "callType", "imei", "imsi", "originLatLong", "destLatLong"]
    
        // Checking whether fields exist
        for(let reqField of requiredFields){
            if(!cdrRecord.hasOwnProperty(reqField)){
                let errorMsg = "Didn't receive the property " + reqField
                return res.json({
                    message : errorMsg,
                    code : 400
                })
            }
        } 
        
        cdrRecord.callDuration = isNaN(cdrRecord.callDuration) ? 0 : cdrRecord.callDuration
        req.locals.record = cdrRecord
        return next() 
    }catch(err){
        res.json({
            message : "Error trying to validate cdr record",
            error : err, 
            code : 500
        })
        return new CustomError(err)
    }
}

// Returning the records for one phone number
let getCallerRecords = async (req, res) => {
    // Get the specific user id
    let callerNumber = req.body.callerNumber
    if(!callerNumber){
        return res.json({
            message : "No caller number received",
            code : 200
        })
    }

    let caller = await CDR.find({callerNumber : callerNumber});

    return res.json({
        message : caller,
        code : 200
    });
}

// Adds the new call data record
let addRecord = async(req, res) => {
    let callerRecord = req.locals.record
    let startTime = new Date(callerRecord.startTime)
    callerRecord.startTime = startTime
    let endTime = new Date(callerRecord.endTime)
    
    callerRecord.endTime = endTime
    await CDR.findOneAndUpdate(callerRecord, callerRecord, {upsert: true}, function() {})

    return res.json({
        message : "Record successfully added",
        code : 201
    });
}

// Returns cdr locations of each person using CDR records
let getHeatmapLocations = async(req, res) => {
    let startTimeReq = req.body.startTime
    let endTimeReq   = req.body.endTime
    let phoneNumbers = req.body.numbers
    
    if(!startTimeReq || !endTimeReq || !phoneNumbers){
        return res.json({
            message : "Missing atleast one of the required fields : startTime, endTime, numbers",
            code : 404
        })
    }        

    startTimeReq = new Date(startTimeReq)
    endTimeReq = new Date(endTimeReq)

    // Getting all locations of users with given phone numbers
    let heatmaps = {}
    for(let number of phoneNumbers){
        let records = await CDR.find({callerNumber : number, startTime : {$gte : startTimeReq, $lte : endTimeReq}})
        records.sort((a, b) => a.startTime > b.startTime)
        heatmaps[number] = records.map((record) => {
            return {
                location : JSON.parse(JSON.stringify(record.originLatLong)),
                timestamp : record.startTime    
            }
        })
    } 

    return res.json({
        heatmaps : heatmaps,
        code : 200
    })
}


// Get all records within a given time duration and location range
let getRecords = async(req, res) => {
    let refTime = new Date(req.body.refTime)
    let duration   = req.body.duration
    let location  = req.body.location
    let radius    = req.body.radius ? req.body.radius : 5

    if(!refTime || !duration || !location){
        return res.json({
            message : "Missing atleast one of the required fields : refTime, duration, location",
            code : 404
        })
    }

    let startTimeReq = new Date(refTime.getTime())
    let endTimeReq = new Date(refTime.getTime())
    
    // Setting startTime as refTime - duration and endTime as refTime + duration
    startTimeReq.setMinutes(refTime.getMinutes() - duration)
    endTimeReq.setMinutes(refTime.getMinutes() + duration)
    
    // Getting all records between start time and end time
    let records = await CDR.find({startTime : {$gte : startTimeReq, $lte : endTimeReq}})

    // Getting all the records within a radius of radius from location
    let refLat = location.lat
    let refLong = location.long
    let ans = [] 
    for(let record of records){
        let destLat = record.originLatLong.lat
        let destLong = record.originLatLong.long
        let distance = calculateDistance(refLat, refLong, destLat, destLong)
        if(distance <= radius){
            ans.push(record)
        }
    }

    return res.json({
        message : ans, 
        code : 200
    })
}

// Get an adjacency list containing requested nodes and all their relations
let getAdjacency = async(req, res) => {
    let phoneNumbers = req.body.numbers
    if(!phoneNumbers){
        return res.json({
            message : "No phone numbers received (numbers)",
            code : 404
        })
    }

    // Creating the adjacency list
    let adjList = {}

    // Defining a defaut object in the adjacency list
    let defaultAdjValue = {
        duration : 0,
        numCalls : 0,
        numSMS : 0,
        sameIMEI : false
    } 

    // Getting all the phone numbers who have the same IMEI and creating edges between these numbers 
    let allNumbers = new Set()
    for(let refNumber of phoneNumbers){
        allNumbers.add(refNumber)
        let refRecord = await CDR.findOne({callerNumber : refNumber})
        
        // If no call record exists for the number
        if(!refRecord){
            continue
        }

        // Reference IMEI
        refImei = refRecord.imei

        // Finding all records with refImei and adding all phone numbers
        let sameImeiRecords = await CDR.find({imei : refImei})
        for(let record of sameImeiRecords){
            let secondNumber = record.callerNumber
            if(secondNumber != refNumber && !allNumbers.has(secondNumber)){
                // Adding an edge in the adj from refNumber to secondNumber
                if(!adjList[refNumber]){
                    adjList[refNumber] = {}
                }
                if(!adjList[refNumber][secondNumber]){
                    adjList[refNumber][secondNumber] = Object.assign({}, defaultAdjValue)
                    adjList[refNumber][secondNumber].sameIMEI = true
                }
                if(!adjList[secondNumber]){
                    adjList[secondNumber] = {}
                }
                if(!adjList[secondNumber][refNumber]){
                    adjList[secondNumber][refNumber] = Object.assign({}, defaultAdjValue)
                    adjList[secondNumber][refNumber].sameIMEI = true
                }
                allNumbers.add(secondNumber)
            }
        }
    }

    // Converting all numbers to a list
    allNumbers = Array.from(allNumbers)

    for(let phoneNumber of allNumbers){
        let outgoing = await CDR.find({callerNumber : phoneNumber})
        let incoming = await CDR.find({calledNumber : phoneNumber})

        // Creating a map of contact to all other contacts
        let adjRow = adjList[phoneNumber]
        if(!adjRow){
           adjRow = {}
        }
        
        // Outgoing calls
        for(let call of outgoing){
            let calledNumber = call.calledNumber
            let callType = call.callType
            
            if(callType === "CALL-OUT" || callType == "CALL-IN"){
                if(adjRow[calledNumber]){
                    adjRow[calledNumber].duration = adjRow[calledNumber].duration + call.callDuration
                    adjRow[calledNumber].numCalls = adjRow[calledNumber].numCalls + 1 
                }else{
                    adjRow[calledNumber] = Object.assign({}, defaultAdjValue)
                    adjRow[calledNumber].duration = call.callDuration
                    adjRow[calledNumber].numCalls = 1
                }
            }else if(callType === "SMS-OUT" || callType === "SMS-IN"){
                if(adjRow[calledNumber]){
                    adjRow[calledNumber].numSMS = adjRow[calledNumber].numSMS + 1
                }else{
                    adjRow[calledNumber] = Object.assign({}, defaultAdjValue)
                    adjRow[calledNumber].numSMS = 1
                }
            }
        }

        // Updating the adjacency list of phone number
        adjList[phoneNumber] = adjRow

        // Incoming calls
        for(let call of incoming){
            let callerNumber = call.callerNumber
            let callType = call.callType

            // These will anyway be added later
            if(callerNumber in phoneNumbers){
                continue;
            }
            
            if(!adjList[callerNumber]){
                adjList[callerNumber] = {}
            }

            if(callType == "CALL-IN" || callType == "CALL-OUT"){
                if(adjList[callerNumber][phoneNumber]){
                    adjList[callerNumber][phoneNumber].duration = adjList[callerNumber][phoneNumber].duration + call.callDuration
                    adjList[callerNumber][phoneNumber].numCalls = adjList[callerNumber][phoneNumber].numCalls + 1
                }else{
                    adjList[callerNumber][phoneNumber] = Object.assign({}, defaultAdjValue)
                    adjList[callerNumber][phoneNumber].duration = call.callDuration
                    adjList[callerNumber][phoneNumber].numCalls = 1
                }
            }else if(callType == "SMS-IN" || callType == "SMS-OUT"){
                if(adjList[callerNumber][phoneNumber]){
                    adjList[callerNumber][phoneNumber].numSMS = adjList[callerNumber][phoneNumber].numSMS + 1
                }else{
                    adjList[callerNumber][phoneNumber] = Object.assign({}, defaultAdjValue)
                    adjList[callerNumber][phoneNumber].numSMS = 1
                }
            }
        }
    }

    return res.json({
        message : adjList,
        code : 200
    })
}

// Getting the call logs between 2 users
let getLogs = async(req, res) => {
    let numbers = req.body.numbers
    if(!numbers){
        return res.json({
            message : "Didn't receive numbers",
            code : 400
        })
    }else if(numbers.length != 2){
        return res.json({
            message : "Didn't receive numbers 2 numbers.",
            code : 400
        })
    }

    // Sorting numbers lexicographically
    numbers.sort()
    let srcNumber = numbers[0]
    let destNumber = numbers[1]

    // Getting the logs
    let logs1 = await CDR.find({callerNumber : srcNumber, calledNumber : destNumber})
    let logs2 = await CDR.find({callerNumber : destNumber, calledNumber : srcNumber})
    let logs = logs1.concat(logs2)

    // Sorting all logs in terms of starting time
    let compare = (a, b) => {
        if(a.startTime < b.startTime){
            return 1
        }else if(a.startTime > b.startTime){
            return -1
        }
        return 0
    }
    logs.sort(compare)

    // Getting the notes between user1 and user2
    let notes = await Notes.find({srcNumber : srcNumber, destNumber : destNumber})
    return res.json({
        logs : logs,
        notes : notes,
        code : 200
    })
}

// get single phoneNumber statistics, weekly and monthly
let getSinglePhoneStatistics = async(req, res) => {
    let srcNumber = req.body.phoneNumber;
    if(!srcNumber){
        return res.json({
            message : "No caller number received",
            code : 200
        })
    }
    // Getting the current year
    let currentDate = new Date(Date.now())
    let currentYear = currentDate.getFullYear()
    
    // Getting the number of records for each month
    let outgoing = await CDR.find({callerNumber : srcNumber})
    let incoming = await CDR.find({calledNumber : srcNumber})
    let allRecords = outgoing.concat(incoming);
    let monthCounts = []
    for(let i = 1; i <= 12; ++i){
        monthCounts.push(0)
    }

    for(let record of allRecords){
        let startTime = record.startTime
        let month = startTime.getMonth()
        let year = startTime.getFullYear()
        if(year == currentYear){
            monthCounts[month - 1] += 1
        }
    }
    return res.json({
        cdrCounts : monthCounts,
        code : 200     
    })
}


// Returns a statistics required for the dashboard
let getStatistics = async(req, res) => {
    // Getting the current year
    let currentDate = new Date(Date.now())
    let currentYear = currentDate.getFullYear()

    // Getting the number of records for each month
    let allRecords = await CDR.find({})
    let callCounts = []
    let smsCounts = []
    let callDurations = {}
    for(let i = 1; i <= 12; ++i){
        callCounts.push(0)
        smsCounts.push(0)
    }

    for(let record of allRecords){
        let startTime = record.startTime
        let month = startTime.getMonth()
        let year = startTime.getFullYear()
        let callType = record.callType
        let callerNumber = record.callerNumber
        let callDuration = record.callDuration

        // Aggregating call duration for each user
        if(!callDurations[callerNumber]){
            callDurations[callerNumber] = 0
        }
        callDurations[callerNumber] += callDuration

        if(year == currentYear){
            if(callType == "CALL-IN" || callType == "CALL-OUT"){
                callCounts[month - 1] += 1
            }else if(callType == "SMS-IN" || callType == "SMS-OUT"){
                smsCounts[month - 1] += 1
            }
        }
    }

    // Mapping callDurations to a list so that it can be sorted 
    let callDurationList = []
    for(let caller in callDurations){
        callDurationList.push({
            caller : caller,
            duration : callDurations[caller]
        })
    }

    // Sorting callers on the basis of duration
    callDurationList.sort((a, b) => a.duration < b.duration)

    return res.json({
        cdrCounts : callCounts,
        smsCounts : smsCounts,
        highestCallers : callDurationList.slice(0, 5),
        code : 200     
    })
}

let getLatLong = async (req, res) => {
    location = req.body.data
    let options = {
        provider: 'openstreetmap'
    };
    let geoCoder = nodeGeocoder(options);
    const result = (await geoCoder.geocode(location))[0]
    
    return res.json({
        message : {"latitude": result.latitude, "longitude": result.longitude, "country": result.country},
        code : 200
    })
}

let getLocationsList = async (req, res) => {
    location = req.body.data
    let options = {
        provider: 'openstreetmap'
    };
    let geoCoder = nodeGeocoder(options);
    const result = await geoCoder.geocode(location)
    return res.json({
        message : result.map(a=> a.formattedAddress).slice(0,5),
        code : 200
    })
}

module.exports = {
    validateRecord : validateRecord,
    getAllRecords : getAllRecords,
    getCallerRecords : getCallerRecords,
    addRecord : addRecord,
    getRecords : getRecords,
    getAdjacency : getAdjacency,
    getLogs : getLogs,
    getLocationsList: getLocationsList,
    getLatLong: getLatLong,
    getStatistics : getStatistics,
    getHeatmapLocations : getHeatmapLocations,
    getSinglePhoneStatistics : getSinglePhoneStatistics
}
