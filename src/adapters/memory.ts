import {
    GuardboxOtpAdapter,
    GuardboxSessionAdapter,
    GuardboxUserAdapter,
} from '../adapter';
import type {
    AccountWithUserId,
    UserCreateValue,
    Session,
    UserUpdateValue,
    User,
    AccountUpdateValue,
    SessionDuration,
    Otp,
    OtpOptions,
} from '../types';

export class MemoryUserAdapter extends GuardboxUserAdapter {
    private users: User[] = [];
    private accounts: AccountWithUserId[] = [];

    public async createUser(value: UserCreateValue): Promise<User> {
        const user = {
            id: Math.random().toString(36).slice(2),
            ...value,
        };
        this.users.push(user);
        return user;
    }

    public async getUserById(userId: string): Promise<User | undefined> {
        return this.users.find((user) => user.id === userId);
    }

    public async getUserByEmail(email: string): Promise<User | undefined> {
        return this.users.find((user) => user.email === email);
    }

    public async updateUser(
        userId: string,
        value: UserUpdateValue
    ): Promise<User> {
        const user = await this.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (value.email) {
            user.email = value.email;
        }
        if (value.emailVerified) {
            user.emailVerified = value.emailVerified;
        }
        return user;
    }

    public deleteUser(userId: string): void {
        this.users = this.users.filter((user) => user.id !== userId);
    }

    public async addAccount(
        value: AccountWithUserId
    ): Promise<AccountWithUserId> {
        const user = await this.getUserById(value.userId);
        if (!user) {
            throw new Error('User not found');
        }
        this.accounts.push(value);
        return value;
    }

    public async getAccountByUserId(
        provider: string,
        userId: string
    ): Promise<AccountWithUserId | undefined> {
        return this.accounts.find(
            (account) =>
                account.provider === provider && account.userId === userId
        );
    }

    public async getAccountByKey(
        provider: string,
        key: string
    ): Promise<AccountWithUserId | undefined> {
        return this.accounts.find(
            (account) => account.provider === provider && account.key === key
        );
    }

    public async updateAccount(
        userId: string,
        provider: string,
        value: AccountUpdateValue
    ): Promise<AccountWithUserId> {
        const account = await this.getAccountByUserId(provider, userId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (value.key) {
            account.key = value.key;
        }
        if (value.metadata) {
            account.metadata = value.metadata;
        }
        return account;
    }

    public deleteAccount(userId: string, provider: string): void {
        this.accounts = this.accounts.filter(
            (account) =>
                account.userId !== userId || account.provider !== provider
        );
    }
}

export class MemorySessionAdapter extends GuardboxSessionAdapter {
    private sessions: Session[] = [];

    public async createSession(
        userId: string,
        duration: SessionDuration
    ): Promise<Session> {
        const session = {
            id: Math.random().toString(36).slice(2),
            userId,
            activeExpiresAt: new Date(Date.now() + duration.active),
            idleExpiresAt: new Date(
                Date.now() + duration.active + duration.idle
            ),
        };
        this.sessions.push(session);
        return session;
    }

    public async getSession(sessionId: string): Promise<Session | undefined> {
        return this.sessions.find((session) => session.id === sessionId);
    }

    public deleteSession(sessionId: string): void {
        this.sessions = this.sessions.filter(
            (session) => session.id !== sessionId
        );
    }

    public deleteUserSession(userId: string): void {
        this.sessions = this.sessions.filter(
            (session) => session.userId !== userId
        );
    }
}

export class MemoryOtpAdapter extends GuardboxOtpAdapter {
    private otps: Otp[] = [];

    public async createOtp(
        options: OtpOptions,
        duration: number
    ): Promise<Otp> {
        const otp = {
            id: Math.random().toString(36).slice(2),
            ...options,
            expiresAt: new Date(Date.now() + duration),
        };
        this.otps.push(otp);
        return otp;
    }

    public async getOtp(otpId: string): Promise<Otp | undefined> {
        return this.otps.find((otp) => otp.id === otpId);
    }

    public deleteOtp(otpId: string): void {
        this.otps = this.otps.filter((otp) => otp.id !== otpId);
    }

    public deleteOtpByUserId(userId: string, type?: string): void {
        this.otps = this.otps.filter(
            (otp) =>
                otp.userId !== userId ||
                (type !== undefined ? otp.type !== type : false)
        );
    }
}