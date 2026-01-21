"use client";

import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	AtSignIcon,
	EyeIcon,
	EyeOffIcon,
	LockIcon,
	UserIcon,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";

export function RegisterForm() {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setPasswordError(null);
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const name = formData.get("name");
		const email = formData.get("email");
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			setPasswordError("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (password.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			setIsLoading(false);
			return;
		}

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		console.log("Register attempt:", { name, email, password });
		setIsLoading(false);
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<label
					htmlFor="name"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Full Name
				</label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<UserIcon />
					</InputGroupAddon>
					<InputGroupInput
						id="name"
						name="name"
						placeholder="John Doe"
						type="text"
						required
						disabled={isLoading}
					/>
				</InputGroup>
			</div>

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
				<label
					htmlFor="password"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Password
				</label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<LockIcon />
					</InputGroupAddon>
					<InputGroupInput
						id="password"
						name="password"
						placeholder="Create a password"
						type={showPassword ? "text" : "password"}
						required
						disabled={isLoading}
						aria-invalid={passwordError ? "true" : undefined}
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
				<p className="text-xs text-muted-foreground">
					Must be at least 8 characters
				</p>
			</div>

			<div className="space-y-2">
				<label
					htmlFor="confirmPassword"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Confirm Password
				</label>
				<InputGroup>
					<InputGroupAddon align="inline-start">
						<LockIcon />
					</InputGroupAddon>
					<InputGroupInput
						id="confirmPassword"
						name="confirmPassword"
						placeholder="Confirm your password"
						type={showConfirmPassword ? "text" : "password"}
						required
						disabled={isLoading}
						aria-invalid={passwordError ? "true" : undefined}
					/>
					<InputGroupAddon align="inline-end">
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="hover:text-foreground transition-colors"
							aria-label={
								showConfirmPassword ? "Hide password" : "Show password"
							}
						>
							{showConfirmPassword ? (
								<EyeOffIcon className="size-4" />
							) : (
								<EyeIcon className="size-4" />
							)}
						</button>
					</InputGroupAddon>
				</InputGroup>
			</div>

			{passwordError && (
				<p className="text-sm text-destructive">{passwordError}</p>
			)}

			<Button className="w-full" type="submit" disabled={isLoading}>
				{isLoading ? (
					<>
						<span className="animate-spin">◌</span>
						Creating account...
					</>
				) : (
					"Create Account"
				)}
			</Button>

			<p className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<Link
					to="/auth/login"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign in
				</Link>
			</p>
		</form>
	);
}
