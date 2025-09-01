// import { Farmer } from './farmer';
import { Farmer } from './finalFarmer';
import { WeatherManager,WeatherType } from './weatherManager'; // 导入 WeatherManager 类
import {TimerInit } from './timer'
import { ExplorationType } from './explorer';
(() => {
  // 定义 weatherManager 变量并初始化 WeatherManager 类的实例
  const weatherManager = WeatherManager.getInstance();

  function main() {
    if (!seal.ext.find("我的农田插件")) {
      const ext = seal.ext.new("我的农田插件", "bug人@", "1.0.0");
      const nowTime = Date.now().toString()
      TimerInit(ext)
      setTimeout(() => {
        ext.storageSet('taskId',nowTime)
      },500)
      const cmdBecomeFarmer: seal.CmdItemInfo = {
        name: "成为农夫",
        help: "指令：.成为农夫",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer, id, name) => {
            if (!farmer) {
              farmer = new Farmer(id, name);
              farmer.saveData();
              seal.replyToSender(ctx, msg, `恭喜你成为农夫！\n现在你拥有6块田地、200金币和防风草种子×6~\nx现在你的等级为1，经验值为0，加油吧！\n\n请使用“.农场指令”查看相关指令`);
            } else {
              seal.replyToSender(ctx, msg, `哎呀~你已经是农夫了，难道忘记了吗？`);
            }
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdFarmCommands: seal.CmdItemInfo = {
        name: "农场指令",
        help: "指令：.农场指令",
        solve: (ctx, msg) => {
          const helpMessage = [
            "农场指令帮助信息：",
            ".签到 - 签到并获得每日奖励",
            ".我的农田 - 查看我的农田信息",
            ".种植<农作物><数量> - 种植农作物（数量和物品间请加空格）",
            ".农田商店 - 查看农田商店",
            ".购买 <商品名>（数量） - 购买商品（数量和物品间请加空格）",
            ".出售 <商品名>（数量） - 出售商品（数量和物品间请加空格）",
            ".好友信息<@其他人> - 查看好友的农田信息",
            ".我的仓库 - 查看我的仓库",
            ".铲除农田<田地名> - 铲除农田中的作物",
            ".偷窃<@其他人> - 偷窃其他人的作物",
            ".收获 - 收获所有成熟的作物",
            ".丢弃 <物品名>（数目） - 丢弃物品（数量和物品间请加空格）",
            ".修改农夫名<新用户名> - 修改农夫名",
            ".使用肥料 <田地名> - 使用肥料缩短时间",
            ".钓鱼 - 在鱼塘钓鱼",
            ".抓蚯蚓 - 抓蚯蚓转换为鱼饵",
            ".远航 - 派遣船队远航探索",
            ".农场指令 - 查看农场指令帮助信息"
          ].join('\n');
          seal.replyToSender(ctx, msg, helpMessage);
          return seal.ext.newCmdExecuteResult(true);
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdFarmInfo: seal.CmdItemInfo = {
        name: "我的农田",
        help: "指令：.我的农田",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }

            // 更新天气
            weatherManager.updateWeather();

            // 获取当前日期和天气信息
            const now = new Date();
            const dateInfo = `${now.getMonth() + 1}月${now.getDate()}日`;
            const weatherInfo = weatherManager.getWeatherInfo();

            // 获取农田信息
            const farmInfo = farmer.getFarmInfo();

            // 组合回复信息
            const replyMessage = `用户名: ${farmer.name}\n日期：${dateInfo}\n${weatherInfo}\n${farmInfo}`;
            seal.replyToSender(ctx, msg, replyMessage);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdPlantCrop: seal.CmdItemInfo = {
        name: "种植",
        help: "指令：.种植<农作物><数量>",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let crop = cmdArgs.getArgN(1);
            let quantity = parseInt(cmdArgs.getArgN(2));
            if (isNaN(quantity) || quantity <= 0) {
              seal.replyToSender(ctx, msg, `请输入正确的数量啦...`);
              return seal.ext.newCmdExecuteResult(true);
            }
            seal.replyToSender(ctx, msg, farmer.plantCrop(crop, quantity));
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdStoreInfo: seal.CmdItemInfo = {
        name: "农田商店",
        help: "指令：.农田商店",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            seal.replyToSender(ctx, msg, farmer.getStoreInfo());
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdBuyItem: seal.CmdItemInfo = {
        name: "购买",
        help: "指令：.购买 <商品名>（数量）",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let item = cmdArgs.getArgN(1);
            let quantity = parseInt(cmdArgs.getArgN(2)) || 1;
            seal.replyToSender(ctx, msg, farmer.buyItem(item, quantity));
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdSellItem: seal.CmdItemInfo = {
        name: "出售",
        help: "指令：.出售 <商品名>（数量）",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let item = cmdArgs.getArgN(1);
            let quantity = parseInt(cmdArgs.getArgN(2)) || 1;
            seal.replyToSender(ctx, msg, farmer.sellItem(item, quantity));
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdOtherFarmInfo: seal.CmdItemInfo = {
        name: "好友信息",
        help: "指令：.好友信息<其他人>",
        allowDelegate: true,
        solve: (ctx, msg, cmdArgs) => {
          let mctx = seal.getCtxProxyFirst(ctx, cmdArgs); // 修正拼写错误
          return handleFarmerCommand(mctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            seal.replyToSender(ctx, msg, farmer.getFarmInfo());
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        disabledInPrivate: false
      };

      const cmdWarehouseInfo: seal.CmdItemInfo = {
        name: "我的仓库",
        help: "指令：.我的仓库",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            seal.replyToSender(ctx, msg, farmer.getWarehouseInfo());
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdRemoveCrop: seal.CmdItemInfo = {
        name: "铲除农田",
        help: "指令：.铲除农田<序号>",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let field = cmdArgs.getArgN(1);
            seal.replyToSender(ctx, msg, farmer.removeCrop(field));
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdStealCrop: seal.CmdItemInfo = {
        name: "偷窃",
        help: "指令：.偷窃<其他人>",
        allowDelegate: true,
        solve: (ctx, msg, cmdArgs) => {
          let mctx = seal.getCtxProxyFirst(ctx, cmdArgs); // 修正拼写错误
          return handleFarmerCommand(mctx, msg, cmdArgs, (farmer) => {

            //初始化用户变量
            let id = msg.sender.userId;
            //let name = msg.sender.nickname;
            farmer = Farmer.getData(id);

            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }

            // 获取目标用户的 ID
            let mctx = seal.getCtxProxyFirst(ctx, cmdArgs);

            let targetFarmer = Farmer.getData(mctx.player.userId);

            if (!targetFarmer) {
              seal.replyToSender(ctx, msg, `这个人还没有成为农夫哦，要不要试着让他也加入你呀~。`);
              return seal.ext.newCmdExecuteResult(true);
            }

            let now = (new Date()).getTime();
            if (farmer.lastStealTime != 0 && now - farmer.lastStealTime < 6e4) {
              let remainingTime = Math.ceil((6e4 - (now - farmer.lastStealTime)) / 1e3);
              seal.replyToSender(ctx, msg, `附近还有人看着呢，再等${remainingTime}秒后再试吧...`);
              return seal.ext.newCmdExecuteResult(true);
            }

            // 调用偷窃方法
            let result = farmer.stealCrop(targetFarmer);
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        disabledInPrivate: false
      };

      const cmdHarvestCrop: seal.CmdItemInfo = {
        name: "收获",
        help: "指令：.收获",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            console.log(`收获指令: 一键收获`);
            seal.replyToSender(ctx, msg, farmer.harvestCrop("all"));
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdDiscardItem: seal.CmdItemInfo = {
        name: "丢弃",
        help: "指令：.丢弃 <物品名>（数目）",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let item = cmdArgs.getArgN(1);
            let quantity = parseInt(cmdArgs.getArgN(2)) || 1;

            // 打印日志，确认物品名和数量
            console.log(`丢弃指令: 物品: ${item}, 数量: ${quantity}`);

            let result = farmer.discardItem(item, quantity);

            // 打印日志，确认丢弃结果
            console.log(`丢弃结果: ${result}`);

            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdChangeName: seal.CmdItemInfo = {
        name: "修改农夫名",
        help: "指令：.修改农夫名<新用户名>",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let newName = cmdArgs.getArgN(1);
            let result = farmer.changeName(newName);
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdUseFertilizer: seal.CmdItemInfo = {
        name: "使用肥料",
        help: "指令：.使用肥料 <田地序号>",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            let field = cmdArgs.getArgN(1);
            let result = farmer.useFertilizer(field);
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdSignIn: seal.CmdItemInfo = {
        name: "签到",
        help: "指令：.签到",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }

            // 获取当前日期
            const now = new Date();
            const today = now.toDateString();

            // 检查用户今天是否已经签到
            if (farmer.lastSignInDate === today) {
              // 更新天气
              weatherManager.updateWeather();

              // 获取当前日期和天气信息
              const dateInfo = `${now.getMonth() + 1}月${now.getDate()}日`;
              const weatherInfo = weatherManager.getWeatherInfo();

              // 返回签到信息
              let signInMessage = `今天已经打过招呼了吧！还是说，你是来看看日历看看天气的？\n日期：${dateInfo}\n${weatherInfo}`;
              switch (weatherManager.getCurrentWeather()) {
                case WeatherType.Sunny:
                  signInMessage += "\n哦呀哦呀，是个大晴天呢~（无增益天气）";
                  break;
                case WeatherType.Rainy:
                  signInMessage += "\n下雨了，是植物们喜欢的日子呢~（收获时间缩短，可以抓蚯蚓）";
                  break;
                case WeatherType.Drought:
                  signInMessage += "\n真是火热的天气...别忘了给农田浇水（收获时间延长）";
                  break;
                case WeatherType.Stormy:
                  signInMessage += "\n哎呀！今天暴风雨要来了，注意作物别被吹跑了！（收获时间大幅延长）";
                  break;
                case WeatherType.Harvest:
                  signInMessage += "\n真是令人神清气爽的好日子，你说是不是~（收获时间大幅缩短）";
                  break;
              }
              seal.replyToSender(ctx, msg, signInMessage);
              return seal.ext.newCmdExecuteResult(true);
            }

            // 更新天气
            weatherManager.updateWeather();

            // 获取当前日期和天气信息
            const dateInfo = `${now.getMonth() + 1}月${now.getDate()}日`;
            const weatherInfo = weatherManager.getWeatherInfo();

            // 给予金币奖励
            const reward = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
            farmer.money += reward;
            farmer.lastSignInDate = today;
            farmer.saveData();

            // 返回签到信息
            // 根据天气生成不同的签到提示语
            let signInMessage = `签到成功！\n日期：${dateInfo}\n${weatherInfo}\n获得${reward}金币。`;
            switch (weatherManager.getCurrentWeather()) {
              case WeatherType.Sunny:
                signInMessage += "\n哦呀哦呀，是个大晴天呢~（无增益天气）";
                break;
              case WeatherType.Rainy:
                signInMessage += "\n下雨了，是植物们喜欢的日子呢~（收获时间缩短，可以抓蚯蚓）";
                break;
              case WeatherType.Drought:
                signInMessage += "\n真是火热的天气...别忘了给农田浇水（收获时间延长）";
                break;
              case WeatherType.Stormy:
                signInMessage += "\n哎呀！今天暴风雨要来了，注意作物别被吹跑了！（收获时间大幅延长）";
                break;
              case WeatherType.Harvest:
                signInMessage += "\n真是令人神清气爽的好日子，你说是不是~（收获时间大幅缩短）";
                break;
            }

            seal.replyToSender(ctx, msg, signInMessage);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdFish: seal.CmdItemInfo = {
        name: "钓鱼",
        help: "指令：.钓鱼",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            const result = farmer.fish();
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdCatchWorms: seal.CmdItemInfo = {
        name: "抓蚯蚓",
        help: "指令：.抓蚯蚓",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }
            const fisher = Farmer.getData(farmer.id);
            const result = fisher.catchWorms();
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };

      const cmdExplore: seal.CmdItemInfo = {
        name: "远航",
        help: "指令：.远航",
        solve: (ctx, msg, cmdArgs) => {
          return handleFarmerCommand(ctx, msg, cmdArgs, (farmer) => {
            if (!farmer) {
              seal.replyToSender(ctx, msg, `你还不是农夫哦，试着用.成为农夫指令加入大家吧！`);
              return seal.ext.newCmdExecuteResult(true);
            }

            const fisher = Farmer.getData(farmer.id);
            const explorationType = fisher.getExplorationType(); // 获取当前的远航类型

            if (explorationType) {
              const remainingTime = fisher.getExplorationRemainingTime();
              console.log(`当前远航状态: ${explorationType}, 剩余时间: ${remainingTime}`);
              if (remainingTime.includes('秒')) {
                seal.replyToSender(ctx, msg, `你的船队正在探索中，让我看看...嗯，还有${remainingTime}才会回来哦~`);
              } else {
                seal.replyToSender(ctx,msg, remainingTime)
              }
              return seal.ext.newCmdExecuteResult(true);
            }

            const result = fisher.explore(cmdArgs.getArgN(1) as ExplorationType,ctx,msg);
            seal.replyToSender(ctx, msg, result);
            return seal.ext.newCmdExecuteResult(true);
          });
        },
        allowDelegate: false,
        disabledInPrivate: false
      };



      ext.cmdMap["成为农夫"] = cmdBecomeFarmer;
      ext.cmdMap["农场指令"] = cmdFarmCommands;
      ext.cmdMap["我的农田"] = cmdFarmInfo;
      ext.cmdMap["种植"] = cmdPlantCrop;
      ext.cmdMap["农田商店"] = cmdStoreInfo;
      ext.cmdMap["购买"] = cmdBuyItem;
      ext.cmdMap["出售"] = cmdSellItem;
      ext.cmdMap["好友信息"] = cmdOtherFarmInfo;
      ext.cmdMap["我的仓库"] = cmdWarehouseInfo;
      ext.cmdMap["铲除农田"] = cmdRemoveCrop;
      ext.cmdMap["偷窃"] = cmdStealCrop;
      ext.cmdMap["收获"] = cmdHarvestCrop;
      ext.cmdMap["丢弃"] = cmdDiscardItem;
      ext.cmdMap["修改农夫名"] = cmdChangeName;
      ext.cmdMap["使用肥料"] = cmdUseFertilizer;
      ext.cmdMap["签到"] = cmdSignIn;
      ext.cmdMap["钓鱼"] = cmdFish;
      ext.cmdMap["抓蚯蚓"] = cmdCatchWorms;
      ext.cmdMap["远航"] = cmdExplore;
      seal.ext.register(ext);
    }
  }

  function handleFarmerCommand(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs, callback: (farmer: Farmer | null, id: string, name: string) => seal.CmdExecuteResult) {
    let id = ctx.player.userId;
    let name = ctx.player.name;
    let farmer = Farmer.getData(id);
    return callback(farmer, id, name);
  }

  main();
})();
