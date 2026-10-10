import {
	View,
	Text,
	TextInput,
	Image,
	ScrollView,
	Keyboard,
} from 'react-native';
import { styles } from './styles';
import { UI } from '@/types/ui';
import Group from './group/Group';
import { useEffect, useState } from 'react';
import { GroupType, ServerChat } from '@/types/types';
import { getChats } from '@/api/chats/chats';
import { getToken } from '@/helpers/helper';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '@/store/slices/chatsSlice';
import { RootState } from '@/store/store';
import { Loading } from '../custom/ui/Loading';

const Groups = () => {
	const dispatch = useDispatch();
	const chats = useSelector((state: RootState) => state.chats.chats);
	const myId = useSelector((state: RootState) => state.user.id);
	const myName = useSelector((state: RootState) => state.user.name || 'Я');
	const [loading, setLoading] = useState<boolean>(false);

	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		load();
	}, [dispatch]);

	const load = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			if (!token) return;
			const data = await getChats(token);
			dispatch(setChats(data || []));
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};
	const filteredChats = chats.filter((chat: ServerChat) =>
		chat.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const groupItems: GroupType[] = filteredChats.map((chat: ServerChat) => {
		const lastMsg = chat.last_messages?.[0];
		const isMyLastMessage = lastMsg?.author.id === myId;

		return {
			id: chat.id,
			name: chat.name,
			image: chat.image
				? { uri: chat.image }
				: require('@/assets/images/chat.png'),
			description: chat.description || '',
			rules: chat.rules || '',
			members: 0,
			lastMessage: lastMsg?.text || 'Нет сообщений',
			from: isMyLastMessage ? myName : lastMsg?.author.name || '',
			time: lastMsg?.created_at
				? new Date(lastMsg.created_at).toLocaleTimeString('ru', {
						hour: '2-digit',
						minute: '2-digit',
				  })
				: '',
			messages: 0,
		};
	});

	if (loading) {
		return <Loading />;
	}

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps='handled'
			onScrollBeginDrag={Keyboard.dismiss}
		>
			<View style={styles.container__header}>
				<Text style={styles.container__title} allowFontScaling={false}>
					Чаты
				</Text>
			</View>

			<View style={styles.input__wrap}>
				<Image
					source={require('@/assets/images/search.png')}
					style={styles.container__search}
				/>
				<TextInput
					placeholder='Поиск'
					style={styles.container__input}
					placeholderTextColor={UI.colors.mediumBlue}
					value={searchQuery}
					onChangeText={setSearchQuery}
					autoCapitalize='none'
					autoCorrect={false}
				/>
			</View>

			<View style={styles.groups}>
				{groupItems.length > 0 ? (
					groupItems.map((item) => <Group key={item.id} {...item} />)
				) : (
					<View style={styles.noChatsContainer}>
						<Text style={styles.noChatsText}>
							{searchQuery
								? 'Чаты не найдены'
								: 'Нет доступных чатов'}
						</Text>
					</View>
				)}
			</View>
		</ScrollView>
	);
};

export default Groups;
