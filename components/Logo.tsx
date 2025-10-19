import Image from "next/image";
import Link from "next/link";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="LikeThem home" className={`block ${className}`}>
      <Image src="/logo.svg" alt="LikeThem" width={140} height={24} priority />
    </Link>
  );
} 