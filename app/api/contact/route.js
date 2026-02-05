import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        const { name, email, subject, message, captchaToken } = await request.json();

        // Validate required fields
        if (!name || !email || !subject || !message || !captchaToken) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Verify hCaptcha token
        const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `response=${captchaToken}&secret=${process.env.HCAPTCHA_SECRET_KEY}`,
        });

        const captchaData = await captchaResponse.json();

        if (!captchaData.success) {
            return NextResponse.json(
                { error: 'Captcha verification failed' },
                { status: 400 }
            );
        }

        // Send email using Resend
        const data = await resend.emails.send({
            from: `Portfolio Contact <${process.env.CONTACT_EMAIL || 'hey@hectormendoza.me'}>`, // Change this to your verified domain
            to: [process.env.CONTACT_EMAIL || 'hey@hectormendoza.me'],
            subject: `Portfolio Contact: ${subject}`,
            replyTo: email,
            html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
        });

        return NextResponse.json(
            { message: 'Email sent successfully', data },
            { status: 200 }
        );
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Failed to send message. Please try again.' },
            { status: 500 }
        );
    }
}
