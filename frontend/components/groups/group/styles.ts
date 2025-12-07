import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	group: {
		width: '100%',
		flexDirection: 'row',
		paddingTop: 12,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderColor: '#0114431A',
		alignItems: 'flex-start',
	},
	group__image: {
		height: 60,
		width: 60,
		borderWidth: 1,
		borderRadius: 100,
		marginRight: 13,
	},
	group__info: {
		flex: 1,
		justifyContent: 'flex-start',
		maxWidth: '75%',
	},
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5,
	},
	group__name: {
		fontFamily: 'Hezaedrus500',
		fontSize: 14,
		includeFontPadding: false,
		flexShrink: 1,
		marginRight: 8,
	},
	group__from: {
		fontSize: 14,
		marginTop: 2,
		fontFamily: 'Hezaedrus',
		color: UI.colors.secondGray,
	},
	group__message: {
		fontSize: 14,
		fontFamily: 'Hezaedrus',
		marginTop: 5,
		color: UI.colors.secondGray,
		lineHeight: 18,
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
		backgroundColor: UI.colors.blue,
		borderRadius: 100,
		alignSelf: 'flex-start',
		marginTop: 4,
	},
	messages: {
		color: '#fff',
		fontSize: 10,
		includeFontPadding: false,
		fontFamily: 'Hezaedrus',
	},
});
