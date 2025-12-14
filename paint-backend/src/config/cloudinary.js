const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const testConnection = async() => {
    try{
        const result = await cloudinary.api.ping();
        console.log('Cloudinary Connected: ', result.status);
    }catch(error){
        console.error('Cloudinary Connection Failed:', error.message);
    }
};

module.exports = cloudinary;