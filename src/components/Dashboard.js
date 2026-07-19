import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Dashboard({ data, setActiveTab, setSelectedTask, setTaskModalVisible, onQuickAction }) {
  const { tasks, projects, members } = data;

  // Calculate Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const reviewTasks = tasks.filter(t => t.status === 'In Review').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;
  const activeTasks = todoTasks + inProgressTasks + reviewTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Focus tasks (cryptocurrency asset row mapping)
  const focusTasks = tasks
    .filter(t => t.status !== 'Completed')
    .slice(0, 4);

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getProjectEmoji = (category) => {
    switch (category) {
      case 'Design': return '🎨';
      case 'Marketing': return '📢';
      case 'Operations': return '⚙️';
      case 'Engineering': return '💻';
      default: return '💼';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. LIQUID GLASS CORE HUB CARD (Matching Wallet A Card in reference) */}
      <View style={styles.floatingHubCardContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.35)']}
          style={styles.floatingHubCard}
        >
          {/* Header Row */}
          <View style={styles.hubHeaderRow}>
            <View style={styles.hubHeaderDetails}>
              <Text style={styles.hubLabel}>Workspace Stream</Text>
              <Text style={styles.hubName}>Main Operations Base</Text>
            </View>
            <Ionicons name="chevron-down-outline" size={16} color="#111827" />
          </View>

          {/* Large Completion Metrics (Matching large balance) */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{completionRate}.2%</Text>
            <View style={styles.deltaBadge}>
              <Text style={styles.deltaText}>+{completedTasks} tasks resolved</Text>
            </View>
          </View>

          {/* Small Subtext Metrics */}
          <Text style={styles.hubMetricsSub}>
            {activeTasks} items in flight across {projects.length} streams
          </Text>
        </LinearGradient>
      </View>

      {/* 2. THREE LIQUID CIRCULAR ACTIONS (Matching Send, Receive, Buy) */}
      <View style={styles.circularActionsContainer}>
        {/* Action 1 */}
        <TouchableOpacity style={styles.circularActionItem} onPress={() => onQuickAction('add-task')}>
          <LinearGradient
            colors={['rgba(255,255,255,0.85)', 'rgba(240,243,255,0.7)']}
            style={styles.circularIconBg}
          >
            <Ionicons name="add-sharp" size={20} color="#111111" />
          </LinearGradient>
          <Text style={styles.circularActionLabel}>Add Task</Text>
        </TouchableOpacity>

        {/* Action 2 */}
        <TouchableOpacity style={styles.circularActionItem} onPress={() => onQuickAction('add-project')}>
          <LinearGradient
            colors={['rgba(255,255,255,0.85)', 'rgba(240,243,255,0.7)']}
            style={styles.circularIconBg}
          >
            <Ionicons name="layers-sharp" size={18} color="#111111" />
          </LinearGradient>
          <Text style={styles.circularActionLabel}>New Stream</Text>
        </TouchableOpacity>

        {/* Action 3 */}
        <TouchableOpacity style={styles.circularActionItem} onPress={() => onQuickAction('add-member')}>
          <LinearGradient
            colors={['rgba(255,255,255,0.85)', 'rgba(240,243,255,0.7)']}
            style={styles.circularIconBg}
          >
            <Ionicons name="person-add-sharp" size={18} color="#111111" />
          </LinearGradient>
          <Text style={styles.circularActionLabel}>Add Team</Text>
        </TouchableOpacity>
      </View>

      {/* 3. FINTECH-STYLE DARK FOCUS DRAWER (Matching bottom dark card in reference) */}
      <View style={styles.darkFocusDrawer}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Active Workloads</Text>
          <TouchableOpacity onPress={() => setActiveTab('tasks')}>
            <Text style={styles.drawerActionText}>See Board</Text>
          </TouchableOpacity>
        </View>

        {focusTasks.length === 0 ? (
          <View style={styles.emptyDrawerCard}>
            <Ionicons name="cafe-outline" size={32} color="#4B5563" />
            <Text style={styles.emptyDrawerText}>No active tasks remaining</Text>
            <Text style={styles.emptyDrawerSub}>Your operations board is fully completed.</Text>
          </View>
        ) : (
          focusTasks.map((task) => {
            const project = projects.find(p => p.id === task.projectId) || { name: 'General', category: 'Product', color: '#6B7280' };
            const assignee = members.find(m => m.id === task.assigneeId) || { name: 'Unassigned', avatar: '👤' };
            
            return (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskAssetRow}
                onPress={() => {
                  setSelectedTask(task);
                  setTaskModalVisible(true);
                }}
              >
                {/* Simulated Crypto Coin Circle */}
                <View style={[styles.coinIconBg, { borderColor: `${project.color}33` }]}>
                  <Text style={styles.coinEmoji}>{getProjectEmoji(project.category)}</Text>
                </View>

                {/* Simulated Coin Name & Holdings */}
                <View style={styles.coinDetails}>
                  <Text style={styles.coinName} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.coinSymbol}>{project.name} • {assignee.name}</Text>
                </View>

                {/* Simulated Price & Value Indicators on the Right */}
                <View style={styles.coinValues}>
                  <Text style={[styles.coinPrice, { color: getPriorityBadgeColor(task.priority) }]}>
                    {task.priority}
                  </Text>
                  <Text style={styles.coinHoldingValue}>Due {task.dueDate}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  floatingHubCardContainer: {
    marginTop: 18,
    marginBottom: 20,
  },
  floatingHubCard: {
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hubHeaderDetails: {
    flex: 1,
  },
  hubLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hubName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -1.5,
  },
  deltaBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  deltaText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  hubMetricsSub: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circularActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  circularActionItem: {
    alignItems: 'center',
  },
  circularIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  circularActionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  darkFocusDrawer: {
    backgroundColor: '#111317',
    borderRadius: 32,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  drawerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyDrawerCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyDrawerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 10,
  },
  emptyDrawerSub: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  taskAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  coinIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinEmoji: {
    fontSize: 18,
  },
  coinDetails: {
    flex: 1,
    marginRight: 8,
  },
  coinName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coinSymbol: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '600',
  },
  coinValues: {
    alignItems: 'flex-end',
  },
  coinPrice: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  coinHoldingValue: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
});
