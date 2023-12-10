import { OAuth2Provider } from './oauth2';

export type GitHubUser = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    name: string | null;
    company: string | null;
    blog: string | null;
    location: string | null;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username?: string | null;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: string;
    updated_at: string;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan?: {
        collaborators: number;
        name: string;
        space: number;
        private_repos: number;
        [k: string]: unknown;
    };
    suspended_at?: string | null;
    business_plus?: boolean;
    ldap_dn?: string;
    [k: string]: unknown;
};

export type GitHubEmail = {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: string | null;
    [k: string]: unknown;
};

export type GitHubMetadata = GitHubUser & {
    emails: GitHubEmail[];
};

export class GitHubProvider extends OAuth2Provider {
    constructor(options: {
        clientId: string;
        clientSecret: string;
        redirectUrl: string;
    }) {
        super({
            provider: 'github',
            authorizationUrl: 'https://github.com/login/oauth/authorize',
            tokenUrl: 'https://github.com/login/oauth/access_token',
            redirectUrl: options.redirectUrl,
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            scope: 'read:user user:email',
            getProfile: async (tokens) => {
                try {
                    const userRes = await fetch('https://api.github.com/user', {
                        headers: {
                            Authorization: `Bearer ${tokens.access_token}`,
                        },
                    });
                    const user: GitHubUser = await userRes.json();
                    const emailsRes = await fetch(
                        'https://api.github.com/user/emails',
                        {
                            headers: {
                                Authorization: `Bearer ${tokens.access_token}`,
                            },
                        },
                    );
                    const emails: GitHubEmail[] = await emailsRes.json();
                    const primaryEmail = emails.find((email) => email.primary);
                    const profile = {
                        sub: user.id.toString(),
                        email: primaryEmail?.email,
                        emailVerified: primaryEmail?.verified ?? false,
                        raw: {
                            ...user,
                            emails,
                        },
                    };
                    return profile;
                } catch (e) {
                    return;
                }
            },
        });
    }
}
