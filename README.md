# Hector Mendoza - Personal Portfolio Website

A modern, interactive personal portfolio website built with **Next.js**, **React**, **Three.js**, and **Tailwind CSS**. Featuring animated 3D graphics, smooth scrolling animations, and direct contact links via email and social icons.

**Live Demo**: [hectormendoza.me](https://hectormendoza.me)

## ✨ Features

- **3D Interactive Graphics** - Animated 3D models and particles using Three.js and react-three-fiber
- **Smooth Animations** - Framer Motion powered scroll and entrance animations
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Direct Contact Links** - Email and social icons in the hero, contact section, and footer
- **Dark Mode Ready** - Custom CSS variables for easy theming
- **Performance Optimized** - Code splitting, image optimization, dynamic imports
- **Shadcn UI Components** - Pre-built, customizable component library

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19** - UI library
- **TypeScript & JavaScript** - Type safety and flexibility
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Three Fiber** - React renderer for Three.js
- **Three.js** - 3D graphics library

### UI Components & Tools
- **Shadcn UI** - High-quality, accessible components
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Sanity project for blog content (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hectormendoza/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory for Sanity CMS (see `.env.local.example`).

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Home page
├── components/
│   ├── about-section.jsx         # About section with profile image
│   ├── contact-section.jsx       # Contact links and location map
│   ├── experience-section.jsx    # Work experience
│   ├── hero-section.jsx          # Hero with 3D background
│   ├── navbar.jsx                # Navigation bar
│   ├── projects-section.jsx      # Portfolio projects
│   ├── scene-3d.jsx              # Three.js 3D scene
│   └── ui/                       # Shadcn UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions
├── public/                       # Static assets
│   └── logos/                    # Logo files
├── styles/                       # Additional styles
├── .env.local.example            # Environment variables template
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Customization

### Colors
Edit CSS variables in [app/globals.css](app/globals.css):
```css
:root {
  --primary: 145 65% 52%;      /* Green primary color */
  --accent: 340 65% 55%;       /* Purple accent */
  --background: 240 8% 6%;     /* Dark background */
  /* ... more variables */
}
```

### Content
- **Hero Section**: [components/hero-section.jsx](components/hero-section.jsx)
- **About Section**: [components/about-section.jsx](components/about-section.jsx)
- **Projects**: [components/projects-section.jsx](components/projects-section.jsx)
- **Experience**: [components/experience-section.jsx](components/experience-section.jsx)
- **Contact**: [components/contact-section.jsx](components/contact-section.jsx)

### 3D Scene
Customize 3D models and animations in [components/scene-3d.jsx](components/scene-3d.jsx)

## 📦 Building for Production

```bash
npm run build
npm run start
```

The production build will be optimized for performance:
- Code splitting
- Image optimization
- CSS minification
- JavaScript minification

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
- **Netlify**: Build command: `npm run build`, Publish: `.next`
- **Docker**: See `next.config.mjs` for Docker configuration

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🛡️ Security Features

- Environment variables for sensitive data
- CSRF protection with Next.js built-in features

## 🎯 Performance Optimizations

- Dynamic imports for heavy components
- Image optimization with Next.js Image component
- Lazy loading for sections
- Optimized Three.js scene rendering
- CSS-in-JS with Tailwind for minimal bundle size

## 🤝 Contributing

This is a personal portfolio, but feel free to:
- Fork and create your own portfolio
- Use components as reference
- Report issues

## 📝 License

This project is open source. Feel free to use it as a template for your own portfolio!

## 📧 Contact

- **Email**: [hey@hectormendoza.me](mailto:hey@hectormendoza.me)
- **Location**: Morelia, Mexico
- **Website**: [hectormendoza.me](https://hectormendoza.me)

### Social Links
- [GitHub](https://github.com/hectormendoza)
- [LinkedIn](https://linkedin.com/in/hectormendoza)
- [X/Twitter](https://x.com/hectormendoza)

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Three.js](https://threejs.org)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel](https://vercel.com)

---

**Built with ❤️ by Hector Mendoza**
