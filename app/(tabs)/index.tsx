import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';

const BLUE = '#0d8fff';

export default function DashboardScreen() {
  const router = useRouter();
  const { clients, tasks } = useAppStore();

  const activeClients = clients.filter(c => c.status === 'active').length;
  const onboarding = clients.filter(c => c.status === 'onboarding').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;

  const recentClients = clients.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Velocity</Text>
        <Text style={styles.headerSub}>Dashboard</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Active Clients" value={activeClients} icon="people" color="#30d158" />
          <StatCard label="Onboarding" value={onboarding} icon="time" color="#ffd60a" />
          <StatCard label="Open Tasks" value={pendingTasks} icon="list" color={BLUE} />
          <StatCard label="Done Tasks" value={completedTasks} icon="checkmark-circle" color="#30d158" />
        </View>

        {/* Recent Clients */}
        <Text style={styles.sectionTitle}>Recent Clients</Text>
        {recentClients.length === 0 ? (
          <Text style={styles.emptyText}>No clients yet</Text>
        ) : (
          recentClients.map(client => (
            <TouchableOpacity
              key={client.id}
              style={styles.clientCard}
              onPress={() => router.push(`/client/${client.id}`)}
            >
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientCompany}>{client.company}</Text>
                <Text style={styles.clientPhase}>{client.currentPhase}</Text>
              </View>
              <View style={styles.clientRight}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(client.status) + '33' }]}>
                  <Text style={[styles.statusText, { color: statusColor(client.status) }]}>{client.status}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${client.progress}%` as any, backgroundColor: BLUE }]} />
                </View>
                <Text style={styles.progressText}>{client.progress}%</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  headerSub: { color: '#8e8e93', fontSize: 14 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: '#1c1c1e', borderRadius: 12,
    padding: 14, borderLeftWidth: 3, alignItems: 'flex-start',
  },
  statValue: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  statLabel: { color: '#8e8e93', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  emptyText: { color: '#8e8e93', textAlign: 'center', padding: 20 },
  clientCard: {
    backgroundColor: '#1c1c1e', borderRadius: 12, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
  },
  clientInfo: { flex: 1 },
  clientName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  clientCompany: { color: '#8e8e93', fontSize: 13, marginTop: 2 },
  clientPhase: { color: '#0d8fff', fontSize: 12, marginTop: 4, textTransform: 'capitalize' },
  clientRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  progressBar: { width: 80, height: 4, backgroundColor: '#2c2c2e', borderRadius: 2, marginTop: 8 },
  progressFill: { height: 4, borderRadius: 2 },
  progressText: { color: '#8e8e93', fontSize: 11, marginTop: 2 },
});
