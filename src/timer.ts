import { Farmer } from "./finalFarmer"

type ReplyCtx = [
    string,
    string,
    string,
    string,
    boolean
]

export function TimerInit(ext:seal.ExtInfo) {
    const nowTime = Date.now().toString()

    try {
        setTimeout(() => {
            ext.storageSet('taskId', nowTime)
        }, 500)
        const Check = () => {
            setTimeout(() => {
                const ext = seal.ext.find("我的农田插件")
                // console.log(ext.storageGet('taskId'),nowTime)
                try {
                    if (ext && ext.storageGet && typeof ext.storageGet === 'function' && ext.storageGet('taskId') === nowTime) {
                        // console.log(Date.now())
                        Check()
                        const str = seal.ext.find('我的农田插件').storageGet('VoyageTasks')
                        const data: { reachTime: number, userId: string, replyCtx: ReplyCtx }[] = str ? JSON.parse(str) : []
                        const resData: { reachTime: number, userId: string, replyCtx: ReplyCtx }[] = []
                        data.forEach(v => {
                            // console.log(JSON.stringify(v))
                            if (v.reachTime < Date.now()) {
                                const fisher = Farmer.getData(v.userId)
                                // console.log((fisher.id))
                                const replyStr = fisher.checkExplorationCompletion()
                                // console.log('准备发出'+replyStr)
                                messageTask(...v.replyCtx, replyStr)
                                // seal.replyToSender(v.replyCtx[0],v.replyCtx[1],replyStr)
                            } else {
                                resData.push(v)
                            }
                        })
                        // console.log(JSON.stringify(data))
                        if (data.length !== resData.length) {
                            seal.ext.find('我的农田插件').storageSet('VoyageTasks', JSON.stringify(resData))
                        }
                    }
                } catch (e) {
                    console.log('err', e)
                }
            }, 5000)
        }
        Check()
    } catch (e) {
        console.log(e)
    }
}

function messageTask(epId, guildId, groupId, userId, isPrivate, text) {
    let targetCtx = getCtxAndMsgById(epId, guildId, groupId, userId, isPrivate);
    if (!targetCtx || (targetCtx.length && targetCtx.length < 2)) return
    seal.replyToSender(targetCtx[0] as seal.MsgContext, targetCtx[1] as seal.Message, text);
}
function getCtxAndMsgById(epId, guildId, groupId, senderId, isPrivate) {
    let eps = seal.getEndPoints();
    for (let i = 0; i < eps.length; i++) {
        if (eps[i].userId === epId) {
            let msg = seal.newMessage();
            if (isPrivate === true) {
                msg.messageType = "private";
            } else {
                msg.messageType = "group";
                msg.groupId = groupId;
                msg.guildId = guildId;
            }
            msg.sender.userId = senderId;
            return [seal.createTempCtx(eps[i], msg), msg];
        }
    }
    return undefined;
}