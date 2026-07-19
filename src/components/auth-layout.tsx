"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import type React from "react";
import { FloatingPaths } from "@/components/floating-paths";
import { Link } from "@tanstack/react-router";

// Utils
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
	children: React.ReactNode;
	title: string;
	description: string;
	wide?: boolean;
}

export function AuthLayout({ children, title, description, wide }: AuthLayoutProps) {
	return (
		<main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
			<div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
				<Logo className="mr-auto h-7" />

				<div className="z-10 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-xl">
							&ldquo;This Platform has helped me to save time and serve my
							clients faster than ever before.&rdquo;
						</p>
						<footer className="font-mono font-semibold text-sm">
							~ Ali Hassan
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>
			<div className="relative flex min-h-screen flex-col p-4 sm:p-6">
				<div
					aria-hidden
					className="-z-10 absolute inset-0 isolate opacity-60 contain-strict"
				>
					<div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
					<div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
					<div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
				</div>

				{/* Header — back to home */}
				<Button
					render={<Link to="/" />}
					variant="ghost"
					className="-ms-2 self-start"
				>
					<ChevronLeftIcon />
					Home
				</Button>

				{/* Main — form, centered in the remaining space */}
				<div className="flex flex-1 flex-col items-center justify-center py-10">
					<div
						className={cn(
							"w-full space-y-8 [&_[data-slot=input]]:h-11 [&_[data-slot=input]]:leading-11 [&_[data-slot=button].w-full]:h-11",
							wide ? "max-w-lg" : "max-w-sm",
						)}
					>
						<div className="space-y-6">
							<Logo className="h-10 lg:hidden" />
							<div className="space-y-2">
								<h1 className="font-heading font-bold text-2xl tracking-wide">{title}</h1>
								<p className="text-base text-muted-foreground">{description}</p>
							</div>
						</div>
						{children}
					</div>
				</div>

				{/* Footer — legal, pinned to bottom */}
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
			</div>
		</main>
	);
}
