import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
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
		height: 44,
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
	back__image: {
		maxHeight: 24,
		maxWidth: 24,
	},
	container__image: {
		height: 100,
		width: 100,
		borderWidth: 1,
		borderRadius: 100,
		marginTop: 24,
	},
	container__name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 20,
		marginTop: 13,
	},
	container__subtitle: {
		marginTop: 4,
		fontFamily: 'Hezaedrus',
		color: UI.colors.mediumBlue,
	},
	container__actions: {
		height: 63,
		width: '100%',
		marginTop: 29,
		gap: 8,
		display: 'flex',
		flexDirection: 'row',
	},
	container__info: {
		width: '100%',
		minHeight: 128,
		marginTop: 29,
		backgroundColor: UI.colors.lightContainer,
		boxShadow: '0px 0px 12px 0px #E2E2E240',
		borderRadius: 12,
		padding: 16,
	},
	info__name: {
		color: UI.colors.defaultBlue,
		fontFamily: 'Hezaedrus',
	},
	info__description: {
		marginTop: 4,
		fontFamily: 'Hezaedrus',
		color: UI.colors.descriptionGray,
	},
	info__view: {
		marginTop: 12,
	},
	view__title: {
		color: UI.colors.pressableColor,
		fontFamily: 'Hezaedrus500',
	},
});
