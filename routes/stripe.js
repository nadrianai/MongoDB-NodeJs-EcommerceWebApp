const express =  require("express")
const router = express.Router()

const {createPaymentIntent, paymentMethod} = require('../controllers/stripe')
const {authCheck, adminCheck} = require("../middlewares/auth")

//middleware

router.post("/create-payment-intent",authCheck, createPaymentIntent)

module.exports =  router