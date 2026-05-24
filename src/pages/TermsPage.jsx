import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function TermsPage() {
  const { tx } = useAppContext();
  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="section-title-row">
          <h1 className="page-title">{tx("Terms of Service", "شروط الخدمة")}</h1>
          <p className="page-subtitle">{tx("Last updated: May 2026", "آخر تحديث: مايو 2026")}</p>
        </div>
        <div className="legal-content">
          <h2>{tx("1. Products", "١. المنتجات")}</h2>
          <p>{tx("All products sold on Excel Store are digital products delivered electronically. Due to the nature of digital products, all sales are final.", "جميع المنتجات المباعة على Excel Store هي منتجات رقمية تُسلَّم إلكترونيًا. نظرًا لطبيعة المنتجات الرقمية، جميع المبيعات نهائية.")}</p>
          <h2>{tx("2. License", "٢. الترخيص")}</h2>
          <p>{tx("Each purchased product grants you a single-user, non-transferable license. You may not resell, redistribute, or share the files.", "يمنحك كل منتج مشترى ترخيصًا لمستخدم واحد وغير قابل للتحويل. لا يجوز لك إعادة بيع الملفات أو توزيعها أو مشاركتها.")}</p>
          <h2>{tx("3. Downloads", "٣. التحميل")}</h2>
          <p>{tx("Downloads are provided once per order. If you experience a technical issue, contact our support team within 7 days.", "يتم توفير التحميلات مرة واحدة لكل طلب. إذا واجهت مشكلة تقنية، تواصل مع فريق الدعم في غضون 7 أيام.")}</p>
          <h2>{tx("4. Payments", "٤. المدفوعات")}</h2>
          <p>{tx("We use manual payment confirmation. Your order will be activated after our team verifies your payment proof.", "نستخدم تأكيد الدفع اليدوي. سيتم تفعيل طلبك بعد أن يتحقق فريقنا من إثبات دفعك.")}</p>
          <h2>{tx("5. Support", "٥. الدعم")}</h2>
          <p>{tx("We provide email and ticket-based support for product issues. Response time is typically within 24-48 hours.", "نقدم دعمًا عبر البريد الإلكتروني والتذاكر لمشكلات المنتجات. وقت الاستجابة عادةً 24-48 ساعة.")}</p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default TermsPage;
