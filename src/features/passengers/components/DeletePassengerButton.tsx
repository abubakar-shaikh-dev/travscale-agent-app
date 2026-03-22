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
import { useDeletePassenger } from "../queries";

// Types
import type { Passenger } from "../types";

interface DeletePassengerButtonProps {
  passenger: Passenger;
  onSuccess?: () => void;
  variant?: "icon" | "full";
}

export function DeletePassengerButton({
  passenger,
  onSuccess,
  variant = "icon",
}: DeletePassengerButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deletePassenger, isPending } = useDeletePassenger();

  const handleDelete = async () => {
    try {
      await deletePassenger(passenger.id);
      setOpen(false);
      onSuccess?.();
    } catch {
      // The mutation layer handles user-facing error feedback.
    }
  };

  const displayName = [
    passenger.firstName,
    passenger.middleName,
    passenger.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {variant === "icon" ? (
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete ${displayName || "passenger"}`}
            />
          }
        >
          <TrashIcon className="text-destructive" />
        </AlertDialogTrigger>
      ) : (
        <AlertDialogTrigger render={<Button variant="destructive-outline" />}>
          <TrashIcon />
          Delete Passenger
        </AlertDialogTrigger>
      )}

      <AlertDialogPopup>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Passenger</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {displayName || "this passenger"}
            </span>
            ? This action cannot be undone.
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
            {isPending ? "Deleting..." : "Delete Passenger"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
