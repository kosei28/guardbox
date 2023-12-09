import { Hono } from 'hono';
import { authApp } from './auth';
import { getProfile, guardbox } from './guardbox';
import { Layout } from './layout';

const app = new Hono();

app.get('/', guardbox, async (c) => {
    const session = await c.var.auth.getSession();
    if (session !== undefined) {
        const profile = getProfile(session.userId);
        return c.html(
            <Layout title="Guardbox example - Hono with Google Auth">
                <img src={profile?.picture} alt={profile?.name} />
                <p>Welcome {profile?.name}</p>
                <form method="POST" action="/auth/logout">
                    <button type="submit">Logout</button>
                </form>
            </Layout>,
        );
    }
    return c.html(
        <Layout title="Guardbox example - Hono with Google Auth">
            <a href="/auth/google/login">Login with Google</a>
        </Layout>,
    );
});

app.route('/auth', authApp);

export default app;
