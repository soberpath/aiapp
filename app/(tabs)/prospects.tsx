import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../src/store/appStore';

const BLUE = '#0d8fff';

export default function ProspectsScreen() {
  const { prospects, addProspect, deleteProspect, searchProspects } = useAppStore();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const results = await searchProspects(query, location);
      setSearchResults(results);
    } catch (e: any) {
      Alert.alert('Search Error', e.message);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (result: any) => {
    await addProspect({
      businessName: result.name || result.businessName || 'Unknown',
      industry: result.industry || query,
      location: result.location || location,
      website: result.website,
      contactName: result.contactName,
      aiScore: result.score,
      aiSummary: result.summary,
    });
    Alert.alert('Saved', 'Prospect saved.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prospect Search</Text>
        <TouchableOpacity onPress={() => setShowSaved(true)}>
          <View style={styles.savedBadge}>
            <Ionicons name="bookmark" size={16} color={BLUE} />
            {prospects.length > 0 && <Text style={styles.savedCount}>{prospects.length}</Text>}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Business type (e.g. dental office, restaurant)"
          placeholderTextColor="#8e8e93"
          value={query}
          onChangeText={setQuery}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Location (e.g. Austin, TX)"
          placeholderTextColor="#8e8e93"
          value={location}
          onChangeText={setLocation}
        />
        <TouchableOpacity
          style={[styles.searchBtn, searching && { opacity: 0.6 }]}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="sparkles" size={18} color="#fff" />}
          <Text style={styles.searchBtnText}>{searching ? 'Searching with Claude AI...' : 'Search with Claude AI'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {searchResults.length === 0 && !searching && (
          <View style={styles.emptyWrap}>
            <Ionicons name="business-outline" size={48} color="#3c3c3e" />
            <Text style={styles.emptyText}>Search for businesses to find AI consulting prospects</Text>
          </View>
        )}
        {searchResults.map((result, i) => (
          <View key={i} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultName}>{result.name || result.businessName}</Text>
              {result.score && (
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{result.score}%</Text>
                </View>
              )}
            </View>
            {result.industry && <Text style={styles.resultDetail}>{result.industry}</Text>}
            {result.location && <Text style={styles.resultDetail}>📍 {result.location}</Text>}
            {result.phone && <Text style={styles.resultDetail}>📞 {result.phone}</Text>}
            {result.contactName && <Text style={styles.resultDetail}>👤 {result.contactName}</Text>}
            {result.website && <Text style={styles.resultDetail}>🌐 {result.website}</Text>}
            {result.summary && <Text style={styles.resultSummary}>{result.summary}</Text>}
            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(result)}>
              <Ionicons name="bookmark-outline" size={14} color={BLUE} />
              <Text style={styles.saveBtnText}>Save Prospect</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showSaved} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Saved Prospects ({prospects.length})</Text>
            <TouchableOpacity onPress={() => setShowSaved(false)}>
              <Ionicons name="close" size={24} color="#8e8e93" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll}>
            {prospects.length === 0 ? (
              <Text style={styles.emptyText}>No saved prospects yet</Text>
            ) : (
              prospects.map(p => (
                <View key={p.id} style={styles.resultCard}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{p.businessName}</Text>
                    <TouchableOpacity onPress={() => deleteProspect(p.id)}>
                      <Ionicons name="trash-outline" size={18} color="#ff453a" />
                    </TouchableOpacity>
                  </View>
                  {p.industry && <Text style={styles.resultDetail}>{p.industry}</Text>}
                  {p.location && <Text style={styles.resultDetail}>📍 {p.location}</Text>}
                  {p.aiSummary && <Text style={styles.resultSummary}>{p.aiSummary}</Text>}
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  savedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedCount: { color: BLUE, fontSize: 14, fontWeight: '700' },
  searchSection: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  searchInput: { backgroundColor: '#1c1c1e', borderRadius: 10, color: '#fff', fontSize: 15, padding: 12 },
  searchBtn: { backgroundColor: BLUE, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  searchBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  emptyWrap: { alignItems: 'center', padding: 60 },
  emptyText: { color: '#8e8e93', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  resultCard: { backgroundColor: '#1c1c1e', borderRadius: 12, padding: 14, marginBottom: 12 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  resultName: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  scoreBadge: { backgroundColor: '#30d15833', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  scoreText: { color: '#30d158', fontSize: 12, fontWeight: '600' },
  resultDetail: { color: '#8e8e93', fontSize: 13, marginTop: 3 },
  resultSummary: { color: '#aeaeb2', fontSize: 13, marginTop: 8, lineHeight: 20, fontStyle: 'italic' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start' },
  saveBtnText: { color: BLUE, fontSize: 14, fontWeight: '500' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2c2c2e' },
  modalTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
