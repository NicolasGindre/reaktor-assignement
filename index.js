const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 3000

const bad_api = require('./bad-api')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'))
})
app.get('/products/:category', async (req, res) => {
	try {
		var category = req.params.category
		var products = await bad_api.getProducts(category)
		res.json(products)
	} catch(err) {
		console.log(err)
		res.status(500).json({ err: err.toString() })
	}
})

app.listen(port, () => {
	console.log(`listening on ${ port }`)
})
