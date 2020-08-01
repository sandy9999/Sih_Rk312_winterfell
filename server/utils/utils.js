const jwt = require("jsonwebtoken")
const multer = require('multer')

let initializeLocal = async (req, res, next) => {
    if (!req.locals) {
        req.locals = {}
    }
    next();
}

function generateRandomString() {
    let str = Math.random().toString(33).substr(2, 10)
    return str
}

let createSession = async (req, res, next) => {
    const claim = JSON.stringify(req.locals.phoneNumber)
    const str = generateRandomString()
    let jwt_token = jwt.sign(claim, str)
    req.locals.session = jwt_token
    return next()
}

// Helper function to create an error with a custom image
let CustomError = class CustomerError extends Error {
    constructor(...params) {
        super(...params)
    }
}

let isEmpty = (obj) => {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

let degreeToRadians = (deg) => {
    return (deg / 180) * Math.PI
}

let calculateDistance = (lat1, long1, lat2, long2) => {
    lat1 = degreeToRadians(lat1)
    long1 = degreeToRadians(long1)
    lat2 = degreeToRadians(lat2)
    long2 = degreeToRadians(long2)

    let dlong = long2 - long1
    let dlat = lat2 - lat1
    let ans = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlong / 2), 2)
    ans = 2 * Math.asin(Math.sqrt(ans))
    const R = 6371
    ans *= R
    return ans 
}

module.exports = {
    initializeLocal: initializeLocal,
    createSession: createSession,
    CustomError: CustomError,
    isEmpty: isEmpty,
    degreeToRadians : degreeToRadians,
    calculateDistance : calculateDistance
    
}
