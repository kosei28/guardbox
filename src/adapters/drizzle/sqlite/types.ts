import type {
	SQLiteColumn,
	SQLiteTableWithColumns,
} from 'drizzle-orm/sqlite-core';

type Column<T extends boolean, U> = SQLiteColumn<{
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

export type SQLiteUserTable = SQLiteTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		email: Column<false, string>;
		emailVerified: Column<true, boolean>;
	};
	dialect: 'sqlite';
}>;

export type SQLiteAccountTable = SQLiteTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		userId: Column<true, string>;
		provider: Column<true, string>;
		key: Column<true, string>;
		metadata: Column<false, unknown>;
	};
	dialect: 'sqlite';
}>;

export type SQLiteSessionTable = SQLiteTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		userId: Column<true, string>;
		activeExpiresAt: Column<true, Date>;
		idleExpiresAt: Column<true, Date>;
	};
	dialect: 'sqlite';
}>;

export type SQLiteOtpTable = SQLiteTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		type: Column<true, string>;
		userId: Column<false, string>;
		state: Column<false, string>;
		expiresAt: Column<true, Date>;
	};
	dialect: 'sqlite';
}>;
