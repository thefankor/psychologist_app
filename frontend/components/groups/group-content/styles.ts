import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		paddingTop: 60,
		paddingLeft: 16,
		paddingRight: 16,
		backgroundColor: '#fff',
	},
	container__header: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: 58,
	},
	container__search: {
		width: '100%',
		height: 'auto',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	search__image: {
		height: 24,
		width: 24,
		position: 'absolute',
		left: 12,
	},

	search__input: {
		fontFamily: 'Hezaedrus',
		color: UI.colors.mediumBlue,
		paddingLeft: 46,
		borderWidth: 1,
		borderColor: UI.colors.lightBlue,
		borderRadius: 8,
		width: '75%',
		height: 44,
	},
	search__cancel: {
		width: 'auto',
		height: 'auto',
	},
	cancel__text: {
		fontFamily: 'Hezaedrus',
		color: UI.colors.pressableColor,
	},

	container__body: {
		width: '100%',
		height: '95%',
		borderWidth: 0,
	},
	container__btn: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		left: 0,
		borderWidth: 1.5,
		borderRadius: 100,
		borderColor: 'rgba(1, 20, 67, 0.1)',
	},
	container__info: {
		height: 44,
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'column',
	},
	container__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		color: UI.colors.defaultBlue,
	},
	container__subtitle: {
		fontFamily: 'Hezaedrus',
		color: UI.colors.mediumBlue,
	},
	container__image: {
		borderWidth: 1,
		height: 44,
		width: 44,
		borderRadius: 100,
	},
	back__image: {
		maxHeight: 24,
		maxWidth: 24,
	},
});
