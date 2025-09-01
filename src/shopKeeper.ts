import { BaseCharacter } from "./baseCharacter";
interface StoreItem {
  price: number;
  level: number;
}
interface StoreSum {
  [key: string]: StoreItem;
}
export const FISH_TYPES = [
  "鲤鱼", "鲱鱼", "小嘴鲈鱼", "太阳鱼", "鳀鱼", "沙丁鱼", "河鲈", "鲢鱼", "鲷鱼", 
  "红鲷鱼", "海参", "虹鳟鱼", "大眼鱼", "西鲱", "大头鱼", "大嘴鲈鱼", "鲑鱼", 
  "鬼鱼", "罗非鱼", "木跃鱼", "狮子鱼", "比目鱼", "大比目鱼", "午夜鲤鱼", 
  "岁莱姆鱼", "虾虎鱼", "红鲻鱼", "青花鱼", "狗鱼", "虎纹鳟鱼", "蓝铁饼鱼", "沙鱼"
];

export const FISH_PRICES: { [key: string]: number } = {
  "鲤鱼": 20, "鲱鱼": 30, "小嘴鲈鱼": 30, "太阳鱼": 45, "鳀鱼": 45, "沙丁鱼": 45,
  "河鲈": 50, "鲢鱼": 50, "鲷鱼": 50, "红鲷鱼": 55, "海参": 55, "虹鳟鱼": 55,
  "大眼鱼": 60, "西鲱": 60, "大头鱼": 60, "大嘴鲈鱼": 60, "鲑鱼": 60, "鬼鱼": 65,
  "罗非鱼": 65, "木跃鱼": 65, "狮子鱼": 65, "比目鱼": 70, "大比目鱼": 70,
  "午夜鲤鱼": 70, "岁莱姆鱼": 70, "虾虎鱼": 70, "红鲻鱼": 75, "青花鱼": 75,
  "狗鱼": 75, "虎纹鳟鱼": 75, "蓝铁饼鱼": 75, "沙鱼": 75
};

export const globalStore : StoreSum = {
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
export abstract class ShopKeeper extends BaseCharacter {
  purchasedFields: { [level: number]: boolean } = {};

  // 购买物品
  buyItem(item: string, quantity: number = 1): string {
    if (!globalStore[item]) return `商店中没有${item}。`;
    if (this.level < globalStore[item].level) return `你的等级不够购买${item}，再加把劲吧~`;
    if (!Number.isInteger(quantity) || quantity <= 0) return `请输入一个有效的购买数量哦`;

    const totalPrice = globalStore[item].price * quantity;
    if (this.money < totalPrice) return `嗯...你的金币不够购买${quantity}个${item}。`;

    // 特殊物品处理
    if (item === "扩容田地" || item === "扩容田地ii") {
      return this.handleFieldExpansion(item, quantity, totalPrice);
    } else {
      this.warehouse[item] = (this.warehouse[item] || 0) + quantity;
    }

    this.money -= totalPrice;
    this.saveData();
    return `铛铛——成功购买${item}${quantity}个。`;
  }

  // 处理田地扩容
  private handleFieldExpansion(item: string, quantity: number, totalPrice: number): string {
    const level = globalStore[item].level;
    if (this.purchasedFields[level]) return `你已经购买过该等级的扩容田地啦！`;
    
    // 这里需要子类实现具体的田地扩容逻辑
    return this.expandFields(item, quantity, totalPrice, level);
  }

  // 抽象方法，由子类实现具体的田地扩容逻辑
  protected abstract expandFields(item: string, quantity: number, totalPrice: number, level: number): string;

  // 出售物品
  sellItem(item: string, quantity: number = 1): string {
    if (!Number.isInteger(quantity) || quantity <= 0) return `请输入有效的出售数量。`;
    if (item === "肥料") return `不好意思，本店不收肥料哦~`;
    if (!this.warehouse[item] || this.warehouse[item] < quantity) {
      return `你的仓库中没有足够的${item}！`;
    }

    const sellPrice = this.calculateSellPrice(item);
    const totalSellPrice = sellPrice * quantity;
    
    this.money += totalSellPrice;
    this.warehouse[item] -= quantity;
    if (this.warehouse[item] === 0) delete this.warehouse[item];
    this.saveData();

    return `成功出售${item}${quantity}个，获得${totalSellPrice}金币~`;
  }

  // 计算出售价格
  private calculateSellPrice(item: string): number {
    if (item.endsWith("种子")) {
      return (globalStore[item]?.price || 10) * 0.8;
    } else if (item === "鱼饵") {
      return (globalStore[item]?.price || 10) * 0.5;
    } else if (FISH_TYPES.includes(item)) {
      return FISH_PRICES[item] || 20;
    } else {
      const seed = item + "种子";
      return (globalStore[seed]?.price || 10) * 1.25;
    }
  }

  // 丢弃物品
  discardItem(item: string, quantity: number = 1): string {
    if (!this.warehouse[item]) return `你没有${item}物品。`;
    if (!Number.isInteger(quantity) || quantity <= 0) return `请输入正确的数目。`;
    if (this.warehouse[item] < quantity) return `要丢弃的数目太多啦！`;

    this.warehouse[item] -= quantity;
    if (this.warehouse[item] === 0) delete this.warehouse[item];
    this.saveData();
    return `成功丢弃${quantity}个${item}。`;
  }

  // 商店信息
  getStoreInfo(): string {
    let info = `商店商品:\n`;
    Object.entries(globalStore).forEach(([item, data]) => {
      if (item.includes("扩容田地") && this.purchasedFields[data.level]) return;
      info += `${item}: ${data.price}金币 (等级${data.level})\n`;
    });
    return info;
  }

  // 仓库信息
  getWarehouseInfo(): string {
    let info = `仓库物品:\n`;
    Object.entries(this.warehouse).forEach(([item, count]) => {
      info += `${item}: ${count}\n`;
    });
    return info;
  }
}