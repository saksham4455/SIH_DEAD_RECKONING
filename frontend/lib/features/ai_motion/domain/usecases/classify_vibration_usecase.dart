import '../../data/repositories/ai_motion_repository_impl.dart';

class ClassifyVibrationUseCase {
  final AiMotionRepositoryImpl repository;

  const ClassifyVibrationUseCase(this.repository);

  List<double> call(List<double> window) => repository.infer(window);
}
