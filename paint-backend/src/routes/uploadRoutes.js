const express = require('express');
const {uploadSingleImage, uploadMultipleImages,deleteImage,uploadProjectImages, uploadReviewMedia} = require('../controllers/uploadController');

const {uploadSingle, uploadMultiple, uploadFields } = require('../middleware/uploadMiddleware');


const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyToken);

router.post('/single', uploadSingle, uploadSingleImage);

router.post('/multiple', uploadMultiple, uploadMultipleImages);

router.post('/project', uploadFields, uploadProjectImages);

router.post('/review-media', uploadReviewMedia, uploadReviewMedia); 

router.delete('/:publicId', restrictTo('admin'), deleteImage);

module.exports = router;