import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { connect } from "puppeteer-core";
import { CvsService } from "./cvs.service";
import { CreateCvDto, UpdateCvDto, DeleteCvDto } from "./dto/cv.dto";
import { AddCvSkillDto, UpdateCvSkillDto, DeleteCvSkillDto } from "./dto/cv-skill.dto";
import { ExportPdfDto } from "./dto/pdf.dto";
import { UseGuards } from "@nestjs/common";
import { OwnCvGuard } from "src/app/guards/own-cv.guard";

@Resolver()
export class CvsResolver {
  constructor(private readonly cvsService: CvsService) {}

  @Query("cvs")
  cvs() {
    return this.cvsService.findAll();
  }

  @Query("cv")
  cv(@Args("cvId") cvId: string) {
    return this.cvsService.findOneByIdAndJoinProfile(cvId);
  }

  @Mutation("createCv")
  createCv(@Args("cv") args: CreateCvDto) {
    return this.cvsService.createCv(args);
  }

  @UseGuards(OwnCvGuard)
  @Mutation("updateCv")
  async updateCv(@Args("cv") args: UpdateCvDto) {
    return this.cvsService.updateCv(args);
  }

  @UseGuards(OwnCvGuard)
  @Mutation("deleteCv")
  deleteCv(@Args("cv") args: DeleteCvDto) {
    return this.cvsService.deleteCv(args);
  }

  @UseGuards(OwnCvGuard)
  @Mutation("addCvSkill")
  addCvSkill(@Args("skill") args: AddCvSkillDto) {
    return this.cvsService.addCvSkill(args);
  }

  @UseGuards(OwnCvGuard)
  @Mutation("updateCvSkill")
  updateCvSkill(@Args("skill") args: UpdateCvSkillDto) {
    return this.cvsService.updateCvSkill(args);
  }

  @UseGuards(OwnCvGuard)
  @Mutation("deleteCvSkill")
  deleteCvSkill(@Args("skill") args: DeleteCvSkillDto) {
    return this.cvsService.deleteCvSkill(args);
  }

  @Mutation("exportPdf")
  async exportPdf(@Args("pdf") args: ExportPdfDto) {
    const browser = await connect({
      browserWSEndpoint: process.env.CHROME_WS,
    });
    const page = await browser.newPage();
    await page.setContent(args.html);
    const buffer = await page.pdf({
      format: "A4",
      margin: args.margin,
      printBackground: true,
    });
    await browser.close();
    return buffer.toString("base64");
  }
}
