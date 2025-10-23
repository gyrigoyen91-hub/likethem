'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CTAButton from '@/components/ui/CTAButton';

export default function ApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Error al enviar la solicitud');
      }

      router.push('/apply/success');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label className="text-sm text-neutral-700">Nombre completo</label>
        <input
          name="fullName"
          required
          placeholder="Tu nombre y apellido"
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-[15px] text-neutral-900 placeholder:text-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-black/15"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-neutral-700">Enlaces a redes sociales</label>
        <input
          name="socialLinks"
          required
          placeholder="Instagram, TikTok, YouTube..."
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-[15px] text-neutral-900 placeholder:text-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-black/15"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-neutral-700">Comunidad estimada</label>
        <select
          name="audience"
          required
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-[15px] text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-black/15"
        >
          <option value="lt10k">Menos de 10K seguidores</option>
          <option value="50k-200k">50K–200K</option>
          <option value="200k-1m">200K–1M</option>
          <option value="1mplus">1M+</option>
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm text-neutral-700">¿Por qué deberías ser parte de LikeThem?</label>
        <textarea
          name="motivation"
          required
          placeholder="Cuéntanos sobre tu estilo, tu comunidad y por qué te gustaría curar una tienda…"
          className="min-h-[120px] rounded-xl border border-black/10 bg-white p-3 text-[15px] text-neutral-900 placeholder:text-neutral-400
                     focus:outline-none focus:ring-2 focus:ring-black/15"
        />
      </div>

      {errorMsg ? (
        <p className="text-sm text-red-600">{errorMsg}</p>
      ) : null}

      <div className="pt-1">
        <CTAButton type="submit" variant="primary" size="lg" className="w-full">
          {loading ? 'Enviando…' : 'Enviar solicitud'}
        </CTAButton>
      </div>

      <p className="text-xs text-neutral-500">
        Al enviar, aceptas ser contactado por LikeThem. No compartimos tus datos con terceros.
      </p>
    </form>
  );
}
