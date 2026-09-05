import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SatelliteBreakdown as SatelliteBreakdownType, SatelliteInfo } from '../../types/navigation';
import { Card } from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { dimensions } from '../../theme/dimensions';

interface SatelliteBreakdownProps {
  satelliteBreakdown: SatelliteBreakdownType;
}

interface ConstellationRowProps {
  name: string;
  fullName: string;
  info: SatelliteInfo;
  color: string;
  isPrimary?: boolean;
}

const ConstellationRow: React.FC<ConstellationRowProps> = ({
  name,
  fullName,
  info,
  color,
  isPrimary,
}) => {
  // Typical max GNSS CNR is ~50 dB-Hz
  const signalPercentage = Math.min(100, Math.max(0, (info.signalStrength / 50) * 100));

  return (
    <View style={[styles.rowContainer, isPrimary && styles.primaryRow]}>
      <View style={styles.nameCol}>
        <View style={styles.badgeRow}>
          <View style={[styles.constellationDot, { backgroundColor: color }]} />
          <Text style={[styles.constellationName, { color }]}>{name}</Text>
          {isPrimary && (
            <View style={styles.primaryTag}>
              <Text style={styles.primaryTagText}>PRIORITY</Text>
            </View>
          )}
        </View>
        <Text style={styles.constellationFullName}>{fullName}</Text>
      </View>

      <View style={styles.countCol}>
        <Text style={styles.countValue}>{info.count}</Text>
        <Text style={styles.countLabel}>SATS</Text>
      </View>

      <View style={styles.signalCol}>
        <View style={styles.signalHeader}>
          <Text style={styles.signalDb}>{info.signalStrength.toFixed(1)} dB-Hz</Text>
        </View>
        <View style={styles.signalBarTrack}>
          <View
            style={[
              styles.signalBarFill,
              {
                width: `${signalPercentage}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export const SatelliteBreakdown: React.FC<SatelliteBreakdownProps> = ({
  satelliteBreakdown,
}) => {
  const totalSats =
    satelliteBreakdown.NavIC.count +
    satelliteBreakdown.GPS.count +
    satelliteBreakdown.Galileo.count +
    satelliteBreakdown.GLONASS.count;

  return (
    <Card
      title="SATELLITE CONSTELLATIONS"
      subtitle="Multi-GNSS Reception Telemetry"
      headerRight={
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{totalSats} TOTAL SATS</Text>
        </View>
      }
    >
      <ConstellationRow
        name="NavIC"
        fullName="India Regional (IRNSS)"
        info={satelliteBreakdown.NavIC}
        color={colors.constellations.NavIC}
        isPrimary={true}
      />
      <ConstellationRow
        name="GPS"
        fullName="USA Global"
        info={satelliteBreakdown.GPS}
        color={colors.constellations.GPS}
      />
      <ConstellationRow
        name="GLONASS"
        fullName="Russia Global"
        info={satelliteBreakdown.GLONASS}
        color={colors.constellations.GLONASS}
      />
      <ConstellationRow
        name="Galileo"
        fullName="European Union"
        info={satelliteBreakdown.Galileo}
        color={colors.constellations.Galileo}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  totalBadge: {
    backgroundColor: colors.accent.cyanSubtle,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderWidth: dimensions.borderWidth.thin,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: dimensions.borderRadius.sm,
  },
  totalBadgeText: {
    color: colors.accent.cyan,
    fontSize: typography.fontSizes.xxs,
    fontWeight: typography.fontWeights.bold,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: dimensions.borderWidth.thin,
    borderBottomColor: colors.border.subtle,
  },
  primaryRow: {
    backgroundColor: 'rgba(249, 115, 22, 0.06)',
    borderRadius: dimensions.borderRadius.md,
    paddingHorizontal: spacing.xs,
  },
  nameCol: {
    flex: 1.8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  constellationDot: {
    width: dimensions.iconDot.md,
    height: dimensions.iconDot.md,
    borderRadius: dimensions.iconDot.md / 2,
    marginRight: 6,
  },
  constellationName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  primaryTag: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: dimensions.borderRadius.xs,
    marginLeft: 6,
  },
  primaryTagText: {
    color: colors.constellations.NavIC,
    fontSize: typography.fontSizes.micro,
    fontWeight: typography.fontWeights.bold,
  },
  constellationFullName: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.xxs,
    marginTop: 2,
    marginLeft: 14,
  },
  countCol: {
    flex: 1,
    alignItems: 'center',
  },
  countValue: {
    color: colors.text.primary,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  countLabel: {
    color: colors.text.muted,
    fontSize: typography.fontSizes.micro,
  },
  signalCol: {
    flex: 2,
    paddingLeft: spacing.sm,
  },
  signalHeader: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  signalDb: {
    color: colors.text.secondary,
    fontSize: typography.fontSizes.xxs,
    fontFamily: typography.fontFamilies.mono,
  },
  signalBarTrack: {
    height: 6,
    backgroundColor: colors.border.medium,
    borderRadius: 3,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
