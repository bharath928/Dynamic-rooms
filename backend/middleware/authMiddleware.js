const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (roles) => (req, res, next) => {
    console.log(" Middleware Triggered");

    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        console.log(" No token provided");
        return res.status(401).json({ message: "Access Denied" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    if (!token) {
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token Decoded:", decoded);

        req.user = decoded;

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }

        next();
    } catch (err) {
        console.log(" Invalid Token:", err.message);
        res.status(401).json({ message: "Invalid Token" });
    }
};

module.exports = authMiddleware;
