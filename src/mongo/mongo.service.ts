import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from './schemas/log.schema';
import { MenuHistory, MenuHistoryDocument } from './schemas/menuHistory.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Restaurante, RestauranteDocument } from './schemas/restaurante.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
    @InjectModel(MenuHistory.name) private historyModel: Model<MenuHistoryDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Restaurante.name) private restauranteModel: Model<RestauranteDocument>,
  ) {}

  // Métodos para logs
  async createLog(entry: Partial<Log>): Promise<Log> {
    const log = new this.logModel(entry);
    return log.save();
  }

  // Métodos para historial de menú
  async saveMenuHistory(entry: Partial<MenuHistory>): Promise<MenuHistory> {
    const history = new this.historyModel(entry);
    return history.save();
  }

  // Métodos para reseñas
  async addReview(entry: Partial<Review>): Promise<Review> {
    const review = new this.reviewModel(entry);
    return review.save();
  }

  // Métodos para restaurantes
  async createRestaurante(data: Partial<Restaurante>): Promise<Restaurante> {
    const restaurante = new this.restauranteModel(data);
    return restaurante.save();
  }

  async updateHorarioRestaurante(restauranteId: string, horarioAtencion: any[]): Promise<Restaurante | null> {
    return this.restauranteModel.findByIdAndUpdate(
      restauranteId,
      { horarioAtencion },
      { new: true }
    );
  }

  async getRestauranteById(restauranteId: string): Promise<Restaurante | null> {
    return this.restauranteModel.findById(restauranteId);
  }

  async getAllRestaurantes(): Promise<Restaurante[]> {
    return this.restauranteModel.find();
  }

  async asignarMesero(restauranteId: string, meseroId: string): Promise<Restaurante | null> {
    return this.restauranteModel.findByIdAndUpdate(
      restauranteId,
      { $addToSet: { meseros: meseroId } },
      { new: true }
    );
  }
}

