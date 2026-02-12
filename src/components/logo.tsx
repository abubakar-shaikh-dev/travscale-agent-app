import logoFull from "@/assets/logo-w-name.svg";
import logoIcon from "@/assets/logo.svg";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
	variant?: "icon" | "full";
}

export const Logo = ({ variant = "full", className, ...props }: LogoProps) => {
	const src = variant === "icon" ? logoIcon : logoFull;
	return (
		<img
			src={src}
			alt="Travscale Logo"
			className={cn("h-8 w-auto", className)}
			{...props}
		/>
	);
};
