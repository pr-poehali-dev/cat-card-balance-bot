import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Обработчик Telegram бота для игры КотоКоллекция
    Принимает вебхуки от Telegram и отправляет пользователю ссылку на Web App
    '''
    method: str = event.get('httpMethod', 'POST')
    
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
