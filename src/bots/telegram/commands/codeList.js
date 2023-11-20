import User from '../../../models/User.js'
import formatMarkdownV2 from '../../../helpers/formatMarkdownV2.js'

const handler = async (ctx) => {
    try {
        const user = await User.findOne({ telegramId: ctx.from.id })

        let list = ''

        user.packages.forEach(e => {
            list += `
*📦 ${e.name} - ${e.code}*
*🚚 Última atualização:* _${e.lastStatus}_
`
        })

        const text = `*Seus pacotes*
${list}
_Para remover algum pacote de nosso monitoramento utilize o comando /remover_
`
        ctx.replyWithMarkdownV2(formatMarkdownV2(text))

    } catch (error) {
        console.log(error)
    }
    return
}

handler.command = 'codigos'
handler.usage = ''
handler.help = 'Obtenha ajuda para usar nosso bot.'
handler.maintenence = false
handler.admin = false
handler.developer = false
handler.limit = false

export default handler