import "../global.css";
import React, { useEffect } from 'react';
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../utils/supabase";
import { useAuthStore } from "../store/auth";

export default function RootLayout() {
    const { setUser, setSession, setLoading } = useAuthStore();

    useEffect(() => {
        // Initialize Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            handleUserUpdate(session?.user ?? null);
        });

        // Listen for Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            handleUserUpdate(session?.user ?? null);

            // Redirect based on auth state (basic example)
            if (!session) {
                // Could optionally route to login: router.replace('/(auth)/login');
                // But we allow Guest mode so we stay put
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function handleUserUpdate(user: any | null) {
        if (!user) {
            setUser(null, null);
            setLoading(false);
            return;
        }

        // Fetch custom role from our public.users table created by the trigger
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Failed to fetch user role:', error);
            setUser(user, 'user');
        } else {
            setUser(user, data.role as 'admin' | 'user');
        }

        // Trigger Notification registration
        import('../utils/notifications').then(({ registerForPushNotificationsAsync, savePushTokenAsync }) => {
            registerForPushNotificationsAsync().then(token => {
                if (token) savePushTokenAsync(user.id, token);
            });
        });

        setLoading(false);
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}
