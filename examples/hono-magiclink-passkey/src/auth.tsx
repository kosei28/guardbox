import { Hono } from 'hono';
import { sendLoginUrl } from './email';
import { guardbox, passkeyAuth } from './guardbox';
import { Layout } from './layout';

export const authApp = new Hono();

authApp.post('/magiclink/send', guardbox, async (c) => {
    const body = await c.req.parseBody();
    const email = body.email;
    if (typeof email !== 'string') {
        return c.redirect('/auth/error');
    }
    const otp = await c.var.auth.createOtp({
        type: 'magiclink',
        state: email,
    });
    const verifyUrl = `${process.env.ORIGIN}/auth/magiclink/verify?token=${otp.id}`;
    const { error } = await sendLoginUrl(email, verifyUrl);
    if (error !== null) {
        console.error(error);
        return c.redirect('/auth/error');
    }
    return c.html(
        <Layout title="Login link has been sent">
            <p>
                Login link has been sent to your email address. Please open the
                link to login.
            </p>
            <a href="/">Back to Top</a>
        </Layout>,
    );
});

authApp.get('/magiclink/verify', guardbox, async (c) => {
    const token = c.req.query('token');
    if (token !== undefined) {
        const result = await c.var.auth.verifyOtp({
            type: 'magiclink',
            id: token,
        });
        if (result !== undefined) {
            let user = await c.var.auth.getUserByEmail(result.state as string);
            if (user === undefined) {
                user = await c.var.auth.createUser({
                    email: result.state,
                    emailVerified: true,
                });
            }
            const session = await c.var.auth.createSession(user.id);
            await c.var.auth.setSession(session);
            return c.redirect('/');
        }
    }
    return c.redirect('/auth/error');
});

authApp.get('/passkey/register', guardbox, async (c) => {
    const session = await c.var.auth.getSession();
    if (session === undefined) {
        throw new Error('not authenticated');
    }
    const user = await c.var.auth.getUserById(session.userId);
    if (user === undefined) {
        throw new Error('User not found');
    }
    const passkeyOptions = await passkeyAuth.getRegistrationOptions(
        c.var.auth,
        user.email as string,
    );
    return c.json({ passkeyOptions });
});

authApp.post('/passkey/register', guardbox, async (c) => {
    try {
        const { passkeyResponse } = await c.req.json();
        const success = await passkeyAuth.register(c.var.auth, passkeyResponse);
        if (!success) {
            throw new Error('failed to register passkey');
        }
        return c.redirect('/');
    } catch (e) {
        console.error(e);
        return c.body(null, 500);
    }
});

authApp.get('/passkey/login', guardbox, async (c) => {
    const passkeyOptions = await passkeyAuth.getAuthenticationOptions(
        c.var.auth,
    );
    return c.json({ passkeyOptions });
});

authApp.post('/passkey/login', guardbox, async (c) => {
    try {
        const { passkeyResponse } = await c.req.json();
        const success = await passkeyAuth.authenticate(
            c.var.auth,
            passkeyResponse,
        );
        if (!success) {
            throw new Error('failed to authenticate passkey');
        }
        return c.redirect('/');
    } catch (e) {
        console.error(e);
        return c.body(null, 500);
    }
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
