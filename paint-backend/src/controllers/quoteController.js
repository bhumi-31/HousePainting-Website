const Quote = require('../models/Quote');

const {
    sendQuoteConfirmationEmail,
    sendFinalQuoteEmail,
    sendQuoteAcceptedEmail
} = require('../services/emailService');

exports.createQuote = async (req, res) => {
    try {
        const { 
            service, 
            serviceType,
            roomType, 
            roomSize, 
            paintQuality, 
            numberOfCoats, 
            wallHeight, 
            additionalServices, 
            customerName, 
            customerEmail, 
            customerPhone, 
            address, 
            preferredStartDate, 
            specialInstructions, 
            customerPhotos 
        } = req.body;

        // Validation - service is now optional, serviceType can be used instead
        if (!roomType || !roomSize || !paintQuality || !customerName || !customerEmail || !customerPhone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
            });
        }

        // Optional: Check if service ObjectId is valid format (only if provided)
        const mongoose = require('mongoose');
        let serviceId = null;
        if (service && service !== "") {
            if (!mongoose.Types.ObjectId.isValid(service)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid service ID format',
                });
            }
            serviceId = service;
        }

        const quote = new Quote({
            user: req.user ? req.user.id : null,
            service: serviceId,
            serviceType: serviceType || null,
            roomType,
            roomSize,
            paintQuality,
            numberOfCoats: numberOfCoats || 2,
            wallHeight: wallHeight || 8,
            additionalServices: additionalServices || [],

            // Auto-fill from logged-in user if not provided
            customerName: customerName || req.user.name,
            customerEmail: customerEmail || req.user.email,
            customerPhone: customerPhone || req.user.phone,

            address,
            preferredStartDate,
            specialInstructions,
            customerPhotos: customerPhotos || []
        });

        quote.calculateEstimate();

        await quote.save();

        await quote.populate('user', 'name email');
        await quote.populate('service', 'name');

        sendQuoteConfirmationEmail(quote, quote.user).catch(err =>
            console.error('Quote confirmation email failed:', err.message)
        );

        res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully. We will contact you soon!',
            quote: {
                id: quote._id,
                estimatedPrice: quote.estimatedPrice,
                priceBreakdown: quote.priceBreakdown,
                status: quote.status,
                expiryDate: quote.expiryDate,
                daysUntilExpiry: quote.daysUntilExpiry
            }
        })
    } catch (error) {
        console.error('Create Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create quote request',
            error: error.message
        });
    }
}

exports.getAllQuotes = async (req, res) => {
    try {
        const { status, page, limit, sort } = req.query;

        let filter = {};
        if (status) {
            filter.status = status;
        }

        let sortOption = '-createdAt';
        if (sort === 'oldest') sortOption = 'createdAt';
        if (sort === 'price-high') sortOption = '-estimatedPrice';
        if (sort === 'price-low') sortOption = 'estimatedPrice';
        if (sort === 'date-asc') sortOption = 'preferredStartDate';


        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const quotes = await Quote.find(filter)
            .populate('user', 'name email phone')
            .populate('service', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);


        const totalQuotes = await Quote.countDocuments(filter);
        const totalPages = Math.ceil(totalQuotes / limitNum);

        res.status(200).json({
            success: true,
            count: quotes.length,
            total: totalQuotes,
            page: pageNum,
            totalPages,
            quotes
        });

    } catch (error) {
        console.error('Get All Quotes Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes',
            error: error.message
        });
    }
}

exports.getMyQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find({ user: req.user.id })
            .populate('service', 'name')
            .sort('-createdAt')

        res.status(200).json({
            success: true,
            count: quotes.length,
            quotes
        });
    } catch (error) {
        console.error('Get My Quotes Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your quotes',
            error: error.message
        });
    }
};

exports.getQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findById(id)
            .populate('user', 'name email phone')
            .populate('service', 'name category');


        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (quote.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this quote'
            });
        }

        res.status(200).json({
            success: true,
            quote
        });
    } catch (error) {
        console.error('Get Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote',
            error: error.message
        });
    }
}


exports.updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, note } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        await quote.updateStatus(status, req.user.id, note);

        res.status(200).json({
            success: true,
            message: `Quote status updated to ${status}`,
            quote: {
                id: quote._id,
                status: quote.status,
                statusHistory: quote.statusHistory
            }
        });
    } catch (error) {
        console.error('Update Quote Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quote status',
            error: error.message
        });
    }
};

exports.updateQuotePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { finalPrice, discount, adminResponse, adminNotes } = req.body;

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (finalPrice !== undefined) quote.finalPrice = finalPrice;
        if (discount !== undefined) quote.discount = discount;
        if (adminResponse) quote.adminResponse = adminResponse;
        if (adminNotes) quote.adminNotes = adminNotes;


        if (discount && discount > 0) {
            quote.applyDiscount(discount);
        }

        await quote.save();

        res.status(200).json({
            success: true,
            message: 'Quote price updated successfully',
            quote: {
                id: quote._id,
                estimatedPrice: quote.estimatedPrice,
                finalPrice: quote.finalPrice,
                discount: quote.discount,
                priceBreakdown: quote.priceBreakdown,
                adminResponse: quote.adminResponse
            }
        });
    } catch (error) {
        console.error('Update Quote Price Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quote price',
            error: error.message
        });
    }
};


