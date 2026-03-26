import dotenv from 'dotenv';
import express from "express";
import session from "express-session";
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './src/config/connectDB.js';
const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config()

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// for developent
app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);
// for production
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

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
// Home Route
connectDB(process.env.MONGODB_URI)
app.use('/static', express.static('public'));

app.get('/', (req, res) => {
    res.send("Hello from backend !!")
})
app.use('/static', express.static('public'));
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
// WishList Routes
import wishListToggle from './src/routes/WishList.Routes.js'
app.use('/wishlist/', wishListToggle)

import otpRoutes from './src/routes/otp.Routes.js'
app.use('/auth/otp/', otpRoutes)

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})