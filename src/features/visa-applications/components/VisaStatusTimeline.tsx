// Feature Components
import { VisaStatusBadge } from "./VisaStatusBadge";

// Utils
import { cn } from "@/lib/utils";

// Types
import type { VisaStatusHistoryEntry } from "../types";

interface VisaStatusTimelineProps {
  history: VisaStatusHistoryEntry[];
}

export function VisaStatusTimeline({ history }: VisaStatusTimelineProps) {
  // Show most recent first
  const sorted = [...history].reverse();

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No status history yet.
      </p>
    );
  }

  return (
    <div className="relative space-y-0">
      {sorted.map((entry, index) => {
        const isFirst = index === 0;

        return (
          <div key={`${entry.status}-${entry.changedAt}`} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {index < sorted.length - 1 && (
              <div className="absolute left-[7px] top-5 h-full w-px bg-border" />
            )}

            {/* Dot */}
            <div
              className={cn(
                "relative z-10 mt-1.5 size-[15px] shrink-0 rounded-full border-2",
                isFirst
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30 bg-background",
              )}
            />

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <VisaStatusBadge status={entry.status} />
                <span className="text-xs text-muted-foreground">
                  by {entry.changedBy}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(entry.changedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(entry.changedAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {entry.note && (
                <p className="text-sm text-foreground/80">{entry.note}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
