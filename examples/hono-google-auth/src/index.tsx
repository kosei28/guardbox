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
                <h1>Guardbox example - Hono with Google Auth</h1>
                <img src={profile?.picture} alt={profile?.name} />
                <p>ようこそ、{profile?.name}さん。</p>
                <form method="POST" action="/auth/logout">
                    <button type="submit">ログアウト</button>
                </form>
            </Layout>,
        );
    }
    return c.html(
        <Layout title="Guardbox example - Hono with Google Auth">
            <h1>Guardbox example - Hono with Google Auth</h1>
            <a href="/auth/google/login">Googleでログイン</a>
        </Layout>,
    );
});

app.route('/auth', authApp);

export default app;
