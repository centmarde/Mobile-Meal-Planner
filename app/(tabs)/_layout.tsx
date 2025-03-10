import { Tabs } from 'expo-router';
import { Theme } from '../utils/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SideBar from '../components/SideBar';
import { View, StyleSheet } from 'react-native';
import { ContextProvider } from '../context/ContextProvider';

export default function TabLayout() {
  return (
    <ContextProvider>
      <View style={styles.container}>
        <SideBar />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Theme.colors.primary,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              headerShown: false,
              tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
            }}
          />
        </Tabs>
      </View>
    </ContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabs: {
    width: '100%',
    height: '100%',
  }
});