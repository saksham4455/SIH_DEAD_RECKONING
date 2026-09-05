import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SensorHealth } from '../../types/navigation';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SensorHealthBarProps {
  sensorHealth: SensorHealth;
}

export const SensorHealthBar: React.FC<SensorHealthBarProps> = ({
  sensorHealth,
}) => {
  const sensors = [
    { key: 'gnss', label: 'GNSS RX', status: sensorHealth.gnss },
    { key: 'accel', label: 'ACCEL', status: sensorHealth.accelerometer },
    { key: 'gyro', label: 'GYROSCOPE', status: sensorHealth.gyroscope },
    { key: 'mag', label: 'MAGNETOMETER', status: sensorHealth.magnetometer },
  ];

  const allHealthy = Object.values(sensorHealth).every(Boolean);

  return (
    <Card
      title="HARDWARE SENSOR HEALTH"
      subtitle="Inertial & GNSS Sensor Status"
      headerRight={
        <StatusBadge
          label={allHealthy ? 'ALL NOMINAL' : 'DEGRADED'}
          variant={allHealthy ? 'success' : 'warning'}
          size="sm"
        />
      }
    >
      <View style={styles.grid}>
        {sensors.map((sensor) => (
          <View key={sensor.key} style={styles.sensorItem}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: sensor.status
                    ? colors.status.healthy
                    : colors.status.error,
                },
              ]}
            />
            <View>
              <Text style={styles.sensorLabel}>{sensor.label}</Text>
              <Text
                style={[
                  styles.sensorState,
                  {
                    color: sensor.status
                      ? colors.status.healthy
                      : colors.status.error,
                  },
                ]}
              >
                {sensor.status ? 'ONLINE' : 'FAULT'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.background.surfaceSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(35, 50, 82, 0.4)',
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  sensorLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
  },
  sensorState: {
    fontSize: typography.fontSizes.xs - 1,
    fontWeight: typography.fontWeights.bold,
    marginTop: 1,
  },
});
