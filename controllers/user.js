const User  = require('../models/user')
const Product  = require('../models/product')
const Cart  = require('../models/cart')
const Coupon  = require('../models/coupon')
const Order  = require('../models/order')


exports.userCart = async (req, res) =>{
    const {cart} = req.body
    let products= []
    const user = await User.find({email:req.user.email}).exec()
    //check if cart  with logged in user id already exists
    let cartExistByThisUser = await Cart.findOne({orderBy: user[0]._id}).exec()
    if(cartExistByThisUser){
        cartExistByThisUser.remove()
    }
    // res.json(cartExistByThisUser)

    for (let i=0; i< cart.length; i++){
        let object = {}
        object.product = cart[i]._id
        object.count = cart[i].count
        object.color = cart[i].color
        object.title = cart[i].title
        
        



        let {price} = await Product.findById(cart[i]._id).select("price").exec()
        object.price = price

        products.push(object)

    }

    console.log(products)
    let cartTotal = 0

    for(i=0; i < products.length; i++){
        cartTotal =  cartTotal + products[i].price * products[i].count

    }
    console.log(cartTotal)
    let newCart = await new Cart({
        products,
        cartTotal, 
        orderBy: user[0]._id
    }).save()

    res.json({"ok":true})

}


exports.getUserCart = async  (req,res) =>{
    const user =  await User.findOne({email: req.user.email}).exec()

    let cart = await Cart.findOne({orderBy: user._id}).exec()

    if(cart){
        const {products, cartTotal, totalAfterDiscount} = cart
        res.json({
            products, cartTotal, totalAfterDiscount
        })
    }
    


}

exports.emptyCart = async  (req,res) =>{
   const user = await User.findOne({email: req.user.email}).exec()
   const cart = await Cart.findOneAndRemove({orderBy: user._id}).exec()
    res.json(cart)


}

exports.saveAddress = async  (req,res) =>{
    const user = await User.findOneAndUpdate(
        {email: req.user.email}, 
        {address: req.body.address}
        ).exec()
     res.json({"ok": true})
 }

 exports.applyCouponToUSerCart = async (req, res) =>{
    const {coupon} = req.body
    console.log(coupon)

    const validCoupon = await Coupon.findOne({name:coupon }).exec()
    if(validCoupon === null){
        return res.json({
            err: 'Invalid Coupon!'
        })
    }   
    console.log(validCoupon)
    const user = await User.findOne({email: req.user.email}).exec()
    let  {products, cartTotal} = await Cart.findOne({orderBy: user._id}).exec()
    console.log(cartTotal, validCoupon.discount)
    
    //total after discount 

    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/ 100).toFixed(2)
    Cart.findOneAndUpdate({
        orderBy:user._id
    },
    {
        totalAfterDiscount:totalAfterDiscount
    }, {
        new:true
    }).exec()

    res.json(totalAfterDiscount)

 }

 exports.createOrder = async (req, res) =>{
    const {paymentIntent} = req.body.stripeResponse
    const user = await User.findOne({email: req.user.email}).exec()

    let {products} = await Cart.findOne({orderBy: user._id}).exec()
    let newOrder = await Order({
        products,
        paymentIntent, 
        orderBy:user._id
    }).save()

    //decrement quantity, increment sold 
    let bulkOption = products.map((item, index)=>{
        return {
            updateOne:{
                filter: {_id: item.product._id}, //Important item.product
                update:{ $inc: {quantity: - item.count/2, sold: +item.count}}
            }
        }
    })

    let updated =  await Product.bulkWrite(bulkOption, {})

    res.json({ok: true})

 }

 exports.orders = async (req, res) =>{
    let user =  await User.findOne({email: req.user.email}).exec()
    let userOrders =  await Order.find({orderBy: user._id}).exec()

    res.json(userOrders)

 }

 exports.addToWishlist = async (req, res) =>{
    const {productId} = req.body
    const user = await User.findOneAndUpdate({email: req.user.email}, {
        $addToSet:{
            wishlist: productId
        },
    },
    {new:true})
    .exec()
    res.json({ok:true})
 }

 exports.wishlist = async (req, res) =>{
    const list = await User.findOne({email:req.user.email})
    .select("wishlist")
    .populate("wishlist")
    .exec()
    res.json(list)
}

exports.removeFromWishlist = async (req, res) =>{
    const {productId} =req.params
    const user = await User.findOneAndUpdate({email: req.user.email}, 
        {$pull: {wishlist: productId}}
        ).exec()
    
    res.json({ok:true})

}