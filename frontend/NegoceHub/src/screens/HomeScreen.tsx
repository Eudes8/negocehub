import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../config/supabase';

type HomeScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'Home'>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock: number;
}

const HomeScreen: React.FC = () => {
  const { logout, session } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [loadingSellerStatus, setLoadingSellerStatus] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchSellerStatus();
      await fetchProducts();
    };
    fetchInitialData();
  }, [session]);

  const fetchSellerStatus = async () => {
    if (session?.user?.id) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_seller')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setIsSeller(data?.is_seller || false);
      } catch (error: any) {
        console.error('Error fetching seller status:', error.message);
        Alert.alert('Erreur', 'Impossible de récupérer le statut de vendeur.');
        setIsSeller(false);
      } finally {
        setLoadingSellerStatus(false);
      }
    } else {
      setLoadingSellerStatus(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock');

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      Alert.alert('Erreur', 'Impossible de charger les produits.');
    } finally {
      setLoadingProducts(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchProducts();
    if (session?.user?.id) {
      await fetchSellerStatus();
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} €</Text>
      <Text style={styles.productStock}>Stock: {item.stock}</Text>
    </TouchableOpacity>
  );

  if (loadingSellerStatus || loadingProducts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue !</Text>
      <View style={styles.buttonContainer}>
        <Button title="Voir le Profil" onPress={() => navigation.navigate('Profile')} />
        {isSeller && (
          <Button title="Gérer mes Produits" onPress={() => navigation.navigate('SellerProducts')} />
        )}
        <Button title="Déconnexion" onPress={logout} />
      </View>

      <Text style={styles.sectionTitle}>Produits disponibles</Text>
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>Aucun produit disponible pour le moment.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  productItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 16,
    color: 'green',
    marginTop: 5,
  },
  productStock: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  productList: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
