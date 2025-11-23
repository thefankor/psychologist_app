import { ReactNode } from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { usePathname, useSearchParams } from 'expo-router/build/hooks';

interface Props {
	children: ReactNode;
}

const ProfileLayout = ({ children }: Props) => {
	const router = useRouter();
	const pathname = usePathname();

	const isMainPage = pathname === '/profile/profile';
	return (
		<View style={[styles.container]}>
			<StatusBar style='dark' />
			{!isMainPage && (
				<View style={styles.container__header}>
					<Pressable
						style={styles.back__btn}
						onPress={() => router.back()}
					>
						<Image
							style={styles.back__image}
							height={100}
							width={100}
							source={require('@/assets/images/back.png')}
						/>
					</Pressable>
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
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		position: 'relative',
		alignItems: 'center',
	},
	back__btn: {
		width: 44,
		height: 44,
		alignItems: 'center',
		position: 'absolute',
		justifyContent: 'center',
		left: 0,
		borderWidth: 1.5,
		borderRadius: 100,
		borderColor: 'rgba(1, 20, 67, 0.1)',
	},
	back__image: {
		maxHeight: 24,
		maxWidth: 24,
	},
	container__name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
	},
	container__body: {
		width: '100%',
		height: '95%',
	},
});

export default ProfileLayout;
