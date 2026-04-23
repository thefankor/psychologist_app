import { useParams, Link } from 'react-router';
import { ArrowLeft, Mail, Phone, Calendar, FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { mockClients, mockSessions, mockNotes } from '../data/mockData';

export default function ClientDetails() {
	const { id } = useParams();
	const client = mockClients.find((c) => c.id === id);
	const clientSessions = mockSessions.filter((s) => s.clientId === id);
	const clientNotes = mockNotes.filter((n) => n.clientId === id);

	if (!client) {
		return (
			<div className='p-8'>
				<p className='text-gray-500'>Клиент не найден</p>
			</div>
		);
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'inactive':
				return 'bg-gray-100 text-gray-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'active':
				return 'Активный';
			case 'inactive':
				return 'Неактивный';
			case 'completed':
				return 'Завершен';
			default:
				return status;
		}
	};

	const getSessionStatusColor = (status: string) => {
		switch (status) {
			case 'scheduled':
				return 'bg-blue-100 text-blue-800';
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const getSessionStatusText = (status: string) => {
		switch (status) {
			case 'scheduled':
				return 'Запланировано';
			case 'completed':
				return 'Завершено';
			case 'cancelled':
				return 'Отменено';
			default:
				return status;
		}
	};

	return (
		<div className='p-8'>
			<div className='mb-6'>
				<Link to='/clients'>
					<Button variant='ghost' className='mb-4'>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Назад к клиентам
					</Button>
				</Link>

				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-4'>
						<div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-2xl'>
							{client.name
								.split(' ')
								.map((n) => n[0])
								.join('')}
						</div>
						<div>
							<h1 className='text-3xl font-bold text-gray-900 dark:text-gray-200'>
								{client.name}
							</h1>
							<Badge
								className={`mt-2 ${getStatusColor(client.status)}`}
							>
								{getStatusText(client.status)}
							</Badge>
						</div>
					</div>
					<Button className='bg-blue-600 hover:bg-blue-700 dark:text-white'>
						Редактировать
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-6'>
						<div className='flex items-center gap-3 mb-2'>
							<Mail className='w-5 h-5 text-gray-400' />
							<span className='text-sm text-gray-500 dark:text-white'>
								Email
							</span>
						</div>
						<p className='text-gray-900 dark:text-gray-200'>
							{client.email}
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-6'>
						<div className='flex items-center gap-3 mb-2'>
							<Phone className='w-5 h-5 text-gray-400' />
							<span className='text-sm text-gray-500 dark:text-white'>
								Телефон
							</span>
						</div>
						<p className='text-gray-900 dark:text-gray-200'>
							{client.phone}
						</p>
					</CardContent>
				</Card>

				<Card className='dark:bg-gray-800 dark:border-gray-700'>
					<CardContent className='p-6'>
						<div className='flex items-center gap-3 mb-2'>
							<Calendar className='w-5 h-5 text-gray-400' />
							<span className='text-sm text-gray-500 dark:text-white'>
								Дата рождения
							</span>
						</div>
						<p className='text-gray-900 dark:text-gray-200'>
							{new Date(client.dateOfBirth).toLocaleDateString(
								'ru-RU',
							)}
						</p>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue='sessions' className='w-full'>
				<TabsList className='dark:bg-gray-800 dark:border-gray-700'>
					<TabsTrigger value='sessions'>
						Сессии ({clientSessions.length})
					</TabsTrigger>
					<TabsTrigger value='notes'>
						Заметки ({clientNotes.length})
					</TabsTrigger>
					<TabsTrigger value='info'>Информация</TabsTrigger>
				</TabsList>

				<TabsContent value='sessions' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader className='flex flex-row items-center justify-between'>
							<CardTitle>История сессий</CardTitle>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										size='sm'
										className='bg-blue-600 hover:bg-blue-700 dark:text-white'
									>
										<Plus className='w-4 h-4 mr-2' />
										Запланировать
									</Button>
								</DialogTrigger>
								<DialogContent className='dark:bg-gray-800 dark:border-gray-700'>
									<DialogHeader>
										<DialogTitle>Новая сессия</DialogTitle>
									</DialogHeader>
									<div className='space-y-4 mt-4'>
										<div>
											<Label htmlFor='session-date'>
												Дата
											</Label>
											<input
												type='date'
												id='session-date'
												className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2 cursor-pointer'
											/>
										</div>
										<div>
											<Label htmlFor='session-time'>
												Время
											</Label>
											<input
												type='time'
												id='session-time'
												className='w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2 cursor-pointer'
											/>
										</div>
										<Button className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'>
											Создать сессию
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{clientSessions.length > 0 ? (
									clientSessions.map((session) => (
										<div
											key={session.id}
											className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:dark:bg-gray-700 cursor-pointer'
										>
											<div className='flex items-start justify-between'>
												<div className='flex-1'>
													<div className='flex items-center gap-3 mb-2'>
														<span className='font-medium text-gray-900 dark:text-gray-200'>
															{new Date(
																session.date,
															).toLocaleDateString(
																'ru-RU',
																{
																	day: 'numeric',
																	month: 'long',
																	year: 'numeric',
																},
															)}
														</span>
														<span className='text-gray-500'>
															•
														</span>
														<span className='text-gray-600 dark:text-gray-200'>
															{session.time}
														</span>
														<Badge
															className={getSessionStatusColor(
																session.status,
															)}
														>
															{getSessionStatusText(
																session.status,
															)}
														</Badge>
													</div>
													{session.notes && (
														<p className='text-sm text-gray-600 mt-2 dark:text-gray-200'>
															{session.notes}
														</p>
													)}
												</div>
												<span className='text-sm text-gray-500 dark:text-gray-200'>
													{session.duration} мин
												</span>
											</div>
										</div>
									))
								) : (
									<p className='text-center text-gray-500 py-8'>
										Нет записей о сессиях
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='notes' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader className='flex flex-row items-center justify-between'>
							<CardTitle>Заметки и наблюдения</CardTitle>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										size='sm'
										className='bg-blue-600 hover:bg-blue-700 dark:text-white'
									>
										<Plus className='w-4 h-4 mr-2' />
										Добавить
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Новая заметка</DialogTitle>
									</DialogHeader>
									<div className='space-y-4 mt-4'>
										<div>
											<Label htmlFor='note'>
												Содержание
											</Label>
											<Textarea
												id='note'
												placeholder='Введите заметку...'
												rows={6}
											/>
										</div>
										<Button className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'>
											Сохранить заметку
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{clientNotes.length > 0 ? (
									clientNotes.map((note) => (
										<div
											key={note.id}
											className='p-4 border border-gray-200 rounded-lg bg-yellow-50'
										>
											<div className='flex items-start justify-between mb-2'>
												<div className='flex items-center gap-2'>
													<FileText className='w-4 h-4 text-gray-500' />
													<span className='text-sm text-gray-600'>
														{new Date(
															note.date,
														).toLocaleDateString(
															'ru-RU',
														)}
													</span>
												</div>
												{note.private && (
													<Badge
														variant='outline'
														className='text-xs'
													>
														Приватная
													</Badge>
												)}
											</div>
											<p className='text-gray-900'>
												{note.content}
											</p>
										</div>
									))
								) : (
									<p className='text-center text-gray-500 py-8'>
										Нет заметок
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='info' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader>
							<CardTitle>Общая информация</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<p className='text-sm text-gray-500 mb-1 dark:text-gray-200'>
										Первая сессия
									</p>
									<p className='text-gray-900 dark:text-white'>
										{new Date(
											client.firstSession,
										).toLocaleDateString('ru-RU')}
									</p>
								</div>
								<div>
									<p className='text-sm text-gray-500 mb-1 dark:text-gray-200'>
										Всего сессий
									</p>
									<p className='text-gray-900 dark:text-white'>
										{client.totalSessions}
									</p>
								</div>
							</div>
							<div>
								<p className='text-sm text-gray-500 mb-1 dark:text-gray-200'>
									Заметки терапевта
								</p>
								<p className='text-gray-900 dark:text-white'>
									{client.notes}
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
