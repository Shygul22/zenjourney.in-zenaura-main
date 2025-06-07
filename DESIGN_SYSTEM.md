# ZenJourney Design System

## Overview
ZenJourney uses a modern, accessible design system built with a mobile-first approach. The design emphasizes clarity, productivity, and user well-being through thoughtful color choices, typography, and interactions.

## Brand Identity

### Logo & Brand
- **Primary Brand**: ZenJourney
- **Tagline**: "Intelligent Productivity & Time Management"
- **Personality**: Professional, calming, intelligent, empowering

### Color Palette

#### Primary Colors
- **Brand Primary**: `hsl(217, 91%, 60%)` - #3B82F6 (Blue 500)
- **Brand Secondary**: `hsl(262, 83%, 58%)` - #8B5CF6 (Purple 500)
- **Brand Accent**: `hsl(142, 76%, 36%)` - #10B981 (Green 500)

#### Semantic Colors
- **Success**: `hsl(142, 76%, 36%)` - #10B981
- **Warning**: `hsl(38, 92%, 50%)` - #F59E0B
- **Error**: `hsl(0, 84%, 60%)` - #EF4444
- **Info**: `hsl(217, 91%, 60%)` - #3B82F6

#### Surface Colors
- **Background**: `hsl(0, 0%, 100%)` - #FFFFFF
- **Surface Primary**: `hsl(0, 0%, 100%)` - #FFFFFF
- **Surface Secondary**: `hsl(210, 40%, 98%)` - #F8FAFC
- **Surface Tertiary**: `hsl(210, 40%, 96%)` - #F1F5F9

#### Text Colors
- **Text Primary**: `hsl(222.2, 84%, 4.9%)` - #0F172A
- **Text Secondary**: `hsl(215.4, 16.3%, 46.9%)` - #64748B
- **Text Tertiary**: `hsl(215.4, 16.3%, 65.1%)` - #94A3B8

## Typography

### Font Stack
- **Primary**: Inter, system-ui, sans-serif
- **Monospace**: JetBrains Mono, Consolas, monospace

### Type Scale
- **xs**: 0.75rem (12px) - Line height: 1.5
- **sm**: 0.875rem (14px) - Line height: 1.5
- **base**: 1rem (16px) - Line height: 1.5
- **lg**: 1.125rem (18px) - Line height: 1.5
- **xl**: 1.25rem (20px) - Line height: 1.4
- **2xl**: 1.5rem (24px) - Line height: 1.3
- **3xl**: 1.875rem (30px) - Line height: 1.25
- **4xl**: 2.25rem (36px) - Line height: 1.2
- **5xl**: 3rem (48px) - Line height: 1.1

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System

### Base Unit: 4px (0.25rem)

#### Spacing Scale
- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)

## Layout & Grid

### Breakpoints
- **xs**: 475px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px
- **3xl**: 1600px

### Container Sizes
- **Mobile**: 100% width, 16px padding
- **Tablet**: 100% width, 24px padding
- **Desktop**: Max 1400px width, 32px padding

### Grid System
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3-4 columns
- **Gap**: 16px (mobile), 24px (tablet), 32px (desktop)

## Components

### Cards
```css
.card-elevated {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid rgb(229 231 235);
  transition: all 300ms ease-out;
}

.card-elevated:hover {
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}
```

### Buttons

#### Primary Button
```css
.interactive-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 200ms ease-out;
}

.interactive-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
```

#### Secondary Button
```css
.interactive-secondary {
  background: #F1F5F9;
  color: #0F172A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 200ms ease-out;
}

.interactive-secondary:hover {
  background: #E2E8F0;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### Glass Morphism
```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Animations & Transitions

### Timing Functions
- **Fast**: 150ms ease-out
- **Normal**: 250ms ease-out
- **Slow**: 350ms ease-out

### Keyframe Animations
- **Fade In**: 300ms ease-out
- **Slide Up**: 300ms ease-out
- **Scale In**: 200ms ease-out
- **Bounce In**: 400ms ease-out

### Micro-interactions
- **Hover Scale**: transform: scale(1.05)
- **Hover Lift**: transform: translateY(-2px)
- **Active Scale**: transform: scale(0.95)

## Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: 2px blue outline with 2px offset
- **Touch Targets**: Minimum 44px × 44px
- **Screen Reader Support**: Proper ARIA labels and semantic HTML

### Focus Management
```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #3B82F6;
  border-radius: 4px;
}
```

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Responsive Design

### Mobile-First Approach
1. **Base styles**: Mobile (320px+)
2. **Progressive enhancement**: Tablet (768px+)
3. **Desktop optimization**: Desktop (1024px+)

### Key Responsive Patterns
- **Navigation**: Mobile hamburger → Desktop tabs
- **Cards**: Single column → Multi-column grid
- **Typography**: Smaller scales → Larger scales
- **Spacing**: Compact → Generous

### Safe Areas (Mobile)
```css
.safe-top { padding-top: env(safe-area-inset-top); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
.safe-left { padding-left: env(safe-area-inset-left); }
.safe-right { padding-right: env(safe-area-inset-right); }
```

## Performance Optimizations

### Loading States
- **Skeleton screens** for content loading
- **Progressive loading** for images
- **Optimistic updates** for user actions

### Image Optimization
- **WebP format** with fallbacks
- **Responsive images** with srcset
- **Lazy loading** for below-fold content

### CSS Optimizations
- **Critical CSS** inlined
- **Non-critical CSS** loaded asynchronously
- **CSS containment** for performance

## Browser Support

### Target Browsers
- **Chrome**: Last 2 versions
- **Firefox**: Last 2 versions
- **Safari**: Last 2 versions
- **Edge**: Last 2 versions

### Progressive Enhancement
- **Core functionality**: Works in all browsers
- **Enhanced features**: Modern browsers only
- **Graceful degradation**: Fallbacks for older browsers

## Testing Guidelines

### Responsive Testing
- **Mobile**: 320px, 375px, 414px
- **Tablet**: 768px, 1024px
- **Desktop**: 1280px, 1440px, 1920px

### Accessibility Testing
- **Screen readers**: NVDA, JAWS, VoiceOver
- **Keyboard navigation**: Tab order and focus management
- **Color blindness**: Deuteranopia, Protanopia, Tritanopia

### Performance Testing
- **Core Web Vitals**: LCP, FID, CLS
- **Lighthouse scores**: 90+ for all metrics
- **Network conditions**: 3G, 4G, WiFi

## Implementation Notes

### CSS Architecture
- **Utility-first**: Tailwind CSS for rapid development
- **Component classes**: Custom classes for complex components
- **CSS custom properties**: For theming and consistency

### JavaScript Framework
- **React**: Component-based architecture
- **TypeScript**: Type safety and better DX
- **Modern ES6+**: Latest JavaScript features

### Build Process
- **Vite**: Fast development and optimized builds
- **PostCSS**: CSS processing and optimization
- **ESLint/Prettier**: Code quality and formatting