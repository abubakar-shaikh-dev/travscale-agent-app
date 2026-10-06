// React
import { useState } from "react";
import type React from "react";

// Icons
import { MailIcon } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";

// Feature Components
import { GoogleAuthButton } from "./GoogleAuthButton";

// Utils
import { cn } from "@/lib/utils";

export interface AuthMethodsProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Auth method picker for auth pages.
 *
 * Renders the "Continue with Google" and "Continue with Email" buttons
 * initially. The email/password form (passed as `children`) is hidden until
 * the user picks the email path: keeping the first impression calm and
 * progressive instead of dumping every field at once.
 *
 * The reveal uses a CSS grid `grid-template-rows: 0fr → 1fr` height
 * transition so the form slides open smoothly. The form stays in the DOM
 * (just collapsed) to avoid mount/unmount race conditions with TanStack
 * Form's `<Suspense>` boundary.
 *
 * The Google button is self-contained (see GoogleAuthButton): it opens the
 * OAuth popup, exchanges the code at /auth/google, and routes on success.
 */
export function AuthMethods({ className, children }: AuthMethodsProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className={cn("auth-fade", className)}>
      <GoogleAuthButton />

      {/* "Continue with Email": collapses out when the form is revealed.
          Same curve + duration as the form expand below so the two read
          as one coordinated motion (exit uses ease-out, not ease-in). */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--motion-ease-out)]",
          showForm
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100",
        )}
        aria-hidden={showForm || undefined}
      >
        <div className="overflow-hidden">
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full transition-[transform,box-shadow] duration-200 ease-[var(--motion-ease-out)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            onClick={() => setShowForm(true)}
          >
            <MailIcon className="size-5 shrink-0 opacity-100" />
            Continue with Email
          </Button>
        </div>
      </div>

      {/* Form: expands in when "Continue with Email" is clicked */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--motion-ease-out)]",
          showForm
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
        aria-hidden={!showForm || undefined}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 pt-3">
            <div className="flex items-center gap-4" aria-hidden="true">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium tracking-wider text-muted-foreground">
                OR
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
