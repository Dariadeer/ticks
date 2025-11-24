# Tick Sightings Application
By Anton But

## How to launch?
This app requires **Node.js** and **npm** to run. Please install it according to [these instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
1. Go inside the `server` directory:
```sh
cd server
```
2. Install all the packages:
```sh
npm install
```
3. Generate the database schema:
```sh
npx prisma migrate deploy
```
4. Generate the database and its source files:
```sh
npx prisma generate
```
5. Compile TypeScript files into JavaScript:
```sh
npm run build
```
6. Seed the database with the sample data:
```sh
npm run seed
```
7. Run the application:
```sh
npm start
```
8. Open the link prompted in the terminal:
```http
http://localhost:3000
```
9. (Optional) Create a .env file with a port you want to use instead, for example:
```properties
PORT=80
```
10. (Optional) If you know your local IP address, connect to test on a mobile device (same port).
```http
http://192.168.xxx.yyy:3000/
```
11. (Opional) If you experience any issues, you can try out the app hosted online on my AWS EC2 instance:
```http
http://44.201.179.27:4000/
```

## Project outline

### Task decision

For maximum effect, I decided to go with both tasks at the same time. 

Having only back-end would be precieved poorly without a proper visualisation.

Having only front-end would constrain me to process poorly structured data on the client side.

### Architecture

The project follows the classic web-development structure. It has multiple layers of request processing:
- Models to retrieve data from the database
- Controllers to present, post-process the database data, while also dealing with client input validation
- Routers to have a neat and easy-to-follow path structure
- App and database configuration files to start the application
- A folder with retrievable client files

### Additional tools
1. **Back-end** (npm packages):
    - Prisma (database config and interaction)
    - XLSX (.xlsl file reading to seed the DB)
    - Express (a widely used back-end framework)
    - City Dataset from https://simplemaps.com/
2. **Front-end** (downloaded CDN .js files):
    - JQuery (a light-weight front-end library for DOM manipulation)
    - FontAwesome (a source of SVG icons)
    - Leaflet (a powerful tool for map rendering)
    - Chart.js (a beautiful graph visualiser)

### Result
#### Backend
The back-end design was oriented on both the front-end and back-end tasks. 

> Before we continue, I just want to mention that I didn't understand the concept of "severity", so I made it into a characteristic representing relative prevalance among other locations in the same query.

> Optional parameters I marked with a question mark, like `parameter?`. If it is not present, calculations are done accepting any value.

The following endpoints were implemented:
- **GET** `/`
    The gateway for static client file access
- **GET** `/api/ticks`
    Returns a list of tick species, including their name, latin name and id (for further operations).
- **GET** `/api/locations`
    Returns a list of all locations, to provide them in the report form as an input.
- **GET** `/api/ticks/sightings`
    *Query parameters:* `id?`, `severity?`, `after?`, `before?`.
    Returns a list of sighting counts found in any location with the certain tick `id`, count `severity` and timeframe `[after, before]`, as well as metadata about the request.
- **GET** `/api/ticks/trends`
    *Query parameters:* `tickId?`, `locationId?`, `mode`, `after?`, `before?`.

    Returns an array of objects `{time_unit, count}`, where `time_unit` depends on `mode` has to be one amongst `week(0), month(1), *year(2)`. Results are filtered by `tickId`, `locationId` and timeframe `[after, before]`, as well as metadata about the request.
- **POST** `/api/ticks/report-sighting`
    *Body parameters:* `tickId`, `locationId`.

    Creates a new tick sighting with the given parameters and responds with the newly created object. An appropriate error is sent otherwise.

For simple database operations, **prisma client** was used to retrieve, create and filter data. For more complex operations, raw queries had to be employed. For example, this is one used for weekly trend composition:
```sql
SELECT 
    date(date / 1000, 'unixepoch') AS cdate,
    date((date / 604800000 * 604800), 'unixepoch') AS week, COUNT() as count
FROM Sighting
%WHERE%
GROUP BY week;
```
The `%WHERE` bit would be replaced by a parameter filter mentioned above, which is universal for this type of queries.

#### Front-end
I decided to go with a simple HTML/CSS/JS stack due to my familiarity with it, light-weightness, simplicity, flexibility and not needing to build the project, unlike other tools like React.js or Flutter. Additionally, I wanted to take this opportunity to work with JQuery.

The design was heavily inspired by a mock-up attached to the task document. Its functionality allows the user to visualise tick sightings on the map, analyse trends across different timeframes, species and locations, report a sighting to the central database as well as see some useful resources about tick awareness, diversity and counter-measures. The resulting website is well fit for both wide-screen and mobile device viewports.

Ironically, I don't have much to talk about in this part, despite spending most of my time on it. Managing and verifying every interaction once again reminded me how sore this area of Software Engineering can be.

Much better practices should've been used in this, if it wasn't for the low availability. Everything is written in one file, but I managed to design many reusable parts of code, keeping it just under 400 lines. Same goes for CSS and HTML, where a use of frameworks can really be appreciated for its modularity, in contrast to what we have here.

#### Self-reflection

While the app is still not something that would be considered a production-ready product (e. g. one can report thousands of ticks without verification), I am still glad about how it turned out to be. The modern style combined with open-source tools and a good back-end infrastructure worked out nicely together.