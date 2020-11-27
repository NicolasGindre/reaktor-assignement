const NodeCache = require("node-cache")
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 0, useClones: false })

const axios = require("axios")
const xmlParser = require('fast-xml-parser')

const badApiUrl = "https://bad-api-assignment.reaktor.com/"

module.exports = {
	refreshCache: async function() {
		console.log("Refreshing cash...")
		await module.exports.getProducts("shirts", true)
		// Here it is actually better to await the first request instead of doing a parallel
		// request because we want to use the availability data stored in the cache.
		var promises = ["jackets", "accessories"].map(async category => {
			return module.exports.getProducts(category, true)
		})
		var allProducts = await Promise.all(promises)
		console.log("Cash refreshed ! I'm rich !!")
	},

	getProducts: async function(category, flushCache=false) {
		var products = myCache.get('CAT_'+ category)
		if (products != undefined && !flushCache){
			return products
		}
		products = await fetchProducts(category)

		var manufacturers = new Array()
		for (var i=0; i<products.length; i++){

			var manufacturer = products[i]["manufacturer"]
			if (!manufacturers.includes(manufacturer)) {
				manufacturers.push(manufacturer)
			}
		}
		var availabilities = await getAvailabilities(manufacturers)
		var products = await mergeAvailabilityToProducts(products, manufacturers, availabilities)
		myCache.set('CAT_'+ category, products)
		return products
	}
}

async function getAvailabilities(manufacturers) {

	var promises = manufacturers.map(async manufacturer => {

		var manufacturerAvailability = myCache.get('MAN_'+ manufacturer)
		if (manufacturerAvailability != undefined){
			console.log("cache was used for availability of "+ manufacturer)
			return manufacturerAvailability
		}
		manufacturerAvailability = await fetchAvailability(manufacturer, 5)
		myCache.set('MAN_'+ manufacturer, manufacturerAvailability, 200)
		return manufacturerAvailability
	})

	var availabilities = await Promise.all(promises)
	return availabilities
}

async function fetchAvailability(manufacturer, triesLeft=0) {

	var response = await axios.get(badApiUrl +"availability/"+ manufacturer)
	var responseJson = response.data
	manufacturerAvailability = responseJson["response"]
	if (!Array.isArray(manufacturerAvailability)) {
		if (triesLeft > 0) {
			console.log("bad-api did not return an array. Retrying... ("
				+ triesLeft +" left, "+ manufacturer +")")
			return await fetchAvailability(manufacturer, triesLeft-1)
		} else {
			console.log("bad-api did not return what was expected after "+ triesLeft +" tries.")
			return []
		}
	}
	console.log("bad-api successfully returned availability from "+ manufacturer)
	return manufacturerAvailability
}

async function mergeAvailabilityToProducts(products, manufacturers, availabilities) {
	for (var i = 0; i < products.length; i++) {
		var manufacturerIndex = manufacturers.indexOf(products[i]["manufacturer"])
		var manufacturerAvailability = availabilities[manufacturerIndex]
		var availabilityObj = manufacturerAvailability.find(
			o => o.id.toUpperCase() == products[i]["id"].toUpperCase()
		)
		products[i]["availability"] = parseAvailability(availabilityObj)
		products[i]["color"] = products[i]["color"][0]
	}
	return products
}

function parseAvailability(availabilityObj) {

	try {
		var jsonAvail = xmlParser.parse(availabilityObj["DATAPAYLOAD"])
		var availability = jsonAvail["AVAILABILITY"]["INSTOCKVALUE"]
		return availability
	} catch(err) {
		return "unknown"
	}
}

async function fetchProducts(category) {
	var response = await axios.get(badApiUrl +"products/"+ category)
	var products = response.data
	return products
}
