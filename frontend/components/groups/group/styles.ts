import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	group: {
		width: '100%',
		flexDirection: 'row',
		display: 'flex',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: '#0114431A',
		paddingTop: 12,
		paddingBottom: 12,
	},
	group__image: {
		height: 60,
		width: 60,
		borderWidth: 1,
		borderRadius: 100,
	},
	group__info: {
		marginLeft: 13,
	},
	group__stats: {
		width: '35%',
		flexDirection: 'column',
		alignItems: 'flex-end',
		justifyContent: 'space-between',
		position: 'absolute',
		right: 0,
		height: '100%',
	},
	group__name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 14,

		includeFontPadding: false,
	},
	group__from: {
		fontSize: 14,
		marginTop: 5,
		fontFamily: 'Hezaedrus',
	},
	group__message: {
		fontSize: 14,
		includeFontPadding: false,
		fontFamily: 'Hezaedrus',
		marginTop: 5,
		color: UI.colors.secondGray,
	},
	group__time: {
		fontFamily: 'Hezaedrus',
		fontSize: 14,
		lineHeight: 14,
		includeFontPadding: false,
		color: UI.colors.secondGray,
	},
	group__messages: {
		fontFamily: 'Hezaedrus',
		width: 33,
		height: 26,
		alignItems: 'center',
		justifyContent: 'center',
		color: '#fff',
		backgroundColor: UI.colors.blue,
		borderRadius: 100,
	},
	messages: {
		color: '#fff',
		fontSize: 10,
		includeFontPadding: false,
		fontFamily: 'Hezaedrus',
	},
});
