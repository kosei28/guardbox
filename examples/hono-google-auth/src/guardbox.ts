import type { MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { Guardbox } from 'guardbox';
import {
    MemoryUserAdapter,
    MemorySessionAdapter,
    MemoryOtpAdapter,
} from 'guardbox/adapters/memory';
import { GoogleProvider } from 'guardbox/providers/google';

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
            profiles.push({
                id: user.id,
                name: account?.metadata?.name as string | undefined,
                picture: account?.metadata?.picture as string | undefined,
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
