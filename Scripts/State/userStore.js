import {create} from "zustand";

const useUserStore = create((set, get) => ({
	accessToken: "",
	userName: "",
	userEmail: "",

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