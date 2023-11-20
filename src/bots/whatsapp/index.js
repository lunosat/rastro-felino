import { Boom } from "@hapi/boom";
import NodeCache from "node-cache";
import readline from "readline";
import pkg from "@whiskeysockets/baileys";
import eventText from "./events/text.js";
import commandProcessor from "./commands/commandProcessor.js";
const {
  AnyMessageContent,
  delay,
  fetchLatestBaileysVersion,
  getAggregateVotesInPollMessage,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  proto,
  useMultiFileAuthState,
  WAMessageContent,
  WAMessageKey,
  downloadMediaMessage
} = pkg;
import fs from "fs";
import pino from "pino";
import path from "path";
import { fileURLToPath } from "url";

const {
  DisconnectReason,
  default: makeWASocket,
  // useSingleFileAuthState
} = (await import("@whiskeysockets/baileys")).default;

const logger = pino();
logger.level = "error";

const useStore = !process.argv.includes("--no-store");
const doReplies = !process.argv.includes("--no-reply");
const usePairingCode = process.argv.includes("--use-pairing-code");
const useMobile = process.argv.includes("--mobile");


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterCache = new NodeCache();

// Read line interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (text) =>
  new Promise() < string > ((resolve) => rl.question(text, resolve));

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = useStore ? makeInMemoryStore({ logger }) : undefined;
store?.readFromFile("./baileys_store_multi.json");
// save every 10s
setInterval(() => {
  store?.writeToFile("./baileys_store_multi.json");
}, 10_000);

// start a connection

let sock;

const whatsappInit = async (init) => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: !usePairingCode,
    mobile: useMobile,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage,
  });

  store?.bind(sock.ev);

  // Pairing code for Web clients
  if (usePairingCode && !sock.authState.creds.registered) {
    if (useMobile) {
      throw new Error("Cannot use pairing code with mobile api");
    }

    const phoneNumber = await question(
      "Please enter your mobile phone number:\n"
    );
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`Pairing code: ${code}`);
  }

  const sendMessageWTyping = async (msg, jid) => {
    await sock.presenceSubscribe(jid);
    await delay(500);

    await sock.sendPresenceUpdate("composing", jid);
    await delay(2000);

    await sock.sendPresenceUpdate("paused", jid);

    await sock.sendMessage(jid, msg);
  };

  sock.ev.process(
    async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          // reconnect if not logged out
          if (
            lastDisconnect?.error?.output?.statusCode !==
            DisconnectReason.loggedOut
          ) {
            whatsappInit();
          } else {
            console.log("Connection closed. You are logged out.");
          }
        }

        console.log("connection update", update);

        if (update.qr) {
          fs.writeFileSync("qr.json", JSON.stringify(update));
        }
      }

      // credentials updated -- save them
      if (events["creds.update"]) {
        await saveCreds();
      }

      if (events["labels.association"]) {
        console.log(events["labels.association"]);
      }

      if (events["labels.edit"]) {
        console.log(events["labels.edit"]);
      }

      if (events.call) {
        console.log("recv call event", events.call);
      }

      // history received
      if (events["messaging-history.set"]) {
        const { chats, contacts, messages, isLatest } =
          events["messaging-history.set"];
        console.log(
          `recv ${chats.length} chats, ${contacts.length} contacts, ${messages.length} msgs (is latest: ${isLatest})`
        );
      }

      // received a new message
      if (events["messages.upsert"]) {
        const upsert = events["messages.upsert"];
        // console.log("recv messages ", JSON.stringify(upsert, undefined, 2));

        if (upsert.type === "notify") {
          for (const msg of upsert.messages) {
            if (!msg.key.fromMe && doReplies) {
              //   console.log("replying to", msg.key.remoteJid);
              await sock.readMessages([msg.key]);

              const messageType = Object.keys(msg.message)[0]
              console.log('TYPE:', messageType)
              const id = msg.key.remoteJid;

              if (id.endsWith("@g.us")) {
                // await sendMessageWTyping({ text: 'Não estou disponível em grupos, se possuir uma assinatura válida por favor se direcione ao meu chat privado.'}, id)
                return;
              }
              const text =
                msg?.message?.conversation ||
                msg?.message?.imageMessage?.caption ||
                msg?.message?.extendedTextMessage?.text ||
                "NOT_MESSAGE";

              if (text.startsWith('/')) {
                commandProcessor(text, sock, id)
              } else {
                eventText(text, sock, id)
              }
            }
          }
        }
      }

      // messages updated like status delivered, message deleted etc.
      if (events["messages.update"]) {
        console.log(JSON.stringify(events["messages.update"], undefined, 2));

        for (const { key, update } of events["messages.update"]) {
          if (update.pollUpdates) {
            const pollCreation = await getMessage(key);
            if (pollCreation) {
              console.log(
                "got poll update, aggregation: ",
                getAggregateVotesInPollMessage({
                  message: pollCreation,
                  pollUpdates: update.pollUpdates,
                })
              );
            }
          }
        }
      }
    }
  );

  return sock;

  async function getMessage(key) {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid, key.id);
      return msg?.message || undefined;
    }

    // only if store is present
    return proto.Message.fromObject({});
  }
};

export { whatsappInit, sock };