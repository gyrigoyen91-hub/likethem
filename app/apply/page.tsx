// app/apply/page.tsx
import CTAButton from '@/components/ui/CTAButton';
import ApplicationForm from './ApplicationForm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Postulación',
  description: 'Únete a la comunidad exclusiva de LikeThem como Curator.',
};

export default function ApplyPage() {
  return (
    <main className="min-h-[80vh]">
      <section className="mx-auto max-w-3xl px-5 pt-16 pb-8">
        <a href="/" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          ← Volver
        </a>

        <h1 className="mt-6 text-4xl md:text-5xl font-serif tracking-tight text-neutral-900">
          This isn't for everyone. But<br className="hidden md:block" /> maybe it's for you.
        </h1>

        <p className="mt-3 text-neutral-600">
          Únete a la comunidad exclusiva de LikeThem
        </p>
      </section>

      {/* Card */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <h2 className="text-lg font-medium text-neutral-900 mb-1">Solicitud para Vendedor</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Cuéntanos sobre ti y tu comunidad para evaluar tu postulación.
            </p>
            <ApplicationForm />
          </div>
        </div>
      </section>
    </main>
  );
}
