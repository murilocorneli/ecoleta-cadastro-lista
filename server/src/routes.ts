
import express from 'express';
import PointsController from './Controllers/pointsController';
import ItemsController from './Controllers/itemsController';
import multer from 'multer';
import multerConfig from '../src/config/multer'
import { celebrate, Joi } from 'celebrate';


const routes = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();

const upload = multer(multerConfig);
routes.post('/points', upload.single('image'), celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        items: Joi.string().required()
    })
}, {abortEarly: false}),pointsController.Create)


routes.get('/items', itemsController.Index)
routes.get('/points/:id', pointsController.Show)
routes.get('/pointsFilter', pointsController.Index)
routes.get('/points', pointsController.List)


export default routes;