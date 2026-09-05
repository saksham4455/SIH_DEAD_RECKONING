import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { AnomalyEvent } from '../../types/navigation';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

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
    backgroundColor: colors.status.errorSubtle,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: dimensions.borderWidth.thin,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.sm,
  },
  eventCountText: {
    color: colors.status.error,
    fontSize: typography.fontSizes.xxs,
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
    borderBottomWidth: dimensions.borderWidth.thin,
    borderBottomColor: colors.border.subtle,
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
    width: dimensions.iconDot.md,
    height: dimensions.iconDot.md,
    borderRadius: dimensions.iconDot.md / 2,
    marginRight: spacing.sm,
  },
  eventType: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  timestampText: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    marginTop: 2,
  },
  rightCol: {
    marginLeft: spacing.sm,
  },
  confidenceBadge: {
    borderWidth: dimensions.borderWidth.thin,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.sm,
  },
  confidenceText: {
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
  },
});
