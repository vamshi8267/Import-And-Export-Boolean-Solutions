const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const databasePath = path.join(__dirname, 'movieData.db')

const app = express()
app.use(express.json())

let database = null

const initialiationDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server Running at http://local:3000/'))
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initialiationDBAndServer()

const convertMovieDBObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDirectorDBObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies', async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie;
    `
  const movieArray = await database.all(getMoviesQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT
    *
    FROM
        movie
    WHERE
        movie_id = ${movieId};
    `
  const movie = await database.get(getMovieQuery)
  response.send(convertMovieDBObjectToResponseObject(movie))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO
        movie ( direct_id, movie_name, lead_astor )
    VALUES
    (${directorId}, '${movieName}', '${leadActor}');
    `
  await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};
    `
  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id = ${movieId};
    `
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectQuery = `
    SELECT
    *
    FROM
    director;
    `
  const dirextorsArray = await database.all(getDirectQuery)
  response.send(
    dirextorsArray.map(eachDirector =>
      convertDirectorDBObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
    SELECT
    movie_name
    FROM
    movie
    WHERE
    director_id='${directorId}';
    `
  const movieArray = await database.all(getDirectorMovieQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.exports = app
