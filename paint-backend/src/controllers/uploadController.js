const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const bufferToStream = (buffer) => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
}


exports.uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'house-paint/general',
                    resource_type: 'image',
                    format: 'jpg',  // Convert HEIC to JPG for browser compatibility
                    transformation: [
                        { width: 1200, height: 800, crop: 'limit' },
                        { quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            bufferToStream(req.file.buffer).pipe(uploadStream);
        });

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                size: result.bytes
            }
        });
    } catch (error) {
        console.error('Upload Single Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image',
            error: error.message
        });
    }
}


exports.uploadMultipleImages = async (req, res) => {
    try {
        // Check if files exist
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one image'
            });
        }

        // Upload all images to Cloudinary
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'house-paint/gallery',
                        resource_type: 'image',
                        format: 'jpg',  // Convert HEIC to JPG for browser compatibility
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            size: result.bytes
                        });
                    }
                );

                bufferToStream(file.buffer).pipe(uploadStream);
            });
        });

        // Wait for all uploads to complete
        const uploadedImages = await Promise.all(uploadPromises);

        res.status(200).json({
            success: true,
            message: `${uploadedImages.length} images uploaded successfully`,
            count: uploadedImages.length,
            data: uploadedImages
        });

    } catch (error) {
        console.error('Upload Multiple Images Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload images',
            error: error.message
        });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;

        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.status(200).json({
                success: true,
                message: 'Image deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Image not found or already deleted'
            });
        }

    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

exports.uploadProjectImages = async (req, res) => {
    try {
        if (!req.files) {
            return res.status(400).json({
                success: false,
                message: 'Please upload images'
            });
        }

        const uploadedImages = {};

        // Upload Before Image
        if (req.files.beforeImage) {
            const beforeResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'house-paint/projects/before',
                        format: 'jpg',  // Convert HEIC to JPG for browser compatibility
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                bufferToStream(req.files.beforeImage[0].buffer).pipe(uploadStream);
            });
            uploadedImages.beforeImage = beforeResult;
        }

        // Upload After Image
        if (req.files.afterImage) {
            const afterResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'house-paint/projects/after',
                        format: 'jpg',  // Convert HEIC to JPG for browser compatibility
                        transformation: [
                            { width: 1200, height: 800, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );
                bufferToStream(req.files.afterImage[0].buffer).pipe(uploadStream);
            });
            uploadedImages.afterImage = afterResult;
        }

        // Upload Additional Images
        if (req.files.additionalImages) {
            const additionalPromises = req.files.additionalImages.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'house-paint/projects/additional',
                            format: 'jpg',  // Convert HEIC to JPG for browser compatibility
                            transformation: [
                                { width: 1000, height: 800, crop: 'limit' },
                                { quality: 'auto' }
                            ]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    bufferToStream(file.buffer).pipe(uploadStream);
                });
            });

            uploadedImages.additionalImages = await Promise.all(additionalPromises);
        }

        res.status(200).json({
            success: true,
            message: 'Project images uploaded successfully',
            data: uploadedImages
        });

    } catch (error) {
        console.error('Upload Project Images Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload project images',
            error: error.message
        });
    }
};


exports.uploadReviewMedia = async (req, res) => {
    try {
        if (!req.files || (!req.files.photos && !req.files.videos)) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one photo or video'
            })
        }

        const uploadedMedia = {
            photos : [],
            videos : []
        };


        if (req.files.photos) {
            const photoPromises = req.files.photos.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'house-paint/reviews/photos',
                            resource_type: 'image',
                            transformation: [
                                { weight: 800, height: 800, crop: 'limit' },
                                { quality: 'auto' },
                                { fetch_format: 'auto' }
                            ]
                        },

                        (error, result) => {
                            if (error) reject(error);
                            else resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                                type: 'photo'
                            });
                        }
                    );

                    bufferToStream(file.buffer).pipe(uploadStream);
                });
            });

            uploadedMedia.photos = await Promise.all(photoPromises);
        }

        if (req.files.videos) {
            const videoPromises = req.files.viddeos.map((file) => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'house-paint/reviews/videos',
                            resource_type: 'video',
                            transformation: [
                                { width: 1280, height: 720, crop: 'limit' },
                                { quality: 'auto' },
                                { video_codec: 'h264' }
                            ]
                        },

                        (error, result) => {
                            if (error) reject(error);
                            else resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                                type: 'video',
                                duration: result.duration,
                                format: result.format
                            })
                        }
                    );
                    bufferToStream(file.buffer).pipe(uploadStream);
                });
            });
            uploadedMedia.videos = await Promise.all(videoPromises);
        }
        res.status(200).json({
            success: true,
            message: 'Review media uploaded successfully',
            data: {
                photos: uploadedMedia.photos,
                videos: uploadedMedia.videos,
                totalPhotos: uploadedMedia.photos.length,
                totalVideos: uploadedMedia.videos.length
            }
        });
    }catch(error){
        console.error('Upload Review Media Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload media',
      error: error.message
    });
    }
}