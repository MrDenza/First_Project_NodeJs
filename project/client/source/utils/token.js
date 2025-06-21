export const decodeJwt = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payloadJson);
    } catch (e) {
        return null;
    }
};

export const isTokenValid = (token, expireThreshold = 300) => {
    // истёк ли токен и срок действия не меньше 5 минут
    if (!token) return false;

    const payload = decodeJwt(token);
    if (!payload?.exp) return false;

    const currentTime = Date.now() / 1000;
    const expiresIn = payload.exp - currentTime;

    return expiresIn > expireThreshold;
};