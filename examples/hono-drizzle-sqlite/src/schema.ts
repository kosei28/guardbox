import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const profileTable = sqliteTable('profiles', {
    id: text('id')
        .primaryKey()
        .references(() => userTable.id),
    name: text('name').notNull(),
    avatarUrl: text('avatar_url').notNull(),
});

export const userTable = sqliteTable('users', {
    id: text('id').primaryKey(),
    email: text('email').unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
});

export const accountTable = sqliteTable(
    'accounts',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        userId: text('user_id').notNull(),
        provider: text('provider').notNull(),
        key: text('key').notNull(),
        metadata: text('metadata', { mode: 'json' }),
    },
    (t) => ({
        unq: unique().on(t.provider, t.key),
    }),
);

// You can also use the following schema definition:
// export const accountTable = sqliteTable(
//     'accounts',
//     {
//         userId: text('user_id').notNull(),
//         provider: text('provider').notNull(),
//         key: text('key').notNull(),
//         metadata: text('metadata', { mode: 'json' }),
//     },
//     (t) => ({
//         pk: primaryKey({ columns: [t.provider, t.key] }),
//     }),
// );

export const sessionTable = sqliteTable('sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    activeExpiresAt: integer('active_expires_at', {
        mode: 'timestamp',
    }).notNull(),
    idleExpiresAt: integer('idle_expires_at', {
        mode: 'timestamp',
    }).notNull(),
});
