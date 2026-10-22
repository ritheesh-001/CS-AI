import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReportStore } from '@/src/store/reportStore';
import { Header } from '@/src/components/Header';
import { AppLanguage } from '@/src/types/user';
import { UtilityDiscountCoupon } from '@/src/types/inspection';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import { getTranslation } from '@/src/utils/i18n';
import {
  User,
  Globe,
  CloudOff,
  RefreshCw,
  PhoneCall,
  ShieldAlert,
  Award,
  ChevronRight,
  LogOut,
  Building2,
  Ticket,
  CheckCircle2,
  TrendingUp,
  Zap,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const userProfile = useReportStore((state: any) => state.userProfile);
  const karmaProfile = useReportStore((state: any) => state.karmaProfile);
  const redeemCoupon = useReportStore((state: any) => state.redeemCoupon);
  const setLanguage = useReportStore((state: any) => state.setLanguage);
  const toggleRole = useReportStore((state: any) => state.toggleRole);
  const syncOfflineQueue = useReportStore((state: any) => state.syncOfflineQueue);
  const offlineQueueCount = useReportStore((state: any) => state.offlineQueueCount);

  const t = getTranslation(userProfile.language);
  const isAuthority = userProfile.role === 'AUTHORITY';

  const languages: { code: AppLanguage; label: string; sub: string }[] = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  ];

  const handleSync = async () => {
    await syncOfflineQueue();
    Alert.alert('Sync Handshake Succeeded', 'All offline cached crack reports and road patrol jolts have been synchronized.');
  };

  const handleRedeemCoupon = async (coupon: UtilityDiscountCoupon) => {
    if (coupon.isRedeemed) return;
    const success = await redeemCoupon(coupon.id);
    if (success) {
      Alert.alert(
        'Discount Code Activated! 🎉',
        `Code: ${coupon.code}\n${coupon.title} is now active. Present on municipal portal or utility counter for deduction.`
      );
    } else {
      Alert.alert(
        'Insufficient Civic Karma',
        `You need ${coupon.requiredKarmaPoints} Karma points to claim this subsidy voucher.`
      );
    }
  };

  const handleRoleToggle = async () => {
    await toggleRole();
    if (userProfile.role === 'CITIZEN') {
      router.push('/(authority)/dashboard' as any);
    } else {
      router.push('/(tabs)');
    }
  };

  const tierProgress = Math.min(
    100,
    Math.round((karmaProfile.totalPoints / karmaProfile.nextTierPoints) * 100)
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            {isAuthority ? (
              <Building2 size={32} color="#FFFFFF" />
            ) : (
              <User size={32} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userPhone}>{userProfile.phone}</Text>
            <View
              style={[
                styles.roleBadge,
                isAuthority ? styles.authorityBadge : styles.citizenBadge,
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  isAuthority ? styles.authorityText : styles.citizenText,
                ]}
              >
                {isAuthority
                  ? 'Official PWD Engineer'
                  : 'Verified Civic Citizen'}
              </Text>
            </View>
          </View>
        </View>

        {/* Module 8: Civic Karma & Gamification Hero Card */}
        <View style={styles.karmaCard}>
          <View style={styles.karmaTopRow}>
            <View style={styles.karmaIconWrap}>
              <Award size={26} color="#FFFFFF" />
            </View>
            <View style={styles.karmaTextCol}>
              <Text style={styles.karmaTag}>CIVIC KARMA & SENTINEL TIER</Text>
              <Text style={styles.karmaBadgeTitle}>{karmaProfile.currentBadge}</Text>
            </View>
            <View style={styles.karmaPointsPill}>
              <Text style={styles.karmaPointsNum}>{karmaProfile.totalPoints}</Text>
              <Text style={styles.karmaPointsUnit}>PTS</Text>
            </View>
          </View>

          {/* Progress to next tier */}
          <View style={styles.tierProgressBox}>
            <View style={styles.tierLabelsRow}>
              <Text style={styles.tierSub}>Next Rank: Chief Structural Guardian</Text>
              <Text style={styles.tierSub}>{karmaProfile.totalPoints}/{karmaProfile.nextTierPoints} pts</Text>
            </View>
            <View style={styles.tierTrack}>
              <View style={[styles.tierFill, { width: `${tierProgress}%` }]} />
            </View>
          </View>

          {/* Points Breakdown Matrix */}
          <View style={styles.pointsGrid}>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsItemNum}>+{karmaProfile.uniqueReportsCount * 50}</Text>
              <Text style={styles.pointsItemLabel}>Unique Scans (+50 ea)</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsItemNum}>+{karmaProfile.rescanProgressionCount * 10}</Text>
              <Text style={styles.pointsItemLabel}>Re-scans (+10 ea)</Text>
            </View>
            <View style={styles.pointsDivider} />
            <View style={styles.pointsItem}>
              <Text style={[styles.pointsItemNum, { color: '#4ADE80' }]}>
                +{karmaProfile.workOrdersTriggeredCount * 100}
              </Text>
              <Text style={styles.pointsItemLabel}>PWD Orders (+100 ea)</Text>
            </View>
          </View>
        </View>

        {/* Module 8: Utility Bill Discount Coupons */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>MUNICIPAL UTILITY SUBSIDY COUPONS</Text>
          <View style={styles.couponsList}>
            {karmaProfile.availableCoupons.map((coupon: UtilityDiscountCoupon) => (
              <View key={coupon.id} style={styles.couponCard}>
                <View style={styles.couponLeft}>
                  <Ticket size={22} color={coupon.isRedeemed ? '#94A3B8' : Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.couponTitle,
                        coupon.isRedeemed && { textDecorationLine: 'line-through', color: '#94A3B8' },
                      ]}
                    >
                      {coupon.title}
                    </Text>
                    <Text style={styles.couponSub}>{coupon.description}</Text>
                    <Text style={styles.couponCost}>
                      Cost: {coupon.requiredKarmaPoints} Karma Points
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.redeemBtn,
                    coupon.isRedeemed && styles.redeemBtnDone,
                  ]}
                  onPress={() => handleRedeemCoupon(coupon)}
                  disabled={coupon.isRedeemed}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.redeemBtnText,
                      coupon.isRedeemed && styles.redeemBtnTextDone,
                    ]}
                  >
                    {coupon.isRedeemed ? 'Redeemed' : 'Claim'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Module 5: Offline Queue & Sync */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>OFFLINE DATA & SYNC</Text>
          <View style={styles.menuRow}>
            <View style={styles.menuIconWrap}>
              <CloudOff size={20} color="#64748B" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Offline Cache Queue</Text>
              <Text style={styles.menuSub}>
                {offlineQueueCount} reports stored locally pending cloud upload
              </Text>
            </View>
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={handleSync}
              activeOpacity={0.8}
            >
              <RefreshCw size={14} color="#FFFFFF" />
              <Text style={styles.syncBtnText}>Sync</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Multi-Language Switcher */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>LANGUAGE SELECTION (மொழி / भाषा)</Text>
          <View style={styles.langGrid}>
            {languages.map((lang) => {
              const isActive = userProfile.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langCard, isActive && styles.langCardActive]}
                  onPress={() => setLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>
                    {lang.label}
                  </Text>
                  <Text style={styles.langSub}>{lang.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Account & Role Switcher */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionHeader}>ACCOUNT & ACCESS</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={handleRoleToggle}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIconWrap,
                { backgroundColor: isAuthority ? '#EFF6FF' : '#FFEDD5' },
              ]}
            >
              <Building2
                size={20}
                color={isAuthority ? Colors.primary : '#D97706'}
              />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>
                {isAuthority
                  ? 'Switch to Citizen Public View'
                  : 'Switch to PWD Authority Mode'}
              </Text>
              <Text style={styles.menuSub}>
                {isAuthority
                  ? 'View standard scanning portal'
                  : 'Enter engineer triage and team dispatch feed'}
              </Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuRow, { marginTop: 12 }]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <LogOut size={20} color="#DC2626" />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={[styles.menuTitle, { color: '#DC2626' }]}>
                Sign Out / Switch User
              </Text>
              <Text style={styles.menuSub}>Return to authentication screen</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Emergency Helplines */}
        <View style={styles.helplineCard}>
          <Text style={styles.helplineHeading}>EMERGENCY INFRASTRUCTURE CONTACTS</Text>
          <View style={styles.helplineItem}>
            <PhoneCall size={16} color="#DC2626" />
            <Text style={styles.helplineText}>
              National Disaster Response Force (NDRF):{' '}
              <Text style={styles.helplinePhone}>1078</Text>
            </Text>
          </View>
          <View style={styles.helplineItem}>
            <PhoneCall size={16} color="#DC2626" />
            <Text style={styles.helplineText}>
              State Disaster Management Authority:{' '}
              <Text style={styles.helplinePhone}>1070</Text>
            </Text>
          </View>
          <View style={styles.helplineItem}>
            <PhoneCall size={16} color="#DC2626" />
            <Text style={styles.helplineText}>
              State Public Works Emergency Cell:{' '}
              <Text style={styles.helplinePhone}>1800 425 2424</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.card,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
  },
  citizenBadge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  authorityBadge: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  citizenText: {
    color: '#1E40AF',
  },
  authorityText: {
    color: '#9A3412',
  },
  karmaCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    ...Shadows.card,
  },
  karmaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  karmaIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  karmaTextCol: {
    flex: 1,
  },
  karmaTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  karmaBadgeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  karmaPointsPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 3,
  },
  karmaPointsNum: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4ADE80',
  },
  karmaPointsUnit: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tierProgressBox: {
    marginBottom: 16,
  },
  tierLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tierSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  tierTrack: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  tierFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 3,
  },
  pointsGrid: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  pointsItem: {
    flex: 1,
    alignItems: 'center',
  },
  pointsItemNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pointsItemLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    textAlign: 'center',
  },
  pointsDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.sm,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  couponsList: {
    gap: 10,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  couponLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  couponSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  couponCost: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  redeemBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  redeemBtnDone: {
    backgroundColor: '#E2E8F0',
  },
  redeemBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  redeemBtnTextDone: {
    color: '#64748B',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  langGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  langCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  langCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  langLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  langLabelActive: {
    color: Colors.primary,
  },
  langSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  helplineCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  helplineHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  helplineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helplineText: {
    fontSize: 12,
    color: '#7F1D1D',
    flex: 1,
  },
  helplinePhone: {
    fontWeight: '800',
    color: '#DC2626',
  },
});
