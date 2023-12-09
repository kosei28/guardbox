import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLoginUrl(to: string, url: string) {
    await resend.emails.send({
        from: 'noreply@resend.dev',
        to,
        subject: 'Login link for logging in',
        html: `<p>Open the link to login<br><a href="${url}">Login link</a></p>`,
    });
}
