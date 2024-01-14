import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Event } from './entities/event.entity';
import * as dayjs from 'dayjs';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly userService: UserService,
  ) { }

  async canHandleEvent(eventId: string, userId: string, role: string) {
    if (role === 'Employee') {
      return { error: 'User not allowed' } as const;
    }

    const event = await this.eventRepository.findOne({
      where: { id: eventId }, relations: { user: { projects: true, projectUser: { project: true } } },
    });

    if (!event) {
      return { error: 'Event not found' } as const;
    }

    if (event.eventStatus !== 'Pending') {
      return { error: 'Event already handled' } as const;
    }

    const parsedEventDate = dayjs(new Date(event.date));

    if (role === 'ProjectManager') {
      const projectFromUser = event.user.projectUser.map((p) => p.project.referringEmployeeId === userId ? p : null,
      )
        .filter((p) => {
          if (p === null) return false;

          const parsedStartDate = dayjs(new Date(p.startDate));
          const parsedEndDate = dayjs(new Date(p.endDate));

          return (
            (parsedStartDate.isBefore(parsedEventDate) ||
              parsedStartDate.isSame(parsedEventDate)) &&
            (parsedEndDate.isAfter(parsedEventDate) ||
              parsedEndDate.isSame(parsedEventDate))
          );
        });
      if (projectFromUser.length > 0) {
        return projectFromUser;
      }
    } else {
      const haveProjects = event.user.projectUser.some((pu) => {
        const parsedStartDate = dayjs(new Date(pu.startDate));
        const parsedEndDate = dayjs(new Date(pu.endDate));

        return (
          (parsedStartDate.isBefore(parsedEventDate) ||
            parsedStartDate.isSame(parsedEventDate)) &&
          (parsedEndDate.isAfter(parsedEventDate) ||
            parsedEndDate.isSame(parsedEventDate))
        );
      });


      if (haveProjects) {
        return event;
      }
    }

    return { error: "User not allowed" } as const;

  }

  async userIsAvailable(userId: string, date: Date) {
    const event = await this.eventRepository.find({ where: { userId }, select: { date: true, eventType: true } })

    const parsedDate = dayjs(date);

    const eventSameDay = event.some((e) =>
      parsedDate.isSame(dayjs(e.date), 'day'),
    );

    if (eventSameDay) {
      return { error: 'Event same day' } as const;
    }

    const eventSameWeek = event.filter(
      (e) =>
        e.eventType === 'RemoteWork' &&
        parsedDate.isSame(dayjs(e.date), 'week'),
    );

    if (eventSameWeek.length > 1) {
      return { error: 'Event same week' } as const;
    }

    return event;
  }

  async create(createEventDto: CreateEventDto & { userId: string }) {
    const userIsAvailable = await this.userIsAvailable(
      createEventDto.userId,
      createEventDto.date,
    );

    if ('error' in userIsAvailable) {
      return userIsAvailable;
    }

    const user = await this.userService.findOne(createEventDto.userId);

    if ('error' in user) {
      return user;
    }

    const event = new Event(createEventDto);

    if (createEventDto.eventType === 'RemoteWork') {
      event.eventStatus = 'Accepted';
    }

    return this.eventRepository.save(event);
  }

  async findAll() {
    const event = await this.eventRepository.find();

    if (!event) {
      return { error: 'Event not found' } as const;
    }

    return event
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id }
    });

    if (!event) {
      return { error: 'Event not found' } as const;
    }

    return event
  }

  async validate(eventId: string, userId: string, role: string) {

    const canHandleEvent = await this.canHandleEvent(eventId, userId, role);

    if ('error' in canHandleEvent) {
      return canHandleEvent;
    }

    const updatedResponse = await this.eventRepository.update(
      { id: eventId },
      { eventStatus: 'Accepted' },
    );

    return updatedResponse;
  }

  async decline(eventId: string, userId: string, role: string) {

    const canHandleEvent = await this.canHandleEvent(eventId, userId, role);

    if ('error' in canHandleEvent) {
      return canHandleEvent;
    }

    const updatedResponse = await this.eventRepository.update(
      { id: eventId },
      { eventStatus: 'Declined' },
    );

    return updatedResponse;
  }
}
