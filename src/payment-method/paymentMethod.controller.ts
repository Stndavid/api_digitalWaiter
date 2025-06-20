import { Controller, Get, Post, Put, Delete, Patch, Param, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PaymentMethodService } from './paymentMethod.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll() {
    return this.paymentMethodService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.paymentMethodService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() data: any, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede crear métodos de pago');
    }
    return this.paymentMethodService.create(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede actualizar métodos de pago');
    }
    return this.paymentMethodService.update(id, data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede eliminar métodos de pago');
    }
    return this.paymentMethodService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/active')
  async setActive(@Param('id') id: number, @Body('activo') activo: boolean, @Req() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo el administrador puede cambiar el estado de los métodos de pago');
    }
    return this.paymentMethodService.setActive(Number(id), activo);
  }
}
