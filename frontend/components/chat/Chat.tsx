import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import ChatFooter from './chat-footer/ChatFooter';
import ChatBody from './chat-body/ChatBody';
import { styles } from './styles';
import Animated from 'react-native-reanimated';
import { useKeyboardAnimation } from '@/helpers/hooks/useKeyboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Chat = () => {
	const { keyboardHeight } = useKeyboardAnimation();
	const insets = useSafeAreaInsets();

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? insets.bottom : 0}
		>
			<View style={styles.chatBodyContainer}>
				<ChatBody />
			</View>

			<Animated.View
				style={{
					transform: [{ translateY: keyboardHeight }],
				}}
			>
				<ChatFooter />
			</Animated.View>
		</KeyboardAvoidingView>
	);
};

export default Chat;
