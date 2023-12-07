import { Hono } from 'hono';
import { googleAuth, guardbox } from './guardbox';
import { Layout } from './layout';

export const authApp = new Hono();

authApp.get('/google/login', guardbox, async (c) => {
    const loginUrl = googleAuth.signIn(c.var.auth);
    return c.redirect(loginUrl);
});

authApp.get('/google/callback', guardbox, async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    if (code !== undefined && state !== undefined) {
        const session = await googleAuth.createSessionByCode(
            c.var.auth,
            code,
            state
        );
        if (session !== undefined) {
            await c.var.auth.setSession(session);
            return c.redirect('/');
        }
    }
    return c.redirect('/auth/error');
});

authApp.post('/logout', guardbox, async (c) => {
    await c.var.auth.signOut();
    return c.redirect('/');
});

authApp.get('/error', async (c) => {
    return c.html(
        <Layout title="ログインに失敗しました">
            <h1>ログインに失敗しました</h1>
            <p>再度ログインしてください。</p>
            <a href="/">トップに戻る</a>
        </Layout>
    );
});
