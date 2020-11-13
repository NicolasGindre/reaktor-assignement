const apiUrl = "https://bad-api-assignment.reaktor.com/"
const productNode = document.getElementById("products")
const spinnerNode = document.getElementById("spinner-container")

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
		productsHtml.push(products[i]["id"])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["type"])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["name"])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["color"][0])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["price"])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["manufacturer"])
		productsHtml.push('</td><td>')
		productsHtml.push(products[i]["availability"])
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
