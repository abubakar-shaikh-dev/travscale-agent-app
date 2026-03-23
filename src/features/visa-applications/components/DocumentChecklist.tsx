// Icons
import {
  CheckCircle2Icon,
  CircleDotIcon,
  FileTextIcon,
} from "lucide-react";

// Utils
import { cn } from "@/lib/utils";

// Types
import type { DocumentChecklistItem } from "../types";

interface DocumentChecklistProps {
  documents: DocumentChecklistItem[];
  readOnly?: boolean;
  onToggle?: (index: number) => void;
}

const STATUS_ICON = {
  pending: (
    <CircleDotIcon className="size-4 shrink-0 text-muted-foreground" />
  ),
  uploaded: (
    <FileTextIcon className="size-4 shrink-0 text-blue-500" />
  ),
  verified: (
    <CheckCircle2Icon className="size-4 shrink-0 text-green-500" />
  ),
};

const STATUS_LABEL = {
  pending: "Pending",
  uploaded: "Uploaded",
  verified: "Verified",
};

export function DocumentChecklist({
  documents,
  readOnly = false,
  onToggle,
}: DocumentChecklistProps) {
  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Select a trip type to see required documents.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, index) => (
        <div
          key={doc.name}
          className={cn(
            "flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors",
            !readOnly && "cursor-pointer hover:bg-muted/50",
            doc.status === "verified" && "bg-green-50/50",
            doc.status === "uploaded" && "bg-blue-50/30",
          )}
          onClick={!readOnly ? () => onToggle?.(index) : undefined}
          role={readOnly ? undefined : "button"}
          tabIndex={readOnly ? undefined : 0}
          onKeyDown={
            readOnly
              ? undefined
              : (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle?.(index);
                  }
                }
          }
        >
          {STATUS_ICON[doc.status]}
          <span className="flex-1 text-sm">{doc.name}</span>

          {doc.required && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
              Required
            </span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium",
              doc.status === "pending" && "bg-gray-100 text-gray-500",
              doc.status === "uploaded" && "bg-blue-100 text-blue-600",
              doc.status === "verified" && "bg-green-100 text-green-600",
            )}
          >
            {STATUS_LABEL[doc.status]}
          </span>
        </div>
      ))}
    </div>
  );
}
