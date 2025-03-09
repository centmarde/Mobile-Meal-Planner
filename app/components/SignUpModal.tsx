import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../FirebaseConfig';
import { router } from 'expo-router';
import { validateEmail, validatePassword, validatePasswordMatch } from '../utils/Validator';
import { Theme } from '../utils/theme';
import { Toaster, toast } from 'sonner';

interface SignUpModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const SignUpModal = ({ isVisible, onClose }: SignUpModalProps) => {
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [confirmErrors, setConfirmErrors] = useState<string[]>([]);

  const validateEmailField = () => {
    const { errors } = validateEmail(signUpEmail);
    setEmailErrors(errors);
    return errors;
  };

  const validatePasswordField = () => {
    const { errors } = validatePassword(signUpPassword);
    setPasswordErrors(errors);
    return errors;
  };

  const validateConfirmField = () => {
    const { errors } = validatePasswordMatch(signUpPassword, confirmPassword);
    setConfirmErrors(errors);
    return errors;
  };

  const validateAndSignUp = async () => {
    const emailErrs = validateEmailField();
    const passwordErrs = validatePasswordField();
    const confirmErrs = validateConfirmField();
    
    if ([...emailErrs, ...passwordErrs, ...confirmErrs].length === 0) {
      try {
        const user = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
        if (user) {
          toast.success('Account created successfully!');
          onClose();
          router.replace('/(tabs)');
        }
      } catch (error: any) {
        console.log(error)
        toast.error(error.message);
        setEmailErrors([error.message]);
      }
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Toaster />
      <View style={styles.modalContainer}>
        <View style={styles.modalWrapper}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Account</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, emailErrors.length > 0 && styles.inputError]}
                  placeholder="Email"
                  value={signUpEmail}
                  onChangeText={(text) => {
                    setSignUpEmail(text);
                    setEmailErrors([]);
                  }}
                  onBlur={validateEmailField}
                  autoCapitalize="none"
                />
                {emailErrors.map((error, index) => (
                  <Text key={`email-${index}`} style={styles.errorText}>{error}</Text>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, passwordErrors.length > 0 && styles.inputError]}
                  placeholder="Password"
                  value={signUpPassword}
                  onChangeText={(text) => {
                    setSignUpPassword(text);
                    setPasswordErrors([]);
                  }}
                  onBlur={validatePasswordField}
                  secureTextEntry
                />
                {passwordErrors.map((error, index) => (
                  <Text key={`password-${index}`} style={styles.errorText}>{error}</Text>
                ))}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, confirmErrors.length > 0 && styles.inputError]}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmErrors([]);
                  }}
                  onBlur={validateConfirmField}
                  secureTextEntry
                />
                {confirmErrors.map((error, index) => (
                  <Text key={`confirm-${index}`} style={styles.errorText}>{error}</Text>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.roundButton, styles.modalButton]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.roundButton, styles.modalButton]}
                  onPress={validateAndSignUp}
                >
                  <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.overlay,
  },
  modalWrapper: {
    width: Math.min(400, Dimensions.get('window').width * 0.9),
    maxHeight: Dimensions.get('window').height * 0.8,
    backgroundColor: Theme.colors.light,
    borderRadius: Theme.roundness.lg,
    padding: Theme.spacing.lg,
    alignSelf: 'center',
    ...Theme.shadows.medium,
  },
  scrollView: {
    width: '100%',
  },
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.md,
  },
  modalTitle: {
    fontSize: Theme.typography.sizes.xl,
    fontWeight: Theme.typography.weights.semibold,
    marginBottom: Theme.spacing.lg,
    color: Theme.colors.primaryDark,
  },
  textInput: {
    height: 50,
    width: '100%',
    backgroundColor: Theme.colors.light,
    borderColor: Theme.colors.secondaryLight,
    borderWidth: 2,
    borderRadius: Theme.roundness.md,
    marginVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.xl,
    fontSize: Theme.typography.sizes.md,
    color: Theme.colors.dark,
    ...Theme.shadows.light,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.xs,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  roundButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.roundness.lg,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: Theme.colors.light,
    fontSize: Theme.typography.sizes.sm,
    fontWeight: Theme.typography.weights.light,
  },
  errorContainer: {
    width: '90%',
    marginVertical: Theme.spacing.sm,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.sizes.xs,
    marginLeft: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  inputContainer: {
    width: '90%',
    marginBottom: Theme.spacing.sm,
  },
  inputError: {
    borderColor: Theme.colors.error,
    borderWidth: 2,
  },
});

export default SignUpModal;
