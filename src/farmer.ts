import { WeatherManager } from './weatherManager';

export enum WeatherType {
  Sunny = "晴天",
  Rainy = "雨天",
  Drought = "干旱",
  Stormy = "暴风雨",
  Harvest = "丰收日"
}

const WeatherEffects = {
  [WeatherType.Sunny]: 1.0, // 正常生长
  [WeatherType.Rainy]: 0.8, // 生长速度加快，时间缩短为原来的0.8
  [WeatherType.Drought]: 1.5, // 生长速度减慢，时间为原来的1.5
  [WeatherType.Stormy]: 2.5, // 生长速度减慢，时间为原来的2.5
  [WeatherType.Harvest]: 0.5 // 生长速度加快，时间缩短为原来的0.5
};

// 定义全局商店数据库
export const globalStore = {
  "防风草种子": { price: 50, level: 1 },
  "胡萝卜种子": { price: 60, level: 1 },
  "白萝卜种子": { price: 70, level: 2 },
  "花椰菜种子": { price: 70, level: 2 },
  "小白菜种子": { price: 70, level: 2 },
  "青豆种子": { price: 70, level: 2 }, // 2级
  "肥料": { price: 100, level: 2 }, // 新增肥料商品
  "土豆种子": { price: 75, level: 3 },
  "大黄种子": { price: 80, level: 3 },
  "甘蓝菜种子": { price: 80, level: 3 },
  "葡萄种子": { price: 80, level: 3 },
  "向日葵种子": { price: 90, level: 3 },
  "玫瑰花种子": { price: 90, level: 3 }, // 3级
  "草莓种子": { price: 100, level: 4 },
  "辣椒种子": { price: 100, level: 4 },
  "甜瓜种子": { price: 105, level: 4 },
  "红叶卷心菜种子": { price: 105, level: 4 },
  "杨桃种子": { price: 110, level: 4 },
  "郁金香种子": { price: 105, level: 4 },
  "玫瑰仙子种子": { price: 110, level: 4 }, // 4级
  "茄子种子": { price: 110, level: 5 },
  "苋菜种子": { price: 110, level: 5 },
  "山药种子": { price: 110, level: 5 },
  "夏季亮片种子": { price: 120, level: 5 },
  "虞美人种子": { price: 150, level: 5 },
  "桃树种子": { price: 120, level: 5 },
  "苹果树种子": { price: 120, level: 5 },
  "香蕉树种子": { price: 150, level: 5 },
  "宝石甜莓种子": { price: 200, level: 5 }, // 5级
  "扩容田地": { price: 500, level: 3 }, // 特殊商品
  "鱼饵": { price: 20, level: 4 }, // 新增鱼饵商品
  "扩容田地ii": { price: 1000, level: 5 } // 新增5级的扩容田地
};

export class WeatherSystem {
  private weatherManager: WeatherManager;

  constructor() {
    this.weatherManager = WeatherManager.getInstance();
  }

  public updateWeather() {
    this.weatherManager.updateWeather();
  }

  public getCurrentWeather(): WeatherType {
    return this.weatherManager.getCurrentWeather();
  }

  public getWeatherInfo(): string {
    return this.weatherManager.getWeatherInfo();
  }
}

