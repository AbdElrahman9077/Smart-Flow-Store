import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

const faqs = [
  {
    q: "How do I receive my purchased product?",
    qAr: "كيف أستلم المنتج بعد الشراء؟",
    a: "After our team confirms your manual payment, your account unlocks the download and license key.",
    aAr: "بعد أن يؤكد فريقنا الدفع اليدوي، يتم فتح التحميل ومفتاح الترخيص داخل حسابك.",
  },
  {
    q: "What payment methods are supported?",
    qAr: "ما طرق الدفع المتاحة؟",
    a: "The current workflow supports manual payment confirmation by bank transfer, Instapay, or wallet instructions configured by the admin.",
    aAr: "يدعم النظام الحالي تأكيد الدفع اليدوي عبر التحويل البنكي أو إنستاباي أو تعليمات المحفظة التي تحددها الإدارة.",
  },
  {
    q: "Can I request a customized Excel system?",
    qAr: "هل يمكنني طلب نظام Excel مخصص؟",
    a: "Yes. Submit your requirements from the Custom Request page and the team will respond with scope, timeline, and pricing.",
    aAr: "نعم. أرسل متطلباتك من صفحة الطلب المخصص وسيتواصل الفريق معك بنطاق العمل والمدة والتكلفة.",
  },
  {
    q: "What is a license key?",
    qAr: "ما هو مفتاح الترخيص؟",
    a: "A license key identifies your purchase and may be required for support, updates, or controlled access.",
    aAr: "مفتاح الترخيص يعرّف عملية الشراء وقد يُستخدم للدعم أو التحديثات أو الوصول المنظم.",
  },
  {
    q: "Which Excel versions are supported?",
    qAr: "ما إصدارات Excel المدعومة؟",
    a: "Most products support modern desktop Excel versions. Each product page lists compatibility details where available.",
    aAr: "تدعم معظم المنتجات إصدارات Excel المكتبية الحديثة، وتوضح صفحة كل منتج تفاصيل التوافق عند توفرها.",
  },
];

function FaqPage() {
  const { tx } = useAppContext();
  const [open, setOpen] = useState(null);

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="section-title-row">
          <span className="section-kicker">FAQ</span>
          <h1 className="page-title">{tx("Frequently Asked Questions", "الأسئلة الشائعة")}</h1>
          <p className="page-subtitle">{tx("Clear answers about checkout, delivery, licenses, and custom Excel work.", "إجابات واضحة حول الشراء والتسليم والتراخيص وأعمال Excel المخصصة.")}</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div key={faq.q} className={`faq-item ${open === i ? "faq-open" : ""}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span>{tx(faq.q, faq.qAr)}</span>
                <span className="faq-icon">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="faq-answer"><p>{tx(faq.a, faq.aAr)}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}

export default FaqPage;
