import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Insights({ data }) {
  const { tasks, projects, members } = data;
  const [selectedTimeline, setSelectedTimeline] = useState('Week');

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'In Review').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 1. Calculate Contributors
  const contributors = members.map(m => {
    const completedCount = tasks.filter(t => t.assigneeId === m.id && t.status === 'Completed').length;
    return { ...m, completedCount };
  }).sort((a, b) => b.completedCount - a.completedCount);

  // 2. Custom chart nodes mapping (to draw a gorgeous curve with glowing backfill)
  const chartCoordinates = [
    { x: 0, y: 80 },
    { x: width * 0.15, y: 70 },
    { x: width * 0.3, y: 110 },
    { x: width * 0.45, y: 40 },
    { x: width * 0.6, y: 95 },
    { x: width * 0.75, y: 30 },
    { x: width * 0.85, y: 15 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Workspace Insights</Text>
        <Text style={styles.subtitle}>Stream analytics, performance indicators, efficiency vectors.</Text>
      </View>

      {/* APPLE PERFORMANCE VELOCITY HEADER (SOL Chart replica) */}
      <View style={styles.fintechChartContainer}>
        {/* Large velocity display */}
        <View style={styles.velocityHeaderRow}>
          <View>
            <Text style={styles.velocityLabel}>OPERATIONAL VELOCITY</Text>
            <Text style={styles.velocityValue}>{completionRate}.2%</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="trending-up-outline" size={14} color="#10B981" style={{ marginRight: 4 }} />
            <Text style={styles.trendText}>+4.85%</Text>
          </View>
        </View>

        {/* Timeline Pill Switcher (24h, Week, Month, 6m) */}
        <View style={styles.timelineRow}>
          {['24h', 'Week', 'Month', '6 months'].map((time) => (
            <TouchableOpacity 
              key={time} 
              style={[
                styles.timelinePill, 
                selectedTimeline === time && styles.timelinePillActive
              ]}
              onPress={() => setSelectedTimeline(time)}
            >
              <Text style={[
                styles.timelinePillText, 
                selectedTimeline === time && styles.timelinePillTextActive
              ]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GRAPH VIEWPORT (Custom Bezier line visual with glowing overlay backfill) */}
        <View style={styles.graphViewport}>
          {/* Subtle Grid Lines */}
          <View style={styles.gridLine}><Text style={styles.gridValue}>100%</Text></View>
          <View style={styles.gridLine}><Text style={styles.gridValue}>50%</Text></View>
          <View style={styles.gridLine}><Text style={styles.gridValue}>0%</Text></View>

          {/* Liquid glowing gradient backing */}
          <LinearGradient
            colors={['rgba(79, 70, 229, 0.15)', 'rgba(79, 70, 229, 0.005)']}
            style={styles.glowingChartFill}
          />

          {/* Handdrawn curve layout (Perfect simulation of vector paths using segmented joints) */}
          <View style={styles.vectorPathContainer}>
            {/* Smooth glowing line nodes */}
            <View style={[styles.graphJoint, { left: '0%', top: '75%' }]} />
            <View style={[styles.graphJoint, { left: '15%', top: '65%' }]} />
            <View style={[styles.graphJoint, { left: '30%', top: '85%' }]} />
            <View style={[styles.graphJoint, { left: '48%', top: '45%' }]} />
            <View style={[styles.graphJoint, { left: '65%', top: '70%' }]} />
            <View style={[styles.graphJoint, { left: '80%', top: '35%' }]} />
            <View style={[styles.graphJoint, { left: '96%', top: '20%' }]} />

            {/* Glowing peak point */}
            <View style={[styles.glowingPeakOuter, { left: '96%', top: '20%' }]}>
              <View style={styles.glowingPeakInner} />
            </View>

            {/* Simulated connect line blocks */}
            <View style={styles.customPathVector} />
          </View>
        </View>
      </View>

      {/* FINTECH METRICS LEDGER (Matching Sol Info Ledger in Middle Phone) */}
      <Text style={styles.sectionHeading}>WORKSPACE EFFICIENCY INDEX</Text>
      <View style={styles.ledgerCard}>
        {/* Ledger Item 1 */}
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerLabelText}>Resource Allocation</Text>
          <Text style={[styles.ledgerValueText, { color: '#10B981' }]}>OPTIMIZED</Text>
        </View>

        {/* Ledger Item 2 */}
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerLabelText}>Tasks Completed (Week)</Text>
          <Text style={styles.ledgerValueText}>+{completedTasks} milestone streams</Text>
        </View>

        {/* Ledger Item 3 */}
        <View style={styles.ledgerRow}>
          <Text style={styles.ledgerLabelText}>Average Milestone Lifespan</Text>
          <Text style={styles.ledgerValueText}>2.4 days</Text>
        </View>

        {/* Ledger Item 4 */}
        <View style={[styles.ledgerRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.ledgerLabelText}>Weekly Delta Velocity</Text>
          <Text style={[styles.ledgerValueText, { color: '#4F46E5' }]}>+12.45%</Text>
        </View>
      </View>

      {/* CONTRIBUTORS PODIUM */}
      <Text style={styles.sectionHeading}>OPERATOR LEADERBOARD</Text>
      <View style={styles.ledgerCard}>
        {contributors.map((contrib, idx) => (
          <View key={contrib.id} style={styles.contributorItemRow}>
            {/* Rank badge */}
            <View style={[
              styles.rankBadge,
              idx === 0 ? { backgroundColor: '#FEF3C7' } : 
              idx === 1 ? { backgroundColor: '#F3F4F6' } : { backgroundColor: '#E5E7EB' }
            ]}>
              <Text style={[
                styles.rankText,
                idx === 0 ? { color: '#D97706' } : { color: '#4B5563' }
              ]}>#{idx + 1}</Text>
            </View>

            {/* Avatar */}
            <Text style={styles.contribAvatarEmoji}>{contrib.avatar}</Text>

            {/* Teammate */}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.contribName}>{contrib.name}</Text>
              <Text style={styles.contribDept}>{contrib.department.toUpperCase()} TEAM</Text>
            </View>

            {/* Resolution metric */}
            <View style={styles.resolutionsWidget}>
              <Ionicons name="trophy-sharp" size={12} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.resolutionsText}>{contrib.completedCount} done</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
    fontWeight: '500',
  },
  fintechChartContainer: {
    backgroundColor: '#111317', // Match SOL theme black
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  velocityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  velocityLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  velocityValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 10.5,
    fontWeight: '850',
    color: '#10B981',
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  timelinePill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  timelinePillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  timelinePillText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '800',
  },
  timelinePillTextActive: {
    color: '#111111',
  },
  graphViewport: {
    height: 140,
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
    paddingBottom: 2,
    height: 40,
    justifyContent: 'flex-end',
  },
  gridValue: {
    fontSize: 8.5,
    color: 'rgba(255, 255, 255, 0.15)',
    fontWeight: '700',
    textAlign: 'right',
  },
  glowingChartFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  vectorPathContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  graphJoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4F46E5',
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  glowingPeakOuter: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(79, 70, 229, 0.35)',
    transform: [{ translateX: -7 }, { translateY: -7 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowingPeakInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  customPathVector: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 0,
    borderColor: '#4F46E5',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '850',
    color: '#4B5563',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 10,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  ledgerLabelText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  ledgerValueText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
  },
  contributorItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 9.5,
    fontWeight: '850',
  },
  contribAvatarEmoji: {
    fontSize: 18,
    marginLeft: 10,
  },
  contribName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1F2937',
  },
  contribDept: {
    fontSize: 8.5,
    color: '#9CA3AF',
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 1,
  },
  resolutionsWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  resolutionsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
});
