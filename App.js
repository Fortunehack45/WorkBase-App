import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Utility Store
import { 
  loadWorkspaceData, 
  saveWorkspaceData, 
  logActivity,
  pushTaskToCloud,
  pushProjectToCloud,
  pushMemberToCloud,
  pushCommentToCloud,
  deleteTaskFromCloud
} from './src/utils/storage';

// Screens / Components
import Dashboard from './src/components/Dashboard';
import Tasks from './src/components/Tasks';
import Projects from './src/components/Projects';
import Team from './src/components/Team';
import Insights from './src/components/Insights';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [workspaceData, setWorkspaceData] = useState({
    projects: [],
    tasks: [],
    members: [],
    activity: []
  });

  // Dialog and Form portals
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskFormVisible, setTaskFormVisible] = useState(false);

  // Initialize workspace data from storage
  useEffect(() => {
    async function init() {
      try {
        const stored = await loadWorkspaceData();
        setWorkspaceData(stored);
      } catch (err) {
        console.error('Failed loading workspace data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update AsyncStorage whenever workspaceData state changes
  const updateWorkspaceState = async (updated) => {
    setWorkspaceData(updated);
    await saveWorkspaceData(updated);
  };

  // Mutator Action: Add Task
  const handleAddTask = (taskPayload) => {
    const newTask = {
      ...taskPayload,
      id: `task_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };

    const updatedTasks = [newTask, ...workspaceData.tasks];
    const project = workspaceData.projects.find(p => p.id === taskPayload.projectId) || { name: 'General' };
    const assignee = workspaceData.members.find(m => m.id === taskPayload.assigneeId) || { name: 'Teammate' };
    
    const activityMsg = `Created task "${taskPayload.title}" under ${project.name} (Assigned to ${assignee.name.split(' ')[0]})`;
    const updatedActivity = logActivity(workspaceData.activity, activityMsg, 'task_created');

    updateWorkspaceState({
      ...workspaceData,
      tasks: updatedTasks,
      activity: updatedActivity
    });

    // Sync to Supabase cloud
    pushTaskToCloud(newTask);
  };

  // Mutator Action: Update Task
  const handleUpdateTask = (updatedTask) => {
    const origTask = workspaceData.tasks.find(t => t.id === updatedTask.id);
    const updatedTasks = workspaceData.tasks.map(t => t.id === updatedTask.id ? { ...t, ...updatedTask } : t);
    
    let activityMsg = `Updated task "${updatedTask.title}"`;
    let type = 'task_updated';

    if (origTask && origTask.status !== updatedTask.status) {
      activityMsg = `Moved task "${updatedTask.title}" status to "${updatedTask.status}"`;
    }

    const updatedActivity = logActivity(workspaceData.activity, activityMsg, type);

    updateWorkspaceState({
      ...workspaceData,
      tasks: updatedTasks,
      activity: updatedActivity
    });

    // Sync full task back to Supabase cloud
    const fullUpdatedTask = updatedTasks.find(t => t.id === updatedTask.id);
    if (fullUpdatedTask) {
      pushTaskToCloud(fullUpdatedTask);
    }
  };

  // Mutator Action: Delete Task
  const handleDeleteTask = (taskId) => {
    const origTask = workspaceData.tasks.find(t => t.id === taskId);
    const updatedTasks = workspaceData.tasks.filter(t => t.id !== taskId);
    
    const activityMsg = `Deleted task "${origTask?.title || 'Unknown Task'}"`;
    const updatedActivity = logActivity(workspaceData.activity, activityMsg, 'task_updated');

    updateWorkspaceState({
      ...workspaceData,
      tasks: updatedTasks,
      activity: updatedActivity
    });

    // Delete from Supabase cloud
    deleteTaskFromCloud(taskId);
  };

  // Mutator Action: Add Project
  const handleAddProject = (projPayload) => {
    const newProj = {
      ...projPayload,
      id: `proj_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedProjects = [...workspaceData.projects, newProj];
    const activityMsg = `Initialized project stream "${projPayload.name}" (${projPayload.category})`;
    const updatedActivity = logActivity(workspaceData.activity, activityMsg, 'project_created');

    updateWorkspaceState({
      ...workspaceData,
      projects: updatedProjects,
      activity: updatedActivity
    });

    // Sync to Supabase cloud
    pushProjectToCloud(newProj);
  };

  // Mutator Action: Add Member
  const handleAddMember = (memberPayload) => {
    const newMember = {
      ...memberPayload,
      id: `memb_${Date.now()}`,
    };

    const updatedMembers = [...workspaceData.members, newMember];
    const activityMsg = `Welcomed teammate ${memberPayload.name} to the workspace as ${memberPayload.role}`;
    const updatedActivity = logActivity(workspaceData.activity, activityMsg, 'member_added');

    updateWorkspaceState({
      ...workspaceData,
      members: updatedMembers,
      activity: updatedActivity
    });

    // Sync to Supabase cloud
    pushMemberToCloud(newMember);
  };

  // Mutator Action: Add Task Comment
  const handleAddTaskComment = (taskId, commentText) => {
    const newComment = {
      id: `comm_${Date.now()}`,
      taskId: taskId, // Map task ID
      authorName: 'Alex Rivera', 
      authorAvatar: '💼',
      text: commentText,
      createdAt: 'Just now'
    };

    const updatedTasks = workspaceData.tasks.map(t => {
      if (t.id === taskId) {
        const comments = t.comments || [];
        return { ...t, comments: [...comments, newComment] };
      }
      return t;
    });

    const task = workspaceData.tasks.find(t => t.id === taskId);
    const activityMsg = `Alex Rivera commented on "${task?.title}"`;
    const updatedActivity = logActivity(workspaceData.activity, activityMsg, 'comment_added');

    updateWorkspaceState({
      ...workspaceData,
      tasks: updatedTasks,
      activity: updatedActivity
    });

    // Sync comment to Supabase cloud
    pushCommentToCloud(newComment);
  };

  // Quick Action triggers from Dashboard
  const handleQuickAction = (action) => {
    if (action === 'add-task') {
      setActiveTab('tasks');
      setSelectedTask(null);
      setTimeout(() => {
        setTaskFormVisible(true);
      }, 100);
    } else if (action === 'add-project') {
      setActiveTab('projects');
    } else if (action === 'add-member') {
      setActiveTab('team');
    }
  };

  const onboardingSlides = [
    {
      title: 'Unified Workspace',
      subtitle: 'Consolidate your projects, CRM, tasks, and intelligent agents in a single fluid canvas.',
      visualType: 'glass-card',
      accent: 'indigo'
    },
    {
      title: 'Liquid Analytics',
      subtitle: 'Track team workload distribution, productivity vectors, and stream status with zero latency.',
      visualType: 'sol-chart',
      accent: 'purple'
    },
    {
      title: 'Liquid Operations',
      subtitle: 'Unblock pipelines, assign workloads, and coordinate milestones at speed. Let\'s build.',
      visualType: 'wallet-stack',
      accent: 'blue'
    }
  ];

  const handleNextOnboarding = () => {
    if (onboardingIndex < onboardingSlides.length - 1) {
      setOnboardingIndex(onboardingIndex + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  // Tab renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={workspaceData} 
            setActiveTab={setActiveTab}
            setSelectedTask={setSelectedTask}
            setTaskModalVisible={setTaskModalVisible}
            onQuickAction={handleQuickAction}
          />
        );
      case 'tasks':
        return (
          <Tasks 
            data={workspaceData}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddComment={handleAddTaskComment}
            taskModalVisible={taskModalVisible}
            setTaskModalVisible={setTaskModalVisible}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
            taskFormVisible={taskFormVisible}
            setTaskFormVisible={setTaskFormVisible}
          />
        );
      case 'projects':
        return (
          <Projects 
            data={workspaceData}
            onAddProject={handleAddProject}
          />
        );
      case 'team':
        return (
          <Team 
            data={workspaceData}
            onAddMember={handleAddMember}
          />
        );
      case 'insights':
        return (
          <Insights 
            data={workspaceData}
          />
        );
      default:
        return <View />;
    }
  };

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="dark-content" />
        <LinearGradient 
          colors={['#ECEEFF', '#F6F8FF']} 
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.splashVisual}>
          <View style={styles.splashLogoBg}>
            <Ionicons name="grid" size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.splashTitle}>WORKBASE</Text>
          <Text style={styles.splashSubtitle}>Workspace operations control center</Text>
        </View>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // APPLE ONBOARDING SCREEN (First Phone reference)
  if (showOnboarding) {
    const slide = onboardingSlides[onboardingIndex];
    return (
      <View style={styles.onboardingContainer}>
        <StatusBar barStyle="dark-content" />
        
        {/* Soft Indigo Lilac Gradient Mesh */}
        <LinearGradient 
          colors={['#E5E6FF', '#ECE8FF', '#FFFFFF']} 
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Glows */}
        <View style={styles.ambientGlowPink} />
        <View style={styles.ambientGlowBlue} />

        <SafeAreaView style={{ flex: 1 }}>
          {/* Top Skip Button */}
          <View style={styles.onboardingHeader}>
            <TouchableOpacity onPress={() => setShowOnboarding(false)} style={styles.skipBtn}>
              <Text style={styles.skipBtnText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Visual Canvas (Glassmorphic Mock, like first phone reference) */}
          <View style={styles.visualCanvasContainer}>
            {onboardingIndex === 0 && (
              <View style={styles.glassCardVisual}>
                {/* Frosted Layer */}
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.3)']}
                  style={styles.frostedGlassMock}
                >
                  <View style={styles.glassCircleTiny} />
                  <View style={styles.glassLineLong} />
                  <View style={styles.glassLineShort} />
                  <Ionicons name="sparkles" size={48} color="#4F46E5" style={styles.glassIconMock} />
                </LinearGradient>
                {/* Floating solid element background */}
                <View style={styles.solidCircleBehind} />
              </View>
            )}

            {onboardingIndex === 1 && (
              <View style={styles.glassCardVisual}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.35)']}
                  style={styles.frostedGlassMock}
                >
                  <Ionicons name="analytics" size={54} color="#8B5CF6" style={styles.glassIconMock} />
                  <View style={styles.miniChartLineMock} />
                </LinearGradient>
                <View style={[styles.solidCircleBehind, { backgroundColor: '#C084FC', right: -10, top: 40 }]} />
              </View>
            )}

            {onboardingIndex === 2 && (
              <View style={styles.glassCardVisual}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)']}
                  style={styles.frostedGlassMock}
                >
                  <Ionicons name="flash-sharp" size={54} color="#3B82F6" style={styles.glassIconMock} />
                </LinearGradient>
                <View style={[styles.solidCircleBehind, { backgroundColor: '#60A5FA', left: -20, bottom: -10 }]} />
              </View>
            )}
          </View>

          {/* Information Section */}
          <View style={styles.onboardingInfoSection}>
            <Text style={styles.onboardingTitle}>{slide.title}</Text>
            <Text style={styles.onboardingSubtitle}>{slide.subtitle}</Text>

            {/* Pagination Indicators (Apple pill style) */}
            <View style={styles.paginationRow}>
              {onboardingSlides.map((_, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.paginationDot, 
                    onboardingIndex === i ? styles.paginationDotActive : styles.paginationDotInactive
                  ]} 
                />
              ))}
            </View>

            {/* Premium Black Apple Pill Button */}
            <TouchableOpacity style={styles.nextPillButton} onPress={handleNextOnboarding}>
              <Text style={styles.nextPillButtonText}>
                {onboardingIndex === onboardingSlides.length - 1 ? 'Enter Workspace' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Dynamic Background Mesh Grid on Main Workspace */}
      <LinearGradient 
        colors={['#F5F7FF', '#FAFAFF']} 
        style={StyleSheet.absoluteFill}
      />

      {/* Top Ambient Glow */}
      <View style={styles.topAmbientGlow} />

      {/* Workspace App Brand Header Bar (Apple Minimalist) */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoTinyBg}>
            <Ionicons name="grid" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.brandText}>workbase</Text>
        </View>
        <View style={styles.userProfileTiny}>
          <Text style={styles.userAvatarTiny}>💼</Text>
          <View style={styles.userStatusTiny} />
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Render Tab Contents */}
        <View style={{ flex: 1, paddingBottom: 85 }}>
          {renderContent()}
        </View>
      </KeyboardAvoidingView>

      {/* FLOATING GLASS CAPSULE TAB BAR (Billion Dollar App style) */}
      <View style={styles.floatingTabBarContainer}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(245, 247, 255, 0.75)']}
          style={styles.floatingTabBar}
        >
          {/* Dashboard (Home) */}
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.75}
            onPress={() => setActiveTab('dashboard')}
          >
            <View style={[styles.tabIconWrapper, activeTab === 'dashboard' && styles.activeTabIconBg]}>
              <Ionicons 
                name={activeTab === 'dashboard' ? 'home-sharp' : 'home-outline'} 
                size={18} 
                color={activeTab === 'dashboard' ? '#FFFFFF' : '#4B5563'} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.activeTabLabel]}>Home</Text>
            {activeTab === 'dashboard' && <View style={styles.activeTabIndicatorDot} />}
          </TouchableOpacity>

          {/* Tasks */}
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.75}
            onPress={() => setActiveTab('tasks')}
          >
            <View style={[styles.tabIconWrapper, activeTab === 'tasks' && styles.activeTabIconBg]}>
              <Ionicons 
                name={activeTab === 'tasks' ? 'clipboard-sharp' : 'clipboard-outline'} 
                size={18} 
                color={activeTab === 'tasks' ? '#FFFFFF' : '#4B5563'} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'tasks' && styles.activeTabLabel]}>Tasks</Text>
            {activeTab === 'tasks' && <View style={styles.activeTabIndicatorDot} />}
          </TouchableOpacity>

          {/* Projects */}
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.75}
            onPress={() => setActiveTab('projects')}
          >
            <View style={[styles.tabIconWrapper, activeTab === 'projects' && styles.activeTabIconBg]}>
              <Ionicons 
                name={activeTab === 'projects' ? 'layers-sharp' : 'layers-outline'} 
                size={18} 
                color={activeTab === 'projects' ? '#FFFFFF' : '#4B5563'} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'projects' && styles.activeTabLabel]}>Streams</Text>
            {activeTab === 'projects' && <View style={styles.activeTabIndicatorDot} />}
          </TouchableOpacity>

          {/* Team */}
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.75}
            onPress={() => setActiveTab('team')}
          >
            <View style={[styles.tabIconWrapper, activeTab === 'team' && styles.activeTabIconBg]}>
              <Ionicons 
                name={activeTab === 'team' ? 'people-sharp' : 'people-outline'} 
                size={18} 
                color={activeTab === 'team' ? '#FFFFFF' : '#4B5563'} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'team' && styles.activeTabLabel]}>Team</Text>
            {activeTab === 'team' && <View style={styles.activeTabIndicatorDot} />}
          </TouchableOpacity>

          {/* Insights */}
          <TouchableOpacity 
            style={styles.tabBtn} 
            activeOpacity={0.75}
            onPress={() => setActiveTab('insights')}
          >
            <View style={[styles.tabIconWrapper, activeTab === 'insights' && styles.activeTabIconBg]}>
              <Ionicons 
                name={activeTab === 'insights' ? 'analytics-sharp' : 'analytics-outline'} 
                size={18} 
                color={activeTab === 'insights' ? '#FFFFFF' : '#4B5563'} 
              />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'insights' && styles.activeTabLabel]}>Insights</Text>
            {activeTab === 'insights' && <View style={styles.activeTabIndicatorDot} />}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFF',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashVisual: {
    alignItems: 'center',
    marginBottom: 28,
  },
  splashLogoBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 2,
  },
  splashSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ambientGlowPink: {
    position: 'absolute',
    top: height * 0.1,
    left: -100,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    filter: 'blur(80px)',
  },
  ambientGlowBlue: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -100,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
    filter: 'blur(90px)',
  },
  onboardingHeader: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  skipBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },
  visualCanvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  glassCardVisual: {
    width: width * 0.65,
    height: width * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  frostedGlassMock: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassCircleTiny: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  glassLineLong: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    width: '60%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  glassLineShort: {
    position: 'absolute',
    bottom: 26,
    left: 24,
    width: '35%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  glassIconMock: {
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  miniChartLineMock: {
    width: '70%',
    height: 2,
    backgroundColor: '#8B5CF6',
    marginTop: 18,
    borderRadius: 1,
  },
  solidCircleBehind: {
    position: 'absolute',
    bottom: 20,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#818CF8',
    opacity: 0.85,
    zIndex: 1,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  onboardingInfoSection: {
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -1,
  },
  onboardingSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  paginationDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#111111',
  },
  paginationDotInactive: {
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  nextPillButton: {
    backgroundColor: '#111111',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  nextPillButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  topAmbientGlow: {
    position: 'absolute',
    top: -50,
    left: width * 0.1,
    width: width * 0.8,
    height: 140,
    backgroundColor: 'rgba(79, 70, 229, 0.04)',
    filter: 'blur(50px)',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.03)',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoTinyBg: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.5,
  },
  userProfileTiny: {
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  userAvatarTiny: {
    fontSize: 16,
  },
  userStatusTiny: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  floatingTabBarContainer: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTabBar: {
    flexDirection: 'row',
    width: '100%',
    height: 68,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
  },
  activeTabIndicatorDot: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#111111',
    shadowColor: '#111111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 1,
  },
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeTabIconBg: {
    backgroundColor: '#111111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  activeTabLabel: {
    color: '#111111',
    fontWeight: '800',
  },
});
