var express = require('express');
var router = express.Router();
const cotrol = require('../controller/news-controller');
const {verifyAdmin}=require('../middleware/verifytoken.js');

//for Admin
router.post('/addNews', verifyAdmin,cotrol.addnews) //done
router.get('/', verifyAdmin,cotrol.getAll); //done
router.delete('/:newsId',verifyAdmin, cotrol.deleteNews); //done
router.patch('/update/:id', verifyAdmin,cotrol.updateNewsById); //done
router.patch('/update1/:id', verifyAdmin,cotrol.updateNewsById1); //done


router.get('/get',cotrol.getAll1); //done











module.exports = router;
