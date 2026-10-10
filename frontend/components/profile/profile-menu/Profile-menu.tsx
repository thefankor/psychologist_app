import { Image, Pressable, View, Text } from 'react-native';
import { Menu } from './menu';
import { styles } from './styles';
import { Switch } from '@/components/custom/ui/Switch';

interface Props extends Menu {
	isActive?: boolean;
	setActive?: () => void;
	disableBorder: boolean;
}

const ProfileMenu = ({
	image,
	name,
	type,
	action,
	isActive,
	disableBorder,
}: Props) => {
	return (
		<Pressable
			onPress={action}
			style={[
				styles.container,
				{ borderBottomWidth: disableBorder ? 0 : 1 },
			]}
		>
			<View style={styles.container__text}>
				<Image
					source={image}
					width={40}
					height={40}
					style={styles.container__image}
				/>
				<Text style={styles.container__name}>{name}</Text>
			</View>
			{type === 'redirect' ? (
				<Image
					source={require('@/assets/images/right.png')}
					style={styles.container__arrow}
				/>
			) : type === 'switch' ? (
				<Switch isActive={isActive} onPress={action} />
			) : (
				<></>
			)}
		</Pressable>
	);
};
export default ProfileMenu;
