import chalk from "chalk";

const log = console.log;

class Log {
    static error = (message) => {
        const formattedMessage = chalk.bold.red(`❌ Error: ${message}`);
        log(formattedMessage);
    }

    static success = (message) => {
        const formattedMessage = chalk.bold.green(`✅ Success: ${message}`);
        log(formattedMessage);
    }

    static warning = (message) => {
        const formattedMessage = chalk.bold.yellow(`⚠️ Warning: ${message}`);
        log(formattedMessage);
    }

    static process = (message) => {
        const formattedMessage = chalk.bold.blue(`⏳ Process: ${message}`);
        log(formattedMessage);
    }
}

export default Log
