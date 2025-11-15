'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function FilterSidebar() {
  const [openFilters, setOpenFilters] = useState<string[]>(['style', 'gender'])

  const toggleFilter = (filterName: string) => {
    setOpenFilters(prev => 
      prev.includes(filterName) 
        ? prev.filter(f => f !== filterName)
        : [...prev, filterName]
    )
  }

  const filters = [
    {
      name: 'style',
      label: 'Estilo',
      options: ['Minimal', 'Streetwear', 'Vintage', 'Elegante', 'Casual', 'Tech', 'Sustainable']
    },
    {
      name: 'gender',
      label: 'Género',
      options: ['Mujeres', 'Hombres', 'Unisex']
    },
    {
      name: 'popularity',
      label: 'Popularidad',
      options: ["Editor's Pick", 'Más de 1M seguidores', 'Más de 500K seguidores']
    },
    {
      name: 'availability',
      label: 'Disponibilidad',
      options: ['Nueva colección', 'Archivado', 'En stock']
    }
  ]

  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="sticky top-8">
        <h3 className="font-serif text-xl font-light mb-6">Filtros</h3>
        
        <div className="space-y-4">
          {filters.map((filter) => (
            <div key={filter.name} className="border-b border-gray-200 pb-4">
              <button
                onClick={() => toggleFilter(filter.name)}
                className="flex items-center justify-between w-full text-left font-medium mb-3 hover:text-carbon transition-colors"
              >
                {filter.label}
                {openFilters.includes(filter.name) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {openFilters.includes(filter.name) && (
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-carbon border-gray-300 rounded focus:ring-carbon"
                      />
                      <span className="text-sm text-warm-gray hover:text-carbon transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="w-full mt-6 text-sm text-warm-gray hover:text-carbon transition-colors">
          Limpiar filtros
        </button>
      </div>
    </div>
  )
} 