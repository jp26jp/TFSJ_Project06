const Crawler    = require("crawler")
const fs         = require("fs")
const path       = require("path")
const urlBase    = "http://shirts4mike.com/"
const urlPage    = "shirts.php"
const initialUrl = urlBase + urlPage

/*
 Source for folder creation function: https://stackoverflow.com/a/24311711/4373927
 */
const mkdirSync = dirPath => {
	try {
		fs.mkdirSync(dirPath)
	} catch (err) {
		if (err.code !== "EEXIST") {
			throw err
		}
	}
}

mkdirSync(path.resolve("./data"))

var crawler = new Crawler({
							  maxConnections: 10,
							  // This will be called for each crawled page
							  callback      : function (error, response, done) {
								  if (error) {
									  console.log(error)
								  } else {
									  let products    = []
									  const $         = response.$
									  const $products = $(".products li")

									  for (let i = 0; i < $products.length; i++) {
										  let product          = new Product()
										  const $childElements = $products[i].children
										  for (let i = 0; i < $childElements.length; i++) {

											  // if true, current child element is a link
											  if ($childElements[i].name === "a") {
												  const productUrl = urlBase + $childElements[i].attribs.href
												  product.url      = productUrl

												  crawler.direct({
																	 uri             : productUrl,
																	 skipEventRequest: false, // defualts to true, direct requests won't trigger Evnet:'request'
																	 callback        : function (error, response) {
																		 if (error) {console.log(error)}
																		 else {
																			 const $     = response.$
																			 const price = $("#content h1 .price").text()
																			 const title = $("#content h1").text().replace(price + " ", "")

																			 product.price = price;
																			 product.title = title;
																		 }
																	 }
																 })

											  }
										  }

										  products.push(product)
									  }

									  fs.appendFile("index.html", $products, error => {
										  if (error) {throw error}

										  else {
											  console.log(products)
										  }
									  })
								  }
								  done()
							  }
						  })

crawler.queue(initialUrl)

class Product {
	constructor() {
		this._price = 0
		this._title = "Title"
		this._url   = initialUrl
		this._image = ""
	}

	set price(value) {
		this._price = value
	}

	set title(value) {
		this._title = value
	}

	set url(value) {
		this._url = value
	}

	set image(value) {
		this._image = value
	}
}