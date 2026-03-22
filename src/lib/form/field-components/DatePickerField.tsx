// React
import { useId } from "react";

// Icons
import { CalendarIcon } from "lucide-react";

// Types
import type { DropdownProps } from "react-day-picker";

// UI Components
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";

// Form Components
import { FieldLabel } from "./FieldLabel";

// Form
import { useFieldContext } from "@/lib/form/form-context";

// Utils
import { cn } from "@/lib/utils";

interface DropdownItem {
  disabled?: boolean;
  label: string;
  value: string;
}

interface DatePickerFieldProps {
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  startMonth?: Date;
  endMonth?: Date;
}

function CalendarDropdown(props: DropdownProps) {
  const { options, value, onChange, "aria-label": ariaLabel } = props;

  const items: DropdownItem[] =
    options?.map((option) => ({
      disabled: option.disabled,
      label: option.label,
      value: option.value.toString(),
    })) ?? [];

  const selectedItem =
    items.find((item) => item.value === value?.toString()) ?? null;

  const handleValueChange = (newValue: DropdownItem | null) => {
    if (!onChange || !newValue) return;

    const syntheticEvent = {
      target: { value: newValue.value },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
  };

  return (
    <Combobox
      aria-label={ariaLabel}
      autoHighlight
      items={items}
      onValueChange={handleValueChange}
      value={selectedItem}
    >
      <ComboboxInput
        className="**:[input]:w-0 **:[input]:flex-1"
        onFocus={(e) => e.currentTarget.select()}
      />
      <ComboboxPopup aria-label={ariaLabel}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: DropdownItem) => (
            <ComboboxItem
              disabled={item.disabled}
              key={item.value}
              value={item}
            >
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}

function parseIsoDate(dateValue: string): Date | undefined {
  if (!dateValue) return undefined;

  const [year, month, day] = dateValue.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DatePickerField({
  label,
  placeholder = "Pick a date",
  disabled,
  className,
  required = false,
  startMonth = new Date(1900, 0),
  endMonth = new Date(),
}: DatePickerFieldProps) {
  const field = useFieldContext<string>();
  const inputId = useId();

  const errors = field.state.meta.errors;
  const hasError = errors.length > 0 && field.state.meta.isTouched;
  const selectedDate = parseIsoDate(field.state.value ?? "");

  return (
    <div className={cn("space-y-2", className)}>
      <FieldLabel label={label} htmlFor={inputId} required={required} />

      <Popover>
        <PopoverTrigger
          id={inputId}
          disabled={disabled}
          render={
            <Button
              className={cn(
                "w-full justify-start",
                !selectedDate && "text-muted-foreground",
                hasError &&
                  "border-destructive focus-visible:ring-destructive/20",
              )}
              variant="outline"
            />
          }
        >
          <CalendarIcon aria-hidden="true" />
          {selectedDate
            ? new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
              }).format(selectedDate)
            : placeholder}
        </PopoverTrigger>

        <PopoverPopup>
          <Calendar
            captionLayout="dropdown"
            components={{ Dropdown: CalendarDropdown }}
            defaultMonth={selectedDate}
            endMonth={endMonth}
            mode="single"
            onSelect={(date) => {
              if (date) {
                field.handleChange(toIsoDate(date));
              }
              field.handleBlur();
            }}
            selected={selectedDate}
            startMonth={startMonth}
          />
        </PopoverPopup>
      </Popover>

      {hasError && (
        <p className="text-sm text-destructive" role="alert">
          {errors
            .map((e) => (e as { message?: string }).message ?? e)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
