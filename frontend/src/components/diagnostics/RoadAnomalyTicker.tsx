import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AnomalyEvent } from '../../types/navigation';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface RoadAnomalyTickerProps {
  anomalyEvents: AnomalyEvent[];
}

export const RoadAnomalyTicker: React.FC<RoadAnomalyTickerProps> = ({
  anomalyEvents,
}) => {
  const formatAnomalyType = (type: string): string => {
    return type.replace(/_/g, ' ').toUpperCase();
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const getAnomalyBadgeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'pothole':
        return colors.status.error;
      case 'speed_breaker':
        return colors.status.warning;
      default:
        return colors.accent.cyan;
    }
  };

  return (
    <Card
      title="ROAD ANOMALY TICKER"
      subtitle="Inertial Surface Disturbance Events"
      headerRight={
        <View style={styles.eventCountBadge}>
          <Text style={styles.eventCountText}>{anomalyEvents.length} DETECTIONS</Text>
        </View>
      }
    >
      {anomalyEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No road anomalies recorded</Text>
        </View>
      ) : (
        anomalyEvents.map((event, index) => {
          const badgeColor = getAnomalyBadgeColor(event.type);
          const confidencePercent =
            event.confidence !== undefined ? Math.round(event.confidence * 100) : null;

          return (
            <View
              key={`${event.type}-${event.timestamp}-${index}`}
              style={[
                styles.eventItem,
                index === anomalyEvents.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.leftCol}>
                <View style={[styles.indicator, { backgroundColor: badgeColor }]} />
                <View>
                  <Text style={styles.eventType}>{formatAnomalyType(event.type)}</Text>
                  <Text style={styles.timestampText}>
                    Event Time: {formatTimestamp(event.timestamp)}
                  </Text>
                </View>
              </View>

              <View style={styles.rightCol}>
                {confidencePercent !== null && (
                  <View
                    style={[
                      styles.confidenceBadge,
                      { borderColor: `${badgeColor}66`, backgroundColor: `${badgeColor}15` },
                    ]}
                  >
                    <Text style={[styles.confidenceText, { color: badgeColor }]}>
                      {confidencePercent}% CONF
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  eventCountBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eventCountText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
  },
  emptyContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.sm,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(35, 50, 82, 0.4)',
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  eventType: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  timestampText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xs - 2,
    marginTop: 2,
  },
  rightCol: {
    marginLeft: spacing.sm,
  },
  confidenceBadge: {
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confidenceText: {
    fontSize: typography.fontSizes.xs - 2,
    fontWeight: typography.fontWeights.bold,
  },
});
