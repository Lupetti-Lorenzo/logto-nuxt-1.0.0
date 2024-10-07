# Nuxt Logto Access Token Refresh

This repository is created as a support example for the Logto development team to demonstrate an issue with the Logto access token in a Nuxt 3 application using @logto/nuxt SDK.

The [Logto documentation](https://docs.logto.io/quick-starts/nuxt/#fetch-access-token-for-the-api-resource) provides a very basic example of how to fetch the access token and store it using useState. However, this approach has limitations, especially when dealing with short-lived tokens and users who spend extended periods inside the application without refreshing the page.

## Configuration

To run this example, you will need to set up a `.env` file with your Logto configuration, as shown in the `.env.example` file.

I have a logto tenant with a test user, which I used to populate the .env variables.

The `app.vue` is taken from the example in the [playground](https://github.com/logto-io/js/blob/81e7884c2a10f4db8dc0ba020d44ade9f6eb5c52/packages/nuxt/playground/app.vue) inside the logto repository.

The `nuxt.config.js` is made following the official [documentation](https://docs.logto.io/quick-starts/nuxt/)

## Problem Description

The current approach outlined in the documentation can lead to `401 Unauthorized` errors if:

1. The access token has a short expiration time.
2. Users remain in the app for a long time without refreshing the page.

### Key Points:

- `client.getAccessToken()` uses a refresh strategy, which works perfectly when the page is first loaded, but does not address continuous access token refresh when the user stays in the app.
- The `useLogtoClient()` composable is only available on the **server side** during SSR, so it cannot be used on the client side to refresh the token when it expires.
- Moreover, `useLogtoClient()` cannot be used in the server-side API routes because it is a composable, which makes it unavailable in those contexts.

As a result, the method shown in the documentation for fetching and refreshing the token is only useful during the initial page load and fails to maintain a valid token state throughout the user's session.

## My Solution

To address this problem, I implemented a solution that involves storing the `accessToken` and its expiration time (`accessTokenExpires` in milliseconds) in a [Pinia store](https://pinia.vuejs.org/ssr/nuxt.html) (`userStore`), and saving the `refreshToken` as an HTTP-only cookie used to call the `api/auth/refresh-token` endpoint that will refresh the token and return the new access token and expiration time.
This userStore exposes a `getAccessToken()` method that checks if the token is still valid based on the stored `accessTokenExpires` and refreshes it if needed calling the `api/auth/refresh-token` endpoint.

This ensures that the access token is always valid and up-to-date, even if the token expires while the user is still in the application.

### Implementation Details

1. **Initial Token Storage**:  
   During the initial setup in `app.vue` (using `callOnce()`), I extend the example provided in the Logto [playground repository](https://github.com/logto-io/js/blob/81e7884c2a10f4db8dc0ba020d44ade9f6eb5c52/packages/nuxt/playground/app.vue) to:

   - Save the `accessToken` and `accessTokenExpires` in the `userStore`.
   - Store the `refreshToken` as an HTTP-only cookie, making it inaccessible to client-side JavaScript.

2. **Access Token Management vai getAccessToken**:  
   I created a method `getAccessToken()` inside the `userStore` to handle token validity. This method:

   - Checks if the token is still valid based on the stored `accessTokenExpires`.
   - If the token is expired, it calls the `api/auth/refresh-token` endpoint to get a new access token and update the store state accordingly.

3. **Server-side API Route for Refreshing Tokens**:  
   I added a server-side route (`server/api/auth/refresh.get.js`) to handle the refresh token logic:

   - Retrieves the refresh token from the HTTP-only cookie.
   - If the refresh token is valid, it makes a request to the Logto API to obtain a new access token and expiration time.
   - The refreshed access token and its expiration time are then sent back to the client, which updates the Pinia store state.

4. **Using the `getAccessToken()` Method Throughout the App**:  
   In the application, I replaced any direct use of the static access token with calls to `getAccessToken()` from the `userStore`. This ensures that all API requests are made using a valid access token that is automatically refreshed when needed.

## Conclusion

I am using this approach in my Nuxt 3 application to manage the Logto access token and ensure that it remains valid throughout the user's session. By storing the access token and its expiration time in a Pinia store and using a server-side API route to refresh the token when needed, I have been able to avoid `401 Unauthorized` errors due to expired tokens.
I also would like to know if there is a better way to handle this situation, as I am not sure if this is the best approach to solve this problem. I would appreciate any feedback or suggestions on how to improve this solution or alternative approaches to managing access tokens in a Nuxt 3 application.

## Question

I made all this with the server and cookie because the appId, appSecret and the env configuration is only available in the server side, but if is safe to include the appId and appSecret in the client side, I could make the call directly to logto from the client side, bypassing this cookie and server side call. Is this a safe approach? Or is better to keep the refresh token in the server side and make the call from there?
