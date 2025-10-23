import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

type ProductFormScreenRouteProp = RouteProp<AppStackParamList, 'ProductForm'>;
type ProductFormScreenNavigationProp = NativeStackNavigationProp<AppStackParamList, 'ProductForm'>;

const ProductFormScreen: React.FC = () => {
  const navigation = useNavigation<ProductFormScreenNavigationProp>();
  const route = useRoute<ProductFormScreenRouteProp>();
  const { session } = useAuth();
  const productId = route.params?.productId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (productId) {
      setIsEditing(true);
      fetchProduct(productId);
    }
  }, [productId]);

  const fetchProduct = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('name, description, price, stock, image_url')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price.toString());
        setStock(data.stock.toString());
        setImageUrl(data.image_url || '');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error.message);
      Alert.alert('Erreur', 'Impossible de charger le produit.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      Alert.alert('Erreur', 'Vous devez être connecté pour gérer les produits.');
      return;
    }
    if (!name || !price || !stock) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires (Nom, Prix, Stock).');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        image_url: imageUrl || null,
        seller_id: session.user.id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq('id', productId);
        if (error) throw error;
        Alert.alert('Succès', 'Produit mis à jour avec succès.');
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
        Alert.alert('Succès', 'Produit ajouté avec succès.');
      }
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving product:', error.message);
      Alert.alert('Erreur', error.message || 'Impossible d'enregistrer le produit.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Modifier le Produit' : 'Ajouter un Produit'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du produit"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"n        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Prix"n        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"n        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="URL de l'image (facultatif)"n        value={imageUrl}
        onChangeText={setImageUrl}
      />

      <Button
        title={loading ? 'Chargement...' : (isEditing ? 'Enregistrer les modifications' : 'Ajouter le Produit')}
        onPress={handleSubmit}
        disabled={loading}
      />
      <Button title="Annuler" onPress={() => navigation.goBack()} color="red" />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default ProductFormScreen;
