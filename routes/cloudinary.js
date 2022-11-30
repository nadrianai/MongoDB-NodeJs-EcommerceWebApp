const express =  require('express')
const router =  express.Router()

const {authCheck, adminCheck} = require("../middlewares/auth")
const {remove, upload} = require('../controllers/cloudinary')

router.post('/uploadimages', authCheck, adminCheck, upload)
router.post('/removeimages', authCheck, adminCheck, remove)

module.exports =  router