export class Farmer {
  id: string;
  name: string;
  fields: number;
  money: number;
  level: number;
  experience: number;
  crops: { [key: string]: { seed: string; harvestTime: number; stolen?: boolean } };
  warehouse: { [key: string]: number };
  lastStealTime: number; // 确保 lastStealTime 只声明一次
  public weatherSystem: WeatherSystem; // 添加 weatherSystem 实例
  lastSignInDate: string; // 新增 lastSignInDate 属性
  purchasedFields: { [level: number]: boolean }; // 记录每个等级的扩容田地是否已经购买过
  stealCooldown: number = 60 * 1000; // 偷窃冷却时间，单位为毫秒，这里设置为1分钟
  fishPond: number; // 鱼塘中的鱼苗数量
  lastFishPondRefresh: string; // 上次刷新鱼塘的日期

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.fields = 6;
    this.money = 200;
    this.level = 1;
    this.experience = 0;
    this.crops = {};
    this.warehouse = { "防风草种子": 6 };
    this.lastStealTime = 0; // 初始化 lastStealTime
    this.weatherSystem = new WeatherSystem(); // 初始化 weatherSystem 实例
    this.lastSignInDate = ""; // 初始化 lastSignInDate 属性
    this.purchasedFields = {}; // 初始化 purchasedFields 属性
    this.fishPond = 0; // 初始化 fishPond 属性
    this.lastFishPondRefresh = ""; // 初始化 lastFishPondRefresh 属性
  }

  static getData(id: string): Farmer | null {
    try {
      let farmerData = JSON.parse(seal.ext.find('我的农田插件').storageGet(id) || "{}");
      if (Object.keys(farmerData).length === 0) {
        return null;
      }
      let farmer = new Farmer(id, farmerData.name);
      farmer.fields = farmerData.fields || 6;
      farmer.money = farmerData.money || 200;
      farmer.level = farmerData.level || 1;
      farmer.experience = farmerData.experience || 0;
      farmer.crops = farmerData.crops || {};
      farmer.warehouse = farmerData.warehouse || { "防风草种子": 6 };
      farmer.lastStealTime = farmerData.lastStealTime || 0; // 确保 lastStealTime 被正确初始化
      farmer.lastSignInDate = farmerData.lastSignInDate || ""; // 初始化 lastSignInDate 属性
      farmer.purchasedFields = farmerData.purchasedFields || {}; // 初始化 purchasedFields 属性
      farmer.fishPond = farmerData.fishPond || 0; // 初始化 fishPond 属性
      farmer.lastFishPondRefresh = farmerData.lastFishPondRefresh || ""; // 初始化 lastFishPondRefresh 属性
      return farmer;
    } catch (error) {
      return null;
    }
  }

  saveData() {
    seal.ext.find('我的农田插件').storageSet(this.id.toString(), JSON.stringify(this));
  }

  checkLevelUp() {
    let levelUpThresholds = [100, 500, 1000, 1500, 2000, 2500, 3000, 3600, 4000, 5000];//升级阈值
    let threshold = levelUpThresholds[this.level - 1];
    if (this.experience >= threshold) {
      this.level++;
      this.experience -= threshold;
      this.saveData();
      if (this.level === 4) {
        return `恭喜！您升级到${this.level}级了，可以解锁更多商品了。\n恭喜您解锁鱼塘，开启钓鱼功能！`;
      }
      else if (this.level === 3) {
        return `恭喜！您升级到${this.level}级了，可以解锁更多商品了。\n周围的神秘小精灵开始注意你的田地了！`;
      }
      return `恭喜！您升级到${this.level}级了，可以解锁更多商品了。`;
    }
    return null;
  }

  public fish(): string {
    const fisher = new Fisher(this.id, this.name);
    for (const key in fisher) {
      fisher[key] = this[key] || fisher[key]
    }
    return fisher.fish();
  }

  plantCrop(seed: string, quantity: number) {
    if (!seed.endsWith("种子")) {
      return `该物品不可种植。`;
    }
    if (!this.warehouse[seed]) {
      return `你没有${seed}，请购买后种植。`;
    }
    let availableFields = this.fields - Object.keys(this.crops).length;
    if (quantity > availableFields) {
      return `你只有${availableFields}块空闲田地。`;
    }
    if (this.warehouse[seed] < quantity) {
      return `你的仓库中没有足够的${seed}。`;
    }

    // 获取当前天气
    console.log(JSON.stringify(this.weatherSystem))
    const weatherEffect = WeatherEffects[this.weatherSystem.getCurrentWeather()];

    let plantingTime = Math.random() * (4 - 0.5) + 0.5;
    let harvestTime = (/* @__PURE__ */ new Date()).getTime() + plantingTime * 60 * 60 * 1000 * weatherEffect;

    // 添加事件
    const eventChance = 0.20; // 20% 的概率
    const eventHappened = Math.random() < eventChance;

    console.log(`事件触发概率: ${eventChance}, 事件是否触发: ${eventHappened}`);

    if (eventHappened) {
      const eventType = Math.random() < 0.33 ? "小精灵催熟" : Math.random() < 0.5 ? "女巫药水致死" : "狗熊压坏作物";
      console.log(`事件类型: ${eventType}`);

      if (eventType === "小精灵催熟" && this.level >= 3) {
        harvestTime =plantingTime * 60 * 60 * 1000 * weatherEffect * .8 +Date.now(); // 缩短20%的种植时间
        for (let i = 0; i < quantity; i++) {
          let field = this.getNextAvailableField();
          this.crops[field] = { seed, harvestTime, stolen: false };
        }
        this.warehouse[seed] -= quantity;
        if (this.warehouse[seed] === 0) {
          delete this.warehouse[seed];
        }
        this.saveData();
        return `哦呀，你的田地吸引到这群可爱的小东西了啊~他们给田地施加了魔法哦。\n成功种植${quantity}块${seed}，成熟时间为${this.formatTime(plantingTime * 0.8)}。`;
      } else if (eventType === "女巫药水致死") {
        this.crops = {}; // 农作物全部消失
        const compensation = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
        const fertilizer = Math.floor(Math.random() * (6 - 3 + 1)) + 3;
        this.money += compensation;
        if (!this.warehouse["肥料"]) {
          this.warehouse["肥料"] = 0;
        }
        this.warehouse["肥料"] += fertilizer;
        this.saveData();
        return `呜哇！路过的实习女巫不小心把药水全洒了，你的农作物全没了！对方很抱歉，于是给了你的补偿~获得${compensation}金币和肥料×${fertilizer}。`;
      } else if (eventType === "狗熊压坏作物" && quantity > 2) { // 只有当种植数量大于2时才触发
        const fieldsToDestroy = Math.floor(Math.random() * (5 - 3 + 1)) + 3;
        const fieldsDestroyed = Math.min(fieldsToDestroy, quantity);
        const allFields = Object.keys(this.crops);
        const shuffledFields = allFields.sort(() => 0.5 - Math.random()); // 打乱顺序
        const destroyedFields = shuffledFields.slice(0, fieldsDestroyed); // 选择前 fieldsDestroyed 个
        destroyedFields.forEach(field => delete this.crops[field]);
        this.saveData();
        return `不好了，一只路过的狗熊在你的田地里睡了一觉，压坏了${fieldsDestroyed}块作物...`;
      }
    }

    for (let i = 0; i < quantity; i++) {
      let field = this.getNextAvailableField();
      this.crops[field] = { seed, harvestTime, stolen: false };
    }
    this.warehouse[seed] -= quantity;
    if (this.warehouse[seed] === 0) {
      delete this.warehouse[seed];
    }
    this.saveData();
    return `成功种植${quantity}块${seed}，成熟时间为${this.formatTime(plantingTime)}。`;
  }

  getNextAvailableField() {
    let fieldNumber = 1;
    while (this.crops[`田地${fieldNumber}`]) {
      fieldNumber++;
    }
    return `田地${fieldNumber}`;
  }

  harvestAllCrops() {
    let now = (/* @__PURE__ */ new Date()).getTime();
    let harvestedCrops = {};
    let totalMoney = 0;
    let totalExperience = 0;
    for (let field in this.crops) {
      if (this.crops[field].harvestTime <= now && !this.crops[field].stolen) {
        let seed = this.crops[field].seed;
        let crop = seed.replace("种子", "");
        let seedPrice = globalStore[seed].price;
        let cropPrice = seedPrice * 0.5
        let experience = Math.floor(Math.random() * (20 - 10 + 1)) + 10;
        if (!harvestedCrops[crop]) {
          harvestedCrops[crop] = 0;
        }
        harvestedCrops[crop]++;
        totalMoney += cropPrice;
        totalExperience += experience;
        delete this.crops[field];
        if (!this.warehouse[crop]) {
          this.warehouse[crop] = 0;
        }
        this.warehouse[crop]++;
      }
    }
    if (Object.keys(harvestedCrops).length === 0) {
      return `当前田地暂时没有成熟作物哦~`;
    }
    this.money += totalMoney;
    this.experience += totalExperience;
    this.saveData();

    // 调用 checkLevelUp 方法检查是否需要升级
    let levelUpMessage = this.checkLevelUp();
    let result = `成功收获`;
    for (let crop in harvestedCrops) {
      result += ` ${crop}×${harvestedCrops[crop]}`;
    }
    result += `，获得${totalMoney}金币和${totalExperience}经验。`;
    if (levelUpMessage) {
      result += `\n${levelUpMessage}`;
    }
    return result;
  }

  harvestCrop(field: string) {
    if (field === "all") {
      return this.harvestAllCrops();
    }
    if (!this.crops[field] || this.crops[field].harvestTime > (/* @__PURE__ */ new Date()).getTime() || this.crops[field].stolen) {
      return `${field}还没有成熟作物哦！`;
    }

    // 冒险者偷菜事件
    const adventurerEventChance = 0.05; // 5% 的概率
    const adventurerEventHappened = Math.random() < adventurerEventChance;

    console.log(`冒险者偷菜事件触发概率: ${adventurerEventChance}, 事件是否触发: ${adventurerEventHappened}`);

    if (adventurerEventHappened) {
      console.log("冒险者偷菜事件触发");

      const matureFields = Object.keys(this.crops).filter(field => this.crops[field].harvestTime <= (/* @__PURE__ */ new Date()).getTime() && !this.crops[field].stolen);
      console.log(`成熟田地数量: ${matureFields.length}`);

      if (matureFields.length > 0) {
        const fieldsToSteal = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        const stolenFields = matureFields.slice(0, fieldsToSteal);
        console.log(`被偷走的田地数量: ${stolenFields.length}`);

        stolenFields.forEach(field => {
          delete this.crops[field];
          console.log(`田地 ${field} 被偷走`);
        });

        const compensation = Math.floor(Math.random() * (100 - 50 + 1)) + 50;
        const seedTypes = Object.keys(globalStore).filter(item => item.endsWith("种子"));
        const seedType = seedTypes[Math.floor(Math.random() * seedTypes.length)];
        const seedQuantity = Math.floor(Math.random() * (5 - 3 + 1)) + 3;

        this.money += compensation;
        if (!this.warehouse[seedType]) {
          this.warehouse[seedType] = 0;
        }
        this.warehouse[seedType] += seedQuantity;
        this.saveData();

        return `路过的冒险者采走了你田地里的作物！不过我们及时追上了他们~\n总之要回了一些报酬呢...也不算差？\n获得${compensation}金币和${seedType}×${seedQuantity}。`;
      } else {
        console.log("没有成熟的田地可以被偷");
      }
    } else {
      console.log("冒险者偷菜事件未触发");
    }


    let seed = this.crops[field].seed;
    let crop = seed.replace("种子", "");
    let seedPrice = globalStore[seed].price;
    let cropPrice = seedPrice * 0.5;
    let experience = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

    // 收获双倍作物的概率
    let doubleHarvestChance = this.level * 0.5; // 等级4开始时0.5%，等级5是1%...以此类推

    // 如果是丰收日，增加5%的概率
    console.log(JSON.stringify(this.weatherSystem))
    if (this.weatherSystem.getCurrentWeather() === WeatherType.Harvest) {
      doubleHarvestChance += 5;
    }

    const doubleHarvestHappened = Math.random() < doubleHarvestChance / 100;

    if (doubleHarvestHappened) {
      cropPrice *= 2;
      experience *= 2;
      this.warehouse[crop] += 2;
      this.saveData();
      return `哦呀哦呀~简直是大丰收！\n成功收获${crop}×2，获得${cropPrice}金币和${experience}经验。`;
    }

    this.money += cropPrice;
    this.experience += experience;
    delete this.crops[field];
    if (!this.warehouse[crop]) {
      this.warehouse[crop] = 0;
    }
    this.warehouse[crop]++;
    this.saveData();

    // 调用 checkLevelUp 方法检查是否需要升级
    let levelUpMessage = this.checkLevelUp();
    let result = `成功收获${crop}，获得${cropPrice}金币和${experience}经验。`;
    if (levelUpMessage) {
      result += `\n${levelUpMessage}`;
    }
    return result;
  }

  getFarmInfo() {
    let info = `用户名: ${this.name}
金币: ${this.money}
等级: ${this.level}
经验: ${this.experience}
`;
    let now = (/* @__PURE__ */ new Date()).getTime();
    for (let field in this.crops) {
      let remainingTime = (this.crops[field].harvestTime - now) / (60 * 60 * 1000);
      if (remainingTime <= 0) {
        info += `${field}: ${this.crops[field].seed.replace("种子", "")}（已成熟）
`;
      } else {
        info += `${field}: ${this.crops[field].seed}，剩余时间: ${this.formatTime(remainingTime)}
`;
      }
    }
    return info;
  }

  formatTime(timeInHours: number) {
    let hours = Math.floor(timeInHours);
    let minutes = Math.round((timeInHours - hours) * 60);
    return `${hours}小时${minutes}分钟`;
  }

  getStoreInfo() {
    let info = `商店商品:
`;
    for (let item in globalStore) {
      let level = globalStore[item].level;
      if (item === "扩容田地" && this.purchasedFields[level]) {
        continue; // 如果已经购买过该等级的扩容田地，则不显示该商品
      }
      info += `${item}: ${globalStore[item].price}金币 (等级${globalStore[item].level})
`;
    }
    return info;
  }

  buyItem(item: string, quantity: number = 1) {
    if (!globalStore[item]) {
      return `商店中没有${item}。`;
    }
    if (this.level < globalStore[item].level) {
      return `你的等级不够购买${item}，再加把劲吧~`;
    }

    // 确保购买数量是一个正整数
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      return `请输入一个有效的购买数量哦`;
    }

    let totalPrice = globalStore[item].price * quantity;
    if (this.money < totalPrice) {
      return `嗯...你的金币不够购买${quantity}个${item}。`;
    }

    if (item === "扩容田地") {
      let level = globalStore[item].level;
      if (this.purchasedFields[level]) {
        return `你已经购买过该等级的扩容田地啦！`;
      }
      this.fields += quantity;
      this.purchasedFields[level] = true;
    } else if (item === "扩容田地ii") {
      if (this.purchasedFields[5]) {
        return `你已经购买过5级扩容田地啦！`;
      }
      this.fields += 1; // 5级扩容田地一次只能购买一个
      this.purchasedFields[5] = true;
      delete globalStore["扩容田地ii"]; // 购买后从商店消失
    } else {
      if (!this.warehouse[item]) {
        this.warehouse[item] = 0;
      }
      this.warehouse[item] += quantity;
    }

    this.money -= totalPrice;
    this.saveData();
    return `铛铛——成功购买${item}${quantity}个。`;
  }

  sellItem(item: string, quantity: number = 1) {
    // 检查商品名后所跟数量是否为字符
    if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
      return `请输入有效的出售数量。`;
    }

    if (item === "肥料") {
      return `不好意思，本店不收肥料哦~`;
    }
    if (!this.warehouse[item]) {
      return `你的仓库中没有${item}哦`;
    }
    if (this.warehouse[item] < quantity) {
      return `你的仓库中没有足够的${item}啦！`;
    }

    let sellPrice: number;
    if (item.endsWith("种子")) {
      sellPrice = globalStore[item].price * 0.8;
    } else if (item === "鱼饵") {
      sellPrice = globalStore[item].price * 0.5;
    } else if (this.isFish(item)) { // 调用 isFish 方法
      sellPrice = this.getFishPrice(item);
    } else {
      let seed = item + "种子";
      sellPrice = globalStore[seed].price * 1.25;
    }

    let totalSellPrice = sellPrice * quantity;
    this.money += totalSellPrice;
    this.warehouse[item] -= quantity;
    if (this.warehouse[item] === 0) {
      delete this.warehouse[item];
    }
    this.saveData();
    return `成功出售${item}${quantity}个，获得${totalSellPrice}金币~`;
  }
  // 新增方法：判断是否为鱼类物品
  public isFish(item: string): boolean {
    const fishTypes = ["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼", "罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼", "史莱姆鱼", "虾虎鱼", "红鲻鱼", "青花鱼", "狗鱼", "虎纹鳟鱼", "蓝铁饼鱼", "沙鱼"]; // 可以根据需要扩展
    return fishTypes.includes(item);
  }

  // 新增方法：获取鱼类物品的售价
  private getFishPrice(item: string): number {
    const fishPrices = {
      "鲤鱼": 20,
      "鲱鱼": 30,
      "小嘴鲈鱼": 30,
      "太阳鱼": 45,
      "鳀鱼": 45,
      "沙丁鱼": 45,
      "河鲈": 50,
      "鲢鱼": 50,
      "鲷鱼": 50,
      "红鲷鱼": 55,
      "海参": 55,
      "虹鳟鱼": 55,
      "大眼鱼": 60,
      "西鲱": 60,
      "大头鱼": 60,
      "大嘴鲈鱼": 60,
      "鲑鱼": 60,
      "鬼鱼": 65,
      "罗非鱼": 65,
      "木跃鱼": 65,
      "狮子鱼": 65,
      "比目鱼": 70,
      "大比目鱼": 70,
      "午夜鲤鱼": 70,
      "史莱姆鱼": 70,
      "虾虎鱼": 70,
      "红鲻鱼": 75,
      "青花鱼": 75,
      "狗鱼": 75,
      "虎纹鳟鱼": 75,
      "蓝铁饼鱼": 75,
      "沙鱼": 75
    }; // 可以根据需要扩展
    return fishPrices[item] || 0;
  }

  getWarehouseInfo() {
    let info = `仓库物品:
`;
    for (let item in this.warehouse) {
      info += `${item}: ${this.warehouse[item]}
`;
    }
    return info;
  }

  removeCrop(field: string) {
    if (!this.crops[field]) {
      return `${field}没有种植作物。`;
    }
    delete this.crops[field];
    this.saveData();
    return `成功铲除${field}的作物。`;
  }

  public stealCrop(targetFarmer: Farmer): string {
    const now = Date.now();

    // 检查偷窃冷却时间
    if (this.lastStealTime !== 0 && now - this.lastStealTime < this.stealCooldown) {
      const remainingTime = Math.ceil((this.stealCooldown - (now - this.lastStealTime)) / 1000);
      return `附近还有人看着呢，再等${remainingTime}秒后再试吧...`;
    }


    // 检查目标农田中是否有成熟的作物
    const matureFields = Object.keys(targetFarmer.crops).filter(field => {
      return targetFarmer.crops[field].harvestTime <= now && !targetFarmer.crops[field].stolen;
    });


    if (matureFields.length === 0) {
      return `这家人的田地中可没有成熟的作物，换个目标吧~`;
    }

    // 随机选择一块成熟的作物
    const randomField = matureFields[Math.floor(Math.random() * matureFields.length)];
    const seed = targetFarmer.crops[randomField].seed;
    const crop = seed.replace("种子", "");

    // 将偷窃的作物添加到偷窃者的仓库中
    if (!this.warehouse[crop]) {
      this.warehouse[crop] = 0;
    }
    this.warehouse[crop]++;


    // 从被偷窃者的农田中删除被偷窃的作物
    delete targetFarmer.crops[randomField];


    // 更新偷窃者的上次偷窃时间
    this.lastStealTime = now;

    // 保存数据
    this.saveData();
    targetFarmer.saveData();

    return `嗯哼~成功偷取到${crop}啦！`;
  }

  changeName(newName: string) {
    this.name = newName;
    this.saveData();
    return `要改名成${newName}吗？好的好的，不会是做了什么亏心事吧~`;
  }

  useFertilizer(field: string) {
    if (!this.warehouse["肥料"]) {
      return `你的仓库中没有肥料哦`;
    }

    if (!this.crops[field]) {
      return `${field}没有种植作物。`;
    }

    let now = (/* @__PURE__ */ new Date()).getTime();
    let remainingTime = (this.crops[field].harvestTime - now) / (60 * 60 * 1000);
    if (remainingTime <= 0) {
      return `${field}的作物已经成熟啦！`;
    }

    // 使用肥料，减少一半的生长时间
    this.crops[field].harvestTime -= remainingTime * 0.5 * 60 * 60 * 1000;
    this.warehouse["肥料"]--;
    if (this.warehouse["肥料"] === 0) {
      delete this.warehouse["肥料"];
    }
    this.saveData();
    return `成功对${field}使用魔...肥料，剩余时间减少一半~`;
  }
  // 添加 lastStealTime 的 getter
  public getLastStealTime(): number {
    return this.lastStealTime;
  }

  // 添加 discardItem 方法
  public discardItem(item: string, quantity: number = 1): string {
    if (!this.warehouse[item]) {
      return `你没有${item}物品。`;
    }

    // 确保丢弃数量是一个正整数
    if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
      return `请输入正确的数目。`;
    }

    if (this.warehouse[item] < quantity) {
      return `要丢弃的数目太多啦！`;
    }

    this.warehouse[item] -= quantity;
    if (this.warehouse[item] === 0) {
      delete this.warehouse[item];
    }
    this.saveData();
    return `成功丢弃${quantity}个${item}。`;
  }
}


