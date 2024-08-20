import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @Get()
  findAll(@Query('email') email: string) {
    return this.userService.findAll(email);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(parseInt(id));
  }

  @Post('/signup')
  create(@Body() body: UserDto) {
    return this.userService.create(body.email, body.password);
  }

  @Post("/signin")
  signin(@Body() body: UserDto) {
    return this.userService.signin(body.email, body.password);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UserDto) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.userService.delete(parseInt(id));
  }
}
