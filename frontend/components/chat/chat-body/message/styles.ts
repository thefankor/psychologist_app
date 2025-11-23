import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		minHeight: 70,
		flexDirection: 'row',
		marginTop: 12,
	},
	container__avatar: {
		height: 32,
		width: 32,
		marginRight: 12,
		borderRadius: 100,
		alignSelf: 'flex-end',
		backgroundColor: '#CCCCCC',
	},
	container__message: {
		maxWidth: '80%',
	},
	container__text: {
		fontFamily: 'Hezaedrus',
		paddingTop: 2,
		paddingBottom: 12,

		backgroundColor: '#3871FF',
		borderRadius: 24,
		width: 'auto',
		color: '#fff',
		borderBottomRightRadius: 4,
	},
	support__message: {
		backgroundColor: '#f2f2f2ff',
		color: '#30364A',
		borderBottomLeftRadius: 4,
		borderBottomRightRadius: 24,
	},
	container__footer: {
		maxWidth: '100%',
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 4,
	},
	container__time: {
		fontSize: 12,
		fontFamily: 'Hezaedrus',
		color: 'rgba(1, 20, 67, 0.3)',
	},
	message: {
		color: '#fff',
		fontFamily: 'Hezaedrus',
		paddingLeft: 16,
		paddingRight: 16,
	},
	not_user: {
		color: '#30364A',
	},
	viewed__image: {
		width: 16,
		height: 16,
		marginRight: 8,
	},
	message__from: {
		fontFamily: 'Hezaedrus',
		fontSize: 12,
		color: 'rgba(1, 20, 67, 0.6)',
	},
	from__wrap: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	from__image: {
		height: 16,
		width: 16,
		marginRight: 12,
		marginLeft: 4,
	},
});
