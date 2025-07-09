// app/admin/orders/page.js
export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">مدیریت سفارشات</h1>

      {/* Filters Placeholder */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Order ID search */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Status filter */}
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div> {/* Date range filter */}
        </div>
      </div>

      {/* Orders Table Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['شماره سفارش', 'مشتری', 'تاریخ', 'مجموع', 'وضعیت', 'عملیات'].map(header => (
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
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-4/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/5"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-5 w-20 bg-yellow-200 dark:bg-yellow-700 rounded-full animate-pulse px-2 inline-flex text-xs leading-5 font-semibold"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="h-7 w-20 bg-blue-200 dark:bg-blue-700 rounded animate-pulse"></div>
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
