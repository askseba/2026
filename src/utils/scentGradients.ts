import type React from 'react'

export interface GradientColors {
  start: string
  middle: string
  end: string
}

export const familyGradients: Record<string, GradientColors> = {
  // ── Original 5 (unchanged) ──
  floral: {
    start: 'rgb(252, 231, 243)',
    middle: 'rgb(251, 207, 232)',
    end: 'rgb(244, 114, 182)'
  },
  woody: {
    start: 'rgb(254, 243, 199)',
    middle: 'rgb(217, 119, 6)',
    end: 'rgb(120, 53, 15)'
  },
  fresh: {
    start: 'rgb(224, 242, 254)',
    middle: 'rgb(147, 197, 253)',
    end: 'rgb(59, 130, 246)'
  },
  oriental: {
    start: 'rgb(254, 243, 199)',
    middle: 'rgb(251, 191, 36)',
    end: 'rgb(217, 119, 6)'
  },
  citrus: {
    start: 'rgb(254, 252, 232)',
    middle: 'rgb(253, 224, 71)',
    end: 'rgb(234, 179, 8)'
  },

  // ── P2 #23: 10 new family gradients ──
  gourmand: {
    start: 'rgb(252, 231, 243)',
    middle: 'rgb(236, 64, 122)',
    end: 'rgb(141, 56, 40)'
  },
  spicy: {
    start: 'rgb(255, 224, 178)',
    middle: 'rgb(216, 67, 21)',
    end: 'rgb(135, 30, 10)'
  },
  leather: {
    start: 'rgb(215, 204, 200)',
    middle: 'rgb(109, 76, 65)',
    end: 'rgb(62, 39, 35)'
  },
  musky: {
    start: 'rgb(236, 239, 241)',
    middle: 'rgb(176, 190, 197)',
    end: 'rgb(144, 164, 174)'
  },
  powdery: {
    start: 'rgb(252, 228, 236)',
    middle: 'rgb(248, 187, 208)',
    end: 'rgb(240, 152, 183)'
  },
  green: {
    start: 'rgb(200, 230, 201)',
    middle: 'rgb(76, 175, 80)',
    end: 'rgb(46, 125, 50)'
  },
  aquatic: {
    start: 'rgb(179, 229, 252)',
    middle: 'rgb(3, 169, 244)',
    end: 'rgb(2, 136, 209)'
  },
  amber: {
    start: 'rgb(255, 243, 224)',
    middle: 'rgb(255, 167, 38)',
    end: 'rgb(255, 143, 0)'
  },
  aldehydic: {
    start: 'rgb(236, 239, 241)',
    middle: 'rgb(207, 216, 220)',
    end: 'rgb(176, 190, 197)'
  },
  chypre: {
    start: 'rgb(215, 204, 200)',
    middle: 'rgb(139, 115, 85)',
    end: 'rgb(85, 107, 47)'
  },

  // ── Fallback ──
  default: {
    start: 'rgb(248, 250, 252)',
    middle: 'rgb(226, 232, 240)',
    end: 'rgb(203, 213, 225)'
  }
}

/**
 * Selects the appropriate gradient based on scent families.
 * P2 #23: Expanded to all 15 families + exact match via toLowerCase.
 * Priority order: visually distinctive families first.
 */
export function getGradientForFamilies(families: string[]): GradientColors {
  const priorityOrder = [
    'floral', 'chypre', 'woody', 'oriental', 'leather',
    'gourmand', 'spicy', 'amber', 'fresh', 'green',
    'aquatic', 'citrus', 'musky', 'powdery', 'aldehydic'
  ]

  // P2: Use exact match with toLowerCase instead of .includes()
  // to avoid false positives (e.g. "evergreen" matching "green")
  const normalizedFamilies = families.map((f) => f.toLowerCase().trim())

  for (const priority of priorityOrder) {
    if (normalizedFamilies.includes(priority)) {
      return familyGradients[priority]
    }
  }

  return familyGradients.default
}

/**
 * Generates a style object for the gradient (linear-gradient + mesh-flow animation)
 */
export function generateGradientStyle(
  gradient: GradientColors
): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.middle} 50%, ${gradient.end} 100%)`,
    backgroundSize: '200% 200%',
    backgroundPosition: '0% 50%',
    animation: 'mesh-flow 15s ease infinite'
  }
}
