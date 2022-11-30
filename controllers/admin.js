const User  = require('../models/user')
const Product  = require('../models/product')
const Cart  = require('../models/cart')
const Coupon  = require('../models/coupon')
const Order  = require('../models/order')


exports.orders = async (req, res) =>{
    let allOrders = await Order.find({})
        .sort("-createdAt")
        .exec()
    res.json(allOrders)
}

exports.orderStatus = async (req, res) =>{
    const {orderId, orderStatus} = req.body
    let updated = await Order.findByIdAndUpdate(orderId, {orderStatus}, {new:true}).exec()

    res.json(updated)
}