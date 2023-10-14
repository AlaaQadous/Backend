const News =require('../models/news');
const multer = require('multer');

/////////////////addnews
const filefilter = function (req, file, cb) {
    if (file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(new Error('please upload jpeg file'), false)
    }
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './newsImage/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toDateString() + file.originalname);
    },

});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: filefilter,
});
const uploadMiddleware = upload.single('myfile');
const addnews = function (req, res, next) {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            // Handle multer error (e.g., file type not allowed, file size exceeded)
            return res.status(400).json({
                 message: 'File upload error', error: err.message 
                });
        }

        // Continue processing the request
        console.log(req.file);
        const news = new News({
            description: req.body.description,
            price :req.body.price,
            image: req.file.path,
        });

        news.save()
            .then(doc => {
                res.status(200).json({
                    message: 'News created successfully',
                    news: doc
                });
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({
                    message: 'Internal Server Error',
                });
            });
    });
};
///////////////////view all 
getAll = function (req, res, next) {
    News.find().
        select('_id description  price image ').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        price: doc.price,
                        image: doc.image,
                        _id: doc._id,
                        url: {
                            type: 'GET',
                            urls: 'localhost:3000/news/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json({
                news: response
            })
        }).
        catch(err => {
            res.status(404).json({
                message: err
            })
        })

};
///////////view by ID
getallbyID = function (req, res, next) {
    News.find({ _id: req.params.newsID })
        .then(doc => {
            if (doc && doc.length > 0) {
                res.status(200).json({
                   news: doc
                });
            } else {
                res.status(404).json({
                    message: 'News not found'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal Server Error',
                error: err
            });
        });
};
//////////////delete
deleteNews = function (req, res, next) {
    News.deleteOne({ _id: req.params.newsId })
        .then(result => {
            if (result.deletedCount > 0) {
                res.status(200).json({
                    message: 'News deleted successfully',
                });
            } else {
                res.status(404).json({
                    message: 'News not found',
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                message: 'Internal Server Error',
                error: err,
            });
        });
};

module.exports = {
    addnews:addnews,
    getAll : getAll ,
    getallbyID: getallbyID ,
    deleteNews: deleteNews,
};