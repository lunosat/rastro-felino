import User from '../../../models/User.js'

const handler = async (ctx) => {
    ctx.replyWithMarkdownV2(`*Bem vindo ${ctx.from.first_name}\\!*
    
_Para rastrear uma encomenda envie o código dela e se quiser um nome para facilitar a identificação\\._

*Exemplo*: \`\`\` NL123456789BR Encomenda especial \`\`\` 
`)

    const user = await User.findOne({ telegramId: ctx.from.id })

    if(!user){
        await User.create({
            telegramId: ctx.from.id
        })
    }
    return
}

handler.command = 'start'
handler.usage = '/start'
handler.help = 'Reiniciar o sistema.'
handler.maintenence = false
handler.admin = false
handler.developer = false
handler.limit = false

export default handler