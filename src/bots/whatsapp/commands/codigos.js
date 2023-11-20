import User from '../../../models/User.js'

const handler = async (sock, id, args) => {
    try {
        const user = await User.findOne({ whatsappId: id })

        let list = ''

        if(user.packages.length === 0){
            let text = `*Nenhum código cadastrado!*
            
_Para cadastrar seu código basta enviar o mesmo em uma mensagem de texto comum, se desejar pode enviar um nome para melhorar sua identificação._

*Exemplo:* LN12345678BR Encomenda do João`
            sock.sendMessage(id, { text })
            return
        }
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
        sock.sendMessage(id, { text })

    } catch (error) {
        console.log(error)
    }
    return
}

export { handler }