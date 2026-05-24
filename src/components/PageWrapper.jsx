import { PageTransition } from "./animations";

function PageWrapper({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

export default PageWrapper;
