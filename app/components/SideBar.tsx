import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View, Image, Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Theme, { Colors } from '../utils/theme';
import { auth } from '../../FirebaseConfig';
import { signOut } from 'firebase/auth';
import { Toaster, toast } from 'sonner';

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(true);


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      toast.error('Sign out failed: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
       <Toaster 
      position="top-center" 
      toastOptions={{style: {
        background: Colors.success, // Set your success color here
        color: Colors.light,
      },}}
    />
      <Sidebar
        collapsed={collapsed}
        width="270px"
        collapsedWidth="0px"
        transitionDuration={300}
        backgroundColor={Colors.light}
        rootStyles={{
          border: `1px solid ${Colors.secondaryLight}`,
          height: '100%',
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 1000,
          fontFamily: 'Roboto, sans-serif',
          fontSize: 15,
        }}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/adaptive-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Menu
          menuItemStyles={{
            button: {
              [`&.active`]: {
                backgroundColor: Colors.primary,
                color: Colors.light,
              },
              '&:hover': {
                backgroundColor: Colors.primaryLight,
                color: Colors.light,
              },
            },
          }}
        >
          <SubMenu
            label="Database"
            icon={<FontAwesome name="database" size={20} />}
          >
            <MenuItem 
              icon={<FontAwesome name="table" size={20} />}
              onClick={() => router.push('/two')}
            >
              <Text>Tables</Text>
            </MenuItem>
          </SubMenu>

          <SubMenu
            label="Storage"
            icon={<FontAwesome name="hdd-o" size={20} />}
          >
            <MenuItem 
              icon={<FontAwesome name="folder" size={20} />}
              onClick={() => router.push('/three')}
            >
             <Text>Files</Text>
            </MenuItem>
          </SubMenu>

          <MenuItem 
            icon={<FontAwesome name="code" size={20} />}
            onClick={() => router.push('/four')}
          >
            Functions
          </MenuItem>
        </Menu>
        
        {!collapsed && (
          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={handleSignOut}>
              <FontAwesome name="sign-out" size={20} color={Colors.light} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
          </View>
        )}
      </Sidebar>
      
      <Pressable 
        style={[
          styles.toggleButton,
          collapsed ? styles.toggleButtonCollapsed : styles.toggleButtonExpanded
        ]} 
        onPress={() => setCollapsed(!collapsed)}
      >
        <FontAwesome 
          name={collapsed ? 'bars' : 'times'} 
          size={24} 
          color={Colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  toggleButton: {
    position: 'absolute',
    top: 5,
    width: Theme.spacing.xl + Theme.spacing.lg,
    height: Theme.spacing.xl + Theme.spacing.lg,
    backgroundColor: Colors.light,
    borderWidth: Theme.spacing.xs - 1,
    borderColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
    borderRadius: 40,
    //@ts-ignore
    transition: 'all 300ms ease-in-out',
    ...Theme.shadows.medium,
  },
  toggleButtonCollapsed: {
    right: 5,
    transform: [{translateY: 0}, {rotate: '0deg'}],
  },
  toggleButtonExpanded: {
    right: 245,
    transform: [{translateY: 0}, {rotate: '180deg'}],
  },
  logoContainer: {
    padding: Theme.spacing.md,
    paddingTop: 50,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 60,
  },
  logoutContainer: {
    position: 'absolute',
    bottom: Theme.spacing.xl,
    width: '100%',
    paddingHorizontal: Theme.spacing.md,
  },
  logoutButton: {
    ...Theme.buttons.primary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutText: {
    ...Theme.buttons.text,
    marginLeft: Theme.spacing.sm,
  }
});