const admin =  require('../firebase')
const User = require('../models/user')

//verify firebase token
exports.authCheck = async(req, res, next) =>{
  try {
     const firebaseUser = await admin.auth().verifyIdToken(req.headers.authoken)
     req.user  = firebaseUser
     next()
  } catch (error) {
        console.log(error)
        res.status(401).json({
            err:"Invalid or expired token"
        })
  }
}

//check for the user and make sure user has the role of admin
exports.adminCheck =  async (req,res,next) =>{
  const adminUser = await User.findOne({        
    email:req.user.email
  }).exec()
  if(adminUser.role !== "admin"){
    res.status(403).json({
      err:"Admin resource.Access denied."
    })
  }else{
    next()
  }
}

