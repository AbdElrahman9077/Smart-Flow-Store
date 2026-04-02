import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

function AboutPage() {
  const { tx } = useAppContext();

  return (
    <PageWrapper>
      <div className="container page-section">
        <div className="details-box">
          <h1>{tx("About Smart Flow", "عن Smart Flow")}</h1>

          <p className="details-description">
            {tx(
              "Smart Flow is a professional platform for selling Excel systems, dashboards, and ready-made Excel sheets for businesses, freelancers, and small companies.",
              "Smart Flow منصة احترافية لبيع أنظمة Excel وDashboards وشيتات Excel الجاهزة للشركات وأصحاب الأعمال والمستقلين."
            )}
          </p>

          <p className="details-description">
            {tx(
              "We also provide custom Excel solutions based on client needs, with a simple and organized buying experience.",
              "كما نوفر حلول Excel مخصصة حسب احتياجات العميل، مع تجربة شراء بسيطة ومنظمة."
            )}
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

export default AboutPage;