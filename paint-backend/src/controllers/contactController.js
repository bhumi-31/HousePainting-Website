const Contact = require('../models/Contact');
const { sendEmail } = require('../services/emailService');

// Submit contact form (Public)
exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject, and message are required'
            });
        }

        // Create contact entry
        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        // Send confirmation email to user
        try {
            await sendEmail({
                to: email,
                subject: 'Thank you for contacting us!',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="utf-8"></head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1e3a5f;">Thank you for reaching out!</h2>
                        
                        <p>Hi ${name},</p>
                        
                        <p>We've received your message and will get back to you within 24-48 hours.</p>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
                            <p style="margin: 0;"><strong>Message:</strong> ${message}</p>
                        </div>
                        
                        <p>For urgent inquiries, call us at 705-951-0764</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">
                            Chandan House Painting<br>
                            36 Harbourtown Crescent, Ontario, Canada
                        </p>
                    </body>
                    </html>
                `
            });
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        // Send notification email to admin
        try {
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'chandansingh3016@gmail.com',
                subject: `New Contact: ${subject}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head><meta charset="utf-8"></head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #1e3a5f;">New Contact Form Submission</h2>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                            <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                        </div>
                        
                        <p><strong>Message:</strong></p>
                        <p style="background: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message}</p>
                        
                        <p style="font-size: 12px; color: #888;">Submitted: ${new Date().toLocaleString()}</p>
                    </body>
                    </html>
                `
            });
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
            contact: {
                id: contact._id,
                name: contact.name,
                subject: contact.subject
            }
        });
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit contact form',
            error: error.message
        });
    }
};

// Get all contacts (Admin only)
exports.getAllContacts = async (req, res) => {
    try {
        const { status, sort, page, limit } = req.query;

        let filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Sorting
        let sortOption = '-createdAt';
        if (sort === 'oldest') sortOption = 'createdAt';
        if (sort === 'status') sortOption = 'status -createdAt';

        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const contacts = await Contact.find(filter)
            .populate('repliedBy', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum);

        const total = await Contact.countDocuments(filter);
        const totalPages = Math.ceil(total / limitNum);

        // Get counts by status
        const statusCounts = await Contact.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const counts = {
            new: 0,
            read: 0,
            replied: 0,
            archived: 0,
            total: 0
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
            counts.total += item.count;
        });

        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            page: pageNum,
            totalPages,
            statusCounts: counts,
            contacts
        });
    } catch (error) {
        console.error('Get All Contacts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts',
            error: error.message
        });
    }
};

// Get single contact (Admin only)
exports.getContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id)
            .populate('repliedBy', 'name email');

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Mark as read if new
        if (contact.status === 'new') {
            contact.status = 'read';
            await contact.save();
        }

        res.status(200).json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Get Contact Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact',
            error: error.message
        });
    }
};

// Update contact status (Admin only)
exports.updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        if (status) contact.status = status;
        if (adminNotes !== undefined) contact.adminNotes = adminNotes;

        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Update Contact Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact',
            error: error.message
        });
    }
};

// Reply to contact (Admin only)
exports.replyToContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;

        if (!replyMessage) {
            return res.status(400).json({
                success: false,
                message: 'Reply message is required'
            });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Send reply email
        await sendEmail({
            to: contact.email,
            subject: `Re: ${contact.subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1e3a5f;">Response to Your Inquiry</h2>
                    
                    <p>Hi ${contact.name},</p>
                    
                    <p>Thank you for contacting us. Here's our response:</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #1e3a5f;">
                        <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
                    </div>
                    
                    <p style="font-size: 13px; color: #666; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                        <strong>Your original message:</strong><br>
                        ${contact.message}
                    </p>
                    
                    <p>If you have more questions, feel free to reply or call us at 705-951-0764.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #888; text-align: center;">
                        Chandan House Painting<br>
                        36 Harbourtown Crescent, Ontario, Canada
                    </p>
                </body>
                </html>
            `
        });

        // Update contact
        contact.status = 'replied';
        contact.repliedAt = new Date();
        contact.repliedBy = req.user.id;
        await contact.save();

        await contact.populate('repliedBy', 'name');

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully',
            contact
        });
    } catch (error) {
        console.error('Reply to Contact Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply',
            error: error.message
        });
    }
};

// Delete contact (Admin only)
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete Contact Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact',
            error: error.message
        });
    }
};
