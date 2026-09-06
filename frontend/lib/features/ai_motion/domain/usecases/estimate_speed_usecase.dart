import '../../data/repositories/ai_motion_repository_impl.dart';

class EstimateSpeedUseCase {
  final AiMotionRepositoryImpl repository;

  const EstimateSpeedUseCase(this.repository);

  List<double> call(List<double> window) => repository.infer(window);
}
