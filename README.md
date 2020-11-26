# reaktor-assignment
This is my solution to the Reaktor assignment about the warehouse application.

I tried to keep it as minimal as possible. The required dependencies are node, express.js, node-cache, axios and fast-xml-parser.

On the client there are no framework or librairies. Only pure javascript.
The css for the table has been shamelessly copy pasted from the internet.

The application should work with any modern browser. It can be accessed [here](https://reaktor-assignment-warehouse.herokuapp.com/).

# Notes on The bad-api 
Apart from the generally bad design of the api, there are two things that I noticed and were problematic when developing our app.

- The product ID when GETting products is in lower case while the one when GETting availability is upper case. I simply made it all to upper case so that it can find the right product availability.

- Some calls to availability sometimes returns a string ("[]") instead of a list of availability. I made a check that the result is a list, otherwise the availability will be "unknown".

# Performances considerations
We went for a single page application solution for simplicity and slightly better performances.
The client is calling the server which is then calling the bad-api.

The bad-api answers slowly so we have to minimise the number of calls made to it, especially sequential ones. Unfortunately, we do not know the manufacturers used in our products before we first GET /products. This call is not the most time consuming though so we would only save about 100 ms if there was a way to know the manufacturers beforehand.
Once we know our manufacturers, we can then GET each manufacturer availability. All the calls to /availability are made in parallel so that the waiting time is minimal.

Having the cache made the application much faster after the first request, as we could expect.

The data returned by the bad-api is quite big, up to almost 1MB for some requests. Even though the main blocking point are the calls to /availability, we need to be efficient when displaying the HTML table.

We made a loop over the data that is concatenating the HTML (to be rendered) in an array of strings, and only when we are finished looping over the data we join all the concatenated strings into a big string and set it as HTML in our table. This should be the fastest way of displaying our data as HTML.

# What next
If this project was a real life project that had to be maintained in a long term fashion, here are a few things that should be done :

- Testing. This is probably the most important since as our application is growing, it becomes more and more difficult, time consuming and prone to errors to manually test it.

- Using a framework on the client. Using pure javascript is efficient but if we grow our application it will very quickly become difficult to develop it. I was hesitating using Vue.js which is a framework that I know, but I decided that it was not worth it for this little exercise.

- Duplicate the data on our server. It is possible to synchronise the data every minute or so between our bad-api and our server. If we really have to use this bad-api, it will become necessary to get rid of the communication between our clients and our bad-api, especially if we have to deal with a broader range of clients. Duplicating the data is generally bad, but in that situation the advantages of doing so would largely overcome the inconvenients. It would allow us to isolate the bad-api problems so that it doesn't affect other services, and would be a first step towards potentially replacing it with something good in the future while still having a working product in the meantime.
