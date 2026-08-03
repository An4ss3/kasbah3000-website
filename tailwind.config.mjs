/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Clay (Primary) — Terracotta earth tones
        clay: {
          50: '#FBF4F0',
          100: '#F5E3D9',
          200: '#EAC5B1',
          300: '#DBA084',
          400: '#C97E5E',
          500: '#B15A3A', // Core brand clay
          600: '#96482D', // Links, active nav, accents
          700: '#7A3A24', // Link hover
          800: '#5F2E1C',
          900: '#452115',
        },
        
        // Cedar (Secondary) — Olive/vegetation greens
        cedar: {
          50: '#F3F6F0',
          100: '#E2EBDA',
          200: '#C4D6B4',
          300: '#A0BD89',
          400: '#7DA163',
          500: '#5C7A4B', // Core cedar
          600: '#4A6238',
          700: '#3B4E2D',
          800: '#2D3B22',
          900: '#1F2818',
        },
        
        // Sun (Accent) — Warm golden yellows
        sun: {
          50: '#FDF7EA',
          100: '#FAECC7',
          200: '#F3D68C', // Eyebrows on dark
          300: '#E9BE5C',
          400: '#DFAD48',
          500: '#D9A441', // Core sun, accent-on-dark
          600: '#B5842F',
          700: '#8C6524',
          800: '#64481A',
          900: '#423010',
        },
        
        // Water (Tertiary) — Muted blue-greys
        water: {
          50: '#EEF5F6',
          100: '#D6E9EB',
          200: '#ADD2D6',
          300: '#82B7BD',
          400: '#659FA6',
          500: '#4F8098',
          600: '#3F6779',
          700: '#325260',
          800: '#263D48',
          900: '#1A2930',
        },
        
        // Sand (Neutral) — Cream to dark brown
        sand: {
          50: '#FAF6F0',  // Page background
          100: '#F3ECE1', // Alternating sections
          200: '#E6DACB', // Hairlines on light
          300: '#D3C1A8', // Body text on dark
          400: '#B39F82', // Border strong
          500: '#937E64', // Muted faint
          600: '#766349', // Captions, metadata
          700: '#5A4A38', // Long-form body
          800: '#3D3227', // Border on dark
          900: '#2B2420', // Dark bands, footer, ink
        },
        
        // Semantic tokens
        background: '#FAF6F0',
        'background-alt': '#F3ECE1',
        'background-dark': '#2B2420',
        surface: '#FFFFFF',
        
        ink: '#2B2420',
        'ink-inverse': '#FAF6F0',
        'text-body': '#5A4A38',
        'text-body-dark': '#D3C1A8',
        muted: '#766349',
        'muted-faint': '#937E64',
        
        border: '#E6DACB',
        'border-strong': '#B39F82',
        'border-dark': '#3D3227',
        
        link: '#96482D',
        'link-hover': '#7A3A24',
        'accent-on-dark': '#F3D68C',
        
        success: '#5C7A4B',
        warning: '#D9A441',
        error: '#B23B2E',
        
        selection: '#EAC5B1',
      },
      
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Manrope', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      
      fontSize: {
        eyebrow: ['0.75rem', { 
          lineHeight: '1.2', 
          letterSpacing: '0.22em', 
          fontWeight: '600' 
        }],
        nav: ['0.75rem', { 
          lineHeight: '1', 
          letterSpacing: '0.12em', 
          fontWeight: '600' 
        }],
        button: ['0.8125rem', { 
          lineHeight: '1', 
          letterSpacing: '0.1em', 
          fontWeight: '600' 
        }],
      },
      
      letterSpacing: {
        eyebrow: '0.22em',
        label: '0.12em',
        meta: '0.08em',
        display: '-0.015em',
      },
      
      maxWidth: {
        content: '1180px',
        wide: '1280px',
        prose: '560px',
        headline: '1050px',
      },
      
      borderRadius: {
        none: '0',
        pill: '100px',
        arch: '560px 560px 0 0',
      },
      
      boxShadow: {
        overlay: '0 12px 32px rgba(43, 36, 32, 0.10)',
      },
      
      opacity: {
        15: '0.15',
        55: '0.55',
        82: '0.82',
        94: '0.94',
      },
      
      zIndex: {
        nav: '20',
        overlay: '40',
        lightbox: '50',
        toast: '60',
      },
      
      spacing: {
        18: '4.5rem',   // 72px
        22: '5.5rem',   // 88px
        30: '7.5rem',   // 120px
        38: '9.5rem',   // 152px
      },
      
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        reveal: '500ms',
        slow: '800ms',
      },
      
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      
      keyframes: {
        fadeUp: {
          from: { 
            opacity: '0', 
            transform: 'translateY(24px)' 
          },
          to: { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
      },
      
      animation: {
        'fade-up': 'fadeUp 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
