import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { mockClients } from '../data/mockData';

export default function Clients() {
	const [searchQuery, setSearchQuery] = useState('');
	const [clients] = useState(mockClients);

	const filteredClients = clients.filter(
		(client) =>
			client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			client.email.toLowerCase().includes(searchQuery.toLowerCase()),
	);

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

	return (
		<div className='p-8'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						Клиенты
					</h1>
					<h5 className='text-gray-500 mt-1 dark:text-white'>
						Управление клиентской базой
					</h5>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button className='bg-blue-600 hover:bg-blue-700 dark:text-white'>
							<Plus className='w-4 h-4 mr-2' />
							Добавить клиента
						</Button>
					</DialogTrigger>
					<DialogContent className='dark:bg-gray-800 dark:border-gray-700'>
						<DialogHeader>
							<DialogTitle>Новый клиент</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 mt-4'>
							<div>
								<Label htmlFor='name'>Имя</Label>
								<Input
									id='name'
									placeholder='Введите имя клиента'
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='email'>Email</Label>
								<Input
									id='email'
									type='email'
									placeholder='email@example.com'
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='phone'>Телефон</Label>
								<Input
									id='phone'
									placeholder='+7 (999) 123-45-67'
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
							</div>
							<div>
								<Label htmlFor='dob'>Дата рождения</Label>
								<Input
									id='dob'
									type='date'
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
							</div>
							<Button className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'>
								Создать клиента
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className='mb-6'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 ' />
					<Input
						placeholder='Поиск по имени или email...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10 dark:bg-gray-800 dark:border-gray-700'
					/>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{filteredClients.map((client) => (
					<Card
						key={client.id}
						className='hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700'
					>
						<CardContent className='p-6'>
							<div className='flex items-start justify-between mb-4'>
								<div className='flex items-center gap-3'>
									<div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-lg '>
										{client.name
											.split(' ')
											.map((n) => n[0])
											.join('')}
									</div>
									<div>
										<h3 className='font-semibold text-gray-900 dark:text-gray-200'>
											{client.name}
										</h3>
										<Badge
											className={getStatusColor(
												client.status,
											)}
										>
											{getStatusText(client.status)}
										</Badge>
									</div>
								</div>
							</div>

							<div className='space-y-2 mb-4'>
								<div className='flex items-center text-sm text-gray-600 dark:text-gray-200'>
									<Mail className='w-4 h-4 mr-2' />
									{client.email}
								</div>
								<div className='flex items-center text-sm text-gray-600 dark:text-gray-200'>
									<Phone className='w-4 h-4 mr-2' />
									{client.phone}
								</div>
							</div>

							<div className='border-t pt-4 mb-4'>
								<div className='flex justify-between text-sm'>
									<span className='dark:text-gray-200'>
										Первая сессия:
									</span>
									<span className='font-medium text-gray-400'>
										{new Date(
											client.firstSession,
										).toLocaleDateString('ru-RU')}
									</span>
								</div>
								<div className='flex justify-between text-sm mt-2'>
									<span className='text-gray-500 dark:text-gray-200'>
										Всего сессий:
									</span>
									<span className='font-medium text-gray-400'>
										{client.totalSessions}
									</span>
								</div>
							</div>

							<Link to={`/clients/${client.id}`}>
								<Button
									className='w-full dark:bg-gray-600 dark:hover:bg-gray-700'
									variant='outline'
								>
									Открыть профиль
								</Button>
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredClients.length === 0 && (
				<div className='text-center py-12'>
					<p className='text-gray-500'>Клиенты не найдены</p>
				</div>
			)}
		</div>
	);
}
