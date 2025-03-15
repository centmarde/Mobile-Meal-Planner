import { Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, View, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { auth } from '../FirebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { router } from 'expo-router'
import SignUpModal from './components/SignUpModal'
import { Theme } from './utils/theme';
import { Toaster, toast } from 'sonner'
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
          source={require('../assets/images/adaptive-icon.png')}
          resizeMode="contain"
        />
        
        <View style={styles.welcomeContainer}>
          <Animated.View entering={FadeInDown.delay(300).duration(700)}>
            <Text style={styles.greetingEmoji}>👋🏼</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(700)}>
            <Text style={styles.greeting}>Hello there!</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(900).duration(700)}>
            <View style={styles.welcomeTextWrapper}>
              <Text style={styles.welcomeText}>Welcome to </Text>
              <LinearGradient
                colors={[Theme.colors.primary, Theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientText}
              >
                <Text style={styles.appName}>Meal Planner</Text>
              </LinearGradient>
            </View>
          </Animated.View>
        </View>

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
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  greetingEmoji: {
    fontSize: 40,
    marginBottom: Theme.spacing.sm,
  },
  greeting: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.heavy,
    color: Theme.colors.dark,
    marginBottom: Theme.spacing.sm,
  },
  welcomeTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: Theme.typography.sizes.lg,
    fontWeight: Theme.typography.weights.medium,
    color: Theme.colors.dark,
  },
  appName: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.heavy,
    color: Theme.colors.light,
    paddingHorizontal: Theme.spacing.sm,
  },
  gradientText: {
    borderRadius: Theme.roundness.sm,
    marginLeft: 4,
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
  },
});