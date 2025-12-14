const multer = require('multer');

const storage = multer.memoryStorage();

// Allowed HEIC/HEIF mimetypes (iPhone photos)
const heicMimeTypes = ['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];

const fileFilter = (req, file, cb) => {
    console.log('File received:', file); 
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || heicMimeTypes.includes(file.mimetype.toLowerCase())) {
        cb(null, true);
    } else {
        cb(new Error('Only image and video files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024  // Increased to 10MB for HEIC files
    }
})

exports.uploadSingle = upload.single('image');

exports.uploadMultiple = upload.array('images', 5);

exports.uploadFields = upload.fields([
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 5 }
]);

exports.uploadReviewMedia = upload.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);