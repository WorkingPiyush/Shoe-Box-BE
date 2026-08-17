import User from "../models/User.js";
import Address from "../models/Address.js";
import axios from "axios";
import { redis } from "../config/redis.js";



export const UserInfo = async (req, res) => {
    const userId = req.user.id
    const cached = await redis.get(`user:${userId}`);
    if (cached) {
        return JSON.parse(cached);
    }
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) return;
        await redis.set(`user:${userId}`, JSON.stringify(user), "EX", 9000);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "user Not Found" });
    }
}
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(400).json({ message: "No Address Found !!" })
        }
        address.label = data.label;
        address.name = data.name;
        address.phone = data.phone;
        address.house = data.house;
        address.locality = data.locality;
        address.city = data.city;
        address.state = data.state;
        address.pincode = data.pincode;
        address.country = data.country;
        if (data.label === "Home" || data.label === "Work") {
            address.isDefault = true;
        }
        await address.save()
        return res.status(200).json(address);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", err: error.message });
    }
}
export const AddressBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressDoc = await Address.find({ userId }).lean();
        return res.status(200).json(addressDoc || []);
    } catch (error) {
        return res.status(500).json({ message: "Server Error", err: error.message });
    }
}
export const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;
        if (data.isDefault) {
            await Address.updateMany(
                { userId },
                { isDefault: false }
            )
        }
        const address = await Address.create({
            userId,
            label: data.label,
            name: data.name,
            phone: data.phone,
            house: data.house,
            locality: data.locality,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            country: data.country,
            isDefault: data.isDefault,
        });
        return res.status(200).json(address);
    } catch (error) {
        return res.status(500).json({ message: "Backend Error", err: error.message });
    }

}
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Please provide address id" });
        }
        const result = await Address.deleteOne({ _id: id, userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Address not found" });
        }
        return res.status(200).json({ message: "Address Deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Backend Error", err: error.message });
    }
}
const geoCache = new Map();
const geoCache_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const fetchAddress = async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ message: "Missing coordinates" });
    }
    const key = `${Number(lat).toFixed(3)}-${Number(lng).toFixed(3)}`;
    const cached = geoCache.get(key);
    if (cached) {
        if (cached && Date.now() - cached.timestamp < geoCache_TTL) {
            return res.json(cached.data);
        }
        geoCache.delete(key);
    }
    try {
        const response = await axios.get(
            "https://geocode.maps.co/reverse", {
            params: {
                lat: lat,
                lon: lng,
                api_key: process.env.GEOCODING_API_KEY,
            },
            timeout: 5000
        }
        );
        const address = response.data.address;
        const result = {
            locality: address.suburb || "",
            sector: address.city_block || "",
            city: address.city || "",
            pincode: address.postcode || "",
            country: address.country || "",
            road: address.street || "",
        }

        geoCache.set(key, {
            data: result,
            timestamp: Date.now()
        })

        return res.status(200).json(result);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            locality: "",
            city: "",
            pincode: "",
            country: "",
            road: "",
            coordinates: { lat, lng }
        });
    }
}
export const profileUpdate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email, phone } = req.body;

        if (email && !email.includes('@')) {
            return res.status(400).json({ success: false, message: "Invalid Email" });
        }
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const now = Date.now();
        const lastUpdate = user.lastProfileUpdate;
        if (lastUpdate && now - lastUpdate < 24 * 60 * 60 * 1000) {
            return res.status(429).json({
                message: "Profile can only be updated once every 24 hours"
            });
        }
        if (email) {
            if (await User.findOne({ email })) {
                return res.status(400).json({ success: false, message: "Invalid Email" });
            }
            user.email = email
            user.isEmailVerified = false;
        };
        if (phone) {
            if (await User.findOne({ phone })) {
                return res.status(400).json({ success: false, message: "Invalid Phone" });
            }
            user.phone = phone;
        }
        user.lastProfileUpdate = now;
        await user.save();
        return res.status(200).json({ success: true, message: "User Updated Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Backend Error"
        });
    }
}