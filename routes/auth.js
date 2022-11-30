const express =  require("express")
const router = express.Router()
//middlewares
const {authCheck, adminCheck} = require("../middlewares/auth")

//controlers
const {createOrUpdateUser} = require("../controllers/auth")
const {getCurrentUser} = require("../controllers/auth")


router.post("/create-or-update-user",authCheck, createOrUpdateUser)
router.post("/current-user",authCheck, getCurrentUser)
router.post("/current-admin" , authCheck,adminCheck, getCurrentUser)



module.exports =  router