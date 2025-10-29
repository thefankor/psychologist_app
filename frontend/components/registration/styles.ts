import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
		backgroundColor: '#fff',
	},
	container__header: {
		width: '100%',
		display: 'flex',
		height: 44,
		position: 'absolute',
		top: 60,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	header__title: {
		color: '#011443',
		fontFamily: 'Hezaedrus500',
		fontSize: 18,
		fontWeight: 'medium',
		marginLeft: 30,
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
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		marginTop: -50,
	},
	container__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 20,
		marginBottom: 30,
	},
	inputs__wrap: {
		width: '100%',
	},
	input__wrap: {
		display: 'flex',
		position: 'relative',
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 12,
		paddingHorizontal: 16,
		color: '#011443',
		fontFamily: 'Hezaedrus',
		fontSize: 16,
		marginBottom: 16,
		justifyContent: 'center',
	},
	input__name: {
		position: 'absolute',
		top: -8,
		left: 12,
		fontSize: 12,
		color: '#0114434D',
		backgroundColor: '#fff',
		paddingHorizontal: 4,
	},
	active: {
		borderWidth: 1,
		borderColor: UI.colors.blue,
	},
});
