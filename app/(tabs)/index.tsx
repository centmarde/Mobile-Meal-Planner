import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { auth } from '../../FirebaseConfig';
import { Theme } from '../utils/theme';

export default function TabOneScreen() {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      alert('Sign out failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Out</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.text}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.light,
  },
  title: {
    fontSize: Theme.typography.sizes.xxl,
    fontWeight: Theme.typography.weights.heavy,
    color: Theme.colors.primaryDark,
    marginBottom: Theme.spacing.xl,
  },
  separator: {
    marginVertical: Theme.spacing.lg,
    height: 2,
    width: '80%',
    backgroundColor: Theme.colors.secondaryLight,
  },
  button: {
    width: '90%',
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.md,
    borderRadius: Theme.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.medium,
    marginTop: Theme.spacing.sm,
  },
  text: {
    color: Theme.colors.light,
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.semibold,
  }
});