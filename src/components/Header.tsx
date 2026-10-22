import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useReportStore } from '../store/reportStore';
import { getTranslation } from '../utils/i18n';
import { Shield, ShieldAlert, ArrowLeftRight, Globe } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useRouter } from 'expo-router';

interface HeaderProps {
  showRoleToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ showRoleToggle = true }) => {
  const router = useRouter();
  const userProfile = useReportStore((state) => state.userProfile);
  const toggleRole = useReportStore((state) => state.toggleRole);
  const setLanguage = useReportStore((state) => state.setLanguage);

  const t = getTranslation(userProfile.language);
  const isAuthority = userProfile.role === 'AUTHORITY';

  const cycleLanguage = () => {
    const nextLang =
      userProfile.language === 'en'
        ? 'ta'
        : userProfile.language === 'ta'
        ? 'hi'
        : 'en';
    setLanguage(nextLang);
  };

  const handleRoleSwitch = async () => {
    await toggleRole();
    if (userProfile.role === 'CITIZEN') {
      router.push('/(authority)/dashboard');
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          {isAuthority ? (
            <ShieldAlert size={20} color="#FFFFFF" />
          ) : (
            <Shield size={20} color="#FFFFFF" />
          )}
        </View>
        <View>
          <Text style={styles.appName}>{t.appName}</Text>
          <Text style={styles.tagline}>
            {isAuthority ? 'PWD Civic Control Room' : t.tagline}
          </Text>
        </View>
      </View>

      <View style={styles.actionsRow}>
        {/* Language switch chip */}
        <TouchableOpacity
          style={styles.langChip}
          onPress={cycleLanguage}
          activeOpacity={0.7}
        >
          <Globe size={14} color="#475569" />
          <Text style={styles.langText}>
            {userProfile.language.toUpperCase()}
          </Text>
        </TouchableOpacity>

        {/* Role toggle button */}
        {showRoleToggle ? (
          <TouchableOpacity
            style={[
              styles.roleChip,
              isAuthority ? styles.authorityChip : styles.citizenChip,
            ]}
            onPress={handleRoleSwitch}
            activeOpacity={0.8}
          >
            <ArrowLeftRight
              size={13}
              color={isAuthority ? '#7C2D12' : '#1E40AF'}
            />
            <Text
              style={[
                styles.roleText,
                isAuthority ? styles.authorityText : styles.citizenText,
              ]}
            >
              {isAuthority ? 'PWD Eng' : 'Public'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  tagline: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  citizenChip: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  authorityChip: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FED7AA',
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  citizenText: {
    color: '#1E40AF',
  },
  authorityText: {
    color: '#9A3412',
  },
});
