import express from 'express'
import cors from 'cors'
import users from './routes/users.js'
import { auth } from 'express-openid-connect'
const PORT = process.env.PORT || 5050
const app = express()

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000',
  clientID: '5s3XVJyyitlnFbuxm3hFma9KbB0Be4Lb',
  issuerBaseURL: 'https://dev-bzeg0fvzo2ki8xtv.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'DELETE', 'PATCH'] }))
app.use(express.json())
app.use('/users', users)
// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
	res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

app.listen(3000, () => {
	console.log(`Listening on localhost3000`)
  })

export default app