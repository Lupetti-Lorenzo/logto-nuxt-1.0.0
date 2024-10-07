export default defineEventHandler(async (event): Promise<RefreshTokenResponse> => {
	try {
		// get the refresh token from the cookies
		const refreshToken = getCookie(event, process.env.NUXT_LOGTO_REFRESH_COOKIE_NAME!) || "";
		console.log("endpoint cookie refresh token: " + refreshToken);

		if (!refreshToken) {
			throw createError({
				statusCode: 401,
				statusMessage: "Refresh token not set",
			});
		}

		// make the request to the token endpoint
		const url = `${process.env.NUXT_LOGTO_ENDPOINT}oidc/token`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: process.env.NUXT_LOGTO_APP_ID!,
				client_secret: process.env.NUXT_LOGTO_APP_SECRET!,
				grant_type: "refresh_token",
				refresh_token: refreshToken,
				resource: process.env.NUXT_LOGTO_API_RESOURCE!,
			}),
		});

		const refreshedTokens = await response.json();
		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				statusMessage: "Error from token endpoint: " + JSON.stringify(refreshedTokens),
			});
		}

		// return access token and expiration time
		return {
			accessToken: refreshedTokens.access_token,
			accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, // save the expiration time in milliseconds
		};
	} catch (error: any) {
		console.log("Error refreshing token: " + JSON.stringify(error));
		throw createError({
			statusCode: error.statusCode || 500,
			statusMessage: error.message,
		});
	}
});

export interface RefreshTokenBody {
	refreshToken: string;
}

export interface RefreshTokenResponse {
	accessToken: string;
	accessTokenExpires: number;
}
