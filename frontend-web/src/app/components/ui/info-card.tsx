import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Clock } from 'lucide-react';

type InfoCard = {
	title: string;
	value: number;
	icon: React.ReactNode;
	footer: string;
};

export const InfoCard = ({ title, value, icon, footer }: InfoCard) => {
	return (
		<Card className='dark:bg-gray-800 dark:border-gray-700'>
			<CardHeader className='flex flex-row items-center justify-between pb-2'>
				<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-200'>
					{title}
				</CardTitle>
				{icon}
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold text-gray-900 dark:text-white'>
					{value}
				</div>
				<p className='text-sm text-gray-500 mt-1 dark:text-gray-200'>
					{footer}
				</p>
			</CardContent>
		</Card>
	);
};
