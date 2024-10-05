# Nuxt Logto 1.0.0 Problems

This repository is a basic implementation of Logto in Nuxt using @logto/nuxt SDK, following the official guides. Here i explain the problems I encountered when trying to use the new version of the Logto library for Nuxt.

To create this repository, I used the following commands:

```bash
npx nuxi@latest init logto-nuxt
cd logto-nuxt
npm install @logto/nuxt
```

Following the official guide [Logto Quick Start for Nuxt](https://docs.logto.io/quick-starts/nuxt/) up until [Test the application](https://docs.logto.io/quick-starts/nuxt/#checkpoint-test-your-application) i implemented what is needed in nuxt.config.js and .env file.

I have a logto tenant with a test user, which I used to populate the .env variables.

The `app.vue` is taken from the example in the playground:

[github.com/logto-io/js/packages/nuxt/playground/app.vue](https://github.com/logto-io/js/blob/81e7884c2a10f4db8dc0ba020d44ade9f6eb5c52/packages/nuxt/playground/app.vue)

After running `npm run dev`, I get the following errors:

**Server Error:**

![Server Error](server_error.png)

**Browser Error:**

![Browser Error](browser_error.png)

When running `npm install`, I also noticed the following warning:

```
 WARN  [nuxt] Expected @nuxt/kit to be at least 3.13.2 but got 3.12.4. This might lead to unexpected behavior. Check your package.json or refresh your lockfile.
```

## If you downgrade logto version from 1.0.0 to the prevous 0.3.4 will work as expected, showing a login button and if logged in showing the user info
