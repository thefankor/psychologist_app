import { useState } from 'react';
import { Clock, Calendar, CheckCircle2, XCircle, Coffee } from 'lucide-react';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { mockWorkingHours } from '../data/mockData';
import { WorkingDay } from '../types';

export default function WorkingHours() {
	const [workingHours, setWorkingHours] = useState(mockWorkingHours);

	const getDayName = (day: string) => {
		const days: { [key: string]: string } = {
			monday: 'Понедельник',
			tuesday: 'Вторник',
			wednesday: 'Среда',
			thursday: 'Четверг',
			friday: 'Пятница',
			saturday: 'Суббота',
			sunday: 'Воскресенье',
		};
		return days[day] || day;
	};

	const getDayShort = (day: string) => {
		const days: { [key: string]: string } = {
			monday: 'ПН',
			tuesday: 'ВТ',
			wednesday: 'СР',
			thursday: 'ЧТ',
			friday: 'ПТ',
			saturday: 'СБ',
			sunday: 'ВС',
		};
		return days[day] || day;
	};

	const toggleWorkingDay = (dayIndex: number) => {
		const newSchedule = [...workingHours.schedule];
		newSchedule[dayIndex].isWorking = !newSchedule[dayIndex].isWorking;
		setWorkingHours({ ...workingHours, schedule: newSchedule });
	};

	const updateTime = (
		dayIndex: number,
		field: keyof WorkingDay,
		value: string,
	) => {
		const newSchedule = [...workingHours.schedule];
		(newSchedule[dayIndex] as any)[field] = value;
		setWorkingHours({ ...workingHours, schedule: newSchedule });
	};

	const calculateWorkingHours = (day: WorkingDay) => {
		if (!day.isWorking) return 0;
		const start = new Date(`2000-01-01T${day.startTime}`);
		const end = new Date(`2000-01-01T${day.endTime}`);
		let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

		if (day.breakStart && day.breakEnd) {
			const breakStart = new Date(`2000-01-01T${day.breakStart}`);
			const breakEnd = new Date(`2000-01-01T${day.breakEnd}`);
			const breakHours =
				(breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
			hours -= breakHours;
		}

		return hours;
	};

	const totalWeeklyHours = workingHours.schedule.reduce(
		(sum, day) => sum + calculateWorkingHours(day),
		0,
	);

	const workingDaysCount = workingHours.schedule.filter(
		(d) => d.isWorking,
	).length;

	return (
		<div className='p-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-gray-900'>
					Рабочее расписание
				</h1>
				<p className='text-gray-500 mt-1'>
					Настройте дни и часы работы
				</p>
			</div>

			{/* Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Рабочих дней
						</CardTitle>
						<Calendar className='w-4 h-4 text-gray-400' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900'>
							{workingDaysCount}
						</div>
						<p className='text-xs text-gray-500 mt-1 dark:text-gray-400'>
							в неделю
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Часов в неделю
						</CardTitle>
						<Clock className='w-4 h-4 text-gray-400' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900'>
							{totalWeeklyHours}
						</div>
						<p className='text-xs text-gray-500 mt-1 dark:text-gray-400'>
							рабочих часов
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium text-gray-600 dark:text-gray-400'>
							Среднее в день
						</CardTitle>
						<Clock className='w-4 h-4 text-gray-400' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900'>
							{workingDaysCount > 0
								? (totalWeeklyHours / workingDaysCount).toFixed(
										1,
									)
								: 0}
						</div>
						<p className='text-xs text-gray-500 mt-1 dark:text-gray-400'>
							часов
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Weekly Overview */}
			<Card className='mb-8 dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader>
					<CardTitle>Недельный обзор</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						Быстрый просмотр рабочих дней
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-7 gap-2'>
						{workingHours.schedule.map((day, index) => (
							<div
								key={day.day}
								className={`p-4 rounded-lg border-2 text-center transition-all ${
									day.isWorking
										? 'bg-blue-50 border-blue-300'
										: 'bg-gray-50 border-gray-200'
								}`}
							>
								<div className='font-semibold text-gray-900 mb-2'>
									{getDayShort(day.day)}
								</div>
								{day.isWorking ? (
									<>
										<CheckCircle2 className='w-6 h-6 text-green-600 mx-auto mb-1' />
										<div className='text-xs text-gray-600'>
											{day.startTime} - {day.endTime}
										</div>
										<div className='text-xs font-medium text-blue-600 mt-1'>
											{calculateWorkingHours(day)}ч
										</div>
									</>
								) : (
									<>
										<XCircle className='w-6 h-6 text-gray-400 mx-auto mb-1' />
										<div className='text-xs text-gray-400'>
											Выходной
										</div>
									</>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Detailed Schedule */}
			<Card className='dark:bg-gray-800 dark:border-gray-700'>
				<CardHeader>
					<CardTitle>Детальное расписание</CardTitle>
					<CardDescription className='dark:text-gray-400'>
						Настройте время работы для каждого дня недели
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='space-y-6'>
						{workingHours.schedule.map((day, index) => (
							<div
								key={day.day}
								className={`p-6 rounded-lg border-1 transition-all ${
									day.isWorking
										? 'dark:bg-gray-700 dark:border-gray-500'
										: 'dark:bg-gray-500 dark:border-gray-600'
								}`}
							>
								<div className='flex items-center justify-between mb-4'>
									<div className='flex items-center gap-4'>
										<h3 className='font-semibold text-gray-900 text-lg dark:text-gray-200'>
											{getDayName(day.day)}
										</h3>
										{day.isWorking && (
											<Badge className='bg-green-100 text-green-800'>
												Рабочий день
											</Badge>
										)}
									</div>
									<div className='flex items-center gap-3'>
										<Label
											htmlFor={`working-${day.day}`}
											className='text-sm dark:text-gray-200'
										>
											Рабочий день
										</Label>
										<Switch
											id={`working-${day.day}`}
											checked={day.isWorking}
											onCheckedChange={() =>
												toggleWorkingDay(index)
											}
										/>
									</div>
								</div>

								{day.isWorking && (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-4'>
											<div>
												<Label
													htmlFor={`start-${day.day}`}
													className='text-sm text-gray-600 dark:text-gray-400'
												>
													Начало работы
												</Label>
												<div className='flex items-center gap-2 mt-1'>
													<Clock className='w-4 h-4 text-gray-400' />
													<Input
														id={`start-${day.day}`}
														type='time'
														value={day.startTime}
														onChange={(e) =>
															updateTime(
																index,
																'startTime',
																e.target.value,
															)
														}
														className='flex-1'
													/>
												</div>
											</div>
											<div>
												<Label
													htmlFor={`end-${day.day}`}
													className='text-sm text-gray-600 dark:text-gray-400'
												>
													Окончание работы
												</Label>
												<div className='flex items-center gap-2 mt-1'>
													<Clock className='w-4 h-4 text-gray-400' />
													<Input
														id={`end-${day.day}`}
														type='time'
														value={day.endTime}
														onChange={(e) =>
															updateTime(
																index,
																'endTime',
																e.target.value,
															)
														}
														className='flex-1'
													/>
												</div>
											</div>
										</div>

										<div className='space-y-4'>
											<div>
												<Label
													htmlFor={`break-start-${day.day}`}
													className='text-sm text-gray-600 dark:text-gray-400'
												>
													Начало перерыва
												</Label>
												<div className='flex items-center gap-2 mt-1'>
													<Coffee className='w-4 h-4 text-gray-400' />
													<Input
														id={`break-start-${day.day}`}
														type='time'
														value={
															day.breakStart || ''
														}
														onChange={(e) =>
															updateTime(
																index,
																'breakStart',
																e.target.value,
															)
														}
														className='flex-1'
													/>
												</div>
											</div>
											<div>
												<Label
													htmlFor={`break-end-${day.day}`}
													className='text-sm text-gray-600 dark:text-gray-400'
												>
													Окончание перерыва
												</Label>
												<div className='flex items-center gap-2 mt-1'>
													<Coffee className='w-4 h-4 text-gray-400' />
													<Input
														id={`break-end-${day.day}`}
														type='time'
														value={
															day.breakEnd || ''
														}
														onChange={(e) =>
															updateTime(
																index,
																'breakEnd',
																e.target.value,
															)
														}
														className='flex-1'
													/>
												</div>
											</div>
										</div>

										<div className='md:col-span-2 pt-2 border-t'>
											<div className='flex items-center justify-between text-sm '>
												<span className='text-gray-600 dark:text-gray-400'>
													Рабочих часов в этот день:
												</span>
												<span className='font-semibold text-gray-900 dark:text-gray-400'>
													{calculateWorkingHours(day)}{' '}
													часов
												</span>
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					<div className='mt-6 pt-6 border-t flex justify-end gap-3'>
						<Button variant='outline'>Отменить</Button>
						<Button className='bg-blue-600 hover:bg-blue-700'>
							Сохранить расписание
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
