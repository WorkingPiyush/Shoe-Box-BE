import admin from "../config/firebaseAdmin.js";

const verifyToken = async (req, res, next) => {
    const sessionCookie = req.cookies.authToken;
    console.log(sessionCookie)
    if (!sessionCookie) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie,true);
        req.firebaseUser = decoded;
        next()
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
}

export default verifyToken;