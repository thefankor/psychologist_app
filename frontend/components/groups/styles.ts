import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 70,
		backgroundColor: '#F8F9FD',
	},
	container__header: {
		width: '100%',
		height: 'auto',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		flexDirection: 'row',
	},

	container__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 28,
		lineHeight: 28,
		includeFontPadding: false,
		color: UI.colors.defaultBlue,
	},
	input__wrap: {
		width: '100%',
		display: 'flex',
		height: 40,
		alignItems: 'center',
		flexDirection: 'row',
		position: 'relative',
		marginTop: 24,
	},
	container__search: {
		position: 'absolute',
		height: 24,
		width: 24,
		left: 12,
	},

	container__input: {
		width: '100%',
		height: 40,
		borderWidth: 1,
		borderColor: UI.colors.lightBlue,
		paddingLeft: 46,
		borderRadius: 12,
		fontFamily: 'Hezaedrus',
		color: UI.colors.mediumBlue,
	},
	container__ad: {
		width: '100%',
		height: 110,
		marginTop: 12,
		backgroundColor: UI.colors.blue,
		borderRadius: 12,
		overflow: 'hidden',
		padding: 14,
		flexDirection: 'row',
	},
	ad__image: {
		position: 'absolute',
		height: 110,
		width: 189,
		right: 0,
	},
	ad__text: {
		width: 'auto',
	},
	ad__close: {
		position: 'absolute',
		right: 14,
		zIndex: 3,
		alignItems: 'center',
		justifyContent: 'center',
		height: 24,
		width: 24,
		borderRadius: 100,
		top: 14,
		backgroundColor: '#fff',
	},

	ad__title: {
		color: '#fff',
		fontFamily: 'Hezaedrus',
		fontSize: 12,
		zIndex: 3,
	},
	ad__subtitle: {
		color: '#fff',
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
		zIndex: 3,
	},
	groups: {
		marginTop: 16,
		width: '100%',
		height: 100,
	},
	noChatsContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingTop: 80,
	},
	noChatsText: {
		fontFamily: 'Hezaedrus',
		fontSize: 16,
		color: 'rgba(1, 20, 67, 0.5)',
	},
});
