export const Colors = {
  dark: '#212121',    // Charcoal black
  primary: '#A35C7A', // Muted purple
  secondary: '#C890A7', // Soft pink
  light: '#FBF5E5',   // Cream white
  
  // Additional shades
  primaryLight: '#B67D96',
  primaryDark: '#8A4B65',
  secondaryLight: '#D4A7BA',
  secondaryDark: '#B67991',
  
  // Utility colors
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFB340',
  overlay: 'rgba(33, 33, 33, 0.5)',
} as const;

export const Theme = {
  colors: Colors,
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  roundness: {
    sm: 8,
    md: 15,
    lg: 25,
  },
  
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 28,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
    },
  },
  
  shadows: {
    light: {
      shadowColor: Colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: Colors.dark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    heavy: {
      shadowColor: Colors.dark,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
  },
} as const;

export type ThemeColors = keyof typeof Colors;
export type ThemeSpacing = keyof typeof Theme.spacing;
export type ThemeRoundness = keyof typeof Theme.roundness;
export type ThemeTypographySize = keyof typeof Theme.typography.sizes;
export type ThemeTypographyWeight = keyof typeof Theme.typography.weights;

export default Theme;
