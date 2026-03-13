import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';

const BLUE = '#0d8fff';

export default function SettingsScreen() {
  const { cloudflareUrl, saveCloudflareUrl, claudeApiKey, saveClaudeApiKey, syncWithCloud, clients, tasks, prospects } = useAppStore();
  const [urlInput, setUrlInput] = useState(cloudflareUrl);
  const [apiKeyInput, setApiKeyInput] = useState(claudeApiKey);
  const [showKey, setShowKey] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingAi, setTestingAi] = useState(false);

  const handleSaveUrl = async () => {
    await saveCloudflareUrl(urlInput.trim());
    Alert.alert('Saved', 'Cloudflare URL saved.');
  };

  const handleSaveKey = async () => {
    await saveClaudeApiKey(apiKeyInput.trim());
    Alert.alert('Saved', 'Claude API key saved.');
  };

  const handleTestAi = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('No Key', 'Enter your Claude API key first.');
      return;
    }
    setTestingAi(true);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyInput.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 50,
          messages: [{ role: 'user', content: 'Say "API key works!" and nothing else.' }],
        }),
      });
      const data = await response.json();
      if (data?.content?.[0]?.text) {
        Alert.alert('✅ Success', 'Claude API key is working!');
      } else if (data?.error) {
        Alert.alert('❌ Error', data.error.message || 'Invalid API key');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setTestingAi(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncWithCloud();
    setSyncing(false);
    Alert.alert(result.success ? 'Sync Complete' : 'Sync Failed', result.message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Stats */}
        <Text style={styles.sectionLabel}>Data Summary</Text>
        <View style={styles.statsCard}>
          <StatRow icon="people" label="Clients" value={clients.length} />
          <StatRow icon="list" label="Tasks" value={tasks.length} />
          <StatRow icon="business" label="Prospects" value={prospects.length} />
        </View>

        {/* Claude API Key */}
        <Text style={styles.sectionLabel}>Claude API Key</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>
            Required for AI content generation, form creation, and prospect search. Get your key at console.anthropic.com
          </Text>
          <View style={styles.keyRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="sk-ant-..."
              placeholderTextColor="#8e8e93"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowKey(v => !v)} style={styles.eyeBtn}>
              <Ionicons name={showKey ? 'eye-off' : 'eye'} size={18} color="#8e8e93" />
            </TouchableOpacity>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleSaveKey}>
              <Text style={styles.btnText}>Save Key</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { flex: 1 }]}
              onPress={handleTestAi}
              disabled={testingAi}
            >
              {testingAi ? (
                <ActivityIndicator color={BLUE} size="small" />
              ) : (
                <Text style={[styles.btnText, { color: BLUE }]}>Test Key</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Cloudflare URL */}
        <Text style={styles.sectionLabel}>Cloudflare Workers URL</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="https://your-worker.workers.dev"
            placeholderTextColor="#8e8e93"
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <TouchableOpacity style={styles.btn} onPress={handleSaveUrl}>
            <Text style={styles.btnText}>Save URL</Text>
          </TouchableOpacity>
        </View>

        {/* Sync */}
        <Text style={styles.sectionLabel}>Cloud Sync</Text>
        <View style={styles.card}>
          <Text style={styles.cardDesc}>Push all local data to Cloudflare and pull any remote changes.</Text>
          <TouchableOpacity
            style={[styles.syncBtn, syncing && { opacity: 0.6 }]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="sync" size={18} color="#fff" />}
            <Text style={styles.syncBtnText}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={18} color={BLUE} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  sectionLabel: { color: '#8e8e93', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  card: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 16, gap: 12 },
  cardDesc: { color: '#8e8e93', fontSize: 13, lineHeight: 20 },
  statsCard: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 12 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2c2c2e' },
  statLabel: { color: '#fff', flex: 1, fontSize: 15 },
  statValue: { color: '#8e8e93', fontSize: 15 },
  input: { backgroundColor: '#2c2c2e', borderRadius: 10, color: '#fff', fontSize: 14, padding: 12 },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 12, backgroundColor: '#2c2c2e', borderRadius: 10 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { backgroundColor: BLUE, borderRadius: 10, padding: 12, alignItems: 'center' },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: BLUE },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  syncBtn: { backgroundColor: '#30d158', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  syncBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
