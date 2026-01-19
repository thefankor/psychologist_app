import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	form__block: {
		borderColor: '#0114431A',
		borderWidth: 1.5,
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		width: '100%',
		minHeight: 60,
		position: 'relative',
		padding: 0,
		borderRadius: 16,
		paddingLeft: 16,
		paddingRight: 16,
	},
	add__class: {
		padding: 16,
	},

	form__title: {
		fontFamily: 'Hezaedrus500',
		fontSize: 16,
		color: '#011443',
	},
	select__form: {
		padding: 0,
		minHeight: 50,
	},
	select__title: {
		marginLeft: 16,
		marginTop: 16,
	},
	select__checkbox: {
		marginTop: 16,
		marginRight: 16,
	},
	badges__wrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingRight: 15,
		gap: 8,
		marginTop: 20,
	},
	form__badge: {
		alignItems: 'center',
		minWidth: 60,
		height: 44,
		justifyContent: 'center',
		borderRadius: 10,
		paddingHorizontal: 8,
	},

	badge__text: {
		fontFamily: 'Hezaedrus',
		fontSize: 13,
		textAlign: 'center',
		lineHeight: 16,
	},

	emotion: {
		backgroundColor: '#F2E7FF',
		color: '#530086',
	},
	emotion__text: {
		color: '#530086',
	},
	relations: {
		backgroundColor: '#FAEEE8',
	},
	relations__text: {
		color: '#903400',
	},

	work: {
		backgroundColor: '#E9EEF9',
	},
	work__text: {
		color: '#00247C',
	},
	life: {
		backgroundColor: '#E4F2F4',
	},
	life__text: {
		color: '#004550',
	},
	personal: {
		backgroundColor: '#E1F6EB',
	},
	personal__text: {
		color: '#015B2E',
	},

	active: {
		borderWidth: 2,
		borderColor: '#3871FF',
	},
	choose__wrap: {
		width: '100%',
		display: 'flex',
	},
	choose: { width: '100%', display: 'flex', flexDirection: 'row' },
	plus: {
		backgroundColor: '#ABC3FE',
		height: 20,
		width: 20,
		color: '#3871FF',
		borderRadius: 100,
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
	},
	choose__text: {
		marginLeft: 8,
		color: '#3871FF',
	},
	form__description: {
		color: 'rgba(1, 20, 67, 0.6)',
		fontFamily: 'Hezaedrus',
		fontSize: 14,
		marginTop: 10,
	},
	form__other: {
		fontSize: 14,
		fontFamily: 'Hezaedrus',
		color: 'rgba(1, 20, 67, 0.3)',
		marginLeft: 17,
	},
	select__absolute: {
		borderWidth: 1,
		bottom: -10,
		borderRadius: 15,
		borderColor: 'red',
		position: 'absolute',
	},
	add__wrap: {
		marginTop: 16,
		flexDirection: 'row',
	},
	add__text: {
		fontFamily: 'Hezaedrus',
		color: '#3565D9',
		marginLeft: 10,
	},
	plus__image: {
		height: 10,
		width: 10,
	},
});
