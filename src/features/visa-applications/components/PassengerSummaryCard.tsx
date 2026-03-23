// Icons
import { CalendarIcon, FlagIcon, HashIcon, UserIcon } from "lucide-react";

// Types
interface PassengerSummaryCardProps {
  name: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
}

export function PassengerSummaryCard({
  name,
  passportNumber,
  nationality,
  dateOfBirth,
}: PassengerSummaryCardProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Passenger
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <UserIcon className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HashIcon className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Passport Number</p>
            <p className="text-sm font-medium">{passportNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FlagIcon className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Nationality</p>
            <p className="text-sm font-medium">{nationality}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Date of Birth</p>
            <p className="text-sm font-medium">
              {new Date(dateOfBirth).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
