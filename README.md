# Zeus Weather App 🌍

A beautiful 3D globe weather application built with React, Three.js, and modern web technologies. Get weather information for any location with an interactive globe visualization.

![Zeus Weather App](https://raw.githubusercontent.com/mrdoob/three.js/master/examples/screenshots/webgl_earth.jpg)

## Features ✨

- 🌍 Interactive 3D globe visualization
- 🔍 Location search with autocomplete
- 🌡️ Real-time weather data
- 📅 Weather forecasts for upcoming days
- 🎨 Beautiful, modern UI with smooth animations
- 🌓 Dark mode design

## Prerequisites 📋

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## Environment Variables 🔑

Create a `.env` file in the root directory with the following variables:

```env
# OpenCage Geocoding API
VITE_OPENCAGE_API_KEY=your_opencage_api_key_here

# Open-Meteo API (no key required, but adding for configuration)
VITE_OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
```

You'll need to:
1. Get an API key from [OpenCage](https://opencagedata.com/)
2. Replace `your_opencage_api_key_here` with your actual API key

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zeus-weather.git
cd zeus-weather
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production 🏗️

1. Create a production build:
```bash
npm run build
```

2. Preview the production build locally:
```bash
npm run preview
```

## Deployment 🌐

### Deploying to Netlify

1. Create a new site on [Netlify](https://www.netlify.com/)

2. Connect your repository to Netlify

3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add environment variables:
   - Go to Site settings > Environment variables
   - Add your environment variables:
     ```
     VITE_OPENCAGE_API_KEY=your_opencage_api_key_here
     VITE_OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
     ```

5. Deploy! Netlify will automatically build and deploy your site

### Manual Deployment

You can also deploy the `dist` folder to any static hosting service:

1. Build the project:
```bash
npm run build
```

2. Upload the contents of the `dist` folder to your hosting service

## Tech Stack 💻

- [React](https://reactjs.org/) - UI Framework
- [Vite](https://vitejs.dev/) - Build Tool
- [Three.js](https://threejs.org/) - 3D Graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - Three.js React Renderer
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [OpenCage](https://opencagedata.com/) - Geocoding API
- [Open-Meteo](https://open-meteo.com/) - Weather API

## Contributing 🤝

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Earth textures from [Three.js Examples](https://github.com/mrdoob/three.js)
- Weather icons from [Lucide React](https://lucide.dev/)