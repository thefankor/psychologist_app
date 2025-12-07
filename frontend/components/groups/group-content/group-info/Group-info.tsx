import { Image, Pressable, Text, View, ScrollView } from 'react-native';
import { styles } from './styles';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const GroupInfo = () => {
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();

	const chat = useSelector((state: RootState) =>
		state.chats.chats.find((c) => c.id === id)
	);

	if (!chat) return null;

	const goBack = () => router.back();

	return (
		<View style={[styles.container, { paddingTop: insets.top + 4 }]}>
			<View style={styles.container__header}>
				<Pressable onPress={goBack} style={styles.container__btn}>
					<Image
						source={require('@/assets/images/back.png')}
						style={styles.back__image}
					/>
				</Pressable>
			</View>

			<ScrollView
				contentContainerStyle={{
					alignItems: 'center',
					paddingBottom: insets.bottom,
				}}
			>
				<Image
					source={
						chat.image
							? { uri: chat.image }
							: require('@/assets/images/chat.png')
					}
					style={styles.container__image}
				/>
				<Text style={styles.container__name}>{chat.name}</Text>
				<Text style={styles.container__subtitle}>
					{chat.description || 'Нет описания'}
				</Text>
				<Text style={styles.container__subtitle}>
					{chat.rules || 'Нет правил'}
				</Text>
			</ScrollView>
		</View>
	);
};

export default GroupInfo;
