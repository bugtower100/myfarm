const LEVEL_UP_THRESHOLDS = [100, 500, 1000, 1500, 2000, 2500, 3000, 3600, 4000, 5000];

export abstract class BaseCharacter {
  id: string;
  name: string;
  money: number = 200;
  level: number = 1;
  experience: number = 0;
  warehouse: { [key: string]: number } = { "防风草种子": 6 };

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  // 数据加载和保存的抽象方法
  abstract saveData(): void;

  // 等级检查和升级
  checkLevelUp(): string | null {
    const threshold = LEVEL_UP_THRESHOLDS[this.level - 1];
    if (this.experience >= threshold) {
      this.level++;
      this.experience -= threshold;
      this.saveData();

      let message = `恭喜！您升级到${this.level}级了，可以解锁更多商品了。`;
      if (this.level === 3) {
        message += `\n周围的神秘小精灵开始注意你的田地了！`;
      } else if (this.level === 4) {
        message += `\n恭喜您解锁鱼塘，开启钓鱼功能！`;
      }
      return message;
    }
    return null;
  }

  // 改名
  changeName(newName: string): string {
    this.name = newName;
    this.saveData();
    return `要改名成${newName}吗？好的好的，不会是做了什么亏心事吧~`;
  }

  // 工具方法
  formatTime(timeInHours: number): string {
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}小时${minutes}分钟`;
  }
}