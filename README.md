```text
SIH26168 — INTELLIGENT DEAD RECKONING SYSTEM
│
├── project-root/
│   │
│   ├── README.md
│   ├── LICENSE
│   ├── .gitignore
│   ├── .env.example
│   ├── pubspec.yaml
│   ├── analysis_options.yaml
│   ├── CMakeLists.txt
│   ├── Makefile
│   ├── docker-compose.yml
│   │
│   ├── .github/
│   │   └── workflows/
│   │       ├── flutter_ci.yml
│   │       ├── cpp_ci.yml
│   │       ├── ml_ci.yml
│   │       ├── integration_tests.yml
│   │       └── release.yml
│   │
│   │
│   ├── mobile/
│   │   │
│   │   ├── pubspec.yaml
│   │   │
│   │   ├── assets/
│   │   │   ├── icons/
│   │   │   ├── images/
│   │   │   ├── maps/
│   │   │   ├── models/
│   │   │   │   ├── speed_estimator.tflite
│   │   │   │   ├── motion_classifier.tflite
│   │   │   │   ├── vibration_filter.tflite
│   │   │   │   └── drift_estimator.tflite
│   │   │   └── configurations/
│   │   │       ├── sensor_config.json
│   │   │       ├── fusion_config.json
│   │   │       └── map_matching_config.json
│   │   │
│   │   ├── lib/
│   │   │   │
│   │   │   ├── main.dart
│   │   │   │
│   │   │   ├── app/
│   │   │   │   ├── app.dart
│   │   │   │   ├── app_config.dart
│   │   │   │   ├── app_constants.dart
│   │   │   │   └── app_lifecycle.dart
│   │   │   │
│   │   │   ├── routing/
│   │   │   │   ├── app_router.dart
│   │   │   │   └── route_names.dart
│   │   │   │
│   │   │   ├── screens/
│   │   │   │   │
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── onboarding_screen.dart
│   │   │   │   │   └── permissions_screen.dart
│   │   │   │   │
│   │   │   │   ├── device_setup/
│   │   │   │   │   ├── device_setup_screen.dart
│   │   │   │   │   ├── sensor_check_screen.dart
│   │   │   │   │   └── device_capability_screen.dart
│   │   │   │   │
│   │   │   │   ├── calibration/
│   │   │   │   │   ├── calibration_screen.dart
│   │   │   │   │   ├── alignment_screen.dart
│   │   │   │   │   ├── calibration_progress.dart
│   │   │   │   │   └── calibration_result.dart
│   │   │   │   │
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── navigation_screen.dart
│   │   │   │   │   ├── map_screen.dart
│   │   │   │   │   ├── position_overlay.dart
│   │   │   │   │   └── navigation_status.dart
│   │   │   │   │
│   │   │   │   ├── gnss/
│   │   │   │   │   ├── gnss_status_screen.dart
│   │   │   │   │   ├── satellite_view.dart
│   │   │   │   │   └── signal_quality_view.dart
│   │   │   │   │
│   │   │   │   ├── dead_reckoning/
│   │   │   │   │   ├── dr_status_screen.dart
│   │   │   │   │   ├── drift_view.dart
│   │   │   │   │   └── confidence_view.dart
│   │   │   │   │
│   │   │   │   ├── diagnostics/
│   │   │   │   │   ├── diagnostics_screen.dart
│   │   │   │   │   ├── sensor_diagnostics.dart
│   │   │   │   │   ├── fusion_diagnostics.dart
│   │   │   │   │   └── performance_diagnostics.dart
│   │   │   │   │
│   │   │   │   ├── sessions/
│   │   │   │   │   ├── session_list_screen.dart
│   │   │   │   │   ├── session_detail_screen.dart
│   │   │   │   │   └── replay_screen.dart
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       ├── settings_screen.dart
│   │   │   │       ├── sensor_settings.dart
│   │   │   │       ├── navigation_settings.dart
│   │   │   │       └── model_settings.dart
│   │   │   │
│   │   │   ├── widgets/
│   │   │   │   ├── common/
│   │   │   │   ├── navigation/
│   │   │   │   ├── calibration/
│   │   │   ├── gnss/
│   │   │   ├── dead_reckoning/
│   │   │   ├── ai/
│   │   │   ├── outage/
│   │   │   ├── diagnostics/
│   │   │   └── charts/
│   │   │
│   │   ├── features/
│   │   │   │
│   │   │   ├── sensor_acquisition/
│   │   │   │   ├── accelerometer_service.dart
│   │   │   │   ├── gyroscope_service.dart
│   │   │   │   ├── magnetometer_service.dart
│   │   │   │   ├── barometer_service.dart
│   │   │   │   ├── device_motion_service.dart
│   │   │   │   └── sensor_stream_manager.dart
│   │   │   │
│   │   │   ├── gnss/
│   │   │   │   ├── gnss_service.dart
│   │   │   │   ├── location_stream.dart
│   │   │   │   ├── gnss_quality.dart
│   │   │   │   ├── satellite_state.dart
│   │   │   │   └── gnss_outage_detector.dart
│   │   │   │
│   │   │   ├── alignment/
│   │   │   │   ├── phone_orientation.dart
│   │   │   ├── vehicle_heading.dart
│   │   │   ├── placement_detection.dart
│   │   │   ├── pitch_roll_estimator.dart
│   │   │   └── yaw_alignment.dart
│   │   │
│   │   ├── navigation/
│   │   │   ├── navigation_controller.dart
│   │   │   ├── position_stream.dart
│   │   │   ├── heading_stream.dart
│   │   │   └── navigation_state.dart
│   │   │
│   │   ├── ai/
│   │   │   ├── tflite_runtime.dart
│   │   │   ├── speed_estimator.dart
│   │   │   ├── acceleration_estimator.dart
│   │   │   ├── vibration_classifier.dart
│   │   │   ├── motion_classifier.dart
│   │   │   └── drift_predictor.dart
│   │   │
│   │   ├── dead_reckoning/
│   │   │   ├── dr_controller.dart
│   │   │   ├── dr_state.dart
│   │   │   ├── dr_position.dart
│   │   │   └── drift_monitor.dart
│   │   │
│   │   ├── fusion/
│   │   │   ├── fusion_controller.dart
│   │   │   ├── fusion_state.dart
│   │   │   └── adaptive_weighting.dart
│   │   │
│   │   └── map_matching/
│   │       ├── map_match_controller.dart
│   │       ├── road_candidate.dart
│   │       ├── road_constraint.dart
│   │       └── lane_candidate.dart
│   │
│   │
│   ├── flutter_core/
│   │   │
│   │   ├── data/
│   │   │   ├── sensor_frame.dart
│   │   │   ├── gnss_frame.dart
│   │   │   ├── fused_frame.dart
│   │   │   ├── navigation_state.dart
│   │   │   └── outage_event.dart
│   │   │
│   │   ├── acquisition/
│   │   │   ├── sensor_stream_manager.dart
│   │   │   ├── gnss_stream_manager.dart
│   │   │   ├── timestamp_manager.dart
│   │   │   ├── sampling_manager.dart
│   │   │   └── sensor_health_manager.dart
│   │   │
│   │   ├── preprocessing/
│   │   │   ├── normalization.dart
│   │   │   ├── filtering.dart
│   │   │   ├── outlier_removal.dart
│   │   │   └── synchronization.dart
│   │   │
│   │   ├── local_storage/
│   │   │   ├── database.dart
│   │   │   ├── session_repository.dart
│   │   │   ├── sensor_repository.dart
│   │   │   └── model_repository.dart
│   │   │
│   │   └── communication/
│   │       ├── cpp_ffi_bridge.dart
│   │       ├── native_buffer.dart
│   │       ├── sensor_buffer.dart
│   │       └── result_decoder.dart
│   │
│   │
│   ├── cpp-core/
│   │   │
│   │   ├── CMakeLists.txt
│   │   │
│   │   ├── include/
│   │   │   ├── sensors/
│   │   │   │   ├── sensor_frame.hpp
│   │   │   │   ├── imu_data.hpp
│   │   │   │   ├── gnss_data.hpp
│   │   │   │   └── sensor_state.hpp
│   │   │   │
│   │   │   ├── preprocessing/
│   │   │   │   ├── low_pass_filter.hpp
│   │   │   │   ├── high_pass_filter.hpp
│   │   │   │   ├── butterworth.hpp
│   │   │   │   ├── kalman_filter.hpp
│   │   │   │   └── outlier_detector.hpp
│   │   │   │
│   │   │   ├── alignment/
│   │   │   │   ├── vehicle_frame.hpp
│   │   │   │   ├── phone_frame.hpp
│   │   │   │   ├── orientation_estimator.hpp
│   │   │   │   ├── rotation_matrix.hpp
│   │   │   │   └── alignment_engine.hpp
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── imu_integrator.hpp
│   │   │   │   ├── inertial_navigation.hpp
│   │   │   │   ├── dead_reckoning.hpp
│   │   │   │   ├── heading_estimator.hpp
│   │   │   │   └── position_estimator.hpp
│   │   │   │
│   │   │   ├── fusion/
│   │   │   │   ├── ekf.hpp
│   │   │   │   ├── ukf.hpp
│   │   │   │   ├── state_vector.hpp
│   │   │   │   ├── covariance.hpp
│   │   │   │   ├── measurement_model.hpp
│   │   │   │   └── adaptive_fusion.hpp
│   │   │   │
│   │   │   ├── gnss/
│   │   │   │   ├── gnss_processor.hpp
│   │   │   │   ├── position_quality.hpp
│   │   │   │   ├── velocity_processor.hpp
│   │   │   │   ├── heading_processor.hpp
│   │   │   │   ├── outage_detector.hpp
│   │   │   │   └── recovery_detector.hpp
│   │   │   │
│   │   │   ├── map_matching/
│   │   │   │   ├── road_graph.hpp
│   │   │   │   ├── road_segment.hpp
│   │   │   │   ├── candidate_generator.hpp
│   │   │   │   ├── hmm_matcher.hpp
│   │   │   │   ├── map_matcher.hpp
│   │   │   │   └── lane_matcher.hpp
│   │   │   │
│   │   │   ├── kinematics/
│   │   │   │   ├── vehicle_model.hpp
│   │   │   │   ├── speed_constraint.hpp
│   │   │   │   ├── acceleration_constraint.hpp
│   │   │   │   ├── turn_constraint.hpp
│   │   │   │   ├── lane_constraint.hpp
│   │   │   │   └── motion_constraint_engine.hpp
│   │   │   │
│   │   │   ├── signal_processing/
│   │   │   │   ├── vibration_filter.hpp
│   │   │   │   ├── engine_idle_detector.hpp
│   │   │   │   ├── pothole_detector.hpp
│   │   │   │   ├── road_noise_detector.hpp
│   │   │   │   ├── phone_motion_detector.hpp
│   │   │   │   └── adaptive_filter.hpp
│   │   │   │
│   │   │   ├── uncertainty/
│   │   │   │   ├── covariance_estimator.hpp
│   │   │   │   ├── drift_estimator.hpp
│   │   │   │   ├── confidence_engine.hpp
│   │   │   │   └── integrity_monitor.hpp
│   │   │   │
│   │   │   └── engine/
│   │   │       ├── idr_engine.hpp
│   │   │       ├── processing_pipeline.hpp
│   │   │       ├── state_manager.hpp
│   │   │       └── real_time_scheduler.hpp
│   │   │
│   │   ├── src/
│   │   │   ├── sensors/
│   │   │   ├── preprocessing/
│   │   │   ├── alignment/
│   │   │   ├── navigation/
│   │   │   ├── fusion/
│   │   │   ├── gnss/
│   │   │   ├── map_matching/
│   │   │   ├── kinematics/
│   │   │   ├── signal_processing/
│   │   │   ├── uncertainty/
│   │   │   └── engine/
│   │   │
│   │   ├── ffi/
│   │   │   ├── idr_api.cpp
│   │   │   ├── sensor_api.cpp
│   │   │   ├── navigation_api.cpp
│   │   │   ├── fusion_api.cpp
│   │   │   ├── calibration_api.cpp
│   │   │   └── result_api.cpp
│   │   │
│   │   └── tests/
│   │       ├── alignment_tests.cpp
│   │       ├── fusion_tests.cpp
│   │       ├── dr_tests.cpp
│   │       ├── map_matching_tests.cpp
│   │       ├── kinematic_tests.cpp
│   │       └── signal_processing_tests.cpp
│   │
│   │
│   ├── ml/
│   │   │
│   │   ├── data/
│   │   │   ├── raw/
│   │   │   ├── synchronized/
│   │   │   ├── processed/
│   │   │   ├── labeled/
│   │   │   └── synthetic/
│   │   │
│   │   ├── preprocessing/
│   │   │   ├── synchronize.py
│   │   │   ├── clean.py
│   │   │   ├── normalize.py
│   │   │   └── feature_engineering.py
│   │   │
│   │   ├── augmentation/
│   │   │   ├── sensor_noise.py
│   │   │   ├── vibration.py
│   │   │   ├── pothole.py
│   │   │   ├── phone_movement.py
│   │   │   ├── orientation_variation.py
│   │   │   └── gnss_outage.py
│   │   │
│   │   ├── models/
│   │   │   ├── speed_estimation/
│   │   │   │   ├── network.py
│   │   │   │   ├── dataset.py
│   │   │   │   └── train.py
│   │   │   │
│   │   │   ├── acceleration_estimation/
│   │   │   ├── vibration_filter/
│   │   │   ├── motion_classification/
│   │   │   ├── drift_prediction/
│   │   │   └── sensor_quality/
│   │   │
│   │   ├── training/
│   │   │   ├── train.py
│   │   │   ├── validate.py
│   │   │   ├── hyperparameter_search.py
│   │   │   └── experiment_tracking.py
│   │   │
│   │   ├── calibration/
│   │   │   ├── model_calibration.py
│   │   │   ├── quantization.py
│   │   │   └── pruning.py
│   │   │
│   │   ├── evaluation/
│   │   │   ├── speed_error.py
│   │   │   ├── acceleration_error.py
│   │   │   ├── drift_error.py
│   │   │   ├── outage_accuracy.py
│   │   │   └── lane_accuracy.py
│   │   │
│   │   ├── export/
│   │   │   ├── export_tflite.py
│   │   │   ├── quantize_tflite.py
│   │   │   └── validate_mobile_model.py
│   │   │
│   │   └── replay/
│   │       ├── sensor_replay.py
│   │       ├── gnss_outage_replay.py
│   │       └── trajectory_replay.py
│   │
│   │
│   ├── edge-engine/
│   │   │
│   │   ├── sensor-ingestion/
│   │   │   ├── accelerometer/
│   │   │   ├── gyroscope/
│   │   │   ├── magnetometer/
│   │   │   ├── barometer/
│   │   │   └── gnss/
│   │   │
│   │   ├── timestamp-synchronization/
│   │   │   ├── clock-alignment/
│   │   │   ├── sensor-timestamps/
│   │   │   └── interpolation/
│   │   │
│   │   ├── sensor-preprocessing/
│   │   │   ├── calibration/
│   │   │   ├── filtering/
│   │   │   ├── bias-estimation/
│   │   │   └── outlier-rejection/
│   │   │
│   │   ├── in-vehicle-alignment/
│   │   │   ├── phone-orientation/
│   │   │   ├── vehicle-frame/
│   │   │   ├── pitch-estimation/
│   │   │   ├── roll-estimation/
│   │   │   ├── yaw-estimation/
│   │   │   ├── heading-alignment/
│   │   │   └── placement-invariance/
│   │   │
│   │   ├── ai-speed-vibration/
│   │   │   ├── speed-estimation/
│   │   │   ├── acceleration-estimation/
│   │   │   ├── engine-idle-detection/
│   │   │   ├── pothole-detection/
│   │   │   ├── road-noise-filter/
│   │   │   ├── phone-motion-filter/
│   │   │   └── motion-classification/
│   │   │
│   │   ├── gnss-processing/
│   │   │   ├── position/
│   │   │   ├── velocity/
│   │   │   ├── heading/
│   │   │   ├── accuracy/
│   │   │   ├── signal-quality/
│   │   │   └── validity/
│   │   │
│   │   ├── inertial-navigation/
│   │   │   ├── imu-integration/
│   │   │   ├── attitude/
│   │   │   ├── velocity/
│   │   │   ├── position/
│   │   │   └── drift/
│   │   │
│   │   ├── intelligent-dead-reckoning/
│   │   │   ├── position-propagation/
│   │   │   ├── heading-propagation/
│   │   │   ├── speed-propagation/
│   │   │   ├── acceleration-propagation/
│   │   │   └── uncertainty-propagation/
│   │   │
│   │   ├── gnss-ins-fusion/
│   │   │   ├── state-estimation/
│   │   │   ├── ukf/
│   │   │   ├── adaptive-weighting/
│   │   │   ├── measurement-update/
│   │   │   ├── prediction-update/
│   │   │   └── covariance-management/
│   │   │
│   │   ├── gnss-deficit-handler/
│   │   │   ├── gnss-quality-monitor/
│   │   │   ├── outage-detection/
│   │   │   ├── transition-manager/
│   │   │   ├── pure-dr-mode/
│   │   │   ├── recovery-detection/
│   │   │   ├── re-alignment/
│   │   │   └── smooth-state-correction/
│   │   │
│   │   ├── map-matching/
│   │   │   ├── road-network/
│   │   │   ├── candidate-generation/
│   │   │   ├── hmm/
│   │   │   ├── geometric-matching/
│   │   │   ├── trajectory-matching/
│   │   │   └── lane-matching/
│   │   │
│   │   ├── kinematic-constraints/
│   │   │   ├── speed/
│   │   │   ├── acceleration/
│   │   │   ├── braking/
│   │   │   ├── turning/
│   │   │   ├── lane/
│   │   │   └── vehicle-motion/
│   │   │
│   │   ├── lane-level-positioning/
│   │   │   ├── lane-candidate/
│   │   │   ├── lane-probability/
│   │   │   ├── lane-transition/
│   │   │   └── lane-confidence/
│   │   │
│   │   ├── confidence-engine/
│   │   │   ├── position-confidence/
│   │   │   ├── heading-confidence/
│   │   │   ├── speed-confidence/
│   │   │   ├── drift-confidence/
│   │   │   └── integrity-monitor/
│   │   │
│   │   ├── model-runtime/
│   │   │   ├── tflite/
│   │   │   ├── model-loader/
│   │   │   ├── inference-manager/
│   │   │   └── model-versioning/
│   │   │
│   │   └── offline-navigation/
│   │       ├── local-map/
│   │       ├── offline-routing/
│   │       ├── offline-map-matching/
│   │       └── offline-session/
│   │
│   │
│   ├── maps/
│   │   ├── road-network/
│   │   ├── road-segments/
│   │   ├── lane-network/
│   │   ├── map-tiles/
│   │   ├── offline-maps/
│   │   └── map-matching-data/
│   │
│   │
│   ├── simulation/
│   │   │
│   │   ├── scenarios/
│   │   │   ├── open-road/
│   │   │   ├── tunnel/
│   │   │   ├── underpass/
│   │   │   ├── multi-level-parking/
│   │   │   ├── dense-urban-canyon/
│   │   │   ├── forest/
│   │   │   └── highway/
│   │   │
│   │   ├── gnss-outage/
│   │   │   ├── complete-outage/
│   │   │   ├── intermittent-outage/
│   │   │   ├── degraded-signal/
│   │   │   └── recovery/
│   │   │
│   │   ├── sensor-noise/
│   │   │   ├── accelerometer-noise/
│   │   │   ├── gyro-noise/
│   │   │   ├── magnetometer-noise/
│   │   │   ├── vibration/
│   │   │   └── phone-motion/
│   │   │
│   │   ├── phone-placement/
│   │   │   ├── dashboard/
│   │   │   ├── windshield/
│   │   │   ├── holder/
│   │   │   ├── pocket/
│   │   │   └── arbitrary-orientation/
│   │   │
│   │   └── benchmarks/
│   │       ├── position-error/
│   │       ├── drift-rate/
│   │       ├── speed-error/
│   │       ├── heading-error/
│   │       ├── lane-accuracy/
│   │       └── recovery-time/
│   │
│   │
│   ├── backend/
│   │   │
│   │   ├── README.md
│   │   │
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   │
│   │   │   ├── core/
│   │   │   │   ├── config.py
│   │   │   │   ├── security.py
│   │   │   │   ├── logging.py
│   │   │   │   └── dependencies.py
│   │   │   │
│   │   │   ├── api/
│   │   │   │   └── v1/
│   │   │   │       ├── sessions.py
│   │   │   │       ├── devices.py
│   │   │   │       ├── models.py
│   │   │   │       ├── telemetry.py
│   │   │   │       ├── maps.py
│   │   │   │       └── diagnostics.py
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── session_service.py
│   │   │   │   ├── telemetry_service.py
│   │   │   │   ├── model_service.py
│   │   │   │   ├── map_service.py
│   │   │   │   └── analytics_service.py
│   │   │   │
│   │   │   ├── workers/
│   │   │   │   ├── telemetry_worker.py
│   │   │   ├── analytics_worker.py
│   │   │   └── model_worker.py
│   │   │
│   │   └── tests/
│   │
│   │
│   ├── database/
│   │   │
│   │   ├── migrations/
│   │   ├── schema/
│   │   ├── indexes/
│   │   │
│   │   ├── tables/
│   │   │   ├── users
│   │   │   ├── devices
│   │   │   ├── sessions
│   │   │   ├── sensor_frames
│   │   │   ├── gnss_frames
│   │   │   ├── fused_frames
│   │   │   ├── outage_events
│   │   │   ├── calibration_profiles
│   │   │   ├── model_versions
│   │   │   ├── road_regions
│   │   │   ├── road_segments
│   │   │   └── anomaly_events
│   │   │
│   │   └── spatial/
│   │       ├── postgis/
│   │       ├── road_geometry/
│   │       └── lane_geometry/
│   │
│   │
│   ├── telemetry/
│   │   ├── session-recorder/
│   │   ├── sensor-logs/
│   │   ├── gnss-logs/
│   │   ├── fusion-logs/
│   │   ├── outage-logs/
│   │   ├── performance-logs/
│   │   └── crash-reports/
│   │
│   │
│   ├── tests/
│   │   │
│   │   ├── flutter/
│   │   │   ├── widget/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   │
│   │   ├── cpp/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── stress/
│   │   │
│   │   ├── ai/
│   │   │   ├── inference/
│   │   │   ├── robustness/
│   │   │   └── accuracy/
│   │   │
│   │   ├── system/
│   │   │   ├── sensor-to-position/
│   │   │   ├── gnss-to-dr/
│   │   │   ├── dr-to-gnss/
│   │   │   └── end-to-end/
│   │   │
│   │   └── field/
│   │       ├── tunnel/
│   │       ├── parking/
│   │       ├── forest/
│   │       ├── urban/
│   │       └── highway/
│   │
│   │
│   ├── infra/
│   │   ├── docker/
│   │   │   ├── backend.Dockerfile
│   │   │   ├── ml.Dockerfile
│   │   │   └── database.Dockerfile
│   │   │
│   │   ├── kubernetes/
│   │   │   ├── backend/
│   │   │   ├── workers/
│   │   │   ├── database/
│   │   │   └── monitoring/
│   │   │
│   │   ├── redis/
│   │   ├── object-storage/
│   │   ├── monitoring/
│   │   │   ├── prometheus/
│   │   │   ├── grafana/
│   │   │   └── opentelemetry/
│   │   └── terraform/
│   │
│   │
│   ├── docs/
│   │   │
│   │   ├── architecture/
│   │   │   ├── system-architecture.md
│   │   │   ├── flutter-architecture.md
│   │   │   ├── cpp-core-architecture.md
│   │   │   ├── data-flow.md
│   │   │   ├── fusion-flow.md
│   │   │   └── outage-flow.md
│   │   │
│   │   ├── algorithms/
│   │   │   ├── inertial-navigation.md
│   │   │   ├── ukf.md
│   │   │   ├── map-matching.md
│   │   │   ├── kinematic-constraints.md
│   │   │   └── dead-reckoning.md
│   │   │
│   │   ├── ai/
│   │   │   ├── speed-estimation.md
│   │   │   ├── vibration-filtering.md
│   │   │   ├── motion-classification.md
│   │   │   └── model-deployment.md
│   │   │
│   │   ├── testing/
│   │   │   ├── test-plan.md
│   │   │   ├── benchmark-protocol.md
│   │   │   └── field-test-plan.md
│   │   │
│   │   └── deployment/
│   │       ├── build.md
│   │       ├── release.md
│   │       └── model-update.md
│   │
│   │
│   └── scripts/
│       ├── setup.sh
│       ├── build_cpp.sh
│       ├── build_flutter.sh
│       ├── train_models.sh
│       ├── export_models.sh
│       ├── run_simulation.sh
│       └── run_benchmarks.sh
│
│
└── REAL-TIME EDGE PIPELINE
    │
    ├── Smartphone Sensors
    │   ├── Accelerometer
    │   ├── Gyroscope
    │   ├── Magnetometer
    │   └── GNSS
    │
    ▼
    Flutter Sensor Acquisition
    │
    ├── Sensor Streams
    ├── GNSS Stream
    ├── Timestamping
    └── Data Buffering
    │
    ▼
    Sensor Synchronization
    │
    ▼
    Sensor Preprocessing
    │
    ├── Noise Filtering
    ├── Bias Estimation
    ├── Outlier Rejection
    └── Signal Normalization
    │
    ▼
    In-Vehicle Alignment
    │
    ├── Phone Orientation
    ├── Vehicle Coordinate Frame
    ├── Pitch
    ├── Roll
    └── Yaw
    │
    ▼
    AI Motion Processing
    │
    ├── Speed Estimation
    ├── Acceleration Estimation
    ├── Engine Vibration Detection
    ├── Pothole Detection
    ├── Road Noise Filtering
    └── Phone Movement Detection
    │
    ▼
    GNSS + IMU Processing
    │
    ├── GNSS Position
    ├── GNSS Velocity
    ├── GNSS Quality
    ├── IMU Integration
    └── INS State
    │
    ▼
    Intelligent Fusion Engine
    │
    ├── UKF
    ├── Adaptive Measurement Weighting
    ├── State Prediction
    └── State Correction
    │
    ▼
    GNSS Deficit Handler
    │
    ├── GNSS Healthy
    │       └── GNSS + INS Mode
    │
    ├── GNSS Degraded
    │       └── Adaptive Fusion
    │
    ├── GNSS Lost
    │       └── Intelligent Dead Reckoning
    │
    └── GNSS Recovered
            └── Smooth Re-Aiding
    │
    ▼
    Map Matching
    │
    ├── Road Candidate Generation
    ├── HMM Matching
    ├── Geometric Matching
    └── Lane Matching
    │
    ▼
    Kinematic Constraints
    │
    ├── Vehicle Speed
    ├── Acceleration
    ├── Turning
    ├── Lane
    └── Vehicle Motion
    │
    ▼
    Position + Heading + Speed
    │
    ▼
    Confidence / Integrity Engine
    │
    ├── Position Confidence
    ├── Drift Estimate
    ├── Heading Confidence
    └── Lane Confidence
    │
    ▼
    Flutter Navigation Interface
    │
    ├── Vehicle Position
    ├── Route
    ├── GNSS Status
    ├── DR Status
    ├── Accuracy
    └── Confidence
```

