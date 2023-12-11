import { eq } from 'drizzle-orm';
import { Guardbox } from 'guardbox';
import {
    DrizzleSQLiteSessionAdapter,
    DrizzleSQLiteUserAdapter,
} from 'guardbox/adapters/drizzle';
import { GoogleProvider } from 'guardbox/providers/google';
import type { GoogleMetadata } from 'guardbox/providers/google';
import type { MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { db } from './db';
import { accountTable, profileTable, sessionTable, userTable } from './schema';

export const guardbox: MiddlewareHandler<{
    Variables: {
        auth: Guardbox;
    };
}> = async (c, next) => {
    const auth = new Guardbox({
        appName: 'hono-drizzle-sqlite',
        adapter: {
            user: new DrizzleSQLiteUserAdapter(db, {
                user: userTable,
                account: accountTable,
            }),
            session: new DrizzleSQLiteSessionAdapter(db, {
                session: sessionTable,
            }),
        },
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
        async onUserCreate(user, account) {
            const metadata = account?.metadata as GoogleMetadata;
            await db.insert(profileTable).values({
                id: user.id,
                name: metadata.name,
                avatarUrl: metadata.picture,
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

export async function getProfile(userId: string) {
    const [profile] = await db
        .select()
        .from(profileTable)
        .where(eq(profileTable.id, userId));
    return profile as typeof profile | undefined;
}
