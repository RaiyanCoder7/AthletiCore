import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome for icons
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap for styling
import React from 'react'; // Import React
import ReactDOM from 'react-dom/client'; // Import ReactDOM for rendering
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import './index.css'; // Import custom CSS
import App from './App'; // Import the main App component
import reportWebVitals from './reportWebVitals'; // Import performance measuring tool

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>  {/* Enable strict mode for better debugging */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Measure performance (optional, logs results in the console)
reportWebVitals(console.log);