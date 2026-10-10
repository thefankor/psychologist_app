import { UI } from '@/types/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 10,
	},
	container__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 20,
		fontWeight: 'medium',
	},
	inputs__wrap: {
		width: '100%',
		height: 'auto',
	},
	input__wrap: {
		display: 'flex',
		position: 'relative',
	},
	input: {
		marginTop: 20,
		height: 50,
		borderWidth: 1,
		borderColor: '#0114431A',
		borderRadius: 12,
		paddingLeft: 10,
		color: '#011443',
		fontFamily: 'Hezaedrus',
		fontSize: 14,
	},
	input__name: {
		position: 'absolute',
		top: 25,
		left: 12,
		fontSize: 12,
		color: '#0114434D',
	},
	select__container: {
		marginTop: 10,
	},
	active: {
		borderColor: UI.colors.blue,
	},
});
