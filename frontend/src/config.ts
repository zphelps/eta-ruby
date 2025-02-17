
export const config = {
    app: {
        name: "EngScribe",
        description: "A simple app to track upcoming rocket launches."
    },
    // Just the bare domain name, no protocol or slashes (eg. "nextlaunch.com", NOT "https://nextlaunch.com)
    domain: "engscribe.com",
    auth: {
        signinUrl: "/auth/signin",
        signupUrl: "/auth/signup",
        defaultAuthenticatedUrl: "/editor"
    },
    stripe: {
        plans: [
            {
                priceId: process.env.NODE_ENV === "development" ? "price_1PsU4GHfJctXfs5WFnxtWvfW" : "test",
            }
        ]
    }
}