//原fisher.ts
export class Fisher extends Farmer {
  // private farmer: Farmer;
  private wormCatchCount: number; // 记录抓蚯蚓次数
  private explorationType: string | null; // 记录当前的远航类型
  private explorationStartTime: number | null; // 记录远航开始时间

  constructor(id: string, name: string) {
    super(id, name)

    this.wormCatchCount = 0;
    this.explorationType = null;
    this.explorationStartTime = null;
  }
  static getData(id: string): Fisher | null {
    try {
      let fisherData = JSON.parse(seal.ext.find('我的农田插件').storageGet(id) || "{}");
      if (Object.keys(fisherData).length === 0) {
        return null;
      }
      let fisher = new Fisher(id, fisherData.name);
      for (const key in fisherData) {
        if (key!=='weatherSystem')
        fisher[key] = fisherData[key] || fisher[key]
      }
      // farmer.fields = farmerData.fields || 6;
      // farmer.money = farmerData.money || 200;
      // farmer.level = farmerData.level || 1;
      // farmer.experience = farmerData.experience || 0;
      // farmer.crops = farmerData.crops || {};
      // farmer.warehouse = farmerData.warehouse || { "防风草种子": 6 };
      // farmer.lastStealTime = farmerData.lastStealTime || 0; // 确保 lastStealTime 被正确初始化
      // farmer.lastSignInDate = farmerData.lastSignInDate || ""; // 初始化 lastSignInDate 属性
      // farmer.purchasedFields = farmerData.purchasedFields || {}; // 初始化 purchasedFields 属性
      // farmer.fishPond = farmerData.fishPond || 0; // 初始化 fishPond 属性
      // farmer.lastFishPondRefresh = farmerData.lastFishPondRefresh || ""; // 初始化 lastFishPondRefresh 属性
      return fisher;
    } catch (error) {
      console.log(error)
      return null;
    }
  }
  private refreshFishPond() {
    const now = new Date();
    const today = now.toDateString();
    if (this.lastFishPondRefresh !== today) {
      this.fishPond = Math.floor(Math.random() * (25 - 15 + 1)) + 15;
      this.lastFishPondRefresh = today;
      this.saveData();
    }
  }

