
const User = require('../models/User')
const Society_request_model = require('../models/SocietyRequest')
exports.createSocietyRequest = async (req, res) => {
    const { user_id, society_name } = req.body;

    
    if (!user_id || !society_name) {
        return res.status(400).json({
            msg: "User ID and Society Name are required"
        });
    }
    try {
       
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).json({
                msg: "User not found"
            });
        }

        if (typeof society_name !== 'string') {
            return res.status(400).json({
                msg: "Invalid society name format"
            });
        }

        // Check if a request already exists for this society name (optional but good)
        // const existingRequest = await Society_request_model.findOne({ society_name });
        // if (existingRequest) {
        //     return res.status(400).json({ msg: "Society name already requested" });
        // }

        const existingRequest = await Society_request_model.findOne({society_name})

        const societyRequest = await Society_request_model.create({
            user_id: user._id,
            society_name: society_name
        });

        // Send success response
        return res.status(201).json({
            msg: "Society request created successfully",
            data: societyRequest
        });

    } catch (error) {
        console.error("Error creating society request:", error);
        return res.status(500).json({
            msg: "Internal Server Error",
            error: error.message
        });
    }
};