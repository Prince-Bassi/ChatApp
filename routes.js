import express from "express";
import User from "./Models/User.js";
import jsonwebtoken from "jsonwebtoken";
import axios from "axios";
import bcrypt from "bcrypt";

const router = express.Router();

async function validateEmail(email) {
       const url = `http://apilayer.net/api/check?access_key=${process.env.MAILBOX_LAYER_API_KEY}&email=${email}&smtp=1&format=1`;
       const response = await axios.get(url);
       return response.data?.success !== false;
}

router.post("/register", async (req, res, next) => {
	const {name, email, password} = req.body;
	if (!(name && email && password)) return res.status(400).json({success: false, message: "Incomplete data"});

	try {
		const isValid = await validateEmail(email);
		if (!isValid) return res.status(403).json({success: false, message: "Invalid email"});

		const user = new User({name, email, password});
		await user.save();

		res.status(200).json({success: true, message: "User added successfully"});
	}
	catch (err) {
		console.error(err);
		res.status(500).json({success: false, message: "Failed to add user"});
	}
});

function generateTokens(user) {
	const accessToken = jsonwebtoken.sign({id: user._id}, process.env.JWT_ACCESS_KEY, {expiresIn: "1h"});
	const refreshToken = jsonwebtoken.sign({id: user._id}, process.env.JWT_REFRESH_KEY, {expiresIn: "7d"});

	return {accessToken, refreshToken};
}

router.post("/login", async (req, res, next) => {
	const {email, password} = req.body;
	if (!(email && password)) return res.status(400).json({success: false, message: "Incomplete data"});

	try {
		const user = await User.findOne({email});
		if (!user) return res.status(400).json({success: false, message: "No such user found"});

		const validPassword = await user.comparePassword(password);
		if (!validPassword) {
			return res.status(403).json({success: false, message: "Incorrect password"});
		}

		const {accessToken, refreshToken} = generateTokens(user);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: "Strict",
			maxAge: 7 * 24 * 60 * 60 * 1000
		});

		user.refreshTokens.push(refreshToken);
		await user.save();

		res.status(200).json({success: true, message: `Logged in as ${user.name}`, accessToken});
	}
	catch (err) {
		console.error(err);
		res.status(500).json({success: false, message: "Failed login"});
	}
});

router.post("/logout", async (req, res, next) => {
	try {
		const cookies = req.headers.cookie
            	? Object.fromEntries(req.headers.cookie.split("; ").map(c => c.split('=')))
            	: {};
        	const token = cookies?.refreshToken;
		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: false,
			sameSite: "Strict"
		});
		await User.updateOne({refreshTokens: token}, {$pull: {refreshTokens: token}});
		res.status(200).json({success: true, message: "Logged out"});
	}
	catch (err) {
		console.error(err);
		res.status(500).json({success: false, message: "Failed to log out."});
	}
});

const authenthicateUser = (req, res, next) => {
	const token = req.header("Authorization");
	if (!token) return res.status(403).json({success: false, message: "Access denied"});

	try {
		const decoded = jsonwebtoken.verify(token.replace("Bearer ", ""), process.env.JWT_ACCESS_KEY);
		req.userId = decoded.id;
		next();
	}
	catch (err) {
		res.status(403).json({success: false, message: "Invalid token"});
	}
};

router.post("/refreshAccessToken", async (req, res, next) => {
	const cookies = req.headers.cookie
            	? Object.fromEntries(req.headers.cookie.split("; ").map(c => c.split('=')))
            	: {};
        const token = cookies?.refreshToken;

	if (!token) return res.status(403).json({success: false, message: "No refresh token"});

	try {
		const user = await User.findOne({refreshTokens: token});
		if (!user) return res.status(403).json({success: false, message: "No user found"});

		const decoded = jsonwebtoken.verify(token, process.env.JWT_REFRESH_KEY);
		if (user.id !== decoded.id) return res.status(403).json({success: false, message: "User mismatch"});

		const {accessToken, refreshToken} = generateTokens(user);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: "Strict",
			maxAge: 7 * 24 * 60 * 60 * 1000
		});

		user.refreshTokens.push(refreshToken);
		await user.save();

		res.status(200).json({success: true, message: `Logged in as ${user.name}`, accessToken});
	}
	catch (err) {
		console.error(err);
		res.status(500).json({success: false, message: "An error occurred"});
	}
});

router.get("/getUserData", authenthicateUser, async (req, res, next) => {
	const user = await User.findOne({_id: req.userId}).select("-password");;
	if (!user) return res.status(400).json({success: false, message: "No user founc"});

	res.status(200).json({success: true, message: "Got user data", user});
});

export default router;