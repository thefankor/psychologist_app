import { View, Text, TextInput, Image } from 'react-native';
import { styles } from './styles';
import { UI } from '@/types/ui';
import Group from './group/Group';
import useChat from '@/helpers/hooks/useChat';

const Groups = () => {
	const { groups } = useChat();

	return (
		<View style={styles.container}>
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
				/>
			</View>

			<View style={styles.groups}>
				{groups?.map((item) => (
					<Group key={item.id} {...item} />
				))}
			</View>
		</View>
	);
};

export default Groups;
