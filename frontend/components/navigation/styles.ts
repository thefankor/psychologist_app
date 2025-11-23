import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	navigation: {
		position: 'absolute',
		width: '100%',
		height: 97,
		maxHeight: 97,
		zIndex: 3,
		display: 'flex',
		paddingTop: 12.5,
		justifyContent: 'space-evenly',
		flexDirection: 'row',
		bottom: 0,
		backgroundColor: '#fff',
	},
	navigation__item: {
		height: 50,
		width: 70,
		flexDirection: 'column',
		alignItems: 'center',
	},
	item__image: {
		width: 24,
		height: 24,
	},
	item__text: {
		fontFamily: 'SFpro',
		fontSize: 11,
		color: 'rgba(1, 20, 67, 0.3)',
	},
	item__avatar: {
		height: 24,
		width: 24,
		backgroundColor: '#d1d1d1',
		borderRadius: 100,
	},
	avatar__active: {
		borderWidth: 2,
		borderColor: '#3871FF',
	},
	text__active: {
		color: '#3871FF',
	},
});
