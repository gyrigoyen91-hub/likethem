'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import InviteCodeForm from '@/components/InviteCodeForm'

export default function AccessPage() {
  const [formType, setFormType] = useState<'buy' | 'sell' | null>(null)

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-heading font-serif mb-6">
            This isn't for everyone. But maybe it's for you.
          </h1>
          <p className="text-subheading max-w-2xl mx-auto">
            Únete a la comunidad exclusiva de LikeThem
          </p>
        </motion.div>

        {!formType ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Quiero abrir una tienda */}
            <div 
              className="border border-carbon p-8 cursor-pointer hover:bg-stone transition-colors"
              onClick={() => setFormType('sell')}
            >
              <h2 className="font-serif text-2xl font-light mb-4">
                Quiero abrir una tienda
              </h2>
              <p className="text-warm-gray mb-6">
                Eres un influencer con una comunidad activa y quieres curar tu propia tienda de moda.
              </p>
              <button className="btn-primary w-full">
                Solicitar como vendedor
              </button>
            </div>

            {/* Quiero comprar */}
            <div 
              className="border border-carbon p-8 cursor-pointer hover:bg-stone transition-colors"
              onClick={() => setFormType('buy')}
            >
              <h2 className="font-serif text-2xl font-light mb-4">
                Quiero comprar
              </h2>
              <p className="text-warm-gray mb-6">
                Buscas acceso exclusivo a las tiendas curadas por tus influencers favoritos.
              </p>
              <button className="btn-primary w-full">
                Solicitar acceso
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <button 
              onClick={() => setFormType(null)}
              className="text-warm-gray hover:text-carbon mb-8 transition-colors"
            >
              ← Volver
            </button>

            {formType === 'sell' ? (
              <SellerForm />
            ) : (
              <BuyerForm />
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function SellerForm() {
  return (
    <form className="space-y-6">
      <h2 className="font-serif text-3xl font-light mb-8">
        Solicitud para Vendedor
      </h2>
      
      <div>
        <label className="block text-sm font-medium mb-2">Nombre completo</label>
        <input
          type="text"
          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Enlaces a redes sociales</label>
        <input
          type="url"
          placeholder="Instagram, TikTok, YouTube..."
          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comunidad estimada</label>
        <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
          <option>Menos de 10K seguidores</option>
          <option>10K - 50K seguidores</option>
          <option>50K - 100K seguidores</option>
          <option>100K - 500K seguidores</option>
          <option>Más de 500K seguidores</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">¿Por qué deberías ser parte de LikeThem?</label>
        <textarea
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
          placeholder="Cuéntanos sobre tu estilo, tu comunidad y por qué te gustaría curar una tienda..."
          required
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Enviar solicitud
      </button>
    </form>
  )
}

function BuyerForm() {
  return (
    <div className="space-y-8">
      <h2 className="font-serif text-3xl font-light mb-8">
        Solicitud de Acceso
      </h2>
      
      {/* Invite Code Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="font-semibold text-lg mb-3">Have an access code?</h3>
        <p className="text-gray-600 text-sm mb-4">
          Enter a curator access code to unlock purchasing immediately.
        </p>
        <InviteCodeForm />
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or</span>
        </div>
      </div>

      {/* Waitlist Form */}
      <form className="space-y-6">
        <h3 className="font-semibold text-lg">Join the waitlist</h3>
        <p className="text-gray-600 text-sm">
          Request access to be notified when we have availability.
        </p>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Link a redes sociales (opcional)</label>
          <input
            type="url"
            placeholder="Instagram, TikTok..."
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Estilo que buscas</label>
          <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
            <option>Minimal</option>
            <option>Streetwear</option>
            <option>Vintage</option>
            <option>Elegante</option>
            <option>Casual</option>
            <option>Otro</option>
          </select>
        </div>

        <button type="submit" className="btn-primary w-full">
          Solicitar acceso
        </button>
      </form>
    </div>
  )
} 