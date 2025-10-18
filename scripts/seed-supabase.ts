import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mineihnvptbfkqdfcrzg.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
  console.log('🌱 Seeding Supabase with test data...')

  try {
    // Create test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: 'gonzalo@likethem.io',
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Gonzalo Yrigoyen'
      }
    })

    if (userError) {
      console.error('Error creating user:', userError)
      return
    }

    console.log('✅ Created test user:', user.user?.email)

    // Insert user profile data
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: user.user!.id,
        email: 'gonzalo@likethem.io',
        password: 'hashed-password', // In real app, this would be properly hashed
        fullName: 'Gonzalo Yrigoyen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        role: 'CURATOR',
        provider: 'credentials',
        emailVerified: new Date().toISOString(),
        phone: '+1 (555) 123-4567'
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return
    }

    // Create test curator profile
    const { data: curator, error: curatorError } = await supabase
      .from('curator_profiles')
      .upsert({
        userId: user.user!.id,
        storeName: 'Gonzalo\'s Fashion Hub',
        bio: 'Passionate fashion curator with an eye for unique pieces and sustainable style. I believe fashion should be both beautiful and responsible.',
        bannerImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
        instagram: 'gonzalo_fashion',
        tiktok: 'gonzalo_style',
        youtube: 'GonzaloFashion',
        twitter: 'gonzalo_style',
        isPublic: true,
        isEditorsPick: true,
        slug: 'gonzalo-yrigoyen'
      })
      .select()
      .single()

    if (curatorError) {
      console.error('Error creating curator profile:', curatorError)
      return
    }

    console.log('✅ Created test curator:', curator.storeName)

    // Create test products
    const testProducts = [
      {
        curatorId: curator.id,
        title: 'Vintage Denim Jacket',
        description: 'Classic vintage denim jacket with a perfect fit. This timeless piece adds character to any outfit and gets better with age.',
        price: 89.99,
        category: 'Outerwear',
        tags: 'vintage,denim,jacket,casual',
        sizes: 'S,M,L,XL',
        colors: 'Blue,Light Blue',
        stockQuantity: 3,
        isActive: true,
        isFeatured: true,
        curatorNote: 'This jacket has been carefully selected for its authentic vintage character and excellent condition.',
        slug: 'vintage-denim-jacket'
      },
      {
        curatorId: curator.id,
        title: 'Minimalist White Sneakers',
        description: 'Clean, minimalist white sneakers perfect for any occasion. These versatile shoes pair beautifully with both casual and semi-formal outfits.',
        price: 129.99,
        category: 'Footwear',
        tags: 'sneakers,white,minimalist,casual',
        sizes: '7,8,9,10,11,12',
        colors: 'White',
        stockQuantity: 8,
        isActive: true,
        isFeatured: false,
        curatorNote: 'A wardrobe essential that never goes out of style. Perfect for the modern minimalist.',
        slug: 'minimalist-white-sneakers'
      },
      {
        curatorId: curator.id,
        title: 'Sustainable Cotton T-Shirt',
        description: 'Soft, sustainable cotton t-shirt made from organic materials. Comfortable, breathable, and environmentally conscious.',
        price: 34.99,
        category: 'Tops',
        tags: 't-shirt,cotton,sustainable,organic',
        sizes: 'XS,S,M,L,XL,XXL',
        colors: 'White,Black,Navy,Forest Green',
        stockQuantity: 15,
        isActive: true,
        isFeatured: true,
        curatorNote: 'Made from 100% organic cotton. A conscious choice for the environmentally aware fashion lover.',
        slug: 'sustainable-cotton-tshirt'
      }
    ]

    for (const productData of testProducts) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (productError) {
        console.error('Error creating product:', productError)
        continue
      }

      // Add product images
      const images = [
        {
          productId: product.id,
          url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          altText: `${product.title} front view`,
          order: 0
        },
        {
          productId: product.id,
          url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
          altText: `${product.title} back view`,
          order: 1
        }
      ]

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(images)

      if (imagesError) {
        console.error('Error creating product images:', imagesError)
      }

      console.log('✅ Created product:', product.title)
    }

    console.log('🎉 Test data seeding completed successfully!')
    console.log(`📱 You can now visit: https://likethem.io/curator/gonzalo-yrigoyen`)

  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
