
export const config = {
    app: {
        name: "eta-ruby",
        description: "A simple app to track upcoming rocket launches."
    },
    // Just the bare domain name, no protocol or slashes (eg. "nextlaunch.com", NOT "https://nextlaunch.com)
    domain: "etaruby.com",
    auth: {
        signinUrl: "/auth/signin",
        signupUrl: "/auth/signup",
        defaultAuthenticatedUrl: "/editor"
    },
}
