var express = require('express');
var router = express.Router();
const cotrol = require('../controller/news-controller');

router.post('/addNews',cotrol.addnews) //done
router.get('/',cotrol.getAll); //done
router.get('/:newsID', cotrol.getallbyID); //done 
router.delete('/:newsId', cotrol.deleteNews); //done














module.exports = router;
