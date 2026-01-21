import { AuthLayout } from "@/components/auth-layout";
import { RegisterForm } from "@/components/register-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/register/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthLayout
			title="Create Account"
			description="Join us and start your journey today."
		>
			<RegisterForm />
		</AuthLayout>
	);
}
