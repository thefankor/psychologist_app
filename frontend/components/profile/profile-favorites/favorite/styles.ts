import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: {
		position: 'relative',
		width: '100%',
		height: 98,
		marginBottom: 12,
	},
	container: {
		width: '100%',
		height: 98,
		backgroundColor: '#fff',
		shadowColor: '#EDEDED',
		shadowOffset: { width: 4, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 16,
		elevation: 4,
		borderRadius: 24,
		paddingHorizontal: 16,
		alignItems: 'center',
		flexDirection: 'row',
	},
	container__content: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		flexDirection: 'row',
		flex: 1,
	},
	container__avatar: {
		height: 74,
		width: 74,
		borderWidth: 1,
		borderColor: '#E5E5E5',
		borderRadius: 37,
		backgroundColor: '#f0f0f0',
	},
	container__info: {
		marginLeft: 12,
		justifyContent: 'center',
		flex: 1,
		paddingRight: 8,
	},
	container__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
		color: '#000',
	},
	container__description: {
		fontSize: 14,
		fontFamily: 'Hezaedrus',
		color: UI.colors.mediumBlue,
		marginTop: 4,
	},
	deleteButton: {
		padding: 8,
		marginLeft: 'auto',
	},
	delete__image: {
		height: 24,
		width: 24,
		tintColor: '#FF4444',
	},
});
