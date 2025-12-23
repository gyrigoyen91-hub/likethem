'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    quote: "LikeThem allows me to dress exactly like Sofia Laurent. It's like having access to her personal wardrobe.",
    author: "Maria Gonzalez",
    location: "Madrid"
  },
  {
    id: 2,
    quote: "Finally, I can recreate those looks I see on Instagram. The quality is exceptional.",
    author: "Carlos Ruiz",
    location: "Barcelona"
  },
  {
    id: 3,
    quote: "It's not just fashion, it's a way to express my admiration for the creators who inspire my style.",
    author: "Ana Martinez",
    location: "Valencia"
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            What Our Members Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <blockquote className="font-serif text-xl font-light italic text-carbon mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="text-warm-gray">
                <p className="font-medium">{testimonial.author}</p>
                <p className="text-sm">{testimonial.location}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 