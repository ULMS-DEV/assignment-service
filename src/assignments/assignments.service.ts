import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc, ClientKafka } from "@nestjs/microservices";
import { AssignmentsDAO } from './dao/assignments.dao';
import { convertDates } from 'src/common/util/googleTimestamp.util';
import { GrpcAlreadyExistsException, GrpcNotFoundException, GrpcPermissionDeniedException } from 'nestjs-grpc-exceptions';

@Injectable()
export class AssignmentsService implements OnModuleInit {
  private readonly logger = new Logger(AssignmentsService.name);
  private coursesService;
  
  constructor(
    @Inject('COURSE_GRPC') private readonly client: ClientGrpc, 
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka, 
    private readonly assignmentsDAO: AssignmentsDAO
  ){}

  async onModuleInit(){
      this.logger.log('Initializing AssignmentsService...');
      
      if (!this.client) {
        this.logger.error('COURSE_GRPC client is undefined');
        throw new Error('COURSE_GRPC client is not injected');
      }
      
      this.coursesService = this.client.getService('CourseService');
      this.logger.log('CourseService initialized');
      
      await this.kafkaClient.connect();
      this.logger.log('Kafka client connected');
  }

  async getAssignmentById(id: string) {
    const assignment = await this.assignmentsDAO.getById(id);
    return convertDates(assignment);
  }

  async getStudentCourses(studentId: string) {
    if (!this.coursesService) {
      this.logger.error('coursesService is not initialized');
      throw new Error('coursesService is not initialized. onModuleInit may not have been called.');
    }
    return this.coursesService.getOffersForStudent({ studentId }).toPromise();
  }

  async getStudentAssignments(studentId: string) {
    try {
      const studentCourses = await this.getStudentCourses(studentId);
      const courseIds = studentCourses.offers.map(offer => offer.courseId);
      const assignments = await this.assignmentsDAO.getStudentAssignments(courseIds);
      return {assignments: assignments.map(assignment => convertDates(assignment))};
      
    } catch (error) {
      console.log(error);
    }
  }

  async getCourseAssignments(courseId: string) {
    const assignments = await this.assignmentsDAO.getCourseAssignments(courseId);
    return {assignments: assignments.map(assignment => convertDates(assignment))};
  }

  async SubmitAssignment(data: {assignmentId: string, studentId: string, content: string}){
    const assignment = await this.assignmentsDAO.getById(data.assignmentId);
    if(!assignment){
      throw new GrpcNotFoundException('Assignment not found');
    }

    const now = new Date();
    if(assignment.dueDate && now > assignment.dueDate){
      throw new GrpcPermissionDeniedException('Assignment submission is past due date');
    }

    const existingSubmission = await this.assignmentsDAO.getAssignmentSubmission(data.assignmentId, data.studentId);
    if(existingSubmission){
      throw new GrpcAlreadyExistsException('Submission already exists');
    }

    const submission = await this.assignmentsDAO.createAssignmentSubmission(data);

    const eventPayload = {
      submissionId: submission.id,
      assignmentId: assignment.id,
      courseId: assignment.courseId,
      studentId: submission.studentId,
      content: submission.content,
      modelAnswer: assignment.modelAnswer,
      assignmentQuestion: assignment.description,
      assignmentTitle: assignment.title
    };
    
    this.kafkaClient.emit('assignment.submission.received', eventPayload);

    return convertDates(submission);
  }

  async updateSubmissionStatus(submissionId: string, status: string, extraData: any = {}) {
    return this.assignmentsDAO.updateSubmissionStatus(submissionId, status, extraData);
  }

  async saveAnalysisResults(submissionId: string, analysisResults: {plagiarismCheck: boolean, grading: number, finalRecommendation: string, analyzedAt: Date}) {
    return this.assignmentsDAO.saveAnalysisResults(submissionId, analysisResults);
  }
}