exports.sendQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { finalPrice, discount, adminResponse } = req.body;

        const quote = await Quote.findById(id)
            .populate('user', 'name email')

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Update quote details
        if (finalPrice) quote.finalPrice = finalPrice;
        if (discount) quote.applyDiscount(discount);
        if (adminResponse) quote.adminResponse = adminResponse;


        // Update status to 'quoted'
        await quote.updateStatus('quoted', req.user.id, 'Final quote sent to customer');

        sendFinalQuoteEmail(quote, quote.user).catch(err =>
            console.error('Final quote email failed:', err.message)
        );

        res.status(200).json({
            success: true,
            message: 'Quote sent to customer successfully',
            quote: {
                id: quote._id,
                status: quote.status,
                finalPrice: quote.finalPrice,
                discount: quote.discount,
                quoteSentAt: quote.quoteSentAt
            }
        });
    } catch (error) {
        console.error('Send Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send quote',
            error: error.message
        });
    }
}

exports.acceptQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Check if user owns this quote

        if (quote.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this quote'
            });
        }

        if (quote.status !== 'quoted') {
            return res.status(400).json({
                success: false,
                message: `Cannot accept quote with status: ${quote.status}`
            });
        }

        if (quote.isExpired) {
            return res.status(400).json({
                success: false,
                message: 'Quote has expired. Please request a new quote.'
            });
        }

        // Update status to 'accepted'

        await quote.updateStatus('accepted', req.user.id, 'Customer accepted the quote');

        sendQuoteAcceptedEmail(quote, quote.user).catch(err =>
            console.error('Quote accepted email failed:', err.message)
        );

        res.status(200).json({
            success: true,
            message: 'Quote accepted successfully! We will contact you to schedule the work.',
            quote: {
                id: quote._id,
                status: quote.status,
                finalPrice: quote.finalPrice
            }
        });
    } catch (error) {
        console.error('Accept Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept quote',
            error: error.message
        });
    }
};


exports.rejectQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const quote = await Quote.findById(id);


        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Check authorization
        if (quote.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this quote'
            });
        }

        // Update status to 'rejected'
        await quote.updateStatus(
            'rejected',
            req.user.id,
            reason || 'Customer rejected the quote'
        );
        res.status(200).json({
            success: true,
            message: 'Quote rejected',
            quote: {
                id: quote._id,
                status: quote.status
            }
        });

    } catch (error) {
        console.error('Reject Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject quote',
            error: error.message
        });
    }
}


exports.deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findByIdAndDelete(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        console.error('Delete Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete quote',
            error: error.message
        });
    }
};


exports.getQuoteStats = async (req, res) => {
    try {
        // Total quotes
        const totalQuotes = await Quote.countDocuments();

        // Quotes by status
        const statusCounts = await Quote.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusStats = {};
        statusCounts.forEach(item => {
            statusStats[item._id] = item.count;
        });

        // Average quote value
        const avgQuote = await Quote.aggregate([
            {
                $group: {
                    _id: null,
                    avgEstimated: { $avg: '$estimatedPrice' },
                    avgFinal: { $avg: '$finalPrice' }
                }
            }
        ]);

        // Conversion rate (accepted / quoted)
        const quoted = statusStats.quoted || 0;
        const accepted = statusStats.accepted || 0;
        const conversionRate = quoted > 0 ? ((accepted / quoted) * 100).toFixed(1) : 0;

        // Quotes by room type
        const roomTypeStats = await Quote.aggregate([
            {
                $group: {
                    _id: '$roomType',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$estimatedPrice' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Quotes by paint quality
        const qualityStats = await Quote.aggregate([
            {
                $group: {
                    _id: '$paintQuality',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalQuotes,
                statusBreakdown: statusStats,
                averageQuoteValue: {
                    estimated: avgQuote[0]?.avgEstimated?.toFixed(0) || 0,
                    final: avgQuote[0]?.avgFinal?.toFixed(0) || 0
                },
                conversionRate: `${conversionRate}%`,
                roomTypeBreakdown: roomTypeStats,
                qualityBreakdown: qualityStats
            }
        });

    } catch (error) {
        console.error('Get Quote Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote statistics',
            error: error.message
        });
    }
};


//admin only

exports.recalculateQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const { roomSize, paintQuality, numberOfCoats, additionalServices } = req.body;

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Update fields if provided
        if (roomSize) quote.roomSize = roomSize;
        if (paintQuality) quote.paintQuality = paintQuality;
        if (numberOfCoats) quote.numberOfCoats = numberOfCoats;
        if (additionalServices) quote.additionalServices = additionalServices;

        // Recalculate
        const newEstimate = quote.calculateEstimate();

        await quote.save();

        res.status(200).json({
            success: true,
            message: 'Quote recalculated successfully',
            quote: {
                id: quote._id,
                estimatedPrice: quote.estimatedPrice,
                priceBreakdown: quote.priceBreakdown
            }
        });
    } catch (error) {
        console.error('Recalculate Quote Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to recalculate quote',
            error: error.message
        });
    }
}


