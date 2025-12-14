const express = require('express');

const {createService, getAllService, getService, updateService, deleteService, toggleServiceStatus} = require('../controllers/serviceController');

const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/',  getAllService);
router.get('/:id', getService);

router.use(verifyToken, restrictTo('admin'));

router.post('/', createService);
router.put('/:id', updateService);
router.delete("/:id", deleteService);
router.patch('/:id/toggle-status', toggleServiceStatus);


module.exports = router;