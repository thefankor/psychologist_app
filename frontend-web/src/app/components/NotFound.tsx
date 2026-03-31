import { Link } from 'react-router';
import { Button } from './ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Home className="w-4 h-4 mr-2" />
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
