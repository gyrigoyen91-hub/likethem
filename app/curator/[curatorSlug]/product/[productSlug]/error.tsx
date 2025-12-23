"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const t = useT();
  
  // This error boundary should rarely be hit now since we handle errors in the page component
  // But keep it as a fallback for unexpected errors
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="text-2xl text-neutral-900 mb-2">
        {t('product.unavailable.notFound.title')}
      </h1>
      <p className="text-neutral-600 mb-6">
        {t('product.unavailable.notFound.description')}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {t('common.tryAgain')}
        </button>
        <Link
          href="/explore"
          className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          {t('product.unavailable.notFound.secondaryCta')}
        </Link>
      </div>
    </main>
  );
}
