import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe']
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// In the context of the code you provided, using the authMiddleware from @clerk/nextjs with publicRoutes allows you to define specific routes in your Next.js application that can be accessed without requiring user authentication. This means that anyone, regardless of whether they are signed in or not, can access these routes.
