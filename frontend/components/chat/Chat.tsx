import React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import ChatFooter from './chat-footer/ChatFooter';
import ChatBody from './chat-body/ChatBody';
import { styles } from './styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Chat = () => {
	const insets = useSafeAreaInsets();

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 40 : 0}
		>
			<View style={styles.chatBodyContainer}>
				<ChatBody />
			</View>

			<View
				style={[
					styles.footerContainer,
					{
						paddingBottom: insets.bottom + 20,
						paddingTop: 20,
					},
				]}
			>
				<ChatFooter />
			</View>
		</KeyboardAvoidingView>
	);
};

export default Chat;
