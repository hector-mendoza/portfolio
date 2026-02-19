import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject is too long'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
    captchaToken: z.string().min(1, 'Captcha token is required'),
});

// HTML escape function to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate input with Zod
        const validationResult = contactSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.errors },
                { status: 400 }
            );
        }

        const { name, email, subject, message, captchaToken } = validationResult.data;

        // Verify hCaptcha token
        const captchaPayload = new URLSearchParams({
            response: captchaToken,
            secret: process.env.HCAPTCHA_SECRET_KEY || '',
        });

        const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: captchaPayload.toString(),
        });

        if (!captchaResponse.ok) {
            return NextResponse.json(
                { error: 'Captcha service unavailable' },
                { status: 503 }
            );
        }

        const captchaData = await captchaResponse.json();

        if (!captchaData?.success) {
            return NextResponse.json(
                { error: 'Captcha verification failed' },
                { status: 400 }
            );
        }

        // Escape HTML to prevent XSS in email
        const escapedName = escapeHtml(name);
        const escapedEmail = escapeHtml(email);
        const escapedSubject = escapeHtml(subject);
        const escapedMessage = escapeHtml(message).replace(/\n/g, '<br>');

        // Send email using Resend
        const data = await resend.emails.send({
            from: `Portfolio Contact <${process.env.CONTACT_EMAIL || 'contact@hectormendoza.me'}>`,
            to: [process.env.CONTACT_EMAIL || 'hey@hectormendoza.me'],
            subject: `Portfolio Contact: ${escapedSubject}`,
            replyTo: email,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${escapedName}</p>
                <p><strong>Email:</strong> ${escapedEmail}</p>
                <p><strong>Subject:</strong> ${escapedSubject}</p>
                <hr />
                <p><strong>Message:</strong></p>
                <p>${escapedMessage}</p>
            `,
        });

        return NextResponse.json(
            { message: 'Email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        // Log error securely without exposing sensitive details to client
        if (process.env.NODE_ENV === 'development') {
            console.error('Contact form error:', error);
        }

        return NextResponse.json(
            { error: 'Failed to send message. Please try again.' },
            { status: 500 }
        );
    }
}
