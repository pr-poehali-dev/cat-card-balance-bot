import { useState } from 'react';
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
}

const rarityConfig: Record<Rarity, { label: string; color: string; chance: number; pointsRange: [number, number] }> = {
  common: { label: 'Обычный', color: 'text-rare-common', chance: 40, pointsRange: [10, 30] },
  uncommon: { label: 'Необычный', color: 'text-rare-uncommon', chance: 30, pointsRange: [40, 70] },
  rare: { label: 'Редкий', color: 'text-rare-rare', chance: 15, pointsRange: [80, 120] },
  epic: { label: 'Эпический', color: 'text-rare-epic', chance: 8, pointsRange: [150, 250] },
  mythic: { label: 'Мифический', color: 'text-rare-mythic', chance: 4, pointsRange: [300, 500] },
  legendary: { label: 'Легендарный', color: 'text-rare-legendary', chance: 2, pointsRange: [600, 1000] },
  secret: { label: 'Секретный', color: 'text-rare-secret', chance: 1, pointsRange: [1500, 3000] },
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

  return {
    id: Date.now().toString() + Math.random(),
    name: catNames[Math.floor(Math.random() * catNames.length)],
    rarity: selectedRarity,
    points,
    emoji: catEmojis[Math.floor(Math.random() * catEmojis.length)],
  };
};

const Index = () => {
  const [inventory, setInventory] = useState<CatCard[]>([]);
  const [balance, setBalance] = useState(0);
  const [currentCard, setCurrentCard] = useState<CatCard | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('home');

  const handleGetCard = () => {
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
      
      setIsRevealing(false);
    }, 1000);
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
                    <div className="text-center animate-fade-in">
                      <div className="text-9xl mb-4">{currentCard.emoji}</div>
                      <h3 className={`text-3xl font-bold mb-2 ${rarityConfig[currentCard.rarity].color} text-glow`}>
                        {currentCard.name}
                      </h3>
                      <Badge className={`text-lg px-4 py-1 ${rarityConfig[currentCard.rarity].color} card-glow`}>
                        {rarityConfig[currentCard.rarity].label}
                      </Badge>
                      <p className="text-4xl font-bold mt-4 text-primary">+{currentCard.points}</p>
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
                  disabled={isRevealing}
                  className="w-full h-16 text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all"
                >
                  {isRevealing ? (
                    <>
                      <Icon name="Loader2" size={24} className="mr-2 animate-spin" />
                      Открываем...
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
                          <div key={card.id} className="aspect-square rounded-lg bg-background/50 flex flex-col items-center justify-center p-2 hover:scale-105 transition-transform">
                            <div className="text-4xl mb-1">{card.emoji}</div>
                            <p className="text-xs font-medium truncate w-full text-center">{card.name}</p>
                            <p className={`text-xs font-bold ${config.color}`}>{card.points}</p>
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
      </div>
    </div>
  );
};

export default Index;
