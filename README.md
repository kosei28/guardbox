# Guardbox

Guardbox is an easy and modern authentication library.

## Features

- **Easy** - Authentication can be implemented without the need for specialized knowledge
- **Framework Independent** - Guardbox can be used in any JavaScript/TypeScript project
- **Adapter** - Abstraction of user and session management and greater flexibility in managing data
- **Provider** - Custom providers can be implemented to support any authentication method
- **Acount Linking** - Automatically link accounts with the same email
- **One Time Password** - Easily implement email address verification, etc.

## Quick Start

```bash
bun add guardbox    # npm install guardbox
```

```ts
import { Guardbox } from 'guardbox';
import { MemoryOtpAdapter, MemorySessionAdapter } from 'guardbox/adapters/memory';
import { GoogleProvider } from 'guardbox/providers/google';

const userAdapter = new MemoryUserAdapter();
const sessionAdapter = new MemorySessionAdapter();

const googleAuth = new GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl: 'http://localhost:3000/auth/google/callback',
});

// in request handler
const auth = new Guardbox({
    appName: 'guardbox',
    adapter: {
        user: userAdapter,
        session: sessionAdapter,
    },
    cookies: {
        get: (key) => {
            return getCookie(req, key);
        },
        set: (key, value, options) => {
            setCookie(req, key, value, options);
        },
        delete: (key, options) => {
            deleteCookie(req, key, options);
        },
    },
});

// sign in
const signInUrl = googleAuth.getSignInUrl(auth);
redirect(signInUrl);

// callback
const code = getQuery(req, 'code');
const state = getQuery(req, 'state');
const success = await googleAuth.authenticate(auth, code, state);

// sign out
await auth.signOut();
```
