import 'package:flutter/material.dart';

class ConfidenceHalo extends StatelessWidget {
  final double confidence;

  const ConfidenceHalo({super.key, this.confidence = 0});

  @override
  Widget build(BuildContext context) =>
      CircleAvatar(radius: 24 + (confidence * 24));
}
