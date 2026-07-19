// React
import { useEffect, useRef } from "react";

// Router
import { Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Icons
import { CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

// Feature Components
import { useVerifyEmail } from "../queries";

export interface VerifyEmailProps {
  className?: string;
  token: string;
}

export function VerifyEmail({ className, token }: VerifyEmailProps) {
  const verifyMutation = useVerifyEmail();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    if (!token) return;
    calledRef.current = true;
    verifyMutation.mutate({ token });
  }, [token, verifyMutation]);

  if (!token) {
    return (
      <div className={`space-y-4 ${className ?? ""}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Invalid verification link</h2>
          <p className="text-sm text-muted-foreground">
            This verification link is missing a token. Please use the link from
            your email.
          </p>
        </div>
        <Button render={<Link to="/auth/login" />} className="w-full">
          Back to sign in
        </Button>
      </div>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <div className={`flex flex-col items-center gap-3 text-center ${className ?? ""}`}>
        <Spinner className="size-8" />
        <h2 className="text-lg font-semibold">Verifying your email…</h2>
        <p className="text-sm text-muted-foreground">Just a moment.</p>
      </div>
    );
  }

  if (verifyMutation.isError) {
    return (
      <div className={`space-y-4 ${className ?? ""}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircleIcon className="size-10 text-destructive" />
          <h2 className="text-lg font-semibold">Verification failed</h2>
          <p className="text-sm text-muted-foreground">
            This verification link is invalid or has expired. You can request a
            new one from your account.
          </p>
        </div>
        <Button render={<Link to="/auth/login" />} className="w-full">
          Back to sign in
        </Button>
      </div>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <div className={`space-y-4 ${className ?? ""}`}>
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2Icon className="size-10 text-emerald-500" />
          <h2 className="text-lg font-semibold">Email verified</h2>
          <p className="text-sm text-muted-foreground">
            Your email has been confirmed. You can now sign in to your account.
          </p>
        </div>
        <Button render={<Link to="/auth/login" />} className="w-full">
          Continue to sign in
        </Button>
      </div>
    );
  }

  return null;
}