### TECHNOLOGY BOUNDARY

```text
┌─────────────────────────────────────────────────────────────┐
│                       FLUTTER / DART                        │
│                                                             │
│  UI • Sensor Acquisition • GNSS • State • Storage • Maps   │
│  TFLite Inference • Session Management • Visualization     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                       DART FFI
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         C++ CORE                            │
│                                                             │
│  Sensor Processing • INS • UKF • Fusion • DR              │
│  Alignment • Map Matching • Kinematics • Uncertainty      │
│  Real-Time Navigation Pipeline                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       AI MODELS                             │
│                                                             │
│  TensorFlow Lite • Speed • Acceleration • Vibration        │
│  Motion Classification • Drift / Sensor Quality            │
└─────────────────────────────────────────────────────────────┘


                    SUPPORT PLANE
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                               │
│                                                             │
│  Sessions • Telemetry • Model Registry • Analytics         │
│  Map Data • User/Device Data • Experiment Data             │
│                                                             │
│       NOTE: NOT PART OF REAL-TIME POSITIONING LOOP         │
└─────────────────────────────────────────────────────────────┘
```

### PLATFORM RULE

```text
THIS PROJECT DOES NOT CONTAIN:

❌ Kotlin
❌ Android Studio
❌ Android-native application layer
❌ Kotlin Platform Channels
❌ Java Android business logic

THIS PROJECT USES:

✅ Flutter
✅ Dart
✅ Flutter sensor/GNSS plugins
✅ Dart FFI
✅ C++
✅ TensorFlow Lite
✅ Python for ML training
✅ Local/offline processing
```

### CORE DESIGN PRINCIPLE

```text
                    GNSS AVAILABLE
                          │
                          ▼
                 GNSS + INS FUSION
                          │
                          ▼
                    BEST POSITION
                          │
                    GNSS LOST
                          ▼
             ┌──────────────────────┐
             │ Intelligent DR Mode  │
             │                      │
             │ IMU + AI Speed       │
             │ + AI Acceleration    │
             │ + UKF                │
             │ + Map Matching       │
             │ + Kinematic Model    │
             └──────────┬───────────┘
                        │
                        ▼
                 CONTINUE POSITION
                        │
                  GNSS RETURNS
                        ▼
             ┌──────────────────────┐
             │ Smooth Re-Aiding     │
             │                      │
             │ DR State             │
             │      +               │
             │ New GNSS Measurement │
             │      ↓               │
             │ Corrected State      │
             └──────────────────────┘
```
