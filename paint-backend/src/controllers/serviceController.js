const Service = require("../models/Service");

exports.createService = async (req, res) => {
    try {
        const { name, description, priceRange, images, features, duration, category, estimatedTimeline } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name and description'
            });
        }

        if (priceRange && priceRange.max < priceRange.min) {
            return res.status(400).json({
                success: false,
                message: 'Maximum price must be greater than or equal to minimum price'
            });
        }


        // Check if service with same name exists
        const existingService = await Service.findOne({ name });
        if (existingService) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        const service = await Service.create({
            name,
            description,
            priceRange: priceRange || undefined,
            images: images || [],
            features: features || [],
            duration: duration || estimatedTimeline,
            category
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service
        });
    } catch (error) {
        console.error('Create Service Error:', error);

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
                errors: messages
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Service with this name already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create service',
            error: error.message
        })
    }
};


exports.getAllService = async (req, res) => {
    try {
        const { category, isActive, minPrice, maxPrice, search } = req.query;

        let filter = {};

        if (category) {
            filter.category = category;
        }

        // Only filter by isActive if explicitly provided
        // isActive=true shows active, isActive=false shows inactive, no param shows all
        if (isActive !== undefined && isActive !== '') {
            filter.isActive = isActive === 'true';
        }

        if (minPrice || maxPrice) {
            filter['priceRange.min'] = {};
            if (minPrice) filter['priceRange.min'].$gte = Number(minPrice);
            if (maxPrice) filter['priceRange.max'] = { $lte: Number(maxPrice) };
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
        }

        const services = await Service.find(filter).sort('-createdAt').select('-__v');

        res.status(200).json({
            success: true,
            count: services.length,
            services
        })
    } catch (error) {
        console.log('Get All Services Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: error.message
        })
    }
}

exports.getService = async (req, res) => {

    try {

        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format',
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            });
        }

        await service.incrementViews();

        res.status(200).json({
            success: true,
            service
        })
    } catch (error) {
        console.log('Get Service Error:', error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'Service not found - Invalid ID format'
            });
        }

        res.status(500).json({
            sucess: false,
            message: 'Failed to fetch services',
            error: error.message
        })
    }
}


exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format',
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        if (req.body.priceRange) {
            const { min, max } = req.body.priceRange;
            if (max < min) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum price must be >= minimum price'
                })
            }
        }

        const allowedUpdates = {};
        const fields = ['name', 'description', 'priceRange', 'images', 'features', 'duration', 'category', 'estimatedTimeline', 'isActive'];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                allowedUpdates[field] = req.body[field];
            }
        });

        const updatedService = await Service.findByIdAndUpdate(id, allowedUpdates,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service: updatedService
        });
    } catch (error) {
        console.error('Update Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service',
            error: error.message
        });
    }
}


exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format',
            });
        }

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
            deletedService: {
                id: service._id,
                name: service.name
            }
        });
    } catch (error) {
        console.error('Delete Service Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete service',
            error: error.message
        });
    }
}

exports.toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format',
            });
        }

        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Toggle status
        service.isActive = !service.isActive;
        await service.save();

        res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'}`,
            service
        });

    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle service status',
            error: error.message
        });
    }
};

