import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReportStore } from '@/src/store/reportStore';
import { Header } from '@/src/components/Header';
import { CrackReport, ReportStatus, SeverityLevel } from '@/src/types/inspection';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import {
  Search,
  MapPin,
  ChevronRight,
  FileQuestion,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react-native';

export default function ReportsScreen() {
  const router = useRouter();
  const reports = useReportStore((state: any) => state.reports as CrackReport[]);

  const [activeTab, setActiveTab] = useState<'ALL' | ReportStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Find any closed-loop repaired report for citizen congratulation banner
  const repairedHighlight = reports.find(
    (r: CrackReport) => r.status === 'REPAIRED' && r.proofOfWork?.repairProofPhotoUri
  );

  const filteredReports = reports.filter((item: CrackReport) => {
    const matchesTab = activeTab === 'ALL' || item.status === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.id.toLowerCase().includes(query) ||
      (item.address && item.address.toLowerCase().includes(query)) ||
      item.structuralType.toLowerCase().includes(query);

    return matchesTab && matchesQuery;
  });

  const renderStatusBadge = (status: ReportStatus) => {
    const config = Colors.status[status] || Colors.status.PENDING;
    return (
      <View
        style={[
          styles.statusPill,
          { backgroundColor: config.bg, borderColor: config.border },
        ]}
      >
        <Text style={[styles.statusText, { color: config.text }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderSeverityBadge = (severity: SeverityLevel) => {
    const config =
      severity === 'HIGH'
        ? Colors.severity.high
        : severity === 'MEDIUM'
        ? Colors.severity.medium
        : Colors.severity.low;

    return (
      <View
        style={[
          styles.severityPill,
          { backgroundColor: config.bg, borderColor: config.border },
        ]}
      >
        <Text style={[styles.severityText, { color: config.text }]}>
          {severity}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <View style={styles.content}>
        {/* Module 6: Citizen Closed-Loop Feedback Card */}
        {repairedHighlight && (
          <TouchableOpacity
            style={styles.repairedFeedbackCard}
            onPress={() => router.push(`/inspection/${repairedHighlight.id}` as any)}
            activeOpacity={0.85}
          >
            <View style={styles.repairedIconBox}>
              <ShieldCheck size={26} color="#059669" />
            </View>
            <View style={styles.repairedTextBox}>
              <View style={styles.repairedHeaderRow}>
                <Text style={styles.repairedCardTag}>CLOSED-LOOP RESOLUTION</Text>
                <View style={styles.verifiedSeal}>
                  <CheckCircle2 size={11} color="#FFFFFF" />
                  <Text style={styles.verifiedSealText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.repairedTitle}>
                "Your report fixed {repairedHighlight.structuralType.replace('_', ' ')} on{' '}
                {repairedHighlight.address?.split(',')[0]}."
              </Text>
              <Text style={styles.repairedSub}>
                Municipal repair certified with verified before/after proof of work.
              </Text>
            </View>
            <ChevronRight size={18} color="#059669" />
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, location, or component..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills Horizontal Bar */}
        <View style={styles.filterBar}>
          {(['ALL', 'PENDING', 'ACKNOWLEDGED', 'INSPECTED', 'REPAIRED'] as const).map(
            (tab) => {
              const isSelected = activeTab === tab;
              const count =
                tab === 'ALL'
                  ? reports.length
                  : reports.filter((r: CrackReport) => r.status === tab).length;

              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.filterTab,
                    isSelected && styles.filterTabSelected,
                  ]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      isSelected && styles.filterTabTextSelected,
                    ]}
                  >
                    {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Reports List */}
        <FlatList
          data={filteredReports}
          keyExtractor={(item: CrackReport) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileQuestion size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Submissions Found</Text>
              <Text style={styles.emptySubtitle}>
                No structural crack reports match your current filter criteria.
              </Text>
            </View>
          }
          renderItem={({ item }: { item: CrackReport }) => {
            const hasProgression = !!item.progressionDelta;
            const hasRepairProof = item.status === 'REPAIRED' && !!item.proofOfWork?.repairProofPhotoUri;

            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/inspection/${item.id}` as any)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.imageUri }} style={styles.cardImage} />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardId}>{item.id}</Text>
                    {renderSeverityBadge(item.severity)}
                  </View>

                  <Text style={styles.cardComponent}>
                    {item.structuralType.replace('_', ' ')}
                  </Text>

                  <View style={styles.addressRow}>
                    <MapPin size={12} color="#64748B" />
                    <Text style={styles.addressText} numberOfLines={1}>
                      {item.address || 'Chennai Municipal Area'}
                    </Text>
                  </View>

                  {/* Badges strip: Progression / Proof of Work */}
                  <View style={styles.featureBadgesRow}>
                    {hasProgression && (
                      <View style={styles.progressionChip}>
                        <Layers size={10} color={Colors.primary} />
                        <Text style={styles.progressionChipText}>
                          {item.progressionDelta?.growthBadge}
                        </Text>
                      </View>
                    )}

                    {hasRepairProof && (
                      <View style={styles.proofChip}>
                        <CheckCircle2 size={10} color="#059669" />
                        <Text style={styles.proofChipText}>Proof of Work</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.widthTag}>
                      <Text style={styles.widthLabel}>Width:</Text>
                      <Text style={styles.widthValue}>{item.crackWidthMm}mm</Text>
                    </View>

                    {renderStatusBadge(item.status)}
                  </View>
                </View>

                <View style={styles.chevronWrap}>
                  <ChevronRight size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  repairedFeedbackCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    ...Shadows.sm,
  },
  repairedIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repairedTextBox: {
    flex: 1,
  },
  repairedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  repairedCardTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  verifiedSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  verifiedSealText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  repairedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
    lineHeight: 18,
  },
  repairedSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  filterTab: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterTabSelected: {
    backgroundColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTabTextSelected: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.sm,
  },
  cardImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  severityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardComponent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 3,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  featureBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 3,
  },
  progressionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  progressionChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  proofChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proofChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  widthTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  widthLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  widthValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronWrap: {
    paddingLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },
});
