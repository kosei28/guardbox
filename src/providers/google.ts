import { OAuth2Provider } from './oauth2';

export type GoogleMetadata = {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    locale: string;
};

export class GoogleProvider extends OAuth2Provider {
    constructor(options: {
        clientId: string;
        clientSecret: string;
        redirectUrl: string;
    }) {
        super({
            provider: 'google',
            authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            redirectUrl: options.redirectUrl,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            scope: 'email profile',
            getProfile: async (tokens) => {
                try {
                    const res = await fetch(
                        'https://www.googleapis.com/oauth2/v3/userinfo',
                        {
                            headers: {
                                Authorization: `Bearer ${tokens.access_token}`,
                            },
                        },
                    );
                    const raw: GoogleMetadata = await res.json();
                    const profile = {
                        sub: raw.sub,
                        email: raw.email,
                        emailVerified: raw.email_verified,
                        raw,
                    };
                    return profile;
                } catch (e) {
                    return;
                }
            },
        });
    }
}
