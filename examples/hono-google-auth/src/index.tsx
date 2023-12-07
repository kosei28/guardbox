import { Hono } from 'hono';
import { authApp } from './auth';
import { Layout } from './layout';
import { guardbox } from './guardbox';

const app = new Hono();

app.get('/', guardbox, async (c) => {
    const session = await c.var.auth.getSession();
    if (session !== undefined) {
        const user = await c.var.auth.getUserById(session.userId);
        const name = user?.email?.split('@')[0];
        return c.html(
            <Layout title="Guardbox example - Hono with Google Auth">
                <h1>Guardbox example - Hono with Google Auth</h1>
                <p>ようこそ、{name}さん。</p>
                <form method="POST" action="/auth/logout">
                    <button type="submit">ログアウト</button>
                </form>
            </Layout>
        );
    }
    return c.html(
        <Layout title="Guardbox example - Hono with Google Auth">
            <h1>Guardbox example - Hono with Google Auth</h1>
            <a href="/auth/google/login">Googleでログイン</a>
        </Layout>
    );
});

app.route('/auth', authApp);

export default app;
