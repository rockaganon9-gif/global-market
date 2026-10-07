import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/lib/auth-context";
import { CartProvider } from "./src/lib/cart-context";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </CartProvider>
    </AuthProvider>
  );
}
