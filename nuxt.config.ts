// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	modules: ["@logto/nuxt"],

	logto: {
		pathnames: {
			signIn: "/sign-in",
			signOut: "/sign-out",
			callback: "/callback",
		},
	},

	runtimeConfig: {
		logto: {
			endpoint: process.env.NUXT_LOGTO_ENDPOINT,
			appId: process.env.NUXT_LOGTO_APP_ID,
			appSecret: process.env.NUXT_LOGTO_APP_SECRET,
			cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
		},
	},
});
