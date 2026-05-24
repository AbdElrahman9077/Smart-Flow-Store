import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";
import { useState } from "react";

const faqs = [
  {
    q: "How do I download my purchased product?",
    qAr: "كيف أحمّل المنتج الذي اشتريته؟",
    a: "After your payment is confirmed by our team, your order status changes to 'Confirmed'. Go to My Orders to download your file. Each product can be downloaded once.",
    aAr: "بعد تأكيد دفعك من قبل فريقنا، تتغير حالة طلبك إلى 'تم التأكيد'. اذهب إلى طلباتي لتحميل ملفك. يمكن تحميل كل منتج مرة واحدة.",
  },
  {
    q: "What payment methods do you accept?",
    qAr: "ما طرق الدفع المقبولة؟",
    a: "We accept Vodafone Cash, Instapay, and Bank Transfer. After payment, upload your proof in the checkout form.",
    aAr: "نقبل فودافون كاش وإنستاباي والتحويل البنكي. بعد الدفع، ارفع إثبات دفعك في نموذج الطلب.",
  },
  {
    q: "Can I request a customized Excel system?",
    qAr: "هل يمكنني طلب نظام Excel مخصص؟",
    a: "Yes! Visit our Custom Request page to submit your requirements. We'll contact you with a quote within 24 hours.",
    aAr: "نعم! زر صفحة الطلب المخصص لإرسال متطلباتك. سنتواصل معك بعرض سعر خلال 24 ساعة.",
  },
  {
    q: "What is a license key?",
    qAr: "ما هو مفتاح الترخيص؟",
    a: "A license key is a unique code generated for your purchase. It proves ownership and may be required for premium updates or support.",
    aAr: "مفتاح الترخيص هو رمز فريد يُنشأ لعملية الشراء الخاصة بك. يثبت الملكية وقد يكون مطلوبًا للتحديثات أو الدعم.",
  },
  {
    q: "What versions of Excel are supported?",
    qAr: "ما إصدارات Excel المدعومة؟",
    a: "Most products support Excel 2013 and later. Each product page lists the specific compatibility.",
    aAr: "معظم المنتجات تدعم Excel 2013 وما بعده. تذكر كل صفحة منتج التوافق المحدد.",
  },
  {
    q: "Do you offer refunds?",
    qAr: "هل تقدمون استردادًا للأموال؟",
    a: "Because these are digital products, all sales are final. However, if you experience a technical issue with your download, please contact our support team.",
    aAr: "نظرًا لأن هذه منتجات رقمية، جميع المبيعات نهائية. ومع ذلك، إذا واجهت مشكلة تقنية في التحميل، تواصل مع فريق الدعم.",
  },
  {
    q: "How do I contact support?",
    qAr: "كيف أتواصل مع الدعم؟",
    a: "Log into your account and go to Account > Support to open a ticket. You can also contact us via WhatsApp.",
    aAr: "سجّل دخولك وانتقل إلى حسابي > الدعم لفتح تذكرة. يمكنك أيضًا التواصل معنا عبر واتساب.",
  },
];

function FaqPage() {
  const { tx } = useAppContext();
  const [open, setOpen] = useState(null);

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="section-title-row">
          <span className="section-kicker">❓ FAQ</span>
          <h1 className="page-title">{tx("Frequently Asked Questions", "الأسئلة الشائعة")}</h1>
          <p className="page-subtitle">
            {tx(
              "Everything you need to know about buying and using our Excel products.",
              "كل ما تحتاج معرفته عن شراء واستخدام منتجات Excel لدينا."
            )}
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={i} className={`faq-item ${open === i ? "faq-open" : ""}`}>
              <button
                className="faq-question"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{tx(faq.q, faq.qAr)}</span>
                <span className="faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="faq-answer">
                  <p>{tx(faq.a, faq.aAr)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default FaqPage;