  public fish(): string {
    this.refreshFishPond();

    if (this.fishPond <= 0) {
      return "鱼塘中的鱼已经没有了，明天再来吧~";
    }

    if (!this.warehouse["鱼饵"]) {
      return "你还没有鱼饵呢，先去商店买点啦~";
    }

    this.warehouse["鱼饵"]--;
    if (this.warehouse["鱼饵"] === 0) {
      delete this.warehouse["鱼饵"];
    }

    const successRate = 0.55; // 55% 成功率
    const success = Math.random() < successRate;

    if (!success) {
      this.fishPond -= 0.5
      this.saveData();
      return "哎呀！鱼跑了...";
    }

    let fishType = "";
    switch (this.level) {
      case 4:
        fishType = this.getRandomFishType(["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼"]);
        break;
      case 5:
        fishType = this.getRandomFishType(["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼"]);
        break;
      case 6:
        fishType = this.getRandomFishType(["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼"]);
        break;
      case 7:
        fishType = this.getRandomFishType(["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼", "罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼"]);
        break;
      // 其他等级可以继续添加
      default:
        fishType = this.getRandomFishType(["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼", "罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼", "史莱姆鱼", "虾虎鱼", "红鲻鱼", "青花鱼", "狗鱼", "虎纹鳟鱼", "蓝铁饼鱼", "沙鱼"])
    }

    // 生成鱼的长度
    const lengthProbability = Math.random();
    let fishLength: number;
    if (lengthProbability < 0.7) {
      fishLength = parseFloat((Math.random() * (3 - 2) + 2).toFixed(1)); // 2-3尺长
    } else if (lengthProbability < 0.8) {
      fishLength = parseFloat((Math.random() * (2 - 1) + 1).toFixed(1)); // 1-2尺长
    } else if (lengthProbability < 0.9) {
      fishLength = parseFloat((Math.random() * (4 - 3) + 3).toFixed(1)); // 3-4尺长
    } else if (lengthProbability < 0.95) {
      fishLength = parseFloat((Math.random() * (6 - 5) + 5).toFixed(1)); // 5-6尺长
    } else {
      fishLength = parseFloat((Math.random() * (1 - 0) + 0).toFixed(1)); // 0-1尺长
    }


    if (!this.warehouse[fishType]) {
      this.warehouse[fishType] = 0;
    }
    this.warehouse[fishType]++;
    this.fishPond--
    this.saveData();
    return `等待...等待...成功钓到一条长度为${fishLength}尺的${fishType}！`;
  }

