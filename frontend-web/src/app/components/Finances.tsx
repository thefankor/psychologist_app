import { useState } from 'react';
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	Wallet,
	Plus,
	Download,
	ArrowUpRight,
	ArrowDownRight,
} from 'lucide-react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import {
	finacesCards,
	mockBalance,
	mockTransactions,
	mockWithdrawals,
} from '../data/mockData';
import { InfoCard } from './ui/info-card';

export default function Finances() {
	const [balance] = useState(mockBalance);
	const [transactions] = useState(mockTransactions);
	const [withdrawals] = useState(mockWithdrawals);

	const thisMonthIncome = transactions
		.filter((t) => {
			const date = new Date(t.date);
			const now = new Date();
			return (
				t.type === 'income' &&
				t.status === 'completed' &&
				date.getMonth() === now.getMonth() &&
				date.getFullYear() === now.getFullYear()
			);
		})
		.reduce((sum, t) => sum + t.amount, 0);

	const lastMonthIncome = transactions
		.filter((t) => {
			const date = new Date(t.date);
			const now = new Date();
			const lastMonth = new Date(
				now.getFullYear(),
				now.getMonth() - 1,
				1,
			);
			return (
				t.type === 'income' &&
				t.status === 'completed' &&
				date.getMonth() === lastMonth.getMonth() &&
				date.getFullYear() === lastMonth.getFullYear()
			);
		})
		.reduce((sum, t) => sum + t.amount, 0);

	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
			case 'approved':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'cancelled':
			case 'rejected':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case 'completed':
				return 'Завершено';
			case 'pending':
				return 'Ожидает';
			case 'approved':
				return 'Одобрено';
			case 'cancelled':
				return 'Отменено';
			case 'rejected':
				return 'Отклонено';
			default:
				return status;
		}
	};

	const getMethodText = (method: string) => {
		switch (method) {
			case 'card':
				return 'Банковская карта';
			case 'bank':
				return 'Банковский перевод';
			case 'paypal':
				return 'PayPal';
			default:
				return method;
		}
	};

	return (
		<div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-screen'>
			<div className='mb-8 flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
						Финансы
					</h1>
					<h5 className='text-gray-500 mt-1  dark:text-white'>
						Управление доходами и выводом средств
					</h5>
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button className='bg-blue-600 hover:bg-blue-700 dark:text-white'>
							<Download className='w-4 h-4 mr-2' />
							Вывести средства
						</Button>
					</DialogTrigger>
					<DialogContent className='dark:bg-gray-800'>
						<DialogHeader>
							<DialogTitle className='dark:text-white'>
								Заявка на вывод средств
							</DialogTitle>
						</DialogHeader>
						<div className='space-y-4 mt-4'>
							<div>
								<Label
									htmlFor='amount'
									className='dark:text-gray-300'
								>
									Сумма вывода
								</Label>
								<Input
									id='amount'
									type='number'
									placeholder='Введите сумму'
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
								<p className='text-xs text-gray-500 dark:text-gray-200 mt-1'>
									Доступно для вывода:{' '}
									{formatMoney(balance.available)}
								</p>
							</div>
							<div>
								<Label
									htmlFor='method'
									className='dark:text-gray-300'
								>
									Способ вывода
								</Label>
								<Select>
									<SelectTrigger className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'>
										<SelectValue placeholder='Выберите способ' />
									</SelectTrigger>
									<SelectContent className='dark:bg-gray-700'>
										<SelectItem value='card'>
											Банковская карта
										</SelectItem>
										<SelectItem value='bank'>
											Банковский перевод
										</SelectItem>
										<SelectItem value='paypal'>
											PayPal
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label
									htmlFor='notes'
									className='dark:text-gray-300'
								>
									Примечание (опционально)
								</Label>
								<Textarea
									id='notes'
									placeholder='Дополнительная информация...'
									rows={3}
									className='dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2'
								/>
							</div>
							<Button className='w-full bg-blue-600 hover:bg-blue-700 dark:text-white'>
								Создать заявку
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
				{finacesCards.map((card) => (
					<InfoCard
						key={card.title}
						title={card.title}
						value={card.value}
						icon={card.icon}
						footer={card.footer}
					/>
				))}
			</div>

			<Tabs defaultValue='transactions' className='w-full'>
				<TabsList className='dark:bg-gray-800'>
					<TabsTrigger
						value='transactions'
						className='dark:data-[state=active]:bg-gray-700'
					>
						Транзакции
					</TabsTrigger>
					<TabsTrigger
						value='withdrawals'
						className='dark:data-[state=active]:bg-gray-700'
					>
						Заявки на вывод (
						{
							withdrawals.filter(
								(w) =>
									w.status === 'pending' ||
									w.status === 'approved',
							).length
						}
						)
					</TabsTrigger>
				</TabsList>

				<TabsContent value='transactions' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader>
							<CardTitle className='dark:text-white'>
								История транзакций
							</CardTitle>
							<CardDescription className='dark:text-gray-200'>
								Все доходы и выводы средств
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								{transactions.map((transaction) => (
									<div
										key={transaction.id}
										className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
									>
										<div className='flex items-center gap-4'>
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${
													transaction.type ===
													'income'
														? 'bg-green-100 dark:bg-green-900/30'
														: 'bg-red-100 dark:bg-red-900/30'
												}`}
											>
												{transaction.type ===
												'income' ? (
													<ArrowDownRight className='w-5 h-5 text-green-600 dark:text-green-400' />
												) : (
													<ArrowUpRight className='w-5 h-5 text-red-600 dark:text-red-400' />
												)}
											</div>
											<div>
												<p className='font-medium text-gray-900 dark:text-white'>
													{transaction.description}
												</p>
												{transaction.clientName && (
													<p className='text-sm text-gray-500 dark:text-gray-200'>
														{transaction.clientName}
													</p>
												)}
												<p className='text-xs text-gray-400 dark:text-gray-200'>
													{new Date(
														transaction.date,
													).toLocaleString('ru-RU', {
														day: 'numeric',
														month: 'long',
														year: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</p>
											</div>
										</div>
										<div className='text-right'>
											<p
												className={`text-lg font-semibold ${
													transaction.type ===
													'income'
														? 'text-green-600 dark:text-green-400'
														: 'text-red-600 dark:text-red-400'
												}`}
											>
												{transaction.type === 'income'
													? '+'
													: ''}
												{formatMoney(
													transaction.amount,
												)}
											</p>
											<Badge
												className={getStatusColor(
													transaction.status,
												)}
											>
												{getStatusText(
													transaction.status,
												)}
											</Badge>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value='withdrawals' className='mt-6'>
					<Card className='dark:bg-gray-800 dark:border-gray-700'>
						<CardHeader>
							<CardTitle className='dark:text-white'>
								Заявки на вывод средств
							</CardTitle>
							<CardDescription className='dark:text-gray-200'>
								История и статус заявок
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								{withdrawals.length > 0 ? (
									withdrawals.map((withdrawal) => (
										<div
											key={withdrawal.id}
											className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors'
										>
											<div className='flex items-start justify-between mb-3'>
												<div>
													<div className='flex items-center gap-2 mb-1'>
														<p className='font-semibold text-gray-900 dark:text-white text-lg'>
															{formatMoney(
																withdrawal.amount,
															)}
														</p>
														<Badge
															className={getStatusColor(
																withdrawal.status,
															)}
														>
															{getStatusText(
																withdrawal.status,
															)}
														</Badge>
													</div>
													<p className='text-sm text-gray-600 dark:text-gray-200'>
														{getMethodText(
															withdrawal.method,
														)}
													</p>
												</div>
												<Download className='w-5 h-5 text-gray-400 dark:text-gray-500' />
											</div>

											<div className='space-y-1 text-sm'>
												<div className='flex justify-between'>
													<span className='text-gray-500 dark:text-gray-200'>
														Дата заявки:
													</span>
													<span className='text-gray-900 dark:text-white'>
														{new Date(
															withdrawal.requestDate,
														).toLocaleString(
															'ru-RU',
															{
																day: 'numeric',
																month: 'long',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit',
															},
														)}
													</span>
												</div>
												{withdrawal.completedDate && (
													<div className='flex justify-between'>
														<span className='text-gray-500 dark:text-gray-200'>
															Дата завершения:
														</span>
														<span className='text-gray-900 dark:text-white'>
															{new Date(
																withdrawal.completedDate,
															).toLocaleString(
																'ru-RU',
																{
																	day: 'numeric',
																	month: 'long',
																	year: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
																},
															)}
														</span>
													</div>
												)}
												{withdrawal.notes && (
													<p className='text-gray-600 dark:text-gray-200 mt-2 pt-2 border-t dark:border-gray-700'>
														{withdrawal.notes}
													</p>
												)}
											</div>
										</div>
									))
								) : (
									<p className='text-center text-gray-500 dark:text-gray-200 py-8'>
										Нет заявок на вывод
									</p>
								)}
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
