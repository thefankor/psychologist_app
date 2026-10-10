import { Href } from 'expo-router';
import { ImageProps } from 'react-native';

interface Navigator {
	image: ImageProps;
	activeImage: ImageProps;
	route: Href;
	name: string;
}

export const navigationItems: Navigator[] = [
	{
		route: '/psychologists',
		name: 'Психологи',
		image: require('@/assets/images/psyho.png'),
		activeImage: require('@/assets/images/psyho_active.png'),
	},
	{
		route: '/groups',
		name: 'Чаты',
		image: require('@/assets/images/chat.png'),
		activeImage: require('@/assets/images/chat_active.png'),
	},
	{
		route: '/meditation',
		name: 'Медитация',
		image: require('@/assets/images/meditation.png'),
		activeImage: require('@/assets/images/meditation_active.png'),
	},
	{
		route: '/profile',
		name: 'Профиль',
		image: require('@/assets/images/avatar.png'),
		activeImage: require('@/assets/images/user.png'),
	},
];
