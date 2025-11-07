import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		backgroundColor: '#f8f9fd',
	},
	container__header: {
		width: '100%',
		display: 'flex',
		height: 100,
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	header__title: {
		color: '#011443',
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		fontWeight: 'medium',
		marginTop: 30,
	},
	back__btn: {
		position: 'absolute',
		left: 16,
		height: 44,
		width: 44,
		borderRadius: 100,
		borderWidth: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: '#1A011443',
		marginTop: 30,
	},
	container__nav: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
	},
	nav__wrap: {
		width: '75%',
		display: 'flex',
		flexDirection: 'row',
		paddingLeft: 16,
		paddingRight: 16,
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	nav__item: {
		backgroundColor: '#D3E0FF',
		width: 30,
		height: 5,
		borderRadius: 4,
	},
	skip__text: {
		fontFamily: 'Hezaedrus',
	},
	container__content: {
		width: '100%',
		minHeight: '100%',
		position: 'relative',
	},
	nav__active: {
		backgroundColor: '#011443',
		borderRadius: 4,
	},
});
