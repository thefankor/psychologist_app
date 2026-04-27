import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import ClientDetails from './components/ClientDetails';
import Sessions from './components/Sessions';
import WorkingHours from './components/WorkingHours';
import Chats from './components/Chats';
import Finances from './components/Finances';
import NotFound from './components/NotFound';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Psychologists from './components/Psychologists';
import Favorites from './components/Favorites';

export const router = createBrowserRouter([
	{
		path: '/',
		Component: ProtectedRoute,
		children: [
			{
				Component: Layout,
				children: [
					{ index: true, Component: Dashboard },
					{ path: 'clients', Component: Clients },
					{ path: 'clients/:id', Component: ClientDetails },
					{ path: 'psychologists', Component: Psychologists },
					{ path: 'favorites', Component: Favorites },
					{ path: 'sessions', Component: Sessions },
					{ path: 'working-hours', Component: WorkingHours },
					{ path: 'chats', Component: Chats },
					{ path: 'finances', Component: Finances },
					{ path: 'profile', Component: Profile },
					{ path: '*', Component: NotFound },
				],
			},
		],
	},
	{
		path: '/auth',
		Component: Auth,
	},
]);
