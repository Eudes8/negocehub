import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SellerProductsScreen from '../screens/SellerProductsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  SellerProducts: undefined;
  ProductForm: { productId?: string };
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SellerProducts" component={SellerProductsScreen} options={{ title: 'Mes Produits' }} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Gérer le Produit' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Détails du Produit' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
