import { Schema, model } from "mongoose";

const packageSchema = new Schema({
    code: {
        type: String
    }, 
    name: {
        type: String
    },
    lastVerifield: {
        type: Date,
        default: Date.now
    },
    lastStatus: {
        type: Object
    }
})

const userSchema = new Schema({
    telegramId: {
        type: String,
        unique: true
    },
    whatsappId: {
        type: String,
        unique: true
    },
    packages: {
        type: [packageSchema]
    },
    banned: {
        type: Boolean,
        default: false
    }
})

const User = model('User', userSchema)

export default User