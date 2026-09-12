import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide bottom tab bar in favor of modern Side Drawer
        },
      }}
    >
      <Tabs.Screen name="passwords" />
      {/* <Tabs.Screen name="authenticator" /> */}
      {/* <Tabs.Screen name="keys" /> */}
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
