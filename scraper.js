const scrapeIt = require("scrape-it"),
      path     = require("path"),
      fs       = require("fs")

const urlBase    = "http://shirts4mike.com/",
      urlPage    = "shirts.php",
      initialUrl = urlBase + urlPage

// make sure "data" folder exists
createDirectory("data")

const date        = new Date(),
      filename    = date.toISOString().slice(0, 10),
      writeStream = fs.createWriteStream(`./data/${filename}.csv`)

// write the headers to the csv
writeStream.write("Title,Price,ImageURL,URL,Time\n")

// scrape the initial url and catch any 404 errors
scrapeIt(initialUrl, {
	products: {
		listItem: ".products li",
		data    : {
			url: {
				selector: "a",
				attr    : "href"
			}
		}
	}
}).then(({data}) => {

	console.log(`${initialUrl} scraped!`)

	data.products.forEach(product => {
		const productUrl = urlBase + product.url

		scrapeIt(productUrl, {
			title: "#content h1",
			price: "#content h1 .price",
			image: {
				selector: "#content .shirt-picture img",
				attr    : "src"
			}
		}, (error, {data}) => {

			console.log("product found!")

			data.title = data.title.replace(data.price + " ", "")
			data.price = data.price.replace("$", "")
			data.image = urlBase + data.image

			const product = new Product(productUrl, data.title, data.price, data.image)

			writeStream.write(product.csvify())
		})
	})
}).catch(error => {
	const message = `[${date}] ${error}`
	fs.appendFile("scraper-error.log", message, error => {if (error) {throw error}})
	console.log(`There’s been a 404 error. Cannot connect to ${initialUrl}`)
})

/**
 * Creates a directory iff one doesn't exist
 * @param folder the name of the folder
 */
function createDirectory(folder) {
	const mkdirSync = dirPath => {
		try {
			fs.mkdirSync(dirPath)
		} catch (err) {
			if (err.code !== "EEXIST") {
				throw err
			}
		}
	}

	mkdirSync(path.resolve(`./${folder}`))
}

/**
 * A class to represent a product
 */
class Product {
	constructor(url, title, price, image) {
		this.url = url
		this.title = title
		this.price = price
		this.image = image
	}

	csvify() {
		return `"${this.title}",${this.price},${this.image},${this.url},${date}\n`
	}
}

