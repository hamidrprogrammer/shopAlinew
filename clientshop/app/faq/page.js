// app/faq/page.js
export default function FAQPage() {
  // Placeholder data for FAQs. This will come from a CMS or backend later.
  const faqs = [
    {
      question: "چگونه می‌توانم سفارش خود را ثبت کنم؟",
      answer: "برای ثبت سفارش، ابتدا محصول مورد نظر خود را به سبد خرید اضافه کنید. سپس به صفحه سبد خرید رفته و روی دکمه تسویه حساب کلیک کنید. پس از وارد کردن اطلاعات ارسال و پرداخت، سفارش شما نهایی خواهد شد."
    },
    {
      question: "روش‌های پرداخت به چه صورت است؟",
      answer: "شما می‌توانید از طریق درگاه پرداخت آنلاین با تمامی کارت‌های عضو شتاب و یا از طریق واریز به حساب، هزینه سفارش خود را پرداخت نمایید."
    },
    {
      question: "مدت زمان ارسال سفارش چقدر است؟",
      answer: "زمان ارسال سفارش بسته به موقعیت مکانی شما و نوع محصول متفاوت است. معمولاً سفارشات در تهران طی ۱ تا ۳ روز کاری و در سایر شهرها طی ۳ تا ۷ روز کاری تحویل داده می‌شوند."
    },
    {
      question: "آیا امکان بازگشت کالا وجود دارد؟",
      answer: "بله، در صورت عدم رضایت از محصول یا وجود هرگونه مغایرت، تا ۷ روز پس از تحویل کالا امکان بازگشت آن وجود دارد. لطفاً شرایط بازگشت کالا را در صفحه مربوطه مطالعه فرمایید."
    }
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 dark:text-white">سوالات متداول</h1>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              // open={index === 0} // Optionally open the first FAQ by default
            >
              <summary className="flex justify-between items-center font-semibold text-lg text-gray-700 dark:text-gray-200 cursor-pointer list-none">
                {faq.question}
                <span className="ml-4 transform transition-transform duration-200 group-open:rotate-180">
                  {/* Chevron Down Icon Placeholder */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
