// React
import type { ComponentProps, ReactNode } from "react";

// UI Components
import { Button } from "@/components/ui/button";

// Icons
import { PencilIcon } from "lucide-react";

// Types
interface RowActionButtonsProps {
  editRender: ComponentProps<typeof Button>["render"];
  editLabel: string;
  deleteAction: ReactNode;
}

export function RowActionButtons({
  editRender,
  editLabel,
  deleteAction,
}: RowActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        render={editRender}
        aria-label={editLabel}
      >
        <PencilIcon />
      </Button>
      {deleteAction}
    </div>
  );
}
