import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	createdAt: {type: Date, default: Date.now},
	refreshTokens: {type: [String], default: []},
	socketId: {type: String, default: null},
	pendingMessages: {type: [Object], default: []}
});

userSchema.pre("save", async function(next) {
	if (!this.isModified("password")) next();
	try {
		this.password = await bcrypt.hash(this.password, 10);
		next();
	}
	catch (err) {
		next(err);
	}
});

userSchema.methods.comparePassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;