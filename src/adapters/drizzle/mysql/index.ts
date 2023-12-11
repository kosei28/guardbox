import { and, eq } from 'drizzle-orm';
import type { MySqlDatabase } from 'drizzle-orm/mysql-core';
import { OtpAdapter, SessionAdapter, UserAdapter } from '../../../adapter';
import type {
	AccountWithUserId,
	Otp,
	Session,
	User,
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

	public async createUser(value: User): Promise<void> {
		await this.db.insert(this.tables.user).values(value);
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
	): Promise<void> {
		await this.db
			.update(this.tables.user)
			.set(value)
			.where(eq(this.tables.user.id, userId));
	}

	public async deleteUser(userId: string): Promise<void> {
		await this.db
			.delete(this.tables.user)
			.where(eq(this.tables.user.id, userId));
	}

	public async addAccount(value: AccountWithUserId): Promise<void> {
		await this.db.insert(this.tables.account).values(value);
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
	): Promise<void> {
		await this.db
			.update(this.tables.account)
			.set({ metadata })
			.where(
				and(
					eq(this.tables.account.provider, provider),
					eq(this.tables.account.key, key),
				),
			);
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

	public async createSession(value: Session): Promise<void> {
		await this.db.insert(this.tables.session).values(value);
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

	public async createOtp(value: Otp): Promise<void> {
		await this.db.insert(this.tables.otp).values(value);
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
