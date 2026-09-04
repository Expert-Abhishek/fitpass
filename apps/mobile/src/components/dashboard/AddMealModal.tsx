import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Camera,
  Utensils,
  Flame,
  Check,
  Sparkles,
} from 'lucide-react-native';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';
import { NewMealPayload } from '../../stores/dashboardStore';

export type { NewMealPayload };

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMeal: (meal: NewMealPayload) => Promise<void> | void;
  onSnapPhotoAI?: () => void;
}

export default function AddMealModal({
  visible,
  onClose,
  onSaveMeal,
  onSnapPhotoAI,
}: AddMealModalProps) {
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mealTypes: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[] = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
  ];

  const handleSave = async () => {
    if (!mealName.trim()) {
      Alert.alert('Missing Field', 'Please enter a meal name or description.');
      return;
    }

    const calNum = Number(calories) || 0;
    const pNum = Number(protein) || 0;
    const cNum = Number(carbs) || 0;
    const fNum = Number(fats) || 0;

    if (calNum === 0 && pNum === 0 && cNum === 0 && fNum === 0) {
      Alert.alert('Missing Calories', 'Please enter estimated calories for this meal.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveMeal({
        name: mealName.trim(),
        type: mealType,
        calories: calNum,
        protein: pNum,
        carbs: cNum,
        fats: fNum,
      });

      // Reset fields on success
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Modal Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.iconCircle}>
                <Utensils size={18} color={NeuTheme.colors.emerald} />
              </View>
              <View>
                <Text style={styles.sheetSubtitle}>MACRO NUTRITION LOG</Text>
                <Text style={styles.sheetTitle}>Add Meal Entry</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X size={18} color={NeuTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* AI Photo Scanner Banner */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                onSnapPhotoAI?.();
              }}
              style={styles.aiSnapBanner}
              activeOpacity={0.88}
            >
              <View style={styles.aiSnapIcon}>
                <Camera size={20} color="#052E16" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.aiTag}>
                  <Sparkles size={10} color="#047857" />
                  <Text style={styles.aiTagText}>COMPUTER VISION SCAN</Text>
                </View>
                <Text style={styles.aiSnapTitle}>Snap Meal with AI Camera</Text>
                <Text style={styles.aiSnapDesc}>Auto-detect portions, calories & macros</Text>
              </View>
            </TouchableOpacity>

            {/* Divider with 'OR MANUAL ENTRY' */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR MANUAL ENTRY</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Meal Type Pill Selector */}
            <Text style={styles.inputLabel}>MEAL CATEGORY</Text>
            <NeuCard variant="inset" padding={4} borderRadius={16} style={styles.mealTypeWell}>
              {mealTypes.map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setMealType(type)}
                    style={[
                      styles.mealTypeBtn,
                      isSelected && styles.mealTypeBtnSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.mealTypeText,
                        isSelected && styles.mealTypeTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </NeuCard>

            {/* Meal Name Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>MEAL / FOOD NAME</Text>
              <NeuCard variant="inset" padding={12} borderRadius={14} style={styles.inputWell}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Grilled Chicken & Quinoa Salad"
                  placeholderTextColor={NeuTheme.colors.textMuted}
                  value={mealName}
                  onChangeText={setMealName}
                />
              </NeuCard>
            </View>

            {/* Calories Input */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>ESTIMATED CALORIES (KCAL)</Text>
              <NeuCard variant="inset" padding={12} borderRadius={14} style={styles.inputWell}>
                <Flame size={16} color={NeuTheme.colors.coral} style={{ marginRight: 6 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 520"
                  placeholderTextColor={NeuTheme.colors.textMuted}
                  keyboardType="numeric"
                  value={calories}
                  onChangeText={setCalories}
                />
              </NeuCard>
            </View>

            {/* 3-Column Macro Inputs (Protein, Carbs, Fats) */}
            <View style={styles.macrosRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>PROTEIN (G)</Text>
                <NeuCard variant="inset" padding={10} borderRadius={14} style={styles.inputWell}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="35"
                    placeholderTextColor={NeuTheme.colors.textMuted}
                    keyboardType="numeric"
                    value={protein}
                    onChangeText={setProtein}
                  />
                </NeuCard>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>CARBS (G)</Text>
                <NeuCard variant="inset" padding={10} borderRadius={14} style={styles.inputWell}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="45"
                    placeholderTextColor={NeuTheme.colors.textMuted}
                    keyboardType="numeric"
                    value={carbs}
                    onChangeText={setCarbs}
                  />
                </NeuCard>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>FATS (G)</Text>
                <NeuCard variant="inset" padding={10} borderRadius={14} style={styles.inputWell}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="14"
                    placeholderTextColor={NeuTheme.colors.textMuted}
                    keyboardType="numeric"
                    value={fats}
                    onChangeText={setFats}
                  />
                </NeuCard>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting}
              style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#052E16" size="small" />
              ) : (
                <>
                  <Check size={18} color="#052E16" strokeWidth={2.6} />
                  <Text style={styles.saveButtonText}>Log Meal into Blueprint</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheetContainer: {
    backgroundColor: NeuTheme.colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: NeuTheme.colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 16,
  },
  aiSnapBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#34D399',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  aiSnapIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.6,
  },
  aiSnapTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#064E3B',
  },
  aiSnapDesc: {
    fontSize: 11.5,
    color: '#065F46',
    fontWeight: '500',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(163, 177, 198, 0.3)',
  },
  dividerText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: NeuTheme.colors.textMuted,
    letterSpacing: 0.8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  mealTypeWell: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  mealTypeBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  mealTypeBtnSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  mealTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: NeuTheme.colors.textSecondary,
  },
  mealTypeTextSelected: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '900',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  inputWell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: NeuTheme.colors.textPrimary,
    padding: 0,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#052E16',
    letterSpacing: 0.2,
  },
});
