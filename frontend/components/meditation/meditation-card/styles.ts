import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	cardPressable: {
		marginBottom: 16,
	},
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 24,
		padding: 16,
		borderLeftWidth: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	emojiContainer: {
		width: 60,
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
		borderRadius: 30,
	},
	emoji: {
		width: 25,
		height: 25,
	},
	info: {
		flex: 1,
	},
	cardTitle: {
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		color: '#011443',
		marginBottom: 4,
	},
	duration: {
		fontFamily: 'Hezaedrus',
		fontSize: 14,
		color: '#01144380',
	},
	arrow: {
		padding: 8,
	},
	arrowText: {
		fontSize: 24,
		color: '#3E75FF',
	},
});
