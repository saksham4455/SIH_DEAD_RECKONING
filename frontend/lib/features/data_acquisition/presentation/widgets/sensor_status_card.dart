import 'package:flutter/material.dart';

class SensorStatusCard extends StatelessWidget {
  const SensorStatusCard({super.key});

  @override
  Widget build(BuildContext context) =>
      const Card(child: ListTile(title: Text('Sensor status')));
}
