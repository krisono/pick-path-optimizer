# 🏭 Warehouse Route Optimizer

A smart warehouse optimization system that finds the most efficient picking routes. Built with Java + Spring Boot backend and React + TypeScript frontend.

![Demo](https://img.shields.io/badge/demo-live-brightgreen)
![Java](https://img.shields.io/badge/Java-21-orange)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)

## ✨ Features

- **Smart Route Optimization**: Multiple algorithms to find the best picking routes
- **Visual Warehouse Map**: Interactive warehouse layout with real-time route visualization
- **Flexible Configuration**: Customize optimization parameters and constraints
- **Export Routes**: Download optimized routes as CSV files
- **RESTful API**: Clean API for integration with warehouse management systems

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/krisono/pick-path-optimizer
cd pick-path-optimizer
docker compose up
```

Open http://localhost:3000 to see the application.

### Local Development

```bash
# Backend
cd server && mvn spring-boot:run

# Frontend
cd client && npm install && npm run dev
```

## 🎮 How to Use

1. **Enter SKUs**: Add the items you need to pick (e.g., "SKU-APPLE, SKU-RICE")
2. **Choose Strategy**: Select an optimization algorithm
3. **Set Constraints**: Configure capacity limits and preferences
4. **Optimize**: Click "Optimize Route" to generate the best path
5. **Visualize**: View the route on the interactive warehouse map
6. **Export**: Download the route as a CSV file

## 📡 API Usage

```bash
curl -X POST http://localhost:8080/api/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "skus": ["SKU-APPLE", "SKU-RICE", "SKU-MILK"],
    "strategy": "enhanced_two_opt"
  }'
```

## 📚 Documentation

- **[Complete Technical Guide](TECHNICAL_GUIDE.md)** - Detailed system architecture and algorithms
- **[Deployment Guide](DEPLOYMENT.md)** - Production deployment instructions
- **[API Reference](api-spec.yaml)** - OpenAPI specification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## � License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built for efficient warehouse operations** 📦
