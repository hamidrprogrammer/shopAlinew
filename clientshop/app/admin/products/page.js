// app/admin/products/page.js
export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">مدیریت محصولات</h1>
        <div className="h-10 bg-primary-500 rounded-md animate-pulse w-32"></div> {/* Placeholder for "Add Product" button */}
      </div>

      {/* Filters and Search Placeholder */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Search input */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Category filter */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Sort by */}
        </div>
      </div>

      {/* Products Table Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['تصویر', 'نام محصول', 'دسته بندی', 'قیمت', 'موجودی', 'عملیات'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: 5 }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-4/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-reverse space-x-2">
                    <div className="h-7 w-16 bg-blue-200 dark:bg-blue-700 rounded animate-pulse"></div>
                    <div className="h-7 w-16 bg-red-200 dark:bg-red-700 rounded animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Placeholder */}
      <div className="mt-6 flex justify-center">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-1/3"></div>
      </div>
    </div>
  );
}
