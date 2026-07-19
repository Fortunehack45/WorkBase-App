import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function Tasks({ 
  data, 
  onAddTask, 
  onUpdateTask, 
  onDeleteTask, 
  onAddComment,
  taskModalVisible,
  setTaskModalVisible,
  selectedTask,
  setSelectedTask,
  taskFormVisible,
  setTaskFormVisible
}) {
  const { tasks, projects, members } = data;

  // Local UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Comment Text
  const [newCommentText, setNewCommentText] = useState('');

  // Form Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProject, setFormProject] = useState('');
  const [formAssignee, setFormAssignee] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formStatus, setFormStatus] = useState('To Do');
  const [formDueDate, setFormDueDate] = useState('');

  // Status Lists
  const STATUSES = ['To Do', 'In Progress', 'In Review', 'Completed'];
  const STATUS_TABS = ['All', 'To Do', 'In Progress', 'In Review', 'Completed'];

  // Filter Tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatusTab === 'All' || task.status === selectedStatusTab;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesProject = projectFilter === 'All' || task.projectId === projectFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#EF4444';
      case 'Medium': return '#F59E0B';
      default: return '#3B82F6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      case 'In Review': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'Completed': return '#ECFDF5';
      case 'In Progress': return '#EFF6FF';
      case 'In Review': return '#FFFBEB';
      default: return '#F3F4F6';
    }
  };

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setFormTitle('');
    setFormDesc('');
    setFormProject(projects[0]?.id || '');
    setFormAssignee(members[0]?.id || '');
    setFormPriority('Medium');
    setFormStatus('To Do');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split('T')[0]);
    
    setTaskFormVisible(true);
  };

  const handleOpenEditForm = (task) => {
    setIsEditing(true);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormProject(task.projectId);
    setFormAssignee(task.assigneeId);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormDueDate(task.dueDate);
    
    setTaskModalVisible(false);
    setTaskFormVisible(true);
  };

  const handleFormSubmit = () => {
    if (!formTitle.trim()) {
      Alert.alert('Error', 'Please provide a task title.');
      return;
    }

    const taskPayload = {
      title: formTitle,
      description: formDesc,
      projectId: formProject,
      assigneeId: formAssignee,
      priority: formPriority,
      status: formStatus,
      dueDate: formDueDate,
    };

    if (isEditing) {
      onUpdateTask({ ...taskPayload, id: selectedTask.id });
      setSelectedTask({ ...selectedTask, ...taskPayload });
      setTaskModalVisible(true);
    } else {
      onAddTask(taskPayload);
    }
    setTaskFormVisible(false);
  };

  const handleCommentSubmit = () => {
    if (!newCommentText.trim()) return;
    onAddComment(selectedTask.id, newCommentText);
    setNewCommentText('');
  };

  const handleDeleteConfirm = (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to permanently delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            onDeleteTask(taskId);
            setTaskModalVisible(false);
          }
        }
      ]
    );
  };

  const handleQuickStatusChange = (newStatus) => {
    onUpdateTask({ ...selectedTask, status: newStatus });
    setSelectedTask({ ...selectedTask, status: newStatus });
  };

  return (
    <View style={styles.container}>
      {/* Header (Apple Minimalist) */}
      <View style={styles.header}>
        <Text style={styles.title}>Workspace Board</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddForm}>
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.addBtnText}>Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Glassmorphic Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={16} color="#6B7280" style={styles.searchIcon} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search task title or description..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle-sharp" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Pill-Switcher Tabs (Matching 24h / Week / Month / 6m in Middle Phone reference) */}
      <View style={styles.statusTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusTabsScroll}>
          {STATUS_TABS.map(tab => {
            const isActive = selectedStatusTab === tab;
            return (
              <TouchableOpacity 
                key={tab} 
                style={[
                  styles.statusTabBtn, 
                  isActive ? styles.activeStatusTab : styles.inactiveStatusTab
                ]}
                onPress={() => setSelectedStatusTab(tab)}
              >
                <Text style={[
                  styles.statusTabText, 
                  isActive ? styles.activeStatusTabText : styles.inactiveStatusTabText
                ]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filtersPane}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {/* Projects filter */}
          <TouchableOpacity 
            style={[styles.filterChipBtn, projectFilter === 'All' && styles.filterChipBtnActive]}
            onPress={() => setProjectFilter('All')}
          >
            <Text style={[styles.filterChipText, projectFilter === 'All' && styles.filterChipTextActive]}>All Streams</Text>
          </TouchableOpacity>
          {projects.map(proj => (
            <TouchableOpacity 
              key={proj.id}
              style={[
                styles.filterChipBtn, 
                projectFilter === proj.id && [styles.filterChipBtnActive, { backgroundColor: proj.color, borderColor: proj.color }]
              ]}
              onPress={() => setProjectFilter(proj.id)}
            >
              <Text style={[styles.filterChipText, projectFilter === proj.id && styles.filterChipTextActive]}>{proj.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks FlatList */}
      {filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>Clear backlog</Text>
          <Text style={styles.emptySubtext}>No tasks match your selected operational streams.</Text>
        </View>
      ) : (
        <FlatList 
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const project = projects.find(p => p.id === item.projectId) || { name: 'General', color: '#6B7280' };
            const assignee = members.find(m => m.id === item.assigneeId) || { name: 'Unassigned', avatar: '👤' };
            
            return (
              <TouchableOpacity 
                style={styles.taskCard}
                onPress={() => {
                  setSelectedTask(item);
                  setTaskModalVisible(true);
                }}
              >
                {/* Micro Color indicator */}
                <View style={[styles.priorityHalo, { backgroundColor: getPriorityColor(item.priority) }]} />

                <View style={styles.taskCardContent}>
                  {/* Card Header */}
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.projectTagText, { color: project.color }]}>
                      {project.name.toUpperCase()}
                    </Text>
                    <View style={[styles.statusMiniBadge, { backgroundColor: getStatusBgColor(item.status) }]}>
                      <Text style={[styles.statusMiniText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.cardTitleText}>{item.title}</Text>
                  <Text style={styles.cardDescText} numberOfLines={2}>{item.description}</Text>

                  {/* Card Footer */}
                  <View style={styles.cardFooterRow}>
                    <View style={styles.footerFieldItem}>
                      <Ionicons name="calendar-outline" size={12} color="#6B7280" style={{ marginRight: 4 }} />
                      <Text style={styles.footerValue}>{item.dueDate}</Text>
                    </View>
                    <View style={styles.footerFieldItem}>
                      <Text style={{ marginRight: 4, fontSize: 11 }}>{assignee.avatar}</Text>
                      <Text style={styles.footerValue}>{assignee.name}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* 1. TASK DETAILS MODAL (Apple Premium sliding drawer) */}
      {selectedTask && (
        <Modal
          visible={taskModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setTaskModalVisible(false)}
        >
          <View style={styles.modalBg}>
            <View style={[styles.modalContentContainer, { height: height * 0.86 }]}>
              {/* Pill Handle (Apple standard sheet) */}
              <View style={styles.modalSheetHandle} />

              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalStreamLabel}>
                    {(projects.find(p => p.id === selectedTask.projectId) || { name: 'General' }).name.toUpperCase()}
                  </Text>
                  <Text style={styles.modalTitleText}>{selectedTask.title}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTaskModalVisible(false)}>
                  <Ionicons name="close" size={20} color="#111111" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Meta details cards */}
                <View style={styles.modalInfoPanel}>
                  <View style={styles.infoPanelCol}>
                    <Text style={styles.infoPanelLabel}>STATUS</Text>
                    <Text style={[styles.infoPanelValue, { color: getStatusColor(selectedTask.status) }]}>
                      {selectedTask.status}
                    </Text>
                  </View>
                  <View style={[styles.infoPanelCol, styles.borderLeftLine]}>
                    <Text style={styles.infoPanelLabel}>PRIORITY</Text>
                    <Text style={[styles.infoPanelValue, { color: getPriorityColor(selectedTask.priority) }]}>
                      {selectedTask.priority}
                    </Text>
                  </View>
                  <View style={[styles.infoPanelCol, styles.borderLeftLine]}>
                    <Text style={styles.infoPanelLabel}>DUE DATE</Text>
                    <Text style={styles.infoPanelValue}>{selectedTask.dueDate}</Text>
                  </View>
                </View>

                {/* Assignee Information */}
                <View style={styles.assigneeRow}>
                  <View style={styles.assigneeAvatarBg}>
                    <Text style={{ fontSize: 18 }}>
                      {(members.find(m => m.id === selectedTask.assigneeId) || { avatar: '👤' }).avatar}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.assigneeLabel}>LEAD OPERATOR</Text>
                    <Text style={styles.assigneeName}>
                      {(members.find(m => m.id === selectedTask.assigneeId) || { name: 'Unassigned' }).name}
                    </Text>
                  </View>
                </View>

                {/* Description panel */}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.subHeadingText}>Task Scope</Text>
                  <Text style={styles.bodyDescription}>
                    {selectedTask.description || 'No descriptive scope provided.'}
                  </Text>
                </View>

                {/* Status Quick Actions */}
                <View style={styles.statusActionPanel}>
                  <Text style={styles.subHeadingText}>Update Status</Text>
                  <View style={styles.statusPillsRow}>
                    {STATUSES.map(stat => (
                      <TouchableOpacity 
                        key={stat}
                        style={[
                          styles.statusActionBtn,
                          selectedTask.status === stat && { backgroundColor: '#111111', borderColor: '#111111' }
                        ]}
                        onPress={() => handleQuickStatusChange(stat)}
                      >
                        <Text style={[
                          styles.statusActionText,
                          selectedTask.status === stat && { color: '#FFFFFF' }
                        ]}>{stat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Comments Stream */}
                <View style={styles.commentsPanel}>
                  <Text style={styles.subHeadingText}>Activity & Handoffs</Text>
                  
                  {/* Simulated timeline comments */}
                  <View style={styles.commentsStack}>
                    <View style={styles.commentCard}>
                      <Text style={styles.commAvatarEmoji}>🎨</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={styles.commHeader}>
                          <Text style={styles.commAuthorName}>Sophia Chen</Text>
                          <Text style={styles.commTime}>2 hours ago</Text>
                        </View>
                        <Text style={styles.commBodyText}>Visual outlines uploaded to shared Figma draft. Commencing high-fidelity layout.</Text>
                      </View>
                    </View>

                    {/* Appended active comments */}
                    {selectedTask.comments && selectedTask.comments.map(c => (
                      <View key={c.id} style={styles.commentCard}>
                        <Text style={styles.commAvatarEmoji}>{c.authorAvatar}</Text>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={styles.commHeader}>
                            <Text style={styles.commAuthorName}>{c.authorName}</Text>
                            <Text style={styles.commTime}>{c.createdAt}</Text>
                          </View>
                          <Text style={styles.commBodyText}>{c.text}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Chat input box */}
                  <View style={styles.commentInputRow}>
                    <TextInput 
                      style={styles.commentInput}
                      placeholder="Comment or status update..."
                      placeholderTextColor="#9CA3AF"
                      value={newCommentText}
                      onChangeText={setNewCommentText}
                    />
                    <TouchableOpacity style={styles.commentSendBtn} onPress={handleCommentSubmit}>
                      <Ionicons name="arrow-up-sharp" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Footer drawers */}
              <View style={styles.modalDrawerFooter}>
                <TouchableOpacity style={styles.editCapsuleBtn} onPress={() => handleOpenEditForm(selectedTask)}>
                  <Ionicons name="create" size={16} color="#111111" style={{ marginRight: 6 }} />
                  <Text style={styles.editCapsuleText}>Edit Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteCapsuleBtn} onPress={() => handleDeleteConfirm(selectedTask.id)}>
                  <Ionicons name="trash" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 2. CREATE/EDIT TASK FORM MODAL (Apple Premium sliding drawer) */}
      <Modal
        visible={taskFormVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTaskFormVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContentContainer, { height: height * 0.9 }]}>
            <View style={styles.modalSheetHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitleText}>{isEditing ? 'Edit Task Details' : 'Publish New Task'}</Text>
                <Text style={styles.modalDescLabel}>Coordinate workload with clear milestones.</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setTaskFormVisible(false)}>
                <Ionicons name="close" size={20} color="#111111" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Title input */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Task Title *</Text>
                <TextInput 
                  style={styles.formTextInput}
                  placeholder="e.g., Integrate OAuth Auth Services"
                  placeholderTextColor="#9CA3AF"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              {/* Description input */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Scope & Deliverables</Text>
                <TextInput 
                  style={[styles.formTextInput, styles.formMultiInput]}
                  placeholder="Draft wireframes, map routes, implement offline caches..."
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={4}
                  value={formDesc}
                  onChangeText={setFormDesc}
                />
              </View>

              {/* Stream Select */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Active Operational Stream *</Text>
                <View style={styles.selectableChipsGrid}>
                  {projects.map(proj => (
                    <TouchableOpacity 
                      key={proj.id}
                      style={[
                        styles.selectableChip, 
                        formProject === proj.id && { backgroundColor: '#111111', borderColor: '#111111' }
                      ]}
                      onPress={() => setFormProject(proj.id)}
                    >
                      <Text style={[
                        styles.selectableChipText, 
                        formProject === proj.id && { color: '#FFFFFF' }
                      ]}>{proj.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Teammate Select */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Assign Operator *</Text>
                <View style={styles.selectableChipsGrid}>
                  {members.map(memb => (
                    <TouchableOpacity 
                      key={memb.id}
                      style={[
                        styles.selectableChip, 
                        formAssignee === memb.id && { backgroundColor: '#111111', borderColor: '#111111' }
                      ]}
                      onPress={() => setFormAssignee(memb.id)}
                    >
                      <Text style={{ marginRight: 4 }}>{memb.avatar}</Text>
                      <Text style={[
                        styles.selectableChipText, 
                        formAssignee === memb.id && { color: '#FFFFFF' }
                      ]}>{memb.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority Select */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Milestone Priority</Text>
                <View style={styles.selectableChipsGrid}>
                  {['Low', 'Medium', 'High'].map(prio => (
                    <TouchableOpacity 
                      key={prio}
                      style={[
                        styles.selectableChip, 
                        formPriority === prio && { backgroundColor: getPriorityColor(prio), borderColor: getPriorityColor(prio) }
                      ]}
                      onPress={() => setFormPriority(prio)}
                    >
                      <Text style={[
                        styles.selectableChipText, 
                        formPriority === prio && { color: '#FFFFFF' }
                      ]}>{prio}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Due date */}
              <View style={styles.formSection}>
                <Text style={styles.formInputLabel}>Due Date (YYYY-MM-DD) *</Text>
                <TextInput 
                  style={styles.formTextInput}
                  placeholder="e.g., 2026-07-28"
                  placeholderTextColor="#9CA3AF"
                  value={formDueDate}
                  onChangeText={setFormDueDate}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalDrawerFooter}>
              <TouchableOpacity style={styles.cancelFormCapsule} onPress={() => setTaskFormVisible(false)}>
                <Text style={styles.cancelFormCapsuleText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitFormCapsule} onPress={handleFormSubmit}>
                <Text style={styles.submitFormCapsuleText}>
                  {isEditing ? 'Save Changes' : 'Initialize Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    padding: 0,
    fontWeight: '600',
  },
  statusTabsWrapper: {
    marginBottom: 10,
  },
  statusTabsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  statusTabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStatusTab: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#111111',
  },
  inactiveStatusTab: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  statusTabText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  activeStatusTabText: {
    color: '#111111',
  },
  inactiveStatusTabText: {
    color: '#6B7280',
  },
  filtersPane: {
    marginBottom: 12,
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterChipBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  filterChipBtnActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  filterChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4B5563',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  priorityHalo: {
    width: 5,
  },
  taskCardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  projectTagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  statusMiniBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusMiniText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardTitleText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: 10,
  },
  footerFieldItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerValue: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalSheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
    paddingBottom: 12,
    marginBottom: 14,
  },
  modalStreamLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#4F46E5',
    letterSpacing: 0.8,
  },
  modalTitleText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInfoPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  infoPanelCol: {
    flex: 1,
    alignItems: 'center',
  },
  borderLeftLine: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  infoPanelLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  infoPanelValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 4,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: 10,
  },
  assigneeAvatarBg: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  assigneeName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  subHeadingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  bodyDescription: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
    fontWeight: '500',
  },
  statusActionPanel: {
    marginBottom: 18,
  },
  statusPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusActionBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 11,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  statusActionText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#4B5563',
  },
  commentsPanel: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: 16,
    marginBottom: 16,
  },
  commentsStack: {
    marginBottom: 12,
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  commAvatarEmoji: {
    fontSize: 18,
    marginTop: 2,
  },
  commHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  commAuthorName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1F2937',
  },
  commTime: {
    fontSize: 8.5,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  commBodyText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
    fontWeight: '500',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  commentInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#1F2937',
    padding: 0,
    fontWeight: '600',
  },
  commentSendBtn: {
    backgroundColor: '#111111',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDrawerFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  editCapsuleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  editCapsuleText: {
    fontSize: 12.5,
    color: '#111111',
    fontWeight: '800',
  },
  deleteCapsuleBtn: {
    width: 48,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  modalDescLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 14,
  },
  formInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  formTextInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  formMultiInput: {
    height: 70,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  selectableChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectableChip: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
  },
  selectableChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '800',
  },
  cancelFormCapsule: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  cancelFormCapsuleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4B5563',
  },
  submitFormCapsule: {
    flex: 2,
    backgroundColor: '#111111',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitFormCapsuleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFF',
  },
});
