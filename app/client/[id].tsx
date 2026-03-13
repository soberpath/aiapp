import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';
import { Phase, Task, TaskStatus } from '../../src/types';
import { PHASE_INFO } from '../../src/data/defaultTasks';

const PHASES: Phase[] = ['discovery', 'strategy', 'implementation', 'review', 'optimization', 'maintenance'];

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clients, tasks, updateTask, deleteClient, generateAiContent, generateAiForm } = useAppStore();

  const client = clients.find(c => c.id === id);
  const clientTasks = tasks.filter(t => t.clientId === id);

  const [expandedPhases, setExpandedPhases] = useState<Set<Phase>>(new Set(['discovery']));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'ai'>('notes');
  const [notesText, setNotesText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Client not found</Text>
      </SafeAreaView>
    );
  }

  const totalTasks = clientTasks.length;
  const completedTasks = clientTasks.filter(t => t.status === 'completed').length;
  const overallProgress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;

  const togglePhase = (phase: Phase) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  };

  const getPhaseTasks = (phase: Phase) => {
    return clientTasks
      .filter(t => t.phase === phase)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const getPhaseCount = (phase: Phase) => {
    const pt = getPhaseTasks(phase);
    const done = pt.filter(t => t.status === 'completed').length;
    return { done, total: pt.length };
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setNotesText(task.notes || '');
    setAiOutput(task.aiContent || '');
    setActiveTab('notes');
  };

  const handleToggleTask = async (task: Task) => {
    const next: TaskStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(task.id, { status: next });
  };

  const handleSaveNotes = async () => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, { notes: notesText });
    setSelectedTask(prev => prev ? { ...prev, notes: notesText } : null);
  };

  const handleGenerateAI = async (type: 'content' | 'form') => {
    if (!selectedTask) return;
    setAiLoading(true);
    setActiveTab('ai');
    try {
      const result = type === 'form'
        ? await generateAiForm(selectedTask.id)
        : await generateAiContent(selectedTask.id);
      setAiOutput(result);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Client', `Delete ${client.name}? All tasks will be deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClient(id!); router.back(); } },
    ]);
  };

  const currentTask = selectedTask
    ? tasks.find(t => t.id === selectedTask.id) || selectedTask
    : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#0d8fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{client.name}</Text>
          <Text style={styles.headerSub}>{client.company} · {client.industry || 'Business'}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.progressPct}>{overallProgress}%</Text>
          <Text style={styles.progressLabel}>complete</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 8 }}>
          <Ionicons name="trash-outline" size={18} color="#ff453a" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarWrap}>
        <View style={[styles.progressBarFill, { width: `${overallProgress}%` as any }]} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {PHASES.map((phase) => {
          const info = PHASE_INFO[phase];
          const { done, total } = getPhaseCount(phase);
          const expanded = expandedPhases.has(phase);
          const phaseTasks = getPhaseTasks(phase);

          return (
            <View key={phase} style={[styles.phaseSection, { borderLeftColor: info.color }]}>
              <TouchableOpacity
                style={styles.phaseHeader}
                onPress={() => togglePhase(phase)}
              >
                <View style={[styles.phaseLabel, { backgroundColor: info.color }]}>
                  <Text style={styles.phaseLabelText}>{info.short}</Text>
                </View>
                <View style={styles.phaseHeaderInfo}>
                  <Text style={styles.phaseTitle}>{info.label}</Text>
                  <Text style={styles.phaseDesc}>{info.description}</Text>
                </View>
                <Text style={[styles.phaseCount, done === total && total > 0 && { color: '#30d158' }]}>
                  {done}/{total}
                </Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#8e8e93"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>

              {expanded && (
                <View style={styles.taskList}>
                  {phaseTasks.map((task) => (
                    <TouchableOpacity
                      key={task.id}
                      style={styles.taskRow}
                      onPress={() => handleTaskPress(task)}
                    >
                      <TouchableOpacity
                        style={[styles.checkbox, task.status === 'completed' && styles.checkboxDone]}
                        onPress={() => handleToggleTask(task)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {task.status === 'completed' && (
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        )}
                      </TouchableOpacity>
                      <View style={styles.taskTextWrap}>
                        <Text style={[styles.taskTitle, task.status === 'completed' && styles.taskDone]}>
                          {task.order}. {task.title}
                        </Text>
                        {task.description ? (
                          <Text style={styles.taskDesc} numberOfLines={1}>{task.description}</Text>
                        ) : null}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#3c3c3e" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal
        visible={!!currentTask}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTask(null)}
      >
        {currentTask && (
          <SafeAreaView style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedTask(null)} style={styles.modalClose}>
                <Ionicons name="close" size={22} color="#8e8e93" />
              </TouchableOpacity>
              <View style={styles.modalBadges}>
                <View style={[styles.phaseBadge, { backgroundColor: PHASE_INFO[currentTask.phase].color + '33' }]}>
                  <Text style={[styles.phaseBadgeText, { color: PHASE_INFO[currentTask.phase].color }]}>
                    {PHASE_INFO[currentTask.phase].short}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: currentTask.status === 'completed' ? '#30d15833' : '#1c1c1e' }]}>
                  <Text style={[styles.statusBadgeText, { color: currentTask.status === 'completed' ? '#30d158' : '#8e8e93' }]}>
                    {currentTask.status === 'completed' ? 'Completed' : currentTask.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{currentTask.order}. {currentTask.title}</Text>
              {currentTask.description ? (
                <Text style={styles.modalDesc}>{currentTask.description}</Text>
              ) : null}

              {/* Action buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, currentTask.status === 'completed' && styles.actionBtnActive]}
                  onPress={() => handleToggleTask(currentTask)}
                >
                  <Ionicons
                    name={currentTask.status === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={16}
                    color={currentTask.status === 'completed' ? '#fff' : '#8e8e93'}
                  />
                  <Text style={[styles.actionBtnText, currentTask.status === 'completed' && { color: '#fff' }]}>
                    {currentTask.status === 'completed' ? 'Reopen' : 'Mark Complete'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiBtn}
                  onPress={() => handleGenerateAI('content')}
                  disabled={aiLoading}
                >
                  <Ionicons name="sparkles-outline" size={16} color="#8e8e93" />
                  <Text style={styles.aiBtnText}>Generate AI Content</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.aiBtn}
                  onPress={() => handleGenerateAI('form')}
                  disabled={aiLoading}
                >
                  <Ionicons name="document-text-outline" size={16} color="#8e8e93" />
                  <Text style={styles.aiBtnText}>Generate Form</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
                  onPress={() => setActiveTab('notes')}
                >
                  <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>Notes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'ai' && styles.tabActive]}
                  onPress={() => setActiveTab('ai')}
                >
                  <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>
                    AI Output {aiOutput ? '✨' : ''}
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'notes' ? (
                <View style={styles.notesWrap}>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add your notes, findings, and observations here..."
                    placeholderTextColor="#8e8e93"
                    value={notesText}
                    onChangeText={setNotesText}
                    multiline
                    textAlignVertical="top"
                  />
                  <TouchableOpacity style={styles.saveNotesBtn} onPress={handleSaveNotes}>
                    <Text style={styles.saveNotesBtnText}>Save Notes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.aiOutputWrap}>
                  {aiLoading ? (
                    <View style={styles.aiLoadingWrap}>
                      <ActivityIndicator color="#0d8fff" size="large" />
                      <Text style={styles.aiLoadingText}>Generating with Claude AI...</Text>
                    </View>
                  ) : aiOutput ? (
                    <>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => Clipboard.setStringAsync(aiOutput)}
                      >
                        <Ionicons name="copy-outline" size={14} color="#8e8e93" />
                        <Text style={styles.copyBtnText}>Copy</Text>
                      </TouchableOpacity>
                      <Text style={styles.aiOutputText}>{aiOutput}</Text>
                    </>
                  ) : (
                    <Text style={styles.aiEmptyText}>
                      Tap "Generate AI Content" or "Generate Form" above to create AI-powered content for this task.
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  errorText: { color: '#8e8e93', textAlign: 'center', padding: 40 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: '#8e8e93', fontSize: 13 },
  headerRight: { alignItems: 'flex-end' },
  progressPct: { color: '#fff', fontSize: 20, fontWeight: '700' },
  progressLabel: { color: '#8e8e93', fontSize: 11 },
  progressBarWrap: { height: 3, backgroundColor: '#2c2c2e', marginHorizontal: 16, borderRadius: 2, marginBottom: 8 },
  progressBarFill: { height: 3, backgroundColor: '#0d8fff', borderRadius: 2 },
  scroll: { flex: 1 },
  phaseSection: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderLeftWidth: 3, backgroundColor: '#1c1c1e', overflow: 'hidden' },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  phaseLabel: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  phaseLabelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  phaseHeaderInfo: { flex: 1 },
  phaseTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  phaseDesc: { color: '#8e8e93', fontSize: 12, marginTop: 1 },
  phaseCount: { color: '#8e8e93', fontSize: 13, fontWeight: '600' },
  taskList: { borderTopWidth: 1, borderTopColor: '#2c2c2e' },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2c2c2e', gap: 12 },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#8e8e93', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#30d158', borderColor: '#30d158' },
  taskTextWrap: { flex: 1 },
  taskTitle: { color: '#fff', fontSize: 14, fontWeight: '500' },
  taskDone: { color: '#8e8e93', textDecorationLine: 'line-through' },
  taskDesc: { color: '#8e8e93', fontSize: 12, marginTop: 2 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2c2c2e' },
  modalClose: { padding: 4 },
  modalBadges: { flexDirection: 'row', gap: 8 },
  phaseBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  phaseBadgeText: { fontSize: 12, fontWeight: '700' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  modalScroll: { flex: 1, padding: 16 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalDesc: { color: '#8e8e93', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  modalActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1c1c1e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  actionBtnActive: { backgroundColor: '#30d158' },
  actionBtnText: { color: '#8e8e93', fontSize: 13, fontWeight: '500' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1c1c1e', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  aiBtnText: { color: '#8e8e93', fontSize: 13, fontWeight: '500' },
  tabs: { flexDirection: 'row', backgroundColor: '#1c1c1e', borderRadius: 10, padding: 3, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#2c2c2e' },
  tabText: { color: '#8e8e93', fontSize: 14 },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  notesWrap: {},
  notesInput: { backgroundColor: '#1c1c1e', borderRadius: 12, color: '#fff', fontSize: 14, padding: 14, minHeight: 200, lineHeight: 22 },
  saveNotesBtn: { backgroundColor: '#0d8fff', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  saveNotesBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  aiOutputWrap: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 14, minHeight: 200 },
  aiLoadingWrap: { alignItems: 'center', padding: 40, gap: 12 },
  aiLoadingText: { color: '#8e8e93', fontSize: 14 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginBottom: 12 },
  copyBtnText: { color: '#8e8e93', fontSize: 13 },
  aiOutputText: { color: '#e0e0e0', fontSize: 14, lineHeight: 22 },
  aiEmptyText: { color: '#8e8e93', fontSize: 14, textAlign: 'center', padding: 20, lineHeight: 22 },
});
