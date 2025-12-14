const express = require('express');

const {createProject, getAllProjects, getProject, updateProject, deleteProject, toggleFeatured, getFeaturedProjects, getProjectsByRoomType, getProjectStats} = require('../controllers/projectController');

const { verifyToken, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllProjects);

router.get('/featured/list', getFeaturedProjects);

router.get('/stats/overview', verifyToken, restrictTo('admin'), getProjectStats);

router.get('/room/:roomType', getProjectsByRoomType);

router.get('/:id', getProject);


//For Admin Only
router.use(verifyToken, restrictTo('admin'));

router.post('/', createProject);

router.put('/:id', updateProject);

router.delete('/:id', deleteProject);

router.patch('/:id/toggle-featured', toggleFeatured);

module.exports = router;