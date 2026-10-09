import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Same origin in production; leave unset so the client uses window.location.origin.
});

export const { signIn, signUp, signOut, useSession } = authClient;
