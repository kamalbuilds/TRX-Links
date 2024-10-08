// start the server using express
const express = require('express')
const cors = require('cors')
const controllers = require('./controllers.js')
const app = express()
const port = 8000

app.use(cors())
app.use(express.json())

app.get('/', controllers.test)
app.post('/generateTRONTransferlink', controllers.generateTRONTransferlink)
app.post('/generateTRX20Transferlink', controllers.generateTRX20Transferlink)
app.post('/storeToIpfsviapinata', controllers.storeToIpfsviapinata)

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
