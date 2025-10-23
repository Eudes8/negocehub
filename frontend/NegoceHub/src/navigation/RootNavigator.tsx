import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
