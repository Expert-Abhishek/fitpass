/**
 * Web Camera Feed View
 * Uses HTML5 <video> and WebRTC getUserMedia for instant, zero-dependency web video streaming.
 */

import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera as CameraIcon } from 'lucide-react-native';

export interface CameraFeedRef {
  getVideoElement: () => HTMLVideoElement | null;
  requestPermission: () => Promise<boolean>;
}

interface CameraFeedViewProps {
  facing: 'front' | 'back';
  onStreamReady?: (videoEl: HTMLVideoElement) => void;
  onPermissionDenied?: () => void;
}

const CameraFeedView = forwardRef<CameraFeedRef, CameraFeedViewProps>(
  ({ facing, onStreamReady, onPermissionDenied }, ref) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const initCamera = async () => {
      try {
        if (
          typeof navigator !== 'undefined' &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          if (stream) {
            stream.getTracks().forEach((t) => t.stop());
          }

          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: facing === 'front' ? 'user' : 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });

          setStream(mediaStream);
          setHasPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.muted = true;
            videoRef.current.playsInline = true;
            await videoRef.current.play();
            onStreamReady?.(videoRef.current);
          }
          return true;
        }
      } catch (err) {
        console.warn('[CameraFeedView.web] Camera stream error:', err);
        setHasPermission(false);
        onPermissionDenied?.();
        return false;
      }
      return false;
    };

    useEffect(() => {
      initCamera();
      return () => {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
      };
    }, [facing]);

    useImperativeHandle(ref, () => ({
      getVideoElement: () => videoRef.current,
      requestPermission: initCamera,
    }));

    if (hasPermission === false) {
      return (
        <View style={styles.permissionBox}>
          <CameraIcon size={32} color="#10B981" />
          <Text style={styles.permissionTitle}>Camera Access Blocked</Text>
          <Text style={styles.permissionText}>
            Please enable camera permissions in your browser bar to track movements.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={initCamera}>
            <Text style={styles.retryText}>Retry Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <video
          ref={videoRef as any}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facing === 'front' ? 'scaleX(-1)' : 'none',
            backgroundColor: '#0F172A',
          }}
          autoPlay
          playsInline
          muted
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
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 6,
  },
  permissionText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 280,
  },
  retryBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
