import type { PgColumn, PgTableWithColumns } from 'drizzle-orm/pg-core';

type Column<T extends boolean, U> = PgColumn<{
	dataType: any;
	notNull: T;
	enumValues: any;
	tableName: any;
	columnType: any;
	data: U;
	driverParam: any;
	hasDefault: any;
	name: any;
}>;

export type PgUserTable = PgTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		email: Column<false, string>;
		emailVerified: Column<true, boolean>;
	};
	dialect: 'pg';
}>;

export type PgAccountTable = PgTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		userId: Column<true, string>;
		provider: Column<true, string>;
		key: Column<true, string>;
		metadata: Column<false, unknown>;
	};
	dialect: 'pg';
}>;

export type PgSessionTable = PgTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		userId: Column<true, string>;
		activeExpiresAt: Column<true, Date>;
		idleExpiresAt: Column<true, Date>;
	};
	dialect: 'pg';
}>;

export type PgOtpTable = PgTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		type: Column<true, string>;
		userId: Column<false, string>;
		state: Column<false, string>;
		expiresAt: Column<true, Date>;
	};
	dialect: 'pg';
}>;
