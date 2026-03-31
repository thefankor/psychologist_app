import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockSessions, mockClients } from '../data/mockData';
import { Link } from 'react-router';

export default function Sessions() {
  const [sessions] = useState(mockSessions);

  const upcomingSessions = sessions
    .filter((s) => s.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedSessions = sessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getSessionTypeText = (type: string) => {
    switch (type) {
      case 'initial':
        return 'Первичная';
      case 'regular':
        return 'Регулярная';
      case 'final':
        return 'Заключительная';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const renderSessionCard = (session: any) => {
    const client = mockClients.find((c) => c.id === session.clientId);
    return (
      <Card key={session.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                {session.clientName.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{session.clientName}</h3>
                <p className="text-sm text-gray-500">{getSessionTypeText(session.type)}</p>
              </div>
            </div>
            <Badge className={getStatusColor(session.status)}>
              {getStatusText(session.status)}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {new Date(session.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {session.time} ({session.duration} минут)
            </div>
          </div>

          {session.notes && (
            <div className="p-3 bg-gray-50 rounded-md mb-4">
              <p className="text-sm text-gray-700">{session.notes}</p>
            </div>
          )}

          <div className="flex gap-2">
            {client && (
              <Link to={`/clients/${client.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <User className="w-4 h-4 mr-2" />
                  Профиль клиента
                </Button>
              </Link>
            )}
            {session.status === 'scheduled' && (
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                Начать сессию
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Расписание</h1>
          <p className="text-gray-500 mt-1">Управление консультациями</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Новая сессия
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Запланировать сессию</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="client">Клиент</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите клиента" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockClients
                      .filter((c) => c.status === 'active')
                      .map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="session-date">Дата</Label>
                <input
                  type="date"
                  id="session-date"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="session-time">Время</Label>
                <input
                  type="time"
                  id="session-time"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <Label htmlFor="session-type">Тип сессии</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Первичная консультация</SelectItem>
                    <SelectItem value="regular">Регулярная сессия</SelectItem>
                    <SelectItem value="final">Заключительная сессия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Создать сессию
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">
            Предстоящие ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Завершенные ({completedSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map(renderSessionCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Нет запланированных сессий</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedSessions.length > 0 ? (
              completedSessions.map(renderSessionCard)
            ) : (
              <div className="col-span-full text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Нет завершенных сессий</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
