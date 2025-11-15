'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import CTAButton from '@/components/ui/CTAButton';

export default function ApplicationForm() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect to sign in if not authenticated
  if (status === 'loading') {
    return <div className="text-center">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-center">
        <p className="text-neutral-600 mb-4">Please sign in to submit your application.</p>
        <CTAButton href="/auth/signin" variant="primary" size="lg">
          Sign In
        </CTAButton>
      </div>
    );
  }

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = {
        fullName: formData.get('fullName') as string,
        socialLinks: formData.get('socialLinks') as string,
        audienceBand: formData.get('audience') as string,
        reason: formData.get('motivation') as string,
      };

      const res = await fetch('/api/curator/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Error submitting application');
      }

      setSuccessMsg('Application submitted successfully! We\'ll get back to you by email.');
      
      // Clear the form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Unexpected error occurred');
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
        <label className="text-sm text-neutral-700">Audience Size</label>
        <select
          name="audience"
          required
          className="h-11 rounded-xl border border-black/10 bg-white px-3 text-[15px] text-neutral-900
                     focus:outline-none focus:ring-2 focus:ring-black/15"
        >
          <option value="LT_10K">Less than 10K followers</option>
          <option value="10K_50K">10K–50K followers</option>
          <option value="50K_200K">50K–200K followers</option>
          <option value="200K_1M">200K–1M followers</option>
          <option value="1M_PLUS">1M+ followers</option>
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

      {successMsg ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-sm text-green-800">{successMsg}</p>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-800">{errorMsg}</p>
        </div>
      ) : null}

      <div className="pt-1">
        <CTAButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </CTAButton>
      </div>

      <p className="text-xs text-neutral-500">
        Al enviar, aceptas ser contactado por LikeThem. No compartimos tus datos con terceros.
      </p>
    </form>
  );
}
