const express = require("express")
const profileController = require("./../controllers/profile.controller")
const profileRouter = express.Router()

// Get all the profile data
profileRouter.get('/getAllProfiles',
    profileController.getAllProfiles
)

// Adding profile data
profileRouter.post('/addProfile',
    profileController.validateProfile,
    profileController.addProfile
)

// Get profile data
profileRouter.post('/getProfile',
    profileController.getProfile
)

// Getting search results
profileRouter.post('/getSearchResults',
	profileController.getSearchResults
)

profileRouter.post('/getUserDetails',
	profileController.getUserDetails
)

module.exports = {
    profileRouter : profileRouter
}
