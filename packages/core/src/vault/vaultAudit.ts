// ============================================================
// VAULT SECURITY AUDIT & HEALTH ENGINE
// Analyzes vault security score, reused passwords & weak passwords
// ============================================================

import { Vault, PasswordData } from '../models';
import { getEntriesByType } from './vaultManager';

export interface VaultAuditReport {
  score: number;                   // Health score (0 to 100%)
  totalPasswords: number;
  weakCount: number;
  reusedCount: number;
  missing2FACount: number;
  oldPasswordCount: number;
  weakEntries: { id: string; name: string }[];
  reusedGroups: { groupKey: string; count: number; entries: { id: string; name: string }[] }[];
}

export function auditVaultHealth(vault: Vault | null): VaultAuditReport {
  if (!vault) {
    return {
      score: 100,
      totalPasswords: 0,
      weakCount: 0,
      reusedCount: 0,
      missing2FACount: 0,
      oldPasswordCount: 0,
      weakEntries: [],
      reusedGroups: [],
    };
  }

  const passwordEntries = getEntriesByType(vault, 'password');
  const totpEntries = getEntriesByType(vault, 'totp');

  if (passwordEntries.length === 0) {
    return {
      score: 100,
      totalPasswords: 0,
      weakCount: 0,
      reusedCount: 0,
      missing2FACount: 0,
      oldPasswordCount: 0,
      weakEntries: [],
      reusedGroups: [],
    };
  }

  const weakEntries: { id: string; name: string }[] = [];
  const passwordMap = new Map<string, { id: string; name: string }[]>();
  let oldPasswordCount = 0;
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;

  passwordEntries.forEach((entry) => {
    const data = entry.data as PasswordData;
    const pass = data.password;

    // Check Weakness (length < 8 or simple string)
    if (pass.length < 10 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass) || !/[^A-Za-z0-9]/.test(pass)) {
      weakEntries.push({ id: entry.id, name: entry.name });
    }

    // Map for Reuse detection
    const existing = passwordMap.get(pass) || [];
    existing.push({ id: entry.id, name: entry.name });
    passwordMap.set(pass, existing);

    // Check Age (> 90 days)
    if (entry.updatedAt && now - entry.updatedAt > ninetyDaysMs) {
      oldPasswordCount++;
    }
  });

  // Collect Reused Groups
  const reusedGroups: { groupKey: string; count: number; entries: { id: string; name: string }[] }[] = [];
  let reusedCount = 0;

  passwordMap.forEach((entries, password) => {
    if (entries.length > 1) {
      // Use a masked identifier instead of the raw password
      const groupKey = `reused_${reusedGroups.length + 1}`;
      reusedGroups.push({ groupKey, count: entries.length, entries });
      reusedCount += entries.length;
    }
  });

  // Calculate Health Deductions
  let score = 100;
  const weakPenalty = (weakEntries.length / passwordEntries.length) * 40;
  const reusedPenalty = (reusedCount / passwordEntries.length) * 40;
  const oldPenalty = (oldPasswordCount / passwordEntries.length) * 20;

  score = Math.max(0, Math.round(100 - weakPenalty - reusedPenalty - oldPenalty));

  // Count accounts missing TOTP
  const totpNames = new Set(totpEntries.map((t) => t.name.toLowerCase()));
  const missing2FACount = passwordEntries.filter(
    (p) => !totpNames.has(p.name.toLowerCase())
  ).length;

  return {
    score,
    totalPasswords: passwordEntries.length,
    weakCount: weakEntries.length,
    reusedCount,
    missing2FACount,
    oldPasswordCount,
    weakEntries,
    reusedGroups,
  };
}
