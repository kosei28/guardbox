import { Hono } from 'hono';
import { googleAuth, guardbox } from './guardbox';
import { Layout } from './layout';

export const authApp = new Hono();

authApp.get('/google/login', guardbox, async (c) => {
    const signInUrl = googleAuth.getSignInUrl(c.var.auth);
    return c.redirect(signInUrl);
});

authApp.get('/google/callback', guardbox, async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    if (code !== undefined && state !== undefined) {
        const success = await googleAuth.authenticate(c.var.auth, code, state);
        if (success) {
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
            <p>再度ログインしてください。</p>
            <a href="/">トップに戻る</a>
        </Layout>,
    );
});
