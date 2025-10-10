export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/report/:path*',
    '/api/conversations/:path*',
    '/api/reports/:path*',
  ],
};
