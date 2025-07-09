// app/products/[id]/page.js
'use client';

import { useParams, notFound } from 'next/navigation'; // Use useParams for client components
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Star, Plus, Minus, Heart, MessageCircle, Share2 } from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import ProductCard from '../../../components/products/ProductCard';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
// import { useForm } from 'react-hook-form'; // For review form
// import { zodResolver } from '@hookform/resolvers/zod'; // For review form
// import * as z from 'zod'; // For review form schema

// Mock data - reuse from products/page.js or define more detailed structure here
// Ensure mockAllProducts is accessible or redefine it here for clarity if needed.
// For simplicity, assuming mockAllProducts is available globally or imported.
const mockAllProducts = [
  { id: '1', name: 'Elegant Velvet Sofa', price: 799.99, imageUrl: '/images/placeholder-product.png', slug: 'elegant-velvet-sofa', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Gray', material: 'Velvet', rating: 4.5, reviewsCount: 120, description: 'A luxurious velvet sofa that brings comfort and style to your living space. Crafted with high-quality materials and attention to detail.', images: [{id: 'img1', url: '/images/placeholder-product.png', alt:'Sofa front'}, {id: 'img2', url: '/images/placeholder-product-alt1.png', alt:'Sofa side'}, {id: 'img3', url: '/images/placeholder-product-alt2.png', alt:'Sofa detail'}], stock: 10, options: [{name: 'Color', values: ['Gray', 'Navy Blue', 'Emerald Green']}]},
  { id: '2', name: 'Oak Wood Coffee Table', price: 249.50, imageUrl: '/images/placeholder-product.png', slug: 'oak-wood-coffee-table', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Brown', material: 'Wood', rating: 4.2, reviewsCount: 85, description: 'Solid oak wood coffee table with a natural finish. Perfect for modern and rustic interiors.', images: [{id: 'img1', url: '/images/placeholder-product.png', alt:'Table top'}], stock: 15 },
  // Add more products with similar structure for related products section
    { id: '3', name: 'Industrial Bookshelf', price: 319.00, imageUrl: '/images/placeholder-product.png', slug: 'industrial-bookshelf', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Black', material: 'Metal', rating: 4.8, reviewsCount: 95, description: 'Stylish industrial bookshelf with metal frame and wooden shelves.', images: [{id: 'img1', url: '/images/placeholder-product.png', alt:'Bookshelf'}], stock: 5 },
    { id: '4', name: 'Modern Dining Chairs (Set of 2)', price: 199.00, imageUrl: '/images/placeholder-product.png', slug: 'modern-dining-chairs', categorySlug: 'dining', categoryName: 'Dining', color: 'White', material: 'Plastic', rating: 4.0, reviewsCount: 65, description: 'Set of two modern dining chairs, perfect for a contemporary dining room.', images: [{id: 'img1', url: '/images/placeholder-product.png', alt:'Dining chairs'}], stock: 20 },
    { id: '5', name: 'Queen Size Upholstered Bed', price: 599.00, imageUrl: '/images/placeholder-product.png', slug: 'queen-upholstered-bed', categorySlug: 'bedroom', categoryName: 'Bedroom', color: 'Beige', material: 'Fabric', rating: 4.6, reviewsCount: 150, description: 'Comfortable queen size bed with upholstered headboard.', images: [{id: 'img1', url: '/images/placeholder-product.png', alt:'Bed'}], stock: 8 },
];

const mockReviews = [
    { id: 'r1', user: 'Alice M.', rating: 5, comment: 'Absolutely love this sofa! So comfortable and looks amazing in my living room.', date: '2023-10-15' },
    { id: 'r2', user: 'Bob K.', rating: 4, comment: 'Great quality for the price. Assembly was a bit tricky but worth it.', date: '2023-10-20'},
    { id: 'r3', user: 'Carol P.', rating: 5, comment: 'Beautiful coffee table, exactly as described. Highly recommend!', date: '2023-11-01'},
];

// TODO: Define Zod schema for review form later
// const reviewFormSchema = z.object({
//   rating: z.number().min(1).max(5),
//   comment: z.string().min(10, "Comment must be at least 10 characters").max(500),
//   name: z.string().min(2, "Name is required"), // Optional if user is logged in
// });


export default function ProductDetailPage() {
  const params = useParams();
  const { id: productIdOrSlug } = params; // id is the slug or actual ID from the URL
  const t = useTranslations('ProductDetailPage');
  const tCommon = useTranslations('Common');

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  // const { register, handleSubmit, formState: { errors } } = useForm(); // For review form

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching product data
    const foundProduct = mockAllProducts.find(p => p.slug === productIdOrSlug || p.id === productIdOrSlug);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedImage(foundProduct.images?.[0]?.url || foundProduct.imageUrl || '/images/placeholder-product.png');
    } else {
      // Handle product not found, though `notFound()` from next/navigation is for server components.
      // For client components, you might redirect or show a "not found" state.
      // For now, we'll just set product to null and the UI will handle it.
      console.error("Product not found:", productIdOrSlug);
    }
    const timer = setTimeout(() => setIsLoading(false), 300); // Simulate loading
    return () => clearTimeout(timer);
  }, [productIdOrSlug]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    // In a real app, you might redirect to a 404 page.
    // For now, just show a message.
    // `notFound()` can only be used in Server Components.
    return <div className="container mx-auto px-4 py-8 text-center">{t('productNotFound')}</div>;
  }

  const handleQuantityChange = (amount) => {
    setQuantity(prev => Math.max(1, Math.min(prev + amount, product.stock || 10))); // Min 1, Max stock (default 10 if no stock)
  };

  const handleAddToCart = () => {
    console.log(`Adding ${quantity} of ${product.name} to cart.`);
    // TODO: Implement Zustand cart logic
  };

  const handleToggleWishlist = () => {
    console.log(`Toggling wishlist for ${product.name}.`);
    // TODO: Implement Zustand wishlist logic
  };

  // const onReviewSubmit = (data) => {
  //   console.log('Review submitted:', data);
  //   // TODO: API call to submit review
  // };

  const relatedProducts = mockAllProducts.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg bg-light-secondary dark:bg-dark-secondary">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain transition-all duration-300 ease-in-out" // object-contain might be better for product images
              onError={(e) => { e.currentTarget.src = '/images/placeholder-product.png'; }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative aspect-square rounded-md overflow-hidden transition-all duration-150
                    ${selectedImage === img.url
                      ? 'ring-2 ring-light-primary dark:ring-dark-primary ring-offset-2 dark:ring-offset-dark-background'
                      : 'hover:opacity-80'
                    }`}
                >
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="py-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-light-text dark:text-dark-text mb-3">{product.name}</h1>
          <div className="flex items-center mb-4 space-x-2 rtl:space-x-reverse">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
              ))}
            </div>
            <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              ({product.reviewsCount || 0} {t('reviewsLink')})
            </span>
            {/* TODO: Add link to reviews section */}
          </div>

          <p className="text-3xl font-semibold text-light-primary dark:text-dark-primary mb-6">
            ${parseFloat(product.price).toFixed(2)} {/* TODO: Currency formatting */}
          </p>

          {/* Product Options (Example) */}
          {product.options?.map(option => (
            <div key={option.name} className="mb-4">
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">{option.name}:</label>
              {/* TODO: Implement actual option selector (e.g., Select component or color swatches) */}
              <div className="flex space-x-2 rtl:space-x-reverse">
                {option.values.map(value => (
                  <Button key={value} variant="outline" size="sm">{value}</Button>
                ))}
              </div>
            </div>
          ))}

          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity Selector & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
            <div className="flex items-center border border-light-border dark:border-dark-border rounded-md p-1">
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label={t('decreaseQuantity')}>
                <Minus className="h-5 w-5" />
              </Button>
              <span className="w-10 text-center font-medium text-light-text dark:text-dark-text" aria-live="polite">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(1)} disabled={quantity >= (product.stock || 10)} aria-label={t('increaseQuantity')}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} className="flex-grow sm:flex-none">
              <ShoppingCart className="mr-2 rtl:ml-2 h-5 w-5" /> {t('addToCart')}
            </Button>
            <Button variant="outline" size="lg" onClick={handleToggleWishlist} className="flex-grow sm:flex-none" aria-label={t('addToWishlist')}>
              <Heart className="mr-2 rtl:ml-2 h-5 w-5" /> {/* TODO: Toggle fill */}
            </Button>
          </div>

          {/* Stock Info */}
          <p className={`text-sm mb-6 ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {product.stock > 0 ? t('inStock', { count: product.stock }) : t('outOfStock')}
          </p>

          {/* Share Buttons (Placeholder) */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <Share2 className="h-4 w-4" />
            <span>{t('share')}:</span>
            {/* TODO: Implement actual share links/buttons */}
            <a href="#" className="hover:text-light-primary dark:hover:text-dark-primary">Facebook</a>
            <a href="#" className="hover:text-light-primary dark:hover:text-dark-primary">Twitter</a>
            <a href="#" className="hover:text-light-primary dark:hover:text-dark-primary">Pinterest</a>
          </div>
        </div>
      </div>

      {/* Reviews Section - Placeholder UI */}
      <section className="mt-12 lg:mt-16 py-8 border-t border-light-border dark:border-dark-border">
        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6">{t('customerReviews.title')}</h2>
        <div className="space-y-6 mb-8">
          {mockReviews.slice(0,2).map(review => (
            <article key={review.id} className="p-4 border border-light-border dark:border-dark-border rounded-lg bg-light-secondary/50 dark:bg-dark-secondary/50">
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-2 rtl:ml-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} />
                  ))}
                </div>
                <h4 className="font-semibold text-light-text dark:text-dark-text">{review.user}</h4>
                <time dateTime={review.date} className="ml-auto rtl:mr-auto text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {new Date(review.date).toLocaleDateString()} {/* TODO: Format date based on locale */}
                </time>
              </div>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">{review.comment}</p>
            </article>
          ))}
          {mockReviews.length > 2 && <Button variant="link">{t('customerReviews.seeAll', {count: product.reviewsCount})}</Button>}
        </div>
        {/* Add Review Form - Placeholder UI */}
        <div>
          <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">{t('customerReviews.addReviewTitle')}</h3>
          <form className="space-y-4">
            <div>
              <label htmlFor="review-rating" className="block text-sm font-medium mb-1">{t('customerReviews.yourRating')}</label>
              {/* TODO: Implement star rating input */}
              <Input type="number" id="review-rating" name="rating" min="1" max="5" placeholder="1-5" />
            </div>
            <div>
              <label htmlFor="review-comment" className="block text-sm font-medium mb-1">{t('customerReviews.yourComment')}</label>
              <Textarea id="review-comment" name="comment" rows={4} placeholder={t('customerReviews.commentPlaceholder')} />
            </div>
            <Button type="submit">{t('customerReviews.submitReview')}</Button>
          </form>
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 lg:mt-16 py-8 border-t border-light-border dark:border-dark-border">
          <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6">{t('relatedProducts.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <SkeletonLoader height="h-80 md:h-96" className="rounded-lg" />
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {[...Array(4)].map((_, i) => <SkeletonLoader key={i} height="h-16 md:h-20" className="rounded-md" />)}
          </div>
        </div>
        <div className="py-4 space-y-4">
          <SkeletonLoader height="h-10" width="w-3/4" className="rounded-md" />
          <SkeletonLoader height="h-6" width="w-1/4" className="rounded-md" />
          <SkeletonLoader height="h-8" width="w-1/2" className="rounded-md mb-4" />
          <SkeletonLoader height="h-20" width="w-full" className="rounded-md" />
          <div className="flex gap-4">
            <SkeletonLoader height="h-12" width="w-24" className="rounded-md" />
            <SkeletonLoader height="h-12" width="w-1/2" className="rounded-md" />
          </div>
          <SkeletonLoader height="h-6" width="w-1/3" className="rounded-md" />
        </div>
      </div>
      <div className="mt-12 lg:mt-16 py-8 border-t">
        <SkeletonLoader height="h-8" width="w-1/4" className="mb-6 rounded-md" />
        <div className="space-y-6">
          <SkeletonLoader height="h-24" className="rounded-lg" />
          <SkeletonLoader height="h-24" className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}
