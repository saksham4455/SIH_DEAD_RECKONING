# SIH26168 — AI-ML INTELLIGENT DEAD RECKONING SYSTEM

# UPDATED REACT NATIVE ARCHITECTURE

```text
project-root/
│
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── ARCHITECTURE.md
├── Makefile
├── .gitignore
├── .editorconfig
├── .env.example
├── .env.development
├── .env.production
├── docker-compose.yml
├── package.json
│
│
├── .github/
│   └── workflows/
│       ├── react-native-ci.yml
│       ├── android-ci.yml
│       ├── ios-ci.yml
│       ├── backend-ci.yml
│       ├── ml-ci.yml
│       ├── model-validation.yml
│       └── release.yml
│
│
├── mobile/                                      # REACT NATIVE APPLICATION
│   │
│   ├── App.tsx                                  # Root React Native application
│   ├── index.js                                 # RN application entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   ├── babel.config.js
│   ├── metro.config.js
│   ├── jest.config.js
│   ├── .eslintrc.js
│   ├── .prettierrc
│   │
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   │   ├── vehicle-icon.svg
│   │   │   ├── navigation-arrow.svg
│   │   │   ├── gnss-icon.svg
│   │   │   ├── imu-icon.svg
│   │   │   ├── ai-icon.svg
│   │   │   ├── warning-icon.svg
│   │   │   └── satellite-icons/
│   │   │
│   │   ├── images/
│   │   │   ├── splash.png
│   │   │   ├── onboarding/
│   │   │   └── calibration/
│   │   │
│   │   └── maps/
│   │       ├── offline-tiles/
│   │       ├── road-network-cache/
│   │       └── demo-regions/
│   │
│   │
│   ├── src/
│   │   │
│   │   ├── app/
│   │   │   ├── AppProviders.tsx
│   │   │   ├── AppBootstrap.ts
│   │   │   ├── PermissionManager.ts
│   │   │   ├── DeviceCapabilityChecker.ts
│   │   │   └── FeatureFlags.ts
│   │   │
│   │   │
│   │   ├── navigation/
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainNavigator.tsx
│   │   │   ├── SessionNavigator.tsx
│   │   │   └── linking.ts
│   │   │
│   │   │
│   │   ├── screens/
│   │   │   │
│   │   │   ├── OnboardingScreen.tsx
│   │   │   │   # Explain IDR system and permissions
│   │   │   │
│   │   │   ├── DeviceSetupScreen.tsx
│   │   │   │   # Check sensors and device capabilities
│   │   │   │
│   │   │   ├── CalibrationScreen.tsx
│   │   │   │   # Vehicle alignment and calibration
│   │   │   │
│   │   │   ├── DashboardScreen.tsx
│   │   │   │   # Main navigation dashboard
│   │   │   │
│   │   │   ├── NavigationScreen.tsx
│   │   │   │   # Real-time navigation
│   │   │   │
│   │   │   ├── SessionScreen.tsx
│   │   │   │   # Active navigation session
│   │   │   │
│   │   │   ├── SessionHistoryScreen.tsx
│   │   │   │   # Previous drive sessions
│   │   │   │
│   │   │   ├── DiagnosticsScreen.tsx
│   │   │   │   # Sensor/fusion diagnostics
│   │   │   │
│   │   │   ├── GNSSStatusScreen.tsx
│   │   │   │   # GNSS quality and satellite status
│   │   │   │
│   │   │   ├── AIStatusScreen.tsx
│   │   │   │   # AI model status and predictions
│   │   │   │
│   │   │   ├── DriftAnalysisScreen.tsx
│   │   │   │   # DR drift and accuracy analysis
│   │   │   │
│   │   │   ├── DebugConsoleScreen.tsx
│   │   │   │   # Development/debug console
│   │   │   │
│   │   │   └── SettingsScreen.tsx
│   │   │
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── PermissionPrompt.tsx
│   │   │   │   ├── OfflineBanner.tsx
│   │   │   │   └── EmptyState.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── NavigationMap.tsx
│   │   │   │   ├── VehicleMarker.tsx
│   │   │   │   ├── HeadingIndicator.tsx
│   │   │   │   ├── SpeedIndicator.tsx
│   │   │   │   ├── AccuracyCircle.tsx
│   │   │   │   ├── RouteOverlay.tsx
│   │   │   │   ├── RoadLaneOverlay.tsx
│   │   │   │   ├── PredictedTrajectory.tsx
│   │   │   │   ├── MapMatchIndicator.tsx
│   │   │   │   ├── MapControls.tsx
│   │   │   │   ├── GNSSOutageOverlay.tsx
│   │   │   │   └── GNSSRecoveryIndicator.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── calibration/
│   │   │   │   ├── CalibrationWizard.tsx
│   │   │   │   ├── PhonePlacementGuide.tsx
│   │   │   │   ├── VehicleDirectionIndicator.tsx
│   │   │   │   ├── PitchIndicator.tsx
│   │   │   │   ├── RollIndicator.tsx
│   │   │   │   ├── YawIndicator.tsx
│   │   │   │   ├── AlignmentConfidence.tsx
│   │   │   │   └── CalibrationResult.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── gnss/
│   │   │   │   ├── SatelliteView.tsx
│   │   │   │   ├── SatelliteCount.tsx
│   │   │   │   ├── CN0Chart.tsx
│   │   │   │   ├── HDOPIndicator.tsx
│   │   │   │   ├── VDOPIndicator.tsx
│   │   │   │   ├── GNSSAccuracyCard.tsx
│   │   │   │   ├── ConstellationBreakdown.tsx
│   │   │   │   └── GNSSQualityBadge.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── AISpeedCard.tsx
│   │   │   │   ├── AIAccelerationCard.tsx
│   │   │   │   ├── VibrationLevel.tsx
│   │   │   │   ├── MotionStateBadge.tsx
│   │   │   │   ├── SensorQualityCard.tsx
│   │   │   │   └── ModelVersionBadge.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── outage/
│   │   │   │   ├── OutageStatusBanner.tsx
│   │   │   │   ├── DeadReckoningIndicator.tsx
│   │   │   │   ├── OutageDuration.tsx
│   │   │   │   ├── DriftEstimate.tsx
│   │   │   │   └── RecoveryStatus.tsx
│   │   │   │
│   │   │   │
│   │   │   ├── diagnostics/
│   │   │   │   ├── SensorDiagnostics.tsx
│   │   │   │   ├── FusionModeBadge.tsx
│   │   │   │   ├── FusionWeightIndicator.tsx
│   │   │   │   ├── AIInferencePanel.tsx
│   │   │   │   ├── SatelliteBreakdown.tsx
│   │   │   │   ├── RoadAnomalyTicker.tsx
│   │   │   │   ├── ThermalCompensationCard.tsx
│   │   │   │   ├── MagneticFingerprintCard.tsx
│   │   │   │   ├── OpticalFlowCard.tsx
│   │   │   │   ├── SimulateOutageButton.tsx
│   │   │   │   ├── RecordingControls.tsx
│   │   │   │   └── DebugOverlayToggle.tsx
│   │   │   │
│   │   │   │
│   │   │   └── charts/
│   │   │       ├── SpeedChart.tsx
│   │   │       ├── AccelerationChart.tsx
│   │   │       ├── DriftChart.tsx
│   │   │       ├── SensorNoiseChart.tsx
│   │   │       ├── ModeTimelineChart.tsx
│   │   │       └── GNSSQualityChart.tsx
│   │   │
│   │   │
│   │   ├── native/
│   │   │   # React Native JS/TS interface to Android/iOS native modules
│   │   │
│   │   │   ├── SensorBridge.ts
│   │   │   ├── AccelerometerBridge.ts
│   │   │   ├── GyroscopeBridge.ts
│   │   │   ├── MagnetometerBridge.ts
│   │   │   ├── RotationVectorBridge.ts
│   │   │   ├── GnssBridge.ts
│   │   │   ├── GnssRawBridge.ts
│   │   │   ├── AiInferenceBridge.ts
│   │   │   ├── AlignmentBridge.ts
│   │   │   ├── FusionBridge.ts
│   │   │   ├── UkfBridge.ts
│   │   │   ├── DeadReckoningBridge.ts
│   │   │   ├── GnssDeficitBridge.ts
│   │   │   ├── MapMatchBridge.ts
│   │   │   ├── KinematicConstraintBridge.ts
│   │   │   ├── ThermalBridge.ts
│   │   │   ├── MagneticFingerprintBridge.ts
│   │   │   ├── OpticalFlowBridge.ts
│   │   │   ├── BarometerBridge.ts
│   │   │   └── index.ts
│   │   │
│   │   │
│   │   ├── engine/
│   │   │   # TypeScript orchestration layer
│   │   │   # Does NOT perform heavy sensor math in JS
│   │   │
│   │   │   ├── NavigationController.ts
│   │   │   ├── SessionController.ts
│   │   │   ├── CalibrationController.ts
│   │   │   ├── GNSSController.ts
│   │   │   ├── FusionController.ts
│   │   │   ├── OutageController.ts
│   │   │   └── ModelController.ts
│   │   │
│   │   │
│   │   ├── services/
│   │   │   ├── apiClient.ts
│   │   │   ├── authService.ts
│   │   │   ├── deviceService.ts
│   │   │   ├── modelService.ts
│   │   │   ├── telemetryService.ts
│   │   │   ├── mapService.ts
│   │   │   ├── sessionService.ts
│   │   │   ├── offlineStorageService.ts
│   │   │   ├── websocketService.ts
│   │   │   └── updateService.ts
│   │   │
│   │   │
│   │   ├── store/
│   │   │   # Zustand global state
│   │   │
│   │   │   ├── navStore.ts
│   │   │   │   # position, heading, speed, navigation mode
│   │   │   │
│   │   │   ├── sensorStore.ts
│   │   │   │   # accelerometer, gyro, magnetometer status
│   │   │   │
│   │   │   ├── gnssStore.ts
│   │   │   │   # satellites, CN0, HDOP, GNSS state
│   │   │   │
│   │   │   ├── fusionStore.ts
│   │   │   │   # UKF/fusion state and confidence
│   │   │   │
│   │   │   ├── aiStore.ts
│   │   │   │   # speed, acceleration, vibration predictions
│   │   │   │
│   │   │   ├── alignmentStore.ts
│   │   │   │   # phone-to-vehicle transformation
│   │   │   │
│   │   │   ├── sessionStore.ts
│   │   │   │   # current recording/session
│   │   │   │
│   │   │   ├── authStore.ts
│   │   │   ├── settingsStore.ts
│   │   │   └── diagnosticsStore.ts
│   │   │
│   │   │
│   │   ├── hooks/
│   │   │   ├── useNavigationData.ts
│   │   │   ├── useSensorStream.ts
│   │   │   ├── useGNSSStatus.ts
│   │   │   ├── useFusionState.ts
│   │   │   ├── useDeadReckoning.ts
│   │   │   ├── useAIInference.ts
│   │   │   ├── useCalibration.ts
│   │   │   ├── useSessionRecorder.ts
│   │   │   ├── useOfflineMode.ts
│   │   │   └── useNetworkStatus.ts
│   │   │
│   │   │
│   │   ├── contexts/
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── NavigationProvider.tsx
│   │   │   └── NetworkStatusProvider.tsx
│   │   │
│   │   │
│   │   ├── types/
│   │   │   ├── sensors.ts
│   │   │   ├── gnss.ts
│   │   │   ├── navigation.ts
│   │   │   ├── fusion.ts
│   │   │   ├── alignment.ts
│   │   │   ├── ai.ts
│   │   │   ├── map.ts
│   │   │   ├── session.ts
│   │   │   └── api.ts
│   │   │
│   │   │
│   │   ├── constants/
│   │   │   ├── sensorRates.ts
│   │   │   ├── gnssThresholds.ts
│   │   │   ├── fusionThresholds.ts
│   │   │   ├── outageThresholds.ts
│   │   │   ├── kinematicLimits.ts
│   │   │   └── featureFlags.ts
│   │   │
│   │   │
│   │   ├── storage/
│   │   │   ├── AsyncStorageAdapter.ts
│   │   │   ├── MMKVAdapter.ts
│   │   │   ├── SensorLogStorage.ts
│   │   │   ├── SessionStorage.ts
│   │   │   ├── ModelStorage.ts
│   │   │   └── MapCacheStorage.ts
│   │   │
│   │   │
│   │   ├── utils/
│   │   │   ├── geoMath.ts
│   │   │   ├── coordinateTransforms.ts
│   │   │   ├── quaternionUtils.ts
│   │   │   ├── bearingUtils.ts
│   │   │   ├── distanceUtils.ts
│   │   │   ├── unitConversion.ts
│   │   │   ├── validation.ts
│   │   │   └── logger.ts
│   │   │
│   │   │
│   │   ├── theme/
│   │   │   ├── colors.ts
│   │   │   ├── spacing.ts
│   │   │   ├── typography.ts
│   │   │   └── dimensions.ts
│   │   │
│   │   │
│   │   ├── i18n/
│   │   │   ├── en.json
│   │   │   └── hi.json
│   │   │
│   │   │
│   │   └── __tests__/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── stores/
│   │       └── utils/
│   │
│   │
│   ├── android/
│   │   │
│   │   ├── app/
│   │   │   └── src/main/
│   │   │       │
│   │   │       ├── java/com/idr/
│   │   │       │   │
│   │   │       │   ├── sensors/
│   │   │       │   │   ├── SensorManager.kt
│   │   │       │   │   ├── AccelerometerManager.kt
│   │   │       │   │   ├── GyroscopeManager.kt
│   │   │       │   │   ├── MagnetometerManager.kt
│   │   │       │   │   ├── RotationVectorManager.kt
│   │   │       │   │   └── BarometerManager.kt
│   │   │       │   │
│   │   │       │   ├── gnss/
│   │   │       │   │   ├── GnssManager.kt
│   │   │       │   │   ├── GnssCallback.kt
│   │   │       │   │   ├── GnssRawMeasurements.kt
│   │   │       │   │   ├── SatelliteManager.kt
│   │   │       │   │   ├── ConstellationDetector.kt
│   │   │       │   │   └── GnssQualityEstimator.kt
│   │   │       │   │
│   │   │       │   ├── nativemodules/
│   │   │       │   │   ├── SensorModule.kt
│   │   │       │   │   ├── GnssModule.kt
│   │   │       │   │   ├── GnssRawModule.kt
│   │   │       │   │   ├── AiInferenceModule.kt
│   │   │       │   │   ├── AlignmentModule.kt
│   │   │       │   │   ├── FusionModule.kt
│   │   │       │   │   ├── UkfModule.kt
│   │   │       │   │   ├── DeadReckoningModule.kt
│   │   │       │   │   ├── GnssDeficitModule.kt
│   │   │       │   │   ├── MapMatchModule.kt
│   │   │       │   │   ├── KinematicConstraintModule.kt
│   │   │       │   │   ├── ThermalModule.kt
│   │   │       │   │   ├── MagneticFingerprintModule.kt
│   │   │       │   │   ├── OpticalFlowModule.kt
│   │   │       │   │   └── NativeModulesPackage.kt
│   │   │       │   │
│   │   │       │   ├── services/
│   │   │       │   │   ├── SensorForegroundService.kt
│   │   │       │   │   ├── NavigationService.kt
│   │   │       │   │   ├── SessionRecorderService.kt
│   │   │       │   │   └── ModelUpdateService.kt
│   │   │       │   │
│   │   │       │   └── permissions/
│   │   │       │       ├── LocationPermission.kt
│   │   │       │       ├── SensorPermission.kt
│   │   │       │       └── BackgroundPermission.kt
│   │   │       │
│   │   │       └── cpp/
│   │   │           └── CMakeLists.txt
│   │
│   │
│   ├── ios/
│   │   │
│   │   ├── NativeModules/
│   │   │   ├── SensorModule.swift
│   │   │   ├── AccelerometerModule.swift
│   │   │   ├── GyroscopeModule.swift
│   │   │   ├── MagnetometerModule.swift
│   │   │   ├── RotationVectorModule.swift
│   │   │   ├── GnssModule.swift
│   │   │   ├── AiInferenceModule.swift
│   │   │   ├── AlignmentModule.swift
│   │   │   ├── FusionModule.swift
│   │   │   ├── UkfModule.swift
│   │   │   ├── DeadReckoningModule.swift
│   │   │   ├── GnssDeficitModule.swift
│   │   │   ├── MapMatchModule.swift
│   │   │   ├── KinematicConstraintModule.swift
│   │   │   ├── ThermalModule.swift
│   │   │   ├── MagneticFingerprintModule.swift
│   │   │   └── OpticalFlowModule.swift
│   │   │
│   │   ├── Services/
│   │   │   ├── SensorService.swift
│   │   │   ├── NavigationService.swift
│   │   │   ├── SessionService.swift
│   │   │   └── BackgroundNavigationService.swift
│   │   │
│   │   └── Bridges/
│   │       ├── UkfCoreBridge.mm
│   │       ├── NavigationBridge.mm
│   │       └── AIInferenceBridge.mm
│   │
│   │
│   └── cpp-core/                                # SHARED PERFORMANCE-CRITICAL CORE
│       │
│       ├── sensor/
│       │   ├── sensor_frame.cpp
│       │   ├── sensor_frame.h
│       │   ├── timestamp_sync.cpp
│       │   └── timestamp_sync.h
│       │
│       ├── preprocessing/
│       │   ├── accelerometer_filter.cpp
│       │   ├── gyroscope_filter.cpp
│       │   ├── bias_estimator.cpp
│       │   ├── outlier_rejection.cpp
│       │   └── signal_quality.cpp
│       │
│       ├── alignment/
│       │   ├── vehicle_alignment.cpp
│       │   ├── vehicle_alignment.h
│       │   ├── orientation_estimator.cpp
│       │   ├── pitch_estimator.cpp
│       │   ├── roll_estimator.cpp
│       │   ├── yaw_estimator.cpp
│       │   └── coordinate_transform.cpp
│       │
│       ├── navigation/
│       │   ├── strapdown_ins.cpp
│       │   ├── dead_reckoning.cpp
│       │   ├── position_propagation.cpp
│       │   ├── velocity_propagation.cpp
│       │   ├── attitude_propagation.cpp
│       │   ├── gravity_model.cpp
│       │   └── earth_model.cpp
│       │
│       ├── fusion/
│       │   ├── ukf_core.cpp
│       │   ├── ukf_core.h
│       │   ├── state_vector.cpp
│       │   ├── sigma_points.cpp
│       │   ├── prediction.cpp
│       │   ├── measurement_update.cpp
│       │   ├── covariance.cpp
│       │   ├── process_noise.cpp
│       │   └── adaptive_noise.cpp
│       │
│       ├── gnss/
│       │   ├── gnss_processor.cpp
│       │   ├── gnss_quality.cpp
│       │   ├── satellite_weighting.cpp
│       │   ├── position_measurement.cpp
│       │   └── velocity_measurement.cpp
│       │
│       ├── map_matching/
│       │   ├── hmm_matcher.cpp
│       │   ├── viterbi.cpp
│       │   ├── candidate_generator.cpp
│       │   ├── road_projection.cpp
│       │   └── match_confidence.cpp
│       │
│       ├── kinematics/
│       │   ├── speed_constraint.cpp
│       │   ├── acceleration_constraint.cpp
│       │   ├── yaw_rate_constraint.cpp
│       │   ├── curvature_constraint.cpp
│       │   ├── turn_constraint.cpp
│       │   └── vehicle_motion_model.cpp
│       │
│       ├── uncertainty/
│       │   ├── covariance_propagation.cpp
│       │   ├── position_uncertainty.cpp
│       │   ├── drift_estimator.cpp
│       │   └── confidence_estimator.cpp
│       │
│       ├── signal/
│       │   ├── low_pass_filter.cpp
│       │   ├── high_pass_filter.cpp
│       │   ├── band_pass_filter.cpp
│       │   ├── adaptive_filter.cpp
│       │   └── vibration_filter.cpp
│       │
│       └── CMakeLists.txt
│
│
├── edge-engine/                                  # ON-DEVICE IDR ENGINE
│   │
│   ├── sensor-ingestion/
│   │   ├── accelerometer/
│   │   ├── gyroscope/
│   │   ├── magnetometer/
│   │   ├── rotation-vector/
│   │   ├── barometer/
│   │   └── gnss/
│   │
│   ├── synchronization/
│   │   ├── timestamp-alignment/
│   │   ├── sensor-interpolation/
│   │   ├── clock-drift/
│   │   └── frame-synchronization/
│   │
│   ├── preprocessing/
│   │   ├── bias-removal/
│   │   ├── noise-filtering/
│   │   ├── outlier-detection/
│   │   ├── vibration-filtering/
│   │   └── sensor-quality/
│   │
│   │
│   ├── in-vehicle-alignment/                     # PS MODULE 1
│   │   │
│   │   ├── phone-orientation/
│   │   │   ├── pitch-estimation/
│   │   │   ├── roll-estimation/
│   │   │   ├── yaw-estimation/
│   │   │   └── gravity-vector-estimation/
│   │   │
│   │   ├── vehicle-direction/
│   │   │   ├── forward-axis-estimation/
│   │   │   ├── backward-motion-detection/
│   │   │   └── heading-reference/
│   │   │
│   │   ├── placement-independent-calibration/
│   │   │   ├── arbitrary-phone-orientation/
│   │   │   ├── coordinate-frame-rotation/
│   │   │   ├── dynamic-realignment/
│   │   │   └── alignment-confidence/
│   │   │
│   │   ├── calibration/
│   │   │   ├── stationary-calibration/
│   │   │   ├── driving-calibration/
│   │   │   ├── gyro-bias-calibration/
│   │   │   ├── accelerometer-bias-calibration/
│   │   │   └── magnetometer-calibration/
│   │   │
│   │   └── output/
│   │       ├── vehicle-frame-imu/
│   │       ├── vehicle-heading/
│   │       └── calibration-state/
│   │
│   │
│   ├── ai-speed-vibration/                        # PS MODULE 2
│   │   │
│   │   ├── speed-estimation/
│   │   │   ├── ai-speed-model/
│   │   │   ├── acceleration-to-speed/
│   │   │   ├── temporal-windowing/
│   │   │   └── speed-confidence/
│   │   │
│   │   ├── acceleration-estimation/
│   │   │   ├── longitudinal-acceleration/
│   │   │   ├── lateral-acceleration/
│   │   │   └── acceleration-confidence/
│   │   │
│   │   ├── vibration-filter/
│   │   │   ├── road-noise/
│   │   │   ├── engine-vibration/
│   │   │   ├── pothole-artifacts/
│   │   │   ├── high-frequency-noise/
│   │   │   └── adaptive-filtering/
│   │   │
│   │   ├── motion-classification/
│   │   │   ├── vehicle-motion/
│   │   │   ├── phone-motion/
│   │   │   ├── stationary/
│   │   │   ├── braking/
│   │   │   ├── acceleration/
│   │   │   ├── turning/
│   │   │   └── vibration/
│   │   │
│   │   ├── phone-artifact-detection/
│   │   │   ├── phone-pickup/
│   │   │   ├── phone-rotation/
│   │   │   ├── phone-shake/
│   │   │   └── mounting-instability/
│   │   │
│   │   └── output/
│   │       ├── estimated-speed/
│   │       ├── estimated-acceleration/
│   │       ├── vibration-level/
│   │       └── motion-confidence/
│   │
│   │
│   ├── gnss-processing/
│   │   │
│   │   ├── acquisition/
│   │   ├── position/
│   │   ├── velocity/
│   │   ├── heading/
│   │   ├── satellite-quality/
│   │   ├── cn0/
│   │   ├── hdop/
│   │   ├── vdop/
│   │   ├── satellite-count/
│   │   ├── constellation-analysis/
│   │   │   ├── GPS/
│   │   │   ├── Galileo/
│   │   │   └── NavIC/
│   │   └── gnss-confidence/
│   │
│   │
│   ├── ins-engine/
│   │   │
│   │   ├── strapdown-mechanization/
│   │   ├── attitude-estimation/
│   │   ├── velocity-estimation/
│   │   ├── position-estimation/
│   │   ├── gravity-compensation/
│   │   ├── earth-rotation/
│   │   ├── gyro-bias/
│   │   └── accelerometer-bias/
│   │
│   │
│   ├── intelligent-dead-reckoning/
│   │   │
│   │   ├── motion-model/
│   │   ├── speed-assisted-propagation/
│   │   ├── acceleration-assisted-propagation/
│   │   ├── heading-propagation/
│   │   ├── turn-rate-propagation/
│   │   ├── drift-control/
│   │   └── confidence-management/
│   │
│   │
│   ├── gnss-ins-fusion/                           # PS MODULE 4
│   │   │
│   │   ├── state-estimation/
│   │   │   ├── position/
│   │   │   ├── velocity/
│   │   │   ├── attitude/
│   │   │   ├── gyro-bias/
│   │   │   └── accelerometer-bias/
│   │   │
│   │   ├── ukf/
│   │   │   ├── prediction/
│   │   │   ├── sigma-points/
│   │   │   ├── measurement-update/
│   │   │   ├── covariance-update/
│   │   │   └── adaptive-noise/
│   │   │
│   │   ├── sensor-weighting/
│   │   │   ├── gnss-weight/
│   │   │   ├── imu-weight/
│   │   │   ├── ai-speed-weight/
│   │   │   ├── map-weight/
│   │   │   └── dynamic-weighting/
│   │   │
│   │   └── fusion-output/
│   │       ├── fused-position/
│   │       ├── fused-velocity/
│   │       ├── fused-heading/
│   │       └── uncertainty/
│   │
│   │
│   ├── gnss-deficit-handler/                      # PS MODULE 5
│   │   │
│   │   ├── gnss-quality-monitor/
│   │   │   ├── signal-loss/
│   │   │   ├── satellite-drop/
│   │   │   ├── cn0-degradation/
│   │   │   ├── hdop-degradation/
│   │   │   └── position-jump/
│   │   │
│   │   ├── outage-detection/
│   │   │   ├── threshold-detector/
│   │   │   ├── temporal-detector/
│   │   │   ├── confidence-detector/
│   │   │   └── false-outage-rejection/
│   │   │
│   │   ├── mode-manager/
│   │   │   ├── GNSS_AIDED_INS/
│   │   │   ├── TRANSITION_TO_DR/
│   │   │   ├── PURE_DEAD_RECKONING/
│   │   │   ├── TRANSITION_TO_GNSS/
│   │   │   └── GNSS_RECOVERED/
│   │   │
│   │   ├── outage-propagation/
│   │   │   ├── imu-propagation/
│   │   │   ├── ai-speed-propagation/
│   │   │   ├── map-constrained-propagation/
│   │   │   └── uncertainty-growth/
│   │   │
│   │   ├── gnss-recovery/
│   │   │   ├── reacquisition/
│   │   │   ├── recovery-validation/
│   │   │   ├── position-jump-rejection/
│   │   │   └── recovery-confidence/
│   │   │
│   │   └── seamless-handover/
│   │       ├── state-alignment/
│   │       ├── covariance-alignment/
│   │       ├── position-correction/
│   │       ├── heading-correction/
│   │       └── trajectory-smoothing/
│   │
│   │
│   ├── map-matching-kinematic-constraints/        # PS MODULE 3
│   │   │
│   │   ├── road-network/
│   │   │   ├── road-segments/
│   │   │   ├── intersections/
│   │   │   ├── lanes/
│   │   │   ├── road-direction/
│   │   │   ├── speed-limits/
│   │   │   └── curvature/
│   │   │
│   │   ├── candidate-generation/
│   │   │   ├── radius-search/
│   │   │   ├── heading-filter/
│   │   │   └── distance-filter/
│   │   │
│   │   ├── hmm-map-matching/
│   │   │   ├── emission-probability/
│   │   │   ├── transition-probability/
│   │   │   ├── viterbi-decoding/
│   │   │   └── match-confidence/
│   │   │
│   │   ├── kinematic-constraints/
│   │   │   ├── speed-limit/
│   │   │   ├── acceleration-limit/
│   │   │   ├── braking-limit/
│   │   │   ├── yaw-rate/
│   │   │   ├── road-curvature/
│   │   │   ├── turn-radius/
│   │   │   ├── lane-continuity/
│   │   │   └── impossible-motion-rejection/
│   │   │
│   │   ├── lane-level-positioning/
│   │   │   ├── lane-candidate/
│   │   │   ├── lane-transition/
│   │   │   ├── lane-confidence/
│   │   │   └── lane-continuity/
│   │   │
│   │   └── map-constrained-output/
│   │       ├── corrected-position/
│   │       ├── corrected-heading/
│   │       └── road-confidence/
│   │
│   │
│   ├── confidence-engine/
│   │   ├── gnss-confidence/
│   │   ├── imu-confidence/
│   │   ├── ai-confidence/
│   │   ├── map-confidence/
│   │   ├── fusion-confidence/
│   │   ├── position-uncertainty/
│   │   ├── drift-estimation/
│   │   └── overall-navigation-confidence/
│   │
│   │
│   ├── fallback-sensors/
│   │   ├── thermal-compensation/
│   │   ├── magnetic-fingerprint/
│   │   ├── optical-flow/
│   │   ├── barometer/
│   │   └── visual-motion/
│   │
│   │
│   ├── model-runtime/
│   │   ├── tensorflow-lite/
│   │   ├── model-loader/
│   │   ├── model-version-check/
│   │   ├── quantized-models/
│   │   ├── inference-buffer/
│   │   ├── inference-scheduler/
│   │   └── inference-monitor/
│   │
│   │
│   ├── offline-navigation/
│   │   ├── offline-map-cache/
│   │   ├── road-graph-cache/
│   │   ├── model-cache/
│   │   ├── route-cache/
│   │   └── session-cache/
│   │
│   └── telemetry/
│       ├── local-buffer/
│       ├── session-recorder/
│       ├── sensor-log/
│       ├── fusion-log/
│       ├── outage-log/
│       └── upload-manager/
│
│
├── ml-training/                                  # OFFLINE AI/ML PIPELINE
│   │
│   ├── data/
│   │   ├── raw/
│   │   │   ├── smartphone-imu/
│   │   │   ├── gnss/
│   │   │   ├── vehicle-kinematics/
│   │   │   └── drive-sessions/
│   │   │
│   │   ├── synchronized/
│   │   ├── processed/
│   │   ├── labeled/
│   │   │   ├── speed/
│   │   │   ├── acceleration/
│   │   │   ├── vibration/
│   │   │   ├── motion-state/
│   │   │   └── phone-artifact/
│   │   │
│   │   ├── synthetic/
│   │   │   ├── gnss-outage/
│   │   │   ├── vibration/
│   │   │   ├── potholes/
│   │   │   ├── engine-noise/
│   │   │   └── sensor-drift/
│   │   │
│   │   ├── augmented/
│   │   └── manifests/
│   │
│   │
│   ├── preprocessing/
│   │   ├── timestamp_alignment.py
│   │   ├── sensor_cleaning.py
│   │   ├── outlier_removal.py
│   │   ├── normalization.py
│   │   ├── windowing.py
│   │   └── feature_generation.py
│   │
│   │
│   ├── augmentation/
│   │   ├── vibration_augmentation.py
│   │   ├── pothole_augmentation.py
│   │   ├── engine_vibration.py
│   │   ├── sensor_noise.py
│   │   ├── gyro_drift.py
│   │   └── gnss_dropout.py
│   │
│   │
│   ├── models/
│   │   ├── speed_estimator/
│   │   │   ├── model.py
│   │   │   ├── architecture.py
│   │   │   └── loss.py
│   │   │
│   │   ├── acceleration_estimator/
│   │   │   ├── model.py
│   │   │   └── loss.py
│   │   │
│   │   ├── vibration_classifier/
│   │   │   ├── model.py
│   │   │   └── classifier.py
│   │   │
│   │   ├── motion_classifier/
│   │   │   ├── model.py
│   │   │   └── classifier.py
│   │   │
│   │   ├── road_anomaly/
│   │   │   ├── model.py
│   │   │   └── classifier.py
│   │   │
│   │   ├── thermal_compensator/
│   │   │   ├── model.py
│   │   │   └── regression.py
│   │   │
│   │   └── alignment_model/
│   │       ├── model.py
│   │       └── orientation_estimator.py
│   │
│   │
│   ├── training/
│   │   ├── config.py
│   │   ├── dataset.py
│   │   ├── train_speed.py
│   │   ├── train_acceleration.py
│   │   ├── train_vibration.py
│   │   ├── train_motion.py
│   │   ├── train_anomaly.py
│   │   └── train_alignment.py
│   │
│   │
│   ├── calibration/
│   │   ├── sensor_calibration.py
│   │   ├── orientation_calibration.py
│   │   ├── vehicle_alignment_calibration.py
│   │   ├── temperature_calibration.py
│   │   └── model_calibration.py
│   │
│   │
│   ├── evaluation/
│   │   ├── eval_speed.py
│   │   ├── eval_acceleration.py
│   │   ├── eval_vibration.py
│   │   ├── eval_motion.py
│   │   ├── eval_alignment.py
│   │   ├── eval_outage.py
│   │   ├── eval_drift.py
│   │   └── eval_lane_accuracy.py
│   │
│   │
│   ├── replay/
│   │   ├── sensor_replay.py
│   │   ├── gnss_outage_replay.py
│   │   ├── route_replay.py
│   │   └── benchmark_replay.py
│   │
│   │
│   ├── export/
│   │   ├── export_tflite.py
│   │   ├── quantize_int8.py
│   │   ├── optimize_model.py
│   │   ├── model_metadata.py
│   │   └── validate_mobile_model.py
│   │
│   ├── notebooks/
│   │   ├── exploratory_analysis.ipynb
│   │   ├── sensor_analysis.ipynb
│   │   ├── speed_model_analysis.ipynb
│   │   ├── vibration_analysis.ipynb
│   │   └── drift_analysis.ipynb
│   │
│   ├── tests/
│   │   ├── test_dataset.py
│   │   ├── test_preprocessing.py
│   │   ├── test_models.py
│   │   ├── test_export.py
│   │   └── test_replay.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   │
│   └── models_output/
│       ├── speed_estimator_v1.tflite
│       ├── acceleration_estimator_v1.tflite
│       ├── vibration_filter_v1.tflite
│       ├── motion_classifier_v1.tflite
│       ├── road_anomaly_v1.tflite
│       ├── alignment_model_v1.tflite
│       └── thermal_compensator_v1.tflite
│
│
├── backend/                                      # SUPPORT / CLOUD PLANE
│   │
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── logging.py
│   │   │   ├── exceptions.py
│   │   │   └── constants.py
│   │   │
│   │   ├── middleware/
│   │   │   ├── cors.py
│   │   │   ├── rate_limiter.py
│   │   │   ├── request_logging.py
│   │   │   └── error_handler.py
│   │   │
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   │
│   │   │   └── v1/
│   │   │       ├── router.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── devices.py
│   │   │       ├── sessions.py
│   │   │       ├── telemetry.py
│   │   │       ├── models.py
│   │   │       ├── maps.py
│   │   │       ├── road_graph.py
│   │   │       ├── anomalies.py
│   │   │       ├── analytics.py
│   │   │       ├── configuration.py
│   │   │       └── health.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── device_service.py
│   │   │   ├── session_service.py
│   │   │   ├── telemetry_service.py
│   │   │   ├── model_registry_service.py
│   │   │   ├── model_update_service.py
│   │   │   ├── map_service.py
│   │   │   ├── road_graph_service.py
│   │   │   ├── analytics_service.py
│   │   │   └── anomaly_service.py
│   │   │
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── session.py
│   │   │   │
│   │   │   └── models/
│   │   │       ├── user.py
│   │   │       ├── device.py
│   │   │       ├── session.py
│   │   │       ├── sensor_frame.py
│   │   │       ├── fused_frame.py
│   │   │       ├── gnss_event.py
│   │   │       ├── outage_event.py
│   │   │       ├── model_version.py
│   │   │       ├── road_graph_region.py
│   │   │       ├── road_segment.py
│   │   │       ├── anomaly_event.py
│   │   │       └── calibration_profile.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── device.py
│   │   │   ├── session.py
│   │   │   ├── sensor.py
│   │   │   ├── fusion.py
│   │   │   ├── telemetry.py
│   │   │   ├── model.py
│   │   │   ├── map.py
│   │   │   └── anomaly.py
│   │   │
│   │   ├── storage/
│   │   │   ├── object_storage_client.py
│   │   │   ├── model_storage.py
│   │   │   ├── telemetry_storage.py
│   │   │   └── map_storage.py
│   │   │
│   │   ├── cache/
│   │   │   ├── redis_client.py
│   │   │   ├── model_cache.py
│   │   │   ├── map_cache.py
│   │   │   └── device_cache.py
│   │   │
│   │   ├── realtime/
│   │   │   ├── telemetry_ws.py
│   │   │   └── dashboard_ws.py
│   │   │
│   │   ├── workers/
│   │   │   ├── celery_app.py
│   │   │   ├── telemetry_processor.py
│   │   │   ├── map_preprocessor.py
│   │   │   ├── model_validator.py
│   │   │   └── drift_recompute.py
│   │   │
│   │   ├── observability/
│   │   │   ├── metrics.py
│   │   │   ├── tracing.py
│   │   │   └── health_metrics.py
│   │   │
│   │   └── utils/
│   │       ├── validators.py
│   │       ├── hashing.py
│   │       ├── geo_utils.py
│   │       └── model_utils.py
│   │
│   ├── migrations/
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_devices.py
│   │   ├── test_sessions.py
│   │   ├── test_telemetry.py
│   │   ├── test_models.py
│   │   ├── test_maps.py
│   │   └── test_health.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── celery_worker_entrypoint.sh
│   └── alembic.ini
│
│
├── database/
│   ├── schema.sql
│   ├── seed_data.sql
│   ├── indexes.sql
│   │
│   ├── tables/
│   │   ├── users.sql
│   │   ├── devices.sql
│   │   ├── sessions.sql
│   │   ├── sensor_frames.sql
│   │   ├── fused_frames.sql
│   │   ├── gnss_events.sql
│   │   ├── outage_events.sql
│   │   ├── model_versions.sql
│   │   ├── calibration_profiles.sql
│   │   ├── road_regions.sql
│   │   ├── road_segments.sql
│   │   └── anomaly_events.sql
│   │
│   ├── postgis/
│   │   ├── road_geometry.sql
│   │   ├── spatial_indexes.sql
│   │   └── nearest_road_queries.sql
│   │
│   └── backups/
│       └── scheduled-dumps/
│
│
├── maps/
│   │
│   ├── raw/
│   │   ├── osm/
│   │   └── government-road-data/
│   │
│   ├── processing/
│   │   ├── road-extraction/
│   │   ├── intersection-generation/
│   │   ├── lane-processing/
│   │   ├── curvature-calculation/
│   │   └── speed-limit-processing/
│   │
│   ├── road-graph/
│   │   ├── nodes/
│   │   ├── edges/
│   │   ├── lanes/
│   │   └── metadata/
│   │
│   ├── offline/
│   │   ├── tiles/
│   │   └── graph-regions/
│   │
│   └── scripts/
│       ├── build_graph.py
│       ├── preprocess_osm.py
│       └── generate_offline_region.py
│
│
├── simulation/                                   # GNSS-DENIED TEST ENVIRONMENT
│   │
│   ├── sensor-replay/
│   │   ├── imu-replay.py
│   │   ├── gnss-replay.py
│   │   └── synchronized-replay.py
│   │
│   ├── gnss-outage/
│   │   ├── tunnel.py
│   │   ├── underpass.py
│   │   ├── parking.py
│   │   ├── urban-canyon.py
│   │   ├── forest.py
│   │   └── custom-outage.py
│   │
│   ├── sensor-noise/
│   │   ├── imu-noise.py
│   │   ├── gyro-drift.py
│   │   ├── accelerometer-bias.py
│   │   └── vibration-noise.py
│   │
│   ├── phone-placement/
│   │   ├── dashboard.py
│   │   ├── pocket.py
│   │   ├── tilted.py
│   │   ├── rotated.py
│   │   └── arbitrary-orientation.py
│   │
│   └── benchmark/
│       ├── drift-benchmark.py
│       ├── lane-accuracy.py
│       ├── outage-transition.py
│       ├── recovery-benchmark.py
│       └── latency-benchmark.py
│
│
├── tests/
│   │
│   ├── unit/
│   │   ├── sensor/
│   │   ├── alignment/
│   │   ├── ai/
│   │   ├── gnss/
│   │   ├── ins/
│   │   ├── fusion/
│   │   ├── map-matching/
│   │   ├── kinematics/
│   │   └── confidence/
│   │
│   ├── native/
│   │   ├── android/
│   │   ├── ios/
│   │   └── cpp/
│   │
│   ├── integration/
│   │   ├── sensor-to-fusion/
│   │   ├── ai-to-fusion/
│   │   ├── fusion-to-map/
│   │   ├── outage-transition/
│   │   └── recovery-transition/
│   │
│   ├── e2e/
│   │   ├── onboarding.e2e.ts
│   │   ├── calibration.e2e.ts
│   │   ├── navigation.e2e.ts
│   │   ├── gnss-outage.e2e.ts
│   │   └── session-recording.e2e.ts
│   │
│   ├── performance/
│   │   ├── inference-latency/
│   │   ├── fusion-latency/
│   │   ├── memory-usage/
│   │   ├── battery-usage/
│   │   └── cpu-usage/
│   │
│   └── field/
│       ├── tunnel/
│       ├── underpass/
│       ├── parking/
│       ├── urban-canyon/
│       ├── forest/
│       └── highway/
│
│
├── infra/
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── ml.Dockerfile
│   │   └── nginx.Dockerfile
│   │
│   ├── kubernetes/
│   │   ├── backend-deployment.yaml
│   │   ├── worker-deployment.yaml
│   │   ├── redis-deployment.yaml
│   │   ├── postgres-statefulset.yaml
│   │   └── ingress.yaml
│   │
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── monitoring/
│       ├── prometheus.yml
│       ├── grafana/
│       │   ├── navigation-dashboard.json
│       │   ├── backend-dashboard.json
│       │   └── model-dashboard.json
│       └── alerts.yml
│
│
├── docs/
│   ├── system-overview.md
│   ├── architecture.md
│   ├── react-native-architecture.md
│   ├── native-bridge-architecture.md
│   ├── edge-engine.md
│   ├── gnss-ins-fusion.md
│   ├── dead-reckoning.md
│   ├── vehicle-alignment.md
│   ├── ai-speed-estimation.md
│   ├── vibration-filtering.md
│   ├── map-matching.md
│   ├── kinematic-constraints.md
│   ├── gnss-deficit-handler.md
│   ├── model-training.md
│   ├── model-deployment.md
│   ├── offline-navigation.md
│   ├── api-reference.md
│   ├── database-schema.md
│   ├── testing-strategy.md
│   ├── benchmark-methodology.md
│   │
│   ├── model-cards/
│   │   ├── speed-estimator.md
│   │   ├── acceleration-estimator.md
│   │   ├── vibration-filter.md
│   │   ├── motion-classifier.md
│   │   └── alignment-model.md
│   │
│   ├── adr/
│   │   ├── 0001-react-native.md
│   │   ├── 0002-native-modules.md
│   │   ├── 0003-shared-cpp-core.md
│   │   ├── 0004-ukf-over-ekf.md
│   │   ├── 0005-tflite-edge-inference.md
│   │   ├── 0006-hmm-map-matching.md
│   │   └── 0007-offline-first-navigation.md
│   │
│   └── deployment/
│       ├── local-development.md
│       ├── android-build.md
│       ├── ios-build.md
│       └── production-deployment.md
│
│
└── scripts/
    ├── setup.sh
    ├── setup-mobile.sh
    ├── setup-backend.sh
    ├── setup-ml.sh
    ├── download-models.sh
    ├── build-android.sh
    ├── build-ios.sh
    ├── run-simulation.sh
    ├── run-benchmark.sh
    └── generate-demo-data.sh
```




                    ┌───────────────────────────────┐
                    │       REACT NATIVE APP        │
                    │                               │
                    │ UI + Navigation + State       │
                    │ Screens + Diagnostics         │
                    └───────────────┬───────────────┘
                                    │
                         React Native Bridge
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │     NATIVE MOBILE LAYER       │
                    │                               │
                    │ Android / iOS Sensors         │
                    │ GNSS                          │
                    │ Camera / Barometer             │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │        EDGE IDR ENGINE        │
                    │                               │
                    │ Sensor Synchronization        │
                    │        ↓                      │
                    │ Vehicle Alignment              │
                    │        ↓                      │
                    │ AI Speed + Acceleration        │
                    │        ↓                      │
                    │ Vibration / Motion Filtering   │
                    │        ↓                      │
                    │ GNSS Processing + INS          │
                    │        ↓                      │
                    │ UKF Sensor Fusion              │
                    │        ↓                      │
                    │ GNSS Deficit Handler           │
                    │        ↓                      │
                    │ Dead Reckoning                 │
                    │        ↓                      │
                    │ Map Matching                   │
                    │        ↓                      │
                    │ Kinematic Constraints           │
                    │        ↓                      │
                    │ Position + Confidence           │
                    └───────────────┬───────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       REACT NATIVE UI         │
                    │                               │
                    │ Vehicle Position               │
                    │ Lane / Road                    │
                    │ Speed                          │
                    │ Heading                        │
                    │ Accuracy                       │
                    │ GNSS / DR Mode                 │
                    │ Outage Status                  │
                    └───────────────────────────────┘










                                     REAL-TIME POSITIONING
                         │
                         ▼
              ┌─────────────────────┐
              │ Smartphone Sensors  │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Native Sensor Layer │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Alignment Engine    │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ AI Speed / Motion   │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ GNSS + INS          │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ UKF Fusion          │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ GNSS Deficit        │
              │ State Machine       │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Dead Reckoning      │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Map Matching +      │
              │ Kinematic Rules     │
              └──────────┬──────────┘
                         ↓
              ┌─────────────────────┐
              │ Position +          │
              │ Confidence          │
              └─────────────────────┘


       ───────────────────────────────────────
                 SUPPORT PLANE
       ───────────────────────────────────────

              React Native App
                     │
                     ▼
                  Backend
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Models      Maps      Telemetry
          │          │          │
          ↓          ↓          ↓
      Registry    PostGIS    Analytics
