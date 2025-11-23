import { Request, Response } from 'express';
import data from '../models/data.model';

export async function getAllLocations(req: Request, res: Response) {
    res.json({ data: await data.cities() })
}