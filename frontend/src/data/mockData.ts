import { DashboardData } from '../types/navigation';

export const mockDashboardData: DashboardData = {
  // Represents a vehicle currently moving with a good GNSS lock
  navigationState: {
    latitude: 28.6139,  // Example: New Delhi coordinates
    longitude: 77.2090,
    heading: 145.5,     // South-East
    speed: 12.5,        // m/s (approx 45 km/h)
    confidence: 0.95,
    fusionMode: 'GNSS_LOCKED',
  },
  
  // All hardware sensors are functioning normally
  sensorHealth: {
    accelerometer: true,
    gyroscope: true,
    magnetometer: true,
    gnss: true,
  },
  
  // Strong signal from NavIC and GPS, weaker from others
  satelliteBreakdown: {
    NavIC: { count: 6, signalStrength: 45.2 },
    GPS: { count: 8, signalStrength: 42.1 },
    Galileo: { count: 3, signalStrength: 30.5 },
    GLONASS: { count: 4, signalStrength: 32.8 },
  },
  
  // AI Inference running smoothly for visual dead reckoning/anomaly detection
  inferenceStats: {
    latencyMs: 32,
    modelVersion: 'v2.4.1-lite',
    confidence: 0.88,
    estimatedSpeed: 12.3, // closely matches GNSS speed
  },
  
  // Recent road anomalies detected by the system
  anomalyEvents: [
    {
      type: 'pothole',
      timestamp: 1693902000000,
      confidence: 0.92,
    },
    {
      type: 'speed_breaker',
      timestamp: 1693902150000,
      confidence: 0.98,
    }
  ],
  
  // Device running slightly warm, minimal bias correction applied
  thermalState: {
    temperature: 38.5, // Celsius
    biasCorrection: 0.002,
  },
  
  // High weight assigned to NavIC due to strong local signal
  navicWeight: 0.65,
  
  // High confidence that the calculated position matches the road network
  mapMatchConfidence: 0.94,
};
