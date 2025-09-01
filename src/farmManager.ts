import { globalStore, ShopKeeper } from "./shopKeeper";
import { WeatherManager, WeatherEffects } from './weatherManager';

interface CropData {
  seed: string;
  harvestTime: number;
  stolen?: boolean;
}
export abstract class FarmManager extends ShopKeeper {
  fields: number = 6;
  crops: { [key: string]: CropData } = {};

  // 实现田地扩容逻辑
  protected expandFields(item: string, quantity: number, totalPrice: number, level: number): string {
    this.fields += quantity;
    this.purchasedFields[level] = true;
    
    // if (item === "扩容田地ii") {
    //   delete globalStore["扩容田地ii"];
    // }
    
    this.money -= totalPrice;
    this.saveData();
    return `铛铛——成功购买${item}${quantity}个。`;
  }

  // 种植作物
  plantCrop(seed: string, quantity: number): string {
    // 基础验证
    if (!seed.endsWith("种子")) return `该物品不可种植。`;
    if (!this.warehouse[seed]) return `你没有${seed}，请购买后种植。`;
    
    const availableFields = this.fields - Object.keys(this.crops).length;
    if (quantity > availableFields) return `你只有${availableFields}块空闲田地。`;
    if (this.warehouse[seed] < quantity) return `你的仓库中没有足够的${seed}。`;

    const weatherEffect = WeatherEffects[WeatherManager.getInstance().getCurrentWeather()];

    // 计算种植时间 
    const baseTime = Math.random() * 3.5 + 0.5; // 0.5-4小时
    const harvestTime = Date.now() + baseTime * 60 * 60 * 1000 * weatherEffect;

    // 随机事件处理
    const eventResult = this.handlePlantingEvents(seed, quantity, baseTime);
    if (eventResult) return eventResult;

    // 正常种植
    for (let i = 0; i < quantity; i++) {
      const field = this.getNextAvailableField();
      this.crops[field] = { seed, harvestTime, stolen: false };
    }

    this.warehouse[seed] -= quantity;
    if (this.warehouse[seed] === 0) delete this.warehouse[seed];
    this.saveData();

    return `成功种植${quantity}块${seed}，成熟时间为${this.formatTime(baseTime)}。`;
  }

  // 处理种植事件
  private handlePlantingEvents(seed: string, quantity: number, baseTime: number): string | null {
    const eventChance = 0.20;
    if (Math.random() > eventChance) return null;

    const events = ["小精灵催熟", "女巫药水致死", "狗熊压坏作物"];
    const eventType = events[Math.floor(Math.random() * events.length)];

    switch (eventType) {
      case "小精灵催熟":
        if (this.level >= 3) {
          const harvestTime = Date.now() + baseTime * 0.8 * 60 * 60 * 1000;
          for (let i = 0; i < quantity; i++) {
            const field = this.getNextAvailableField();
            this.crops[field] = { seed, harvestTime, stolen: false };
          }
          this.warehouse[seed] -= quantity;
          if (this.warehouse[seed] === 0) delete this.warehouse[seed];
          this.saveData();
          return `哦哇，你的田地吸引到这群可爱的小东西了啊~他们给田地施加了魔法哦。\n成功种植${quantity}块${seed}，成熟时间为${this.formatTime(baseTime * 0.8)}。`;
        }
        break;

      case "女巫药水致死":
        this.crops = {};
        const compensation = Math.floor(Math.random() * 51) + 50;
        const fertilizer = Math.floor(Math.random() * 4) + 3;
        this.money += compensation;
        this.warehouse["肥料"] = (this.warehouse["肥料"] || 0) + fertilizer;
        this.saveData();
        return `呜哇！路过的实习女巫不小心把药水全洒了，你的农作物全没了！对方很抱歉，于是给了你的补偿~获得${compensation}金币和肥料×${fertilizer}。`;

      case "狗熊压坏作物":
        if (quantity > 2) {
          const fieldsDestroyed = Math.min(Math.floor(Math.random() * 3) + 3, quantity);
          return `不好了，一只路过的狗熊在你的田地里睡了一觉，压坏了${fieldsDestroyed}块作物...`;
        }
        break;
    }
    return null;
  }

  // 获取下一个可用田地
  private getNextAvailableField(): string {
    let fieldNumber = 1;
    while (this.crops[`田地${fieldNumber}`]) {
      fieldNumber++;
    }
    return `田地${fieldNumber}`;
  }

