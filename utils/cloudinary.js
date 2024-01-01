const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.Cloud_Name,
    api_key: process.env.Cloud_API,
    api_secret: process.env.Cloud_Secret
});



////
const uploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.uploader.upload(fileToUpload, {
            resource_type: 'auto',
        });
        return data;
    } catch (error) {
        return error;
    }
}


const deletImage = async (publicId) => {
    try {
        const result =await  cloudinary.Uploader.destroy(publicId);
   return result;
    } catch (error) {
        return error;
    }
}
module.exports ={
    uploadImage,
    deletImage,
}