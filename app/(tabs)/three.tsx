import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../FirebaseConfig';
import { Theme } from '../utils/theme';

export default function TabFourScreen() {
  const [functionResult, setFunctionResult] = useState('');

  const callHelloWorldFunction = async () => {
    const functions = getFunctions(app, 'us-central1');
    const helloWorld = httpsCallable(functions, 'helloWorld');
    try {
      const result: any = await helloWorld();
      setFunctionResult(result.data.message);
    } catch (error) {
      console.error("Error calling function:", error);
      setFunctionResult('Failed to call function');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Functions</Text>
        <Text style={styles.text}>{functionResult}</Text>
        <TouchableOpacity style={styles.button} onPress={callHelloWorldFunction}>
          <Text style={styles.buttonText}>Call Hello World Function</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.light,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    marginBottom: -Theme.spacing.xl,
  },
  title: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.bold,
    marginBottom: Theme.spacing.lg,
    color: Theme.colors.dark,
  },
  button: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary,
    ...Theme.shadows.medium,
    marginLeft: Theme.spacing.sm,
  },
  buttonText: {
    color: Theme.colors.light,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
  },
  text: {
    color: Theme.colors.dark,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
    margin: Theme.spacing.lg,
  }
});