// React
import { useState } from "react";

// UI Components
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Icons
import { TrashIcon } from "lucide-react";

// Hooks
import { useDeleteSupplier } from "../queries";

// Types
import type { Supplier } from "../types";

interface DeleteSupplierButtonProps {
  supplier: Supplier;
  /** Callback after successful deletion */
  onSuccess?: () => void;
  /** Render as icon-only button (default) or full button with text */
  variant?: "icon" | "full";
}

/**
 * Delete supplier button with confirmation dialog.
 *
 * UX Design Decisions:
 * - Requires explicit confirmation to prevent accidental deletions
 * - Shows supplier name in confirmation message for clarity
 * - Async loading state on confirm button
 * - Dialog stays open during deletion to show progress
 * - Auto-closes on success
 */
export function DeleteSupplierButton({
  supplier,
  onSuccess,
  variant = "icon",
}: DeleteSupplierButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteSupplier, isPending } = useDeleteSupplier();

  const handleDelete = async () => {
    try {
      await deleteSupplier(supplier.id);
      setOpen(false);
      onSuccess?.();
    } catch {
      // Error is handled by the mutation's onError callback
      // Keep dialog open so user can retry or cancel
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {variant === "icon" ? (
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${supplier.name}`}
            />
          }
        >
          <TrashIcon className="text-destructive" />
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
          <TrashIcon />
          Delete Supplier
        </AlertDialogTrigger>
      )}

      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{supplier.name}</span>
            ? This action cannot be undone and will permanently remove the
            supplier and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogClose
            render={<Button variant="outline" disabled={isPending} />}
          >
            Cancel
          </AlertDialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={isPending}
          >
            {isPending ? "Deleting..." : "Delete Supplier"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
