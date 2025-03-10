import { Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth } from '../FirebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { router } from 'expo-router'
import SignUpModal from './components/SignUpModal'
import { Theme } from './utils/theme';
import { Toaster, toast } from 'sonner'

const index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const user = await signInWithEmailAndPassword(auth, email, password)
      if (user) {
        toast.success("Successfully signed in!");
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.log(error)
      toast.error('Sign in failed: ' + error.message);
    }
  }

  return (
 
      <SafeAreaView style={styles.container}>
        <Toaster position="top-center" expand={true} richColors />
        <Image
          style={styles.logo}
          source={require('../assets/images/adaptive-icon.png')} // For local image
          // OR use this for remote image:
          // source={{ uri: 'https://your-image-url.com/image.png' }}
        />
        <Text style={styles.title}>
          👋🏼 Greetings!
        </Text>
        <TextInput style={styles.textInput} placeholder="email" value={email} onChangeText={setEmail} />
        <TextInput style={styles.textInput} placeholder="password" value={password} onChangeText={setPassword} secureTextEntry/>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={signIn}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <View style={styles.buttonSpacer} />
          <TouchableOpacity style={styles.roundButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Make Account</Text>
          </TouchableOpacity>
        </View>

        <SignUpModal 
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
   
  )
}

export default index

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
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.dark,
  },
  textInput: {
    height: 50,
    width: '90%',
    backgroundColor: Theme.colors.light,
    borderColor: Theme.colors.secondaryLight,
    borderWidth: 2,
    borderRadius: Theme.roundness.md,
    marginVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
    ...Theme.shadows.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '90%',
    marginTop: Theme.spacing.lg,
  },
  buttonSpacer: {
    width: Theme.spacing.lg,
  },
  roundButton: {
    ...Theme.buttons.primary,
  },
  buttonText: {
    ...Theme.buttons.text,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Theme.spacing.lg,
    resizeMode: 'contain',
  },
});