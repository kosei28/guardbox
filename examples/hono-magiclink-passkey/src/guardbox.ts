import { Guardbox } from 'guardbox';
import {
    MemoryOtpAdapter,
    MemorySessionAdapter,
    MemoryUserAdapter,
} from 'guardbox/adapters/memory';
import { PasskeyProvider } from 'guardbox/providers/passkey';
import type { MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

const adapter = {
    user: new MemoryUserAdapter(),
    session: new MemorySessionAdapter(),
    otp: new MemoryOtpAdapter(),
};

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
    });
    c.set('auth', auth);
    await next();
};

export const passkeyAuth = new PasskeyProvider({
    rpID: process.env.DOMAIN as string,
    rpName: 'Guardbox example - Hono with MagicLink and Passkey',
    origin: process.env.ORIGIN as string,
});
