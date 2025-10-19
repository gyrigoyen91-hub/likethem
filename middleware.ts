import { withAuth } from "next-auth/middleware";

// Only protect these paths. DO NOT include /api or /curator here.
export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    "/account/:path*",
    "/dashboard/:path*",
    // Note: Access checks for checkout/cart will be handled in individual pages/API routes
  ],
}; 