import type { Product } from '../content/products'
import {
  CATEGORY_LABELS_PRODUCT,
  formatPrice,
  getDiscountPercent,
} from '../content/products'

interface Props {
  product: Product
  label?: string // 기본: "EDITOR'S PICK"
}

export function EditorsPickCard({ product, label = "EDITOR'S PICK" }: Props) {
  const discount = getDiscountPercent(product)

  return (
    <a
      href={product.affiliateURL}
      target="_blank"
      rel="noopener sponsored"
      className="block group relative"
      aria-label={`${product.name} - ${product.vendor}에서 보기`}
    >
      {/* Yellow sticker — "EDITOR'S PICK" */}
      <div className="absolute -top-3 -left-3 z-10 rotate-[-8deg] transform">
        <div
          className="bg-warming px-4 py-2 shadow-md"
          style={{ clipPath: 'polygon(0% 10%, 100% 0%, 95% 95%, 5% 100%)' }}
        >
          <div className="headline-italic text-ink-900 text-lg leading-tight">
            Editor's<br />
            Pick
          </div>
        </div>
      </div>

      {/* Circular product image */}
      <div className="relative">
        <div
          className="aspect-square rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: product.thumbnailColor ?? '#E0D6C2' }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="headline-italic text-cream-100/30 text-4xl text-center px-4">
              {product.brand}
            </div>
          )}
        </div>

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-signal text-cream-100 px-2 py-1 typewriter-label">
            {discount}% OFF
          </div>
        )}

        {/* Price pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-cream-100 border border-ink-900 px-3 py-1 whitespace-nowrap">
          {product.originalPrice ? (
            <span className="typewriter text-xs">
              <span className="line-through text-ink-400 mr-1">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-signal font-bold">
                NOW {formatPrice(product.price)}
              </span>
            </span>
          ) : (
            <span className="typewriter text-ink-900 text-xs font-medium">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Below circle */}
      <div className="text-center mt-6">
        <div className="typewriter-label text-signal mb-2">
          {label}
        </div>
        <div className="typewriter-label text-ink-500 text-xs mb-2">
          {CATEGORY_LABELS_PRODUCT[product.category]} · {product.brand}
        </div>
        <h3 className="headline text-base md:text-lg text-ink-900 group-hover:text-signal transition leading-tight px-2">
          {product.name}
        </h3>
        <p className="body-text text-ink-500 text-xs mt-2 px-2">
          {product.dek}
        </p>

        {/* CTA button */}
        <div className="mt-4">
          <span className="inline-block border border-ink-900 px-4 py-2 typewriter-label text-ink-900 group-hover:bg-ink-900 group-hover:text-cream-100 transition">
            BUY AT {product.vendor}
          </span>
        </div>
      </div>
    </a>
  )
}
