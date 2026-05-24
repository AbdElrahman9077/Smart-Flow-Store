import { motion as Motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export const motionTokens = {
  page: {
    initial: { opacity: 0, y: 18, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, y: -10, filter: "blur(6px)" },
    transition: { duration: 0.34, ease },
  },
  fade: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.3, ease } },
  },
  slideUp: {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
  },
  slideIn: {
    hidden: { opacity: 0, x: -18 },
    show: { opacity: 1, x: 0, transition: { duration: 0.36, ease } },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.32, ease } },
  },
  stagger: {
    hidden: {},
    show: { transition: { staggerChildren: 0.055, delayChildren: 0.04 } },
  },
  item: {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.34, ease } },
  },
};

function cleanVariants(variants, reduce) {
  if (!reduce) return variants;
  return {
    hidden: { opacity: 1, x: 0, y: 0, scale: 1, filter: "none" },
    show: { opacity: 1, x: 0, y: 0, scale: 1, filter: "none", transition: { duration: 0.001 } },
  };
}

export function PageTransition({ children, className = "" }) {
  const reduce = useReducedMotion();
  const token = reduce
    ? {
        initial: { opacity: 1, y: 0, filter: "none" },
        animate: { opacity: 1, y: 0, filter: "none" },
        exit: { opacity: 1, y: 0, filter: "none" },
        transition: { duration: 0.001 },
      }
    : motionTokens.page;

  return (
    <Motion.div className={`animate-page ${className}`.trim()} {...token}>
      {children}
    </Motion.div>
  );
}

export function FadeIn({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div
      className={className}
      variants={cleanVariants(motionTokens.fade, reduce)}
      initial="hidden"
      animate="show"
      transition={{ delay }}
    >
      {children}
    </Motion.div>
  );
}

export function SlideUp({ children, className = "", delay = 0, as = "div" }) {
  const reduce = useReducedMotion();
  const Component = Motion[as] || Motion.div;
  return (
    <Component
      className={className}
      variants={cleanVariants(motionTokens.slideUp, reduce)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
    >
      {children}
    </Component>
  );
}

export function SlideIn({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div className={className} variants={cleanVariants(motionTokens.slideIn, reduce)} initial="hidden" animate="show">
      {children}
    </Motion.div>
  );
}

export function ScaleIn({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div className={className} variants={cleanVariants(motionTokens.scaleIn, reduce)} initial="hidden" animate="show">
      {children}
    </Motion.div>
  );
}

export function StaggerContainer({ children, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Component = Motion[as] || Motion.div;
  return (
    <Component
      className={className}
      variants={reduce ? undefined : motionTokens.stagger}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-30px" }}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({ children, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Component = Motion[as] || Motion.div;
  return (
    <Component className={className} variants={reduce ? undefined : motionTokens.item}>
      {children}
    </Component>
  );
}

export function AnimatedCard({ children, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Component = Motion[as] || Motion.div;
  return (
    <Component
      className={`animated-card ${className}`.trim()}
      variants={reduce ? undefined : motionTokens.item}
      whileHover={reduce ? undefined : { y: -5, transition: { duration: 0.16 } }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
    >
      {children}
    </Component>
  );
}

export function AnimatedList({ children, className = "" }) {
  return <StaggerContainer className={`animated-list ${className}`.trim()}>{children}</StaggerContainer>;
}

export function AnimatedSection({ children, className = "" }) {
  return <SlideUp className={`animated-section ${className}`.trim()}>{children}</SlideUp>;
}

export function AnimatedModal({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div className="modal-backdrop animate-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Motion.div
        className={`animate-modal ${className}`.trim()}
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }}
        animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
        transition={{ duration: 0.22, ease }}
      >
        {children}
      </Motion.div>
    </Motion.div>
  );
}

export function AnimatedDropdown({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <Motion.div
      className={`animate-dropdown ${className}`.trim()}
      initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.18, ease }}
    >
      {children}
    </Motion.div>
  );
}
