// app/apply/page.tsx
import CTAButton from '@/components/ui/CTAButton';
import ApplicationForm from './ApplicationForm';
import { getLocale } from '@/lib/i18n/getLocale';
import { t } from '@/lib/i18n/t';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const locale = await getLocale();
  return {
    title: t(locale, 'sell.title'),
    description: t(locale, 'sell.subtitle'),
  };
}

export default async function ApplyPage() {
  const locale = await getLocale();
  
  return (
    <main className="min-h-[80vh]">
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-8">
        <a href="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          ← {t(locale, 'common.back')}
        </a>

        <h1 className="mt-6 text-4xl md:text-5xl font-serif tracking-tight text-neutral-900">
          {t(locale, 'sell.title')}
        </h1>

        <p className="mt-3 text-neutral-600">
          {t(locale, 'sell.subtitle')}
        </p>
      </section>

      {/* Card */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <ApplicationForm />
          </div>
        </div>
      </section>
    </main>
  );
}
