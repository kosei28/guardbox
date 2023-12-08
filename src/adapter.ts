import type {
    AccountWithUserId,
    Otp,
    OtpOptions,
    Session,
    SessionDuration,
    User,
    UserCreateValue,
    UserUpdateValue,
} from './types';

export abstract class GuardboxUserAdapter {
    public abstract createUser(value: UserCreateValue): Promise<User>;

    public abstract getUserById(userId: string): Promise<User | undefined>;

    public abstract getUserByEmail(email: string): Promise<User | undefined>;

    public abstract updateUser(
        userId: string,
        value: UserUpdateValue,
    ): Promise<User>;

    public abstract deleteUser(userId: string): void;

    public abstract addAccount(
        value: AccountWithUserId,
    ): Promise<AccountWithUserId>;

    public abstract getAccount(
        provider: string,
        key: string,
    ): Promise<AccountWithUserId | undefined>;

    public abstract getUserAccounts(
        userId: string,
        provider: string,
    ): Promise<AccountWithUserId[] | undefined>;

    public abstract deleteAccount(userId: string, provider: string): void;
}

export abstract class GuardboxSessionAdapter {
    public abstract createSession(
        userId: string,
        duration: SessionDuration,
    ): Promise<Session>;

    public abstract getSession(sessionId: string): Promise<Session | undefined>;

    public abstract deleteSession(sessionId: string): void;

    public abstract deleteUserSession(userId: string): void;
}

export abstract class GuardboxOtpAdapter {
    public abstract createOtp(
        options: OtpOptions,
        duration: number,
    ): Promise<Otp>;

    public abstract getOtp(otpId: string): Promise<Otp | undefined>;

    public abstract deleteOtp(otpId: string): void;

    public abstract deleteUserOtps(userId: string, type?: string): void;
}
