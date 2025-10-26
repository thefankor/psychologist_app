import { StyleSheet } from 'react-native';

export const UI = {
	styles: StyleSheet.create({
		continueButton: {
			backgroundColor: '#3871FF',
			height: 50,
			width: '100%',
			borderRadius: 50,
			marginTop: 40,
			alignItems: 'center',
			justifyContent: 'center',
		},
		otherButton: {
			backgroundColor: 'transparent',
			width: '100%',
			height: 50,
			alignItems: 'center',
			justifyContent: 'center',
		},
		continueText: {
			color: '#fff',
			fontFamily: 'Hezaedrus500',
			fontSize: 14,
		},
		otherText: {
			fontFamily: 'Hezaedrus500',
			color: '#3871FF',
		},
		error__input: {
			borderWidth: 1,
			borderColor: 'red',
		},
	}),
	colors: {
		blue: '#3871FF',
		defaultWhite: '#F2F2F7',
		pressableColor: '#3565D9',
		defaultBlue: '#011443',
		descriptionGray: '#01144399',
		mediumBlue: '#0114434D',
		lightBlue: '#0114431A',
		transparentWhite: '#FFFFFF47',
		gray: '#B3B8C7',
		closer: '#3C3C434D',
		green: '#22D485',
		secondGray: '#00000061',
		lightBackground: '#F3F3F3',
		lightContainer: '#F5F6FB',
	},
};
