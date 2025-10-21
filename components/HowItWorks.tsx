'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      icon: '🌀',
      title: 'Scroll',
      description:
        'Find your style inspiration as you scroll your feed. Discover creators whose fashion reflects your vibe.',
    },
    {
      icon: '🛍️',
      title: 'Shop',
      description:
        'Tap and shop the exact pieces they wear — every item is verified and curated directly from the influencer\'s closet.',
    },
    {
      icon: '✨',
      title: 'Wear',
      description:
        'Recreate their look and make it yours. Express your individuality with the same timeless pieces they love.',
    },
  ];

  return (
    <section className="relative w-full bg-[#FAFAFA] py-20 sm:py-28">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:gap-24">
        {/* LEFT: Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-sm"
        >
          <Image
            src="/images/how-it-works.jpg"
            alt="Person holding phone showing outfit inspiration"
            width={1000}
            height={800}
            className="h-auto w-full object-cover"
            priority
          />
        </motion.div>

        {/* RIGHT: Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          viewport={{ once: true }}
          className="flex w-full flex-col items-start text-center lg:text-left"
        >
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl font-serif">
            How It Works
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Your style inspiration, made shoppable.
          </p>
          <p className="mt-1 text-base text-gray-400">
            Three effortless steps to dress like the ones you admire.
          </p>

          <div className="mt-10 flex w-full flex-col gap-6 sm:gap-8">
            {steps.map((step) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-2xl text-white">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 