import json
import os
from typing import Dict, Any

user_stats: Dict[str, Any] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обработчик Telegram бота для игры КотоКоллекция
    Принимает вебхуки от Telegram и отправляет пользователю ссылку на Web App
    '''
    method: str = event.get('httpMethod', 'POST')
    query_params = event.get('queryStringParameters') or {}
    is_stats = query_params.get('stats') == 'true'
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET' and is_stats:
        recent_activity = sorted(
            [
                {
                    'userId': uid,
                    'username': data.get('username', f'User {uid}'),
                    'action': data.get('lastAction', 'Запустил бота'),
                    'timestamp': data.get('lastSeen', 0)
                }
                for uid, data in user_stats.items()
            ],
            key=lambda x: x['timestamp'],
            reverse=True
        )[:20]
        
        total_users = len(user_stats)
        total_cards = sum(data.get('cards', 0) for data in user_stats.values())
        total_points = sum(data.get('points', 0) for data in user_stats.values())
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'totalUsers': total_users,
                'totalCards': total_cards,
                'totalPoints': total_points,
                'recentActivity': recent_activity
            }),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Bot token not configured'}),
                'isBase64Encoded': False
            }
        
        try:
            body_data = json.loads(event.get('body', '{}'))
            
            if 'message' in body_data:
                message = body_data['message']
                chat_id = message['chat']['id']
                text = message.get('text', '')
                user = message.get('from', {})
                user_id = str(user.get('id', ''))
                username = user.get('username', user.get('first_name', f'User {user_id}'))
                
                if user_id:
                    import time
                    if user_id not in user_stats:
                        user_stats[user_id] = {
                            'username': username,
                            'cards': 0,
                            'points': 0,
                            'firstSeen': int(time.time() * 1000),
                            'lastSeen': int(time.time() * 1000),
                            'lastAction': 'Запустил бота'
                        }
                    else:
                        user_stats[user_id]['lastSeen'] = int(time.time() * 1000)
                        user_stats[user_id]['lastAction'] = text or 'Отправил сообщение'
                
                if text == '/start':
                    import urllib.request
                    
                    web_app_url = 'https://cat-card-balance-bot.poehali.dev'
                    
                    response_data = {
                        'chat_id': chat_id,
                        'text': '🐱 Добро пожаловать в КотоКоллекцию!\n\nСобирай редких котиков, зарабатывай очки и соревнуйся с друзьями!',
                        'reply_markup': {
                            'inline_keyboard': [[
                                {
                                    'text': '🎮 Играть',
                                    'web_app': {'url': web_app_url}
                                }
                            ]]
                        }
                    }
                    
                    api_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
                    req = urllib.request.Request(
                        api_url,
                        data=json.dumps(response_data).encode('utf-8'),
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    with urllib.request.urlopen(req) as response:
                        result = json.loads(response.read().decode('utf-8'))
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'ok': True}),
                        'isBase64Encoded': False
                    }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }