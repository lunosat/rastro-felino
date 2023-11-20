import User from "../models/User.js";
import cron from 'node-cron';
import Tracker from "../linketrack/tracker.js";
import { bot } from '../bots/telegram/index.js'
import { sock } from "../bots/whatsapp/index.js";
import formatMarkdownV2 from "../helpers/formatMarkdownV2.js";

const tracker = new Tracker();

cron.schedule('*/30 * * * *', async () => {
    console.log('Running a task every 30 minutes');

    try {
        const users = await User.find();

        for (const user of users) {
            for (const packageInfo of user.packages) {
                const track = await tracker.verifyCode(packageInfo.code);

                if (track.data.eventos[0].status !== packageInfo.lastStatus) {
                    const { data, hora, local, status } = track.data.eventos[0]
                    let text = `*O status do seu pacote foi atualizado!*

*📫 ${track.data.codigo}* - *${packageInfo.name}*
                    
*🗓️ Data:* _${data}_ | *⌚ Hora:* _${hora}_
*🗺️ Local:* _${local.replace('Local:', '')}_
*📋 Status:* _${status}_

_Continuaremos monitorando seu pacote para você, apenas sente-se e relaxe._`
                    if (user.telegramId) {
                        await bot.telegram.sendMessage(user.telegramId, formatMarkdownV2(text), {
                            parse_mode: 'MarkdownV2'
                        })
                    }

                    if (user.whatsappId) {
                        await sock.sendMessage(user.whatsappId, { text })
                    }

                }
                packageInfo.lastStatus = track.data.eventos[0].status;
                packageInfo.lastVerifield = Date.now();
            }

            await user.save();
        }

        console.log('Task completed successfully');
    } catch (error) {
        console.error('Error in task:', error);
    }
});
