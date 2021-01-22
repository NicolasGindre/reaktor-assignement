# reaktor-assignment
This is my solution to the [Reaktor assignment](https://www.reaktor.com/junior-dev-assignment/) about the warehouse facility.

I tried to keep it as minimal as possible. The required dependencies are node, express.js, node-cache, axios and fast-xml-parser.

On the client there are no framework or librairies. Only pure javascript.
The css for the table has been shamelessly copy pasted from the internet.

The application should work with any modern browser. It can be accessed [here](https://reaktor-assignment-warehouse.herokuapp.com/).

# Notes on The bad-api 
Apart from the generally bad design of the api, there are two things that I noticed and were problematic when developing our app.

- The product ID when GETting products is in lower case while the one when GETting availability is upper case. I simply made it all to upper case so that it can find the right product availability.

- Some calls to availability sometimes returns a striasasng ("[]") instead of a list of availability. I made a check that the result is a list, otherwise the availability will be "unknown". UPDATE : Now when it does not return a list, it will try to request again the bad-api until it gets the correct data (5 times max).

# Performances considerations
I partly rewrote this part since using a cache made the performance problematic different.

We went for a single page application solution for simplicity and slightly better performances.

To get the data, the server is periodically fetching it from the bad-api and putting it in a cache. When our client needs the data, it is directly served through our cache. That way even though our data is going through a slow server before getting served to the client, the use of a cache makes our application independant from the bad-api bad performances. We save a sustantial amount of time thanks to the cache and we should have went for this in the first place.

The cache is refreshed every 5 mins from the bad-api. When it is refreshing, our application can be a little slower so we tried to make this as fast as possible as well. For this we added a temporary cache on the availability as well so that we do not request them for every product.

The data returned by the bad-api is quite big, up to almost 1MB for some requests. Even though the main blocking point are the calls to /availability, we need to be efficient when displaying the HTML table.

We made a loop over the data that is concatenating the HTML (to be rendered) in an array of strings, and only when we are finished looping over the data we join all the concatenated strings into a big string and set it as HTML in our table. This should be the fastest way of displaying our data as HTML.

# What next
If this project was a real life project that had to be maintained in a long term fashion, here are a few things that should be done :

- Testing. This is probably the most important since as our application is growing, it becomes more and more difficult, time consuming and prone to errors to manually test it.

- Using a framework on the client. Using pure javascript is efficient but if we grow our application it will very quickly become difficult to develop it. I was hesitating using Vue.js which is a framework that I know, but I decided that it was not worth it for this little exercise.

- Duplicate the data on our server. It is possible to synchronise the data every minute or so between our bad-api and our server. If we really have to use this bad-api, it will become necessary to get rid of the communication between our clients and our bad-api, especially if we have to deal with a broader range of clients. Duplicating the data is generally bad, but in that situation the advantages of doing so would largely overcome the inconvenients. It would allow us to isolate the bad-api problems so that it doesn't affect other services, and would be a first step towards potentially replacing it with something good in the future while still having a working product in the meantime.

UPDATE : Now using cache, we have something more performant but in case we need to make a new request or to modify an existing one, it might still be difficult to do so. That is why having our own database designed in a good fashion would still be beneficial for the long run.
