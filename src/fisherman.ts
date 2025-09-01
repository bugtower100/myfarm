import { FarmManager } from "./farmManager";
import { FISH_TYPES } from "./shopKeeper";
import { WeatherManager, WeatherType } from "./weatherManager";

export abstract class Fisherman extends FarmManager {
  fishPond: number = 0;
  lastFishPondRefresh: string = "";
  wormCatchCount: number = 0;

  // 钓鱼功能
  fish(): string {
    this.refreshFishPond();

    if (this.fishPond <= 0) return "鱼塘中的鱼已经没有了，明天再来吧~";
    if (!this.warehouse["鱼饵"]) return "你还没有鱼饵呢！先去商店买点啦~";

    this.warehouse["鱼饵"]--;
    if (this.warehouse["鱼饵"] === 0) delete this.warehouse["鱼饵"];

    const successRate = 0.55;
    if (Math.random() >= successRate) {
      this.fishPond -= 0.5;
      this.saveData();
      return "哎哇！鱼跑了...";
    }

    const fishType = this.getRandomFishByLevel();
    const fishLength = this.generateFishLength();

    this.warehouse[fishType] = (this.warehouse[fishType] || 0) + 1;
    this.fishPond--;
    this.saveData();

    return `等待...等待...成功钓到一条长度为${fishLength}尺的${fishType}！`;
  }

  // 根据等级获取随机鱼类
  private getRandomFishByLevel(): string {
    const levelFishMap = {
      4: FISH_TYPES.slice(0, 5),
      5: FISH_TYPES.slice(0, 12),
      6: FISH_TYPES.slice(0, 18),
      7: FISH_TYPES.slice(0, 25),
      default: FISH_TYPES
    };

    const availableFish = levelFishMap[this.level] || levelFishMap.default;
    return availableFish[Math.floor(Math.random() * availableFish.length)];
  }

  // 生成鱼的长度
  private generateFishLength(): number {
    const rand = Math.random();
    let length: number;

    if (rand < 0.7) length = Math.random() * 1 + 2; // 2-3尺
    else if (rand < 0.8) length = Math.random() * 1 + 1; // 1-2尺  
    else if (rand < 0.9) length = Math.random() * 1 + 3; // 3-4尺
    else if (rand < 0.95) length = Math.random() * 1 + 5; // 5-6尺
    else length = Math.random() * 1; // 0-1尺

    return parseFloat(length.toFixed(1));
  }

  // 刷新鱼塘
  private refreshFishPond(): void {
    const today = new Date().toDateString();
    if (this.lastFishPondRefresh !== today) {
      this.fishPond = Math.floor(Math.random() * 11) + 15; // 15-25条鱼
      this.lastFishPondRefresh = today;
      this.saveData();
    }
  }

  // 捉蚯蚓
  catchWorms(): string {
    if (this.level < 4) return "你的等级不够哦！再等等再来吧！";

    const isRainy = WeatherManager.getInstance().getCurrentWeather() === WeatherType.Rainy;
    if (!isRainy) return "今天可没有蚯蚓出来啊...";

    if (this.wormCatchCount >= 7) return "这里已经没有蚯蚓了...";

    const successRate = 0.7;
    const success = Math.random() < successRate;

    this.wormCatchCount++;

    if (success) {
      this.warehouse["鱼饵"] = (this.warehouse["鱼饵"] || 0) + 1;
      this.saveData();
      return "恭喜你捕捉到了蚯蚓！";
    } else {
      this.saveData();
      return "你挖了半天土，都没找到蚯蚓，有点可怜啊~";
    }
  }
}