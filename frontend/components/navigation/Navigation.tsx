import { Image, Pressable, View, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { navigationItems } from './navigationItems';
import { styles } from './styles';

const Navigation = () => {
	const router = useRouter();
	const pathname = usePathname();

	const handleRoute = (route: string) => {
		router.push(route);
	};

	return (
		<View style={styles.navigation}>
			{navigationItems.map((item, index) => (
				<Pressable
					key={index}
					style={styles.navigation__item}
					onPress={() => handleRoute(item.route)}
				>
					<Image
						source={
							pathname === item.route
								? item.activeImage
								: item.image
						}
						style={styles.item__image}
					/>

					<Text
						style={[
							styles.item__text,
							pathname === item.route && styles.text__active,
						]}
					>
						{item.name}
					</Text>
				</Pressable>
			))}
		</View>
	);
};

export default Navigation;
