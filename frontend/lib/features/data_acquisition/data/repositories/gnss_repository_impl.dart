import '../models/gnss_frame_model.dart';

abstract class GnssRepository {
  Stream<GnssFrameModel> watchFrames();
}

class GnssRepositoryImpl implements GnssRepository {
  @override
  Stream<GnssFrameModel> watchFrames() => const Stream.empty();
}
