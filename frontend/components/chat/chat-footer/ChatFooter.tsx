import { Pressable, Image, TextInput, View, Keyboard } from 'react-native';
import { useState } from 'react';
import { styles } from './styles';
import { useChatWebSocket } from '@/helpers/hooks/useChatWebsocket';
import { useLocalSearchParams } from 'expo-router';

const ChatFooter = () => {
	const [text, setText] = useState('');
	const { id } = useLocalSearchParams<{ id: string }>();
	const { sendMessage, sendTyping } = useChatWebSocket();

	const handleSend = () => {
		if (!text.trim() || !id) return;
		sendMessage(id, text.trim());
		setText('');
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.container__input}
				placeholder='Введите сообщение'
				cursorColor='#3E75FF'
				value={text}
				onChangeText={(t) => {
					setText(t);
					if (t && id) sendTyping(id);
				}}
				placeholderTextColor='rgba(1, 20, 67, 0.3)'
				onSubmitEditing={handleSend}
			/>

			<Pressable
				style={styles.container__image}
				onPress={() => Keyboard.dismiss()}
			>
				<Image
					source={require('@/assets/images/clip.png')}
					style={{ height: 28, width: 28 }}
				/>
			</Pressable>

			<Pressable style={styles.send__btn} onPress={handleSend}>
				<Image
					source={require('@/assets/images/send.png')}
					style={styles.send__img}
				/>
			</Pressable>
		</View>
	);
};

export default ChatFooter;
