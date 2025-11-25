import { Controller } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @GrpcMethod('AssignmentService', 'GetAssignmentById')
  getAssignmentById(data: { id: string }) {
    return this.assignmentsService.getAssignmentById(data.id);
  }

  @GrpcMethod('AssignmentService', 'GetStudentAssignments')
  getStudentAssignments(data: { studentId: string }) {
    return this.assignmentsService.getStudentAssignments(data.studentId);
  }

  @GrpcMethod('AssignmentService', 'GetAssignmentSubmissions')
  getAssignmentSubmissions(data: { assignmentId: string }) {
    return this.assignmentsService.getAssignmentSubmissions(data.assignmentId);
  }

  @GrpcMethod('AssignmentService', 'GetCourseAssignments')
  getCourseAssignments(data: { courseId: string }) {
    return this.assignmentsService.getCourseAssignments(data.courseId);
  }

  @GrpcMethod('AssignmentService', 'SubmitAssignment')
  submitAssignment(data: { assignmentId: string; studentId: string; content: string }) {
    return this.assignmentsService.SubmitAssignment(data);
  }
}
