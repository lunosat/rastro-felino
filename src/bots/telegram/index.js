import { Telegraf } from "telegraf";

import dotenv from "dotenv";

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

import Log from "../..//utils/logger.js";

//Middlewares
/* 
import chatPermissions from "./middlewares/chatPermissions.js";
import maintenance from "./middlewares/maintenance.js";
import admin from "./middlewares/admin.js";
import limit from "./middlewares/limit.js";
import developer from "./middlewares/dev.js"; */

//Events
/* import callbackQuery from "./events/callbackQuery.js";
import photo from "./events/photo.js";
import emailVerify from "./stages/emailVerify.js";
import webapp from "./events/webapp.js";
import userCheck from "./middlewares/userCheck.js"; */

import eventText from "./events/text.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let bot;

const telegramInit = async () => {
    bot = new Telegraf(process.env.TELEGRAM_TOKEN);
    /* GLOBAL MIDDLEWARES */

    //   bot.use(chatPermissions, userCheck);


    /* COMMANDS */

    const files = fs.readdirSync(path.join(__dirname, "commands"));

    for (let file of files) {
        try {
            if (file.endsWith(".js")) {
                const commandModule = await import(
                    path.join(__dirname, "commands", file)
                );
                const commandHandler = commandModule.default;

                let middlewares = [];

                if (commandHandler && commandHandler.command) {
                    bot.command(commandHandler.command, ...middlewares, commandHandler);

                    Log.success(
                        `Comando iniciado com sucesso: ${commandHandler.command}`
                    );
                } else {
                    Log.warning(`Erro ao inicializar comando ${file}`);
                }
            }
        } catch (error) {
            Log.error(`Erro ao inicializar o comando ${file}: ${error.message}`);
        }
    }




    /* EVENTS */

    bot.on('text', eventText)

    bot.command('ok', (ctx) => {
        ctx.message.text
    })

    

    /* LAUNCH */

    bot.launch();
    Log.success("Telegram Bot: Initialized!");
};

export { telegramInit, bot };