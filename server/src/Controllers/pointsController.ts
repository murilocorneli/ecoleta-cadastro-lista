import { Request, Response } from 'express';
import knex from '../database/connection'


class PointsController {

    async Show(req: Request, res: Response) {
        const { id } = req.params;

        const point = await knex('points').where('id', id).first();
        if (!point) {
            return res.status(400).json({ message: 'Points Not Found.' });
        }
        const items = await knex('items').join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id).select('items.title');

            const serializedPoint =  {
                    ...point,
                    image_url: `http://localhost:3333/uploads/${point.image}`
                }
       
            return res.json({ point : serializedPoint, items });

    }
    async Create(req: Request, res: Response) {

        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body;

        const trx = await knex.transaction();

        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        }

        const ids = await trx('points').insert(point);

        const pointItems = items.split(',')
        .map((item: String) =>Number(item.trim()))
        .map((item_id: number) => {
            return {
                item_id,
                point_id: ids[0]
            }
        })

        await trx('point_items').insert(pointItems);

        trx.commit();

        return res.json({
            id: ids[0],
            ...point
        })



    }
    async List (req: Request, res: Response){
        const points = await knex('points').select('*');
        return res.json(points);
    }
    async Index(req: Request, res: Response) {
        const { uf, city, items } = req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()))

        const points = await knex('points').join('point_items', 'points.id', '=', 'point_items.point_id')
        .whereIn('point_items.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*')
        
        const serializedPoint = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`
            }
        })

        return res.json(serializedPoint);
    }

}
export default PointsController;