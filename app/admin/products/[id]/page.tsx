import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface ProductDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  await requireAdmin()
  
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      curator: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      },
      images: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          orderItems: true,
          favorites: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <AdminPageShell
      title="Product Details"
      subtitle={`Viewing ${product.title}`}
    >
      <div className="space-y-6">
        {/* Product Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Title</h3>
              <p className="text-lg text-gray-900">{product.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Price</h3>
              <p className="text-lg text-gray-900">${product.price.toFixed(2)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <p className="text-lg text-gray-900">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
              <p className="text-lg text-gray-900">{product.category}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Stock Quantity</h3>
              <p className="text-lg text-gray-900">{product.stockQuantity}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Created At</h3>
              <p className="text-lg text-gray-900">
                {new Date(product.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {product.images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images.map((image) => (
                  <div key={image.id} className="relative w-full h-48 rounded overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.altText || product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Curator Info */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Curator Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Store Name</h4>
              <p className="text-gray-900">{product.curator.storeName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">User Email</h4>
              <p className="text-gray-900">{product.curator.user.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/admin/curators/${product.curator.id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              View Curator Profile →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h4>
              <p className="text-2xl font-bold text-gray-900">
                {product._count.orderItems}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Favorites</h4>
              <p className="text-2xl font-bold text-gray-900">
                {product._count.favorites}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/admin/products"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    </AdminPageShell>
  )
}
