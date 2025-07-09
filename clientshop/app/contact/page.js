// app/contact/page.js
export default function ContactPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">تماس با ما</h1>
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form Placeholder */}
          <div className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">ارسال پیام</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">نام شما</label>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">ایمیل شما</label>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">موضوع</label>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only">پیام شما</label>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              </div>
              <div className="h-12 bg-primary-500 rounded-md animate-pulse"></div>
            </form>
          </div>

          {/* Contact Information Placeholder */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">اطلاعات تماس</h2>
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-1 text-gray-700 dark:text-gray-200 h-6 w-1/4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></h3>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-3/4"></div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-1 text-gray-700 dark:text-gray-200 h-6 w-1/5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></h3>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/5"></div>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
              <h3 className="font-semibold text-lg mb-1 text-gray-700 dark:text-gray-200 h-6 w-1/3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></h3>
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-full"></div>
              <div className="h-5 mt-1 bg-gray-300 dark:bg-gray-600 rounded animate-pulse w-2/3"></div>
            </div>
            {/* Optional: Map Placeholder */}
            {/* <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
