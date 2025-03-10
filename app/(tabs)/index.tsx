import { StyleSheet, View } from 'react-native';
import { Theme } from '../utils/theme';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      {/* Main content will go here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.light,
  }
});