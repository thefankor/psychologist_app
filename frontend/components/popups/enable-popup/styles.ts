import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		display: 'flex',
		position: 'relative',
	},
	container__modal: {
		width: 250,
		backgroundColor: '#fff',
		position: 'absolute',
		borderRadius: 16,
		right: 16,
		zIndex: 5,
		boxShadow: '0px 0px 32px 0px #00000033',
		overflow: 'hidden',
	},
	container__press: {
		height: 43,
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingLeft: 16,
		paddingRight: 16,
	},
	container__text: {
		fontFamily: 'Hezaedrus',
		fontSize: 16,
	},
	container__image: {
		height: 24,
		width: 24,
	},
	container__time: {},
});
