import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './schemas/log.schema';
import { MenuHistory, MenuHistorySchema } from './schemas/menuHistory.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MongoService } from './mongo.service';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { UserAction, UserActionSchema } from './schemas/userAction.schema';
import { Restaurante, RestauranteSchema } from './schemas/restaurante.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Log.name, schema: LogSchema },
      { name: MenuHistory.name, schema: MenuHistorySchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: UserAction.name, schema: UserActionSchema },
      { name: Restaurante.name, schema: RestauranteSchema },
    ]),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}