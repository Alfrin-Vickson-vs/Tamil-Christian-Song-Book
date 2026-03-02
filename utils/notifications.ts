import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                console.log('Project ID not found. Ensure you have EAS configured.');
            }

            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;

            // Return token to save it to Supabase via Layout logic
            return token;
        } catch (e) {
            console.log(e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function savePushTokenAsync(userId: string, token: string) {
    // Upsert the token in the users table
    const { error } = await supabase
        .from('users')
        .update({ push_token: token })
        .eq('id', userId);

    if (error) {
        console.error('Error saving push token', error);
    }
}
