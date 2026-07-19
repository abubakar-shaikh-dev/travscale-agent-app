// Motion
import { motion, useReducedMotion } from "motion/react";

export function FloatingPaths({ position }: { position: number }) {
	const prefersReducedMotion = useReducedMotion();
	const paths = Array.from({ length: 28 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
			380 - i * 5 * position
		} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
			152 - i * 5 * position
		} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
			684 - i * 5 * position
		} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
		width: 0.5 + i * 0.025,
	}));

	return (
		<div className="pointer-events-none absolute inset-0">
			<svg
				className="h-full w-full text-foreground"
				fill="none"
				viewBox="0 0 696 316"
			>
				<title>Background paths</title>
				{paths.map((path) => (
					<motion.path
						animate={
							prefersReducedMotion
								? {}
								: {
										pathLength: 1,
										opacity: [0.2, 0.55, 0.2],
										pathOffset: [0, 1, 0],
									}
						}
						d={path.d}
						initial={{
							pathLength: prefersReducedMotion ? 1 : 0.3,
							opacity: prefersReducedMotion ? 0.5 : 0.55,
						}}
						key={path.id}
						stroke="currentColor"
						strokeOpacity={0.08 + path.id * 0.012}
						strokeWidth={path.width}
						transition={
							prefersReducedMotion
								? { duration: 0 }
								: {
										duration: 22 + ((path.id * 7) % 10),
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}
						}
					/>
				))}
			</svg>
		</div>
	);
}
