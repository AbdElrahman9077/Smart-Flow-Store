import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./animations";

function About() {
  const { tx } = useAppContext();

  const values = [
    {
      title: tx("Excel Products", "منتجات Excel"),
      text: tx("Ready templates, VBA systems, dashboards, accounting, HR, inventory, and reporting tools are the current strongest product slice.", "القوالب الجاهزة وأنظمة VBA ولوحات المتابعة وأدوات الحسابات والموارد البشرية والمخزون والتقارير هي الشريحة الأقوى حاليًا."),
    },
    {
      title: tx("Web App Services", "خدمات تطبيقات الويب"),
      text: tx("Custom business systems, admin dashboards, and customer portals are available by request and scoped manually.", "أنظمة الأعمال المخصصة ولوحات الإدارة وبوابات العملاء متاحة حسب الطلب ويتم تحديد نطاقها يدويًا."),
    },
    {
      title: tx("SaaS and Desktop Roadmap", "خارطة SaaS وسطح المكتب"),
      text: tx("Subscription products, desktop license activation, and device management are planned production modules, not current automated features.", "منتجات الاشتراك وتفعيل تراخيص سطح المكتب وإدارة الأجهزة وحدات إنتاجية مخططة وليست ميزات مؤتمتة حاليًا."),
    },
  ];

  return (
    <AnimatedSection className="about-section">
      <div className="container split-section">
        <div>
          <span className="section-kicker">{tx("Current platform shape", "شكل المنصة الحالي")}</span>
          <h2>{tx("A Smart Flow Hub foundation with Excel products available now.", "أساس Smart Flow Hub مع منتجات Excel متاحة الآن.")}</h2>
          <p>
            {tx(
              "Smart Flow Hub is being organized as the central business software hub. Today it provides a digital products and Excel store foundation with manual payments, partial customer/admin portals, support tickets, and secure-download infrastructure.",
              "يتم تنظيم Smart Flow Hub كمركز برمجيات الأعمال. حاليًا يوفر أساس متجر منتجات رقمية ومنتجات Excel مع دفع يدوي وبوابات عملاء وإدارة جزئية وتذاكر دعم وبنية تحميل آمن."
            )}
          </p>
          <div className="section-actions">
            <Link to="/products" className="primary-link-btn">{tx("Browse products", "تصفح المنتجات")}</Link>
            <Link to="/custom-request" className="secondary-link-btn">{tx("Request a custom project", "اطلب مشروعًا مخصصًا")}</Link>
          </div>
        </div>
        <StaggerContainer className="feature-card-grid">
          {values.map((item) => (
            <StaggerItem as="article" className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </AnimatedSection>
  );
}

export default About;
