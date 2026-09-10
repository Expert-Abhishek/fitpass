import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import {
  Camera,
  Image as ImageIcon,
  X,
  Sparkles,
  Check,
  RefreshCw,
  Flame,
  Dna,
  Wheat,
  Droplet,
  Info,
  ChevronRight,
  ShieldCheck,
  Edit3,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { NeuTheme } from '../../theme/neumorphic';
import NeuCard from '../neumorphic/NeuCard';
import {
  analyzeFoodImageWithGemini,
  GeminiMealNutrition,
  getMealTypeByCurrentTime,
} from '../../lib/geminiNutrition';
import { NewMealPayload } from '../../stores/dashboardStore';

interface AIMealScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveMeal: (meal: NewMealPayload) => Promise<void> | void;
}

export default function AIMealScannerModal({
  visible,
  onClose,
  onSaveMeal,
}: AIMealScannerModalProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<GeminiMealNutrition | null>(null);

  // Editable fields after scan
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [scanStatusText, setScanStatusText] = useState('Initializing Gemini Vision...');

  // Laser scanner animation
  const [scanAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isAnalyzing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [isAnalyzing]);

  useEffect(() => {
    if (visible) {
      setMealType(getMealTypeByCurrentTime());
    } else {
      // Reset state when closed
      setImageUri(null);
      setImageBase64(null);
      setAnalysisResult(null);
      setIsAnalyzing(false);
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setFiber('');
    }
  }, [visible]);

  // Request permissions & take photo with camera
  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'FitPass needs camera access to scan and analyze your meal.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        if (asset.base64) {
          processImageWithGemini(asset.base64);
        }
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err.message || 'Could not open camera.');
    }
  };

  // Pick photo from device gallery
  const handlePickGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photo Library Permission Required',
          'FitPass needs photo library access to upload meal photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setImageUri(asset.uri);
        setImageBase64(asset.base64 || null);
        if (asset.base64) {
          processImageWithGemini(asset.base64);
        }
      }
    } catch (err: any) {
      Alert.alert('Gallery Error', err.message || 'Could not pick image.');
    }
  };

  // Run Gemini Flash Vision Analysis
  const processImageWithGemini = async (base64: string) => {
    setIsAnalyzing(true);
    setScanStatusText('Scanning plate & recognizing food items...');

    const timer1 = setTimeout(() => {
      setScanStatusText('Estimating portion weights & macro distribution...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setScanStatusText('Gemini Flash computing nutrition facts...');
    }, 2400);

    try {
      const nutrition = await analyzeFoodImageWithGemini(base64, 'image/jpeg');
      setAnalysisResult(nutrition);
      setMealName(nutrition.meal_name);
      setMealType(nutrition.meal_type);
      setCalories(String(nutrition.calories));
      setProtein(String(nutrition.protein));
      setCarbs(String(nutrition.carbs));
      setFats(String(nutrition.fats));
      setFiber(String(nutrition.fiber));
    } catch (err: any) {
      console.error('[AIMealScannerModal] Scan error:', err);
      Alert.alert(
        'AI Vision Scan Notice',
        err.message || 'Could not complete Gemini Flash analysis. You can enter details manually.'
      );
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsAnalyzing(false);
    }
  };

  // Re-run scan on same photo
  const handleReanalyze = () => {
    if (imageBase64) {
      processImageWithGemini(imageBase64);
    }
  };

  // Save to Dashboard / Daily Blueprint
  const handleSaveToBlueprint = async () => {
    const finalMealName = mealName.trim() || 'Scanned Meal';
    const calNum = Number(calories) || 0;
    const pNum = Number(protein) || 0;
    const cNum = Number(carbs) || 0;
    const fNum = Number(fats) || 0;

    if (calNum === 0 && pNum === 0 && cNum === 0 && fNum === 0) {
      Alert.alert('Incomplete Data', 'Please enter estimated calories or macros.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveMeal({
        name: finalMealName,
        type: mealType,
        calories: calNum,
        protein: pNum,
        carbs: cNum,
        fats: fNum,
      });

      onClose();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message || 'Could not record meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mealTypes: ('Breakfast' | 'Lunch' | 'Dinner' | 'Snack')[] = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snack',
  ];

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.dragHandle} />
          <View style={styles.sheetHeader}>
            <View style={styles.headerTitleRow}>
              <View style={styles.aiBadgeIcon}>
                <Sparkles size={18} color="#047857" />
              </View>
              <View>
                <View style={styles.poweredByRow}>
                  <Text style={styles.poweredByText}>POWERED BY GOOGLE AI STUDIO</Text>
                  <View style={styles.flashBadge}>
                    <Text style={styles.flashBadgeText}>GEMINI FLASH</Text>
                  </View>
                </View>
                <Text style={styles.sheetTitle}>AI Vision Meal Scanner</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={18} color={NeuTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Step 1: Photo Capture / Upload Area */}
            {!imageUri ? (
              <View style={styles.pickerSection}>
                <NeuCard variant="flat" padding={20} borderRadius={22} style={styles.pickerCard}>
                  <View style={styles.pickerIllustration}>
                    <Camera size={36} color={NeuTheme.colors.emerald} />
                  </View>
                  <Text style={styles.pickerHeading}>Snap or Upload Meal Photo</Text>
                  <Text style={styles.pickerSubheading}>
                    Gemini Flash will identify food items, estimate portion sizes, and calculate calories + macros instantly.
                  </Text>

                  <View style={styles.pickerButtonsRow}>
                    <TouchableOpacity
                      onPress={handleTakePhoto}
                      style={styles.primaryPickerBtn}
                      activeOpacity={0.85}
                    >
                      <Camera size={18} color="#052E16" strokeWidth={2.4} />
                      <Text style={styles.primaryPickerBtnText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handlePickGallery}
                      style={styles.secondaryPickerBtn}
                      activeOpacity={0.85}
                    >
                      <ImageIcon size={18} color={NeuTheme.colors.textPrimary} strokeWidth={2.2} />
                      <Text style={styles.secondaryPickerBtnText}>Upload Photo</Text>
                    </TouchableOpacity>
                  </View>
                </NeuCard>
              </View>
            ) : (
              /* Image Preview & Scanning HUD */
              <View style={styles.previewSection}>
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />

                  {/* Corner Crosshair Overlays */}
                  <View style={[styles.crosshair, styles.crosshairTL]} />
                  <View style={[styles.crosshair, styles.crosshairTR]} />
                  <View style={[styles.crosshair, styles.crosshairBL]} />
                  <View style={[styles.crosshair, styles.crosshairBR]} />

                  {/* Scanning Animation Laser Beam */}
                  {isAnalyzing && (
                    <Animated.View
                      style={[
                        styles.scannerLaser,
                        {
                          transform: [{ translateY }],
                        },
                      ]}
                    />
                  )}

                  {/* Retake / Change Photo Controls Overlay */}
                  <View style={styles.imageOverlayControls}>
                    <TouchableOpacity
                      onPress={handleTakePhoto}
                      style={styles.overlayIconBtn}
                      activeOpacity={0.8}
                    >
                      <Camera size={16} color="#FFFFFF" />
                      <Text style={styles.overlayIconText}>Retake</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handlePickGallery}
                      style={styles.overlayIconBtn}
                      activeOpacity={0.8}
                    >
                      <ImageIcon size={16} color="#FFFFFF" />
                      <Text style={styles.overlayIconText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Analysis In Progress Indicator */}
                {isAnalyzing && (
                  <NeuCard variant="flat" padding={14} borderRadius={16} style={styles.analyzingCard}>
                    <ActivityIndicator size="small" color={NeuTheme.colors.emerald} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.analyzingTitle}>Multimodal AI Analysis</Text>
                      <Text style={styles.analyzingSub}>{scanStatusText}</Text>
                    </View>
                  </NeuCard>
                )}

                {/* Analysis Completed: Nutrition Facts Form */}
                {!isAnalyzing && (
                  <View style={styles.resultsContainer}>
                    {/* Confidence & Quick Re-analyze Bar */}
                    <View style={styles.confidenceBar}>
                      <View style={styles.confidenceBadge}>
                        <ShieldCheck size={14} color="#047857" />
                        <Text style={styles.confidenceText}>
                          AI Vision Confidence: {analysisResult?.confidence || 'High'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleReanalyze}
                        style={styles.reanalyzeBtn}
                        activeOpacity={0.7}
                      >
                        <RefreshCw size={12} color={NeuTheme.colors.textSecondary} />
                        <Text style={styles.reanalyzeText}>Re-scan</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Meal Name Input (Editable) */}
                    <View style={styles.fieldBlock}>
                      <View style={styles.fieldHeader}>
                        <Text style={styles.fieldLabel}>DETECTED MEAL NAME</Text>
                        <Edit3 size={12} color={NeuTheme.colors.textMuted} />
                      </View>
                      <NeuCard variant="inset" padding={12} borderRadius={14} style={styles.inputCard}>
                        <TextInput
                          value={mealName}
                          onChangeText={setMealName}
                          placeholder="e.g. Grilled Chicken Bowl"
                          placeholderTextColor={NeuTheme.colors.textMuted}
                          style={styles.textInput}
                        />
                      </NeuCard>
                    </View>

                    {/* Meal Category Pills */}
                    <View style={styles.fieldBlock}>
                      <Text style={styles.fieldLabel}>CATEGORY</Text>
                      <NeuCard variant="inset" padding={4} borderRadius={14} style={styles.pillContainer}>
                        {mealTypes.map((type) => {
                          const isSelected = mealType === type;
                          return (
                            <TouchableOpacity
                              key={type}
                              onPress={() => setMealType(type)}
                              style={[styles.typePill, isSelected && styles.typePillActive]}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.typePillText, isSelected && styles.typePillTextActive]}>
                                {type}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </NeuCard>
                    </View>

                    {/* Big Nutrition Macro Summary Hero Grid */}
                    <View style={styles.macroHeroRow}>
                      {/* Calories Card */}
                      <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.calHeroCard}>
                        <View style={styles.macroIconBoxCoral}>
                          <Flame size={16} color="#DC2626" />
                        </View>
                        <View style={styles.calInputRow}>
                          <TextInput
                            value={calories}
                            onChangeText={setCalories}
                            keyboardType="numeric"
                            style={styles.calInputValue}
                          />
                          <Text style={styles.calInputUnit}>kcal</Text>
                        </View>
                        <Text style={styles.macroCardLabel}>TOTAL ENERGY</Text>
                      </NeuCard>

                      {/* Protein Card */}
                      <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.macroHeroCard}>
                        <View style={styles.macroIconBoxEmerald}>
                          <Dna size={16} color="#059669" />
                        </View>
                        <View style={styles.calInputRow}>
                          <TextInput
                            value={protein}
                            onChangeText={setProtein}
                            keyboardType="numeric"
                            style={styles.macroInputValue}
                          />
                          <Text style={styles.macroInputUnit}>g</Text>
                        </View>
                        <Text style={styles.macroCardLabel}>PROTEIN</Text>
                      </NeuCard>
                    </View>

                    <View style={styles.macroHeroRow}>
                      {/* Carbs Card */}
                      <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.macroHeroCard}>
                        <View style={styles.macroIconBoxAmber}>
                          <Wheat size={16} color="#D97706" />
                        </View>
                        <View style={styles.calInputRow}>
                          <TextInput
                            value={carbs}
                            onChangeText={setCarbs}
                            keyboardType="numeric"
                            style={styles.macroInputValue}
                          />
                          <Text style={styles.macroInputUnit}>g</Text>
                        </View>
                        <Text style={styles.macroCardLabel}>CARBS</Text>
                      </NeuCard>

                      {/* Fats Card */}
                      <NeuCard variant="raised" padding={12} borderRadius={16} style={styles.macroHeroCard}>
                        <View style={styles.macroIconBoxBlue}>
                          <Droplet size={16} color="#2563EB" />
                        </View>
                        <View style={styles.calInputRow}>
                          <TextInput
                            value={fats}
                            onChangeText={setFats}
                            keyboardType="numeric"
                            style={styles.macroInputValue}
                          />
                          <Text style={styles.macroInputUnit}>g</Text>
                        </View>
                        <Text style={styles.macroCardLabel}>FATS</Text>
                      </NeuCard>
                    </View>

                    {/* Detected Items Breakdown */}
                    {analysisResult?.breakdown && analysisResult.breakdown.length > 0 && (
                      <View style={styles.breakdownSection}>
                        <Text style={styles.fieldLabel}>FOOD BREAKDOWN DETECTED</Text>
                        <NeuCard variant="inset" padding={10} borderRadius={16}>
                          {analysisResult.breakdown.map((item, idx) => (
                            <View
                              key={idx}
                              style={[
                                styles.breakdownItemRow,
                                idx !== analysisResult.breakdown.length - 1 && styles.breakdownDivider,
                              ]}
                            >
                              <View style={{ flex: 1 }}>
                                <Text style={styles.breakdownName}>{item.item}</Text>
                                <Text style={styles.breakdownPortion}>{item.portion}</Text>
                              </View>
                              <View style={styles.breakdownStats}>
                                <Text style={styles.breakdownCal}>{item.calories} kcal</Text>
                                <Text style={styles.breakdownMacroSummary}>
                                  P: {item.protein}g | C: {item.carbs}g | F: {item.fats}g
                                </Text>
                              </View>
                            </View>
                          ))}
                        </NeuCard>
                      </View>
                    )}

                    {/* Gemini Athletic Coach Tip */}
                    {analysisResult?.health_tip && (
                      <View style={styles.coachTipCard}>
                        <View style={styles.coachTipHeader}>
                          <Sparkles size={14} color="#065F46" />
                          <Text style={styles.coachTipTitle}>GEMINI NUTRITION INSIGHT</Text>
                        </View>
                        <Text style={styles.coachTipText}>{analysisResult.health_tip}</Text>
                      </View>
                    )}

                    {/* Submit Log Button */}
                    <TouchableOpacity
                      onPress={handleSaveToBlueprint}
                      disabled={isSubmitting}
                      style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
                      activeOpacity={0.88}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="#052E16" size="small" />
                      ) : (
                        <>
                          <Check size={20} color="#052E16" strokeWidth={2.8} />
                          <Text style={styles.saveBtnText}>Save Nutrition to Daily Blueprint</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheetContainer: {
    backgroundColor: NeuTheme.colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    maxHeight: '92%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHandle: {
    width: 44,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  poweredByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  poweredByText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.8,
  },
  flashBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  flashBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: NeuTheme.colors.cardBackground,
    ...NeuTheme.shadows.raisedSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingBottom: 24,
  },
  pickerSection: {
    marginVertical: 8,
  },
  pickerCard: {
    alignItems: 'center',
    textAlign: 'center',
  },
  pickerIllustration: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NeuTheme.colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: NeuTheme.colors.emerald,
  },
  pickerHeading: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  pickerSubheading: {
    fontSize: 13,
    color: NeuTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryPickerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#052E16',
  },
  secondaryPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NeuTheme.colors.cardBackground,
    borderRadius: 16,
    paddingVertical: 14,
    ...NeuTheme.shadows.raisedSmall,
  },
  secondaryPickerBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  previewSection: {
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  crosshair: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#34D399',
  },
  crosshairTL: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  crosshairTR: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  crosshairBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  crosshairBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  scannerLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 8,
  },
  imageOverlayControls: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  overlayIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backdropFilter: 'blur(8px)',
  },
  overlayIconText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  analyzingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  analyzingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#064E3B',
  },
  analyzingSub: {
    fontSize: 11.5,
    color: '#047857',
    fontWeight: '500',
    marginTop: 2,
  },
  resultsContainer: {
    gap: 12,
  },
  confidenceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  reanalyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reanalyzeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: NeuTheme.colors.textSecondary,
  },
  fieldBlock: {
    marginBottom: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.6,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
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
  pillContainer: {
    flexDirection: 'row',
  },
  typePill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  typePillActive: {
    backgroundColor: '#FFFFFF',
    ...NeuTheme.shadows.raisedSmall,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: NeuTheme.colors.textSecondary,
  },
  typePillTextActive: {
    color: NeuTheme.colors.textPrimary,
    fontWeight: '900',
  },
  macroHeroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  calHeroCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  macroHeroCard: {
    flex: 1,
    alignItems: 'center',
  },
  macroIconBoxCoral: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroIconBoxEmerald: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroIconBoxAmber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroIconBoxBlue: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  calInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  calInputValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#991B1B',
    padding: 0,
    textAlign: 'center',
    minWidth: 44,
  },
  calInputUnit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  macroInputValue: {
    fontSize: 18,
    fontWeight: '900',
    color: NeuTheme.colors.textPrimary,
    padding: 0,
    textAlign: 'center',
    minWidth: 32,
  },
  macroInputUnit: {
    fontSize: 11,
    fontWeight: '700',
    color: NeuTheme.colors.textSecondary,
  },
  macroCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: NeuTheme.colors.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  breakdownSection: {
    marginTop: 4,
    gap: 6,
  },
  breakdownItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  breakdownDivider: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(163, 177, 198, 0.25)',
  },
  breakdownName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: NeuTheme.colors.textPrimary,
  },
  breakdownPortion: {
    fontSize: 10.5,
    color: NeuTheme.colors.textSecondary,
    fontWeight: '500',
  },
  breakdownStats: {
    alignItems: 'flex-end',
  },
  breakdownCal: {
    fontSize: 12,
    fontWeight: '800',
    color: NeuTheme.colors.textPrimary,
  },
  breakdownMacroSummary: {
    fontSize: 9.5,
    fontWeight: '600',
    color: NeuTheme.colors.textSecondary,
  },
  coachTipCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  coachTipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachTipTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.6,
  },
  coachTipText: {
    fontSize: 12,
    color: '#064E3B',
    lineHeight: 16,
    fontWeight: '500',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NeuTheme.colors.emerald,
    borderRadius: 18,
    paddingVertical: 15,
    marginTop: 6,
    shadowColor: NeuTheme.colors.emerald,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#052E16',
    letterSpacing: 0.2,
  },
});
