import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AccountScreen } from "../screens/AccountScreen";
import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { ProductDetailScreen } from "../screens/ProductDetailScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { VendorDashboardScreen } from "../screens/VendorDashboardScreen";
import { VendorOnboardingScreen } from "../screens/VendorOnboardingScreen";
import { useCart } from "../lib/cart-context";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Cart: "cart",
  Orders: "receipt",
  Account: "person-circle",
};

function MainTabs() {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: "#fff" },
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: { borderTopColor: "#f0f0f0" },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name] ?? "ellipse"} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Panier", tabBarBadge: itemCount > 0 ? itemCount : undefined }}
      />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: "Commandes" }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: "Compte" }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: "700" }, headerShadowVisible: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Produit" }} />
        <Stack.Screen name="Shop" component={ShopScreen} options={{ title: "Boutique" }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Commande" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Connexion", headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Créer un compte", headerShown: false }} />
        <Stack.Screen name="VendorOnboarding" component={VendorOnboardingScreen} options={{ title: "Ouvrir ma boutique" }} />
        <Stack.Screen name="VendorDashboard" component={VendorDashboardScreen} options={{ title: "Ma boutique" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
