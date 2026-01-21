import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/login/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthLayout
			title="Welcome Back!"
			description="Sign in to your account to continue."
		>
			<LoginForm />
		</AuthLayout>
	);
}
