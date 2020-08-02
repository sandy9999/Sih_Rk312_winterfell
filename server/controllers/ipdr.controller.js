const {CustomError} = require("../utils/utils")
const {IPDR} = require("./../models/ipDetails")
//const {Notes} = require("./../models/noteDetails")
const {calculateDistance} = require("./../utils/utils")
const nodeGeocoder = require('node-geocoder')

// Return all the CDR Records
let getAllIPDRRecords = async (req, res) => {
    let records = await IPDR.find({})
    return res.json(records);
}

// Returns the number of IPDR records each month
let getStatistics = async(req, res) => {
    // Getting the current year
    let currentDate = new Date(Date.now())
    let currentYear = currentDate.getFullYear()

    // Getting the number of records for each month
    let allRecords = await IPDR.find({})
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
        ipdrCounts : monthCounts,
        code : 200     
    })
}


// Checks if the call data record is valid 
let validateIPDRRecord = async(req, res, next) => {
    let ipdrRecord = req.body
    
    try{
        if(!ipdrRecord){
            return res.status(400).send({
                message : "No ipdr data received",
                code : 400
            })
        }

        // Validating all required fields
        let required_fields = ["privateIP", "privatePort", "publicIP", "publicPort", "destIP", "destPort", "phoneNumber", "startTime", "endTime", "uplinkVolume", "downlinkVolume", "totalVolume", "imei", "imsi", "originLatLong", "accessType"]
    
        // Checking whether fields exist
        for(let req_field of required_fields){
            if(!ipdrRecord.hasOwnProperty(req_field)){
                let error_msg = "Didn't receive the property " + req_field
                return res.json({
                    message : error_msg,
                    code : 400
                })
            }
        } 
        
        req.locals.record = ipdrRecord
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
let getIPDRRecordsgivenNumber = async (req, res) => {
    // Get the specific user id
    let phoneNumber = req.body.phoneNumber
    if(!phoneNumber){
        return res.json({
            message : "No phone number received",
            code : 200
        })
    }

    let IPDetails = await IPDR.find({phoneNumber : phoneNumber});

    return res.json({
        message : IPDetails,
        code : 200
    });
}

// Adds the new call data record
let addIPDRRecord = async(req, res) => {
    let IPRecord = req.locals.record
    let startTime = new Date(IPRecord.startTime)
    IPRecord.startTime = startTime
    let endTime = new Date(IPRecord.endTime)
    IPRecord.endTime = endTime
    IPDR.findOneAndUpdate(IPRecord, IPRecord, {upsert: true}, function() {

    })
    return res.json({
        message : "Record successfully added",
        code : 201
    });
}

// Get all records within a given time duration and location range
let getIPDRRecords = async(req, res) => {
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
    let records = await IPDR.find({startTime : {$gte : startTimeReq, $lte : endTimeReq}})

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

let getIPDRLatLong = async (req, res) => {
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

let getIPDRLocationsList = async (req, res) => {
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
    validateIPDRRecord : validateIPDRRecord,
    getAllIPDRRecords : getAllIPDRRecords,
    getIPDRRecordsgivenNumber : getIPDRRecordsgivenNumber,
    addIPDRRecord : addIPDRRecord,
    getIPDRRecords : getIPDRRecords,
    getIPDRLocationsList: getIPDRLocationsList,
    getIPDRLatLong: getIPDRLatLong,
    getStatistics : getStatistics
}
