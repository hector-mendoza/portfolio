const HCAPTCHA_VERIFY_URL = 'https://api.hcaptcha.com/siteverify';

const HCAPTCHA_TEST_SITE_KEY = '10000000-ffff-ffff-ffff-000000000001';
const HCAPTCHA_TEST_SECRET = '0x0000000000000000000000000000000000000000';

export function getHcaptchaSiteKey() {
    const siteKey =
        process.env.HCAPTCHA_SITE_KEY?.trim() ||
        process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY?.trim();

    if (siteKey) {
        return siteKey;
    }

    if (process.env.NODE_ENV === 'development') {
        return HCAPTCHA_TEST_SITE_KEY;
    }

    return '';
}

export function getHcaptchaSecretKey() {
    const secretKey =
        process.env.HCAPTCHA_SECRET_KEY?.trim() ||
        process.env.HCAPTCHA_SECRET?.trim();

    if (secretKey) {
        return secretKey;
    }

    const siteKey = getHcaptchaSiteKey();
    if (siteKey === HCAPTCHA_TEST_SITE_KEY) {
        return HCAPTCHA_TEST_SECRET;
    }

    return '';
}

function getClientIp(request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim();
    }

    return request.headers.get('x-real-ip')?.trim() || undefined;
}

export async function verifyHcaptchaToken({ token, request }) {
    const secretKey = getHcaptchaSecretKey();
    const siteKey = getHcaptchaSiteKey();

    if (!secretKey) {
        return {
            success: false,
            error: 'captcha_not_configured',
            errorCodes: ['missing-input-secret'],
        };
    }

    const payload = new URLSearchParams({
        response: token,
        secret: secretKey,
    });

    if (siteKey) {
        payload.set('sitekey', siteKey);
    }

    const remoteIp = getClientIp(request);
    if (remoteIp) {
        payload.set('remoteip', remoteIp);
    }

    const captchaResponse = await fetch(HCAPTCHA_VERIFY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
    });

    if (!captchaResponse.ok) {
        return {
            success: false,
            error: 'captcha_unavailable',
            errorCodes: ['service-unavailable'],
        };
    }

    const captchaData = await captchaResponse.json();
    const errorCodes = captchaData['error-codes'] || [];

    if (!captchaData?.success) {
        const isExpired = errorCodes.some((code) =>
            ['expired-input-response', 'invalid-or-already-seen-response', 'already-seen-response'].includes(code)
        );

        return {
            success: false,
            error: isExpired ? 'captcha_expired' : 'captcha',
            errorCodes,
            hostname: captchaData.hostname,
        };
    }

    return {
        success: true,
        hostname: captchaData.hostname,
    };
}
