import { Outlet, Link, useLocation } from 'react-router';
import {
	LayoutDashboard,
	Users,
	Calendar,
	Clock,
	MessageSquare,
	Wallet,
	LogOut,
	Moon,
	Sun,
} from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function Layout() {
	const location = useLocation();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isActive = (path: string) => {
		if (path === '/') {
			return location.pathname === '/';
		}
		return location.pathname.startsWith(path);
	};

	const toggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	return (
		<div className='flex h-screen bg-gray-50 dark:bg-gray-900'>
			<aside className='w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col'>
				<div className='p-6 border-b border-gray-200 dark:border-gray-700'>
					<h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
						PsyConsult
					</h1>
					<p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
						Рабочее пространство
					</p>
				</div>

				<nav className='flex-1 p-4 space-y-1'>
					<Link to='/'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<LayoutDashboard className='w-5 h-5 mr-3' />
							Дашборд
						</Button>
					</Link>

					<Link to='/clients'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/clients')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<Users className='w-5 h-5 mr-3' />
							Клиенты
						</Button>
					</Link>

					<Link to='/sessions'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/sessions')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<Calendar className='w-5 h-5 mr-3' />
							Расписание
						</Button>
					</Link>

					<Link to='/chats'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/chats')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<MessageSquare className='w-5 h-5 mr-3' />
							Сообщения
						</Button>
					</Link>

					<Link to='/finances'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/finances')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<Wallet className='w-5 h-5 mr-3' />
							Финансы
						</Button>
					</Link>

					<Link to='/working-hours'>
						<Button
							variant='ghost'
							className={`w-full justify-start cursor-pointer ${
								isActive('/working-hours')
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:dark:bg-blue-900/30'
									: 'text-gray-700 dark:text-gray-300 hover:dark:bg-blue-900/40'
							}`}
						>
							<Clock className='w-5 h-5 mr-3' />
							Рабочие часы
						</Button>
					</Link>
				</nav>

				<div className='p-4 border-t border-gray-200 dark:border-gray-700'>
					<div className='flex items-center mb-3 p-2'>
						<div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold'>
							ДС
						</div>
						<div className='ml-3'>
							<p className='text-sm font-medium text-gray-900 dark:text-white'>
								Др. Смирнов
							</p>
							<p className='text-xs text-gray-500 dark:text-gray-400'>
								Психолог
							</p>
						</div>
					</div>

					{mounted && (
						<Button
							variant='ghost'
							className='w-full justify-start text-gray-700 dark:text-gray-300 mb-2 cursor-pointer hover:dark:bg-blue-900/30'
							onClick={toggleTheme}
						>
							{theme === 'dark' ? (
								<>
									<Sun className='w-5 h-5 mr-3' />
									Светлая тема
								</>
							) : (
								<>
									<Moon className='w-5 h-5 mr-3' />
									Темная тема
								</>
							)}
						</Button>
					)}

					<Button
						variant='ghost'
						className='w-full justify-start text-gray-700 dark:text-gray-300 cursor-pointer hover:dark:bg-blue-900/30'
					>
						<LogOut className='w-5 h-5 mr-3' />
						Выход
					</Button>
				</div>
			</aside>

			{/* Main content */}
			<main className='flex-1 overflow-auto'>
				<Outlet />
			</main>
		</div>
	);
}
