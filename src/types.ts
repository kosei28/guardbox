import type { OtpAdapter, SessionAdapter, UserAdapter } from './adapter';

export type GuardboxOptions = {
    appName: string;
    adapter: {
        user: UserAdapter;
        session: SessionAdapter;
        otp?: OtpAdapter;
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
    email: string | null;
    emailVerified: boolean;
};

export type UserCreateValue = {
    email?: string | null;
    emailVerified: boolean;
};

export type UserUpdateValue = {
    email?: string | null;
    emailVerified?: boolean;
};

export type Account<T = unknown> = {
    provider: string;
    key: string;
} & (unknown extends T
    ? {
          metadata?: unknown;
      }
    : {
          metadata: T;
      });

export type AccountWithUserId<T = unknown> = Account<T> & {
    userId: string;
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
    userId: string | null;
    state: string | null;
    expiresAt: Date;
};

export type OtpOptions = {
    type: string;
    userId?: string | null;
    state?: string | null;
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
