const {Profile} = require("../models/profileDetails")
const {CDR} = require("../models/callDetails")
const {IPDR} = require("../models/ipDetails")
const {Notes} = require("../models/noteDetails")
// Validate profile data
let validateProfile = async(req, res, next) => {
    let profileData = req.body
    let required_fields = ["phoneNumber"]
    for(let req_field of required_fields){
        if(!profileData.hasOwnProperty(req_field)){
            return res.json({
                message : "Didn't receive required property " + req_field,
                code : 200
            })
        }
    }
    next()
}

// Add profile data
let addProfile = async(req, res) => {
    let profileData = req.body   
    try{

        data = profileData
        await Profile.findOneAndUpdate({phoneNumber: data.phoneNumber}, data, {upsert: true}, function() {
            
        })

        return res.json({
            message : "Successfully added profile details",
            code : 200
        })
    }catch(err){
        return res.json({
            message : err,
            code : 500
        })
    }
}

// Get all profile data
let getAllProfiles = async(req, res) => {
    let profiles = await Profile.find({})
    return res.json({
        message : profiles,
        code : 200
    })
}

// Get a specific phone number's profile data
let getProfile = async(req, res) => {
    let phoneNumber = req.body.phoneNumber
    if(!phoneNumber){
        return res.json({
            message : "No phone number received (phoneNumber)",
            code : 400
        })
    }

    let profileData = await Profile.find({phoneNumber : phoneNumber})
    return res.json({
        message : profileData,
        code : 200
    })
}

// Getting all relavent results for any search
let getSearchResults = async(req, res) => {
    let searchText = req.body.searchText

    if(!searchText){
        return res.json({
            message : "Didn't recieve the property searchText",
            code : 400
        })
    }

    // Getting all records
    let phoneRecords = await Profile.find({phoneNumber : searchText})
    let nameRecords  = await Profile.find({name : searchText})
    let aadharRecords = await Profile.find({aadharNumber : searchText})
    let imeiRecords = await Profile.find({imei : searchText})
    let imsiRecords = await Profile.find({imsi : searchText})
    let emailRecords = await Profile.find({email : searchText})
    let allRecordsList = [phoneRecords, nameRecords, aadharRecords, imeiRecords, imsiRecords, emailRecords]

    // Concatenating all the records while removing duplicates
    let allRecords = new Set()
    for(let recordSet of allRecordsList){
        for(let record of recordSet){
            allRecords.add(record)
        }
    }

    let uniqueRecords = Array.from(allRecords)
    return res.json({
        profiles : uniqueRecords,
        code : 200
    })
}

// Getting a user's relavent details
let getUserDetails = async(req, res) => {
    let phoneNumber = req.body.number
    if(!phoneNumber){
        return res.json({
            message : "Didn't receive property number",
            code : 400
        })
    } 

    // Getting all user details
    let profileData = await Profile.findOne({phoneNumber : phoneNumber})

    // Getting all call records of the person
    let outgoingCallRecords = await CDR.find({callerNumber : phoneNumber})
    let incomingCallRecords = await CDR.find({calledNumber : phoneNumber})
    let allCallRecords = outgoingCallRecords.concat(outgoingCallRecords)

    // Getting all ipdr records
    let ipdrRecords = await IPDR.find({phoneNumber : phoneNumber})

    // Getting top 5 callers people
    let callCounts = {}
    for(let record of outgoingCallRecords){
        let calledNumber = record.calledNumber
        if(!callCounts[calledNumber]){
            callCounts[calledNumber] = 0
        }
        callCounts[calledNumber] += 1
    }

    // Converting object to a list
    let callerCounts = []
    for(let caller in callCounts){
        callerCounts.push({caller : caller, numCalls : callCounts[caller]})
    }

    // Sorting the calls by maximum number of counts
    callerCounts.sort((a, b) => {
        if(a.numCalls < b.numCalls){
            return 1;
        }else if(a.numCalls > b.numCalls){
            return -1;
        }
        return 0
    })

    // Getting all notes written about this person
    let notes1 = await Notes.find({srcNumber : phoneNumber})
    let notes2 = await Notes.find({destNumber : phoneNumber})
    let allNotes = notes1.concat(notes2)

    return res.json({
        profileData  : profileData,
        cdrRecords   : allCallRecords,
        ipdrRecords  : ipdrRecords,
        topCallers : callerCounts.slice(0, 5),
        notes : allNotes,
        code : 200 
    })
}

// Updating a user's records
let updateUserDetails = async(req, res) => {
    let phoneNumber = req.body.refNumber
    if(!phoneNumber){
        return res.json({
            message : "Didn't receive property refNumber",
            code : 400
        })
    }

    let updateFields = JSON.parse(JSON.stringify(req.body))
    delete updateFields.refNumber

    let profileFields = ["name", "imei", "imsi", "email", "phoneNumber", "associatedPhoneNumbers", "associatedImeis", "age", "aadharNumber", "company","address","remarks"]
    for(let field in updateFields){
        if(!(profileFields.includes(field))){
            return res.json({
                message : "Property " + field + " doesn't exist in the profile schema",
                code : 400
            })
        }
    }

    console.log(updateFields)
    await Profile.findOneAndUpdate({phoneNumber : phoneNumber}, {$set : updateFields})
    return res.json({
        message : "Successfully updated the profile for number " + phoneNumber,
        code : 200
    })
}

module.exports = {
    validateProfile : validateProfile,
    addProfile : addProfile,
    getAllProfiles : getAllProfiles, 
    getProfile : getProfile,
    getSearchResults : getSearchResults,
    getUserDetails : getUserDetails,
    updateUserDetails : updateUserDetails
}
