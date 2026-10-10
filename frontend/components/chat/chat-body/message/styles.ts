import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		flexDirection: 'row',
		marginTop: 12,
		alignItems: 'flex-start',
	},
	left: {
		justifyContent: 'flex-start',
	},
	right: {
		justifyContent: 'flex-end',
	},
	container__avatar: {
		height: 32,
		width: 32,
		borderRadius: 100,
		backgroundColor: '#CCCCCC',
		marginTop: 4,
		marginHorizontal: 8,
	},
	container__message: {
		maxWidth: '80%',
		flexShrink: 1,
	},
	nameTimeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	leftAlign: {
		justifyContent: 'flex-start',
	},
	rightAlign: {
		justifyContent: 'flex-end',
	},
	container__text: {
		paddingVertical: 8,
		paddingHorizontal: 14,
		borderRadius: 20,
		alignItems: 'flex-start',
	},
	leftBubble: {
		alignSelf: 'flex-start',
	},
	rightBubble: {
		alignSelf: 'flex-end',
	},
	my__message: {
		backgroundColor: '#3871FF',
		borderBottomRightRadius: 4,
	},
	support__message: {
		backgroundColor: '#f2f2f2ff',
		borderBottomLeftRadius: 4,
	},
	container__time: {
		fontSize: 12,
		fontFamily: 'Hezaedrus',
		color: 'rgba(1, 20, 67, 0.3)',
		marginLeft: 6,
	},
	message: {
		fontFamily: 'Hezaedrus',
		fontSize: 14,
	},
	my__text: {
		color: '#fff',
	},
	not_user: {
		color: '#30364A',
	},
	message__from: {
		fontFamily: 'Hezaedrus',
		fontSize: 12,
		color: 'rgba(1, 20, 67, 0.6)',
	},
});
