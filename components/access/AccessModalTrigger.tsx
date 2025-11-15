"use client";
import { useState } from "react";
import AccessModal from "@/components/AccessModal";

type Props = {
  variant?: "primary" | "secondary";
  label?: string;
  curatorId?: string;
  curatorName?: string;
  className?: string;
};

export default function AccessModalTrigger({
  variant = "primary",
  label = "Unlock with code",
  curatorId,
  curatorName,
  className = "",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses = "rounded-xl px-4 py-2 text-sm font-medium transition-colors";
  const variantClasses = {
    primary: "bg-black text-white hover:bg-neutral-900",
    secondary: "border border-neutral-300 text-neutral-700 hover:border-neutral-800",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {label}
      </button>
      
      <AccessModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
