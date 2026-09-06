import '../../data/repositories/navigation_engine_impl.dart';

class NavEngineController {
  final NavigationEngineImpl engine;

  const NavEngineController(this.engine);

  void initialize() => engine.initialize();
}
