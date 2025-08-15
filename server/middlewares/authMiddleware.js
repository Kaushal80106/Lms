import { clerkClient } from "@clerk/express";

// Middleware to protect educator routes
export const protectEducator = async (req, res, next) => {
    try {
        const userId = req.auth().userId;
        const response = await clerkClient.users.getUser(userId);

        if (response.publicMetadata.role !== 'educator') {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized Access - Educator role required' 
            });
        }

        next();
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed' 
        });
    }
};