import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

const COLOR_PALETTE = [
  '#3B82F6', // Royal Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Teal
  '#111111', // Obsidian Black
];

const CATEGORIES = ['Design', 'Engineering', 'Marketing', 'Operations', 'Finance', 'Product'];

export default function Projects({ data, onAddProject }) {
  const { projects, tasks } = data;

  // Local UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjCategory, setNewProjCategory] = useState('Product');
  const [newProjColor, setNewProjColor] = useState('#3B82F6');

  const handleCreateProject = () => {
    if (!newProjName.trim()) {
      Alert.alert('Error', 'Please enter a project name.');
      return;
    }

    const payload = {
      name: newProjName,
      description: newProjDesc,
      category: newProjCategory,
      color: newProjColor,
    };

    onAddProject(payload);

    setNewProjName('');
    setNewProjDesc('');
    setNewProjCategory('Product');
    setNewProjColor('#3B82F6');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Workspace Streams</Text>
          <Text style={styles.subtitle}>Segment workflows, track milestone velocities.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.addBtnText}>New Stream</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {projects.map((proj) => {
          const projTasks = tasks.filter(t => t.projectId === proj.id);
          const total = projTasks.length;
          const completed = projTasks.filter(t => t.status === 'Completed').length;
          const inProgress = projTasks.filter(t => t.status === 'In Progress').length;
          const review = projTasks.filter(t => t.status === 'In Review').length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <View key={proj.id} style={styles.projectCard}>
              {/* Colored side bar */}
              <View style={[styles.coloredIndicator, { backgroundColor: proj.color }]} />

              <View style={styles.cardContent}>
                {/* Project Title and progress badge */}
                <View style={styles.projectHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.projectName}>{proj.name}</Text>
                    <Text style={[styles.categoryTag, { color: proj.color }]}>{proj.category.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.progressBadge, { backgroundColor: `${proj.color}0D` }]}>
                    <Text style={[styles.percentText, { color: proj.color }]}>{percentage}%</Text>
                    <Text style={styles.percentLabel}>DONE</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.projectDesc}>{proj.description || 'No focus description provided.'}</Text>

                {/* Liquid Progress Bar */}
                <View style={styles.progressBarWrapper}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: proj.color }]} />
                  </View>
                </View>

                {/* Stats Breakdown (Minimalist Pill Grid) */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCell}>
                    <Text style={styles.statVal}>{total}</Text>
                    <Text style={styles.statLabel}>Tasks</Text>
                  </View>
                  <View style={[styles.statCell, styles.borderLeft]}>
                    <Text style={[styles.statVal, { color: '#3B82F6' }]}>{inProgress}</Text>
                    <Text style={styles.statLabel}>Active</Text>
                  </View>
                  <View style={[styles.statCell, styles.borderLeft]}>
                    <Text style={[styles.statVal, { color: '#F59E0B' }]}>{review}</Text>
                    <Text style={styles.statLabel}>Review</Text>
                  </View>
                  <View style={[styles.statCell, styles.borderLeft]}>
                    <Text style={[styles.statVal, { color: '#10B981' }]}>{completed}</Text>
                    <Text style={styles.statLabel}>Done</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {projects.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Empty streams</Text>
            <Text style={styles.emptySubtext}>Initialize operations by creating a dedicated project stream.</Text>
          </View>
        )}
      </ScrollView>

      {/* CREATE PROJECT MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContentContainer, { height: height * 0.85 }]}>
            <View style={styles.modalSheetHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Initialize Operational Stream</Text>
                <Text style={styles.modalSubheading}>Group associated milestones and assignees cleanly.</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#111111" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Project Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Stream Name *</Text>
                <TextInput 
                  style={styles.formInput}
                  placeholder="e.g., Enterprise Client Portal v2"
                  placeholderTextColor="#9CA3AF"
                  value={newProjName}
                  onChangeText={setNewProjName}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput 
                  style={[styles.formInput, styles.formInputMultiline]}
                  placeholder="Explain stream milestones, goals, or core deliverables..."
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                  numberOfLines={3}
                  value={newProjDesc}
                  onChangeText={setNewProjDesc}
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Stream Category</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity 
                      key={cat}
                      style={[
                        styles.categoryBtn, 
                        newProjCategory === cat && styles.activeCategoryBtn
                      ]}
                      onPress={() => setNewProjCategory(cat)}
                    >
                      <Text style={[
                        styles.categoryBtnText, 
                        newProjCategory === cat && styles.activeCategoryBtnText
                      ]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Accent Color Palette (Color bubble picker) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Theme Accent Color</Text>
                <View style={styles.colorPaletteRow}>
                  {COLOR_PALETTE.map((color) => (
                    <TouchableOpacity 
                      key={color}
                      style={[
                        styles.colorBubble, 
                        { backgroundColor: color },
                        newProjColor === color && styles.colorBubbleSelected
                      ]}
                      onPress={() => setNewProjColor(color)}
                    >
                      {newProjColor === color && (
                        <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Modal actions */}
            <View style={styles.formFooterActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateProject}>
                <Text style={styles.submitBtnText}>Initialize Stream</Text>
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
    paddingBottom: 14,
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
    fontWeight: '500',
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
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 8,
    elevation: 1,
  },
  coloredIndicator: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  projectHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 14.5,
    fontWeight: '850',
    color: '#1F2937',
    letterSpacing: -0.2,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  progressBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  percentText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  percentLabel: {
    fontSize: 7.5,
    color: '#6B7280',
    fontWeight: '800',
    marginTop: 1,
  },
  projectDesc: {
    fontSize: 12.5,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: '500',
  },
  progressBarWrapper: {
    marginBottom: 14,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  statsGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: 10,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.03)',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '850',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 9.5,
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
    paddingHorizontal: 28,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justify('flex-end'): 'flex-end', // Fix fallback safety
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubheading: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    width: '90%',
    fontWeight: '500',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formScroll: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  formInput: {
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
  formInputMultiline: {
    height: 65,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: '#F9FAFB',
  },
  activeCategoryBtn: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  categoryBtnText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '800',
  },
  activeCategoryBtnText: {
    color: '#FFFFFF',
  },
  colorPaletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  colorBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  colorBubbleSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  formFooterActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
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
  cancelBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#4B5563',
  },
  submitBtn: {
    flex: 2,
    backgroundColor: '#111111',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFF',
  },
});
