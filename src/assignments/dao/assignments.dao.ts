import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Assignment, Prisma } from "@prisma/client";

@Injectable()
export class AssignmentsDAO {
    constructor(private readonly prisma: PrismaService) {}

    async getById(id: string){
        return this.prisma.assignment.findUnique({
            where: { id },
            include: {
                submissions: {
                    include: {
                        analysisResult: true
                    }
                }
            }
        });
    }

    async getStudentAssignments(courseIds: string[]) {
        return this.prisma.assignment.findMany({
            where: {
                courseId: { in: courseIds },
            },
            include: {
                submissions: {
                    include: {
                        analysisResult: true
                    }
                }
            },
        });
    }

    async getCourseAssignments(courseId: string): Promise<(Assignment & { submissions: { analysisResult: any }[] })[]> {
        return this.prisma.assignment.findMany({
            where: {
                courseId: courseId,
            },
            include: {
                submissions: {
                    include: {
                        analysisResult: true
                    }
                }
            },
        });
    }

    async createAssignmentSubmission(data: {assignmentId: string, studentId: string, content: string}) {
        return this.prisma.submission.create({
            data: {
                assignmentId: data.assignmentId,
                studentId: data.studentId,
                content: data.content,
            },
        });
    }

    async getStudentAssignmentSubmission(assignmentId: string, studentId: string) {
        return this.prisma.submission.findFirst({
            where: {
                assignmentId,
                studentId,
            },
            include: { analysisResult: true }
        });
    }

    async getAssignmentSubmissions(assignmentId: string) {
        return this.prisma.submission.findMany({
            where: { assignmentId },
            include: { analysisResult: true }
        });
    }

    async updateSubmissionStatus(submissionId: string, status: string, extraData?: any) {
        return this.prisma.submission.update({
            where: { id: submissionId },
            data: {
                status,
                ...extraData,
            },
        });
    }

    async saveAnalysisResults(submissionId: string, results: {plagiarismCheck: boolean, grading: number, finalRecommendation: string, analyzedAt: Date}) {
        this.prisma.$transaction(async (tx) => {
            await tx.submission.update({
                where: { id: submissionId },
                data: {
                    analysisStatus: 'analysis_completed',
                },
            })
            
            await tx.analysisResult.create({
                data: {
                    submissionId,
                    ...results
                }
            });
        });
    }
        
