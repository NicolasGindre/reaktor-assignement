const products = [
  {"id":"f8016f8e3897cbd129ec0fde","type":"shirts","name":"NYXBE BRIGHT METROPOLIS","color":["yellow"],"price":44,"manufacturer":"derp"},
  {"id":"a9262d3e27a19f6b9de","type":"shirts","name":"HUNKOX RAIN","color":["black"],"price":56,"manufacturer":"abiplos"},
  {"id":"1358bf45194ae55f4a251b","type":"shirts","name":"REPBE LIGHT","color":["green"],"price":21,"manufacturer":"nouke"}
]

// function getProducts(category) {

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
    productsHtml.push(getAvailability(products[i]["id"]))
    productsHtml.push('</td></tr>')
  }
  document.getElementById("products").innerHTML = productsHtml.join('')
// }

function getAvailability(productId) {
  return "available"
}
