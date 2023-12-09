import { Hono } from 'hono';
import { html } from 'hono/html';
import { authApp } from './auth';
import { guardbox } from './guardbox';
import { Layout } from './layout';

const app = new Hono();

app.get('/', guardbox, async (c) => {
    const session = await c.var.auth.getSession();
    if (session !== undefined) {
        const user = await c.var.auth.getUserById(session.userId);
        return c.html(
            <Layout title="Guardbox example - Hono with MagicLink and Passkey">
                <p>Welcome {user?.email}</p>
                <button
                    type="button"
                    onclick="registerPasskey();"
                    style="margin-bottom: 1rem;"
                >
                    Register Passkey
                </button>
                <form method="POST" action="/auth/logout">
                    <button type="submit">Logout</button>
                </form>
                {html`
                    <script type="module">
                        import {browserSupportsWebAuthn, startRegistration} from '@simplewebauthn/browser';
                        window.registerPasskey = async () => {
                            if (!browserSupportsWebAuthn()) {
                                alert('WebAuthn is not supported on this browser');
                                return;
                            }
                            const res = await fetch('/auth/passkey/register');
                            const { passkeyOptions } = await res.json();
                            try {
                                const passkeyResponse = await startRegistration(passkeyOptions);
                                const res = await fetch('/auth/passkey/register', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ passkeyResponse }),
                                });
                                if (res.ok) {
                                    alert('Passkey has been registered');
                                }
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    </script>
                `}
            </Layout>,
        );
    }
    return c.html(
        <Layout title="Guardbox example - Hono with MagicLink and Passkey">
            <form method="POST" action="/auth/magiclink/send">
                <div style="margin-bottom: 0.5rem;">
                    <label>
                        <span style="margin-right: 0.5rem;">Email:</span>
                        <input
                            type="text"
                            name="email"
                            style="width: 16rem; font-size: 16px;"
                        />
                    </label>
                </div>
                <button type="submit">Login with Email</button>
            </form>
            <button type="button" onclick="loginWithPasskey();">
                Login with Passkey
            </button>
            {html`
                <script type="module">
                    import {browserSupportsWebAuthn, startAuthentication} from '@simplewebauthn/browser';
                    window.loginWithPasskey = async () => {
                        if (!browserSupportsWebAuthn()) {
                            alert('WebAuthn is not supported on this browser');
                            return;
                        }
                        const res = await fetch('/auth/passkey/login');
                        const { passkeyOptions } = await res.json();
                        try {
                            const passkeyResponse = await startAuthentication(passkeyOptions);
                            await fetch('/auth/passkey/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ passkeyResponse }),
                            });
                            location.reload();
                        } catch (error) {
                            console.error(error);
                        }
                    }
                </script>
            `}
        </Layout>,
    );
});

app.route('/auth', authApp);

export default app;