  // 收获作物
  harvestCrop(field: string): string {
    if (field === "all") return this.harvestAllCrops();
    
    if (!this.crops[field] || this.crops[field].harvestTime > Date.now() || this.crops[field].stolen) {
      return `${field}还没有成熟作物哦！`;
    }

    // 冒险者事件处理
    if (Math.random() < 0.05) {
      const adventurerResult = this.handleAdventurerEvent();
      if (adventurerResult) return adventurerResult;
    }

    const { seed } = this.crops[field];
    const crop = seed.replace("种子", "");
    const seedPrice = globalStore[seed]?.price || 10;
    let cropPrice = seedPrice * 0.5;
    let experience = Math.floor(Math.random() * 11) + 10;

    // 双倍收获检查
    const doubleChance = this.level * 0.5;
    if (Math.random() < doubleChance / 100) {
      cropPrice *= 2;
      experience *= 2;
      this.warehouse[crop] = (this.warehouse[crop] || 0) + 2;
      this.money += cropPrice;
      this.experience += experience;
      delete this.crops[field];
      this.saveData();

      const levelUpMessage = this.checkLevelUp();
      let result = `哦哇哦哇~简直是大丰收！\n成功收获${crop}×2，获得${cropPrice}金币和${experience}经验。`;
      if (levelUpMessage) result += `\n${levelUpMessage}`;
      return result;
    }

    // 正常收获
    this.money += cropPrice;
    this.experience += experience;
    this.warehouse[crop] = (this.warehouse[crop] || 0) + 1;
    delete this.crops[field];
    this.saveData();

    const levelUpMessage = this.checkLevelUp();
    let result = `成功收获${crop}，获得${cropPrice}金币和${experience}经验。`;
    if (levelUpMessage) result += `\n${levelUpMessage}`;
    return result;
  }

  // 收获所有作物
  harvestAllCrops(): string {
    const now = Date.now();
    const harvestedCrops: { [key: string]: number } = {};
    let totalMoney = 0;
    let totalExperience = 0;

    Object.keys(this.crops).forEach(field => {
      const crop = this.crops[field];
      if (crop.harvestTime <= now && !crop.stolen) {
        const cropName = crop.seed.replace("种子", "");
        const seedPrice = globalStore[crop.seed]?.price || 10;
        const cropPrice = seedPrice * 0.5;
        const experience = Math.floor(Math.random() * 11) + 10;

        harvestedCrops[cropName] = (harvestedCrops[cropName] || 0) + 1;
        totalMoney += cropPrice;
        totalExperience += experience;
        this.warehouse[cropName] = (this.warehouse[cropName] || 0) + 1;
        delete this.crops[field];
      }
    });

    if (Object.keys(harvestedCrops).length === 0) {
      return `当前田地暂时没有成熟作物哦~`;
    }

    this.money += totalMoney;
    this.experience += totalExperience;
    this.saveData();

    const levelUpMessage = this.checkLevelUp();
    let result = `成功收获`;
    Object.entries(harvestedCrops).forEach(([crop, count]) => {
      result += ` ${crop}×${count}`;
    });
    result += `，获得${totalMoney}金币和${totalExperience}经验。`;
    if (levelUpMessage) result += `\n${levelUpMessage}`;
    return result;
  }

  // 处理冒险者事件
  private handleAdventurerEvent(): string | null {
    const matureFields = Object.keys(this.crops).filter(field => 
      this.crops[field].harvestTime <= Date.now() && !this.crops[field].stolen
    );

    if (matureFields.length === 0) return null;

    const fieldsToSteal = Math.min(Math.floor(Math.random() * 2) + 1, matureFields.length);
    const stolenFields = matureFields.slice(0, fieldsToSteal);

    stolenFields.forEach(field => delete this.crops[field]);

    const compensation = Math.floor(Math.random() * 51) + 50;
    const seedTypes = Object.keys(globalStore).filter(item => item.endsWith("种子"));
    const seedType = seedTypes[Math.floor(Math.random() * seedTypes.length)];
    const seedQuantity = Math.floor(Math.random() * 3) + 3;

    this.money += compensation;
    this.warehouse[seedType] = (this.warehouse[seedType] || 0) + seedQuantity;
    this.saveData();

    return `路过的冒险者采走了你田地里的作物！不过我们及时追上了他们~\n总之要回了一些报酬呢...也不算差？\n获得${compensation}金币和${seedType}×${seedQuantity}。`;
  }

  // 使用肥料
  useFertilizer(field: string): string {
    if (!this.warehouse["肥料"]) return `你的仓库中没有肥料哦`;
    if (!this.crops[field]) return `${field}没有种植作物。`;

    const now = Date.now();
    const remainingTime = (this.crops[field].harvestTime - now) / (60 * 60 * 1000);
    if (remainingTime <= 0) return `${field}的作物已经成熟啦！`;

    this.crops[field].harvestTime -= remainingTime * 0.5 * 60 * 60 * 1000;
    this.warehouse["肥料"]--;
    if (this.warehouse["肥料"] === 0) delete this.warehouse["肥料"];
    this.saveData();

    return `成功对${field}使用魔...肥料！，剩余时间减少一半~`;
  }

  // 铲除作物
  removeCrop(field: string): string {
    if (!this.crops[field]) return `${field}没有种植作物。`;
    delete this.crops[field];
    this.saveData();
    return `成功铲除${field}的作物。`;
  }

  // 获取农场信息
  getFarmInfo(): string {
    let info = `用户名: ${this.name}\n金币: ${this.money}\n等级: ${this.level}\n经验: ${this.experience}\n`;
    const now = Date.now();

    Object.entries(this.crops).forEach(([field, crop]) => {
      const remainingTime = (crop.harvestTime - now) / (60 * 60 * 1000);
      if (remainingTime <= 0) {
        info += `${field}: ${crop.seed.replace("种子", "")}（已成熟）\n`;
      } else {
        info += `${field}: ${crop.seed}，剩余时间: ${this.formatTime(remainingTime)}\n`;
      }
    });

    return info;
  }
}