import { Controller, Get, Post, Body, Param, UseGuards, Req, Res, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UsersGuard } from '../user/user.guards';
import { Request, Response } from 'express';
import { error } from 'console';
import { ValidateDto } from './dto/validate.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @UseGuards(UsersGuard)
  @Post()
  async create(@Body() createEventDto: CreateEventDto, @Req() req: Request, @Res() res: Response) {

    const user = req['user'] as { id: string; username: string; role: string };

    const CreateEvent = await this.eventsService.create({ ...createEventDto, userId: user.id });


    if ('error' in CreateEvent) {

      if (CreateEvent.error === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).send('User not found')
      }

      if (CreateEvent.error === 'Event same day') {
        return res.status(HttpStatus.UNAUTHORIZED).send('Event same day')
      }

      if (CreateEvent.error === 'Event same week') {
        return res.status(HttpStatus.UNAUTHORIZED).send('Event same week')
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.CREATED).json(CreateEvent);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(UsersGuard)
  @Post('/:id/validate')
  async validate(
    @Param() { id: eventId }: ValidateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId, role } = req['user'] as { id: string; role: string }

    if (role !== 'Admin' && role !== 'ProjectManager') {
      return res.status(HttpStatus.UNAUTHORIZED).send('You are not an Admin or ManagerEmployee')
    }

    const eventValidated = await this.eventsService.validate(eventId, userId, role);

    if ('error' in eventValidated) {
      if (eventValidated.error === 'User not allowed') {
        return res.status(HttpStatus.UNAUTHORIZED).send('User not allowed');
      }

      if (eventValidated.error === 'Event not found') {
        return res.status(HttpStatus.NOT_FOUND).send('Event not found');
      }

      if (eventValidated.error === 'Event already handled') {
        return res.status(HttpStatus.UNAUTHORIZED).send("Event already handled");
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res
      .status(HttpStatus.CREATED).json(eventValidated);
  }

  @UseGuards(UsersGuard)
  @Post('/:id/decline')
  async decline(
    @Param() { id: eventId }: ValidateDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { id: userId, role } = req['user'] as { id: string; role: string }

    if (role !== 'Admin' && role !== 'ProjectManager') {
      return res.status(HttpStatus.UNAUTHORIZED).send('You are not an Admin or ManagerEmployee')
    }

    const eventValidated = await this.eventsService.decline(eventId, userId, role);

    if ('error' in eventValidated) {
      if (eventValidated.error === 'User not allowed') {
        return res.status(HttpStatus.UNAUTHORIZED).send('User not allowed');
      }

      if (eventValidated.error === 'Event not found') {
        return res.status(HttpStatus.NOT_FOUND).send('Event not found');
      }

      if (eventValidated.error === 'Event already handled') {
        return res.status(HttpStatus.UNAUTHORIZED).send("Event already handled");
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res
      .status(HttpStatus.CREATED).json(eventValidated);
  }
}
