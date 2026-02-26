const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    try {
        const { title, description, location, beforeImage, afterImage, additionalImage, roomType, paintBrand, colors, duration, size, cost, clientName, testimonial, service, featured } = req.body;

        if (!title || !description || !beforeImage || !afterImage || !roomType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, before/after images, and room type'
            });
        }


        const project = await Project.create({
            title,
            description,
            location, beforeImage,
            afterImage,
            additionalImage: additionalImage || [],
            roomType,
            paintBrand,
            colors: colors || [],
            duration,
            size,
            cost,
            clientName,
            testimonial,
            service,
            featured: featured || false,
            status: 'published'
        });

        if (service) {
            await project.populate('service');
        }

        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Create Project Error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create project',
            error: error.message
        });
    }
}

exports.getAllProjects = async (req, res) => {
    try {
        const {
            roomType,
            featured,
            status,
            minCost,
            maxCost,
            location,
            search,
            sort,
            page,
            limit
        } = req.query;


        let filter = {};

        if (roomType) {
            filter.roomType = roomType;
        }


        if (featured !== undefined) {
            filter.featured = featured === 'true';
        }

        // Fix NoSQL injection: Ensure status is a string, not an object (e.g. status[$ne]=published)
        filter.status = typeof status === 'string' ? status : 'published';

        if (minCost || maxCost) {
            filter.cost = {};
            if (minCost) filter.cost.$gte = Number(minCost);
            if (maxCost) filter.cost.$lte = Number(maxCost);
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (minCost || maxCost) {
            filter.cost = {};
            if (minCost) filter.cost.$gte = Number(minCost);
            if (maxCost) filter.cost.$lte = Number(maxCost);
        }

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = '-createdAt';

        if (sort === 'oldest') sortOption = 'createdAt';
        if (sort === 'views') sortOption = '-viewCount';
        if (sort === 'cost-low') sortOption = 'cost';
        if (sort === 'cost-high') sortOption = '-cost';

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const skip = (pageNum - 1) * limitNum;

        const projects = await Project.find(filter)
            .populate('service', 'name category')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .select('-__v');


        const totalProjects = await Project.countDocuments(filter);
        const totalPages = Math.ceil(totalProjects / limitNum);

        res.status(200).json({
            success: true,
            count: projects.length,
            total: totalProjects,
            page: pageNum,
            totalPages,
            projects
        })
    } catch (error) {
        console.error('Get All Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
}

exports.getProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format',
            });
        }

        const project = await Project.findById(id).populate('service');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.incrementViews();

        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get Project Error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Project not found - Invalid ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch project',
            error: error.message
        });
    }
}


exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format',
            });
        }

        let project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const allowedUpdates = {};
        const fields = ['title', 'description', 'location', 'beforeImage', 'afterImage', 'additionalImage', 'roomType', 'paintBrand', 'colors', 'duration', 'size', 'cost', 'clientName', 'testimonial', 'service', 'featured', 'status'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                allowedUpdates[field] = req.body[field];
            }
        });

        project = await Project.findByIdAndUpdate(id, allowedUpdates, {
            new: true,
            runValidators: true,
        }).populate('service');

        res.status(200).json({
            success: true,
            message: 'Project updated successfully',
            project
        });
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project',
            error: error.message
        });
    }
}

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Project deleted successfully',
            deletedProject: {
                id: project._id,
                title: project.title
            }
        });
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project',
            error: error.message
        });
    }
}

exports.toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project ID format',
            });
        }

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const newFeaturedStatus = await project.toggleFeatured();

        res.status(200).json({
            success: true,
            message: `Project ${newFeaturedStatus ? 'featured' : 'unfeatured'}`,
            project
        });

    } catch (error) {
        console.error('Toggle Featured Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle featured status',
            error: error.message
        });
    }
}


exports.getFeaturedProjects = async (req, res) => {
    try {
        const projects = await Project.getFeatured();

        res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        console.error('Get Featured Projects Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured projects',
            error: error.message
        });
    }
}

exports.getProjectsByRoomType = async (req, res) => {
    try {
        const { roomType } = req.params;

        const projects = await Project.getByRoomType(roomType);

        res.status(200).json({
            success: true,
            roomType,
            count: projects.length,
            projects
        });

    } catch (error) {
        console.error('Get Projects By Room Type Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch projects',
            error: error.message
        });
    }
};

exports.getProjectStats = async (req, res) => {
    try {
        // Total projects
        const totalProjects = await Project.countDocuments({ status: 'published' });

        // Featured projects
        const featuredCount = await Project.countDocuments({
            featured: true,
            status: 'published'
        });

        // Projects by room type
        const projectsByRoom = await Project.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$roomType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Most viewed projects
        const mostViewed = await Project.find({ status: 'published' })
            .sort('-viewCount')
            .limit(5)
            .select('title viewCount');

        // Total views
        const totalViews = await Project.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$viewCount' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalProjects,
                featuredCount,
                projectsByRoom,
                mostViewed,
                totalViews: totalViews[0]?.total || 0
            }
        });

    } catch (error) {
        console.error('Get Project Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch project statistics',
            error: error.message
        });
    }
};

