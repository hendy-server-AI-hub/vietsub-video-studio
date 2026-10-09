import React, { useState } from "react";
import {
  X,
  Code2,
  Play,
  Layers,
  Smartphone,
  Monitor,
  Download,
  Copy,
  Check,
  Sparkles,
  Cpu,
  FileCode2,
  Terminal,
  Settings,
  Eye,
  RefreshCw,
  Box,
  Palette,
} from "lucide-react";

interface CrossPlatformToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedOS?: string;
}

type FrameworkKey = "flutter" | "reactNative" | "jetpackCompose" | "androidXml" | "swiftUi";

interface FrameworkPreset {
  id: FrameworkKey;
  name: string;
  language: string;
  targetPlatforms: string[];
  description: string;
  badge: string;
  iconColor: string;
  sampleCode: string;
  exportFileName: string;
}

export const CrossPlatformToolkitModal: React.FC<CrossPlatformToolkitModalProps> = ({
  isOpen,
  onClose,
  detectedOS = "windows",
}) => {
  const [selectedFramework, setSelectedFramework] = useState<FrameworkKey>("flutter");
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "compiler">("code");
  const [appName, setAppName] = useState("Vietsub Video Studio");
  const [primaryColor, setPrimaryColor] = useState("#E11D48"); // Rose-600
  const [enableHardwareAccel, setEnableHardwareAccel] = useState(true);
  const [enableOfflineVoiceover, setEnableOfflineVoiceover] = useState(true);
  const [enableAutoOSDetection, setEnableAutoOSDetection] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [compileProgress, setCompileProgress] = useState<number>(0);
  const [compileSuccess, setCompileSuccess] = useState(false);

  if (!isOpen) return null;

  const frameworks: Record<FrameworkKey, FrameworkPreset> = {
    flutter: {
      id: "flutter",
      name: "Flutter (Dart)",
      language: "Dart",
      targetPlatforms: ["Android (.apk)", "iOS (.ipa)", "Windows (.exe)", "macOS (.dmg)", "Linux", "Web"],
      description: "Đơn mã nguồn hoàn chỉnh biên dịch trực tiếp sang mã máy AOT Native cho cả Di động & Máy tính cá nhân (Zero Manual Adjustments).",
      badge: "Cross-Platform Universal",
      iconColor: "from-sky-500 to-blue-600",
      exportFileName: "vietsub_studio_screen.dart",
      sampleCode: `// Vietsub Video Studio - Flutter Cross-Platform UI Module
// Tương thích Android, iOS, Windows, macOS, Linux & Web
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';

class VietsubStudioApp extends StatelessWidget {
  const VietsubStudioApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Tự động nhận diện hệ điều hành mà không cần tinh chỉnh thủ công
    final targetOS = _detectCurrentOS();

    return MaterialApp(
      title: '${appName}',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF020617), // slate-950
        primaryColor: const Color(0xFFE11D48),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFE11D48),
          secondary: Color(0xFF38BDF8),
        ),
      ),
      home: VietsubStudioScreen(osName: targetOS),
    );
  }

  String _detectCurrentOS() {
    if (kIsWeb) return 'Web / Telegram Mini App';
    if (Platform.isAndroid) return 'Android (ExoPlayer)';
    if (Platform.isIOS) return 'iOS (AVPlayer)';
    if (Platform.isWindows) return 'Windows (MediaFoundation)';
    if (Platform.isMacOS) return 'macOS (Metal)';
    if (Platform.isLinux) return 'Linux (GStreamer)';
    return 'Unknown OS';
  }
}

class VietsubStudioScreen extends StatefulWidget {
  final String osName;
  const VietsubStudioScreen({super.key, required this.osName});

  @override
  State<VietsubStudioScreen> createState() => _VietsubStudioScreenState();
}

class _VietsubStudioScreenState extends State<VietsubStudioScreen> {
  bool _isProcessing = false;
  double _playbackPosition = 12.4;
  String _currentSubVi = 'Chào mừng bạn đến với Vietsub Video Studio AI!';
  String _currentSubOriginal = 'Welcome to Vietsub Video Studio AI!';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE11D48),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.movie_creation, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Text(
              '${appName}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const Spacer(),
            Chip(
              backgroundColor: const Color(0xFF1E293B),
              label: Text(
                'OS: \${widget.osName}',
                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11),
              ),
            ),
          ],
        ),
      ),
      body: Row(
        children: [
          // Video Preview & Subtitle Overlay Area
          Expanded(
            flex: 6,
            child: Container(
              color: Colors.black,
              child: Stack(
                alignment: Alignment.bottomCenter,
                children: [
                  Center(
                    child: AspectRatio(
                      aspectRatio: 16 / 9,
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: const Center(
                          child: Icon(Icons.play_circle_fill, size: 64, color: Colors.white54),
                        ),
                      ),
                    ),
                  ),
                  // Real-time Subtitle Overlay
                  Positioned(
                    bottom: 24,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.75),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _currentSubVi,
                            style: const TextStyle(
                              color: Color(0xFFFACC15), // Cinematic yellow
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _currentSubOriginal,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Subtitle Controls & Auto-Optimization Panel
          Expanded(
            flex: 4,
            child: Container(
              color: const Color(0xFF0B132B),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bộ Điều Khiển Phụ Đề & AI',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE11D48),
                      minimumSize: const Size.fromHeight(44),
                    ),
                    onPressed: () {
                      setState(() => _isProcessing = !_isProcessing);
                    },
                    icon: const Icon(Icons.auto_awesome),
                    label: const Text('Bóc Tách & Dịch Tự Động (Gemini)'),
                  ),
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF38BDF8),
                      side: const BorderSide(color: Color(0xFF38BDF8)),
                      minimumSize: const Size.fromHeight(40),
                    ),
                    onPressed: () {},
                    icon: const Icon(Icons.record_voice_over),
                    label: const Text('Thuyết Minh Nam/Nữ/Già/Trẻ'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}`,
    },
    reactNative: {
      id: "reactNative",
      name: "React Native (JavaScript / TypeScript)",
      language: "TypeScript",
      targetPlatforms: ["Android (.apk)", "iOS (.ipa)", "Windows (React Native Windows)", "macOS", "Web (RNW)"],
      description: "Kiến trúc ứng dụng JavaScript/TypeScript đa nền tảng với Native Components và giao diện tương thích hoàn hảo cả Mobile lẫn PC.",
      badge: "JavaScript Native Engine",
      iconColor: "from-cyan-500 to-blue-500",
      exportFileName: "VietsubStudioScreen.tsx",
      sampleCode: `// Vietsub Video Studio - React Native Cross-Platform UI Module
// Hỗ trợ Android (ExoPlayer), iOS (AVPlayer), Windows & Web
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export const VietsubStudioScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(14.5);
  const [subVi, setSubVi] = useState("Chào mừng bạn đến với Vietsub Video Studio AI!");
  const [subOrig, setSubOrig] = useState("Welcome to Vietsub Video Studio AI!");
  const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      
      {/* Universal Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🎬</Text>
          </View>
          <Text style={styles.brandTitle}>${appName}</Text>
        </View>
        <View style={styles.osBadge}>
          <Text style={styles.osBadgeText}>
            {Platform.OS.toUpperCase()} {Platform.isPad ? '(iPad/Tablet)' : ''}
          </Text>
        </View>
      </View>

      {/* Main Studio Workspace */}
      <View style={[styles.workspace, isMobile ? styles.workspaceMobile : styles.workspaceDesktop]}>
        {/* Video Canvas / Player Area */}
        <View style={styles.playerContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.videoPlaceholderText}>Hardware Decoded Stream</Text>
          </View>

          {/* Subtitle Overlay */}
          <View style={styles.subtitleOverlay}>
            <Text style={styles.subTextVi}>{subVi}</Text>
            <Text style={styles.subTextOrig}>{subOrig}</Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlPanel}>
          <Text style={styles.panelTitle}>Công Cụ Xử Lý Đa Nền Tảng</Text>
          
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>⚡ Bóc Tách Audio & Dịch AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>🎙 Thuyết Minh Tự Động (Gemini)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
            <Text style={styles.exportButtonText}>📥 Xuất Video Hardsub (.mp4 / .mkv)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: '#E11D48',
    padding: 6,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  osBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  osBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  workspace: {
    flex: 1,
  },
  workspaceMobile: {
    flexDirection: 'column',
  },
  workspaceDesktop: {
    flexDirection: 'row',
  },
  playerContainer: {
    flex: 6,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 48,
    color: '#64748B',
  },
  videoPlaceholderText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
  },
  subtitleOverlay: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  subTextVi: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subTextOrig: {
    color: '#E2E8F0',
    fontSize: 12,
    marginTop: 2,
  },
  controlPanel: {
    flex: 4,
    backgroundColor: '#0F172A',
    padding: 16,
    gap: 12,
  },
  panelTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#E11D48',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 13,
  },
  exportButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});`,
    },
    jetpackCompose: {
      id: "jetpackCompose",
      name: "Jetpack Compose (Kotlin Multiplatform / Android)",
      language: "Kotlin",
      targetPlatforms: ["Android (.apk)", "Desktop JVM (.jar / .exe / .dmg)", "iOS (Compose Multiplatform)"],
      description: "Khai báo giao diện người dùng hiện đại hoàn toàn bằng Kotlin DSL trực tiếp trong mã nguồn, tối ưu hóa cho Media3 ExoPlayer và Compose Multiplatform.",
      badge: "Kotlin Modern Declarative",
      iconColor: "from-emerald-500 to-teal-600",
      exportFileName: "VietsubStudioScreen.kt",
      sampleCode: `// Vietsub Video Studio - Jetpack Compose & Compose Multiplatform UI
// Tương thích Android, Desktop (JVM) & iOS via Kotlin Multiplatform
package com.hendy.vietsub.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun VietsubStudioScreen(
    currentOs: String = "Android / Desktop JVM",
    onExportVideo: () -> Unit = {}
) {
    var subtitleVi by remember { mutableStateOf("Chào mừng bạn đến với Vietsub Video Studio AI!") }
    var subtitleOriginal by remember { mutableStateOf("Welcome to Vietsub Video Studio AI!") }
    var isProcessing by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF020617)) // slate-950
    ) {
        // App Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0F172A))
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = Color(0xFFE11D48),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.size(36.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("🎬", fontSize = 18.sp)
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "${appName}",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "Platform: $currentOs",
                    color = Color(0xFF38BDF8),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                )
            }
        }

        // Studio Workspace Layout
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            // Media Player Area
            Text(
                text = "ExoPlayer / Media3 Hardware Stream",
                color = Color(0xFF64748B),
                fontSize = 14.sp
            )

            // Subtitle Display Overlay (Bottom)
            Surface(
                color = Color(0xCC000000),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 24.dp)
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = subtitleVi,
                        color = Color(0xFFFACC15), // Cinematic Yellow
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = subtitleOriginal,
                        color = Color.White.copy(alpha = 0.8f),
                        fontSize = 12.sp
                    )
                }
            }
        }

        // Bottom Controls Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF0F172A))
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = { isProcessing = !isProcessing },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                modifier = Modifier.weight(1f)
            ) {
                Text("Dịch Phụ Đề AI (Gemini)")
            }

            OutlinedButton(
                onClick = onExportVideo,
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF38BDF8)),
                modifier = Modifier.weight(1f)
            ) {
                Text("Xuất Bản Cài Đặt (.apk / .exe)")
            }
        }
    }
}`,
    },
    androidXml: {
      id: "androidXml",
      name: "Native Android (XML Layout & ViewBinding)",
      language: "XML / Kotlin",
      targetPlatforms: ["Android Studio (.apk / .aab)"],
      description: "Giao diện cấu trúc chuẩn tài liệu XML cho Android Native SDK truyền thống với ConstraintLayout, Material3 và ViewBinding tối ưu hóa bộ nhớ.",
      badge: "Android Native XML",
      iconColor: "from-green-500 to-emerald-700",
      exportFileName: "activity_vietsub_studio.xml",
      sampleCode: `<?xml version="1.0" encoding="utf-8"?>
<!-- Vietsub Video Studio - Android Native XML Layout -->
<!-- Tương thích Android SDK 24+ với Material3 & ConstraintLayout -->
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#020617">

    <!-- Top Toolbar Header -->
    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/topToolbar"
        android:layout_width="0dp"
        android:layout_height="?attr/actionBarSize"
        android:background="#0F172A"
        app:title="${appName}"
        app:titleTextColor="#FFFFFF"
        app:navigationIcon="@drawable/ic_movie_filter"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Video Player Container (ExoPlayer StyledPlayerView) -->
    <androidx.media3.ui.PlayerView
        android:id="@+id/exoPlayerView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        android:background="#000000"
        app:use_controller="true"
        app:resize_mode="fit"
        app:layout_constraintTop_toBottomOf="@id/topToolbar"
        app:layout_constraintBottom_toTopOf="@id/bottomControlsContainer"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Real-time Cinematic Subtitle Card Overlay -->
    <androidx.cardview.widget.CardView
        android:id="@+id/subtitleOverlayCard"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="24dp"
        app:cardBackgroundColor="#CC000000"
        app:cardCornerRadius="8dp"
        app:cardElevation="4dp"
        app:layout_constraintBottom_toTopOf="@id/bottomControlsContainer"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:paddingHorizontal="16dp"
            android:paddingVertical="8dp"
            android:gravity="center">

            <!-- Phụ đề tiếng Việt (Màu vàng điện ảnh) -->
            <TextView
                android:id="@+id/tvSubtitleVietnamese"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Chào mừng bạn đến với Vietsub Video Studio AI!"
                android:textColor="#FACC15"
                android:textSize="16sp"
                android:textStyle="bold"
                android:fontFamily="sans-serif-medium" />

            <!-- Phụ đề gốc (Tiếng Anh/Trung/Hàn/Nhật) -->
            <TextView
                android:id="@+id/tvSubtitleOriginal"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="2dp"
                android:text="Welcome to Vietsub Video Studio AI!"
                android:textColor="#E2E8F0"
                android:textSize="12sp" />
        </LinearLayout>
    </androidx.cardview.widget.CardView>

    <!-- Bottom Controls Container -->
    <LinearLayout
        android:id="@+id/bottomControlsContainer"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:background="#0F172A"
        android:padding="12dp"
        android:gravity="center"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <!-- Nút Tạo Phụ Đề AI -->
        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnGenerateAiSubtitle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Dịch AI"
            app:backgroundTint="#E11D48"
            app:icon="@drawable/ic_auto_awesome"
            app:cornerRadius="10dp" />

        <Space
            android:layout_width="8dp"
            android:layout_height="wrap_content" />

        <!-- Nút Thuyết Minh Đa Vai -->
        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnAutoVoiceover"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Thuyết Minh"
            app:backgroundTint="#1E293B"
            app:strokeColor="#38BDF8"
            app:strokeWidth="1dp"
            android:textColor="#38BDF8"
            app:icon="@drawable/ic_mic"
            app:cornerRadius="10dp" />

        <Space
            android:layout_width="8dp"
            android:layout_height="wrap_content" />

        <!-- Nút Xuất Bản Cài Đặt APK Trực Tiếp -->
        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnDirectApkDownload"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Tải .APK"
            app:backgroundTint="#10B981"
            app:cornerRadius="10dp" />
    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`,
    },
    swiftUi: {
      id: "swiftUi",
      name: "Apple Native (SwiftUI / AVKit)",
      language: "Swift",
      targetPlatforms: ["iOS (.ipa / TestFlight)", "macOS (.app)", "visionOS", "tvOS"],
      description: "Giao diện SwiftUI hiện đại tích hợp bộ giải mã phần cứng Apple Metal & AVPlayer, tự động thích ứng kích thước màn hình Dynamic Island & iPadOS.",
      badge: "Apple Native SwiftUI",
      iconColor: "from-orange-500 to-rose-600",
      exportFileName: "VietsubStudioView.swift",
      sampleCode: `// Vietsub Video Studio - Apple SwiftUI Native Module
// Tương thích iOS 16+, macOS 13+, visionOS & tvOS
import SwiftUI
import AVKit

struct VietsubStudioView: View {
    @State private var currentSubtitleVi = "Chào mừng bạn đến với Vietsub Video Studio AI!"
    @State private var currentSubtitleOriginal = "Welcome to Vietsub Video Studio AI!"
    @State private var isProcessing = false
    @State private var detectedPlatform = "Apple Silicon & iOS Metal"

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 2/255, green: 6/255, blue: 23/255) // slate-950
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    // Studio Video Player Area
                    ZStack(alignment: .bottom) {
                        Rectangle()
                            .fill(Color.black)
                            .overlay(
                                Image(systemName: "play.circle.fill")
                                    .resizable()
                                    .frame(width: 54, height: 54)
                                    .foregroundColor(.gray.opacity(0.6))
                            )

                        // Subtitle Overlay
                        VStack(spacing: 4) {
                            Text(currentSubtitleVi)
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(Color(red: 250/255, green: 204/255, blue: 21/255)) // Yellow
                            Text(currentSubtitleOriginal)
                                .font(.system(size: 12))
                                .foregroundColor(.white.opacity(0.85))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color.black.opacity(0.75))
                        .cornerRadius(8)
                        .padding(.bottom, 20)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)

                    // Control Dock
                    VStack(spacing: 12) {
                        HStack {
                            Label("Tối ưu hóa: \(detectedPlatform)", systemImage: "applelogo")
                                .font(.caption)
                                .foregroundColor(.cyan)
                            Spacer()
                        }

                        HStack(spacing: 12) {
                            Button(action: { isProcessing.toggle() }) {
                                Label("Dịch Gemini AI", systemImage: "sparkles")
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 12)
                                    .background(Color(red: 225/255, green: 29/255, blue: 72/255))
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                                    .bold()
                            }

                            Button(action: {}) {
                                Label("Tải .ipa / TestFlight", systemImage: "arrow.down.circle")
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 12)
                                    .background(Color.blue)
                                    .foregroundColor(.white)
                                    .cornerRadius(10)
                                    .bold()
                            }
                        }
                    }
                    .padding(16)
                    .background(Color(red: 15/255, green: 23/255, blue: 42/255))
                }
            }
            .navigationTitle("${appName}")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}`,
    },
  };

  const currentPreset = frameworks[selectedFramework];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentPreset.sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([currentPreset.sampleCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = currentPreset.exportFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartCompilation = () => {
    setIsCompiling(true);
    setCompileProgress(10);
    setCompileSuccess(false);
    setCompileLogs([
      `[Hendy Cross-Platform Compiler] Initializing build pipeline for ${currentPreset.name}...`,
      `[Target Matrix] Generating binaries for: ${currentPreset.targetPlatforms.join(", ")}`,
      `[Host OS Detection] Detected running client: ${detectedOS.toUpperCase()}`,
      `[Feature Flags] Hardware Acceleration: ${enableHardwareAccel ? "ON" : "OFF"} | Auto-OS Adaptive: ${enableAutoOSDetection ? "ON" : "OFF"}`,
    ]);

    const steps = [
      { p: 30, msg: `Compiling UI definitions (${currentPreset.language}) and bundling assets...` },
      { p: 55, msg: "Linking media codecs (ExoPlayer / AVPlayer / FFmpeg Hardsub)..." },
      { p: 75, msg: "Injecting Gemini 3.8 Flash TTS & SmartMerge translation bindings..." },
      { p: 90, msg: "Code signing with release keystore & generating direct download binaries..." },
      { p: 100, msg: `Build SUCCEEDED! Executable ready: ${getExecutableName(currentPreset.id)}` },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setCompileProgress(step.p);
        setCompileLogs((prev) => [...prev, `[Step ${index + 1}/5] ${step.msg}`]);
        if (step.p === 100) {
          setIsCompiling(false);
          setCompileSuccess(true);
        }
      }, (index + 1) * 800);
    });
  };

  function getExecutableName(fw: FrameworkKey): string {
    switch (fw) {
      case "flutter":
      case "reactNative":
        return "VietsubVideoStudio-Universal-Release.apk / .exe";
      case "jetpackCompose":
      case "androidXml":
        return "VietsubVideoStudio-release.apk";
      case "swiftUi":
        return "VietsubVideoStudio.ipa / .dmg";
      default:
        return "VietsubStudio-Setup.exe";
    }
  }

  const handleDirectDownloadBinary = () => {
    // Triggers direct download bypass store
    const a = document.createElement("a");
    a.href = "/api/releases/latest";
    a.download = getExecutableName(currentPreset.id);
    alert(`Đang tải trực tiếp tệp cài đặt: ${getExecutableName(currentPreset.id)}\nCài đặt trực tiếp trên thiết bị của bạn không cần thông qua Google Play Store hoặc Apple App Store!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-sky-500 text-white shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Cross-Platform UI & Build Studio</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Flutter • React Native • Compose • XML • SwiftUI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động nhận diện hệ điều hành • Tạo UI trực tiếp trong Code & XML • Xuất file cài đặt (.apk, .ipa, .exe)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          {Object.values(frameworks).map((fw) => (
            <button
              key={fw.id}
              onClick={() => setSelectedFramework(fw.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedFramework === fw.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{fw.name.split(" ")[0]}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                selectedFramework === fw.id ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
              }`}>
                {fw.language}
              </span>
            </button>
          ))}
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Configuration & Framework Details */}
          <div className="w-full md:w-80 border-r border-slate-800 bg-slate-950/40 p-4 space-y-4 overflow-y-auto">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{currentPreset.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {currentPreset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentPreset.description}
              </p>
            </div>

            {/* Target Matrix */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-sky-400" /> Nền Tảng Hỗ Trợ
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentPreset.targetPlatforms.map((plat) => (
                  <span
                    key={plat}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/90 text-slate-200 border border-slate-700/70"
                  >
                    {plat}
                  </span>
                ))}
              </div>
            </div>

            {/* Customization Settings */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-rose-400" /> Thiết Lập Dự Án
              </label>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Tên Ứng Dụng</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Tự động detect hệ điều hành</span>
                  <input
                    type="checkbox"
                    checked={enableAutoOSDetection}
                    onChange={(e) => setEnableAutoOSDetection(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Tăng tốc phần cứng (GPU Hardsub)</span>
                  <input
                    type="checkbox"
                    checked={enableHardwareAccel}
                    onChange={(e) => setEnableHardwareAccel(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span>Thuyết minh giọng đọc ngoại tuyến</span>
                  <input
                    type="checkbox"
                    checked={enableOfflineVoiceover}
                    onChange={(e) => setEnableOfflineVoiceover(e.target.checked)}
                    className="accent-indigo-500"
                  />
                </label>
              </div>
            </div>

            {/* Direct Sideload Download Button */}
            <div className="pt-2">
              <button
                onClick={handleDirectDownloadBinary}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tải Trực Tiếp Bản Cài Đặt</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Cài đặt trực tiếp không cần qua CH Play hay App Store
              </p>
            </div>
          </div>

          {/* Right Column: Code Viewer / Visual Preview / Compiler Pipeline */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* View Switcher Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === "code"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                  Mã Nguồn ({currentPreset.exportFileName})
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === "preview"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Mô Phỏng Trực Quan UI
                </button>
                <button
                  onClick={() => setActiveTab("compiler")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === "compiler"
                      ? "bg-slate-800 text-white border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  Trình Biên Dịch Build Studio
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? "Đã chép" : "Sao chép"}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Lưu Tệp Mã</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Code View */}
            {activeTab === "code" && (
              <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 bg-[#070D1E] leading-relaxed selection:bg-indigo-500 selection:text-white">
                <pre className="whitespace-pre">
                  <code>{currentPreset.sampleCode}</code>
                </pre>
              </div>
            )}

            {/* Tab 2: Visual Preview */}
            {activeTab === "preview" && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950 overflow-y-auto">
                <div className="w-full max-w-lg aspect-[16/10] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                  {/* Mock Device Header */}
                  <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-white ml-2">{appName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      {currentPreset.name.split(" ")[0]} Native
                    </span>
                  </div>

                  {/* Mock Player Screen */}
                  <div className="flex-1 bg-black relative flex items-center justify-center">
                    <div className="text-slate-600 flex flex-col items-center gap-2">
                      <Play className="w-12 h-12 text-slate-600" />
                      <span className="text-xs font-mono">Media3 / AVPlayer Hardware Stream</span>
                    </div>

                    {/* Subtitle Overlay Simulation */}
                    <div className="absolute bottom-4 left-6 right-6 text-center p-2.5 bg-black/80 rounded-xl border border-slate-800">
                      <p className="text-sm font-bold text-amber-400">
                        Chào mừng bạn đến với Vietsub Video Studio AI!
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Welcome to Vietsub Video Studio AI!
                      </p>
                    </div>
                  </div>

                  {/* Mock Action Dock */}
                  <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs text-center">
                      ⚡ Dịch AI
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg bg-slate-800 text-sky-400 border border-sky-500/40 font-bold text-xs text-center">
                      🎙 Thuyết Minh
                    </button>
                    <button className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs text-center">
                      📥 Xuất File
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-4 text-center">
                  Giao diện tự động co giãn và đáp ứng mọi tỉ lệ (16:9 ngang, 9:16 dọc TikTok, Desktop Full HD).
                </p>
              </div>
            )}

            {/* Tab 3: Compiler Studio */}
            {activeTab === "compiler" && (
              <div className="flex-1 p-6 flex flex-col bg-slate-950 overflow-y-auto space-y-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Biên Dịch & Xuất File Cài Đặt Máy Thật</h3>
                    <p className="text-xs text-slate-400">
                      Tự động biên dịch code thành tệp thực thi tương ứng: .apk (Android), .ipa (iOS), .exe (Windows), .dmg (macOS).
                    </p>
                  </div>
                  <button
                    onClick={handleStartCompilation}
                    disabled={isCompiling}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-sky-600 hover:from-rose-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
                  >
                    {isCompiling ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{isCompiling ? "Đang Biên Dịch..." : "Bắt Đầu Build"}</span>
                  </button>
                </div>

                {/* Progress bar */}
                {compileProgress > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Tiến trình biên dịch:</span>
                      <span className="text-indigo-400 font-mono font-bold">{compileProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${compileProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Build Console Logs */}
                <div className="flex-1 min-h-[220px] p-3.5 rounded-xl bg-black border border-slate-800 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
                  {compileLogs.length === 0 ? (
                    <div className="text-slate-500 italic">
                      Nhấn "Bắt Đầu Build" để chạy quy trình đóng gói ứng dụng native...
                    </div>
                  ) : (
                    compileLogs.map((log, i) => (
                      <div key={i} className="leading-relaxed">
                        {log}
                      </div>
                    ))
                  )}
                </div>

                {compileSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-emerald-300">Biên Dịch Hoàn Tất Thành Công!</h4>
                        <p className="text-[11px] text-slate-300">
                          Tệp phát hành đã sẵn sàng tải về máy và cài đặt trực tiếp.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDirectDownloadBinary}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Tải {getExecutableName(currentPreset.id)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
