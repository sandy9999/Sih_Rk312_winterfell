const env = require("./../utils/env")

let backendTest = async (req, res) => {
    console.log("The backend is up");
    res.send("The backend is up on port : " + env.port);
}

let logServerDetails = async(req, res) => {
    res.status(200).send(env)
}

module.exports = {
    backendTest : backendTest,
    logServerDetails : logServerDetails
}
