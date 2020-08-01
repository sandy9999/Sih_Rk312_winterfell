const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const app = express()
const env = require("./utils/env")
const {rootRouter} = require("./routes/rootRouter")
const {ipdrRouter} = require("./routes/ipdrRouter")
const {cdrRouter} = require("./routes/cdrRouter")
const {noteRouter} = require("./routes/noteRouter")
const {profileRouter} = require("./routes/profileRouter")
const cors = require('cors')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const {CDR} = require("./models/callDetails")
const {IPDR} = require("./models/ipDetails")
const {Profile} = require("./models/profileDetails.js")

// Connecting to the database
mongoose.connect(`mongodb://localhost:27017/${env.db_name}`, {useNewUrlParser: true});
const db = mongoose.connection
db.on("error", console.error.bind(console, "Connection error"))
db.once("open", () => {
    console.log("Successfully connected to the db")
})

app.use(cors())
// To support JSON encoded bodies urls
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended : true
}))

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
    cb(null, 'uploads')
},
filename: function (req, file, cb) {
    cb(null, Date.now() + '-' +file.originalname )
}
})

let upload = multer({ storage: storage }).single('file')


app.post('/cdr/uploadCSV', function(req, res) {
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
        row.originLatLong = {"lat":row.originLat, "long":row.originLong};
        row.destLatLong = {"lat":row.destLat, "long":row.destLong};
        delete row.originLat;
        delete row.originLong;
        delete row.destLat;
        delete row.destLong;
        
        let startTime = new Date(row.startTime)
        row.startTime = startTime
        let endTime = new Date(row.endTime)
        row.endTime = endTime
        
        data = row
        CDR.findOneAndUpdate(data, data, {upsert: true}, function() {

        })

    })
    .on('end', () => {
        console.log('CSV file successfully processed and records added');
    });
      return res.status(200).send(req.file)
    })

});

app.post('/profile/uploadProfileCSV', function(req, res) {
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
        
        data = row
        Profile.findOneAndUpdate({phoneNumber: data.phoneNumber}, data, {upsert: true}, function() {
            
        })
    })
    .on('end', () => {
        console.log('CSV file successfully processed and records added');
    });
      return res.status(200).send(req.file)
    })

});

app.post('/ipdr/uploadIPDRCSV', function(req, res) {
    upload(req, res, function (err) {
           if (err instanceof multer.MulterError) {
               return res.status(500).json(err)
           } else if (err) {
               return res.status(500).json(err)
           }
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
        row.originLatLong = {"lat":row.originLat, "long":row.originLong};
        delete row.originLat;
        delete row.originLong;
        
        let startTime = new Date(row.startTime)
        row.startTime = startTime
        let endTime = new Date(row.endTime)
        row.endTime = endTime
        
        data = row
        IPDR.findOneAndUpdate(data, data, {upsert: true}, function() {

        })

    })
    .on('end', () => {
        console.log('CSV file successfully processed and records added');
    });
      return res.status(200).send(req.file)
    })
});

// Connecting all routers
app.use('/', rootRouter);
app.use('/cdr', cdrRouter);
app.use('/ipdr', ipdrRouter);
app.use('/note', noteRouter);
app.use('/profile', profileRouter);

// Starting the server
app.listen(env.port, () => console.log(`Backend is running on port ${env.port}!`))
