var express = require('express');
var router = express.Router();
const cotrol = require('../controller/news-controller');

//for Admin
router.post('/addNews',cotrol.addnews) //done
router.get('/',cotrol.getAll); //done
router.delete('/:newsId', cotrol.deleteNews); //done
router.patch('/update/:id',cotrol.updateNewsById); //done













module.exports = router;
