import type {
	MySqlColumn,
	MySqlTableWithColumns,
} from 'drizzle-orm/mysql-core';

type Column<T extends boolean, U> = MySqlColumn<{
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

export type MySqlUserTable = MySqlTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		email: Column<false, string>;
		emailVerified: Column<true, boolean>;
	};
	dialect: 'mysql';
}>;

export type MySqlAccountTable = MySqlTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		userId: Column<true, string>;
		provider: Column<true, string>;
		key: Column<true, string>;
		metadata: Column<false, unknown>;
	};
	dialect: 'mysql';
}>;

export type MySqlSessionTable = MySqlTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		userId: Column<true, string>;
		activeExpiresAt: Column<true, Date>;
		idleExpiresAt: Column<true, Date>;
	};
	dialect: 'mysql';
}>;

export type MySqlOtpTable = MySqlTableWithColumns<{
	name: any;
	schema: any;
	columns: {
		id: Column<true, string>;
		type: Column<true, string>;
		userId: Column<false, string>;
		state: Column<false, string>;
		expiresAt: Column<true, Date>;
	};
	dialect: 'mysql';
}>;
