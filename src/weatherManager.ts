export enum WeatherType {
  Sunny = "晴天",
  Rainy = "雨天",
  Drought = "干旱",
  Stormy = "暴风雨",
  Harvest = "丰收日"
}

const RandomWeatherList = [
  { weather: WeatherType.Sunny, probability: 0.5 },
  { weather: WeatherType.Rainy, probability: 0.8 },
  { weather: WeatherType.Drought, probability: 0.85 },
  { weather: WeatherType.Stormy, probability: 0.95 },
  { weather: WeatherType.Harvest, probability: 1.0 },
]

export const WeatherEffects = {
  [WeatherType.Sunny]: 1.0, // 正常生长
  [WeatherType.Rainy]: 0.8, // 生长速度加快，时间缩短为原来的0.8
  [WeatherType.Drought]: 1.5, // 生长速度减慢，时间为原来的1.5
  [WeatherType.Stormy]: 2.5, // 生长速度减慢，时间为原来的2.5
  [WeatherType.Harvest]: 0.5 // 生长速度加快，时间缩短为原来的0.5
};

export class WeatherManager {
  private static instance: WeatherManager;
  private lastDate: string;
  private currentWeather: WeatherType;

  private constructor() {
    this.lastDate = new Date().toDateString();
    this.currentWeather = this.getRandomWeather();
  }

  public static getInstance(): WeatherManager {
    return WeatherManager.instance = WeatherManager.instance||new WeatherManager()
  }

  private getRandomWeather(): WeatherType {
    return RandomWeatherList.find((v) => v.probability>Math.random()).weather
  }

  public updateWeather() {
    const now = new Date().toDateString();
    if (now !== this.lastDate) {
      this.currentWeather = this.getRandomWeather();
      this.lastDate = now;
      console.log(`天气已更新为：${this.currentWeather}`); // 打印日志
    } else {
      console.log(`天气未更新，当前天气为：${this.currentWeather}`); // 打印日志
    }
  }

  public getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  public getWeatherInfo(): string {
    return `当前天气: ${this.currentWeather}`;
  }
}
