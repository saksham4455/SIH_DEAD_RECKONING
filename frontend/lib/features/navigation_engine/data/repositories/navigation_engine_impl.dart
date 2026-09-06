import '../../../../core/platform/ffi/ffi_bridge.dart';

class NavigationEngineImpl {
  final IDRCoreBridge bridge;

  const NavigationEngineImpl(this.bridge);

  void initialize() => bridge.initEngine();

  Map<String, dynamic> pollState() => bridge.pollNavState();
}
