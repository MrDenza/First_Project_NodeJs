export const decodeJwt = (token) => {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(payloadJson);
    } catch (e) {
        console.error('Invalid JWT', e);
        return null;
    }
};

export const isTokenValid = (token) => {
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload?.exp) return false;
    return Date.now() < payload.exp * 1000;
};