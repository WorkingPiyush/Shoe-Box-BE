import dotenv from 'dotenv';
dotenv.config()
import express from "express";
import session from "express-session";
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './src/config/connectDB.js';
const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
    app.set('trust proxy', 1);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.PROD_FRONTEND_URL, credentials: true }));

app.use(helmet());
// for last
// app.use(
//     helmet({
//         crossOriginResourcePolicy: { policy: "cross-origin" } // allow CDN/frontend to use images
//     })
// );

// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: ["'self'"],

//             imgSrc: [
//                 "'self'",
//                 "data:",
//                 "https://cdn.yoursite.com"   // your image CDN
//             ],

//              connectSrc: [
//           "'self'",
//     "https://api.yoursite.com",
//     "https://www.yoursite.com"
//               ],

//             scriptSrc: ["'self'"],        // no unsafe-inline/eval
//             styleSrc: ["'self'"],         // add CDN if using Tailwind CDN etc.
// fontSrc: [
//     "'self'",
//     "https://fonts.gstatic.com"
// ],
//             objectSrc: ["'none'"],        // block plugins
//             upgradeInsecureRequests: []   // force https
//         }
//     })
// );

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true, sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" }
}))
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
// Home Route
connectDB(process.env.MONGODB_URI)

app.get('/', (req, res) => {
    res.send("Hello from backend !!")
})
// Auth Routes
import authRoutes from './src/routes/auth.Routes.js'
app.use('/users/', authRoutes)

// userInfo
import userRoutes from './src/routes/user.Routes.js'
app.use('/api/', userRoutes)

// ProductInfo
import productRoutes from './src/routes/product.Routes.js'
app.use('/product/', productRoutes)

// user Carts
import cartRoutes from './src/routes/cart.Routes.js';
app.use('/cart/', cartRoutes);
// OAuth Routes
import oAuthRoutes from './src/routes/OAuth.Routes.js';
app.use('/auth/', oAuthRoutes)

import orderRoutes from './src/routes/orders.Routes.js'
app.use('/orders/', orderRoutes)
// WishList Routes
import wishListToggle from './src/routes/WishList.Routes.js'
app.use('/wishlist/', wishListToggle)

import otpRoutes from './src/routes/otp.Routes.js'
app.use('/auth/otp/', otpRoutes)

import onlinePayments from './src/routes/payment.Routes.js'
app.use('/pay', onlinePayments)

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})