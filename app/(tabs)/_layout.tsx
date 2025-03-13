import { Tabs } from 'expo-router';
import { Theme } from '../utils/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import SideBar from '../components/SideBar';
import { View, StyleSheet, Text } from 'react-native';
import { ContextProvider } from '../context/ContextProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <ContextProvider>
      <View style={styles.container}>
        <SideBar />
        <Tabs
          screenOptions={({ route }) => ({
            headerStyle: {
              height: 70, 
            },
            headerLeftContainerStyle: {
              height: 100,
            },
            headerLeft: () => (
              <View style={styles.headerLeftContainer}>
                <Text style={styles.headerTitle}>Meal Planner / </Text>
              </View>
            ),
            headerRight: () => null,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              
              if (route.name === 'index') {
                iconName = 'home';
              } else if (route.name === 'meals') {
                iconName = 'cutlery';
              } else if (route.name === 'planner') {
                iconName = 'calendar';
              } else if (route.name === 'shopping') {
                iconName = 'shopping-cart';
              } else {
                iconName = 'user';
              }
              
              return <FontAwesome name={iconName as keyof typeof FontAwesome.glyphMap} size={size} color={color} />;
            },
            tabBarActiveTintColor: Theme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarLabelStyle: {
              fontSize: 12,
              paddingBottom: 5,
            },
            tabBarStyle: {
              height: 65 + insets.bottom,
              paddingTop: 5,
              paddingBottom: insets.bottom,
              backgroundColor: '#ffffff',
              borderTopWidth: 0,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: -2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            tabBarItemStyle: {
              paddingVertical: 5,
            },
            tabBarShowLabel: true,
          })}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
            }}
          />
          <Tabs.Screen
            name="meals"
            options={{
              title: "Meals",
            }}
          />
          <Tabs.Screen
            name="planner"
            options={{
              title: "Planner",
            }}
          />
          <Tabs.Screen
            name="shopping"
            options={{
              title: "Shopping",
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
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
   
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    bottom: 16,
  }
});