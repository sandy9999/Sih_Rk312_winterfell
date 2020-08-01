const {Profile} = require("../models/profileDetails")

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

module.exports = {
    validateProfile : validateProfile,
    addProfile : addProfile,
    getAllProfiles : getAllProfiles, 
    getProfile : getProfile
}
