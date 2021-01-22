const express = require("express")
const app = express()
const path = require("path")
const port = process.env.PORT || 3000

const bad_api = require("./bad-api")

app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/index.html"))
})
app.get("/products/:category", async (req, res) => {
	try {
		let category = req.params.category
		let products = await bad_api.getProducts(category)
		res.json(products)
	} catch(err) {
		console.log(err)
		res.status(500).json({ err: err.toString() })
	}
})

app.listen(port, () => {
	console.log(`listening on ${ port }`)
})

refreshCache()
setInterval(refreshCache, 300000)
// setInterval(refreshCache, 20000)
function refreshCache()
{
	bad_api.refreshCache()
}
