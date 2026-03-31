import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, Calendar, Clock, MessageSquare, LogOut } from 'lucide-react';
import { Button } from './ui/button';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">PsyConsult</h1>
          <p className="text-sm text-gray-500 mt-1">Рабочее пространство</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link to="/">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/') ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Дашборд
            </Button>
          </Link>

          <Link to="/clients">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/clients') ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Users className="w-5 h-5 mr-3" />
              Клиенты
            </Button>
          </Link>

          <Link to="/sessions">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/sessions') ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Расписание
            </Button>
          </Link>

          <Link to="/chats">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/chats') ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Сообщения
            </Button>
          </Link>

          <Link to="/working-hours">
            <Button
              variant="ghost"
              className={`w-full justify-start ${
                isActive('/working-hours') ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Clock className="w-5 h-5 mr-3" />
              Рабочие часы
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3 p-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
              ДС
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Др. Смирнов</p>
              <p className="text-xs text-gray-500">Психолог</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-gray-700">
            <LogOut className="w-5 h-5 mr-3" />
            Выход
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}