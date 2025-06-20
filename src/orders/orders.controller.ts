import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Patch,
  Delete,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OrdersService } from './orders.service';

@Controller('ordenes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('admin', 'mesero', 'cliente')
  async create(@Body() dto: any, @Req() req) {
    const user = req.user;
    return this.ordersService.create(dto, user);
  }

  @Get()
  @Roles('admin', 'mesero', 'cliente')
  async findAll(@Req() req) {
    const user = req.user;
    return this.ordersService.findAll(user);
  }

  @Get('/historial')
  @Roles('admin', 'mesero', 'cliente')
  async historial(@Req() req) {
    if (req.user.role === 'admin') {
      // Admin: solo historial de su restaurante
      return this.ordersService.findByOwner(req.user.userId);
    }
    if (req.user.role === 'mesero') {
      // Mesero: solo historial de restaurantes donde es mesero
      return this.ordersService.findByMesero(req.user.userId);
    }
    // Cliente: solo su historial
    return this.ordersService.findByCliente(req.user.userId);
  }

  @Get(':id')
  @Roles('admin', 'mesero', 'cliente')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const user = req.user;
    return this.ordersService.findOne(id, user);
  }

  @Put(':id')
  @Roles('admin', 'mesero')
  async replace(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @Req() req,
  ) {
    const user = req.user;
    return this.ordersService.replace(id, dto, user);
  }

  @Patch(':id')
  @Roles('admin', 'mesero')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() partialDto: Partial<{ estado: string }>,
    @Req() req,
  ) {
    const user = req.user;
    return this.ordersService.update(id, partialDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'mesero')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const user = req.user;
    return this.ordersService.remove(id, user);
  }
}
