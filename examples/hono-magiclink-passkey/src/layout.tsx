import { html } from 'hono/html';
import type { Child, FC } from 'hono/jsx';

export const Layout: FC<{ title: string }> = (props: {
    children?: Child;
    title: string;
}) => {
    return (
        <html lang="en">
            <head>
                <title>{props.title}</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                {html`
                    <script type="importmap">
                        {
                            "imports": {
                                "@simplewebauthn/browser": "https://esm.sh/@simplewebauthn/browser@8.3.4"
                            }
                        }
                    </script>
                `}
            </head>
            <body>
                <h1>{props.title}</h1>
                {props.children}
            </body>
        </html>
    );
};
