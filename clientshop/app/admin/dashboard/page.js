// app/admin/dashboard/page.js
export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">داشبورد مدیریت</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Stat Card Placeholders */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/2"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder 1 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>

        {/* Chart Placeholder 2 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Recent Orders Table Placeholder */}
      <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/4 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/5"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/5"></div>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
