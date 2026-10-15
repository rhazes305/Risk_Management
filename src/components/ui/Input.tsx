import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="wajib">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="wajib">*</span>}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-50 disabled:text-gray-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="wajib">*</span>}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 resize-y min-h-[80px]",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
