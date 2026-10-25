# Mpesa-Daraja-Api-NODE.JS

## Run the project

1. Install Node.js 18 or newer.
2. Install dependencies with `npm install`.
3. Create a `.env` file in the project root and add your Daraja credentials:

   ```env
   CONSUMER_KEY=your_consumer_key
   CONSUMER_SECRET=your_consumer_secret
   NGROK_CALLBACK_URL=https://your-public-callback-url
   ```

4. Start the server with `npm start`, or use `npm run dev` while developing.
5. Open http://localhost:5000.

The server and API router use native ES modules (`.mjs`). The root route is
`/`, and the API routes are under `/api` (for example, `/api/home`).

How to contribute

1. Fork the project

2. Clone the project

3. Create a new branch

4. Make your changes

5. Commit your changes

6. Push your changes

7. Create a pull request

8. Wait for your pull request to be merged
