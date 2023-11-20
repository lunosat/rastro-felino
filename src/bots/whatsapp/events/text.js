import Tracker from "../../../linketrack/tracker.js"
import User from "../../../models/User.js"

const tracker = new Tracker()

const eventText = async (msg, sock, id) => {
    try {
        let user = await User.findOne({ whatsappId: id })

        if(!user){
            user = User.create({ whatsappId: id })
        }

        let message = msg.split(' ')
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

            sock.sendMessage(id, { text })
        }

        // const user = await User.findOne({ whatsappId: id })

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
        let text = `*Não foi possível localizar sua encomenda!*
        
_Verifique seu código e tente novamente, lembre-se que a transportadora pode levar até 24 horas para ativar seu código de rastreio após ser postado._`
        sock.sendMessage(id, { text })
        console.log(error)
    }
}

export default eventText