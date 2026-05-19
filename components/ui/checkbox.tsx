"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, onChange, ...props }, ref) => {
    const inputId = id ?? React.useId();
    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-center gap-2 text-sm",
          className
        )}
      >
        <span
          className={cn(
            "relative flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-input"
          )}
        >
          <input
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          {checked && <Check className="h-3 w-3" />}
        </span>
        {label && <span>{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
