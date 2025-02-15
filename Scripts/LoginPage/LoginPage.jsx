import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import useUserStore from "../State/userStore.js";

const LoginPage = () => {
	const navigate = useNavigate();
	const setAccessToken = useUserStore(state => state.setAccessToken);

	const login = async (jsonData) => {
		const response = await fetch("/api/login", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: jsonData
		});
		const data = await response.json();

		if (data.success) {
			setAccessToken(data.accessToken);
			navigate("/");
		}
		console.log(data.message);
	};

	const handleSignup = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		const jsonData = JSON.stringify(Object.fromEntries(formData.entries()));

		const response = await fetch("/api/register", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: jsonData
		});
		const data = await response.json();

		if (data.success) {
			login(jsonData);
		}
		console.log(data.message);
	};

	const handleLogin = (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		const jsonData = JSON.stringify(Object.fromEntries(formData.entries()));

		login(jsonData);
	};

	useEffect(() => {

	}, []);

	return (
		<>
			<form onSubmit={handleLogin}>
				<input type="text" placeholder="Email..." name="email" />
				<input type="password" placeholder="Password..." name="password" />
				<button type="submit">Login</button>
			</form>
			<form onSubmit={handleSignup}>
				<input type="text" placeholder="Name..." name="name" />
				<input type="text" placeholder="Email..." name="email" />
				<input type="password" placeholder="Password..." name="password" />
				<button type="submit">Login</button>
			</form>
		</>
	);
};

export default LoginPage;