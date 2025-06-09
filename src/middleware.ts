// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;

    // Example: Only 'Admin' role can access /dashboard/users
    // Ensure "Admin" matches the exact string name in your Role table.
    if (req.nextUrl.pathname.startsWith("/dashboard/users") && token?.role !== "Admin") {
      // Redirect to a specific access denied page or home page
      return NextResponse.redirect(new URL("/auth/access-denied", req.url));
    }

    // Example: Only 'Admin' or 'Editor' can access /dashboard/roles
    // Ensure "User" and "Editor" match the exact string names in your Role table.
    // If you have a 'User' role that should NOT access /dashboard/roles, then this is correct.
    // If 'editor' was a typo and should be 'Editor' from your DB, correct it.
    if (req.nextUrl.pathname.startsWith("/dashboard/roles") && (token?.role !== "Admin" && token?.role !== "Editor")) {
      return NextResponse.redirect(new URL("/auth/access-denied", req.url));
    }

    // You can add more role-based checks here
  },
  {
    callbacks: {
      // This `authorized` callback determines if the user is authenticated at all.
      // If it returns false, the user will be redirected to the signIn page.
      authorized: ({ token }) => {
        // If token exists, the user is authenticated.
        // Role-based logic happens within the `middleware` function above.
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Include all paths that need to be checked by the middleware
    '/dashboard/:path*',
    '/api/protected/:path*', // If you have protected API routes
  ],
};