import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CvModel } from "./model/cv.model";
import { UsersService } from "../users/users.service";
import { ProjectsService } from "../projects/projects.service";
import { CreateCvInput } from "../graphql";

@Injectable()
export class CvsService {
  constructor(
    @InjectRepository(CvModel)
    private readonly cvRepository: Repository<CvModel>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService
  ) {}

  findAll() {
    return this.cvRepository.find({
      relations: ["user", "projects"],
    });
  }

  findOneById(id: string) {
    return this.cvRepository.findOne({
      relations: ["user", "projects"],
      where: { id },
    });
  }

  findManyById(ids: string[]) {
    return this.cvRepository.find({
      where: { id: In(ids) },
    });
  }

  async create({ userId, projectsIds, ...createCvInput }: CreateCvInput) {
    const cv = this.cvRepository.create(createCvInput);
    const user = await this.usersService.findOneById(userId);
    if (user) {
      cv.user = user;
      user.cvs.push(cv);
    }
    if (projectsIds) {
      const projects = await this.projectsService.findManyByIds(projectsIds);
      cv.projects = projects;
    }
    return this.save(cv);
  }

  update() {}

  save(cv: CvModel) {
    return this.cvRepository.save(cv);
  }

  delete(id: string) {
    return this.cvRepository.delete(id);
  }
}