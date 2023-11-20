import User from "../../../models/User.js"
import formatMarkdownV2 from "../../../helpers/formatMarkdownV2.js"

const handler = async (ctx) => {
    let text = ctx.message.text.split(' ')
    let code = text[1]

    const id = ctx.from.id

    try {
        const user = await User.findOne({ telegramId: id })

        const codeCheck = user.packages.find((e) => e.code === code)
        if (!codeCheck) {
            ctx.replyWithMarkdownV2(formatMarkdownV2(`*Código não encontrado!*
            
_Tenha certeza de que seguiu o formato correto do comando e que o código está cadastrado em nosso sistema._

*Exemplo:* /remover NL123456789BR

*Sua lista de códigos cadastrados:* /codigos`))
        } else {
            user.packages.remove(codeCheck)
            user.save()

            ctx.replyWithMarkdownV2(formatMarkdownV2(`_O pacote ${codeCheck.code} foi removido com sucesso de nosso sistema!_`))
        }
    } catch (error) {
        console.log(error)
        ctx.reply('Não sei o que aconteceu... Mas não foi bom.')
    }
}

handler.command = 'remover'
handler.usage = '/remover (Código)'
handler.help = 'Remova um código de nosso sistema.'
handler.maintenence = false
handler.admin = false
handler.developer = false
handler.limit = false

export default handler