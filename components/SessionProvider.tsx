"use client";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // NextAuth v5 doesn't need SessionProvider wrapper
  return <>{children}</>;
}

