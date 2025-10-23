import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
    }
    setLoading(true);
    try {
      await register(name, email, password);
      Alert.alert('Succès', 'Votre compte a été créé. Veuillez vous connecter.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Erreur d'inscription', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Chargement...' : "S'inscrire"} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Connectez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;