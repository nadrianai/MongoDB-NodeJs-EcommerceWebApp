const Sub = require('../models/sub')
const slugify = require('slugify')
const Product = require('../models/product')


exports.create = async (req,res) =>{
    try {
        const {name} = req.body
        const {parent} = req.body

        const sub = await new Sub({name, parent, slug: slugify(name)}).save()
        res.json(sub)  
    }catch (err) {
        // console.log(err)
        res.status(400).send('Subcategory create failed')
    }
}

exports.list = async (req,res) =>{
    res.json( await Sub.find({}).sort({createdAt: -1}).exec())
}

exports.read = async (req,res) =>{
    let sub =  await Sub.findOne({
        slug:req.params.slug
    }).exec()
    let products  =  await Product.find({subs: sub})
        .exec()
    res.json({
        sub,
        products
    } )
}

exports.readById = async (req,res) =>{
    Sub.findById(req.params.id, (err, s) => {
        if(err){
            console.log(err)
        }else{
            res.json(s.name)
        }
    })
}

exports.remove = async (req,res) =>{
    try{
        const deleted = await Sub.findOneAndDelete({slug:req.params.slug})
        res.json(deleted)
    }catch(err){
        res.status(400).send("Create delete failed")
    }
}

exports.update = async (req,res) =>{
    const {name} = req.body
    try{
        const updated =  await Sub.findOneAndUpdate({
            slug:req.params.slug
        }, {
            name, slug:slugify(name)
        }, {
            new:true
        })
        res.json(updated)
    }catch(err){
        res.status(400).send("Subcategory update failed")
    }
}

