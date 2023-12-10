import { Guardbox } from 'guardbox';
import {
    MemorySessionAdapter,
    MemoryUserAdapter,
} from 'guardbox/adapters/memory';
import { GitHubMetadata, GitHubProvider } from 'guardbox/providers/github';
import type { MiddlewareHandler } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';

const adapter = {
    user: new MemoryUserAdapter(),
    session: new MemorySessionAdapter(),
};

const profiles: {
    id: string;
    name: string;
    avatar_url: string;
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
        appName: 'hono-github-auth',
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
            const metadata = account?.metadata as GitHubMetadata;
            profiles.push({
                id: user.id,
                name: metadata.login,
                avatar_url: metadata.avatar_url,
            });
        },
    });
    c.set('auth', auth);
    await next();
};

export const githubAuth = new GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID ?? '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    redirectUrl: `${process.env.ORIGIN}/auth/github/callback`,
});
