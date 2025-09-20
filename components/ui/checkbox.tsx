"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, id, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        "h-4 w-4 rounded border border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
