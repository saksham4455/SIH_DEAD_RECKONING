import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

enum BackendSyncState {
  uninitialized,
  connecting,
  connected,
  offline,
  error,
}

/// Real-time live client connecting the physical phone to the FastAPI + PostgreSQL backend.
///
/// Handles:
/// 1. Device registration (POST /devices/register)
/// 2. Drive session initialization (POST /session/start)
/// 3. Continuous telemetry streaming (POST /telemetry)
/// 4. Resilient offline handling (silently buffers when offline/disconnected)
class BackendTelemetryClient {
  static final BackendTelemetryClient _instance = BackendTelemetryClient._internal();
  factory BackendTelemetryClient() => _instance;
  BackendTelemetryClient._internal();

  String _baseUrl = 'http://127.0.0.1:8000';
  String? _deviceId;
  String? _authToken;
  String? _sessionId;
  BackendSyncState _syncState = BackendSyncState.uninitialized;
  int _recordsSent = 0;
  String _lastError = '';

  BackendSyncState get syncState => _syncState;
  int get recordsSent => _recordsSent;
  String? get sessionId => _sessionId;
  String get lastError => _lastError;

  void setBaseUrl(String url) {
    _baseUrl = url;
  }

  /// Initialize connection to backend, register physical device, and create a driving session.
  Future<bool> initialize({String deviceId = 'CPH2745_PHYSICAL'}) async {
    _deviceId = deviceId;
    _syncState = BackendSyncState.connecting;

    try {
      // 1. Device Registration
      final regUri = Uri.parse('$_baseUrl/api/v1/devices/register');
      final regResponse = await http
          .post(
            regUri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'device_id': _deviceId}),
          )
          .timeout(const Duration(seconds: 4));

      if (regResponse.statusCode != 200) {
        _syncState = BackendSyncState.error;
        _lastError = 'Registration failed: ${regResponse.statusCode}';
        return false;
      }

      final regData = jsonDecode(regResponse.body);
      _authToken = regData['access_token'];

      // 2. Start Live Drive Session
      final sessionUri = Uri.parse('$_baseUrl/api/v1/session/start');
      final sessionResponse = await http
          .post(
            sessionUri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_authToken',
            },
            body: jsonEncode({
              'metadata': {
                'hardware': _deviceId,
                'client': 'flutter_mobile',
                'source': 'real_hardware_sensors',
              }
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (sessionResponse.statusCode != 200) {
        _syncState = BackendSyncState.error;
        _lastError = 'Session start failed: ${sessionResponse.statusCode}';
        return false;
      }

      final sessionData = jsonDecode(sessionResponse.body);
      _sessionId = sessionData['id'];
      _syncState = BackendSyncState.connected;
      _lastError = '';
      return true;
    } on SocketException {
      _syncState = BackendSyncState.offline;
      _lastError = 'Backend unreachable (Offline/No ADB reverse)';
      return false;
    } on TimeoutException {
      _syncState = BackendSyncState.offline;
      _lastError = 'Connection timed out';
      return false;
    } catch (e) {
      _syncState = BackendSyncState.error;
      _lastError = e.toString();
      return false;
    }
  }

  /// Send a real-time telemetry frame to the backend.
  Future<bool> sendTelemetry({
    required double latitude,
    required double longitude,
    required double heading,
    required double speed,
    required double confidence,
    required bool gnssAvailable,
    required String mode,
    double? altitude,
  }) async {
    // If not connected, attempt lazy initialization
    if (_syncState == BackendSyncState.uninitialized ||
        _authToken == null ||
        _sessionId == null) {
      final ok = await initialize(deviceId: _deviceId ?? 'CPH2745_PHYSICAL');
      if (!ok) return false;
    }

    try {
      final uri = Uri.parse('$_baseUrl/api/v1/telemetry');
      final nowUtc = DateTime.now().toUtc().toIso8601String();

      final payload = {
        'session_id': _sessionId,
        'timestamp': nowUtc,
        'latitude': latitude,
        'longitude': longitude,
        'altitude': altitude,
        'speed': speed,
        'heading': heading.clamp(0.0, 359.9),
        'confidence': confidence.clamp(0.0, 1.0),
        'gnss_available': gnssAvailable,
        'mode': mode,
      };

      final response = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $_authToken',
            },
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 2));

      if (response.statusCode == 201) {
        _recordsSent++;
        _syncState = BackendSyncState.connected;
        return true;
      } else {
        _lastError = 'Telemetry POST returned ${response.statusCode}';
        return false;
      }
    } on SocketException {
      _syncState = BackendSyncState.offline;
      return false;
    } on TimeoutException {
      _syncState = BackendSyncState.offline;
      return false;
    } catch (e) {
      _syncState = BackendSyncState.error;
      _lastError = e.toString();
      return false;
    }
  }

  /// Stop current active drive session
  Future<void> stopSession() async {
    if (_sessionId == null || _authToken == null) return;
    try {
      final uri = Uri.parse('$_baseUrl/api/v1/session/$_sessionId/stop');
      await http.post(
        uri,
        headers: {'Authorization': 'Bearer $_authToken'},
      ).timeout(const Duration(seconds: 3));
    } catch (_) {}
  }
}
