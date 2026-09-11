/**
 * Native Camera Feed View (Android & iOS)
 * Uses Expo CameraView with front/back mirror streaming.
 */

import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Camera as CameraIcon } from 'lucide-react-native';

export interface CameraFeedRef {
  getVideoElement: () => null;
  requestPermission: () => Promise<boolean>;
}

interface CameraFeedViewProps {
  facing: 'front' | 'back';
  onStreamReady?: (el: any) => void;
  onPermissionDenied?: () => void;
}

const CameraFeedView = forwardRef<CameraFeedRef, CameraFeedViewProps>(
  ({ facing, onPermissionDenied }, ref) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const checkAndRequestPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        const granted = status === 'granted';
        setHasPermission(granted);
        if (!granted) {
          onPermissionDenied?.();
        }
        return granted;
      } catch (e) {
        setHasPermission(false);
        onPermissionDenied?.();
        return false;
      }
    };

    useEffect(() => {
      checkAndRequestPermission();
    }, []);

    useImperativeHandle(ref, () => ({
      getVideoElement: () => null,
      requestPermission: checkAndRequestPermission,
    }));

    if (hasPermission === false) {
      return (
        <View style={styles.permissionBox}>
          <CameraIcon size={36} color="#10B981" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            FitPass requires camera access to track your body posture and count reps in real-time.
          </Text>
          <TouchableOpacity style={styles.grantBtn} onPress={checkAndRequestPermission}>
            <Text style={styles.grantText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing={facing}
          mirror={facing === 'front'}
        />
      </View>
    );
  }
);

CameraFeedView.displayName = 'CameraFeedView';

export default CameraFeedView;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  permissionBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 14,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 300,
    lineHeight: 20,
  },
  grantBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  grantText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
