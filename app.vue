<script setup lang="ts">
import { useLogtoUser, callOnce } from "#imports";
import { useUserStore } from "./stores/userStore";

const userStore = useUserStore();

const logtoUser = useLogtoUser();

// Set the refresh token as an HTTP-only cookie for the refresh endpoint
const cookieRefreshToken = useCookie<string>(process.env.NUXT_LOGTO_REFRESH_COOKIE_NAME!, {
	default: () => "",
	sameSite: "strict",
	httpOnly: true,
	path: "/api/auth/refresh",
});

await callOnce(async () => {
	// https://docs.logto.io/quick-starts/nuxt/#fetch-access-token-for-the-api-resource
	const client = useLogtoClient();
	if (!client) {
		console.error("Logto client non disponibile");
		return null;
	}

	if (!(await client.isAuthenticated())) {
		console.warn("Utente non autenticato");
		return null;
	}

	// get access token and calculate the expiration time
	const accessToken = await client.getAccessToken(process.env.NUXT_LOGTO_API_RESOURCE);
	const refreshToken = (await client.getRefreshToken()) as string;

	// Set the refresh token in the cookies
	cookieRefreshToken.value = refreshToken;

	// get data from the jwt payload
	const { roles, username, exp } = logtoUser.roles;
	const accessTokenExpires = exp * 1000; // convert exp to milliseconds

	userStore.init({
		accessToken,
		accessTokenExpires,
		roles,
		username,
	});
});

async function clientSideButtonPrintAccessToken() {
	console.log("Access token:", await userStore.getAccessToken());
}
</script>
<template>
	<div>
		<p>Logto Nuxt 3 sample</p>
		<p v-if="Boolean(logtoUser)">Authenticated</p>
		<ul v-if="Boolean(logtoUser)">
			<li v-for="(value, key) in logtoUser">
				<b>{{ key }}:</b> {{ value }}
			</li>
		</ul>
		<p v-if="Boolean(logtoUser)">Access token: {{ userStore._accessToken }}</p>
		<a :href="`/sign-${logtoUser ? 'out' : 'in'}`"> Sign {{ logtoUser ? "out" : "in" }} </a>
	</div>
	<button @click="clientSideButtonPrintAccessToken">Print access token</button>
</template>
