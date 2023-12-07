import type {
    GuardboxOtpAdapter,
    GuardboxSessionAdapter,
    GuardboxUserAdapter,
} from './adapter';

export type GuardboxOptions = {
    appName: string;
    adapter: {
        user: GuardboxUserAdapter;
        session: GuardboxSessionAdapter;
        otp?: GuardboxOtpAdapter;
    };
    cookies: {
        get: (key: string) => Promise<string | undefined> | string | undefined;
        set: (key: string, value: string, options: CookieOptions) => void;
        delete: (key: string, options: CookieOptions) => void;
    };
    cookieOptions?: CookieOptions;
    sessionDuration?: {
        active?: number;
        idle?: number;
    };
    defaultOtpDuration?: number;
    onUserCreate?: (user: User, account?: AccountWithUserId) => void;
};

export type User = {
    id: string;
    email?: string;
    emailVerified: boolean;
};

export type UserCreateValue = {
    email?: string;
    emailVerified: boolean;
};

export type UserUpdateValue = {
    email?: string;
    emailVerified?: boolean;
};

export type Account = {
    provider: string;
    key: string;
    metadata?: Record<string, unknown>;
};

export type AccountWithUserId = Account & {
    userId: string;
};

export type AccountUpdateValue = {
    key?: string;
    metadata?: Record<string, unknown>;
};

export type Session = {
    id: string;
    userId: string;
    activeExpiresAt: Date;
    idleExpiresAt: Date;
};

export type SessionDuration = {
    active: number;
    idle: number;
};

export type Otp = {
    id: string;
    type: string;
    userId: string;
    state?: string;
    expiresAt: Date;
};

export type OtpOptions = {
    type: string;
    userId: string;
    state?: string;
};

export type CookieOptions = {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    secure?: boolean;
    signingSecret?: string;
    sameSite?: 'Strict' | 'Lax' | 'None';
    partitioned?: boolean;
};
