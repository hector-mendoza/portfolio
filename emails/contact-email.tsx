import {
    Body,
    Column,
    Container,
    Font,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
} from '@react-email/components';

const SITE_URL = 'https://www.hectormendoza.me';

interface ContactEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
    submittedAt?: string;
}

const brand = {
    primary: '#2c6d60',
    primaryDark: '#1f4f45',
    background: '#f2f4f3',
    card: '#ffffff',
    border: '#e3e8e6',
    text: '#1c2521',
    muted: '#5b6864',
    mutedBg: '#f7f9f8',
};

export default function ContactEmail({
    name,
    email,
    subject,
    message,
    submittedAt,
}: ContactEmailProps) {
    return (
        <Html lang="en">
            <Head>
                <Font
                    fontFamily="Outfit"
                    fallbackFontFamily="Helvetica"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC0hlA.woff2',
                        format: 'woff2',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>New portfolio contact from {name}: {subject}</Preview>
            <Body style={styles.main}>
                <Container style={styles.container}>
                    <Section style={styles.logoWrap}>
                        <Img
                            src={`${SITE_URL}/logos/logo.png`}
                            width="40"
                            height="40"
                            alt="Hector Mendoza"
                            style={styles.logo}
                        />
                    </Section>

                    <Section style={styles.header}>
                        <Text style={styles.headerEyebrow}>PORTFOLIO CONTACT FORM</Text>
                        <Heading style={styles.headerTitle}>New message received</Heading>
                    </Section>

                    <Section style={styles.card}>
                        <Row>
                            <Column>
                                <Text style={styles.label}>From</Text>
                                <Text style={styles.value}>{name}</Text>
                            </Column>
                            <Column>
                                <Text style={styles.label}>Email</Text>
                                <Text style={styles.value}>
                                    <Link href={`mailto:${email}`} style={styles.link}>
                                        {email}
                                    </Link>
                                </Text>
                            </Column>
                        </Row>

                        <Hr style={styles.hr} />

                        <Text style={styles.label}>Subject</Text>
                        <Text style={styles.value}>{subject}</Text>

                        <Text style={{ ...styles.label, marginTop: '20px' }}>Message</Text>
                        <Section style={styles.messagePanel}>
                            <Text style={styles.messageText}>{message}</Text>
                        </Section>
                    </Section>

                    <Section style={styles.footer}>
                        {submittedAt ? (
                            <Text style={styles.footerText}>Sent {submittedAt}</Text>
                        ) : null}
                        <Text style={styles.footerText}>
                            Reply directly to this email to respond to {name}.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

ContactEmail.PreviewProps = {
    name: 'Jamie Rivera',
    email: 'jamie.rivera@example.com',
    subject: 'Freelance project inquiry',
    message:
        "Hi Hector,\n\nI came across your portfolio and loved the motion work on your projects page. We're looking for someone to help build out a Next.js storefront over the next few months — would you be open to a quick call this week?\n\nBest,\nJamie",
    submittedAt: 'Aug 15, 2026, 2:41 PM',
} satisfies ContactEmailProps;

const styles = {
    main: {
        backgroundColor: brand.background,
        fontFamily: 'Outfit, Helvetica, Arial, sans-serif',
        padding: '40px 0',
    },
    container: {
        maxWidth: '520px',
        margin: '0 auto',
    },
    logoWrap: {
        textAlign: 'center' as const,
        marginBottom: '16px',
    },
    logo: {
        backgroundColor: '#ffffff',
        borderRadius: '999px',
        display: 'inline-block',
        margin: '0 auto',
        padding: '8px',
    },
    header: {
        backgroundColor: brand.primary,
        backgroundImage: `linear-gradient(135deg, ${brand.primary}, ${brand.primaryDark})`,
        borderRadius: '12px 12px 0 0',
        padding: '28px 32px',
    },
    headerEyebrow: {
        color: 'rgba(255,255,255,0.75)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.12em',
        margin: '0 0 6px',
        textTransform: 'uppercase' as const,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: '22px',
        fontWeight: '600',
        margin: '0',
    },
    card: {
        backgroundColor: brand.card,
        border: `1px solid ${brand.border}`,
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '28px 32px 8px',
    },
    label: {
        color: brand.primary,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.08em',
        margin: '0 0 4px',
        textTransform: 'uppercase' as const,
    },
    value: {
        color: brand.text,
        fontSize: '15px',
        lineHeight: '22px',
        margin: '0 0 16px',
    },
    link: {
        color: brand.primary,
        textDecoration: 'none',
    },
    hr: {
        borderColor: brand.border,
        margin: '4px 0 16px',
    },
    messagePanel: {
        backgroundColor: brand.mutedBg,
        border: `1px solid ${brand.border}`,
        borderRadius: '8px',
        margin: '8px 0 20px',
        padding: '16px 18px',
    },
    messageText: {
        color: brand.text,
        fontSize: '14px',
        lineHeight: '22px',
        margin: '0',
        whiteSpace: 'pre-wrap' as const,
    },
    footer: {
        padding: '20px 8px 0',
        textAlign: 'center' as const,
    },
    footerText: {
        color: brand.muted,
        fontSize: '12px',
        lineHeight: '18px',
        margin: '0 0 4px',
    },
};
