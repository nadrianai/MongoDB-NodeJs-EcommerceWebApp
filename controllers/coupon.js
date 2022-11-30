const Coupon = require('../models/coupon')

//create/ remove/ list

exports.create =  async (req,res) =>{
    // console.log(req.body)
    try {
        const {name, expiry, discount} = req.body.coupon
        res.json(await new Coupon({name, expiry, discount}).save())
    }catch(err){
        console.log(err)
    }
}

exports.remove =  async (req,res) =>{
    try {
        let couponId = req.params.couponId
        let coupon = await Coupon.findByIdAndRemove(couponId).exec()
        res.json(coupon)

    }catch(err){
        console.log(err)
    }
}

exports.list =  async (req,res) =>{
    try {
        res.json(await Coupon.find({}).sort({createdAt: -1}).exec())

    }catch(err){
        console.log(err)
    }
}