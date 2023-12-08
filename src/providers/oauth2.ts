import type { Guardbox } from '..';
import type { User } from '../types';

export type OAuth2Tokens = {
    access_token: string;
    refresh_token?: string;
};

export type OAuth2Profile = {
    id: string;
    email?: string;
    emailVerified: boolean;
    raw: Record<string, unknown>;
};

export class OAuth2Provider {
    constructor(
        private options: {
            provider: string;
            clientId: string;
            clientSecret: string;
            authorizationUrl: string;
            tokenUrl: string;
            redirectUrl: string;
            scope?: string;
            getProfile: (
                tokens: OAuth2Tokens,
            ) => Promise<OAuth2Profile | undefined>;
        },
    ) {}

    public stateCookieKey(appName: string): string {
        return `${appName}-guardbox-oauth2-state`;
    }

    public signIn(auth: Guardbox): string {
        const state = Math.random().toString(36).slice(2);
        auth.setCookie(this.stateCookieKey(auth.appName), state);
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.options.clientId,
            redirect_uri: this.options.redirectUrl,
            state,
        });
        if (this.options.scope !== undefined) {
            params.set('scope', this.options.scope);
        }
        const url = new URL(this.options.authorizationUrl);
        url.search = params.toString();
        return url.toString();
    }

    public async verifyCode(
        auth: Guardbox,
        code: string,
        state: string,
    ): Promise<OAuth2Profile | undefined> {
        const savedState = await auth.getCookie(
            this.stateCookieKey(auth.appName),
        );
        await auth.deleteCookie(this.stateCookieKey(auth.appName));
        if (savedState !== state) {
            return undefined;
        }
        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                redirect_uri: this.options.redirectUrl,
                client_id: this.options.clientId,
                client_secret: this.options.clientSecret,
                code,
            });
            const res = await fetch(this.options.tokenUrl, {
                method: 'post',
                body: params,
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }
            const tokens: OAuth2Tokens = await res.json();
            const profile = await this.options.getProfile(tokens);
            if (profile === undefined) {
                throw new Error('Invalid token');
            }
            return profile;
        } catch (e) {
            return undefined;
        }
    }

    public async createSessionByCode(
        auth: Guardbox,
        code: string,
        state: string,
    ) {
        const profile = await this.verifyCode(auth, code, state);
        if (profile === undefined) {
            return undefined;
        }
        const account = await auth.getAccountByKey(
            this.options.provider,
            profile.id,
        );
        let user: User | undefined;
        if (account !== undefined) {
            user = await auth.getUserById(account.userId);
            if (user === undefined) {
                return undefined;
            }
        } else {
            user = await auth.createUser(
                {
                    email: profile.email,
                    emailVerified: profile.emailVerified,
                },
                {
                    provider: this.options.provider,
                    key: profile.id,
                    metadata: profile.raw,
                },
            );
        }
        return await auth.createSession(user.id);
    }
}
