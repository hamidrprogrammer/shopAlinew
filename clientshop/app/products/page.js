// app/products/page.js
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import ProductCard from '../../components/products/ProductCard';
import Filters from '../../components/products/Filters';
import Pagination from '../../components/common/Pagination';
import Sorting from '../../components/products/Sorting';
import { useTranslations } from 'next-intl';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';

// Mock data - replace with API call using React Query
const mockAllProducts = [
  { id: '1', name: 'Elegant Velvet Sofa', price: 799.99, imageUrl: '/images/placeholder-product.png', slug: 'elegant-velvet-sofa', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Gray', material: 'Velvet', rating: 4.5, reviews: 120 },
  { id: '2', name: 'Oak Wood Coffee Table', price: 249.50, imageUrl: '/images/placeholder-product.png', slug: 'oak-wood-coffee-table', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Brown', material: 'Wood', rating: 4.2, reviews: 85 },
  { id: '3', name: 'Industrial Bookshelf', price: 319.00, imageUrl: '/images/placeholder-product.png', slug: 'industrial-bookshelf', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Black', material: 'Metal', rating: 4.8, reviews: 95 },
  { id: '4', name: 'Modern Dining Chairs (Set of 2)', price: 199.00, imageUrl: '/images/placeholder-product.png', slug: 'modern-dining-chairs', categorySlug: 'dining', categoryName: 'Dining', color: 'White', material: 'Plastic', rating: 4.0, reviews: 65 },
  { id: '5', name: 'Queen Size Upholstered Bed', price: 599.00, imageUrl: '/images/placeholder-product.png', slug: 'queen-upholstered-bed', categorySlug: 'bedroom', categoryName: 'Bedroom', color: 'Beige', material: 'Fabric', rating: 4.6, reviews: 150 },
  { id: '6', name: 'Minimalist Nightstand', price: 129.00, imageUrl: '/images/placeholder-product.png', slug: 'minimalist-nightstand', categorySlug: 'bedroom', categoryName: 'Bedroom', color: 'White', material: 'Wood', rating: 4.3, reviews: 70 },
  { id: '7', name: 'Extendable Dining Table', price: 650.00, imageUrl: '/images/placeholder-product.png', slug: 'extendable-dining-table', categorySlug: 'dining', categoryName: 'Dining', color: 'Brown', material: 'Wood', rating: 4.7, reviews: 110 },
  { id: '8', name: 'Cozy Throw Blanket', price: 49.99, imageUrl: '/images/placeholder-product.png', slug: 'cozy-throw-blanket', categorySlug: 'decor', categoryName: 'Decor', color: 'Blue', material: 'Fabric', rating: 4.9, reviews: 200 },
  { id: '9', name: 'Geometric Pattern Rug', price: 189.00, imageUrl: '/images/placeholder-product.png', slug: 'geometric-rug', categorySlug: 'decor', categoryName: 'Decor', color: 'Multicolor', material: 'Fabric', rating: 4.1, reviews: 55 },
  { id: '10', name: 'LED Floor Lamp', price: 89.50, imageUrl: '/images/placeholder-product.png', slug: 'led-floor-lamp', categorySlug: 'lighting', categoryName: 'Lighting', color: 'Black', material: 'Metal', rating: 3.9, reviews: 40 },
  { id: '11', name: 'Red Velvet Armchair', price: 320.00, imageUrl: '/images/placeholder-product.png', slug: 'red-velvet-armchair', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Red', material: 'Velvet', rating: 4.4, reviews: 77 },
  { id: '12', name: 'Small Wooden Stool', price: 75.00, imageUrl: '/images/placeholder-product.png', slug: 'small-wooden-stool', categorySlug: 'decor', categoryName: 'Decor', color: 'Brown', material: 'Wood', rating: 4.0, reviews: 30 },
  { id: '13', name: 'Luxury King Size Bed', price: 899.00, imageUrl: '/images/placeholder-product.png', slug: 'luxury-king-bed', categorySlug: 'bedroom', categoryName: 'Bedroom', color: 'Dark Gray', material: 'Fabric', rating: 4.9, reviews: 180 },
  { id: '14', name: 'Round Marble Dining Table', price: 720.00, imageUrl: '/images/placeholder-product.png', slug: 'marble-dining-table', categorySlug: 'dining', categoryName: 'Dining', color: 'White', material: 'Marble', rating: 4.8, reviews: 92 },
  { id: '15', name: 'Vintage Leather Sofa', price: 1200.00, imageUrl: '/images/placeholder-product.png', slug: 'vintage-leather-sofa', categorySlug: 'living-room', categoryName: 'Living Room', color: 'Brown', material: 'Leather', rating: 4.7, reviews: 130 },
];

const mockCategoriesForFilter = [
    { id: 'all', nameKey: 'allCategories', defaultName: 'All Categories', slug: 'all'},
    { id: 'cat1', nameKey: 'livingRoom', defaultName: 'Living Room', slug: 'living-room' },
    { id: 'cat2', nameKey: 'bedroom', defaultName: 'Bedroom', slug: 'bedroom' },
    { id: 'cat3', nameKey: 'dining', defaultName: 'Dining', slug: 'dining' },
    { id: 'cat4', nameKey: 'decor', defaultName: 'Decor', slug: 'decor' },
    { id: 'cat5', nameKey: 'lighting', defaultName: 'Lighting', slug: 'lighting' },
];

const PRODUCTS_PER_PAGE = 9;

function ProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('ProductsPage');
  const tFilters = useTranslations('Filters'); // For category names in Filters component
  const tCommon = useTranslations('Common');

  const [isLoading, setIsLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState(() => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      category: params.get('category') || 'all',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      colors: params.getAll('color') || [],
      materials: params.getAll('material') || [],
    };
  });
  const [currentSort, setCurrentSort] = useState(searchParams.get('sort') || 'default');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    const params = new URLSearchParams();
    if (activeFilters.category && activeFilters.category !== 'all') params.set('category', activeFilters.category);
    if (activeFilters.minPrice) params.set('minPrice', activeFilters.minPrice);
    if (activeFilters.maxPrice) params.set('maxPrice', activeFilters.maxPrice);
    activeFilters.colors.forEach(color => params.append('color', color));
    activeFilters.materials.forEach(material => params.append('material', material));
    if (currentSort !== 'default') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);

  }, [activeFilters, currentSort, currentPage, pathname, router]);

  const processedProducts = useMemo(() => {
    let products = [...mockAllProducts];
    if (activeFilters.category && activeFilters.category !== 'all') {
      products = products.filter(p => p.categorySlug === activeFilters.category);
    }
    if (activeFilters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(activeFilters.minPrice));
    }
    if (activeFilters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(activeFilters.maxPrice));
    }
    if (activeFilters.colors.length > 0) {
      products = products.filter(p => activeFilters.colors.includes(p.color?.toLowerCase()));
    }
    if (activeFilters.materials.length > 0) {
      products = products.filter(p => activeFilters.materials.includes(p.material?.toLowerCase()));
    }

    switch (currentSort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'name-asc': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': products.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'newest': products.sort((a,b) => (b.id || 0) - (a.id || 0)); break; // Assuming higher ID is newer for mock
      case 'popularity': products.sort((a,b) => (b.reviews || 0) - (a.reviews || 0)); break;
      default: break;
    }
    return products;
  }, [activeFilters, currentSort]);

  const totalProducts = processedProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const paginatedProducts = processedProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleCategoryChange = (categorySlug) => {
    setActiveFilters(prev => ({ ...prev, category: categorySlug, colors: [], materials: [] })); // Reset other filters on cat change
    setCurrentPage(1);
  };
  const handlePriceChange = ({ min, max }) => {
    setActiveFilters(prev => ({ ...prev, minPrice: min || '', maxPrice: max || '' }));
    setCurrentPage(1);
  };
  const handleColorChange = (selectedColors) => {
    setActiveFilters(prev => ({ ...prev, colors: selectedColors }));
    setCurrentPage(1);
  };
  const handleMaterialChange = (selectedMaterials) => {
    setActiveFilters(prev => ({ ...prev, materials: selectedMaterials }));
    setCurrentPage(1);
  };
  const handleSortChange = (sortValue) => {
    setCurrentSort(sortValue);
    setCurrentPage(1);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCategory = mockCategoriesForFilter.find(c => c.slug === activeFilters.category);
  const pageTitle = currentCategory
    ? tFilters(`categories.options.${currentCategory.nameKey}`, {defaultValue: currentCategory.defaultName})
    : t('title');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-10rem)]">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text">
          {pageTitle}
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <Filters
          categories={mockCategoriesForFilter.map(c => ({...c, name: tFilters(`categories.options.${c.nameKey}`, {defaultValue: c.defaultName})}))}
          currentCategorySlug={activeFilters.category}
          onCategoryChange={handleCategoryChange}
          onPriceChange={handlePriceChange}
          onColorChange={handleColorChange}
          onMaterialChange={handleMaterialChange}
          initialFilters={activeFilters}
          className="lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
        />

        <main className="w-full lg:flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 p-4 rounded-md bg-light-secondary dark:bg-dark-secondary shadow-sm">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {isLoading ? tCommon('loading') : t('resultsCount', { count: totalProducts })}
            </p>
            <Sorting currentSort={currentSort} onSortChange={handleSortChange} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, index) => (
                <div key={index} className="space-y-3 p-3 rounded-lg bg-light-secondary dark:bg-dark-secondary shadow-neumo-light dark:shadow-neumo-dark">
                  <SkeletonLoader height="h-60" className="rounded-md"/>
                  <SkeletonLoader height="h-5" width="w-3/4"/>
                  <SkeletonLoader height="h-5" width="w-1/2"/>
                </div>
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 min-h-[300px] flex flex-col justify-center items-center">
              <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary mb-4">
                {t('noProductsFound')}
              </p>
              <Button variant="outline" onClick={() => {
                setActiveFilters({ category: 'all', minPrice: '', maxPrice: '', colors: [], materials: [] });
                setCurrentSort('default');
                setCurrentPage(1);
              }}>
                {tCommon('clearAllFilters')}
              </Button>
            </div>
          )}

          {totalPages > 1 && !isLoading && (
            <div className="mt-10 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams hook
export default function ProductsPageWithSuspense() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function PageSkeleton() {
  // Basic skeleton for the whole page while searchParams are resolving or initial load
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-10rem)]">
      <header className="mb-8 text-center">
        <SkeletonLoader height="h-10" width="w-1/2" className="mx-auto rounded-md" />
      </header>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-1/4 xl:w-1/5 space-y-6">
          <SkeletonLoader height="h-64" className="rounded-lg" />
          <SkeletonLoader height="h-32" className="rounded-lg" />
        </aside>
        <main className="w-full lg:flex-1">
          <div className="flex justify-between items-center mb-6 p-4 rounded-md">
            <SkeletonLoader height="h-5" width="w-1/4" />
            <SkeletonLoader height="h-10" width="w-1/3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3 p-3 rounded-lg">
                <SkeletonLoader height="h-60" className="rounded-md"/>
                <SkeletonLoader height="h-5" width="w-3/4"/>
                <SkeletonLoader height="h-5" width="w-1/2"/>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
