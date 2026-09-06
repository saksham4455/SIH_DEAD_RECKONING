class HandleGnssOutageUseCase {
  bool call({required bool gnssAvailable}) => !gnssAvailable;
}
