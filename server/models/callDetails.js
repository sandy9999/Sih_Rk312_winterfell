const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Model = mongoose.model

const callDataRecords = Schema({
    // Caller number - 10 digit number
    callerNumber : {type : String, required : true, index : true, minLength : 10, maxLength : 10},

    // Called party number - 10 digit number
    calledNumber : {type : String, required : true, minLength : 10, maxLength : 10},

    // Caller name - Optional
    callerName : {type : String, index : true}, 

    // Call start time
    startTime : {type : Date, required : true, default : Date.now},

    // Call end time
    endTime : {type : Date, required : true, default : Date.now},
    
    // Call Duration 
    callDuration : {type : Number, required : true},
    
    // Position where call was initiated
    originLatLong : {
        type : {
            lat : Schema.Decimal128,
            long : Schema.Decimal128    
        },
        required: true
    },
    
    // Position where call was terminated
    destLatLong : {
        type : {
            lat : Schema.Decimal128,
            long : Schema.Decimal128    
        },
        required : true
    },

    // Call type
    callType : {
        type : String,
        enum : ['CALL-IN', 'CALL-OUT', 'SMS-IN', 'SMS-OUT'], 
        required : true
    },
    
    // IMEI
    imei : {type : String, required : true, maxLength : 15, minLength : 15},
    
    // IMSI
    imsi : {type : String, required : true, maxLength : 15, minLength : 15},
    
    // Connection type
    connectionType : {type : String},
    
    // Access type
    accessType : {
        type : String, 
        enum : ['2G', '3G', '4G']
    },
});

module.exports = {
    CDR : Model('callDataRecords', callDataRecords)
}
