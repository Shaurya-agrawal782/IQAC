// 1. fadeUp Preset
export const fadeUp = {
  hidden: (reduced) => ({
    opacity: 0,
    y: reduced ? 0 : 24
  }),
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
};

// 2. fadeIn Preset
export const fadeIn = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

// 3. scaleFade Preset
export const scaleFade = {
  hidden: (reduced) => ({
    opacity: 0,
    scale: reduced ? 1 : 0.96,
    filter: reduced ? "none" : "blur(8px)"
  }),
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// 4. staggerContainer Preset
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

// 5. cardHover Preset
export const cardHover = {
  hover: (reduced) => {
    if (reduced) return {};
    return {
      y: -4,
      scale: 1.01,
      transition: { duration: 0.25, ease: "easeOut" }
    };
  }
};

// 6. softSpring Configuration
export const softSpring = {
  type: "spring",
  stiffness: 380,
  damping: 30
};

// 7. pageTransition Preset
export const pageTransition = {
  hidden: (reduced) => ({
    opacity: 0,
    x: reduced ? 0 : -12
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
  exit: (reduced) => ({
    opacity: 0,
    x: reduced ? 0 : 12,
    transition: { duration: 0.3, ease: "easeIn" }
  })
};

// 8. panelReveal Preset
export const panelReveal = {
  hidden: (reduced) => ({
    opacity: 0,
    scaleX: reduced ? 1 : 0.98,
    transformOrigin: "left"
  }),
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

// Helper for dynamic inline component hover props
export const getCardHoverProps = (reduced) => {
  if (reduced) return {};
  return {
    whileHover: {
      y: -4,
      scale: 1.01
    },
    transition: { duration: 0.25, ease: "easeOut" }
  };
};
