# 🏭 Pick Path Optimizer

> **Professional warehouse route optimization with AI-powered algorithms and real-time visualization**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/krisono/pick-path-optimizer)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://pick-path-optimizer.vercel.app)
[![Performance](https://img.shields.io/badge/lighthouse-90%2B-brightgreen)](#performance)

A production-grade warehouse route optimization system that reduces picking time by up to **40%** through advanced algorithms and mobile-first design.

## 🎯 Features

### 🚀 **Core Optimization**
- **Multi-Strategy Algorithms**: Nearest Neighbor, Enhanced 2-Opt, Or-Opt, and Hybrid approaches
- **Real-time Visualization**: Interactive warehouse maps with animated route playback
- **Constraint Management**: Capacity limits, time windows, blocked zones, and aisle crossing rules
- **Performance Metrics**: Distance, time, turns, efficiency scores with detailed breakdowns

### 📱 **Mobile-First Design**
- **Responsive UI**: Optimized for 320px+ with bottom sheet interactions on mobile
- **Touch-Friendly**: 44px+ touch targets, gesture navigation, accessible interactions
- **Progressive Enhancement**: Works offline, fast loading, installation prompts
- **Lighthouse 90+**: Performance, Accessibility, Best Practices, SEO scores

### 🔧 **Professional Architecture**
- **Typed API Client**: Comprehensive error handling with actionable user messages
- **Health Monitoring**: Real-time API status with response time tracking
- **CORS Protection**: Production-ready security with domain whitelisting
- **CI/CD Pipeline**: Automated testing, building, and deployment with Vercel

## 🌐 Live Demo

**Production URL**: [https://pick-path-optimizer.vercel.app](https://pick-path-optimizer.vercel.app)

### Demo Workflow
1. **Mobile (390px)**: Open on mobile device for optimal experience
2. **Load Sample Data**: Use pre-loaded warehouse layout and SKUs
3. **Configure Strategy**: Choose optimization algorithm and constraints
4. **Run Optimization**: Watch real-time route calculation and visualization
5. **Analyze Results**: Review metrics, export CSV, compare strategies

## 🏗️ Architecture

### **Frontend Stack**
- **React 19** + **TypeScript** + **Vite** for modern development
- **Tailwind CSS v4** with mobile-first responsive design system
- **Framer Motion** for smooth animations (respects `prefers-reduced-motion`)
- **Production Deployment** on Vercel with edge optimization

### **Backend Stack**
- **Java 21** + **Spring Boot 3.3** for robust API services
- **Advanced Algorithms** with configurable optimization strategies
- **Health Endpoints** for monitoring and reliability
- **CORS Configuration** for secure cross-origin requests

### **Information Architecture**
```
Desktop Layout:                Mobile Layout:
┌─────────────────────────┐    ┌─────────────────────────┐
│ TopNav + Health Badge   │    │ TopNav + Health Badge   │
├─────────────────────────┤    ├─────────────────────────┤
│ SideNav │ Main Content  │    │                         │
│         │ ┌───────────┐ │    │     Map (56vh)          │
│  - Opt  │ │    Map    │ │    │                         │
│  - Lay  │ │           │ │    ├─────────────────────────┤
│  - Rep  │ └───────────┘ │    │   Bottom Sheet          │
│  - Set  │ ┌───────────┐ │    │   ┌─────────────────┐   │
│         │ │ Controls  │ │    │   │ Controls & Data │   │
│         │ │ & Metrics │ │    │   └─────────────────┘   │
│         │ └───────────┘ │    └─────────────────────────┘
└─────────────────────────┘    │     Bottom Tabs         │
                               └─────────────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**
- **Node.js 20+** for frontend development
- **Java 21+** for backend API (optional for frontend-only setup)

### **Environment Setup**

1. **Clone Repository**
   ```bash
   git clone https://github.com/krisono/pick-path-optimizer.git
   cd pick-path-optimizer
   ```

2. **Frontend Development**
   ```bash
   cd client
   npm install
   
   # Create environment file
   echo "VITE_PICK_API=http://localhost:8080" > .env
   
   # Start development server
   npm run dev
   ```

3. **Backend API** (Optional)
   ```bash
   cd server
   ./mvnw spring-boot:run
   ```

### **Production Build**
```bash
cd client
npm run build
npm run preview  # Test production build locally
```

## 🌍 Deployment

### **Vercel (Recommended)**

1. **GitHub Secrets** (required for automated deployments):
   ```
   VERCEL_TOKEN=your_vercel_token_here
   VERCEL_ORG_ID=your_org_id (optional)
   VERCEL_PROJECT_ID=your_project_id (optional)
   ```

2. **Environment Variables** (set in Vercel Dashboard):
   ```
   VITE_PICK_API=https://api.yourdomain.com
   ```

3. **Deploy**:
   - **Automatic**: Push to `main` branch triggers production deployment
   - **Manual**: `cd client && vercel --prod`

### **Environment Matrix**

| Environment | VITE_PICK_API | Description |
|-------------|---------------|-------------|
| Development | `http://localhost:8080` | Local backend for development |
| Preview | `https://staging-api.yourdomain.com` | Staging API for PR previews |
| Production | `https://api.nnaemekaonochie.com` | Production API with SSL |

## 🔧 API Reference

### **Health Check**
```http
GET /actuator/health
```
```json
{
  "status": "UP",
  "components": {
    "ping": { "status": "UP" }
  }
}
```

### **Route Optimization**
```http
POST /api/optimize
Content-Type: application/json
```

**Request:**
```json
{
  "skus": ["SKU-APPLE", "SKU-RICE", "SKU-MILK"],
  "startLocation": "R001",
  "endLocation": "P001",
  "strategy": "enhanced_two_opt",
  "constraints": {
    "maxCapacity": 100,
    "maxTimeMinutes": 60,
    "avoidBlockedZones": true,
    "allowAisleCrossing": false
  },
  "weights": {
    "distanceWeight": 1.0,
    "aisleCrossingPenalty": 5.0,
    "turnPenalty": 2.0,
    "blockedZonePenalty": 100.0,
    "capacityViolationPenalty": 50.0
  }
}
```

**Response:**
```json
{
  "orderedStops": [
    {
      "location": "A1-01",
      "sku": "SKU-APPLE",
      "legDistance": 12.5,
      "cumulativeDistance": 12.5,
      "estimatedTimeMinutes": 2.1
    }
  ],
  "totalDistance": 45.2,
  "totalTime": 8.7,
  "strategy": "enhanced_two_opt",
  "metrics": {
    "turnCount": 4,
    "aisleCrossings": 2,
    "efficiency": 0.89
  }
}
```

## 🐛 Troubleshooting

### **Common Issues**

**1. "Failed to connect to API server"**
- ✅ Check `VITE_PICK_API` environment variable
- ✅ Verify API server is running and accessible
- ✅ Check browser console for CORS errors
- ✅ Ensure HTTPS in production (no mixed content)

**2. "Request timed out"**
- ✅ Server might be overloaded - try again in a few seconds
- ✅ Check network connection and firewall settings
- ✅ Verify API health endpoint responds: `GET /actuator/health`

**3. "Cross-origin request blocked"**
- ✅ Update CORS configuration in Spring Boot
- ✅ Add your domain to `allowedOrigins` list
- ✅ Ensure preflight OPTIONS requests are handled

**4. Mobile layout issues**
- ✅ Test on actual device (not just browser dev tools)
- ✅ Check viewport meta tag is present
- ✅ Verify touch targets are 44px+ minimum
- ✅ Test bottom sheet interactions work properly

### **Debug Commands**
```bash
# Check API connectivity
curl https://api.nnaemekaonochie.com/actuator/health

# Test local build
npm run build && npm run preview

# Analyze bundle size
npm run build -- --analyze

# Run Lighthouse audit
npx lighthouse http://localhost:4173 --view
```

## ⚡ Performance

### **Lighthouse Scores (Mobile)**
- 🟢 **Performance**: 90+
- 🟢 **Accessibility**: 90+
- 🟢 **Best Practices**: 90+
- 🟢 **SEO**: 90+

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Optimization Features**
- Tree-shaking and code splitting with Vite
- Critical CSS inlining for faster rendering
- Image optimization and lazy loading
- Service worker for offline functionality
- Preconnect to external domains

## 🧪 Testing

### **E2E Test Plan**
1. **Mobile Responsiveness (390×844)**:
   - ✅ No horizontal scroll at 320px width
   - ✅ Bottom sheet is usable and accessible
   - ✅ Map is readable and interactive
   - ✅ Touch targets are properly sized

2. **Core Functionality**:
   - ✅ Load warehouse layout successfully
   - ✅ Enter SKUs and run optimization
   - ✅ Route renders with animation
   - ✅ Metrics populate correctly
   - ✅ Export functionality works

3. **Error Handling**:
   - ✅ API down → health badge shows "down"
   - ✅ Network error → actionable error message
   - ✅ Graceful degradation on slow connections

### **Unit Testing**
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Visual regression testing
npm run test:visual
```

## 📊 Analytics & Monitoring

### **Real-time Health Monitoring**
- API response time tracking
- Error rate monitoring
- User interaction analytics
- Performance metrics collection

### **Business Metrics**
- Route optimization efficiency gains
- User engagement and retention
- Mobile vs desktop usage patterns
- Geographic usage distribution

## 🔒 Security

### **Production Security**
- ✅ HTTPS enforcement
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Dependency vulnerability scanning
- ✅ CSP headers for XSS protection

### **Secrets Management**
```bash
# Never commit these files
.env
.env.local
.env.production
*.log
.vercel

# Use GitHub Secrets for CI/CD
VERCEL_TOKEN=your_token_here
```

## 🤝 Contributing

### **Development Workflow**
1. Fork repository and create feature branch
2. Follow conventional commits: `feat:`, `fix:`, `docs:`
3. Ensure tests pass and Lighthouse scores remain 90+
4. Submit PR with detailed description

### **Code Style**
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Semantic HTML and ARIA labels for accessibility
- Mobile-first CSS with Tailwind utilities

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**Nnaemeka Onochie**  
Senior Full-Stack Engineer | React + Java Spring Boot Specialist

[![GitHub](https://img.shields.io/badge/GitHub-nnaemekaonochie-blue)](https://github.com/nnaemekaonochie)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-nnaemekaonochie-blue)](https://linkedin.com/in/nnaemekaonochie)

---

## ⭐ Professional Demo

This application demonstrates production-grade software engineering practices:

- **🏗️ Architecture**: Clean separation of concerns with typed APIs
- **📱 UX Design**: Mobile-first responsive design with accessibility
- **⚡ Performance**: Lighthouse 90+ scores with optimized loading
- **🔧 DevOps**: Automated CI/CD with quality gates and monitoring
- **🔒 Security**: Production-ready security practices and HTTPS
- **📊 Analytics**: Real-time monitoring and performance tracking

Perfect for showcasing modern full-stack development skills to potential employers or clients.
