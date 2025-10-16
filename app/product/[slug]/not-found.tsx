import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the product you're looking for. It may have been removed or the link might be incorrect.
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
          <div>
            <Link
              href="/explore"
              className="text-gray-600 hover:text-gray-800 underline"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
