'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  {
    key: 'scroll',
    step: 'Step 1',
    title: 'Scroll',
    desc: 'Find curators you love. Follow their style and explore their closets.',
    img: '/images/how/scroll.jpg',
    alt: 'Discover curators and their closets'
  },
  {
    key: 'shop',
    step: 'Step 2',
    title: 'Shop',
    desc: 'Add pieces to your cart. Secure checkout with real-time availability.',
    img: '/images/how/shop.jpg',
    alt: 'Shop curated products'
  },
  {
    key: 'wear',
    step: 'Step 3',
    title: 'Wear',
    desc: 'Delivered to you. Keep what feels like you.',
    img: '/images/how/wear.jpg',
    alt: 'Wear your new look'
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-20 md:py-24">
        {/* Eyebrow */}
        <div className="text-center">
          <div className="text-xs tracking-[0.18em] uppercase text-neutral-500 mb-3">
            How it works
          </div>
          {/* Headline + subheadline */}
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-zinc-900">
            Effortless. From discovery to delivery.
          </h2>
          <p className="text-neutral-600 mt-3">
            Three simple steps—curated for your taste.
          </p>

          {/* Subtle divider */}
          <div className="h-px bg-neutral-200 mt-10 mb-8" />
        </div>

        {/* Steps row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <motion.article
              key={s.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-xl">
                {/* Image */}
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <Image
                    src={s.img}
                    alt={s.alt}
                    width={800}
                    height={1000}
                    priority={idx === 0}
                    className="h-full w-full object-cover aspect-[4/5] rounded-xl"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {/* Bottom gradient for legibility */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent rounded-b-xl" />
                  {/* Step chip */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[11px] tracking-[0.14em] uppercase bg-white/85 backdrop-blur px-2.5 py-1 rounded-full border border-black/5">
                      {s.step}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Copy */}
              <div className="mt-4">
                <h3 className="text-lg font-medium text-zinc-900">{s.title}</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  {s.desc}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
