import jwt from 'jsonwebtoken';

export const isAdmin = (req, res, next) => {
    const token = req.cookies.token || req.cookies.cookieToken;
    console.log("token",token)
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const isAdmin = jwt.decode(token, process.env.SECRET)
        console.log(isAdmin.role === "ADMIN")
        if (isAdmin.role === "ADMIN") {
            next()
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
}