import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
	Easing,
	interpolate,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StoreProvider from '@/store/StoreProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Hezaedrus: require('../assets/fonts/Hezaedrus-Regular.ttf'),
		Hezaedrus500: require('../assets/fonts/Hezaedrus-Medium.ttf'),
	});

	const [appReady, setAppReady] = useState(false);
	const progress = useSharedValue(0);

	const contentStyle = useAnimatedStyle(() => ({
		opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
	}));

	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync().catch(() => {});
			progress.value = withTiming(
				1,
				{
					duration: 2000,
					easing: Easing.inOut(Easing.ease),
				},
				(finished) => {
					if (finished) {
						runOnJS(setAppReady)(true);
					}
				}
			);
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<StatusBar style='dark' />
			<StoreProvider>
				<Animated.View
					style={[
						StyleSheet.absoluteFill,
						{ backgroundColor: '#fff' },
					]}
				>
					{appReady && (
						<Animated.View
							style={[StyleSheet.absoluteFill, contentStyle]}
						>
							<Stack screenOptions={{ headerShown: false }}>
								<Stack.Screen name='index' />
								<Stack.Screen name='auth' />
								<Stack.Screen name='form' />
								<Stack.Screen name='profile' />
								<Stack.Screen name='groups' />
							</Stack>
						</Animated.View>
					)}
				</Animated.View>
			</StoreProvider>
		</SafeAreaProvider>
	);
}
