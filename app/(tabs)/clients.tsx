import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';

const BLUE = '#0d8fff';

export default function ClientsScreen() {
  const router = useRouter();
  const { clients, tasks, addClient } = useAppStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', industry: '', email: '', phone: '' });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.company || !form.email) {
      Alert.alert('Missing fields', 'Name, company and email are required.');
      return;
    }
    await addClient({
      name: form.name, company: form.company, industry: form.industry,
      email: form.email, phone: form.phone, status: 'onboarding',
      currentPhase: 'discovery', progress: 0,
    });
    setForm({ name: '', company: '', industry: '', email: '', phone: '' });
    setShowAdd(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clients</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#8e8e93" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients..."
          placeholderTextColor="#8e8e93"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="people-outline" size={48} color="#3c3c3e" />
            <Text style={styles.emptyText}>No clients yet. Tap + to add one.</Text>
          </View>
        ) : (
          filtered.map(client => {
            const clientTasks = tasks.filter(t => t.clientId === client.id);
            const done = clientTasks.filter(t => t.status === 'completed').length;
            const total = clientTasks.length;
            const pct = total > 0 ? Math.round(done / total * 100) : 0;
            return (
              <TouchableOpacity
                key={client.id}
                style={styles.card}
                onPress={() => router.push(`/client/${client.id}`)}
              >
                <View style={[styles.avatar, { backgroundColor: BLUE + '22' }]}>
                  <Text style={[styles.avatarText, { color: BLUE }]}>
                    {client.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{client.name}</Text>
                  <Text style={styles.company}>{client.company} · {client.industry || 'Business'}</Text>
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                    </View>
                    <Text style={styles.progressText}>{pct}%</Text>
                  </View>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor(client.status) + '22' }]}>
                  <Text style={[styles.badgeText, { color: statusColor(client.status) }]}>{client.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Client</Text>
            <TouchableOpacity onPress={handleAdd}>
              <Text style={styles.saveBtn}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            <Text style={styles.formNote}>All 38 consulting tasks will be automatically created across 6 phases.</Text>
            {[
              { label: 'Client Name *', key: 'name', placeholder: 'Jane Smith' },
              { label: 'Company *', key: 'company', placeholder: 'Acme Corp' },
              { label: 'Industry *', key: 'industry', placeholder: 'Retail, Restaurant, Healthcare...' },
              { label: 'Email *', key: 'email', placeholder: 'jane@acme.com' },
              { label: 'Phone', key: 'phone', placeholder: '555-0100' },
            ].map(field => (
              <View key={field.key} style={styles.formGroup}>
                <Text style={styles.formLabel}>{field.label}</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder={field.placeholder}
                  placeholderTextColor="#8e8e93"
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  keyboardType={field.key === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return '#30d158';
    case 'onboarding': return '#ffd60a';
    case 'paused': return '#ff9f0a';
    case 'completed': return '#8e8e93';
    default: return '#8e8e93';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  addBtn: { backgroundColor: BLUE, borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 10, marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 15, fontWeight: '600' },
  company: { color: '#8e8e93', fontSize: 13, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  progressBar: { flex: 1, height: 3, backgroundColor: '#2c2c2e', borderRadius: 2 },
  progressFill: { height: 3, backgroundColor: BLUE, borderRadius: 2 },
  progressText: { color: '#8e8e93', fontSize: 11, width: 28 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  modal: { flex: 1, backgroundColor: '#000' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2c2c2e' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  cancelBtn: { color: '#8e8e93', fontSize: 16 },
  saveBtn: { color: BLUE, fontSize: 16, fontWeight: '600' },
  modalScroll: { flex: 1, padding: 16 },
  formNote: { backgroundColor: '#0d8fff22', borderRadius: 10, padding: 12, color: '#0d8fff', fontSize: 13, marginBottom: 20, lineHeight: 20 },
  formGroup: { marginBottom: 16 },
  formLabel: { color: '#8e8e93', fontSize: 13, marginBottom: 6 },
  formInput: { backgroundColor: '#1c1c1e', borderRadius: 10, color: '#fff', fontSize: 15, padding: 12 },
});
