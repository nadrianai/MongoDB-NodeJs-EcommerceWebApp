const Cart = require('../models/cart')
const slugify = require('slugify')
const User =  require('../models/user')
const Product = require('../models/product')
const Coupon = require('../models/coupon')
const stripe = require('stripe')(process.env.STRIPE_SECRET)

exports.createPaymentIntent = async (req,res) =>{
    //later apply coupon 
    //later calculate price 
    let couponApplied = req.body.couponApplied
    
    //1 find user
    const user  = await User.findOne({email: req.user.email}).exec()

    //2 get user cart total
    const cart = await Cart.findOne({orderBy: user._id}).exec()
    if(cart){
        const {cartTotal, totalAfterDiscount} = cart
        //console.log(cartTotal, totalAfterDiscount)

    let finalAmount = 0
    if(couponApplied && totalAfterDiscount) {
         finalAmount = Math.round(totalAfterDiscount) * 100
    }else{
        finalAmount = Math.round(cartTotal) * 100
    }
    //3 create payment intent with correct amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount:finalAmount, 
        currency: 'usd', 
    })

    res.send({
        clientSecret: paymentIntent.client_secret, 
        cartTotal,
        totalAfterDiscount, 
        payable: finalAmount
    })
    }
    

    //console.log("Cart total charged", cartTotal)
    //console.log(req.body.couponApplied)
}

