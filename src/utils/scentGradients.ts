import type React from 'react'

export interface GradientColors {
  start: string
  middle: string
  end: string
}

export const familyGradients: Record<string, GradientColors> = {
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
  default: {
    start: 'rgb(248, 250, 252)',
    middle: 'rgb(226, 232, 240)',
    end: 'rgb(203, 213, 225)'
  }
}

/**
 * Selects the appropriate gradient based on scent families.
 * Priority: floral > woody > oriental > fresh > citrus
 */
export function getGradientForFamilies(families: string[]): GradientColors {
  const priorityOrder = ['floral', 'woody', 'oriental', 'fresh', 'citrus']
  const normalizedFamilies = families.map((f) => f.toLowerCase())

  for (const priority of priorityOrder) {
    if (normalizedFamilies.some((f) => f.includes(priority))) {
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
    background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.middle} 50%, ${gradient.end} 100%)`,
    backgroundSize: '200% 200%',
    animation: 'mesh-flow 15s ease infinite'
  }
}
