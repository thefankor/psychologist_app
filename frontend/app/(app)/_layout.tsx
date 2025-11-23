import { Stack } from 'expo-router';

export default function AppLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='auth' />
			<Stack.Screen name='form' />
			<Stack.Screen name='profile' />
			<Stack.Screen name='group' />
		</Stack>
	);
}
