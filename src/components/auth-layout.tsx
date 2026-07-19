// React
import type React from "react";

// UI Components
import { Logo } from "@/components/logo";

// Utils
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  wide?: boolean;
  /**
   * Whether to render the "Terms / Privacy" footer. Only meaningful on
   * flows that actually have a continue-style submit (login, register).
   * Defaults to true.
   */
  showLegal?: boolean;
}

/**
 * Per-page metadata consumed by the shared auth layout route
 * (`src/routes/auth.tsx`). Each auth child route returns this from its
 * `loader`; the layout reads it off the deepest match so the shell stays
 * mounted across navigations and only the form swaps.
 */
export interface AuthPageMeta {
  title: string;
  description: string;
  wide?: boolean;
  showLegal?: boolean;
  /**
   * Whether to wrap the page in the "Continue with Google / Continue
   * with Email" method picker. Only login & register use it; the email-
   * only flows (forgot/verify/reset) render the form directly.
   */
  authMethods?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  wide,
  showLegal = true,
}: AuthLayoutProps) {
  return (
    <main className="relative lg:grid lg:min-h-screen lg:grid-cols-2 lg:overflow-hidden">
      {/* Showcase panel — hidden on mobile, editorial on desktop */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col">
        <img
          src="/images/auth-layout-image.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Layered vignette — light at the top for the logo, deep at the
            bottom where the copy sits. Tuned so the image stays visible
            while the text earns its legibility. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/20 to-black/75" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 lg:p-14">
          {/* Logo — fades in with the same curve as the form panel header */}
          <div className="auth-fade">
            <Logo className="h-7 text-white drop-shadow-md invert" />
          </div>

          {/* Bottom content staggers in, cohesive with the form fields */}
          <div className="auth-stagger max-w-md">
            <h2 className="font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-white [text-shadow:_0_2px_24px_rgb(0_0_0_/_55%)]">
              Run your travel agency with calm and clarity.
            </h2>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex min-h-dvh flex-col p-5 sm:p-6 lg:min-h-screen lg:p-8">
        {/* Header — brand on mobile (desktop shows it in the showcase aside) */}
        <header className="flex items-center">
          <Logo className="h-7 lg:hidden" />
        </header>

        {/* Main — form, centered in the remaining space */}
        <div className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10">
          <div
            className={cn(
              "w-full space-y-8 [&_[data-slot=input]]:h-11 [&_[data-slot=input]]:leading-11 [&_[data-slot=button].w-full]:h-11",
              wide ? "max-w-lg" : "max-w-sm",
            )}
          >
            <div className="space-y-2 auth-fade">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-base text-muted-foreground">{description}</p>
            </div>
            {children}

            {/* Legal — flows right beneath the content (buttons or form)
                rather than being pinned to the viewport bottom, so it sits
                close to the actions in the collapsed state too. */}
            {showLegal && (
              <p className="auth-fade text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <a
                  className="underline underline-offset-4 hover:text-primary"
                  href="#"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  className="underline underline-offset-4 hover:text-primary"
                  href="#"
                >
                  Privacy Policy
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
