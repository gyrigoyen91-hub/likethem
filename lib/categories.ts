import accessories from '@/public/images/categories/accessories.svg';
import activewear from '@/public/images/categories/activewear.svg';
import bags from '@/public/images/categories/bags.svg';
import denim from '@/public/images/categories/denim.svg';
import dresses from '@/public/images/categories/dresses.svg';
import jackets from '@/public/images/categories/jackets.svg';
import jewelry from '@/public/images/categories/jewelry.svg';
import outerwear from '@/public/images/categories/outerwear.svg';
import pants from '@/public/images/categories/pants.svg';
import shoes from '@/public/images/categories/shoes.svg';
import skirts from '@/public/images/categories/skirts.svg';
import tops from '@/public/images/categories/tops.svg';

export const CATEGORY_META: Record<string, { label: string; image: any }> = {
  Accessories: { label: 'Accessories', image: accessories },
  Activewear:  { label: 'Activewear',  image: activewear },
  Bags:        { label: 'Bags',        image: bags },
  Denim:       { label: 'Denim',       image: denim },
  Dresses:     { label: 'Dresses',     image: dresses },
  Jackets:     { label: 'Jackets',     image: jackets },
  Jewelry:     { label: 'Jewelry',     image: jewelry },
  Outerwear:   { label: 'Outerwear',   image: outerwear },
  Pants:       { label: 'Pants',       image: pants },
  Shoes:       { label: 'Shoes',       image: shoes },
  Skirts:      { label: 'Skirts',      image: skirts },
  Tops:        { label: 'Tops',        image: tops },
  Footwear:    { label: 'Footwear',    image: shoes }, // Alias for Shoes
};

export const FALLBACK_CATEGORY = { label: 'Other', image: accessories };
