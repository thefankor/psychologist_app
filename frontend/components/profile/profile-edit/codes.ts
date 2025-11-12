import { PhoneCodes } from '@/types/types';
import { ImageProps } from 'react-native';

interface Code {
	label: PhoneCodes;
	image: ImageProps;
}

export const codes: Code[] = [
	{
		label: PhoneCodes.RU,
		image: require('@/assets/images/ru.png'),
	},
];
