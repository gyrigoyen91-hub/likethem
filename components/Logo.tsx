import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" aria-label="LikeThem Home" className="inline-flex items-center">
      <Image
        src="/logo.svg"
        alt="LIKETHEM"
        width={124}
        height={24}
        priority
      />
    </Link>
  );
} 