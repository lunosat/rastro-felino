import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises"; 
import Log from "../../../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commandProcessor = async (text, sock, id) => {
    try {
        const msg = text.split(' ');
        const command = msg[0].replace('/', '');
        msg.shift();
        const args = msg

        const commandsDirectory = path.join(__dirname, './');

        const commandFilePath = path.join(commandsDirectory, `${command}.js`);

        if (await fs.access(commandFilePath).then(() => true).catch(() => false)) {
            const commandModule = await import(commandFilePath);
            await commandModule.handler(sock, id, args);
        } else {
            Log.error(`Comando '${command}' não encontrado.`);
        }
    } catch (error) {
        console.log(error)
        Log.error(`Erro ao processar o comando: ${error.message}`);
    }
};

export default commandProcessor;
