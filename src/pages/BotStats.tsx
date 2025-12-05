import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalCards: number;
  totalPoints: number;
  recentActivity: {
    userId: number;
    username: string;
    action: string;
    timestamp: number;
  }[];
}

const BotStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/3f74c3d0-1cd6-4b2d-b8c1-d2480fdb67ac?stats=true');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <Icon name="Loader2" className="w-12 h-12 animate-spin mx-auto text-purple-600" />
          <p className="mt-4 text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="p-8 text-center">
          <Icon name="AlertCircle" className="w-12 h-12 mx-auto text-red-500" />
          <p className="mt-4 text-gray-600">Не удалось загрузить статистику</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 Статистика бота</h1>
          <p className="text-gray-600">Общая информация о активности пользователей</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Всего пользователей</p>
                <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
              </div>
              <Icon name="Users" className="w-12 h-12 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Всего карточек</p>
                <p className="text-4xl font-bold mt-2">{stats.totalCards}</p>
              </div>
              <Icon name="CreditCard" className="w-12 h-12 opacity-50" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">Всего очков</p>
                <p className="text-4xl font-bold mt-2">{stats.totalPoints.toLocaleString()}</p>
              </div>
              <Icon name="TrendingUp" className="w-12 h-12 opacity-50" />
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            <Icon name="Activity" className="inline w-6 h-6 mr-2" />
            Последняя активность
          </h2>
          
          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {activity.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{activity.username}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Icon name="Inbox" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Пока нет активности</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BotStats;