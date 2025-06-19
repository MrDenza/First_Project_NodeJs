export const CLIENT_ROUTES = {
    all: "*",
    root: "/",
    auth: {
        base: "/auth",
        login: "/auth/sign-in",
        register: "/auth/sign-up",
        verified: "/auth/verified",
    },
    user: {
        profile: "/user/:id",
        //getProfile: (id) => `/user/${id}`,
    },
    app: {
        home: "/messaria",
    },
    error: "/error",
};
