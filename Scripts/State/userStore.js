import {create} from "zustand";
import {io} from "socket.io-client";

const useUserStore = create((set, get) => ({
	accessToken: "",
	userName: "",
	userEmail: "",
	socket: null,

	connectSocket: (email) => set({socket: io(location.href, {auth: {email}})}),

	updateUserData: async () => {
		const state = get();

		const response = await fetch("/api/getUserData", {
			method: "GET",
			headers: {"Authorization": `Bearer ${state.accessToken}`}
		});
		const data = await response.json();

		if (data.success) {
			set({
				userName: data.user.name,
				userEmail: data.user.email
			});
		}

		console.log(data.message);
	},

	setAccessToken: (token) => set({accessToken: token})
}));

export default useUserStore;