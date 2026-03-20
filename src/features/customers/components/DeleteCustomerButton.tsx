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
import { useDeleteCustomer } from "../queries";

// Types
import type { Customer } from "../types";

interface DeleteCustomerButtonProps {
  customer: Customer;
  /** Callback after successful deletion */
  onSuccess?: () => void;
  /** Render as icon-only button (default) or full button with text */
  variant?: "icon" | "full";
}

/**
 * Delete customer button with confirmation dialog.
 *
 * UX Design Decisions:
 * - Requires explicit confirmation to prevent accidental deletions
 * - Shows customer name in confirmation message for clarity
 * - Async loading state on confirm button
 * - Dialog stays open during deletion to show progress
 * - Auto-closes on success
 */
export function DeleteCustomerButton({
  customer,
  onSuccess,
  variant = "icon",
}: DeleteCustomerButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteCustomer, isPending } = useDeleteCustomer();

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
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
              aria-label={`Delete ${customer.name}`}
            />
          }
        >
          <TrashIcon className="text-destructive" />
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
          <TrashIcon />
          Delete Customer
        </AlertDialogTrigger>
      )}

      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Customer</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{customer.name}</span>
            ? This action cannot be undone and will permanently remove the
            customer and all associated data.
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
            {isPending ? "Deleting..." : "Delete Customer"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
