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
	const openGroup = () => {
		router.push({
			pathname: '/groups/[id]',
			params: { id: String(id) },
		});
	};

	return (
		<Pressable onPress={openGroup} style={styles.group}>
			<Image source={image} style={styles.group__image} />

			<View style={styles.group__info}>
				<View style={styles.headerRow}>
					<Text
						allowFontScaling={false}
						style={styles.group__name}
						numberOfLines={1}
					>
						{name}
					</Text>
					<Text allowFontScaling={false} style={styles.group__time}>
						{time}
					</Text>
				</View>

				<Text
					allowFontScaling={false}
					style={styles.group__from}
					numberOfLines={1}
				>
					{from}
				</Text>

				<Text
					allowFontScaling={false}
					style={styles.group__message}
					numberOfLines={2}
				>
					{lastMessage}
				</Text>
			</View>

			{messages > 0 && (
				<View style={styles.group__messages}>
					<Text allowFontScaling={false} style={styles.messages}>
						{messages}
					</Text>
				</View>
			)}
		</Pressable>
	);
};

export default Group;
