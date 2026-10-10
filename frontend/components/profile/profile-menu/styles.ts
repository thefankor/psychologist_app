import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		height: 'auto',
		borderColor: 'rgba(1, 20, 67, 0.1)',
	},
	bottom: {
		borderBottomWidth: 0,
	},
	container__text: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		height: 44,
	},
	container__image: {
		height: 24,
		width: 24,
	},
	container__arrow: {
		height: 20,
		width: 20,
	},
	container__name: {
		fontFamily: 'Hezaedrus',
		marginLeft: 18,
		fontSize: 16,
	},
});
