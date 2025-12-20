import { ReactNode } from 'react';
import { View, StyleSheet, Pressable, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePathname } from 'expo-router';

interface Props {
	children: ReactNode;
	title?: string;
}

const ProfileLayout = ({ children, title }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const isMainPage = pathname === '/profile';

	return (
		<View style={styles.container}>
			<StatusBar style='dark' />

			{!isMainPage && (
				<View style={styles.container__header}>
					<Pressable
						style={styles.back__btn}
						onPress={() => router.back()}
					>
						<Image
							source={require('@/assets/images/back.png')}
							style={styles.back__image}
						/>
					</Pressable>
					{title && <Text style={styles.pageTitle}>{title}</Text>}
				</View>
			)}

			<View style={styles.container__body}>{children}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		paddingTop: 60,
		paddingLeft: 16,
		paddingRight: 16,
		backgroundColor: '#F8F9FD',
	},
	container__header: {
		width: '100%',
		height: 44,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
	back__btn: {
		width: 44,
		height: 44,
		position: 'absolute',
		left: 0,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: 'rgba(1, 20, 67, 0.1)',
		borderRadius: 100,
		zIndex: 10,
	},
	back__image: {
		width: 24,
		height: 24,
	},
	pageTitle: {
		fontFamily: 'Hezaedrus500',
		fontSize: 24,
		marginLeft: 18,
		color: '#011443',
	},
	container__body: {
		flex: 1,
		width: '100%',
	},
});

export default ProfileLayout;
