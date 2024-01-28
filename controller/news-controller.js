const News =require('../models/news');
const multer = require('multer');
const { uploadImage } = require('../utils/cloudinary');
/////////////////addnews

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './newsImage/');
    },
    filename: function (req, file, cb) {
        cb(null,new Date().toDateString() + file.originalname);
    },

});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    },
});
const uploadMiddleware = upload.single('myfile');


const addnews = function (req, res, next) {
    uploadMiddleware(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: 'File upload error', error: err.message
            });
        }
        const imagepath = req.file.path;
        console.log('Image Path:', imagepath);
        const resultPromise = uploadImage(imagepath);
        console.log(resultPromise)
        resultPromise
            .then(result => {
                console.log(req.file);
                console.log(result);
                const news = new News({
                    description: req.body.description,
                    image: result.secure_url,
                });

                news.save()
                    .then(doc => {
                        console.log( "news"+news);
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
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({
                    message: 'Error uploading image',
                });
            });
    });
};
///////////////////view all 
getAll = function (req, res) {
    News.find().
        select('_id description image visible').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image:doc.image,
                        _id: doc._id,
                        visible: doc.visible,
                    }
                })
            }
            console.log(doc);
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
getAll1 = function (req, res, next) {
    News.find(
        {
            visible : true ,
        }
    ).
        select('_id description  image ').
        then(doc => {
            const response = {
                doc: doc.map(doc => {
                    return {
                        description: doc.description,
                        image: doc.image,
                        _id: doc._id,
                      
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
const updateNewsById = function (req, res, next) {
    const newsId = req.params.id;

    uploadMiddleware(req, res, function (err) {
        if (err) {
            return res.status(400).json({
                message: 'File upload error',
                error: err.message
            });
        }

        const updateFields = {
            description: req.body.description,
        };

        if (req.file && req.file.path) {
            const resultPromise = uploadImage(req.file.path);

            resultPromise
                .then(result => {
                    updateFields.image = result.secure_url;

                    News.findOneAndUpdate({ _id: newsId }, updateFields, { new: true })
                        .then(updatedNews => {
                            if (!updatedNews) {
                                return res.status(404).json({
                                    message: 'News not found'
                                });
                            }

                            res.status(200).json({
                                message: 'News updated successfully',
                                updatedNews: updatedNews
                            });
                        })
                        .catch(error => {
                            console.error(error);
                            res.status(500).json({
                                message: 'Internal Server Error',
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        message: err.message
                    });
                });
        } else {
            // Update only the description if no new image is provided
            News.findOneAndUpdate({ _id: newsId }, { description: req.body.description }, { new: true })
                .then(updatedNews => {
                    if (!updatedNews) {
                        return res.status(404).json({
                            message: 'News not found'
                        });
                    }

                    res.status(200).json({
                        message: 'News updated successfully',
                        updatedNews: updatedNews
                    });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({
                        message: 'Internal Server Error',
                    });
                });
        }
    });
};
const updateNewsVisible = function (req, res, next) {
    const newsId = req.params.id;
    const new1 = false;
    let newStateValue;

    if (!newsId) {
        return res.status(400).json({
            message: 'Invalid newsId',
        });
    }

    News.findById(newsId)
        .then(news => {
            if (!news) {
                return res.status(404).json({
                    message: 'News not found'
                });
            }

            newStateValue = news.visible ? new1 : !newStateValue;

            return News.findByIdAndUpdate(newsId, { visible: newStateValue }, { new: true });
        })
        .then(updatedNews => {
            if (!updatedNews) {
                return res.status(404).json({
                    message: 'News not found'
                });
            }
            res.status(200).json({
                message: 'News updated successfully',
                updatedNews: updatedNews
            });
        })
        .catch(err => {
            res.status(500).json({
                message: err.message
            });
        });
};


module.exports = {
    addnews:addnews,
    getAll : getAll ,
    getallbyID: getallbyID ,
    deleteNews: deleteNews,
    updateNewsById,
    getAll1,
    updateNewsVisible,
};