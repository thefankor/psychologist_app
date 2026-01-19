import { Image, Pressable, View, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { navigationItems } from './navigationItems';
import { styles } from './styles';
import { getRole } from '@/helpers/helper';
import { useEffect, useState } from 'react';

const Navigation = () => {
	const router = useRouter();
	const pathname = usePathname();
	const [visibleItems, setVisibleItems] = useState(navigationItems);

	useEffect(() => {
		checkRole();
	}, []);

	const handleRoute = (route: string) => {
		router.push(route);
	};

	const checkRole = async () => {
		const res = await getRole();
		if (res === 'psychologist') {
			const psychologistNavigation = [];
			psychologistNavigation.push(navigationItems[1], navigationItems[3]);
			setVisibleItems(psychologistNavigation);
		} else {
			return;
		}
	};
	return (
		<View style={styles.navigation}>
			{visibleItems.map((item, index) => (
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
