import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  clockSkewInMs: 60000,
  publicRoutes: ["/", "/api/webhooks/stripe", "/auth"],
  afterAuth: (auth, req) => {
    if (auth.userId) {
      NextResponse.redirect(new URL("/auth", req.url));
    }
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
