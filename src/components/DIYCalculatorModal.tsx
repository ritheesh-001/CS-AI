import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { DIYMaterialEstimate, StructuralType } from '../types/inspection';
import { InspectionEngine } from '../services/inspectionEngine';
import { Colors } from '../theme/colors';
import { Shadows } from '../theme/typography';
import { Calculator, X, MapPin, Wrench, Package, ExternalLink } from 'lucide-react-native';

interface DIYCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  initialEstimate?: DIYMaterialEstimate;
  structuralType?: StructuralType;
  latitude?: number;
  longitude?: number;
}

export const DIYCalculatorModal: React.FC<DIYCalculatorModalProps> = ({
  visible,
  onClose,
  initialEstimate,
  structuralType = 'RESIDENTIAL_WALL',
  latitude,
  longitude,
}) => {
  const [lengthCm, setLengthCm] = useState(
    initialEstimate ? initialEstimate.crackLengthCm.toString() : '45'
  );
  const [widthMm, setWidthMm] = useState(
    initialEstimate ? initialEstimate.crackWidthMm.toString() : '1.8'
  );
  const [depthMm, setDepthMm] = useState(
    initialEstimate ? initialEstimate.crackDepthMm.toString() : '6.0'
  );

  const numLength = parseFloat(lengthCm) || 0;
  const numWidth = parseFloat(widthMm) || 0;
  const numDepth = parseFloat(depthMm) || 0;

  const estimate = InspectionEngine.calculateDIYMaterials(
    numLength,
    numWidth,
    numDepth,
    structuralType
  );

  const handleOpenHardwareLocator = () => {
    let url = 'https://www.google.com/maps/search/hardware+and+construction+chemical+stores+near+me';
    if (latitude && longitude) {
      url = `https://www.google.com/maps/search/hardware+construction+chemicals/@${latitude},${longitude},14z`;
    }
    Linking.openURL(url);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheetCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.iconCircle}>
                <Calculator size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>DIY Material Estimator</Text>
                <Text style={styles.headerSub}>Chemical Compound & Cartridge Calculator</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Dimension Inputs */}
            <Text style={styles.sectionHeading}>ENTER CRACK DIMENSIONS</Text>
            <View style={styles.inputsGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Length (cm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={lengthCm}
                  onChangeText={setLengthCm}
                  keyboardType="numeric"
                  placeholder="e.g. 50"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Width (mm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={widthMm}
                  onChangeText={setWidthMm}
                  keyboardType="numeric"
                  placeholder="e.g. 2.0"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>Depth (mm)</Text>
                <TextInput
                  style={styles.textInput}
                  value={depthMm}
                  onChangeText={setDepthMm}
                  keyboardType="numeric"
                  placeholder="e.g. 8.0"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Formula Explanation Callout */}
            <View style={styles.formulaBanner}>
              <Text style={styles.formulaTitle}>Volume Formula (with 20% waste buffer):</Text>
              <Text style={styles.formulaCode}>
                Volume = [(Length × Width × Depth) / 1000] × 1.2
              </Text>
            </View>

            {/* Calculated Results Card */}
            <View style={styles.resultsCard}>
              <View style={styles.resultItem}>
                <Package size={22} color={Colors.primary} />
                <View style={styles.resultTexts}>
                  <Text style={styles.resultLabel}>Required Volume</Text>
                  <Text style={styles.resultValue}>{estimate.volumeMl} mL</Text>
                </View>
              </View>

              <View style={styles.resultDivider} />

              <View style={styles.resultItem}>
                <Wrench size={22} color="#059669" />
                <View style={styles.resultTexts}>
                  <Text style={styles.resultLabel}>300mL Cartridges</Text>
                  <Text style={[styles.resultValue, { color: '#059669' }]}>
                    {estimate.cartridgesNeeded} {estimate.cartridgesNeeded === 1 ? 'Tube' : 'Tubes'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chemical Suggestion Box */}
            <View style={styles.chemicalBox}>
              <Text style={styles.chemicalHeading}>RECOMMENDED CHEMICAL COMPOUND</Text>
              <Text style={styles.chemicalName}>{estimate.recommendedCompound}</Text>
              <Text style={styles.chemicalDesc}>{estimate.applicationGuidance}</Text>
            </View>

            {/* Hardware Store Locator CTA */}
            <TouchableOpacity
              style={styles.hardwareButton}
              onPress={handleOpenHardwareLocator}
              activeOpacity={0.85}
            >
              <MapPin size={18} color="#FFFFFF" />
              <Text style={styles.hardwareButtonText}>
                Find Nearest Construction Chemical Stores
              </Text>
              <ExternalLink size={16} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  content: {
    padding: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  inputsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  formulaBanner: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  formulaTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  formulaCode: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...Shadows.sm,
  },
  resultItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resultTexts: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  resultDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  chemicalBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  chemicalHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  chemicalName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#78350F',
    marginBottom: 6,
  },
  chemicalDesc: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  hardwareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    gap: 8,
    ...Shadows.card,
  },
  hardwareButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
