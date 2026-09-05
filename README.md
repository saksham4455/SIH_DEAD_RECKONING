Full APP Architecture:

```text
SIH26168 — INTELLIGENT GNSS-DENIED VEHICLE NAVIGATION & POSITIONING PLATFORM
COMPLETE SYSTEM ARCHITECTURE
│
├── project-root/
│   │
│   ├── README.md
│   ├── LICENSE
│   ├── CONTRIBUTING.md
│   ├── Makefile
│   ├── .gitignore
│   ├── .editorconfig
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── docker-compose.yml
│   ├── package.json
│   ├── pyproject.toml
│   ├── requirements.txt
│   │
│   ├── .github/
│   │   └── workflows/
│   │       ├── mobile-ci.yml
│   │       ├── android-build.yml
│   │       ├── ios-build.yml
│   │       ├── backend-ci.yml
│   │       ├── ml-training-ci.yml
│   │       ├── model-validation.yml
│   │       ├── security-scan.yml
│   │       └── deploy.yml
│   │
│   │
│   ├── frontend/                                      # Complete user-facing application layer
│   │   │
│   │   ├── mobile/                                    # React Native cross-platform application
│   │   │   │
│   │   │   ├── App.tsx
│   │   │   ├── index.js
│   │   │   ├── package.json
│   │   │   ├── tsconfig.json
│   │   │   ├── app.json
│   │   │   ├── babel.config.js
│   │   │   ├── metro.config.js
│   │   │   ├── jest.config.js
│   │   │   ├── .eslintrc.js
│   │   │   ├── .prettierrc
│   │   │   │
│   │   │   ├── assets/
│   │   │   │   ├── fonts/
│   │   │   │   ├── icons/
│   │   │   │   │   ├── vehicle-icon.svg
│   │   │   │   │   ├── navigation-arrow.svg
│   │   │   │   │   ├── satellite.svg
│   │   │   │   │   ├── gnss.svg
│   │   │   │   │   ├── imu.svg
│   │   │   │   │   ├── ai.svg
│   │   │   │   │   ├── map-match.svg
│   │   │   │   │   ├── warning.svg
│   │   │   │   │   └── satellite-icons/
│   │   │   │   │       ├── gps.svg
│   │   │   │   │       ├── navic.svg
│   │   │   │   │       ├── glonass.svg
│   │   │   │   │       ├── galileo.svg
│   │   │   │   │       └── beidou.svg
│   │   │   │   ├── images/
│   │   │   │   │   ├── splash.png
│   │   │   │   │   ├── onboarding/
│   │   │   │   │   └── vehicle/
│   │   │   │   └── maps/
│   │   │   │       ├── offline-tiles/
│   │   │   │       ├── road-network/
│   │   │   │       └── demo-region/
│   │   │   │
│   │   │   ├── src/
│   │   │   │   │
│   │   │   │   ├── components/
│   │   │   │   │   │
│   │   │   │   │   ├── common/
│   │   │   │   │   │   ├── Button.tsx
│   │   │   │   │   │   ├── IconButton.tsx
│   │   │   │   │   │   ├── Card.tsx
│   │   │   │   │   │   ├── StatCard.tsx
│   │   │   │   │   │   ├── StatusBadge.tsx
│   │   │   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   │   │   ├── SkeletonLoader.tsx
│   │   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   │   ├── BottomSheet.tsx
│   │   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   │   │   ├── EmptyState.tsx
│   │   │   │   │   │   ├── PermissionPrompt.tsx
│   │   │   │   │   │   └── ConnectionIndicator.tsx
│   │   │   │   │   │
│   │   │   │   │   ├── navigation/
│   │   │   │   │   │   ├── NavigationMap.tsx
│   │   │   │   │   │   ├── VehicleMarker.tsx
│   │   │   │   │   │   ├── VehicleHeadingIndicator.tsx
│   │   │   │   │   │   ├── RouteOverlay.tsx
│   │   │   │   │   ├── RoadGraphOverlay.tsx
│   │   │   │   │   ├── MapControls.tsx
│   │   │   │   │   ├── ZoomControls.tsx
│   │   │   │   │   ├── Compass.tsx
│   │   │   │   │   ├── AccuracyCircle.tsx
│   │   │   │   │   ├── PositionTrail.tsx
│   │   │   │   │   ├── LastKnownPosition.tsx
│   │   │   │   │   ├── MapMatchIndicator.tsx
│   │   │   │   │   └── OfflineMapIndicator.tsx
│   │   │   │   │
│   │   │   │   ├── diagnostics/
│   │   │   │   │   ├── DiagnosticsDashboard.tsx
│   │   │   │   │   ├── FusionModeBadge.tsx
│   │   │   │   │   ├── PositionConfidenceBadge.tsx
│   │   │   │   │   ├── SatelliteBreakdown.tsx
│   │   │   │   │   ├── SatelliteCountCard.tsx
│   │   │   │   │   ├── NavicWeightIndicator.tsx
│   │   │   │   │   ├── GnssSignalQuality.tsx
│   │   │   │   │   ├── Cn0Chart.tsx
│   │   │   │   │   ├── HdopIndicator.tsx
│   │   │   │   │   ├── VdopIndicator.tsx
│   │   │   │   │   ├── PdopIndicator.tsx
│   │   │   │   │   ├── AiInferencePanel.tsx
│   │   │   │   │   ├── SpeedEstimateCard.tsx
│   │   │   │   │   ├── RoadAnomalyTicker.tsx
│   │   │   │   │   ├── RoadSurfaceStatus.tsx
│   │   │   │   │   ├── ThermalCompensationCard.tsx
│   │   │   │   │   ├── TemperatureDriftIndicator.tsx
│   │   │   │   │   ├── MagneticFingerprintCard.tsx
│   │   │   │   │   ├── MagneticConfidenceIndicator.tsx
│   │   │   │   │   ├── OpticalFlowFallbackCard.tsx
│   │   │   │   │   ├── OpticalFlowQuality.tsx
│   │   │   │   │   ├── ImuHealthCard.tsx
│   │   │   │   │   ├── AccelerometerStatus.tsx
│   │   │   │   │   ├── GyroscopeStatus.tsx
│   │   │   │   │   ├── MagnetometerStatus.tsx
│   │   │   │   │   ├── SensorSynchronizationStatus.tsx
│   │   │   │   │   ├── MapMatchConfidence.tsx
│   │   │   │   │   ├── DriftEstimateCard.tsx
│   │   │   │   │   ├── ErrorEllipse.tsx
│   │   │   │   │   ├── SimulateOutageButton.tsx
│   │   │   │   │   ├── OutageScenarioSelector.tsx
│   │   │   │   │   ├── RecordingControls.tsx
│   │   │   │   │   ├── DebugOverlayToggle.tsx
│   │   │   │   │   └── RawSensorViewer.tsx
│   │   │   │   │
│   │   │   │   ├── charts/
│   │   │   │   │   ├── DriftLineChart.tsx
│   │   │   │   │   ├── PositionErrorChart.tsx
│   │   │   │   │   ├── VelocityChart.tsx
│   │   │   │   │   ├── AccelerationChart.tsx
│   │   │   │   │   ├── GyroscopeChart.tsx
│   │   │   │   │   ├── Cn0Chart.tsx
│   │   │   │   │   ├── ModeTimelineBar.tsx
│   │   │   │   │   ├── SensorAvailabilityChart.tsx
│   │   │   │   │   └── ConfidenceTimeline.tsx
│   │   │   │   │
│   │   │   │   ├── forms/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   ├── RegisterForm.tsx
│   │   │   │   │   ├── SettingsForm.tsx
│   │   │   │   │   ├── DeviceSetupForm.tsx
│   │   │   │   │   ├── VehicleProfileForm.tsx
│   │   │   │   │   ├── CalibrationForm.tsx
│   │   │   │   │   └── OutageSimulationForm.tsx
│   │   │   │   │
│   │   │   │   ├── session/
│   │   │   │   │   ├── SessionHeader.tsx
│   │   │   │   │   ├── SessionTimer.tsx
│   │   │   │   │   ├── SessionStats.tsx
│   │   │   │   │   ├── SessionStatus.tsx
│   │   │   │   │   ├── RecordingIndicator.tsx
│   │   │   │   │   └── SessionExportButton.tsx
│   │   │   │   │
│   │   │   │   └── alerts/
│   │   │   │       ├── GnssLostAlert.tsx
│   │   │   │       ├── LowConfidenceAlert.tsx
│   │   │   │       ├── SensorFailureAlert.tsx
│   │   │   │       ├── HighDriftAlert.tsx
│   │   │   │       ├── ThermalWarning.tsx
│   │   │   │       └── ModelFailureAlert.tsx
│   │   │   │
│   │   │   ├── screens/
│   │   │   │   ├── SplashScreen.tsx
│   │   │   │   ├── OnboardingScreen.tsx
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   ├── DevicePairingScreen.tsx
│   │   │   │   ├── CalibrationScreen.tsx
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── NavigationScreen.tsx
│   │   │   │   ├── SessionScreen.tsx
│   │   │   │   ├── SessionHistoryScreen.tsx
│   │   │   │   ├── SessionDetailsScreen.tsx
│   │   │   │   ├── DiagnosticsScreen.tsx
│   │   │   │   ├── SensorHealthScreen.tsx
│   │   │   │   ├── ModelStatusScreen.tsx
│   │   │   │   ├── SettingsScreen.tsx
│   │   │   │   ├── DeviceSettingsScreen.tsx
│   │   │   │   ├── DebugConsoleScreen.tsx
│   │   │   │   ├── OfflineDataScreen.tsx
│   │   │   │   └── AboutScreen.tsx
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx
│   │   │   │   ├── AuthNavigator.tsx
│   │   │   │   ├── MainNavigator.tsx
│   │   │   │   ├── DashboardNavigator.tsx
│   │   │   │   ├── SettingsNavigator.tsx
│   │   │   │   └── linking.ts
│   │   │   │
│   │   │   ├── native/
│   │   │   │   ├── SensorBridge.ts
│   │   │   │   ├── GnssBridge.ts
│   │   │   │   ├── ImuBridge.ts
│   │   │   │   ├── AiInferenceBridge.ts
│   │   │   │   ├── FusionBridge.ts
│   │   │   │   ├── MapMatchBridge.ts
│   │   │   │   ├── ThermalBridge.ts
│   │   │   │   ├── MagneticFingerprintBridge.ts
│   │   │   │   ├── OpticalFlowBridge.ts
│   │   │   │   ├── CalibrationBridge.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── apiClient.ts
│   │   │   │   ├── authService.ts
│   │   │   │   ├── deviceService.ts
│   │   │   │   ├── modelService.ts
│   │   │   │   ├── telemetryService.ts
│   │   │   │   ├── mapService.ts
│   │   │   │   ├── navigationService.ts
│   │   │   │   ├── calibrationService.ts
│   │   │   │   ├── sessionService.ts
│   │   │   │   ├── offlineQueueService.ts
│   │   │   │   ├── modelDownloadService.ts
│   │   │   │   ├── websocketService.ts
│   │   │   │   ├── syncService.ts
│   │   │   │   ├── loggingService.ts
│   │   │   │   └── crashReportingService.ts
│   │   │   │
│   │   │   ├── store/
│   │   │   │   ├── navStore.ts
│   │   │   │   ├── sensorStore.ts
│   │   │   │   ├── fusionStore.ts
│   │   │   │   ├── sessionStore.ts
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── deviceStore.ts
│   │   │   │   ├── modelStore.ts
│   │   │   │   ├── settingsStore.ts
│   │   │   │   └── offlineStore.ts
│   │   │   │
│   │   │   ├── contexts/
│   │   │   │   ├── ThemeProvider.tsx
│   │   │   │   ├── NetworkStatusProvider.tsx
│   │   │   │   ├── NavigationProvider.tsx
│   │   │   │   └── SensorProvider.tsx
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useNavigationData.ts
│   │   │   │   ├── useSensorStream.ts
│   │   │   │   ├── useGnssStatus.ts
│   │   │   │   ├── useFusionState.ts
│   │   │   │   ├── usePositionConfidence.ts
│   │   │   │   ├── useSessionRecorder.ts
│   │   │   │   ├── useModelStatus.ts
│   │   │   │   ├── useDevice.ts
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useOfflineQueue.ts
│   │   │   │   └── useNetworkStatus.ts
│   │   │   │
│   │   │   ├── data/
│   │   │   │   ├── mockData.ts
│   │   │   │   ├── demoSessions.ts
│   │   │   │   ├── outageScenarios.ts
│   │   │   │   └── sensorSamples.ts
│   │   │   │
│   │   │   ├── local-storage/
│   │   │   │   ├── sqlite.ts
│   │   │   │   ├── sessionRepository.ts
│   │   │   │   ├── sensorRepository.ts
│   │   │   │   ├── telemetryQueue.ts
│   │   │   │   ├── mapCache.ts
│   │   │   │   └── modelCache.ts
│   │   │   │
│   │   │   ├── constants/
│   │   │   │   ├── config.ts
│   │   │   │   ├── thresholds.ts
│   │   │   │   ├── sensorRates.ts
│   │   │   │   ├── fusionModes.ts
│   │   │   │   ├── outageModes.ts
│   │   │   │   └── permissions.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── navigation.ts
│   │   │   ├── sensors.ts
│   │   │   ├── gnss.ts
│   │   │   ├── imu.ts
│   │   │   ├── fusion.ts
│   │   │   ├── mapMatching.ts
│   │   │   ├── anomaly.ts
│   │   │   ├── thermal.ts
│   │   │   ├── magnetic.ts
│   │   │   ├── opticalFlow.ts
│   │   │   ├── session.ts
│   │   │   ├── device.ts
│   │   │   ├── model.ts
│   │   │   └── api.ts
│   │   │
│   │   │   ├── utils/
│   │   │   │   ├── geoMath.ts
│   │   │   │   ├── coordinateTransforms.ts
│   │   │   │   ├── bearing.ts
│   │   │   │   ├── distance.ts
│   │   │   │   ├── quaternion.ts
│   │   │   │   ├── matrix.ts
│   │   │   │   ├── timestamp.ts
│   │   │   │   ├── validation.ts
│   │   │   │   ├── formatters.ts
│   │   │   │   └── logger.ts
│   │   │   │
│   │   │   ├── i18n/
│   │   │   │   ├── en.json
│   │   │   │   └── hi.json
│   │   │   │
│   │   │   ├── theme/
│   │   │   │   ├── colors.ts
│   │   │   │   ├── spacing.ts
│   │   │   │   ├── typography.ts
│   │   │   │   ├── shadows.ts
│   │   │   │   └── dimensions.ts
│   │   │   │
│   │   │   └── __tests__/
│   │   │       ├── components/
│   │   │       ├── screens/
│   │   │       ├── hooks/
│   │   │       ├── services/
│   │   │       ├── store/
│   │   │       └── utils/
│   │   │
│   │   ├── android/
│   │   │   └── app/src/main/
│   │   │       ├── AndroidManifest.xml
│   │   │       │
│   │   │       ├── java/com/idr/
│   │   │       │   ├── MainActivity.kt
│   │   │       │   ├── MainApplication.kt
│   │   │       │   │
│   │   │       │   ├── nativemodules/
│   │   │       │   │   ├── SensorModule.kt
│   │   │       │   │   │   ├── accelerometer
│   │   │       │   │   │   ├── gyroscope
│   │   │       │   │   │   ├── magnetometer
│   │   │       │   │   │   ├── barometer
│   │   │       │   │   │   └── sensor timestamps
│   │   │       │   │   ├── GnssModule.kt
│   │   │       │   │   │   ├── raw measurements
│   │   │       │   │   │   ├── satellite constellation
│   │   │       │   │   │   ├── carrier information
│   │   │       │   │   │   ├── pseudorange
│   │   │       │   │   │   ├── Doppler
│   │   │       │   │   │   ├── C/N0
│   │   │       │   │   │   └── satellite visibility
│   │   │       │   │   ├── ImuModule.kt
│   │   │       │   │   ├── AiInferenceModule.kt
│   │   │       │   │   ├── FusionModule.kt
│   │   │       │   │   ├── MapMatchModule.kt
│   │   │       │   │   ├── ThermalModule.kt
│   │   │       │   │   ├── MagneticFingerprintModule.kt
│   │   │       │   │   ├── OpticalFlowModule.kt
│   │   │       │   │   ├── CalibrationModule.kt
│   │   │       │   │   └── NativeModulesPackage.kt
│   │   │       │   │
│   │   │       │   ├── sensors/
│   │   │       │   │   ├── SensorManagerWrapper.kt
│   │   │       │   │   ├── GnssManager.kt
│   │   │       │   │   ├── ImuManager.kt
│   │   │       │   │   ├── CameraManager.kt
│   │   │       │   │   └── SensorTimestampManager.kt
│   │   │       │   │
│   │   │       │   ├── services/
│   │   │       │   │   ├── SensorForegroundService.kt
│   │   │       │   │   ├── NavigationService.kt
│   │   │       │   │   └── TelemetryUploadService.kt
│   │   │       │   │
│   │   │       │   └── permissions/
│   │   │       │       ├── LocationPermission.kt
│   │   │       │       ├── SensorPermission.kt
│   │   │       │       ├── CameraPermission.kt
│   │   │       │       └── BluetoothPermission.kt
│   │   │       │
│   │   │       └── cpp/
│   │   │           ├── ukf_core.cpp
│   │   │           ├── ukf_core.h
│   │   │           ├── matrix_ops.cpp
│   │   │           ├── coordinate_transforms.cpp
│   │   │           ├── quaternion_ops.cpp
│   │   │           ├── sensor_fusion.cpp
│   │   │           └── CMakeLists.txt
│   │   │
│   │   └── ios/
│   │       ├── NativeModules/
│   │       │   ├── SensorModule.swift
│   │       │   ├── GnssModule.swift
│   │       │   ├── ImuModule.swift
│   │       │   ├── AiInferenceModule.swift
│   │       │   ├── FusionModule.swift
│   │       │   ├── MapMatchModule.swift
│   │       │   ├── ThermalModule.swift
│   │       │   ├── MagneticFingerprintModule.swift
│   │       │   ├── OpticalFlowModule.swift
│   │       │   ├── CalibrationModule.swift
│   │       │   └── UkfCoreBridge.mm
│   │       ├── Services/
│   │       │   ├── NavigationBackgroundService.swift
│   │       │   └── TelemetryService.swift
│   │       └── Permissions/
│   │
│   │
│   ├── positioning-engine/                           # Core GNSS-denied navigation engine
│   │   │
│   │   ├── sensor-ingestion/
│   │   │   ├── accelerometer-reader
│   │   │   ├── gyroscope-reader
│   │   │   ├── magnetometer-reader
│   │   │   ├── barometer-reader
│   │   │   ├── gnss-reader
│   │   │   ├── camera-reader
│   │   │   └── sensor-health-monitor
│   │   │
│   │   ├── timestamp-synchronization/
│   │   │   ├── hardware-timestamp-parser
│   │   │   ├── software-timestamp-correction
│   │   │   ├── clock-offset-estimator
│   │   │   └── multi-sensor-alignment
│   │   │
│   │   ├── preprocessing/
│   │   │   ├── sensor-validation
│   │   │   ├── outlier-removal
│   │   │   ├── noise-filtering
│   │   │   ├── low-pass-filter
│   │   │   ├── high-pass-filter
│   │   │   ├── median-filter
│   │   │   ├── bias-estimation
│   │   │   ├── scale-factor-correction
│   │   │   └── sensor-normalization
│   │   │
│   │   ├── calibration/
│   │   │   ├── accelerometer-calibration
│   │   │   ├── gyroscope-calibration
│   │   │   ├── magnetometer-calibration
│   │   │   ├── sensor-axis-alignment
│   │   │   ├── device-orientation-estimation
│   │   │   ├── mounting-angle-estimation
│   │   │   └── temperature-dependent-calibration
│   │   │
│   │   ├── gnss-processing/
│   │   │   ├── satellite-detection
│   │   │   ├── constellation-classification
│   │   │   ├── NavIC-processing
│   │   │   ├── GPS-processing
│   │   │   ├── GLONASS-processing
│   │   │   ├── Galileo-processing
│   │   │   ├── BeiDou-processing
│   │   │   ├── C/N0-analysis
│   │   │   ├── HDOP-analysis
│   │   │   ├── VDOP-analysis
│   │   │   ├── PDOP-analysis
│   │   │   ├── satellite-count-analysis
│   │   │   ├── multipath-detection
│   │   │   ├── signal-quality-estimation
│   │   │   └── gnss-availability-classifier
│   │   │
│   │   ├── imu-dead-reckoning/
│   │   │   ├── acceleration-integration
│   │   │   ├── angular-rate-integration
│   │   │   ├── velocity-estimation
│   │   │   ├── displacement-estimation
│   │   │   ├── heading-estimation
│   │   │   ├── attitude-estimation
│   │   │   ├── bias-tracking
│   │   │   └── accumulated-drift-estimation
│   │   │
│   │   ├── fusion/
│   │   │   ├── state-vector/
│   │   │   │   ├── latitude
│   │   │   │   ├── longitude
│   │   │   │   ├── altitude
│   │   │   │   ├── velocity-x
│   │   │   │   ├── velocity-y
│   │   │   │   ├── velocity-z
│   │   │   │   ├── roll
│   │   │   │   ├── pitch
│   │   │   │   ├── yaw
│   │   │   │   ├── accelerometer-bias
│   │   │   │   └── gyroscope-bias
│   │   │   │
│   │   │   ├── ukf/
│   │   │   │   ├── sigma-point-generation
│   │   │   │   ├── prediction-step
│   │   │   │   ├── measurement-update
│   │   │   │   ├── covariance-update
│   │   │   │   ├── innovation-calculation
│   │   │   │   └── adaptive-noise-tuning
│   │   │   │
│   │   │   ├── sensor-weighting/
│   │   │   │   ├── gnss-weight
│   │   │   │   ├── imu-weight
│   │   │   │   ├── ai-speed-weight
│   │   │   │   ├── map-match-weight
│   │   │   │   ├── magnetic-weight
│   │   │   │   ├── optical-flow-weight
│   │   │   │   └── thermal-correction-weight
│   │   │   │
│   │   │   ├── adaptive-mode-controller/
│   │   │   │   ├── GNSS_NORMAL
│   │   │   │   ├── GNSS_DEGRADED
│   │   │   │   ├── GNSS_DENIED
│   │   │   │   ├── IMU_DR
│   │   │   │   ├── MAP_ASSISTED
│   │   │   │   ├── AI_ASSISTED
│   │   │   │   ├── MAGNETIC_ASSISTED
│   │   │   │   ├── OPTICAL_FLOW_ASSISTED
│   │   │   │   └── LOW_CONFIDENCE
│   │   │   │
│   │   │   └── confidence-engine/
│   │   │       ├── position-confidence
│   │   │       ├── velocity-confidence
│   │   │       ├── heading-confidence
│   │   │       ├── sensor-confidence
│   │   │       └── overall-navigation-confidence
│   │   │
│   │   ├── map-matching/
│   │   │   ├── road-network-loader
│   │   │   ├── candidate-road-generator
│   │   │   ├── distance-score
│   │   │   ├── heading-score
│   │   │   ├── velocity-score
│   │   │   ├── road-topology-score
│   │   │   ├── hmm-model
│   │   │   ├── viterbi-decoder
│   │   │   ├── lane-selection
│   │   │   └── matched-position-generator
│   │   │
│   │   ├── thermal-compensation/
│   │   │   ├── temperature-reader
│   │   │   ├── temperature-bias-model
│   │   │   ├── sensor-drift-estimator
│   │   │   ├── bias-correction
│   │   │   └── thermal-confidence
│   │   │
│   │   ├── magnetic-fingerprinting/
│   │   │   ├── magnetic-signal-reader
│   │   │   ├── magnetic-feature-extraction
│   │   │   ├── fingerprint-database
│   │   │   ├── sequence-matching
│   │   │   ├── magnetic-position-estimator
│   │   │   └── confidence-estimator
│   │   │
│   │   ├── optical-flow/
│   │   │   ├── camera-frame-capture
│   │   │   ├── frame-preprocessing
│   │   │   ├── feature-detection
│   │   │   ├── feature-tracking
│   │   │   ├── optical-flow-estimation
│   │   │   ├── ground-speed-estimation
│   │   │   ├── camera-motion-estimation
│   │   │   └── quality-estimation
│   │   │
│   │   ├── anomaly-detection/
│   │   │   ├── road-anomaly-detection
│   │   │   ├── pothole-detection
│   │   │   ├── speed-breaker-detection
│   │   │   ├── vibration-event-detection
│   │   │   ├── abnormal-acceleration-detection
│   │   │   └── anomaly-confidence
│   │   │
│   │   └── output/
│   │       ├── fused-position
│   │       ├── velocity
│   │       ├── heading
│   │       ├── confidence
│   │       ├── active-fusion-mode
│   │       ├── sensor-status
│   │       ├── drift-estimate
│   │       └── diagnostics-frame
│   │
│   │
│   ├── ml-training/                                  # Offline ML/AI training ecosystem
│   │   │
│   │   ├── data/
│   │   │   ├── raw/
│   │   │   │   ├── GNSS-logs/
│   │   │   │   ├── IMU-logs/
│   │   │   │   ├── camera-frames/
│   │   │   │   ├── magnetic-logs/
│   │   │   │   ├── thermal-logs/
│   │   │   │   ├── vehicle-speed-logs/
│   │   │   │   └── ground-truth-GPS/
│   │   │   │
│   │   │   ├── external/
│   │   │   │   ├── Decimeter-Challenge/
│   │   │   │   ├── public-road-datasets/
│   │   │   │   └── open-map-data/
│   │   │   │
│   │   │   ├── processed/
│   │   │   │   ├── synchronized-sensor-windows/
│   │   │   │   ├── normalized-data/
│   │   │   │   ├── labeled-data/
│   │   │   │   └── ground-truth-aligned-data/
│   │   │   │
│   │   │   ├── augmented/
│   │   │   │   ├── GNSS-outage/
│   │   │   │   ├── sensor-noise/
│   │   │   │   ├── vibration/
│   │   │   │   ├── temperature-drift/
│   │   │   │   ├── multipath/
│   │   │   │   └── missing-sensor/
│   │   │   │
│   │   │   └── splits/
│   │   │       ├── train/
│   │   │       ├── validation/
│   │   │       └── test/
│   │   │
│   │   ├── notebooks/
│   │   │   ├── eda.ipynb
│   │   │   ├── sensor_analysis.ipynb
│   │   │   ├── gnss_outage_analysis.ipynb
│   │   │   ├── drift_analysis.ipynb
│   │   │   ├── model_error_analysis.ipynb
│   │   │   ├── thermal_analysis.ipynb
│   │   │   ├── magnetic_analysis.ipynb
│   │   │   └── optical_flow_analysis.ipynb
│   │   │
│   │   ├── src/
│   │   │   ├── config.py
│   │   │   ├── dataset.py
│   │   │   ├── data_loader.py
│   │   │   ├── preprocessing.py
│   │   │   ├── normalization.py
│   │   │   ├── synchronization.py
│   │   │   ├── augmentation.py
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── model_speed_estimator.py
│   │   │   │   ├── model_road_anomaly.py
│   │   │   │   ├── model_thermal_compensator.py
│   │   │   │   ├── model_sensor_health.py
│   │   │   │   ├── model_gnss_quality.py
│   │   │   │   ├── model_drift_estimator.py
│   │   │   │   └── model_fusion_weight.py
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── imu_features.py
│   │   │   │   ├── gnss_features.py
│   │   │   │   ├── vibration_features.py
│   │   │   │   ├── thermal_features.py
│   │   │   │   ├── magnetic_features.py
│   │   │   │   └── optical_features.py
│   │   │   │
│   │   │   ├── training/
│   │   │   │   ├── train.py
│   │   │   │   ├── train_speed.py
│   │   │   │   ├── train_anomaly.py
│   │   │   │   ├── train_thermal.py
│   │   │   │   ├── train_drift.py
│   │   │   │   ├── hyperparameter_search.py
│   │   │   │   └── experiment_tracker.py
│   │   │   │
│   │   │   ├── calibration/
│   │   │   │   ├── calibrate.py
│   │   │   │   ├── sensor_alignment.py
│   │   │   │   ├── orientation_calibration.py
│   │   │   │   ├── bias_calibration.py
│   │   │   │   └── temperature_calibration.py
│   │   │   │
│   │   │   ├── evaluation/
│   │   │   │   ├── eval_drift_replay.py
│   │   │   │   ├── eval_position_error.py
│   │   │   │   ├── eval_velocity_error.py
│   │   │   │   ├── eval_heading_error.py
│   │   │   │   ├── eval_outage_duration.py
│   │   │   │   ├── eval_sensor_failure.py
│   │   │   │   ├── confusion_matrix.py
│   │   │   │   └── benchmark.py
│   │   │   │
│   │   │   └── export/
│   │   │       ├── export_tflite.py
│   │   │       ├── export_onnx.py
│   │   │       ├── quantize.py
│   │   │       ├── prune.py
│   │   │       └── model_metadata.py
│   │   │
│   │   ├── tests/
│   │   │   ├── test_dataset.py
│   │   │   ├── test_preprocessing.py
│   │   │   ├── test_augmentation.py
│   │   │   ├── test_speed_model.py
│   │   │   ├── test_anomaly_model.py
│   │   │   ├── test_thermal_model.py
│   │   │   ├── test_drift_model.py
│   │   │   └── test_export.py
│   │   │
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── models_output/
│   │       ├── speed_estimator/
│   │       │   ├── v1.tflite
│   │       │   └── metadata.json
│   │       ├── road_anomaly/
│   │       │   ├── v1.tflite
│   │       │   └── metadata.json
│   │       ├── thermal_compensator/
│   │       │   ├── v1.tflite
│   │       │   └── metadata.json
│   │       ├── sensor_health/
│   │       │   └── v1.tflite
│   │       └── drift_estimator/
│   │           └── v1.tflite
│   │
│   │
│   ├── backend/                                      # FastAPI cloud/support plane
│   │   │
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   ├── security.py
│   │   │   │   ├── logging.py
│   │   │   │   ├── exceptions.py
│   │   │   │   ├── constants.py
│   │   │   │   └── permissions.py
│   │   │   │
│   │   │   ├── middleware/
│   │   │   │   ├── rate_limiter.py
│   │   │   │   ├── request_logging.py
│   │   │   │   ├── authentication.py
│   │   │   │   ├── cors.py
│   │   │   │   ├── request_id.py
│   │   │   │   └── error_handler.py
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── deps.py
│   │   │   │   └── v1/
│   │   │   │       ├── router.py
│   │   │   │       │
│   │   │   │       ├── auth.py
│   │   │   │       │   ├── login
│   │   │   │       │   ├── register
│   │   │   │       │   ├── refresh-token
│   │   │   │       │   ├── logout
│   │   │   │       │   └── profile
│   │   │   │       │
│   │   │   │       ├── users.py
│   │   │   │       ├── devices.py
│   │   │   │       │   ├── register-device
│   │   │   │       │   ├── device-status
│   │   │   │       │   ├── device-config
│   │   │   │       │   └── device-health
│   │   │   │       │
│   │   │   │       ├── models.py
│   │   │   │       │   ├── latest-model
│   │   │   │       │   ├── model-manifest
│   │   │   │       │   ├── model-version
│   │   │   │       │   ├── model-download
│   │   │   │       │   └── model-validation
│   │   │   │       │
│   │   │   │       ├── telemetry.py
│   │   │   │       │   ├── session-create
│   │   │   │       │   ├── frame-upload
│   │   │   │       │   ├── batch-upload
│   │   │   │       │   ├── telemetry-status
│   │   │   │       │   └── session-finalize
│   │   │   │       │
│   │   │   │       ├── navigation.py
│   │   │   │       ├── map.py
│   │   │   │       │   ├── road-graph
│   │   │   │       │   ├── road-segments
│   │   │   │       │   ├── map-region
│   │   │   │       │   └── map-version
│   │   │   │       │
│   │   │   │       ├── anomalies.py
│   │   │   │       ├── sessions.py
│   │   │   │       ├── calibration.py
│   │   │   │       ├── diagnostics.py
│   │   │   │       └── health.py
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── auth_service.py
│   │   │   │   ├── user_service.py
│   │   │   │   ├── device_service.py
│   │   │   │   ├── model_registry_service.py
│   │   │   │   ├── model_validation_service.py
│   │   │   │   ├── model_delivery_service.py
│   │   │   │   ├── telemetry_service.py
│   │   │   │   ├── session_service.py
│   │   │   │   ├── navigation_service.py
│   │   │   │   ├── map_service.py
│   │   │   │   ├── road_graph_service.py
│   │   │   │   ├── anomaly_service.py
│   │   │   │   ├── calibration_service.py
│   │   │   │   ├── diagnostic_service.py
│   │   │   │   └── notification_service.py
│   │   │   │
│   │   │   ├── db/
│   │   │   │   ├── base.py
│   │   │   │   ├── session.py
│   │   │   │   └── models/
│   │   │   │       ├── user.py
│   │   │   │       ├── device.py
│   │   │   │       ├── vehicle.py
│   │   │   │       ├── model_version.py
│   │   │   │       ├── model_deployment.py
│   │   │   │       ├── navigation_session.py
│   │   │   │       ├── fused_frame.py
│   │   │   │       ├── sensor_frame.py
│   │   │   │       ├── gnss_frame.py
│   │   │   │       ├── anomaly.py
│   │   │   │       ├── calibration.py
│   │   │   │       ├── road_graph_region.py
│   │   │   │       ├── road_segment.py
│   │   │   │       ├── magnetic_fingerprint.py
│   │   │   │       └── device_health.py
│   │   │   │
│   │   │   ├── schemas/
│   │   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── device.py
│   │   │   ├── vehicle.py
│   │   │   ├── model.py
│   │   │   ├── telemetry.py
│   │   │   ├── session.py
│   │   │   ├── navigation.py
│   │   │   ├── map.py
│   │   │   ├── anomaly.py
│   │   │   └── diagnostics.py
│   │   │
│   │   ├── storage/
│   │   │   ├── object_storage_client.py
│   │   │   ├── model_storage.py
│   │   │   ├── telemetry_storage.py
│   │   │   ├── session_storage.py
│   │   │   └── map_storage.py
│   │   │
│   │   ├── cache/
│   │   │   ├── redis_client.py
│   │   │   ├── model_cache.py
│   │   │   ├── device_cache.py
│   │   │   ├── map_cache.py
│   │   │   └── rate_limit_cache.py
│   │   │
│   │   ├── realtime/
│   │   │   ├── telemetry_ws.py
│   │   │   ├── device_ws.py
│   │   │   └── admin_dashboard_ws.py
│   │   │
│   │   ├── workers/
│   │   │   ├── celery_app.py
│   │   │   ├── tasks_model_validation.py
│   │   │   ├── tasks_model_processing.py
│   │   │   ├── tasks_osm_preprocess.py
│   │   │   ├── tasks_map_generation.py
│   │   │   ├── tasks_drift_recompute.py
│   │   │   ├── tasks_telemetry_processing.py
│   │   │   └── tasks_cleanup.py
│   │   │
│   │   ├── observability/
│   │   │   ├── metrics.py
│   │   │   ├── tracing.py
│   │   │   ├── health_monitor.py
│   │   │   ├── performance_monitor.py
│   │   │   └── audit_logger.py
│   │   │
│   │   ├── security/
│   │   │   ├── jwt.py
│   │   │   ├── password_hashing.py
│   │   │   ├── device_auth.py
│   │   │   ├── api_keys.py
│   │   │   ├── encryption.py
│   │   │   └── audit.py
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.py
│   │   │   ├── hashing.py
│   │   │   ├── geo_utils.py
│   │   │   ├── serialization.py
│   │   │   ├── compression.py
│   │   │   └── timestamps.py
│   │   │
│   │   ├── migrations/
│   │   │   ├── env.py
│   │   │   └── versions/
│   │   │
│   │   ├── tests/
│   │   │   ├── conftest.py
│   │   │   ├── test_auth_api.py
│   │   │   ├── test_users_api.py
│   │   │   ├── test_devices_api.py
│   │   │   ├── test_models_api.py
│   │   │   ├── test_telemetry_api.py
│   │   │   ├── test_navigation_api.py
│   │   │   ├── test_map_api.py
│   │   │   ├── test_sessions_api.py
│   │   │   └── test_services.py
│   │   │
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── celery_worker_entrypoint.sh
│   │   └── alembic.ini
│   │
│   │
│   ├── database/
│   │   │
│   │   ├── schema.sql
│   │   ├── seed_data.sql
│   │   ├── indexes.sql
│   │   ├── extensions.sql
│   │   ├── functions.sql
│   │   ├── triggers.sql
│   │   │
│   │   ├── tables/
│   │   │   ├── users
│   │   │   ├── devices
│   │   │   ├── vehicles
│   │   │   ├── model_versions
│   │   │   ├── model_deployments
│   │   │   ├── navigation_sessions
│   │   │   ├── sensor_frames
│   │   │   ├── gnss_frames
│   │   │   ├── fused_frames
│   │   │   ├── anomalies
│   │   │   ├── calibration_profiles
│   │   │   ├── road_graph_regions
│   │   │   ├── road_segments
│   │   │   ├── magnetic_fingerprints
│   │   │   └── device_health
│   │   │
│   │   ├── indexes/
│   │   │   ├── session_time_index
│   │   │   ├── device_time_index
│   │   │   ├── geospatial_index
│   │   │   ├── model_version_index
│   │   │   └── road_segment_index
│   │   │
│   │   └── backups/
│   │       ├── scheduled-dumps/
│   │       └── recovery-scripts/
│   │
│   │
│   ├── maps/                                           # Geospatial/map intelligence layer
│   │   │
│   │   ├── raw/
│   │   │   ├── osm/
│   │   │   └── satellite/
│   │   │
│   │   ├── processed/
│   │   │   ├── road-network/
│   │   │   ├── road-segments/
│   │   │   ├── intersections/
│   │   │   ├── lanes/
│   │   │   ├── speed-limits/
│   │   │   └── landmarks/
│   │   │
│   │   ├── road-graph/
│   │   │   ├── nodes
│   │   │   ├── edges
│   │   │   ├── connectivity
│   │   │   ├── direction
│   │   │   └── topology
│   │   │
│   │   ├── tiles/
│   │   │   ├── vector-tiles/
│   │   │   └── offline-tiles/
│   │   │
│   │   └── map-matching/
│   │       ├── candidate-search
│   │       ├── road-scoring
│   │       └── route-projection
│   │
│   │
│   ├── simulation/                                    # GNSS-denied testing/simulation environment
│   │   │
│   │   ├── scenarios/
│   │   │   ├── normal-navigation
│   │   │   ├── partial-gnss-loss
│   │   │   ├── complete-gnss-loss
│   │   │   ├── urban-canyon
│   │   │   ├── tunnel
│   │   │   ├── bridge
│   │   │   ├── multipath
│   │   │   ├── imu-noise
│   │   │   ├── imu-bias
│   │   │   ├── sensor-failure
│   │   │   └── long-duration-outage
│   │   │
│   │   ├── generators/
│   │   │   ├── gnss-outage-generator
│   │   │   ├── imu-noise-generator
│   │   │   ├── vibration-generator
│   │   │   ├── thermal-drift-generator
│   │   │   └── sensor-dropout-generator
│   │   │
│   │   ├── replay/
│   │   │   ├── sensor-log-replay
│   │   │   ├── trajectory-replay
│   │   │   └── ground-truth-comparison
│   │   │
│   │   └── benchmarks/
│   │       ├── position-error
│   │       ├── drift-per-minute
│   │       ├── outage-survival
│   │       ├── recovery-time
│   │       └── confidence-accuracy
│   │
│   │
│   ├── model-registry/                                # ML model lifecycle and OTA management
│   │   │
│   │   ├── manifests/
│   │   │   ├── speed-estimator.json
│   │   │   ├── road-anomaly.json
│   │   │   ├── thermal-compensator.json
│   │   │   ├── sensor-health.json
│   │   │   └── drift-estimator.json
│   │   │
│   │   ├── versions/
│   │   ├── checksums/
│   │   ├── signatures/
│   │   ├── compatibility/
│   │   └── rollback/
│   │
│   │
│   ├── telemetry/                                     # Sensor/navigation data pipeline
│   │   │
│   │   ├── schemas/
│   │   │   ├── SensorFrame
│   │   │   ├── GnssFrame
│   │   │   ├── ImuFrame
│   │   │   ├── FusedFrame
│   │   │   ├── DiagnosticFrame
│   │   │   └── AnomalyFrame
│   │   │
│   │   ├── collectors/
│   │   │   ├── sensor-collector
│   │   │   ├── gnss-collector
│   │   │   ├── imu-collector
│   │   │   └── camera-collector
│   │   │
│   │   ├── buffering/
│   │   │   ├── memory-buffer
│   │   │   ├── persistent-buffer
│   │   │   └── offline-queue
│   │   │
│   │   ├── compression/
│   │   ├── batching/
│   │   ├── synchronization/
│   │   └── upload/
│   │       ├── online-upload
│   │       ├── retry
│   │       ├── exponential-backoff
│   │       └── resumable-upload
│   │
│   │
│   ├── infra/
│   │   │
│   │   ├── docker/
│   │   │   ├── backend.Dockerfile
│   │   │   ├── ml.Dockerfile
│   │   │   ├── postgres.Dockerfile
│   │   │   └── nginx.Dockerfile
│   │   │
│   │   ├── docker-compose.yml
│   │   │
│   │   ├── kubernetes/
│   │   │   ├── namespace.yaml
│   │   │   ├── backend-deployment.yaml
│   │   │   ├── backend-service.yaml
│   │   │   ├── worker-deployment.yaml
│   │   │   ├── postgres-statefulset.yaml
│   │   │   ├── redis-deployment.yaml
│   │   │   ├── ingress.yaml
│   │   │   ├── configmap.yaml
│   │   │   └── secrets.yaml
│   │   │
│   │   ├── terraform/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   ├── outputs.tf
│   │   │   ├── networking.tf
│   │   │   ├── database.tf
│   │   │   └── storage.tf
│   │   │
│   │   ├── monitoring/
│   │   │   ├── prometheus.yml
│   │   │   ├── alertmanager.yml
│   │   │   ├── grafana-dashboards/
│   │   │   │   ├── api-performance.json
│   │   │   │   ├── device-health.json
│   │   │   │   ├── navigation-quality.json
│   │   │   │   ├── model-performance.json
│   │   │   │   └── infrastructure.json
│   │   │   └── loki/
│   │   │
│   │   ├── nginx/
│   │   │   ├── nginx.conf
│   │   │   └── ssl/
│   │   │
│   │   └── scripts/
│   │       ├── deploy.sh
│   │       ├── migrate.sh
│   │       ├── backup.sh
│   │       ├── restore.sh
│   │       └── health-check.sh
│   │
│   │
│   ├── testing/
│   │   │
│   │   ├── unit/
│   │   │   ├── fusion-tests
│   │   │   ├── sensor-tests
│   │   │   ├── map-matching-tests
│   │   │   └── model-tests
│   │   │
│   │   ├── integration/
│   │   │   ├── frontend-backend
│   │   │   ├── native-js-bridge
│   │   │   ├── backend-database
│   │   │   └── model-inference
│   │   │
│   │   ├── system/
│   │   │   ├── gnss-denied-navigation
│   │   │   ├── sensor-failure
│   │   │   ├── model-failure
│   │   │   └── offline-mode
│   │   │
│   │   ├── performance/
│   │   │   ├── inference-latency
│   │   │   ├── sensor-throughput
│   │   │   ├── battery-usage
│   │   │   ├── memory-usage
│   │   │   └── thermal-load
│   │   │
│   │   └── e2e/
│   │       ├── onboarding
│   │       ├── device-pairing
│   │       ├── navigation-session
│   │       ├── gnss-outage
│   │       ├── session-recording
│   │       └── model-update
│   │
│   │
│   ├── security/
│   │   ├── authentication
│   │   ├── authorization
│   │   ├── device-identity
│   │   ├── api-security
│   │   ├── encryption
│   │   ├── secure-model-delivery
│   │   ├── model-signature-validation
│   │   ├── audit-logging
│   │   └── vulnerability-scanning
│   │
│   │
│   ├── docs/
│   │   ├── system-overview.md
│   │   ├── architecture.md
│   │   ├── frontend-architecture.md
│   │   ├── positioning-engine.md
│   │   ├── sensor-fusion.md
│   │   ├── ml-architecture.md
│   │   ├── backend-architecture.md
│   │   ├── database-schema.md
│   │   ├── map-matching.md
│   │   ├── telemetry-protocol.md
│   │   ├── model-ota.md
│   │   ├── api-reference.md
│   │   ├── deployment.md
│   │   ├── testing-strategy.md
│   │   ├── security.md
│   │   │
│   │   ├── diagrams/
│   │   │   ├── system-context
│   │   │   ├── data-flow
│   │   │   ├── sensor-fusion
│   │   │   ├── ml-pipeline
│   │   │   ├── backend
│   │   │   └── deployment
│   │   │
│   │   └── adr/
│   │       ├── 0001-why-ukf-over-ekf.md
│   │       ├── 0002-native-bridge.md
│   │       ├── 0003-react-native.md
│   │       ├── 0004-on-device-inference.md
│   │       ├── 0005-offline-first-navigation.md
│   │       └── 0006-adaptive-sensor-fusion.md
│   │
│   └── scripts/
│       ├── setup-development.sh
│       ├── setup-mobile.sh
│       ├── setup-backend.sh
│       ├── setup-ml.sh
│       ├── download-map-data.sh
│       ├── prepare-dataset.py
│       ├── run-simulation.py
│       ├── replay-session.py
│       └── benchmark-system.py
```