    async seed(){
        const assignments = [
            {
                courseId: "384a3fe5-8d6c-4f51-a278-8271d982e01c",
                title: "Assignment 1: Algorithm Design & Tracing",
                description:
                "Design and trace simple algorithms using pseudocode. Focus on understanding control flow (sequence, selection, and iteration) and explaining each step clearly.",
                dueDate: new Date("2025-02-01T23:59:00.000Z"),
                modelAnswer: `
                <h2>Model Answer – Assignment 1: Algorithm Design & Tracing</h2>

                <h3>Task 1: Find the Maximum of Three Numbers</h3>
                <p><strong>Pseudocode Solution:</strong></p>
                <pre><code>
                INPUT a, b, c
                max ← a
                IF b &gt; max THEN
                    max ← b
                ENDIF
                IF c &gt; max THEN
                    max ← c
                ENDIF
                OUTPUT max
                </code></pre>
                <p>This algorithm initializes <code>max</code> with the value of <code>a</code>, 
                then compares it with <code>b</code> and <code>c</code> in sequence. 
                At the end, <code>max</code> holds the largest of the three numbers.</p>

                <h3>Task 2: Sum of First N Natural Numbers</h3>
                <p><strong>Pseudocode (Iterative Approach):</strong></p>
                <pre><code>
                INPUT n
                sum ← 0
                FOR i ← 1 TO n DO
                    sum ← sum + i
                ENDFOR
                OUTPUT sum
                </code></pre>
                <p>This loop runs exactly <code>n</code> times, adding each number from 1 to <code>n</code>. 
                The time complexity is <strong>O(n)</strong>.</p>

                <h3>Alternative Formula-Based Approach</h3>
                <pre><code>
                INPUT n
                sum ← n × (n + 1) / 2
                OUTPUT sum
                </code></pre>
                <p>This approach uses a closed-form formula and runs in constant time 
                with time complexity <strong>O(1)</strong>.</p>

                <h3>Key Points for Full Marks</h3>
                <ul>
                    <li>Correct use of variables and initialization.</li>
                    <li>Clear control flow with proper <code>IF</code> and <code>FOR</code> structures.</li>
                    <li>Basic discussion of time complexity where relevant.</li>
                </ul>
                `,
                createdAt: new Date("2025-01-15T10:00:00.000Z"),
                updatedAt: new Date("2025-01-15T10:00:00.000Z")
            },
            {
                courseId: "384a3fe5-8d6c-4f51-a278-8271d982e01c",
                title: "Assignment 2: Introduction to Data Structures",
                description:
                "Compare arrays and linked lists through simple operations such as insertion, deletion, and access. Explain trade-offs using both natural language and basic Big O notation.",
                dueDate: new Date("2025-02-10T23:59:00.000Z"),
                modelAnswer: `
                <h2>Model Answer – Assignment 2: Introduction to Data Structures</h2>

                <h3>Part 1: Arrays vs Linked Lists (Conceptual)</h3>
                <ul>
                    <li><strong>Arrays:</strong> Contiguous memory, fast random access using indices.</li>
                    <li><strong>Linked Lists:</strong> Non-contiguous memory, each node points to the next.</li>
                </ul>

                <h3>Part 2: Time Complexity Comparison</h3>
                <table border="1" cellpadding="4" cellspacing="0">
                    <thead>
                    <tr>
                        <th>Operation</th>
                        <th>Array</th>
                        <th>Singly Linked List</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Access element at index i</td>
                        <td>O(1)</td>
                        <td>O(n)</td>
                    </tr>
                    <tr>
                        <td>Insert at beginning</td>
                        <td>O(n)</td>
                        <td>O(1)</td>
                    </tr>
                    <tr>
                        <td>Insert at end (no extra info)</td>
                        <td>O(1) amortized (dynamic array)</td>
                        <td>O(n)</td>
                    </tr>
                    <tr>
                        <td>Delete from beginning</td>
                        <td>O(n)</td>
                        <td>O(1)</td>
                    </tr>
                    </tbody>
                </table>

                <h3>Part 3: Example Scenario</h3>
                <p>If you need frequent random access (e.g., accessing the 100th element constantly), 
                an <strong>array</strong> is preferable. If you frequently insert or remove items at the front of the list, 
                a <strong>linked list</strong> is more efficient.</p>

                <h3>What a Strong Answer Includes</h3>
                <ul>
                    <li>Accurate Big O notations for the main operations.</li>
                    <li>At least one practical scenario for each structure.</li>
                    <li>Clear, concise explanations instead of only listing formulas.</li>
                </ul>
                `,
                createdAt: new Date("2025-01-16T10:00:00.000Z"),
                updatedAt: new Date("2025-01-16T10:00:00.000Z")
            },
            {
                courseId: "384a3fe5-8d6c-4f51-a278-8271d982e01c",
                title: "Assignment 3: Basic Programming – Control Flow",
                description:
                "Write small programs that use conditionals and loops to solve simple numeric problems. Emphasis is on clarity, readability, and correct use of control structures.",
                dueDate: new Date("2025-02-20T23:59:00.000Z"),
                modelAnswer: `
                <h2>Model Answer – Assignment 3: Basic Programming – Control Flow</h2>

                <h3>Task 1: Even or Odd</h3>
                <p><strong>Example Solution (in a C-like pseudocode):</strong></p>
                <pre><code>
                INPUT n
                IF n % 2 == 0 THEN
                    PRINT "Even"
                ELSE
                    PRINT "Odd"
                ENDIF
                </code></pre>
                <p>This solution correctly uses the modulo operator to decide whether a number is divisible by 2.</p>

                <h3>Task 2: Print Multiplication Table (1 to 10)</h3>
                <pre><code>
                INPUT n
                FOR i ← 1 TO 10 DO
                    PRINT n, " × ", i, " = ", n * i
                ENDFOR
                </code></pre>
                <p>The loop runs 10 times and prints each line of the multiplication table in a clear format.</p>

                <h3>Code Quality Guidelines</h3>
                <ul>
                    <li>Meaningful variable names (e.g., <code>number</code> instead of <code>x</code> when appropriate).</li>
                    <li>Consistent indentation to reflect the structure of conditionals and loops.</li>
                    <li>Simple, direct logic with no unnecessary steps.</li>
                </ul>
                `,
                createdAt: new Date("2025-01-17T10:00:00.000Z"),
                updatedAt: new Date("2025-01-17T10:00:00.000Z")
            },
            {
                courseId: "384a3fe5-8d6c-4f51-a278-8271d982e01c",
                title: "Assignment 4: Problem-Solving with Pseudocode",
                description:
                "Break down a real-world problem into inputs, outputs, and a step-by-step solution using pseudocode. Focus on clarity and structured thinking rather than syntax.",
                dueDate: new Date("2025-02-28T23:59:00.000Z"),
                modelAnswer: `
                <h2>Model Answer – Assignment 4: Problem-Solving with Pseudocode</h2>

                <h3>Problem: Basic Student Grade Calculator</h3>
                <p><strong>Requirements:</strong> Read three exam scores, calculate the average, 
                and print a message indicating whether the student has passed (average ≥ 50) or failed.</p>

                <h3>Pseudocode Solution</h3>
                <pre><code>
                INPUT score1, score2, score3
                average ← (score1 + score2 + score3) / 3

                IF average ≥ 50 THEN
                    PRINT "Pass. Your average is ", average
                ELSE
                    PRINT "Fail. Your average is ", average
                ENDIF
                </code></pre>

                <h3>Decomposition of the Problem</h3>
                <ul>
                    <li><strong>Inputs:</strong> Three numeric scores.</li>
                    <li><strong>Processing:</strong> Compute the arithmetic mean of the scores.</li>
                    <li><strong>Decision:</strong> Compare the average against the threshold value (50).</li>
                    <li><strong>Output:</strong> A message indicating pass or fail with the final average.</li>
                </ul>

                <h3>What a High-Quality Answer Shows</h3>
                <ul>
                    <li>Clear separation between input, processing, and output.</li>
                    <li>Logical flow with no missing steps.</li>
                    <li>Readable pseudocode that could easily be translated into an actual programming language.</li>
                </ul>
                `,
                createdAt: new Date("2025-01-18T10:00:00.000Z"),
                updatedAt: new Date("2025-01-18T10:00:00.000Z")
            }
        ];

        await this.prisma.assignment.createMany({
            data: assignments,
            skipDuplicates: true,
        });
    }
}