import { ScrollView } from 'react-native';
import { styles } from './styles';
import Message from './message/Message';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const ChatBody = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const messages = useSelector((state: RootState) =>
		id ? state.chats.messages[id] || [] : []
	);
	const scrollViewRef = useRef<ScrollView>(null);
	const rigthMessages = [...messages].reverse();
	useEffect(() => {
		scrollViewRef.current?.scrollToEnd({ animated: true });
	}, [messages]);

	if (!id) return null;

	return (
		<ScrollView
			ref={scrollViewRef}
			style={styles.container}
			keyboardShouldPersistTaps='handled'
			showsVerticalScrollIndicator={false}
		>
			{rigthMessages.map((msg) => (
				<Message key={msg.id || msg.localId} msg={msg} />
			))}
		</ScrollView>
	);
};

export default ChatBody;
