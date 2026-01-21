"use client";

import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { AtSignIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

export function LoginForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		console.log("Login attempt:", { email, password });
		setIsLoading(false);
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<label
					htmlFor="email"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Email
				</label>
				<InputGroup>
					<InputGroupInput
						id="email"
						name="email"
						placeholder="your.email@example.com"
						type="email"
						required
						disabled={isLoading}
					/>
					<InputGroupAddon>
						<AtSignIcon />
					</InputGroupAddon>
				</InputGroup>
			</div>

			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label
						htmlFor="password"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						Password
					</label>
					<Link
						to="/auth/login"
						className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
					>
						Forgot password?
					</Link>
				</div>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<LockIcon />
					</InputGroupAddon>
					<InputGroupInput
						id="password"
						name="password"
						placeholder="Enter your password"
						type={showPassword ? "text" : "password"}
						required
						disabled={isLoading}
					/>
					<InputGroupAddon align="inline-end">
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="hover:text-foreground transition-colors"
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? (
								<EyeOffIcon className="size-4" />
							) : (
								<EyeIcon className="size-4" />
							)}
						</button>
					</InputGroupAddon>
				</InputGroup>
			</div>

			<Button className="w-full" type="submit" disabled={isLoading}>
				{isLoading ? (
					<>
						<span className="animate-spin">◌</span>
						Signing in...
					</>
				) : (
					"Sign In"
				)}
			</Button>

			<p className="text-center text-sm text-muted-foreground">
				Don't have an account?{" "}
				<Link
					to="/auth/register"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Create account
				</Link>
			</p>
		</form>
	);
}
