import axios from "axios"
import User from "../models/User.js"
import dotenv from 'dotenv'

dotenv.config()

class Tracker {
    constructor(){
        this.url = `https://api.linketrack.com/track/json?user=${process.env.LT_USER}&token=${process.env.LT_TOKEN}&codigo=`
    }

    verifyCode = async (code) => {
        try {
            const res = await axios.get(this.url + code)

            if(res.status === 200){
                return {
                    status: 'success',
                    data: res.data
                }
            } else {
                return {
                    status: 'error'
                }
            }
        } catch (error) {
            return {
                status: 'error'
            }
        }
    }
}

export default Tracker