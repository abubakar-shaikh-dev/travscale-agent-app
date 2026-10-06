// React
import { useState } from "react";

// Router
import { useNavigate, useRouter } from "@tanstack/react-router";

// Auth
import { useGoogleLogin } from "@react-oauth/google";

// Toast
import { toast } from "sonner";

// Feature Components
import AuthStateButton from "./AuthStateButton";
import { useLoginWithGoogle } from "../queries";

// Lib
import { useAuthStore } from "@/lib/auth-store";

// Utils
import { resolvePostAuthRoute } from "../post-auth";

/**
 * "Continue with Google" button for the auth pages.
 *
 * Flow (auth-code): the library opens Google's OAuth popup and hands us a
 * one-time authorization code. The code is exchanged for a full Travscale
 * session at POST /auth/google (the client secret lives server-side), and
 * the user then routes exactly like the email login would.
 */
export function GoogleAuthButton() {
  const navigate = useNavigate();
  const loginWithGoogle = useLoginWithGoogle();
  const [succeeded, setSucceeded] = useState(false);
  // The popup phase is invisible to the mutation: track it so the spinner
  // covers popup + code exchange as one continuous "signing in".
  const [popupOpen, setPopupOpen] = useState(false);

  // AuthMethods sits above the login/register routes, so the ?redirect=
  // search param is read off the router state instead of a single route.
  const router = useRouter();
  const redirectTo = (
    router.state.location.search as { redirect?: string }
  ).redirect;

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async ({ code }) => {
      setPopupOpen(false);
      try {
        await loginWithGoogle.mutateAsync({ code });
        setSucceeded(true);
        // Routing happens after the success hold (AuthStateButton), which
        // also lets the router context refresh before guards re-evaluate.
      } catch {
        // The mutation's onError handler already surfaced the reason.
      }
    },
    onError: () => {
      setPopupOpen(false);
      toast.error("Google sign-in failed. Please try again or use email.");
    },
    onNonOAuthError: (nonOAuthError) => {
      setPopupOpen(false);
      if (nonOAuthError.type === "popup_failed_to_open") {
        toast.error(
          "Your browser blocked the Google sign-in popup. Allow popups for this site and try again."
        );
      }
      // popup_closed / popup_closed_by_user: the user closed it on purpose.
    },
  });

  const handleGoogleSignIn = () => {
    setPopupOpen(true);
    login();
  };

  return (
    <AuthStateButton
      onClick={handleGoogleSignIn}
      loading={popupOpen || loginWithGoogle.isPending}
      isSuccess={succeeded}
      loadingLabel="Signing you in..."
      successLabel="Signed in with Google"
      onSuccessComplete={() => {
        const user = useAuthStore.getState().user;
        navigate({
          to: resolvePostAuthRoute(user, redirectTo),
          replace: true,
        });
      }}
      className={
        succeeded
          ? undefined
          : "transition-[transform,box-shadow] duration-200 ease-[var(--motion-ease-out)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      }
    >
      <GoogleIcon className="size-5 shrink-0 opacity-100" />
      Continue with Google
    </AuthStateButton>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
