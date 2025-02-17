import React, {useState, useEffect, useRef} from "react";
import useUserStore from "../State/userStore.js";

const MessageBox = () => {
	const {socket, userEmail} = useUserStore();
	const [messages, setMessages] = useState([]);
	const [socketId, setSocketId] = useState(null);

	const handleSend = (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);
		const message = formData.get("message").trim();
		const target = formData.get("target").trim();

		if (message && target) {
			socket.emit("toServerMessage", {
				sender: userEmail,
				targetEmail: target,
				text: message
			});
		}

		event.target.reset();
	};

	useEffect(() => {
		if (!socket) return;

		socket.on("connect", () => {
			setSocketId(socket.id);
		});

		socket.on("fromServerMessage", (data) => {
			setMessages(prev => [...prev, data]);
		});

		return () => socket.off("fromServerMessage");
	}, [socket]);

	return (
		<>
			<div>{socketId}</div>
			{messages.map(({sender, text}, index) => (
				<div key={index}>
					{sender}: {text}
				</div>
			))}
			<form onSubmit={handleSend}>
				<input type="text" placeholder="Target..." name="target" />
				<input type="text" placeholder="Type..." name="message" />
				<button type="submit">Send</button>
			</form>
		</>
	);
};

export default MessageBox;