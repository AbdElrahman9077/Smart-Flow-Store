import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function PrivacyPage() {
  const { tx } = useAppContext();
  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="section-title-row">
          <h1 className="page-title">{tx("Privacy Policy", "سياسة الخصوصية")}</h1>
          <p className="page-subtitle">{tx("Last updated: May 2026", "آخر تحديث: مايو 2026")}</p>
        </div>
        <div className="legal-content">
          <h2>{tx("Data We Collect", "البيانات التي نجمعها")}</h2>
          <p>{tx("We collect your name, email, phone number, and payment details necessary to process your order.", "نجمع اسمك وبريدك الإلكتروني ورقم هاتفك وتفاصيل الدفع اللازمة لمعالجة طلبك.")}</p>
          <h2>{tx("How We Use Your Data", "كيف نستخدم بياناتك")}</h2>
          <p>{tx("Your data is used exclusively to process orders, deliver products, and provide customer support. We do not sell your data.", "تُستخدم بياناتك حصريًا لمعالجة الطلبات وتسليم المنتجات وتقديم دعم العملاء. نحن لا نبيع بياناتك.")}</p>
          <h2>{tx("Data Security", "أمان البيانات")}</h2>
          <p>{tx("Your data is stored securely using Supabase with Row Level Security (RLS) enabled. Passwords are encrypted.", "يتم تخزين بياناتك بأمان باستخدام Supabase مع تمكين أمان مستوى الصف (RLS). كلمات المرور مشفرة.")}</p>
          <h2>{tx("Cookies", "ملفات تعريف الارتباط")}</h2>
          <p>{tx("We use session cookies for authentication. We do not use third-party tracking cookies.", "نستخدم ملفات تعريف الجلسة للمصادقة. لا نستخدم ملفات تعريف التتبع الخاصة بطرف ثالث.")}</p>
          <h2>{tx("Contact", "التواصل")}</h2>
          <p>{tx("For privacy concerns, contact us at support@excelstore.com", "للاستفسارات المتعلقة بالخصوصية، تواصل معنا على support@excelstore.com")}</p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default PrivacyPage;