  private getRandomFishType(fishTypes: string[]): string {
    return fishTypes[Math.floor(Math.random() * fishTypes.length)];
  }

  public catchWorms(): string {
    if (this.level < 4) {
      return "你的等级不够哦，再等等再来吧！";
    }

    const weatherManager = WeatherManager.getInstance();
    const currentWeather = weatherManager.getCurrentWeather();

    if (currentWeather !== WeatherType.Rainy) {
      return "今天可没有蚯蚓出来啊...";
    }

    if (this.wormCatchCount >= 7) {
      return "这里已经没有蚯蚓了...";
    }

    const successRate = 0.7; // 70% 成功率
    const success = Math.random() < successRate;

    if (success) {
      if (!this.warehouse["鱼饵"]) {
        this.warehouse["鱼饵"] = 0;
      }
      this.warehouse["鱼饵"]++;
      this.wormCatchCount++;
      this.saveData();
      return "恭喜你捕捉到了蚯蚓！";
    } else {
      this.wormCatchCount++;
      this.saveData();
      return "你挖了半天土，都没找到蚯蚓，有点可怜啊~";
    }
  }

  public getExplorationType(): string | null {
    const explorationType = this.explorationType;
    return explorationType;
  }

  public explore(type: string, ctx: seal.MsgContext, msg: seal.Message): string {
    // 检查是否处于远航状态
    if (this.explorationType) {
      const remainingTime = this.getExplorationRemainingTime();
      console.log(`当前远航状态: ${this.explorationType}, 剩余时间: ${remainingTime}`);
      return `你的船队正在探索中，让我看看...嗯，还有${remainingTime}才会回来哦~`;
    }

    const explorationTypes = {
      //"测试远航": { duration: 10, cost: 0, reward: { minGold: 1200, maxGold: 1500, seeds: 7 } },
      "近海远航": { duration: 5 * 60 * 60 * 1000, cost: 1000, reward: { minGold: 1200, maxGold: 1500, seeds: 7 } },
      "远海探索": { duration: 8 * 60 * 60 * 1000, cost: 3000, reward: { minGold: 3200, maxGold: 4000, seeds: 15, fish: 5 } },
      "随机探索": { duration: 12 * 60 * 60 * 1000, cost: 5000, reward: { minGold: 3000, maxGold: 8000, seeds: { min: 10, max: 20 }, fish: { min: 3, max: 10 } } }
    };

    const exploration = explorationTypes[type];
    if (!exploration) {
      return "选择远航类型：\n1.近海远航（5小时，1000金币）\n2.远海探索（8小时，3000金币）\n3.随机探索（12小时，5000金币）\n\n用“.远航<探索类型>开启远航吧！\n*远航结束后会来找你的！";
    }

    if (this.money < exploration.cost) {
      return `你的金币不够进行${type}哦~`;
    }

    this.money -= exploration.cost;
    this.explorationType = type;
    this.explorationStartTime = Date.now();
    this.saveData();
    const str = seal.ext.find('我的农田插件').storageGet('VoyageTasks')
    const data: { reachTime: number, userId: string, replyCtx: [string, string, string, string, boolean] }[] = str ? JSON.parse(str) : []
    data.push({
      reachTime: Date.now() + exploration.duration + 30000,
      userId: this.id,
      replyCtx: [ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, (msg.messageType === "private")]
    })
    seal.ext.find('我的农田插件').storageSet('VoyageTasks', JSON.stringify(data))
    console.log(`存储后 explorationType: ${this.explorationType}, explorationStartTime: ${this.explorationStartTime}`);

    return `你的船队出航啦~`;
  }


