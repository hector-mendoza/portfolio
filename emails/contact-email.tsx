import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface ContactEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactEmail({ name, email, subject, message }: ContactEmailProps) {
    return (
        <Html lang="en">
            <Head />
            <Preview>New portfolio contact form submission from {name}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>New Contact Form Submission</Heading>
                    <Text style={text}>
                        <strong>From:</strong> {name}
                    </Text>
                    <Text style={text}>
                        <strong>Email:</strong> {email}
                    </Text>
                    <Text style={text}>
                        <strong>Subject:</strong> {subject}
                    </Text>
                    <Hr style={hr} />
                    <Text style={text}>
                        <strong>Message:</strong>
                    </Text>
                    <Text style={{ ...text, whiteSpace: 'pre-wrap' }}>{message}</Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f6f6',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '32px',
    maxWidth: '560px',
};

const heading = {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '16px',
};

const text = {
    fontSize: '14px',
    lineHeight: '22px',
    color: '#333333',
};

const hr = {
    borderColor: '#e6e6e6',
    margin: '20px 0',
};
