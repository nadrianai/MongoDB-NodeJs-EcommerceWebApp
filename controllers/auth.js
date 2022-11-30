const User = require('../models/user')

module.exports.createOrUpdateUser = async(req,res) =>{
    const { email} = req.user
    const role = "admin"
    const name = email.split('@')[0]

    const user = await User.findOneAndUpdate(
        {email},
        {name},
        {new:true}
    )
    if(user === null){
        const newUser  =  await new User({
            email, name , role
        })
        newUser.save()
        console.log(newUser)
        res.json(newUser)

    }else{
        res.json(user)
    }
}

module.exports.getCurrentUser = async (req,res) =>{
    User.findOne({
        email:req.user.email
    }).exec((err,user)=>{
        if (err){
            console.log(err)
        }
        else{
            // const logUSer ={
            //     "_id":user._id,
            //     "email":user.email,
            //     "name":user.name,
            //     "role":user.role,
            //     "cart":user.cart,
            //     "createdAt":user.createdAt,
            //     "updatedAt":user.updatedAt
            // }
            res.json(user)        
        }
    })
}

