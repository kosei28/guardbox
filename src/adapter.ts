import type {
    AccountWithUserId,
    Otp,
    Session,
    User,
    UserUpdateValue,
} from './types';

export abstract class UserAdapter {
    public abstract createUser(value: User): void;

    public abstract getUserById(userId: string): Promise<User | undefined>;

    public abstract getUserByEmail(email: string): Promise<User | undefined>;

    public abstract updateUser(userId: string, value: UserUpdateValue): void;

    public abstract deleteUser(userId: string): void;

    public abstract addAccount(value: AccountWithUserId): void;

    public abstract getAccount(
        provider: string,
        key: string,
    ): Promise<AccountWithUserId | undefined>;

    public abstract getUserAccounts(
        userId: string,
        provider?: string,
    ): Promise<AccountWithUserId[]>;

    public abstract updateAccountMetadata(
        provider: string,
        key: string,
        value: unknown,
    ): void;

    public abstract deleteAccount(userId: string, provider: string): void;
}

export abstract class SessionAdapter {
    public abstract createSession(value: Session): void;

    public abstract getSession(sessionId: string): Promise<Session | undefined>;

    public abstract deleteSession(sessionId: string): void;

    public abstract deleteUserSessions(userId: string): void;
}

export abstract class OtpAdapter {
    public abstract createOtp(value: Otp): void;

    public abstract getOtp(otpId: string): Promise<Otp | undefined>;

    public abstract deleteOtp(otpId: string): void;

    public abstract deleteUserOtps(userId: string, type?: string): void;
}
