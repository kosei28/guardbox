import { and, eq } from 'drizzle-orm';
import type { MySqlDatabase } from 'drizzle-orm/mysql-core';
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
	MySqlAccountTable,
	MySqlOtpTable,
	MySqlSessionTable,
	MySqlUserTable,
} from './types';

export class DrizzleMySqlUserAdapter implements UserAdapter {
	constructor(
		private db: MySqlDatabase<any, any>,
		private tables: { user: MySqlUserTable; account: MySqlAccountTable },
	) {}

	public async createUser(value: UserCreateValue): Promise<User> {
		const user = {
			id: Math.random().toString(36).slice(2),
			...value,
			email: value.email ?? null,
		};
		await this.db.insert(this.tables.user).values(user);
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
			.select()
			.from(this.tables.user)
			.where(eq(this.tables.user.id, userId));
		if (user === undefined) {
			return;
		}
		await this.db
			.update(this.tables.user)
			.set(value)
			.where(eq(this.tables.user.id, user.id));
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
		const account = {
			id: Math.random().toString(36).slice(2),
			...value,
		};
		await this.db.insert(this.tables.account).values(account);
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
			.select()
			.from(this.tables.account)
			.where(
				and(
					eq(this.tables.account.provider, provider),
					eq(this.tables.account.key, key),
				),
			);
		if (account === undefined) {
			return;
		}
		await this.db
			.update(this.tables.account)
			.set({ metadata })
			.where(eq(this.tables.account.id, account.id));
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

export class DrizzleMySqlSessionAdapter implements SessionAdapter {
	constructor(
		private db: MySqlDatabase<any, any>,
		private tables: { session: MySqlSessionTable },
	) {}

	public async createSession(
		userId: string,
		duration: SessionDuration,
	): Promise<Session> {
		const session = {
			id: Math.random().toString(36).slice(2),
			userId,
			activeExpiresAt: new Date(Date.now() + duration.active),
			idleExpiresAt: new Date(Date.now() + duration.active + duration.idle),
		};
		await this.db.insert(this.tables.session).values(session);
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

export class DrizzleMySqlOtpAdapter implements OtpAdapter {
	constructor(
		private db: MySqlDatabase<any, any>,
		private tables: { otp: MySqlOtpTable },
	) {}

	public async createOtp(options: OtpOptions, duration: number): Promise<Otp> {
		const otp = {
			id: Math.random().toString(36).slice(2),
			...options,
			userId: options.userId ?? null,
			state: options.state ?? null,
			expiresAt: new Date(Date.now() + duration),
		};
		await this.db.insert(this.tables.otp).values(otp);
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
