sealed class NavigationFailure {
  final String message;

  const NavigationFailure(this.message);
}

class EngineFailure extends NavigationFailure {
  const EngineFailure(super.message);
}
