import { motion as Motion } from "framer-motion";

function PageWrapper({ children }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -24, scale: 0.98 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
    >
      {children}
    </Motion.div>
  );
}

export default PageWrapper;
