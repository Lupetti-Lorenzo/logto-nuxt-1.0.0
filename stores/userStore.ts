import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
	/* State */
	state: (): UserState => ({
		username: null,
		roles: [],
		context_data: null, // mock the /me endpoint response
		_accessToken: null, // DO NOT ACCESS DIRECTLY, USE getAccessToken() INSTEAD
		_accessTokenExpires: null,
	}),

	/* Actions */
	actions: {
		// server side init on page load
		async init(initUserStore: InitUserStore) {
			this.roles = initUserStore.roles;
			this._accessToken = initUserStore.accessToken;
			this._accessTokenExpires = initUserStore.accessTokenExpires;
			// make call to backend /me to get context data using the access token
			this.context_data = null; // fetch(https://api.menumal.it/me)
		},

		async getAccessToken() {
			// if access token is set and not expired, return it
			// comment this if to bypass the check and always refresh
			if (this._accessToken && Date.now() < (this._accessTokenExpires as number)) {
				return this._accessToken;
			}

			// if access token is expired or not set, refresh it using the refresh token in the cookie
			console.log("access token expired or not set, refreshing token");
			try {
				// Perform the fetch request to the backend
				const refreshTokenResponse: any = await $fetch("api/auth/refresh", {
					method: "GET",
				});

				// update the store with new access token and expiration time
				this._accessToken = refreshTokenResponse.accessToken;
				this._accessTokenExpires = refreshTokenResponse.accessTokenExpires;
				return this._accessToken;
			} catch (error) {
				console.log("User Store - Error refreshing token: " + JSON.stringify(error, null, 2));
				// redirect to logout page if refresh token is invalid
				navigateTo("/sign-out");
			}
		},
	},
});

interface InitUserStore {
	username: string;
	roles: string[];
	accessToken: string;
	accessTokenExpires: number;
}

interface UserState {
	username: string | null;
	roles: string[];
	context_data: any; // mock the /me endpoint response
	_accessToken: string | null; // DO NOT ACCESS DIRECTLY, USE getAccessToken() INSTEAD
	_accessTokenExpires: number | null;
}
