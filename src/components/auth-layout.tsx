// React
import type React from "react";

// Router
import { Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

// Icons
import { ChevronLeftIcon } from "lucide-react";

// Shared Components
import { FloatingPaths } from "@/components/floating-paths";

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

export function AuthLayout({
	children,
	title,
	description,
	wide,
	showLegal = true,
}: AuthLayoutProps) {
	return (
		<main className="relative lg:grid lg:min-h-screen lg:grid-cols-2 lg:overflow-hidden">
			{/* Showcase panel — hidden on mobile, atmospheric on desktop */}
			<aside className="relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex lg:p-14">
				<div className="absolute inset-0 bg-linear-to-b from-emerald-500 to-emerald-600" />
				<div className="absolute -left-40 top-1/3 size-[36rem] -translate-x-1/3 rounded-full bg-emerald-300/20 blur-3xl" />
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>

				<div className="relative z-10">
					<Logo className="h-7" />
				</div>

				<div className="relative z-10 max-w-md space-y-8">
					<h2 className="font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-emerald-950">
						Run your travel agency with calm and clarity.
					</h2>
					<figure className="border-l-2 border-emerald-950/20 pl-5">
						<blockquote className="text-base leading-relaxed text-emerald-950/80">
							&ldquo;Travscale has helped me save time and serve my clients
							faster than ever before.&rdquo;
						</blockquote>
						<figcaption className="mt-3 font-mono text-xs font-medium uppercase tracking-wider text-emerald-950/60">
							Ali Hassan &middot; Travel Agent
						</figcaption>
					</figure>
				</div>
			</aside>

			{/* Form panel */}
			<div className="relative flex min-h-dvh flex-col p-5 sm:p-6 lg:min-h-screen lg:p-8">
				{/* Header — brand on mobile, back-to-home on the right */}
				<header className="flex items-center justify-between">
					<Logo className="h-7 lg:hidden" />
					<Button
						render={<Link to="/" />}
						variant="ghost"
						className="-me-2 lg:me-0 lg:-ms-2"
					>
						<ChevronLeftIcon />
						Home
					</Button>
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
							<p className="text-base text-muted-foreground">
								{description}
							</p>
						</div>
						{children}
					</div>
				</div>

				{/* Footer — legal, pinned to bottom */}
				{showLegal && (
					<footer
						className={cn(
							"mx-auto w-full text-center text-sm text-muted-foreground",
							wide ? "max-w-lg" : "max-w-sm",
						)}
					>
						<p>
							By clicking continue, you agree to our{" "}
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
					</footer>
				)}
			</div>
		</main>
	);
}
