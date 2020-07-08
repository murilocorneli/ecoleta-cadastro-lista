import express from 'express';
import cors from 'cors'
import routes from './routes';
import path from 'path'
import { errors } from 'celebrate'

const App = express();
App.use(cors());
App.use(express.json());
App.use(routes);

App.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))
App.use(errors())
App.listen(3333);