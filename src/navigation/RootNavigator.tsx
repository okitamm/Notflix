import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyListScreen from "../screens/MyListScreen";
import MyNotflixScreen from "../screens/MyNotflixScreen";
import DetailsScreen from "../screens/DetailsScreen";
import PlayerScreen from "../screens/PlayerScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#222",
        },
        tabBarActiveTintColor: "#E50914",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="My List" component={MyListScreen} />
      <Tab.Screen name="My Notflix" component={MyNotflixScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#090909" },
          animation: "fade",
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen name="MainTabs" component={Tabs} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}