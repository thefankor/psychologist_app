import { GroupType } from '@/types/types';
import { Pressable, Image, View, Text } from 'react-native';
import { styles } from './styles';
import { router } from 'expo-router';

const Group = ({
	name,
	messages,
	lastMessage,
	time,
	image,
	from,
	id,
}: GroupType) => {
	const openGroup = (id: number) => {
		router.push({
			pathname: '/groups/[id]',
			params: { id: id.toString() },
		});
	};
	return (
		<Pressable onPress={() => openGroup(id)} style={styles.group}>
			<Image source={image} style={styles.group__image} />
			<View style={styles.group__info}>
				<Text allowFontScaling={false} style={styles.group__name}>
					{name}
				</Text>
				<Text allowFontScaling={false} style={styles.group__from}>
					{from}
				</Text>
				<Text allowFontScaling={false} style={styles.group__message}>
					{lastMessage}
				</Text>
			</View>
			<View style={styles.group__stats}>
				<Text allowFontScaling={false} style={styles.group__time}>
					{time}
				</Text>
				<View style={styles.group__messages}>
					<Text allowFontScaling={false} style={styles.messages}>
						{messages}
					</Text>
				</View>
			</View>
		</Pressable>
	);
};

export default Group;
