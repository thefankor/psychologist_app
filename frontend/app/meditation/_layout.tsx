import { Stack } from 'expo-router';

export default function MeditationLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='meditation' />
			<Stack.Screen name='player' />
		</Stack>
	);
}
