import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythic' | 'legendary' | 'secret';

interface CatCard {
  id: string;
  name: string;
  rarity: Rarity;
  points: number;
  emoji: string;
  image: string;
}

const rarityConfig: Record<Rarity, { label: string; color: string; chance: number; pointsRange: [number, number]; images: string[] }> = {
  common: { 
    label: 'Обычный', 
    color: 'text-rare-common', 
    chance: 40, 
    pointsRange: [10, 30],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/6d3c8410-cb7b-4a36-8b43-45e379fe7cf4.jpg']
  },
  uncommon: { 
    label: 'Необычный', 
    color: 'text-rare-uncommon', 
    chance: 30, 
    pointsRange: [40, 70],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/9ca14f8a-45a7-49dc-aaa1-80cb48029344.jpg']
  },
  rare: { 
    label: 'Редкий', 
    color: 'text-rare-rare', 
    chance: 15, 
    pointsRange: [80, 120],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/2922e124-148e-4270-9800-b9fd96eb4697.jpg']
  },
  epic: { 
    label: 'Эпический', 
    color: 'text-rare-epic', 
    chance: 8, 
    pointsRange: [150, 250],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/3055f229-3e7b-439c-8617-8c04d5234088.jpg']
  },
  mythic: { 
    label: 'Мифический', 
    color: 'text-rare-mythic', 
    chance: 4, 
    pointsRange: [300, 500],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/7929b3de-ad48-4bb4-ada3-cd8a488cd24f.jpg']
  },
  legendary: { 
    label: 'Легендарный', 
    color: 'text-rare-legendary', 
    chance: 2, 
    pointsRange: [600, 1000],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/e6adc18c-4276-4b06-9c6a-d055dade6a40.jpg']
  },
  secret: { 
    label: 'Секретный', 
    color: 'text-rare-secret', 
    chance: 1, 
    pointsRange: [1500, 3000],
    images: ['https://cdn.poehali.dev/projects/467e657b-554e-4ad5-86e8-362c65a84e76/files/2997c914-ddac-4315-8e6b-22fb399142d5.jpg']
  },
};

const catEmojis = ['😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐱', '🐈', '🐈‍⬛'];

const catNames = [
  'Мурзик', 'Барсик', 'Пушок', 'Снежок', 'Васька', 'Кузя', 'Маркиз', 'Симба',
  'Персик', 'Том', 'Феликс', 'Гарфилд', 'Тигра', 'Лео', 'Рыжик', 'Макс',
  'Оскар', 'Чарли', 'Люцифер', 'Базилио', 'Матроскин', 'Багира'
];

const generateCat = (): CatCard => {
  const rand = Math.random() * 100;
  let cumulativeChance = 0;
  let selectedRarity: Rarity = 'common';

  for (const [rarity, config] of Object.entries(rarityConfig)) {
    cumulativeChance += config.chance;
    if (rand <= cumulativeChance) {
      selectedRarity = rarity as Rarity;
      break;
    }
  }

  const config = rarityConfig[selectedRarity];
  const points = Math.floor(Math.random() * (config.pointsRange[1] - config.pointsRange[0] + 1)) + config.pointsRange[0];
  const image = config.images[Math.floor(Math.random() * config.images.length)];

  return {
    id: Date.now().toString() + Math.random(),
    name: catNames[Math.floor(Math.random() * catNames.length)],
    rarity: selectedRarity,
    points,
    emoji: catEmojis[Math.floor(Math.random() * catEmojis.length)],
    image,
  };
};

