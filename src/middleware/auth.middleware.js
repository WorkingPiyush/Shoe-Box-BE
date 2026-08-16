import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const token = req.cookies.token || req.cookies.cookieToken;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = jwt.decode(token, process.env.SECRET)
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
}