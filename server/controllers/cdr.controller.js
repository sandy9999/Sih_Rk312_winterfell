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
        let required_fields = ["callerNumber", "calledNumber", "startTime", "endTime", "callDuration", "callType", "imei", "imsi", "originLatLong", "destLatLong"]
    
        // Checking whether fields exist
        for(let req_field of required_fields){
            if(!cdrRecord.hasOwnProperty(req_field)){
                let error_msg = "Didn't receive the property " + req_field
                return res.json({
                    message : error_msg,
                    code : 400
                })
            }
        } 
        
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
    CDR.findOneAndUpdate(callerRecord, callerRecord, {upsert: true}, function() {

    })
    return res.json({
        message : "Record successfully added",
        code : 201
    });
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

    let adj_list = {}

    for(let phoneNumber of phoneNumbers){
        let outgoing = await CDR.find({callerNumber : phoneNumber})
        let incoming = await CDR.find({calledNumber : phoneNumber})

        // Creating a map of contact to all other contacts
        let adj_row = adj_list[phoneNumber]
        if(!adj_row){
           adj_row = {}
        }
        
        // Outgoing calls
        for(let call of outgoing){
            let called_number = call.calledNumber
            let called_person = adj_row[called_number]
            if(called_person){
                adj_row[called_number] = {
                    duration : called_person.duration + call.callDuration,
                    numCalls : called_person.numCalls + 1
                }
            }else{
                adj_row[called_number] = {
                    duration : call.callDuration, 
                    numCalls : 1
                }
            }
        }

        // Incoming calls
        for(let call of incoming){
            let caller_number = call.callerNumber
            
            // These will anyway be added later
            if(caller_number in phoneNumbers){
                continue;
            }
            
            if(!adj_list[caller_number]){
                adj_list[caller_number] = {}
            }

            if(adj_list[caller_number][phoneNumber]){
                adj_list[caller_number][phoneNumber] = {
                    duration : adj_list[caller_number][phoneNumber].duration + call.callDuration,
                    numCalls : adj_list[caller_number][phoneNumber].numCalls + 1
                }
            }else{
                adj_list[caller_number][phoneNumber] = {
                    duration : call.callDuration,
                    numCalls : 1
                }
            }
        }

        adj_list[phoneNumber] = adj_row
    }

    return res.json({
        message : adj_list,
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
        return (a.startTime <= b.startTime)
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
    getLatLong: getLatLong
}
