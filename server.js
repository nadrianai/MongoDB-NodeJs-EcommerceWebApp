const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const fs = require("fs")

//app
const app = express()

//db
mongoose
.connect(process.env.MONGODB_URI || process.env.DATABASE, {})
.then(() => console.log("DB connected"))
.catch((err) => console.log("DB Error => ", err));

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

//middleware
 app.use(morgan("dev"))
 app.use(bodyParser.json({limit: '50mb'}))
 app.use(cors(corsOptions))

 //port
 const port = process.env.PORT || 8000

 
const authRoutes =  require('./routes/auth')
const categoryRoutes =  require('./routes/category')
const userRoutes =  require('./routes/user')
const subRoutes =  require('./routes/sub')
const productRoutes =  require('./routes/product')
const cloudinary =  require('./routes/cloudinary')
const couponRoutes =  require('./routes/coupon')
const stripeRoutes =  require('./routes/stripe')
const adminRoutes =  require('./routes/admin')




app.use('/api', authRoutes)
app.use('/api', categoryRoutes)
app.use('/api', userRoutes)
app.use('/api', productRoutes)
app.use('/api', subRoutes)
app.use('/api', cloudinary)
app.use('/api', stripeRoutes)
app.use('/api', couponRoutes)
app.use('/api', adminRoutes)


if(process.env.NODE_ENV === 'production') {
   app.use(express.static('client/build'))
}

 app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
 })