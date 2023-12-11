import { and, eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import { OtpAdapter, SessionAdapter, UserAdapter } from '../../../adapter';
import type {
	AccountWithUserId,
	Otp,
	OtpOptions,
	Session,
	SessionDuration,
	User,
	UserCreateValue,
	UserUpdateValue,
} from '../../../types';
import type {
	SQLiteAccountTable,
	SQLiteOtpTable,
	SQLiteSessionTable,
	SQLiteUserTable,
} from './types';

export class DrizzleSQLiteUserAdapter implements UserAdapter {
	constructor(
		private db: BaseSQLiteDatabase<'async' | 'sync', unknown>,
		private tables: { user: SQLiteUserTable; account: SQLiteAccountTable },
	) {}

	public async createUser(value: UserCreateValue): Promise<User> {
		const [user] = await this.db
			.insert(this.tables.user)
			.values({
				id: Math.random().toString(36).slice(2),
				...value,
				email: value.email,
			})
			.returning();
		return user;
	}

	public async getUserById(userId: string): Promise<User | undefined> {
		const [user] = await this.db
			.select()
			.from(this.tables.user)
			.where(eq(this.tables.user.id, userId));
		return user;
	}

	public async getUserByEmail(email: string): Promise<User | undefined> {
		const [user] = await this.db
			.select()
			.from(this.tables.user)
			.where(eq(this.tables.user.email, email));
		return user;
	}

	public async updateUser(
		userId: string,
		value: UserUpdateValue,
	): Promise<User | undefined> {
		const [user] = await this.db
			.update(this.tables.user)
			.set(value)
			.where(eq(this.tables.user.id, userId))
			.returning();
		return user;
	}

	public async deleteUser(userId: string): Promise<void> {
		await this.db
			.delete(this.tables.user)
			.where(eq(this.tables.user.id, userId));
	}

	public async addAccount(
		value: AccountWithUserId,
	): Promise<AccountWithUserId> {
		const [account] = await this.db
			.insert(this.tables.account)
			.values({
				id: Math.random().toString(36).slice(2),
				...value,
			})
			.returning();
		return account;
	}

	public async getAccount(
		provider: string,
		key: string,
	): Promise<AccountWithUserId | undefined> {
		const [account] = await this.db
			.select()
			.from(this.tables.account)
			.where(
				and(
					eq(this.tables.account.provider, provider),
					eq(this.tables.account.key, key),
				),
			);
		return account;
	}

	public async getUserAccounts(
		userId: string,
		provider?: string,
	): Promise<AccountWithUserId[]> {
		const accounts = await this.db
			.select()
			.from(this.tables.account)
			.where(
				and(
					eq(this.tables.account.userId, userId),
					provider !== undefined
						? eq(this.tables.account.provider, provider)
						: undefined,
				),
			);
		return accounts;
	}

	public async updateAccountMetadata(
		provider: string,
		key: string,
		metadata: unknown,
	): Promise<AccountWithUserId | undefined> {
		const [account] = await this.db
			.update(this.tables.account)
			.set({ metadata })
			.where(
				and(
					eq(this.tables.account.provider, provider),
					eq(this.tables.account.key, key),
				),
			)
			.returning();
		return account;
	}

	public async deleteAccount(provider: string, key: string): Promise<void> {
		await this.db
			.delete(this.tables.account)
			.where(
				and(
					eq(this.tables.account.provider, provider),
					eq(this.tables.account.key, key),
				),
			);
	}
}

export class DrizzleSQLiteSessionAdapter implements SessionAdapter {
	constructor(
		private db: BaseSQLiteDatabase<'async' | 'sync', unknown>,
		private tables: { session: SQLiteSessionTable },
	) {}

	public async createSession(
		userId: string,
		duration: SessionDuration,
	): Promise<Session> {
		const [session] = await this.db
			.insert(this.tables.session)
			.values({
				id: Math.random().toString(36).slice(2),
				userId,
				activeExpiresAt: new Date(Date.now() + duration.active),
				idleExpiresAt: new Date(Date.now() + duration.active + duration.idle),
			})
			.returning();
		return session;
	}

	public async getSession(sessionId: string): Promise<Session | undefined> {
		const [session] = await this.db
			.select()
			.from(this.tables.session)
			.where(eq(this.tables.session.id, sessionId));
		return session;
	}

	public async deleteSession(sessionId: string): Promise<void> {
		await this.db
			.delete(this.tables.session)
			.where(eq(this.tables.session.id, sessionId));
	}

	public async deleteUserSessions(userId: string): Promise<void> {
		await this.db
			.delete(this.tables.session)
			.where(eq(this.tables.session.userId, userId));
	}
}

export class DrizzleSQLiteOtpAdapter implements OtpAdapter {
	constructor(
		private db: BaseSQLiteDatabase<'async' | 'sync', unknown>,
		private tables: { otp: SQLiteOtpTable },
	) {}

	public async createOtp(options: OtpOptions, duration: number): Promise<Otp> {
		const [otp] = await this.db
			.insert(this.tables.otp)
			.values({
				id: Math.random().toString(36).slice(2),
				...options,
				expiresAt: new Date(Date.now() + duration),
			})
			.returning();
		return otp;
	}

	public async getOtp(otpId: string): Promise<Otp | undefined> {
		const [otp] = await this.db
			.select()
			.from(this.tables.otp)
			.where(eq(this.tables.otp.id, otpId));
		return otp;
	}

	public async deleteOtp(otpId: string): Promise<void> {
		await this.db.delete(this.tables.otp).where(eq(this.tables.otp.id, otpId));
	}

	public async deleteUserOtps(userId: string, type?: string): Promise<void> {
		await this.db
			.delete(this.tables.otp)
			.where(
				and(
					eq(this.tables.otp.userId, userId),
					type !== undefined ? eq(this.tables.otp.type, type) : undefined,
				),
			);
	}
}
