import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import { useAppContext } from "../context/AppContext";

const sectionContent = {
  "web-apps": {
    kicker: "Available by request",
    title: "Web App Services",
    description:
      "Custom business systems, admin dashboards, customer portals, and workflow tools are available through scoped project requests.",
    status:
      "There is no automatic SaaS workspace provisioning in this build. Web app work is handled as a custom service request.",
    primary: ["Request a custom project", "/custom-request"],
    secondary: ["Contact sales", "/contact"],
    items: ["Business dashboards", "Customer portals", "Internal admin tools", "Workflow automation"],
  },
  saas: {
    kicker: "Coming soon",
    title: "SaaS Products",
    description: "Subscription-based business systems are part of the Smart Flow Hub roadmap.",
    status:
      "Production subscriptions, recurring billing, tenant provisioning, and payment webhooks are not implemented yet.",
    primary: ["Request demo", "/custom-request"],
    secondary: ["Read docs placeholder", "/docs"],
    items: ["Subscription products", "Customer workspaces", "Plan management", "Production billing"],
  },
  "desktop-software": {
    kicker: "Coming soon",
    title: "Desktop Software",
    description:
      "Offline-first desktop products such as POS tools and local business systems are planned for Smart Flow Hub.",
    status:
      "Desktop license activation APIs, device management, and automated license enforcement are not implemented yet.",
    primary: ["Request demo", "/custom-request"],
    secondary: ["Contact support", "/contact"],
    items: ["Offline-first tools", "License keys", "Device activation", "Release downloads"],
  },
  docs: {
    kicker: "Knowledge base placeholder",
    title: "Docs / Knowledge Base",
    description:
      "This section will organize product documentation, setup notes, updates, and customer help articles.",
    status:
      "A full documentation or blog publishing system is not implemented yet. Use FAQ, contact, or account support for now.",
    primary: ["Open FAQ", "/faq"],
    secondary: ["Contact support", "/contact"],
    items: ["Product guides", "Setup notes", "Release updates", "Support articles"],
  },
};

function PlaceholderSectionPage({ section }) {
  const { tx } = useAppContext();
  const content = sectionContent[section] || sectionContent.docs;

  return (
    <PageWrapper>
      <section className="page-section">
        <div className="container checkout-access-grid">
          <div className="details-box checkout-access-main">
            <span className="section-kicker">{content.kicker}</span>
            <h1>{content.title}</h1>
            <p className="details-description">{content.description}</p>
            <p className="details-description">{content.status}</p>
            <div className="section-actions">
              <Link to={content.primary[1]} className="primary-link-btn">{content.primary[0]}</Link>
              <Link to={content.secondary[1]} className="secondary-link-btn">{content.secondary[0]}</Link>
            </div>
          </div>

          <div className="details-box checkout-access-card">
            <span className="section-kicker">{tx("Roadmap scope", "نطاق خارطة الطريق")}</span>
            <h2>{tx("Planned capabilities", "القدرات المخططة")}</h2>
            <div className="checkout-process-list">
              {content.items.map((item) => <span key={item}>{item}</span>)}
            </div>
            <p className="details-description">
              {tx(
                "These items describe direction only. They are not presented as completed production modules in the current build.",
                "هذه العناصر تصف الاتجاه فقط ولا يتم عرضها كوحدات إنتاجية مكتملة في النسخة الحالية."
              )}
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

export default PlaceholderSectionPage;
