import { beforeEach, describe, expect, test } from 'bun:test';
import {
    MemoryOtpAdapter,
    MemorySessionAdapter,
    MemoryUserAdapter,
} from './adapters/memory';
import { Guardbox } from './guardbox';
import type { AccountWithUserId, Otp, Session, User } from './types';

describe('user', () => {
    let auth: Guardbox;

    beforeEach(() => {
        const userAdapter = new MemoryUserAdapter();
        const sessionAdapter = new MemorySessionAdapter();
        auth = new Guardbox({
            appName: 'guardbox',
            adapter: {
                user: userAdapter,
                session: sessionAdapter,
            },
            cookies: {
                get: () => '',
                set: () => {},
                delete: () => {},
            },
        });
    });

    test('create', async () => {
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: true,
        })) as User;
        expect(user).toEqual({
            id: user.id,
            email: 'email@example.com',
            emailVerified: true,
        });
        const user2 = (await auth.getUserById(user.id)) as User;
        expect(user).toEqual(user2);
    });

    test('create with account', async () => {
        const user = (await auth.createUser(
            {
                email: 'email@example.com',
                emailVerified: true,
            },
            {
                provider: 'provider_name',
                key: 'id',
            },
        )) as User;
        const account = (await auth.getAccount(
            'provider_name',
            'id',
        )) as AccountWithUserId;
        expect(account).toEqual({
            userId: user.id,
            provider: 'provider_name',
            key: 'id',
        });
    });

    test('create and link account', async () => {
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: true,
        })) as User;
        await auth.createUser(
            {
                email: 'email@example.com',
                emailVerified: true,
            },
            {
                provider: 'provider_name',
                key: 'id',
            },
        );
        const account = (await auth.getAccount(
            'provider_name',
            'id',
        )) as AccountWithUserId;
        expect(account).toEqual({
            userId: user.id,
            provider: 'provider_name',
            key: 'id',
        });
    });

    test('create with duplicated email', async () => {
        await auth.createUser({
            email: 'email@example.com',
            emailVerified: true,
        });
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: true,
        })) as undefined;
        expect(user).toEqual(undefined);
        const user2 = (await auth.createUser(
            {
                email: 'email@example.com',
                emailVerified: false,
            },
            {
                provider: 'provider_name',
                key: 'id',
            },
        )) as undefined;
        expect(user2).toEqual(undefined);
        await auth.createUser({
            email: 'email2@example.com',
            emailVerified: false,
        });
        const user3 = (await auth.createUser(
            {
                email: 'email2@example.com',
                emailVerified: true,
            },
            {
                provider: 'provider_name',
                key: 'id',
            },
        )) as undefined;
        expect(user3).toEqual(undefined);
    });
});

describe('session', () => {
    function createAuth(sessionDuration?: {
        active?: number;
        idle?: number;
    }) {
        const userAdapter = new MemoryUserAdapter();
        const sessionAdapter = new MemorySessionAdapter();
        const cookies: {
            [key: string]: {
                value: string;
                options: unknown;
            };
        } = {};
        const auth = new Guardbox({
            appName: 'guardbox',
            adapter: {
                user: userAdapter,
                session: sessionAdapter,
            },
            cookies: {
                get: (key) => cookies[key]?.value,
                set: (key, value, options) => {
                    cookies[key] = { value, options };
                },
                delete: (key) => {
                    delete cookies[key];
                },
            },
            sessionDuration,
        });
        return auth;
    }

    test('valid', async () => {
        const auth = createAuth();
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: false,
        })) as User;
        const session = await auth.createSession(user.id);
        await auth.setSession(session);
        const session2 = (await auth.getSession()) as Session;
        expect(session).toEqual(session2);
    });

    test('refresh', async () => {
        const auth = createAuth({ active: -1000 });
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: false,
        })) as User;
        const session = await auth.createSession(user.id);
        await auth.setSession(session);
        const session2 = (await auth.getSession()) as Session;
        expect(session).not.toEqual(session2);
        expect(session2).not.toEqual(undefined);
    });

    test('expired', async () => {
        const auth = createAuth({ active: -1000, idle: -1000 });
        const user = (await auth.createUser({
            email: 'email@example.com',
            emailVerified: false,
        })) as User;
        const session = await auth.createSession(user.id);
        await auth.setSession(session);
        const session2 = (await auth.getSession()) as undefined;
        expect(session2).toEqual(undefined);
    });
});

describe('otp', () => {
    let auth: Guardbox;

    beforeEach(() => {
        const userAdapter = new MemoryUserAdapter();
        const sessionAdapter = new MemorySessionAdapter();
        const OtpAdapter = new MemoryOtpAdapter();
        auth = new Guardbox({
            appName: 'guardbox',
            adapter: {
                user: userAdapter,
                session: sessionAdapter,
                otp: OtpAdapter,
            },
            cookies: {
                get: () => '',
                set: () => {},
                delete: () => {},
            },
        });
    });

    test('valid', async () => {
        const otp = await auth.createOtp({
            type: 'verify_email',
            userId: 'user_id',
            state: 'email@example.com',
        });
        const otp2 = (await auth.verifyOtp({
            id: otp.id,
            type: otp.type,
        })) as Otp;
        expect(otp).toEqual(otp2);
    });

    test('expired', async () => {
        const otp = await auth.createOtp(
            {
                type: 'verify_email',
                userId: 'user_id',
                state: 'email@example.com',
            },
            -1000,
        );
        const otp2 = (await auth.verifyOtp({
            id: otp.id,
            type: otp.type,
        })) as undefined;
        expect(otp2).toEqual(undefined);
    });
});
