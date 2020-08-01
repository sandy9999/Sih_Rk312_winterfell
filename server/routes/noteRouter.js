const express = require("express")
const noteController = require("./../controllers/note.controller")
const noteRouter = express.Router()

// Route to add new notes
noteRouter.post('/addNote',
    noteController.validateNote, 
    noteController.addNote
)

// Route to get all notes
noteRouter.get('/getAllNotes',
    noteController.getAllNotes
)

// Route to get notes for an edge
noteRouter.post('/getEdgeNotes',
    noteController.getEdgeNotes
)

// Route to delete a note
// noteRouter.post('/deleteNote',
//     noteController.deleteNote
// )

module.exports = {
    noteRouter : noteRouter
}
