// UI Components
import { Badge } from "@/components/ui/badge";

// Utils
import { cn } from "@/lib/utils";

// Types
import type { VisaStatus } from "../types";

const STATUS_STYLES: Record<VisaStatus, string> = {
  Draft: "bg-gray-100 text-gray-700 border-gray-200",
  "Documents Pending": "bg-amber-50 text-amber-700 border-amber-200",
  "Ready to Submit": "bg-blue-50 text-blue-700 border-blue-200",
  Submitted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Under Processing": "bg-purple-50 text-purple-700 border-purple-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  "Visa Issued": "bg-emerald-50 text-emerald-800 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

interface VisaStatusBadgeProps {
  status: VisaStatus;
  className?: string;
}

export function VisaStatusBadge({ status, className }: VisaStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status}
    </Badge>
  );
}
