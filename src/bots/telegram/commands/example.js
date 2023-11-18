const handler = async (ctx) => {
    ctx.reply('Text commands')
}

handler.command = 'test'
handler.usage = ''
handler.help = 'Obtenha ajuda para usar nosso bot.'
handler.maintenence = false
handler.admin = false
handler.developer = false
handler.limit = false

export default handler