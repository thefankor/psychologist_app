import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chat from '@/components/chat/Chat';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setCurrentChat } from '@/store/slices/chatsSlice';
import { useEffect } from 'react';

interface GroupContentProps {
	id: string;
}

const GroupContent = ({ id }: GroupContentProps) => {
	const insets = useSafeAreaInsets();
	const dispatch = useDispatch();

	const chat = useSelector((state: RootState) =>
		state.chats.chats.find((c) => c.id === String(id))
	);

	useEffect(() => {
		if (id) dispatch(setCurrentChat(id));
	}, [id, dispatch]);

	if (!chat) return <View />;

	const goBack = () => router.push('/groups');
	const goInfo = () =>
		router.push({ pathname: '/groups/info', params: { id } });

	return (
		<View style={[styles.container, { paddingTop: insets.top + 4 }]}>
			<View style={styles.container__header}>
				<Pressable onPress={goBack} style={styles.container__btn}>
					<Image
						source={require('@/assets/images/back.png')}
						style={styles.back__image}
					/>
				</Pressable>

				<Pressable style={styles.container__info} onPress={goInfo}>
					<Text style={styles.container__title}>{chat.name}</Text>
					<Text style={styles.container__subtitle}>
						{chat.type === 'GROUP' ? 'Групповой чат' : 'Личный чат'}
					</Text>
				</Pressable>

				<Pressable>
					<Image
						source={
							chat.image
								? { uri: chat.image }
								: require('@/assets/images/chat.png')
						}
						style={styles.container__image}
					/>
				</Pressable>
			</View>

			<View style={styles.container__body}>
				<Chat />
			</View>
		</View>
	);
};

export default GroupContent;
