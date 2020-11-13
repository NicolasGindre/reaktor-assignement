const apiUrl = "https://bad-api-assignment.reaktor.com/"
const productNode = document.getElementById("products")
const spinnerNode = document.getElementById("spinner-container")
const attributes = ["id", "type", "name", "color", "price", "manufacturer", "availability"]

async function displayProducts(category) {

	productNode.innerHTML = ''
	spinnerNode.classList.add("loader");
	var products = await fetchProducts(category)

	var manufacturers = new Array()
	for (var i=0; i<products.length; i++){

		var manufacturer = products[i]["manufacturer"]
		if (!manufacturers.includes(manufacturer)) {
			manufacturers.push(manufacturer)
		}
	}
	products = await mergeAvailabilityToProducts(products, manufacturers)

	var productsHtml = new Array()
	for (var i=0; i<products.length; i++){
		productsHtml.push('<tr><td>')
		for (var attribute of attributes) {
			productsHtml.push(products[i][attribute])
			productsHtml.push('</td><td>')
		}
		productsHtml.pop()
		productsHtml.push('</td></tr>')
	}
	spinnerNode.classList.remove("loader");
	productNode.innerHTML = productsHtml.join('')
}

async function mergeAvailabilityToProducts(products, manufacturers) {

	const promises = manufacturers.map(async manufacturer => {
		var response = await fetch(apiUrl +"availability/"+ manufacturer)
		var responseJson = await response.json()
		var manufacturerAvailability = responseJson["response"]
		if (!Array.isArray(manufacturerAvailability)) {
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
		var parser = new DOMParser()
		var availabilityXML = parser.parseFromString(availabilityObj["DATAPAYLOAD"], 'text/xml')
		return availabilityXML.getElementsByTagName("INSTOCKVALUE")[0].childNodes[0].nodeValue
	}
	catch(err) {
		return "unknown"
	}
}

async function fetchProducts(category) {
	var response = await fetch(apiUrl +"products/"+ category)
	var products = await response.json()
	return products
}
