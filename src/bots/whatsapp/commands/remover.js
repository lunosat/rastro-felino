import User from "../../../models/User.js";

const handler = async (sock, id, args) => {
    // Lógica do comando ping
    let code = args[0]

    try {
        const user = await User.findOne({ whatsappId: id })

        const codeCheck = user.packages.find((e) => e.code === code)
        if (!codeCheck) {
            let text = `*Código não encontrado!*
            
_Tenha certeza de que seguiu o formato correto do comando e que o código está cadastrado em nosso sistema._
            
*Exemplo:* /remover NL123456789BR
            
*Sua lista de códigos cadastrados:* /codigos`
            sock.sendMessage(id, { text })
        } else {
            user.packages.remove(codeCheck)
            user.save()
            let text = `_O pacote ${codeCheck.code} foi removido com sucesso de nosso sistema!_`
            sock.sendMessage(id, { text })
        }
    } catch (error) {
        console.log(error)
    }
};

export { handler };
