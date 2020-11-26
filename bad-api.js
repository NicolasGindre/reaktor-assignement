const NodeCache = require("node-cache")
const myCache = new NodeCache()
// const CACHE_TIMEOUT = 300

const axios = require("axios")
const xmlParser = require('fast-xml-parser')

const apiUrl = "https://bad-api-assignment.reaktor.com/"

module.exports = {
	getProducts: async function(category) {
		var products = myCache.get('CAT_'+ category)
		if (products == undefined){
			products = await fetchProducts(category)
		} else {
			return products
		}

		var manufacturers = new Array()
		for (var i=0; i<products.length; i++){

			var manufacturer = products[i]["manufacturer"]
			if (!manufacturers.includes(manufacturer)) {
				manufacturers.push(manufacturer)
			}
		}
		var {products, api_error} = await mergeAvailabilityToProducts(products, manufacturers)
		if (!api_error) {
			myCache.set('CAT_'+ category, products)
		}
		return products
	}
}

async function mergeAvailabilityToProducts(products, manufacturers) {

	var {availabilities, api_error} = await getAvailabilities(manufacturers)

	for (var i = 0; i < products.length; i++) {
		var manufacturerIndex = manufacturers.indexOf(products[i]["manufacturer"])
		var manufacturerAvailability = availabilities[manufacturerIndex]
		var availabilityObj = manufacturerAvailability.find(
			o => o.id.toUpperCase() == products[i]["id"].toUpperCase()
		)
		products[i]["availability"] = getAvailability(availabilityObj)
		products[i]["color"] = products[i]["color"][0]
	}
	return {products, api_error}
}

async function getAvailabilities(manufacturers) {

	var api_error = false
	var promises = manufacturers.map(async manufacturer => {
		var manufacturerAvailability = myCache.get('MAN_'+ manufacturer)
		if (manufacturerAvailability != undefined){
			return manufacturerAvailability
		}
		var response = await axios.get(apiUrl +"availability/"+ manufacturer)
		var responseJson = response.data
		manufacturerAvailability = responseJson["response"]
		if (!Array.isArray(manufacturerAvailability)) {
			console.log("bad-api did not return what was expected.")
			api_error = true
			return []
		}
		myCache.set('MAN_'+ manufacturer, manufacturerAvailability)
		return manufacturerAvailability
	})

	var availabilities = await Promise.all(promises)
	return {availabilities, api_error}
}

function getAvailability(availabilityObj) {

	try {
		var jsonAvail = xmlParser.parse(availabilityObj["DATAPAYLOAD"])
		var availability = jsonAvail["AVAILABILITY"]["INSTOCKVALUE"]
		return availability
	} catch(err) {
		return "unknown"
	}
}

async function fetchProducts(category) {
	var response = await axios.get(apiUrl +"products/"+ category)
	var products = response.data
	return products
}
