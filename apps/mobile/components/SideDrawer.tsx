import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Key,
  Settings,
  Download,
  Lock,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { useDrawer } from '../context/DrawerContext';
import { useVault } from '../context/VaultContext';
import { getEntriesByType } from '@vault/core';
import { COLORS, RADII, SPACING } from '../constants/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

export function SideDrawer() {
  const { isOpen, closeDrawer } = useDrawer();
  const { vault, lock } = useVault();
  const router = useRouter();
  const pathname = usePathname();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, fadeAnim]);

  const passwordCount = vault ? getEntriesByType(vault, 'password').length : 0;
  const totpCount = vault ? getEntriesByType(vault, 'totp').length : 0;
  const keyCount = vault ? getEntriesByType(vault, 'key').length + getEntriesByType(vault, 'note').length : 0;
  const totalCount = (vault?.entries || []).length;

  const handleNavigate = (path: string) => {
    closeDrawer();
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const handleLock = () => {
    closeDrawer();
    setTimeout(() => {
      lock();
      router.replace('/(auth)/unlock');
    }, 150);
  };

  const navItems = [
    {
      label: 'Passwords',
      path: '/(tabs)/passwords',
      icon: KeyRound,
      badge: passwordCount,
      active: pathname.startsWith('/(tabs)/passwords') || pathname === '/passwords',
    },
    /*
    {
      label: '2FA Authenticator',
      path: '/(tabs)/authenticator',
      icon: ShieldCheck,
      badge: totpCount,
      active: pathname.startsWith('/(tabs)/authenticator') || pathname === '/authenticator',
    },
    {
      label: 'Keys & Notes',
      path: '/(tabs)/keys',
      icon: Key,
      badge: keyCount,
      active: pathname.startsWith('/(tabs)/keys') || pathname === '/keys',
    },
    */
    {
      label: 'Settings & Security',
      path: '/(tabs)/settings',
      icon: Settings,
      active: pathname === '/(tabs)/settings' || pathname === '/settings',
    },
    {
      label: 'Backup & Export',
      path: '/(tabs)/settings/export',
      icon: Download,
      active: pathname.includes('export'),
    },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalContainer}>
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoBadge}>
                <ShieldCheck size={28} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.appName}>Vault Manager</Text>
                <Text style={styles.appSubtitle}>Offline • AES-256</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Vault Stats Bar */}
          <View style={styles.statsBar}>
            <Text style={styles.statsLabel}>Total Stored Items</Text>
            <Text style={styles.statsValue}>{totalCount}</Text>
          </View>

          {/* Navigation Items */}
          <View style={styles.navSection}>
            {navItems.map((item) => {
              const IconComp = item.icon;
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[styles.navItem, item.active && styles.navItemActive]}
                  onPress={() => handleNavigate(item.path)}
                >
                  <View style={styles.navItemLeft}>
                    <IconComp
                      size={20}
                      color={item.active ? COLORS.primary : COLORS.textMuted}
                    />
                    <Text
                      style={[
                        styles.navItemText,
                        item.active && styles.navItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  <View style={styles.navItemRight}>
                    {item.badge !== undefined && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight
                      size={16}
                      color={item.active ? COLORS.primary : COLORS.surfaceBorder}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer Lock Action */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.lockBtn} onPress={handleLock}>
              <Lock size={18} color={COLORS.danger} />
              <Text style={styles.lockBtnText}>Lock Vault Now</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>v1.0.0 • Zero Knowledge</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.surface,
    height: '100%',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderRightWidth: 1,
    borderRightColor: COLORS.surfaceBorder,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: RADII.md,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  appSubtitle: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.card,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: RADII.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statsLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  statsValue: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  navSection: {
    flex: 1,
    marginTop: SPACING.md,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: RADII.md,
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navItemText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: '500',
  },
  navItemTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  navItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    gap: 12,
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADII.md,
    paddingVertical: 12,
  },
  lockBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
