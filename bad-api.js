const NodeCache = require("node-cache")
const myCache = new NodeCache()

const axios = require("axios")
const xmlParser = require('fast-xml-parser')

const apiUrl = "https://bad-api-assignment.reaktor.com/"

module.exports = {
	getProducts: async function(category) {
		var products = await fetchProducts(category)

		var manufacturers = new Array()
		for (var i=0; i<products.length; i++){

			var manufacturer = products[i]["manufacturer"]
			if (!manufacturers.includes(manufacturer)) {
				manufacturers.push(manufacturer)
			}
		}
		products = await mergeAvailabilityToProducts(products, manufacturers)
		return products
	}
}

async function mergeAvailabilityToProducts(products, manufacturers) {

	const promises = manufacturers.map(async manufacturer => {
		var response = await axios.get(apiUrl +"availability/"+ manufacturer)
		var responseJson = response.data
		var manufacturerAvailability = responseJson["response"]
		if (!Array.isArray(manufacturerAvailability)) {
			console.log("bad-api did not return what was expected.")
			return []
		}
		return manufacturerAvailability
	})

	const availabilities = await Promise.all(promises)

	for (var i = 0; i < products.length; i++) {
		var manufacturerIndex = manufacturers.indexOf(products[i]["manufacturer"])
		var manufacturerAvailability = availabilities[manufacturerIndex]
		var availabilityObj = manufacturerAvailability.find(
			o => o.id.toUpperCase() == products[i]["id"].toUpperCase()
		)
		products[i]["availability"] = getAvailability(availabilityObj)
		products[i]["color"] = products[i]["color"][0]
	}
	return products
}

function getAvailability(availabilityObj) {

	try {
		var jsonAvail = xmlParser.parse(availabilityObj["DATAPAYLOAD"])
		var availability = jsonAvail["AVAILABILITY"]["INSTOCKVALUE"]
		return availability
	} catch(err) {
		console.log(err)
		return "unknown"
	}
}

async function fetchProducts(category) {
	var response = await axios.get(apiUrl +"products/"+ category)
	var products = response.data
	return products
}
