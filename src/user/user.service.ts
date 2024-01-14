import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { hash, compare } from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from '@nestjs/jwt';
import * as dayjs from 'dayjs';



@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,

  ) { }

  async create(createUserDto: CreateUserDto) {

    createUserDto.password = await hash(createUserDto.password, 10);

    const { email, id, username, role } = await this.usersRepository.save(createUserDto);
    return {
      email,
      id,
      username,
      role,
    };
  }

  async login({ email, password }: UpdateUserDto): Promise<{ access_token: string } | { error: string }> {
    const user = await this.usersRepository.findOne({ where: { email }, select: { password: true, id: true, email: true, role: true, username: true } });
    if (!user) {
      return { error: 'User not found' } as const;
    }

    if (user && (await compare(password, user.password))) {
      const payload = { id: user.id, username: user.username, role: user.role };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: process.env.JWT_SECRET,
        }),
      };
    }
    return { error: 'Password is wrong' } as const;;
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      return { error: 'User not found' } as const;
    } else {
      return user;
    }
  }

  async findAll() {

    const users = await this.usersRepository.find();

    if (!users) {
      return { error: 'Users not found' } as const;
    } else {
      return users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      }));
    }
  }

  async getMealVouchers(
    id: string,
    month: number,
  ) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { events: true },
    });

    if (!user) {
      return { error: 'User not found' } as const;
    }

    const parsedEvents = user.events.filter(
      (e) =>
        e.eventStatus === 'Accepted' &&
        dayjs(new Date(e.date)).month() - 1 === month,
    );

    const mealVoucherValue = 8;
    let mealVouchersCount = parsedEvents.length * -1;

    const djsMonth = dayjs()
      .month(month - 1)
      .date(1);

    const daysInMonth = djsMonth.daysInMonth();
    const firstDay = djsMonth.day();

    const days = new Array<number>(daysInMonth)
      .fill(0)
      .map((_, i) => (firstDay + i) % 7);

    mealVouchersCount += days.reduce(
      (acc, day) => (day !== 0 ? (day !== 6 ? acc + 1 : acc) : acc),
      0,
    );

    return { mealVouchersCount: (mealVouchersCount * mealVoucherValue) };

  }



  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
