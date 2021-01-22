const NodeCache = require("node-cache")
const myCache = new NodeCache({ stdTTL: 0, checkperiod: 0, useClones: false })

const axios = require("axios")
const xmlParser = require("fast-xml-parser")

const badApiUrl = "https://bad-api-assignment.reaktor.com/"

module.exports = {
	refreshCache: async function() {
		console.log("Refreshing cash...")
		await module.exports.getProducts("shirts", true)
		await module.exports.getProducts("jackets", true)
		await module.exports.getProducts("accessories", true)

		// let promises = ["shirts", "jackets", "accessories"].map(async category => {
		// 	let products = await module.exports.getProducts(category, true)
		// 	// myCache.set("CAT_"+ category, products)
		// 	return products
		// })
		// await Promise.all(promises)
		console.log("Cash refreshed ! I'm rich !!")
	},

	getProducts: async function(category, flushCache=false) {
		let products = myCache.get("CAT_"+ category)
		if (products !== undefined && !flushCache){
			return products
		}
		products = await fetchProducts(category)

		let manufacturers = new Array()
		for (let i=0; i<products.length; i++){

			const manufacturer = products[i]["manufacturer"]
			if (!manufacturers.includes(manufacturer)) {
				manufacturers.push(manufacturer)
			}
		}
		let availabilities = await getAvailabilities(manufacturers)
		products = await mergeAvailabilityToProducts(products, manufacturers, availabilities)
		myCache.set("CAT_"+ category, products)
		return products
	}
}

async function getAvailabilities(manufacturers) {

	let promises = manufacturers.map(async manufacturer => {

		// let manufacturerAvailability = myCache.get("MAN_"+ manufacturer)
		// if (manufacturerAvailability != undefined){
		// 	console.log("cache was used for availability of "+ manufacturer)
		// 	return manufacturerAvailability
		// }
		let manufacturerAvailability = await fetchAvailability(manufacturer, 5)
		// myCache.set("MAN_"+ manufacturer, manufacturerAvailability, 200)
		return manufacturerAvailability
	})

	let availabilities = await Promise.all(promises)
	return availabilities
}
const MaxTries = 5
async function fetchAvailability(manufacturer, triesLeft=MaxTries) {

	let response = await axios.get(badApiUrl +"availability/"+ manufacturer)
	let responseJson = response.data
	let manufacturerAvailability = responseJson["response"]
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
	for (let i = 0; i < products.length; i++) {
		let manufacturerIndex = manufacturers.indexOf(products[i]["manufacturer"])
		let manufacturerAvailability = availabilities[manufacturerIndex]
		let availabilityObj = manufacturerAvailability.find(
			o => o.id.toUpperCase() == products[i]["id"].toUpperCase()
		)
		products[i]["availability"] = parseAvailability(availabilityObj)
		products[i]["color"] = products[i]["color"][0]
	}
	return products
}

function parseAvailability(availabilityObj) {

	try {
		let jsonAvail = xmlParser.parse(availabilityObj["DATAPAYLOAD"])
		let availability = jsonAvail["AVAILABILITY"]["INSTOCKVALUE"]
		return availability
	} catch(err) {
		return "unknown"
	}
}

async function fetchProducts(category) {
	let response = await axios.get(badApiUrl +"products/"+ category)
	let products = response.data
	return products
}
