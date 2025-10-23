import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

type SellerProductsScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'SellerProducts'>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock: number;
}

const SellerProductsScreen: React.FC = () => {
  const navigation = useNavigation<SellerProductsScreenNavigationProp>();
  const { session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProducts();
    }
  }, [session]);

  const fetchProducts = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock')
        .eq('seller_id', session?.user?.id);

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error.message);
      Alert.alert('Erreur', 'Impossible de charger les produits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce produit ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              const { error } = await supabase.from('products').delete().eq('id', productId);
              if (error) throw error;
              Alert.alert('Succès', 'Produit supprimé avec succès.');
              fetchProducts(); // Refresh the list
            } catch (error: any) {
              console.error('Error deleting product:', error.message);
              Alert.alert('Erreur', 'Impossible de supprimer le produit.');
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price} €</Text>
      <Text style={styles.productStock}>Stock: {item.stock}</Text>
      <View style={styles.productActions}>
        <Button title="Modifier" onPress={() => navigation.navigate('ProductForm', { productId: item.id })} />
        <Button title="Supprimer" color="red" onPress={() => handleDeleteProduct(item.id)} />
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Produits</Text>
      <Button title="Ajouter un nouveau produit" onPress={() => navigation.navigate('ProductForm')} />
      {products.length === 0 ? (
        <Text style={styles.noProductsText}>Aucun produit trouvé.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          onRefresh={fetchProducts}
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
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
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
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

export default SellerProductsScreen;
