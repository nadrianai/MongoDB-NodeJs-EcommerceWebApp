const express =  require("express")
const router = express.Router()


const {authCheck, adminCheck} = require("../middlewares/auth")
const {currentUser} = require("../controllers/auth")

const { 
    create,
    read, 
    update, 
    remove, 
    list, 
    readById} = require('../controllers/sub')

router.post("/sub",authCheck, adminCheck, create)
router.get("/subs", list)
router.get("/sub/:slug", read)
router.get("/subs/:id", readById)
router.put("/sub/:slug",authCheck, adminCheck, update)
router.delete("/sub/:slug",authCheck, adminCheck, remove)






module.exports =  router