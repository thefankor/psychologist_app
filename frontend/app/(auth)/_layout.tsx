import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
	return (
		<Stack>
			<Stack.Screen
				name='AuthPage'
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name='AuthCodePage'
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name='FormPage'
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
}
