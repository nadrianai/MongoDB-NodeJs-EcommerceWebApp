const express =  require("express")
const router = express.Router()


const {authCheck, adminCheck} = require("../middlewares/auth")
const {currentUser} = require("../controllers/auth")

const { create, 
        listAll, 
        remove, 
        read, 
        update , 
        list,
        productsCount,
        productStar,
        listRelated,
        searchFilters
    } = require('../controllers/product')

router.post("/product",authCheck, adminCheck, create)
router.get("/products/:count", listAll)
router.delete('/products/:slug', authCheck, adminCheck, remove)
router.get('/product/read/:slug', read)
router.put('/product/:slug', authCheck, adminCheck, update)
router.post('/products/', list) 
router.get('/products/total/number', productsCount)
//rating
router.put('/product/star/:productId', authCheck, productStar)
//related
router.get('/product/related/:productId', listRelated)
//search
router.post('/search/filters', searchFilters)



module.exports =  router