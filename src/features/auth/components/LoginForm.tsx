import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { AtSignIcon, EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { useLogin } from "../queries";

export interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate({ to: "/" });
    } catch {
      console.error("Login failed");
    }
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
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
            disabled={loginMutation.isPending}
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
          <a
            href="/auth/login"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Forgot password?
          </a>
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
            disabled={loginMutation.isPending}
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

      <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
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
        <a
          href="/auth/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create account
        </a>
      </p>
    </form>
  );
}
