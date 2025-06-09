// src/types/next-auth.d.ts
import "next-auth";
import "@auth/core/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Ensure this is string
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string; // Correctly added
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string; // Correctly added
    role?: string; // Correctly added
  }
}