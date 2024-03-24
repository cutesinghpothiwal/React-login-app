import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connect } from './database/conn.js';
import router from './router/route.js';

const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-powered-by');

//port on which the program will run
const port = 8000;

// API requests
app.use('/api', router);


// connection to the database
(async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`The server has started on port http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();


