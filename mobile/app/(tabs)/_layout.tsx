import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Text } from 'react-native';

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <Icon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="monitoring"
        options={{
          title: 'Tensi',
          tabBarIcon: ({ focused }) => <Icon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ focused }) => <Icon emoji="💬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="obat"
        options={{
          title: 'Obat',
          tabBarIcon: ({ focused }) => <Icon emoji="💊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
