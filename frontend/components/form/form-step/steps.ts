import { FormSteps } from '@/types/types';

export interface Step {
	name: string;
	label: string[];
	questions: string[];
	label_description?: string[];
	sublabels?: string[];
	label_subtitle?: string[];
	config?: FormSteps;
}

export const steps: Step[] = [
	{
		name: 'Выберите формат сессии',
		questions: ['Индивидуальные', 'Семейные', 'Групповые'],
		label: ['personal', 'family', 'group'],
		config: 2,
	},
	{
		name: 'Обращались ли вы к психологу или к психотерапевту ранее?',
		questions: [
			'Нет, ищу первый раз',
			'Да, были 1-2 сессии',
			'Да, была длительная терапия',
		],
		label: ['first', 'some', 'long'],
		config: 3,
	},
	{
		name: 'Какую сумму вам комфортно платить за сессию?',
		questions: ['1500 ₽', '3500 ₽', '6000 ₽'],
		label_description: [
			'Опыт от 3 лет. Прошли личное собеседование. Подтвердили образование. Представили рекомендации',
			'Опыт от 3 лет. Прошли личное собеседование. Подтвердили образование. Представили рекомендации',
			'Опыт от 3 лет. Прошли личное собеседование. Подтвердили образование. Представили рекомендации',
		],
		label_subtitle: ['120 психологов', '120 психологов', '120 психологов'],
		label: ['small', 'medium', 'large'],
		config: 4,
	},
	{
		name: 'Важен ли вам пол терапевта?',
		questions: ['Нет, неважно', 'Мужской', 'Женский'],
		label: ['not_stated', 'male', 'female'],
		config: 5,
	},
	{
		name: 'В какое время вам удобно подключаться к сессии',
		questions: ['Любое', 'Ближайшее', 'Конкретное'],
		label: ['any', 'closest', 'fixed'],
		config: 6,
	},
	{
		name: 'Выберите под ходящий метод психотерапии',
		questions: ['Доверяю вашему опыту', 'Выбрать метод'],
		label: ['exp', 'method'],
		config: 7,
	},
];
