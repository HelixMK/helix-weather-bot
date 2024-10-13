import Bot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN as string, { polling: true });
const weatherApiKey = process.env.WEATHER_API_KEY;

type WeatherType = { temp: number; humidity: number; description: string }

async function getWeather(city: string): Promise<WeatherType | null> {
    try {
        const response = await axios.get<any>(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                units: 'metric',
                appid: weatherApiKey,
                lang: 'ru'
            }
        });

        const data = response.data;

        return {
            temp: data.main.temp,
            humidity: data.main.humidity,
            description: data.weather[0].description,
        };
    } catch (error: any) {
        console.error('Ошибка при получении данных о погоде:', error.message);
        if (error.response) {
            console.error('Данные ответа:', error.response.data);
        }
        return null;
    }
}

bot.onText(
    /\/start/,
    (msg) => bot.sendMessage(msg.chat.id, 'Напишите название города')
);

bot.on('message', async (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
        const city = msg.text;
        const weatherData = await getWeather(city);

        if (weatherData) {
            await bot.sendMessage(msg.chat.id, `Погода в городе ${city}:\nТемпература: ${weatherData.temp}°C\nВлажность: ${weatherData.humidity}%\nОписание: ${weatherData.description}`);
        } else {
            await bot.sendMessage(msg.chat.id, 'Не удалось получить данные о погоде.');
        }
    }
});

console.log('Бот запущен');
