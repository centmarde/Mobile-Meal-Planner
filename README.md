# Mobile Meal Planner

## Overview
This project is a mobile meal planner application built with React Native and Expo that utilizes Firebase services for authentication, data storage, and serverless functions.

## Technology Stack
- React Native
- Expo
- Firebase Services

### React Native & Expo Setup
1. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```
2. Initialize the project with Expo:
   ```bash
   expo init MobileMealPlanner
   ```
3. Install required dependencies:
   ```bash
   expo install firebase @react-navigation/native expo-status-bar react-native-screens react-native-safe-area-context
   ```

## Firebase Services

### Firebase Authentication
Firebase Authentication provides backend services for easy use of authentication methods, including email/password and social media logins. To implement authentication in this project, follow these steps:
1. Set up Firebase Authentication in the Firebase console.
2. Use the Firebase SDK to integrate authentication methods in your application.

### Firebase Functions
Firebase Functions allow you to run backend code in response to events triggered by Firebase features and HTTPS requests. To set up Firebase Functions:
1. Install Firebase CLI and initialize functions in your project.
2. Write your functions in the `functions` directory and deploy them using the Firebase CLI.

### Firebase Storage
Firebase Storage provides a robust, secure, and scalable object storage solution for storing user-generated content such as images and videos. To use Firebase Storage:
1. Set up Firebase Storage in the Firebase console.
2. Use the Firebase SDK to upload and retrieve files in your application.

### Firestore
Firestore is a flexible, scalable database for mobile, web, and server development. To use Firestore in your project:
1. Set up Firestore in the Firebase console.
2. Use the Firebase SDK to read and write data in your application.

## Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Expo Go app on your mobile device
4. Configure your Firebase project in `FirebaseConfig.ts`
5. Start the development server:
   ```bash
   expo start
   ```

## Development
- Use Expo Go app to test on your device by scanning the QR code
- Use iOS simulator or Android emulator for local development
- Run `expo build:android` or `expo build:ios` to create production builds

## Usage
Run the application using Expo:
- `expo start` - Starts the development server
- `expo start --android` - Starts on Android emulator
- `expo start --ios` - Starts on iOS simulator
- `expo start --web` - Starts the web version

## License
This project is licensed under the MIT License.