import jwt from 'jsonwebtoken';

export const isAdmin = (req, res, next) => {
    const token = req.cookies.token || req.cookies.cookieToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const isAdmin = jwt.decode(token, process.env.SECRET)
        if (isAdmin.role === "ADMIN") {
            next()
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
}