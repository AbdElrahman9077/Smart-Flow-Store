import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function About() {
  const { tx } = useAppContext();

  const values = [
    {
      title: tx("Built for business workflows", "مصممة لسير العمل التجاري"),
      text: tx("Every template focuses on practical reporting, operations, and decision-making needs.", "كل قالب يركز على التقارير والعمليات واتخاذ القرار بشكل عملي."),
    },
    {
      title: tx("Controlled digital delivery", "تسليم رقمي منظم"),
      text: tx("Orders, payment confirmation, downloads, and license keys are managed from one portal.", "تتم إدارة الطلبات وتأكيد الدفع والتحميلات ومفاتيح الترخيص من بوابة واحدة."),
    },
    {
      title: tx("Ready-made and custom", "جاهز ومخصص"),
      text: tx("Start with a ready-made system or request a tailored Excel solution for your exact process.", "ابدأ بنظام جاهز أو اطلب حل Excel مخصصًا لعملياتك بدقة."),
    },
  ];

  return (
    <section className="about-section">
      <div className="container split-section">
        <div>
          <span className="section-kicker">{tx("Why Excel Store", "لماذا Excel Store")}</span>
          <h2>{tx("A professional marketplace for serious Excel products.", "منصة احترافية لمنتجات Excel الجادة.")}</h2>
          <p>
            {tx(
              "Excel Store brings product-grade structure to spreadsheets: clean catalog pages, secure delivery, customer accounts, licensing, support, and admin workflows.",
              "يوفر Excel Store تجربة منظمة لملفات Excel: صفحات منتجات واضحة، تسليم آمن، حسابات عملاء، تراخيص، دعم، وإدارة داخلية."
            )}
          </p>
          <div className="section-actions">
            <Link to="/products" className="primary-link-btn">{tx("Browse marketplace", "تصفح المنتجات")}</Link>
            <Link to="/about" className="secondary-link-btn">{tx("Learn more", "اعرف المزيد")}</Link>
          </div>
        </div>
        <div className="feature-card-grid">
          {values.map((item) => (
            <article className="feature-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
