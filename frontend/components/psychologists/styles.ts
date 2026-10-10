import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F5F8FF',
		paddingTop: 60,
		marginBottom: 80,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		paddingHorizontal: 20,
		marginBottom: 30,
	},
	titleWrapper: {
		flexDirection: 'column',
	},
	title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 28,
		color: '#011443',
		lineHeight: 34,
	},
	menuButton: {
		width: 48,
		height: 48,
		backgroundColor: '#fff',
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 8,
		marginTop: 4,
	},
	menuIcon: {
		width: 28,
		height: 28,
	},
});
