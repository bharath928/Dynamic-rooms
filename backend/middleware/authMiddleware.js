const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (roles) => (req, res, next) => {
    console.log("🔹 Middleware Triggered");

    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("❌ No valid token provided");
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token part
    console.log("✅ Extracted Token:", token);

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("🔓 Token Decoded:", decoded);

        req.user = decoded; // Attach decoded user data to request

        // Role-based access control
        if (!roles.includes(req.user.role)) {
            console.log("⛔ Forbidden: Insufficient permissions");
            return res.status(403).json({ message: "Forbidden: Insufficient Permissions" });
        }

        next(); // Move to the next middleware
    } catch (err) {
        console.log("❌ Invalid Token:", err.message);
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session Expired. Please Log In Again." });
        }
        return res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
