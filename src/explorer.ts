import { globalStore } from "./shopKeeper";
import { Fisherman } from "./fisherman";
import { FISH_TYPES } from "./shopKeeper";
import { Farmer } from "./finalFarmer";

// 这个模块下功能为远航和偷菜

export type ExplorationType = '近海远航' | '远海探索' | '随机探索'

const explorationTypes = {
  "近海远航": { 
    duration: 5 * 60 * 60 * 1000, 
    reward: { minGold: 800, maxGold: 1500, seeds: { min: 3, max: 8 } },
    cost: 1000,
  },
  "远海探索": {
    duration: 8 * 60 * 60 * 1000,
    reward: { minGold: 2000, maxGold: 4000, seeds: { min: 5, max: 12 }, fish: { min: 2, max: 6 } },
    cost: 3000,
  },
  "随机探索": { 
    duration: 12 * 60 * 60 * 1000, 
    reward: { minGold: 3500, maxGold: 7000, seeds: { min: 8, max: 15 }, fish: { min: 4, max: 10 } },
    cost: 5000,
  }
};

export abstract class Explorer extends Fisherman {
  explorationType: ExplorationType;
  explorationStartTime: number | null = null;
  lastStealTime: number = 0;
  lastSignInDate: string = "";

  // 远航探索功能
  explore(type: ExplorationType, ctx: any, msg: any): string {
    if (this.explorationType) {
      const remainingTime = this.getExplorationRemainingTime();
      return `你的船队正在探索中，让我看看...嗯，还有${remainingTime}才会回来哦~`;
    }

    const exploration = explorationTypes[type];
    if (!exploration) {
      return `选择远航类型：\n1.近海远航（5小时，1000金币）\n2.远海探索（8小时，3000金币）\n3.随机探索（12小时，5000金币）\n\n用".远航<探索类型>开启远航吧！\n*远航结束后会来找你的！`;
    }

    if (this.money < exploration.cost) {
      return `你的金币不够进行${type}哦~`;
    }

    this.money -= exploration.cost;
    this.explorationType = type;
    this.explorationStartTime = Date.now();
    this.saveData();

    // 存储远航任务（需要外部任务系统支持）
    try {
      const voyageTasks = JSON.parse(seal.ext.find('我的农田插件').storageGet('VoyageTasks') || '[]');
      voyageTasks.push({
        reachTime: Date.now() + exploration.duration + 30000,
        userId: this.id,
        replyCtx: [ctx.endPoint.userId, msg.guildId, msg.groupId, msg.sender.userId, msg.messageType === "private"]
      });
      seal.ext.find('我的农田插件').storageSet('VoyageTasks', JSON.stringify(voyageTasks));
    } catch (error) {
      console.error('Error saving voyage task:', error);
    }

    return `你的船队出航啦~`;
  }

  // 获取远航剩余时间
  getExplorationRemainingTime(): string {
    if (!this.explorationType || !this.explorationStartTime) return "0秒";
    const duration = explorationTypes[this.explorationType].duration;
    const elapsedTime = Date.now() - this.explorationStartTime;
    const remainingTime = duration - elapsedTime;

    if (remainingTime <= 0) return '0秒';

    const date = new Date(remainingTime)

    return `${date.getHours()-8}小时${date.getMinutes()}分钟${date.getSeconds()}秒`;
  }

  // 检查远航完成
  checkExplorationCompletion(): string {
    if (!this.explorationType || !this.explorationStartTime) return "";

    const reward = explorationTypes[this.explorationType].reward;
    const gold = Math.floor(Math.random() * (reward.maxGold - reward.minGold + 1)) + reward.minGold;
    this.money += gold;

    const seedTypes = Object.keys(globalStore).filter(item => item.endsWith("种子"));
    const seedType = seedTypes[Math.floor(Math.random() * seedTypes.length)];
    const seedQuantity = reward.seeds.min + Math.floor(Math.random() * (reward.seeds.max - reward.seeds.min));

    this.warehouse[seedType] = (this.warehouse[seedType] || 0) + seedQuantity;

    let fishReward = "";
    if ('fish' in reward) {
      const fishType = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
      const fishQuantity = reward.fish.min + Math.floor(Math.random() * (reward.fish.max - reward.fish.min));
      
      this.warehouse[fishType] = (this.warehouse[fishType] || 0) + fishQuantity;
      fishReward = `和${fishType}×${fishQuantity}`;
    }

    this.explorationType = null;
    this.explorationStartTime = null;
    this.saveData();

    const userId = parseInt(this.id.replace('QQ:', ''));
    return `[CQ:at,qq=${userId}]你的船队归来啦！带回了${gold}金币、${seedType}×${seedQuantity}${fishReward}`;
  }

  // 偷菜功能
  stealCrop(targetFarmer: Farmer): string {
    const now = Date.now();
    const cooldown = 60 * 1000; // 1分钟冷却

    if (now - this.lastStealTime < cooldown) {
      const remainingTime = Math.ceil((cooldown - (now - this.lastStealTime)) / 1000);
      return `附近还有人看着呢，再等${remainingTime}秒后再试吧...`;
    }

    const matureFields = Object.keys(targetFarmer.crops).filter(field => 
      targetFarmer.crops[field].harvestTime <= Date.now() && !targetFarmer.crops[field].stolen
    );

    if (matureFields.length === 0) return `这家人的田地中可没有成熟的作物，换个目标吧~`;

    const randomField = matureFields[Math.floor(Math.random() * matureFields.length)];
    const crop = targetFarmer.crops[randomField].seed.replace("种子", "");

    this.warehouse[crop] = (this.warehouse[crop] || 0) + 1;
    delete targetFarmer.crops[randomField];
    this.lastStealTime = now;

    this.saveData();
    targetFarmer.saveData();

    return `嗯哼~成功偷取到${crop}啦！`;
  }

  // 获取当前远航类型
  getExplorationType(): string | null {
    return this.explorationType;
  }
}