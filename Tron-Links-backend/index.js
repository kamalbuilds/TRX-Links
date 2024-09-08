// start the server using express
const express = require('express')
const cors = require('cors')
const controllers = require('./controllers.js')
const app = express()
const port = 8000

app.use(cors())
app.use(express.json())

app.get('/', controllers.test)
app.post('/storeToIpfsviapinata', controllers.storeToIpfsviapinata)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
