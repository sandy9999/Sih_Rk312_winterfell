const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Model = mongoose.model

const profileDetails = Schema({


    // Phone number - 10 digit number
    phoneNumber : {type : String, required : true, unique : true, index : true, minLength : 10, maxLength : 10},

    // Other phone numbers linked to this same person
    associatedPhoneNumbers: [String],

    // IMEI
    imei : {type : String, required : true, maxLength : 15, minLength : 15},

    // Other IMEIs linked to this same person
    associatedImeis: [String],
    
    // IMSI
    imsi : {type : String, required : true, maxLength : 15, minLength : 15},

    // Name
    name : {type : String, index : true}, 

    // Age
    age : {type : Number},

    // Email
    email : String,
    
    // Aadhar Number 
    aadharNumber : {type : String},
    
    // Company
    company : String,

    // Address
    address : String,

    // Remarks
    remarks : String
});

module.exports = {
    Profile : Model('profileDetails', profileDetails)
}
