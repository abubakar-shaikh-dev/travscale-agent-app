// React
import type React from "react";
import { useEffect, useRef } from "react";

// Router
import { Link } from "@tanstack/react-router";

// UI Components
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Icons
import { AlertCircleIcon } from "lucide-react";

// Feature Components
import { useVerifyEmail } from "../queries";

// Utils
import { cn } from "@/lib/utils";

export interface VerifyEmailProps {
	className?: string;
	token: string;
}

type ResultTone = "error" | "success" | "muted";

function ResultIcon({
	tone,
	children,
}: {
	tone: ResultTone;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"flex size-14 items-center justify-center rounded-full",
				tone === "error" && "bg-destructive/10 text-destructive",
				tone === "success" && "bg-success/15 text-success",
				tone === "muted" && "bg-muted text-muted-foreground",
			)}
		>
			{children}
		</div>
	);
}

function SuccessCheck() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="size-7 shrink-0"
			aria-hidden="true"
			fill="none"
		>
			<path
				d="M5 13l4 4L19 7"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="auth-draw"
			/>
		</svg>
	);
}

function ResultBlock({
	className,
	tone,
	icon,
	title,
	description,
	action,
}: {
	className?: string;
	tone: ResultTone;
	icon: React.ReactNode;
	title: string;
	description: string;
	action: React.ReactNode;
}) {
	return (
		<div className={cn("space-y-6 auth-fade", className)}>
			<div className="flex flex-col items-center gap-4 text-center">
				<ResultIcon tone={tone}>{icon}</ResultIcon>
				<div className="space-y-1.5">
					<h2 className="font-heading text-lg font-semibold tracking-tight">
						{title}
					</h2>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{action}
		</div>
	);
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
			<ResultBlock
				className={className}
				tone="error"
				icon={<AlertCircleIcon className="size-7" />}
				title="Invalid verification link"
				description="This verification link is missing a token. Please use the link from your email."
				action={
					<Button render={<Link to="/auth/login" />} className="w-full">
						Back to sign in
					</Button>
				}
			/>
		);
	}

	if (verifyMutation.isPending) {
		return (
			<div
				className={cn(
					"flex flex-col items-center gap-4 text-center auth-fade",
					className,
				)}
			>
				<ResultIcon tone="muted">
					<Spinner className="size-7" />
				</ResultIcon>
				<div className="space-y-1.5">
					<h2 className="font-heading text-lg font-semibold tracking-tight">
						Verifying your email…
					</h2>
					<p className="text-sm text-muted-foreground">
						Just a moment while we confirm your address.
					</p>
				</div>
			</div>
		);
	}

	if (verifyMutation.isError) {
		return (
			<ResultBlock
				className={className}
				tone="error"
				icon={<AlertCircleIcon className="size-7" />}
				title="Verification failed"
				description="This verification link is invalid or has expired. You can request a new one from your account."
				action={
					<Button render={<Link to="/auth/login" />} className="w-full">
						Back to sign in
					</Button>
				}
			/>
		);
	}

	if (verifyMutation.isSuccess) {
		return (
			<ResultBlock
				className={className}
				tone="success"
				icon={<SuccessCheck />}
				title="Email verified"
				description="Your email has been confirmed. You can now sign in to your account."
				action={
					<Button render={<Link to="/auth/login" />} className="w-full">
						Continue to sign in
					</Button>
				}
			/>
		);
	}

	return null;
}
