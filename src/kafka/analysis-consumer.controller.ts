import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AssignmentsService } from 'src/assignments/assignments.service';

@Controller()
export class AnalysisConsumerController {
  private readonly logger = new Logger(AnalysisConsumerController.name);

  constructor(
    private readonly assignmentService: AssignmentsService,
  ) {}

  @EventPattern('assignment.analysis.completed')
  async handleAnalysisCompleted(@Payload() payload: any) {

    this.logger.log(`Received analysis for submission: ${payload.submissionId}`);

    if (payload.error) {
      // Handle error case
      await this.assignmentService.updateSubmissionStatus(
        payload.submissionId,
        'analysis_failed',
        { errorMessage: payload.errorMessage }
      );
      return;
    }

    // Store analysis results
    await this.assignmentService.saveAnalysisResults(payload.submissionId, {
      plagiarismCheck: payload.plagiarismCheck,
      grading: payload.grading,
      finalRecommendation: payload.finalRecommendation,
      analyzedAt: payload.timestamp,
    });

    this.logger.log(`Analysis results saved for submission: ${payload.submissionId}`);
  }
}