import type { Guardbox } from '..';
import type { User } from '../types';

export type OAuth2Tokens = {
    access_token: string;
    refresh_token?: string;
};

export type OAuth2Profile = {
    sub: string;
    email?: string;
    emailVerified: boolean;
    raw: unknown;
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

    public get providerName() {
        return this.options.provider;
    }

    private stateCookieKey(auth: Guardbox): string {
        return `${auth.appName}-guardbox-oauth2-state`;
    }

    public getSignInUrl(auth: Guardbox): string {
        const state = Math.random().toString(36).slice(2);
        auth.setCookie(this.stateCookieKey(auth), state);
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

    public async getTokens(
        auth: Guardbox,
        code: string,
        state: string,
    ): Promise<OAuth2Tokens | undefined> {
        const savedState = await auth.getCookie(this.stateCookieKey(auth));
        await auth.deleteCookie(this.stateCookieKey(auth));
        if (savedState !== state) {
            return;
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
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: params,
            });
            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }
            const tokens: OAuth2Tokens = await res.json();
            return tokens;
        } catch (e) {
            return;
        }
    }

    public async authenticate(
        auth: Guardbox,
        code: string,
        state: string,
    ): Promise<boolean> {
        const tokens = await this.getTokens(auth, code, state);
        if (tokens === undefined) {
            return false;
        }
        const profile = await this.options.getProfile(tokens);
        if (profile === undefined) {
            return false;
        }
        const account = await auth.getAccount(
            this.options.provider,
            profile.sub,
        );
        let user: User | undefined;
        if (account !== undefined) {
            user = await auth.getUserById(account.userId);
            if (user === undefined) {
                return false;
            }
        } else {
            user = await auth.createUser(
                {
                    email: profile.email,
                    emailVerified: profile.emailVerified,
                },
                {
                    provider: this.options.provider,
                    key: profile.sub,
                    metadata: profile.raw,
                },
            );
        }
        const session = await auth.createSession(user.id);
        await auth.setSession(session);
        return true;
    }
}
