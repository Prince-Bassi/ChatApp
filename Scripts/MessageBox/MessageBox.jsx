import React from "react";

const MessageBox = () => {
	const handleSend = (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		const message = formData.get("message");

		console.log("Message:", message);
	};

	return (
		<>
			<form onSubmit={handleSend}>
				<input type="text" placeholder="Type..." name="message" />
				<button type="submit">Send</button>
			</form>
		</>
	);
};

export default MessageBox;