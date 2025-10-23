import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../config/supabase';

const ProfileScreen: React.FC = () => {
  const { session, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProfile(session.user.id);
    }
  }, [session]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setUserProfile(data);
      setName(data.name);
      setEmail(data.email);
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
      Alert.alert('Erreur', 'Impossible de charger le profil utilisateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name, email, updated_at: new Date().toISOString() })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Succès', 'Profil mis à jour avec succès.');
      setEditing(false);
      fetchUserProfile(session.user.id); // Refresh profile data
    } catch (error: any) {
      console.error('Error updating user profile:', error.message);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.centered}>
        <Text>Aucun profil utilisateur trouvé.</Text>
        <Button title="Déconnexion" onPress={logout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      {editing ? (
        <>
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
          <Button title="Enregistrer" onPress={handleUpdateProfile} />
          <Button title="Annuler" onPress={() => setEditing(false)} color="red" />
        </>
      ) : (
        <>
          <Text style={styles.label}>Nom:</Text>
          <Text style={styles.value}>{userProfile.name}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userProfile.email}</Text>

          <Button title="Modifier le Profil" onPress={() => setEditing(true)} />
        </>
      )}

      <View style={styles.logoutButtonContainer}>
        <Button title="Déconnexion" onPress={logout} color="red" />
      </View>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
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
  logoutButtonContainer: {
    marginTop: 40,
    width: '100%',
  },
});

export default ProfileScreen;