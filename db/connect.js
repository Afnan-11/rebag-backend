import chalk from 'chalk'
import mongoose from 'mongoose'
const clusterPassord = 'O23N1Kb88YKNA3pI'
const uri =
  'mongodb+srv://nisarahmad66dev:O23N1Kb88YKNA3pI@mydatabase.klodw.mongodb.net/?retryWrites=true&w=majority&appName=myDatabase'

export default async function connectDB() {
  try {
    console.log('Connecting to database...')

    mongoose.set('strictQuery', true)
    await mongoose.connect(uri)

    console.log(chalk.bgMagenta.white('Connected To Database...'))
  } catch (error) {
    console.log(chalk.bgRed.white('DB connection failed...', error.message))
    throw error
  }
}
