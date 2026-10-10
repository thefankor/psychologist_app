import { Stack } from 'expo-router';

export default function GroupsLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='groups' />
			<Stack.Screen name='info' />
			<Stack.Screen name='[id]' />
		</Stack>
	);
}
