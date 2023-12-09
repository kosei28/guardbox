import { Guardbox } from 'guardbox';
import {
    MemoryOtpAdapter,
    MemorySessionAdapter,
    MemoryUserAdapter,
} from 'guardbox/adapters/memory';
import { GoogleProvider } from 'guardbox/providers/google';
import type { GoogleMetadata } from 'guardbox/providers/google';
import type { MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

const adapter = {
    user: new MemoryUserAdapter(),
    session: new MemorySessionAdapter(),
    otp: new MemoryOtpAdapter(),
};

const profiles: {
    id: string;
    name?: string;
    picture?: string;
}[] = [];

export function getProfile(userId: string) {
    return profiles.find((profile) => profile.id === userId);
}

export const guardbox: MiddlewareHandler<{
    Variables: {
        auth: Guardbox;
    };
}> = async (c, next) => {
    const auth = new Guardbox({
        appName: 'hono-google-auth',
        adapter,
        cookies: {
            get: (key) => {
                return getCookie(c, key);
            },
            set: (key, value, options) => {
                setCookie(c, key, value, options);
            },
            delete: (key, options) => {
                deleteCookie(c, key, options);
            },
        },
        onUserCreate(user, account) {
            const metadata = account?.metadata as GoogleMetadata;
            profiles.push({
                id: user.id,
                name: metadata.name,
                picture: metadata.picture,
            });
        },
    });
    c.set('auth', auth);
    await next();
};

export const googleAuth = new GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    redirectUrl: `${process.env.ORIGIN}/auth/google/callback`,
});