  public getExplorationRemainingTime(): string {
    if (!(this.explorationType && this.explorationStartTime)) {
      return "0秒";
    }

    const explorationTypes = {
      "近海远航": 5 * 60 * 60 * 1000,
      "远海探索": 8 * 60 * 60 * 1000,
      "随机探索": 12 * 60 * 60 * 1000
    };

    const duration = explorationTypes[this.explorationType];
    const elapsedTime = Date.now() - this.explorationStartTime;
    const remainingTime = duration - elapsedTime;

    if (remainingTime <= 0) {
      // 当 remainingTime 为 0 时，调用 checkExplorationCompletion() 方法
      // return this.checkExplorationCompletion();
      return '0秒'
    }

    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    return `${hours}小时${minutes}分钟${seconds}秒`;
  }

  public checkExplorationCompletion(): string {
    if (!this.explorationType || !this.explorationStartTime) {
      return "";
    }

    const explorationTypes = {
      //"测试远航": { duration: 10, reward: { minGold: 1200, maxGold: 1500, seeds: 7 } },
      "近海远航": { duration: 5 * 60 * 60 * 1000, reward: { minGold: 1200, maxGold: 1500, seeds: 7 } },
      "远海探索": { duration: 8 * 60 * 60 * 1000, reward: { minGold: 3200, maxGold: 4000, seeds: 15, fish: 5 } },
      "随机探索": { duration: 12 * 60 * 60 * 1000, reward: { minGold: 3000, maxGold: 8000, seeds: { min: 10, max: 20 }, fish: { min: 3, max: 10 } } }
    };

    const exploration = explorationTypes[this.explorationType];
    const elapsedTime = Date.now() - this.explorationStartTime;
    if (elapsedTime >= exploration.duration) {
      const reward = exploration.reward;
      const gold = Math.floor(Math.random() * (reward.maxGold - reward.minGold + 1)) + reward.minGold;
      this.money += gold;

      const seedTypes = Object.keys(globalStore).filter(item => item.endsWith("种子"));
      const seedType = seedTypes[Math.floor(Math.random() * seedTypes.length)];
      const seedQuantity = reward.seeds;

      if (!this.warehouse[seedType]) {
        this.warehouse[seedType] = 0;
      }
      this.warehouse[seedType] += seedQuantity;

      let fishReward = "";
      if (reward.fish) {
        const fishTypes = Object.keys(this.warehouse).filter(item => this.isFish(item));
        const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
        const fishQuantity = reward.fish;

        if (!this.warehouse[fishType]) {
          this.warehouse[fishType] = 0;
        }
        this.warehouse[fishType] += fishQuantity;
        fishReward = `和${fishType}×${fishQuantity}`;
      }

      this.explorationType = null;
      this.explorationStartTime = null;
      this.saveData();
      let idnumber = parseInt(this.id.replace('QQ:', ''))

      return `[CQ:at,qq=${idnumber}]你的船队归来啦，带回了${gold}金币、${seedType}×${seedQuantity}mp${fishReward}`;
    }

    return "";
  }

  public isFish(item: string): boolean {
    const fishTypes = ["鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", "鬼鱼", "罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼", "史莱姆鱼", "虾虎鱼", "红鲻鱼", "青花鱼", "狗鱼", "虎纹鳟鱼", "蓝铁饼鱼", "沙鱼"]; // 可以根据需要扩展
    return fishTypes.includes(item);
  }
  toJSON() {
    const obj = {} as any
    for(const key in this) {
      if (key!=='weatherSystem')
      obj[key] = this[key]
    }
    return obj
  }
}
