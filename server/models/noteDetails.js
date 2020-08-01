const mongoose = require("mongoose")
const Schema = mongoose.Schema
const Model = mongoose.model

const noteDetails = Schema({
    // Source Number - 10 digit number
    srcNumber : {type : String, required : true, index : true, minLength : 10, maxLength : 10},

    // Destination number - 10 digit number
    destNumber : {type : String, required : true, index : true, minLength : 10, maxLength : 10},

    // Notes
    notes : [String], 
});

module.exports = {
    Notes : Model('notes', noteDetails)
}
