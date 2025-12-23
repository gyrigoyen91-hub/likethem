export const metadata = { title: 'Solicitud enviada' };

export default function SuccessPage() {
  return (
    <main className="min-h-[70vh] grid place-items-center px-5">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl md:text-4xl font-serif text-neutral-900">¡Gracias por tu postulación!</h1>
        <p className="mt-3 text-neutral-600">
          Revisaremos tu solicitud y te contactaremos pronto. Mientras tanto, explora los closets de nuestros curators.
        </p>
        <a
          href="/explore"
          className="mt-6 inline-flex h-11 items-center rounded-full border border-black/10 bg-white px-5 text-[15px] text-neutral-900
                     hover:bg-neutral-50 shadow-sm"
        >
          Explorar curators
        </a>
      </div>
    </main>
  );
}
