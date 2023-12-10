import { Hono } from 'hono';
import { githubAuth, guardbox } from './guardbox';
import { Layout } from './layout';

export const authApp = new Hono();

authApp.get('/github/login', guardbox, async (c) => {
    const signInUrl = githubAuth.getSignInUrl(c.var.auth);
    return c.redirect(signInUrl);
});

authApp.get('/github/callback', guardbox, async (c) => {
    const code = c.req.query('code');
    const state = c.req.query('state');
    if (code !== undefined && state !== undefined) {
        const success = await githubAuth.authenticate(c.var.auth, code, state);
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
        <Layout title="Failed to Login">
            <p>Please try to login again.</p>
            <a href="/">Back to Top</a>
        </Layout>,
    );
});
