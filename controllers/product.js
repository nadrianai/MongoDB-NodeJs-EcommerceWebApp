const Product = require('../models/product')
const User = require('../models/user')

const slugify = require('slugify')
const { aggregate } = require('../models/sub')

exports.create = async (req,res) =>{
    try{
        const {title, description, price, quantity, shipping, color, brand, category, images, ratings, subs} = req.body
        const slug = slugify(req.body.title)
        const product = await new Product({title, price, slug, description, quantity, shipping, color, brand, category, images, ratings, subs}).save()
        res.json(product)
    }catch(err){
        console.log(err)
        // res.status(400).send("Create product failed!")
        res.status(400).json({
            err:err.message
        })
    }
}

exports.listAll =  async (req,res) =>{
    const products = await Product.find({})
    .limit(100)
    .populate("category")
    .populate("subs")
    .sort([['createdAt', 'desc']])
    .exec()

    res.json( 
        products
    )

}

exports.remove = async (req,res) => {
    try{
        const deleted = await Product.findOneAndRemove({
            slug:req.params.slug
        }).exec()
        res.json(deleted)
    }catch(err){
        console.log(err)
        return res.status(400).send('Product deleted failed!')
    }
}

exports.read = async (req,res) =>{
    const product = await Product.findOne(
        {slug:req.params.slug}
    )
    // .populate("category")
    // .populate("subs")
    .exec()
    res.json(product)
}

exports.update =  async(req,res) =>{
    try{
        // req.body.slug = slugify(req.body.title)
        const updated = await Product.findOneAndUpdate({
            slug:req.body.slug
        }, 
        req.body, 
        {new: true}).exec()

        res.json(updated)
    }catch(err){
        console.log(err)
        return res.status(400).send("Product update failed!")
    }

}

// exports.list = async(req, res) =>{
//     try{
//         const {sort, order, limit} = req.body
//         const product = await Product.find({

//         })
//         .sort([[sort, order]])
//         .limit(limit)
//         .exec()
//         res.json(product)
//     }catch(err){
//         console.log(err)
//     }
// }

//with pagination
exports.list = async(req, res) =>{
    try{
        const {sort, order, page} = req.body
        const currentPage = page || 1
        const perPage = 3

        const product = await Product.find({

        })
        .skip((currentPage - 1) * perPage)
        .sort([[sort, order]])
        .limit(perPage)
        .exec()
        res.json(product)
    }catch(err){
        console.log(err)
    }
}


exports.productsCount = async (req, res ) => {
    let total = await Product.find({}).estimatedDocumentCount().exec()
    res.json(total)
}

exports.productStar = async (req,res) =>{
    let product =  await Product.findById({
        _id:req.params.productId
    }).exec()
    const user = await User.findOne({email:req.user.email}).exec()
    const star = req.body.star
    // res.json(product)


    //who is updating?
    //check if currently logged in user has already added rating to this product?
    let existingRatingObject = product.ratings.find(
        (ele)=>ele.postedBy.toString() === user._id.toString()
        )
    // console.log(existingRatingObject)
//if user hasn't left rating yet, push it
        if(existingRatingObject === undefined) {
            let ratingAdded = await Product.findByIdAndUpdate(product._id,
                {
                    $push:{
                        ratings: { star:star, postedBy: user._id}
                    }
                }, {new:true}).exec()
            console.log(star)
                console.log(ratingAdded)
                res.json(ratingAdded)
        }else{
            const ratingUpdated = await Product.updateOne(
                {
                    ratings: { 
                        $elemMatch: existingRatingObject
                    }

                },
                {$set: {"ratings.$.star": star}},
                {new:true}
            ).exec()
            const ratingUpdated_ = await Product.findById({
                _id:product._id,
            }).exec()
            console.log(ratingUpdated_)
            res.json(ratingUpdated_)
        }
//if user has left rating, update it

}

exports.listRelated =  async (req,res) =>{
    const product =  await Product.findById(req.params.productId).exec()
    const related = await Product.find({
        _id: {$ne: product._id},
        category: product.category
    }).limit(6)
    .populate('category')
    .populate('subs')
    // .populate('postedBy')
    // .populate('subs')
    // .populate('subs')

        res.json(related)

}

const handleQuery = async(req,res,query) =>{
    const products = await Product.find({$text: {$search: query}})
    .exec()        
    res.json(products)
}
const handlePrice = async(req,res,price) =>{
    try {
        let products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1]
            }
        }).exec()
        res.json(products)
    }
    catch(err){
        console.log(err)
    }
}
const handleCategory = async(req,res, category) =>{
    try{
        let products = await Product.find({category}).exec()
        res.json(products)
    }catch(err){
        console.log(err)
    }
}

const handleStar = (req,res, stars) =>{
    Product.aggregate([
        {
            $project:{
                document: "$$ROOT", //method that gives acces to the entire project
                floorAverage: {
                    $floor: {
                        $avg: "$ratings.star"
                    }
                }
            }
        }, 
        {$match: {floorAverage: stars}}
    ])
    .limit(12)
    .exec((err, aggregates) =>{
        if(err){
            console.log(err)
        }else{
            Product.find({_id:aggregates}).exec((err, prods) =>{
                if(err){
                    console.log(err)
                }else{
                    res.json(prods)
                }
            })
        }
    })
}


handleSub = async(req, res, sub) =>{
    const products = await Product.find({subs:sub}).exec()
    res.json(products)
}

handleShipping =  async (req, res, shipping) =>{
    const products =  await Product.find({shipping}).exec()
    res.json(products)
}
handleColor=  async (req, res, color) =>{
    const products =  await Product.find({color}).exec()
    res.json(products)
}
handleBrand =  async (req, res, brand) =>{
    const products =  await Product.find({brand}).exec()
    res.json(products)
}

//search//filters
exports.searchFilters = async (req,res) =>{
    const {query, price, category, stars, sub, shipping, brand, color} = req.body

    if(query) {
        console.log(query)
        await handleQuery(req,res,query)
    }
    //price [20,200]
    if(price !== undefined) {
        console.log(price)
        await handlePrice(req,res,price)
    }
    //category
    if(category){
        console.log(category)
        await handleCategory(req,res,category)
    }
    //rating
    if(stars){
        console.log(stars)
        await handleStar(req,res,stars)
    }
    //subs
    if(sub){
        console.log(sub)
        await handleSub(req,res,sub)
    }
    //shipping
    if(shipping){
        console.log(shipping)
        await handleShipping(req,res,shipping)
    }
    //brand
    if(brand){
        console.log(brand)
        await handleBrand(req,res,brand)
    }
    //color
    if(color){
        console.log(color)
        await handleColor(req,res,color)
    }
} 