const Index = () => {
  const [inventory, setInventory] = useState<CatCard[]>([]);
  const [balance, setBalance] = useState(0);
  const [currentCard, setCurrentCard] = useState<CatCard | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');
  const [cooldownEnd, setCooldownEnd] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('cooldownEnd');
    if (stored) {
      const endTime = parseInt(stored);
      if (endTime > Date.now()) {
        setCooldownEnd(endTime);
      }
    }
  }, []);

  useEffect(() => {
    if (cooldownEnd <= Date.now()) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const left = Math.max(0, cooldownEnd - Date.now());
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownEnd]);

  const handleGetCard = () => {
    if (timeLeft > 0) {
      toast.error('Слишком рано!', {
        description: `Подожди ещё ${formatTime(timeLeft)}`
      });
      return;
    }

    setIsRevealing(true);
    const newCat = generateCat();
    
    setTimeout(() => {
      setCurrentCard(newCat);
      setInventory(prev => [...prev, newCat]);
      setBalance(prev => prev + newCat.points);
      
      const rarityLabel = rarityConfig[newCat.rarity].label;
      toast.success(`Получен ${rarityLabel} котик! +${newCat.points} очков`, {
        description: `${newCat.emoji} ${newCat.name}`,
      });
      
      const endTime = Date.now() + 2 * 60 * 1000;
      setCooldownEnd(endTime);
      localStorage.setItem('cooldownEnd', endTime.toString());
      
      setIsRevealing(false);
    }, 1000);
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalCards = inventory.length;
  const rarityCounts = inventory.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {} as Record<Rarity, number>);

  const leaderboard = [
    { name: 'Вы', balance, rank: 1 },
    { name: 'КотоМан', balance: 15420, rank: 2 },
    { name: 'МяуМастер', balance: 12890, rank: 3 },
    { name: 'КотоЛюб', balance: 9340, rank: 4 },
    { name: 'ПушистыйКоллектор', balance: 7560, rank: 5 },
  ].sort((a, b) => b.balance - a.balance).map((player, index) => ({ ...player, rank: index + 1 }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/20 p-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center py-8 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🐱 КотоКоллекция
          </h1>
          <p className="text-muted-foreground text-lg">Собери всех котиков и стань легендой!</p>
        </header>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="home" className="gap-2">
              <Icon name="Home" size={18} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="balance" className="gap-2">
              <Icon name="Wallet" size={18} />
              <span className="hidden sm:inline">Баланс</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Icon name="Package" size={18} />
              <span className="hidden sm:inline">Инвентарь</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Icon name="Trophy" size={18} />
              <span className="hidden sm:inline">Рейтинг</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Icon name="User" size={18} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-8">
            <div className="flex flex-col items-center gap-6">
              <Card className="w-full max-w-md p-8 bg-card/50 backdrop-blur border-2 border-primary/20">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center mb-6 relative overflow-hidden">
                  {isRevealing ? (
                    <div className="text-8xl animate-pulse-glow">❓</div>
                  ) : currentCard ? (
                    <div className="w-full h-full animate-fade-in relative">
                      <img 
                        src={currentCard.image} 
                        alt={currentCard.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end pb-6 rounded-2xl">
                        <h3 className={`text-3xl font-bold mb-2 ${rarityConfig[currentCard.rarity].color} text-glow`}>
                          {currentCard.name}
                        </h3>
                        <Badge className={`text-lg px-4 py-1 ${rarityConfig[currentCard.rarity].color} card-glow mb-2`}>
                          {rarityConfig[currentCard.rarity].label}
                        </Badge>
                        <p className="text-4xl font-bold text-primary">+{currentCard.points}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Icon name="Sparkles" size={64} className="mx-auto mb-4 opacity-50" />
                      <p className="text-xl">Нажми кнопку<br />чтобы получить котика!</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleGetCard} 
                  disabled={isRevealing || timeLeft > 0}
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isRevealing ? (
                    <>
                      <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                      Открываем...
                    </>
                  ) : timeLeft > 0 ? (
                    <>
                      <Icon name="Timer" size={24} className="mr-2" />
                      {formatTime(timeLeft)}
                    </>
                  ) : (
                    <>
                      <Icon name="Gift" size={24} className="mr-2" />
                      Получить карточку
                    </>
                  )}
                </Button>
              </Card>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <Icon name="Coins" size={32} className="mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-primary">{balance}</p>
                  <p className="text-sm text-muted-foreground">Очков</p>
                </Card>
                <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                  <Icon name="Layers" size={32} className="mx-auto mb-2 text-secondary" />
                  <p className="text-3xl font-bold text-secondary">{totalCards}</p>
                  <p className="text-sm text-muted-foreground">Карточек</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="balance" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
              <div className="text-center mb-8">
                <Icon name="Wallet" size={64} className="mx-auto mb-4 text-primary" />
                <h2 className="text-6xl font-bold text-primary mb-2">{balance}</h2>
                <p className="text-xl text-muted-foreground">Всего очков</p>
              </div>
              
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">Карточек собрано</span>
                  <span className="font-bold text-xl">{totalCards}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">Средняя ценность</span>
                  <span className="font-bold text-xl">{totalCards > 0 ? Math.round(balance / totalCards) : 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                  <span className="text-muted-foreground">Лучшая карта</span>
                  <span className="font-bold text-xl">
                    {inventory.length > 0 ? Math.max(...inventory.map(c => c.points)) : 0}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-4">
              {Object.entries(rarityConfig).map(([rarity, config]) => {
                const count = rarityCounts[rarity as Rarity] || 0;
                return count > 0 ? (
                  <Card key={rarity} className="p-4 bg-card/50 backdrop-blur border-2" style={{ borderColor: `hsl(var(--rare-${rarity}))` }}>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${config.color} card-glow px-3 py-1`}>
                        {config.label} ({count})
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {inventory
                        .filter(card => card.rarity === rarity)
                        .map(card => (
                          <div key={card.id} className="aspect-square rounded-lg bg-background/50 overflow-hidden hover:scale-105 transition-transform relative group">
                            <img 
                              src={card.image} 
                              alt={card.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-2">
                              <p className="text-xs font-medium text-white text-center">{card.name}</p>
                              <p className={`text-xs font-bold ${config.color}`}>{card.points}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                ) : null;
              })}
              
              {inventory.length === 0 && (
                <Card className="p-12 text-center bg-card/30">
                  <Icon name="PackageOpen" size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-xl text-muted-foreground">Ваш инвентарь пуст</p>
                  <p className="text-sm text-muted-foreground mt-2">Получите первую карточку!</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Icon name="Trophy" size={28} className="text-primary" />
                Топ игроков
              </h2>
              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div 
                    key={player.name}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      player.name === 'Вы' 
                        ? 'bg-primary/20 border-2 border-primary' 
                        : 'bg-background/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        player.rank === 1 ? 'bg-rare-legendary text-white' :
                        player.rank === 2 ? 'bg-muted text-foreground' :
                        player.rank === 3 ? 'bg-accent/30 text-foreground' :
                        'bg-background text-muted-foreground'
                      }`}>
                        {player.rank}
                      </div>
                      <span className="font-semibold text-lg">{player.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{player.balance}</p>
                      <p className="text-xs text-muted-foreground">очков</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="p-8 bg-card/50 backdrop-blur">
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                  <Icon name="User" size={48} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Игрок</h2>
                <Badge className="text-sm">Коллекционер</Badge>
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <Icon name="Award" size={32} className="mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{balance}</p>
                    <p className="text-sm text-muted-foreground">Очков</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg text-center">
                    <Icon name="Layers" size={32} className="mx-auto mb-2 text-secondary" />
                    <p className="text-2xl font-bold">{totalCards}</p>
                    <p className="text-sm text-muted-foreground">Карточек</p>
                  </div>
                </div>

                <div className="p-6 bg-background/50 rounded-lg">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Icon name="BarChart" size={20} />
                    Статистика по редкости
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(rarityConfig).map(([rarity, config]) => {
                      const count = rarityCounts[rarity as Rarity] || 0;
                      return (
                        <div key={rarity} className="flex justify-between items-center">
                          <span className={`text-sm ${config.color}`}>{config.label}</span>
                          <span className="font-bold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <footer className="mt-12 pb-8 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Icon name="Code" size={18} />
            <span>Создано автором</span>
            <a 
              href="https://t.me/mrlaifon" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-bold text-primary hover:text-secondary transition-colors flex items-center gap-1"
            >
              Mrlaifon
              <Icon name="ExternalLink" size={16} />
            </a>
          </div>
          <a 
            href="https://t.me/mrlaifon" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 rounded-full transition-all border border-primary/30"
          >
            <Icon name="Send" size={20} />
            <span className="font-semibold">Подписаться на Telegram</span>
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Index;