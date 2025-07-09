// app/admin/layout.js
// This layout will wrap all admin pages

// Placeholder for a more sophisticated admin-specific layout later
// For now, it might be simple or even re-use parts of the main layout if suitable,
// but usually, admin layouts are quite different.

export const metadata = {
  title: 'پنل مدیریت فروشگاه',
  description: 'پنل مدیریت مبلمان شاپ',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar Placeholder - Will be a dedicated component */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">پنل ادمین</h2>
        </div>
        <nav className="mt-6">
          {/* Navigation links will be added here */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse m-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse m-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse m-2"></div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header Placeholder - Could be different from the shop header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4"></div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
