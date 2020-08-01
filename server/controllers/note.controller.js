const {CustomError} = require("../utils/utils")
const {Notes} = require("./../models/noteDetails")

// Validates note
let validateNote = async(req, res, next) => {
    let required_fields = ["numbers", "note"]
    let note = req.body
    for(let req_field of required_fields){
        if(!note.hasOwnProperty(req_field)){
            return res.json({
                message : "Didn't receive property " + req_field,
                code : 400
            })
        }
    }

    let numbers = note.numbers
    if(numbers.length != 2){
        return res.json({
            message : "Require only 2 numbers for a edge. Received " + numbers.length + " numbers",
            code : 400
        })
    }
    next()
}

// Adds note
let addNote =  async(req, res) => {
    let numbers = req.body.numbers
    let newNote = req.body.note
    
    try{
        // Sorting the numbers so that the lexicographically smaller number is srcNumber always
        numbers.sort()
        
        // Checking if existing notes exist
        let note = await Notes.findOne({srcNumber : numbers[0], destNumber : numbers[1]})
        
        if(!note){
            // Creating a new entry in note table with newNotes as the only note
            note = new Notes({
                srcNumber : numbers[0],
                destNumber : numbers[1],
                notes : [newNote]
            })
        }else{
            // Adding new note to existing notes
            let aggregatedNotes = note.notes
            aggregatedNotes.push(newNote)
            note.notes = aggregatedNotes
        }

        await note.save()
        return res.json({
            message : "Added note successfully",
            code : 201
        })    
    }catch(err){
        return res.json({
            message : err,
            code : 500
        })
    }
}

// Deletes notes
// let deleteNote = async(req, res) => {

// }

// Returns all notes
let getAllNotes = async(req, res) => {
    let notes = await Notes.find({})
    return res.json({
        message : notes,
        code : 200
    })
}

// Returns notes between callerNumber and calledNumber
let getEdgeNotes = async(req, res) => {
    let numbers = req.body.numbers
    if(!numbers){
        return res.json({
            message : "No numbers received for fetching notes",
            code : 400
        })
    }else if(numbers.length != 2){
        return res.json({
            message : "Only notes between 2 numbers can be found. Received " + numbers.length + " numbers",
            code : 400
        })
    }

    // Sorting the numbers so that the lexicographically smaller number is first always
    numbers.sort()    
    let notes = await Notes.findOne({srcNumber : numbers[0], destNumber : numbers[1]})
    return res.json({
        message : notes,
        code : 200
    })
}

module.exports = {
    getAllNotes : getAllNotes, 
    getEdgeNotes : getEdgeNotes,
    addNote : addNote,
    validateNote : validateNote
    // deleteNote : deleteNote,
}
