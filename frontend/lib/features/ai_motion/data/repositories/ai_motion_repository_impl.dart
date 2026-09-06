import '../datasources/local_tflite_runner.dart';

class AiMotionRepositoryImpl {
  final LocalTfliteRunner runner;

  const AiMotionRepositoryImpl(this.runner);

  List<double> infer(List<double> window) => runner.run(window);
}
