import { UI } from '@/types/ui';

import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './styles';
import useChat from '@/helpers/hooks/useChat';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Chat from '@/components/chat/Chat';
import { setGroup, setSearchMode } from '@/store/slices/groupSlice';
import { RootState } from '@/store/store';
import { TextInput } from 'react-native';

interface GroupProps {
	id: number;
}

const GroupContent = ({ id }: GroupProps) => {
	const dispatch = useDispatch();
	const { groups } = useChat();

	const { name, image, members, searchMode } = useSelector(
		(state: RootState) => state.group
	);
	const insets = useSafeAreaInsets();
	console.log(image);
	useEffect(() => {
		if (groups) {
			dispatch(
				setGroup({
					name: 'Тестовая группа',
					image: '@/assets/images/support.png',
					members: 100,
					messages: [],
					description:
						'Самый популярный русскоязычный канал о психологии ',
					rules: 'А это правила самого популярного канала ',
				})
			);
		}
		return () => {
			dispatch(
				setSearchMode({
					searchMode: false,
				})
			);
		};
	}, [groups]);

	const goBack = () => {
		router.push(`/groups/groups`);
	};

	const goInfo = (id: number) => {
		router.push({
			pathname: '/groups/info',
			params: { id: id.toString() },
		});
	};

	const closeSearchMode = () => {
		dispatch(
			setSearchMode({
				searchMode: false,
			})
		);
	};
	if (!name) return <View></View>;

	return (
		<View style={[styles.container, { paddingTop: insets.top + 4 }]}>
			<View style={styles.container__header}>
				{searchMode ? (
					<View style={styles.container__search}>
						<Image
							source={require('@/assets/images/search.png')}
							style={styles.search__image}
						/>
						<TextInput
							placeholder='Поиск'
							placeholderTextColor={UI.colors.mediumBlue}
							style={styles.search__input}
							autoFocus
							cursorColor={UI.colors.blue}
						/>
						<Pressable
							onPress={closeSearchMode}
							style={styles.search__cancel}
						>
							<Text style={styles.cancel__text}>Отменить</Text>
						</Pressable>
					</View>
				) : (
					<>
						<Pressable
							onPress={goBack}
							style={styles.container__btn}
						>
							<Image
								source={require('@/assets/images/back.png')}
								style={styles.back__image}
							/>
						</Pressable>
						<Pressable
							style={styles.container__info}
							onPress={() => goInfo(id)}
						>
							<Text style={styles.container__title}>{name}</Text>
							<Text style={styles.container__subtitle}>
								{members} участников
							</Text>
						</Pressable>
						<Pressable>
							<Image
								source={require('@/assets/images/arsen.png')}
								style={styles.container__image}
							/>
						</Pressable>
					</>
				)}
			</View>
			<View style={styles.container__body}>
				<Chat />
			</View>
		</View>
	);
};

export default GroupContent;
