import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Image, Button } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { AppStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../config/supabase';

type ProductDetailScreenRouteProp = RouteProp<AppStackParamList, 'ProductDetail'>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock: number;
  seller_id: string;
}

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_url, stock, seller_id')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      console.error('Error fetching product details:', error.message);
      Alert.alert('Erreur', 'Impossible de charger les détails du produit.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Produit non trouvé.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image_url && (
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
      )}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price} €</Text>
      <Text style={styles.productDescription}>{product.description}</Text>
      <Text style={styles.productStock}>Stock disponible : {product.stock}</Text>

      <View style={styles.actionButtons}>
        <Button title="Ajouter au panier" onPress={() => Alert.alert('Fonctionnalité à venir', 'Ajouter au panier')} />
        {/* <Button title="Contacter le vendeur" onPress={() => {}} /> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
    borderRadius: 10,
    marginBottom: 20,
  },
  productName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 24,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  productStock: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default ProductDetailScreen;
