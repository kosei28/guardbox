import { OtpAdapter, SessionAdapter, UserAdapter } from '../adapter';
import type {
    AccountWithUserId,
    Otp,
    Session,
    User,
    UserUpdateValue,
} from '../types';

export class MemoryUserAdapter implements UserAdapter {
    private users: User[] = [];
    private accounts: AccountWithUserId[] = [];

    public async createUser(value: User): Promise<void> {
        this.users.push(value);
    }

    public async getUserById(userId: string): Promise<User | undefined> {
        return this.users.find((user) => user.id === userId);
    }

    public async getUserByEmail(email: string): Promise<User | undefined> {
        return this.users.find((user) => user.email === email);
    }

    public async updateUser(
        userId: string,
        value: UserUpdateValue,
    ): Promise<void> {
        const user = await this.getUserById(userId);
        if (user === undefined) {
            return;
        }
        if (value.email) {
            user.email = value.email;
        }
        if (value.emailVerified) {
            user.emailVerified = value.emailVerified;
        }
    }

    public deleteUser(userId: string): void {
        this.users = this.users.filter((user) => user.id !== userId);
    }

    public async addAccount(value: AccountWithUserId): Promise<void> {
        this.accounts.push(value);
    }

    public async getAccount(
        provider: string,
        key: string,
    ): Promise<AccountWithUserId | undefined> {
        return this.accounts.find(
            (account) => account.provider === provider && account.key === key,
        );
    }

    public async getUserAccounts(
        userId: string,
        provider?: string,
    ): Promise<AccountWithUserId[]> {
        return this.accounts.filter(
            (account) =>
                account.userId === userId &&
                (provider !== undefined ? account.provider === provider : true),
        );
    }

    public async updateAccountMetadata(
        provider: string,
        key: string,
        metadata: unknown,
    ): Promise<void> {
        const account = await this.getAccount(provider, key);
        if (account === undefined) {
            return;
        }
        account.metadata = metadata;
    }

    public deleteAccount(provider: string, key: string): void {
        this.accounts = this.accounts.filter(
            (account) => account.provider !== provider || account.key !== key,
        );
    }
}

export class MemorySessionAdapter implements SessionAdapter {
    private sessions: Session[] = [];

    public async createSession(value: Session): Promise<void> {
        this.sessions.push(value);
    }

    public async getSession(sessionId: string): Promise<Session | undefined> {
        return this.sessions.find((session) => session.id === sessionId);
    }

    public deleteSession(sessionId: string): void {
        this.sessions = this.sessions.filter(
            (session) => session.id !== sessionId,
        );
    }

    public deleteUserSessions(userId: string): void {
        this.sessions = this.sessions.filter(
            (session) => session.userId !== userId,
        );
    }
}

export class MemoryOtpAdapter implements OtpAdapter {
    private otps: Otp[] = [];

    public async createOtp(value: Otp): Promise<void> {
        this.otps.push(value);
    }

    public async getOtp(otpId: string): Promise<Otp | undefined> {
        return this.otps.find((otp) => otp.id === otpId);
    }

    public deleteOtp(otpId: string): void {
        this.otps = this.otps.filter((otp) => otp.id !== otpId);
    }

    public deleteUserOtps(userId: string, type?: string): void {
        this.otps = this.otps.filter(
            (otp) =>
                otp.userId !== userId ||
                (type !== undefined ? otp.type !== type : false),
        );
    }
}
