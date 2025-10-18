import { withAuth } from "next-auth/middleware";

// Only protect these paths. DO NOT include /api or /curator here.
export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/account",
    // add: "/dashboard/:path*" if needed later
  ],
}; 