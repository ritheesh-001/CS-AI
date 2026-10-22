import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReportStore } from '@/src/store/reportStore';
import { UserRole } from '@/src/types/user';
import { Colors } from '@/src/theme/colors';
import { Shadows } from '@/src/theme/typography';
import { Shield, User, Building2, CheckCircle2, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const setUserProfile = useReportStore((state) => state.setUserProfile);

  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');
  const [phoneNumber, setPhoneNumber] = useState('9840123456');
  const [otpCode, setOtpCode] = useState('4821');
  const [officialId, setOfficialId] = useState('PWD-TN-4091');
  const [passcode, setPasscode] = useState('8832');

  const handleLogin = async () => {
    if (selectedRole === 'CITIZEN') {
      await setUserProfile({
        name: 'Arun Sundaram',
        phone: `+91 ${phoneNumber}`,
        role: 'CITIZEN',
        isLoggedIn: true,
      });
      router.replace('/(tabs)');
    } else {
      await setUserProfile({
        name: 'Er. R. Senthil Kumar',
        officialId: officialId,
        department: 'Public Works Department (PWD) - Structural Safety Division',
        designation: 'Executive Engineer (Civil)',
        phone: `+91 ${phoneNumber}`,
        role: 'AUTHORITY',
        isLoggedIn: true,
      });
      router.replace('/(authority)/dashboard');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Shield size={36} color="#FFFFFF" />
          </View>
          <Text style={styles.brandTitle}>CrackSense</Text>
          <Text style={styles.brandTagline}>Civic Structural Safety Network</Text>
          <Text style={styles.brandSubtitle}>
            Report, classify, and repair infrastructure hazards in real-time
          </Text>
        </View>

        {/* Google Pay Style Role Selector Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>SELECT ACCESS ROLE</Text>
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'CITIZEN' && styles.roleOptionActive,
              ]}
              onPress={() => setSelectedRole('CITIZEN')}
              activeOpacity={0.8}
            >
              <User
                size={18}
                color={selectedRole === 'CITIZEN' ? Colors.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === 'CITIZEN' && styles.roleOptionTextActive,
                ]}
              >
                Citizen (Public)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'AUTHORITY' && styles.roleOptionActive,
              ]}
              onPress={() => setSelectedRole('AUTHORITY')}
              activeOpacity={0.8}
            >
              <Building2
                size={18}
                color={selectedRole === 'AUTHORITY' ? Colors.primary : '#64748B'}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  selectedRole === 'AUTHORITY' && styles.roleOptionTextActive,
                ]}
              >
                Authority (PWD)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Inputs based on role */}
          {selectedRole === 'CITIZEN' ? (
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Mobile Phone Number</Text>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <Text style={styles.inputLabel}>One-Time Password (OTP)</Text>
              <TextInput
                style={styles.textInput}
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                placeholder="4-digit code"
                placeholderTextColor="#94A3B8"
                maxLength={6}
              />
            </View>
          ) : (
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>PWD Officer / Engineer ID</Text>
              <TextInput
                style={styles.textInput}
                value={officialId}
                onChangeText={setOfficialId}
                placeholder="e.g. PWD-TN-4091"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>Security Passcode / PIN</Text>
              <TextInput
                style={styles.textInput}
                value={passcode}
                onChangeText={setPasscode}
                secureTextEntry
                keyboardType="number-pad"
                placeholder="Official authorization PIN"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}

          {/* Sign In Primary CTA */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>
              {selectedRole === 'CITIZEN'
                ? 'Sign In with Phone'
                : 'Access PWD Control Room'}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Quick Demo Autofill helper */}
          <View style={styles.demoHelperRow}>
            <CheckCircle2 size={14} color="#10B981" />
            <Text style={styles.demoHelperText}>
              Demo Mode Active: Credentials pre-filled for immediate testing
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Shadows.card,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.card,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  roleOptionActive: {
    backgroundColor: '#FFFFFF',
    ...Shadows.sm,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleOptionTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodeBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    marginTop: 6,
    ...Shadows.card,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoHelperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  demoHelperText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
});
