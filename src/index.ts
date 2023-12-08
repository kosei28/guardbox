import type {
    Account,
    AccountUpdateValue,
    AccountWithUserId,
    CookieOptions,
    GuardboxOptions,
    Otp,
    OtpOptions,
    Session,
    SessionDuration,
    User,
    UserCreateValue,
    UserUpdateValue,
} from './types';

export class Guardbox {
    constructor(private options: GuardboxOptions) {}

    public get appName(): string {
        return this.options.appName;
    }

    public get sessionCookieKey(): string {
        return `${this.options.appName}-guardbox-session`;
    }

    public get sessionDuration(): SessionDuration {
        return {
            active: this.options.sessionDuration?.active ?? 1000 * 60 * 60 * 24,
            idle:
                this.options.sessionDuration?.idle ?? 1000 * 60 * 60 * 24 * 30,
        };
    }

    public get defaultOtpDuration(): number {
        return this.options.defaultOtpDuration ?? 1000 * 60 * 60;
    }

    public async getCookie(key: string): Promise<string | undefined> {
        return await this.options.cookies.get(key);
    }

    public async setCookie(
        key: string,
        value: string,
        options: CookieOptions = {},
    ) {
        await this.options.cookies.set(key, value, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            ...options,
            ...this.options.cookieOptions,
        });
    }

    public async deleteCookie(key: string, options: CookieOptions = {}) {
        await this.options.cookies.delete(key, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
            ...options,
            ...this.options.cookieOptions,
        });
    }

    public async createUser(
        value: UserCreateValue,
        account?: Account,
    ): Promise<User> {
        let user: User | undefined;
        let newUserCreated = false;
        if (value.email !== undefined && value.emailVerified) {
            user = await this.getUserByEmail(value.email);
        }
        if (user === undefined) {
            user = await this.options.adapter.user.createUser(value);
            newUserCreated = true;
        }
        let newAccount;
        if (account !== undefined) {
            newAccount = await this.addAccount({
                userId: user.id,
                ...account,
            });
        }
        if (newUserCreated && this.options.onUserCreate !== undefined) {
            await this.options.onUserCreate(user, newAccount);
        }
        return user;
    }

    public async getUserById(userId: string): Promise<User | undefined> {
        return await this.options.adapter.user.getUserById(userId);
    }

    public async getUserByEmail(email: string): Promise<User | undefined> {
        return await this.options.adapter.user.getUserByEmail(email);
    }

    public async updateUser(
        userId: string,
        value: UserUpdateValue,
    ): Promise<User> {
        return await this.options.adapter.user.updateUser(userId, value);
    }

    public async deleteUser(userId: string) {
        await this.options.adapter.user.deleteUser(userId);
    }

    public async addAccount(
        value: AccountWithUserId,
    ): Promise<AccountWithUserId> {
        return await this.options.adapter.user.addAccount(value);
    }

    public async getAccountByUserId(
        provider: string,
        userId: string,
    ): Promise<AccountWithUserId | undefined> {
        return await this.options.adapter.user.getAccountByUserId(
            provider,
            userId,
        );
    }

    public async getAccountByKey(
        provider: string,
        key: string,
    ): Promise<AccountWithUserId | undefined> {
        return await this.options.adapter.user.getAccountByKey(provider, key);
    }

    public async updateAccount(
        userId: string,
        provider: string,
        value: AccountUpdateValue,
    ): Promise<AccountWithUserId> {
        return await this.options.adapter.user.updateAccount(
            userId,
            provider,
            value,
        );
    }

    public async deleteAccount(userId: string, provider: string) {
        await this.options.adapter.user.deleteAccount(userId, provider);
    }

    public async getSession(): Promise<Session | undefined> {
        const sessionId = await this.getCookie(this.sessionCookieKey);
        if (sessionId === undefined) {
            return undefined;
        }
        const session =
            await this.options.adapter.session.getSession(sessionId);
        if (session === undefined) {
            await this.setSession(null);
            return undefined;
        }
        if (session.activeExpiresAt < new Date()) {
            await this.deleteSession(session.id);
            if (session.idleExpiresAt < new Date()) {
                await this.setSession(null);
                return undefined;
            }
            const newSession = await this.createSession(session.userId);
            await this.setSession(newSession);
            return newSession;
        }
        return session;
    }

    public async setSession(session: Session | null) {
        if (session === null) {
            await this.deleteCookie(this.sessionCookieKey, {
                path: '/',
                ...this.options.cookieOptions,
            });
        } else {
            await this.setCookie(this.sessionCookieKey, session.id, {
                expires: session.idleExpiresAt,
            });
        }
    }

    public async createSession(userId: string): Promise<Session> {
        return await this.options.adapter.session.createSession(
            userId,
            this.sessionDuration,
        );
    }

    public async deleteSession(sessionId: string) {
        await this.options.adapter.session.deleteSession(sessionId);
    }

    public async deleteUserSession(userId: string) {
        await this.options.adapter.session.deleteUserSession(userId);
    }

    public async signOut() {
        const sessionId = await this.getCookie(this.sessionCookieKey);
        if (sessionId !== undefined) {
            await this.deleteSession(sessionId);
            await this.setSession(null);
        }
    }

    public async createOtp(
        options: OtpOptions,
        duration = this.defaultOtpDuration,
    ): Promise<Otp> {
        if (this.options.adapter.otp === undefined) {
            throw new Error('OTP adapter not found');
        }
        return await this.options.adapter.otp.createOtp(options, duration);
    }

    public async verifyOtp(options: {
        id: string;
        type: string;
    }): Promise<Otp | undefined> {
        if (this.options.adapter.otp === undefined) {
            throw new Error('OTP adapter not found');
        }
        const otp = await this.options.adapter.otp.getOtp(options.id);
        if (otp === undefined || otp.type !== options.type) {
            return undefined;
        }
        await this.options.adapter.otp.deleteOtp(otp.id);
        if (otp.expiresAt < new Date()) {
            return undefined;
        }
        return otp;
    }

    public async deleteOtp(otpId: string) {
        if (this.options.adapter.otp === undefined) {
            throw new Error('OTP adapter not found');
        }
        await this.options.adapter.otp.deleteOtp(otpId);
    }

    public async deleteOtpByUserId(userId: string, type?: string) {
        if (this.options.adapter.otp === undefined) {
            throw new Error('OTP adapter not found');
        }
        await this.options.adapter.otp.deleteOtpByUserId(userId, type);
    }
}
