import Tracker from "../../../linketrack/tracker.js"
import formatMarkdownV2 from "../../../helpers/formatMarkdownV2.js"
import User from "../../../models/User.js"

const tracker = new Tracker()

const eventText = async (ctx) => {
    try {
        let message = ctx.update.message.text.split(' ')
        let code = message[0].trim()
        message.shift()
        let name = message.join(' ')

        const track = await tracker.verifyCode(code)

        if (track.status === 'success') {
            let packagesList = ''
            track.data.eventos.forEach((e, i) => {
                packagesList += `
*🗓️ Data:* _${e.data}_ | *⌚ Hora:* _${e.hora}_
*🗺️ Local:* _${e.local.replace('Local:', '')}_
*📋 Status:* _${e.status}_

`
            })

            let text = `*Encomenda localizada!*

*Eventos registrados até o momento:*
${packagesList}
_Estaremos de olho e lhe avisaremos sobre qualquer mudança no status de seu pacote!_`

            ctx.replyWithMarkdownV2(formatMarkdownV2(text))
        }

        const user = await User.findOne({ telegramId: ctx.from.id })

        const existingPackage = user.packages.find((e) => e.code === track.data.codigo)

        if (!existingPackage) {
            user.packages.push({
                lastStatus: track.data.eventos[0].status,
                code: track.data.codigo,
                lastVerifield: Date.now(),
                name: name
            })
        } else {
            existingPackage.name = name
            existingPackage.lastStatus = track.data.eventos[0].status
            existingPackage.lastVerifield = Date.now()
        }

        await user.save()
    } catch (error) {
        ctx.replyWithMarkdownV2(formatMarkdownV2(`*Não foi possível localizar sua encomenda!*
        
_Verifique seu código e tente novamente, lembre-se que a transportadora pode levar até 24 horas para ativar seu código de rastreio após ser postado._`))
        console.log(error)
    }
}

export default eventText