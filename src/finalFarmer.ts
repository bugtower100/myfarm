import { Explorer } from "./explorer";

export class Farmer extends Explorer {
  // 数据加载
  static getData(id: string): Farmer | null {
    try {
      const farmerData = JSON.parse(seal.ext.find('我的农田插件').storageGet(id) || "{}");
      if (Object.keys(farmerData).length === 0) return null;

      const farmer = new Farmer(id, farmerData.name);
      // 复制所有属性，除了特殊处理的
      Object.keys(farmerData).forEach(key => {
        if (key !== 'weatherSystem') {
          farmer[key] = farmerData[key] ?? farmer[key];
        }
      });
      
      return farmer;
    } catch (error) {
      console.error('Error loading farmer data:', error);
      return null;
    }
  }

  // 数据保存
  saveData(): void {
    const data = { ...this };
    if ('weatherSystem' in data) delete data.weatherSystem; // 不保存天气系统实例
    seal.ext.find('我的农田插件').storageSet(this.id, JSON.stringify(data));
  }
}
