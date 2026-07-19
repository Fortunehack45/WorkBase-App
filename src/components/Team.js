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

const { height } = Dimensions.get('window');

const EMOJIS = ['💻', '🎨', '💼', '📢', '🚀', '🚀', '⚙️', '🔍', '📈', '📋'];
const ROLES = ['Admin', 'Member', 'Guest', 'Contractor'];
const DEPARTMENTS = ['Product', 'Design', 'Engineering', 'Marketing', 'Operations'];

export default function Team({ data, onAddMember }) {
  const { members, tasks } = data;

  // Local UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Member');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newAvatar, setNewAvatar] = useState('💻');

  const handleInvite = () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('Error', 'Please fill in both name and email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    const payload = {
      name: newName,
      email: newEmail,
      role: newRole,
      department: newDepartment,
      avatar: newAvatar,
      status: 'Online',
    };

    onAddMember(payload);

    setNewName('');
    setNewEmail('');
    setNewRole('Member');
    setNewDepartment('Engineering');
    setNewAvatar('💻');
    setModalVisible(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Online': return '#10B981';
      case 'Busy': return '#EF4444';
      case 'Away': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Teammate Directory</Text>
          <Text style={styles.subtitle}>Coordinate rosters, inspect workload allocation.</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.addBtnText}>Invite</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {members.map((member) => {
          const assignedTasks = tasks.filter(t => t.assigneeId === member.id && t.status !== 'Completed');
          const workloadCount = assignedTasks.length;

          return (
            <View key={member.id} style={styles.memberCard}>
              {/* Round Avatar and status ring */}
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarBg}>
                  <Text style={styles.avatarEmoji}>{member.avatar}</Text>
                </View>
                <View style={[styles.statusRing, { backgroundColor: getStatusColor(member.status) }]} />
              </View>

              {/* Profile details */}
              <View style={styles.profileDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.roleTag}>
                    <Text style={styles.roleText}>{member.role.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.memberEmail}>{member.email}</Text>
                <Text style={styles.departmentText}>{member.department} Team</Text>
              </View>

              {/* Workload badge (Minimalist round metric) */}
              <View style={styles.workloadSection}>
                <View style={[
                  styles.workloadPill,
                  workloadCount > 3 ? styles.heavyWorkload : 
                  workloadCount > 0 ? styles.mediumWorkload : styles.lightWorkload
                ]}>
                  <Text style={[
                    styles.workloadVal,
                    workloadCount > 3 ? { color: '#EF4444' } : 
                    workloadCount > 0 ? { color: '#3B82F6' } : { color: '#10B981' }
                  ]}>{workloadCount}</Text>
                  <Text style={styles.workloadLabel}>tasks</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* INVITE TEAM MODAL */}
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
                <Text style={styles.modalTitle}>Invite Workspace Operator</Text>
                <Text style={styles.modalSubheading}>Provision system and directory access.</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#111111" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name *</Text>
                <TextInput 
                  style={styles.formInput}
                  placeholder="e.g., Katherine Johnson"
                  placeholderTextColor="#9CA3AF"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email Address *</Text>
                <TextInput 
                  style={styles.formInput}
                  placeholder="e.g., katherine@workbase.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newEmail}
                  onChangeText={setNewEmail}
                />
              </View>

              {/* Avatar Emoji picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Choose Profile Emoji</Text>
                <View style={styles.emojiRow}>
                  {EMOJIS.map((emoji) => (
                    <TouchableOpacity 
                      key={emoji}
                      style={[
                        styles.emojiBtn, 
                        newAvatar === emoji && styles.emojiBtnSelected
                      ]}
                      onPress={() => setNewAvatar(emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Dual Column: Role and Dept */}
              <View style={styles.formRow}>
                <View style={[styles.formCol, { marginRight: 6 }]}>
                  <Text style={styles.formLabel}>Workspace Role</Text>
                  <View style={styles.pillStack}>
                    {ROLES.map((role) => (
                      <TouchableOpacity 
                        key={role}
                        style={[
                          styles.pillOption, 
                          newRole === role && styles.pillOptionActive
                        ]}
                        onPress={() => setNewRole(role)}
                      >
                        <Text style={[
                          styles.pillOptionText, 
                          newRole === role && styles.pillOptionTextActive
                        ]}>{role}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[styles.formCol, { marginLeft: 6 }]}>
                  <Text style={styles.formLabel}>Department</Text>
                  <View style={styles.pillStack}>
                    {DEPARTMENTS.map((dept) => (
                      <TouchableOpacity 
                        key={dept}
                        style={[
                          styles.pillOption, 
                          newDepartment === dept && styles.pillOptionActive
                        ]}
                        onPress={() => setNewDepartment(dept)}
                      >
                        <Text style={[
                          styles.pillOptionText, 
                          newDepartment === dept && styles.pillOptionTextActive
                        ]}>{dept}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.formFooterActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitBtn} onPress={handleInvite}>
                <Text style={styles.submitBtnText}>Initialize Operator</Text>
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
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.015,
    shadowRadius: 8,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatarBg: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  statusRing: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.1,
  },
  roleTag: {
    marginLeft: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  roleText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  memberEmail: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
    fontWeight: '500',
  },
  departmentText: {
    fontSize: 10.5,
    fontWeight: '750',
    color: '#4F46E5',
    marginTop: 3,
  },
  workloadSection: {
    marginLeft: 8,
  },
  workloadPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
  },
  lightWorkload: {
    backgroundColor: '#ECFDF5',
  },
  mediumWorkload: {
    backgroundColor: '#EFF6FF',
  },
  heavyWorkload: {
    backgroundColor: '#FEE2E2',
  },
  workloadVal: {
    fontSize: 14.5,
    fontWeight: '900',
  },
  workloadLabel: {
    fontSize: 7.5,
    color: '#6B7280',
    fontWeight: '800',
    marginTop: -2,
    textTransform: 'uppercase',
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
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  emojiBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  emojiBtnSelected: {
    borderColor: '#111111',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 16,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formCol: {
    flex: 1,
  },
  pillStack: {
    flexDirection: 'column',
  },
  pillOption: {
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginBottom: 5,
  },
  pillOptionActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  pillOptionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
  },
  pillOptionTextActive: {
    color: '#FFFFFF',
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
