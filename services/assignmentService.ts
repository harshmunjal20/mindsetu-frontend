
import { 
  Assignment, 
  StudentAssignmentSubmission, 
  StudentDisplayableAssignment,
  AssignmentAlert,
  CurrentUser, 
  UserType,
  ApiResponse,
  User 
} from '../types';
import { getUsers } from './authService'; // Assuming getUsers is exported from authService

const ASSIGNMENTS_STORAGE_KEY = 'mindsetu_assignments';
const SUBMISSIONS_STORAGE_KEY = 'mindsetu_student_submissions';

// --- Helper Functions ---
const getStoredAssignments = (): Assignment[] => {
  const assignmentsJson = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
  return assignmentsJson ? JSON.parse(assignmentsJson) : [];
};

const saveStoredAssignments = (assignments: Assignment[]): void => {
  localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
};

const getStoredSubmissions = (): StudentAssignmentSubmission[] => {
  const submissionsJson = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
  return submissionsJson ? JSON.parse(submissionsJson) : [];
};

const saveStoredSubmissions = (submissions: StudentAssignmentSubmission[]): void => {
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
};

// Initialize with mock data if none exists (for demonstration)
const initializeMockAssignments = () => {
  let assignments = getStoredAssignments();
  if (assignments.length === 0) {
    const allUsers = getUsers();
    const mockAdminGreenwood = allUsers.find(u => u.userType === UserType.Admin && u.instituteName === 'greenwood high');
    const mockAdminOakwood = allUsers.find(u => u.userType === UserType.Admin && u.instituteName === 'oakwood academy');
    
    const initialAssignments: Assignment[] = [];

    if (mockAdminGreenwood) {
        initialAssignments.push(
            { 
                id: 'mockassign1_gw', 
                title: 'Intro to Algebra (Greenwood)', 
                dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
                instituteName: mockAdminGreenwood.instituteName, 
                createdBy: mockAdminGreenwood.id, 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 'mockassign2_gw', 
                title: 'Physics Lab: Motion (Greenwood)', 
                dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
                instituteName: mockAdminGreenwood.instituteName, 
                createdBy: mockAdminGreenwood.id, 
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
            }
        );
    }
    if (mockAdminOakwood) {
        initialAssignments.push(
             { 
                id: 'mockassign3_oa', 
                title: 'Essay: Social Media (Oakwood)', 
                dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), 
                instituteName: mockAdminOakwood.instituteName, 
                createdBy: mockAdminOakwood.id, 
                createdAt: new Date().toISOString() 
            },
            { 
                id: 'mockassign4_oa', 
                title: 'History Quiz Ch. 1-3 (Oakwood)', 
                dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                instituteName: mockAdminOakwood.instituteName, 
                createdBy: mockAdminOakwood.id, 
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() 
            }
        );
    }
    if (initialAssignments.length > 0) {
        saveStoredAssignments(initialAssignments);
        assignments = initialAssignments; // update local variable
    }
  }

  // Also initialize some mock submissions for the mock assignments
  let submissions = getStoredSubmissions();
  if (submissions.length === 0 && assignments.length > 0) {
    const allUsers = getUsers();
    const students = allUsers.filter(u => u.userType === UserType.Student && u.isActivated);
    const mockSubmissions: StudentAssignmentSubmission[] = [];

    students.forEach(student => {
        assignments.forEach((assignment, index) => {
            if (student.instituteName === assignment.instituteName) {
                // Let's make some students submit, some not, some late
                if (student.id === 'student1gw' && assignment.id === 'mockassign2_gw') { // Bob submits late for past due
                     mockSubmissions.push({
                        id: `sub_${student.id}_${assignment.id}`, assignmentId: assignment.id, studentId: student.id, instituteName: student.instituteName,
                        submittedAt: new Date(new Date(assignment.dueDate).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'Late'
                    });
                } else if (student.id === 'student2gw' && assignment.id === 'mockassign1_gw') { // Charlie submits upcoming on time
                    mockSubmissions.push({
                        id: `sub_${student.id}_${assignment.id}`, assignmentId: assignment.id, studentId: student.id, instituteName: student.instituteName,
                        submittedAt: new Date().toISOString(), status: 'On-Time'
                    });
                } else if (student.id === 'student1oa' && assignment.id === 'mockassign4_oa') { // Eve submits past due on time
                     mockSubmissions.push({
                        id: `sub_${student.id}_${assignment.id}`, assignmentId: assignment.id, studentId: student.id, instituteName: student.instituteName,
                        submittedAt: new Date(new Date(assignment.dueDate).getTime() - 12 * 60 * 60 * 1000).toISOString(), status: 'On-Time'
                    });
                }
                // student4gw (Edward) misses 'mockassign2_gw'
                // student5gw (Fiona) submits 'mockassign2_gw' on time.
                 else if (student.id === 'student5gw' && assignment.id === 'mockassign2_gw') {
                    mockSubmissions.push({
                        id: `sub_${student.id}_${assignment.id}`, assignmentId: assignment.id, studentId: student.id, instituteName: student.instituteName,
                        submittedAt: new Date(new Date(assignment.dueDate).getTime() - 6 * 60 * 60 * 1000).toISOString(), status: 'On-Time'
                    });
                }
            }
        });
    });
    if (mockSubmissions.length > 0) {
        saveStoredSubmissions(mockSubmissions);
    }
  }
};
initializeMockAssignments();


// --- Service Functions ---

export const createAssignment = async (
  adminUser: CurrentUser, 
  title: string, 
  dueDate: string // Expecting YYYY-MM-DD format from input, convert to ISO string
): Promise<ApiResponse<Assignment>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (adminUser.userType !== UserType.Admin) {
        resolve({ success: false, error: "Unauthorized: Only Admins can create assignments." });
        return;
      }
      if (!title.trim() || !dueDate) {
        resolve({ success: false, error: "Title and Due Date are required." });
        return;
      }

      const assignments = getStoredAssignments();
      const newAssignment: Assignment = {
        id: `assign_${Date.now().toString()}_${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        dueDate: new Date(dueDate + "T23:59:59.999Z").toISOString(), // Set to end of day
        instituteName: adminUser.instituteName,
        createdBy: adminUser.id,
        createdAt: new Date().toISOString(),
      };
      assignments.push(newAssignment);
      saveStoredAssignments(assignments);
      resolve({ success: true, data: newAssignment, message: "Assignment created successfully." });
    }, 300);
  });
};

export const getAssignmentsForInstitute = async (instituteName: string): Promise<ApiResponse<Assignment[]>> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      const allAssignments = getStoredAssignments();
      const instituteAssignments = allAssignments
        .filter(assign => assign.instituteName === instituteName)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve({ success: true, data: instituteAssignments });
    }, 200);
  });
};

export const getStudentSubmissionsForStudent = async (studentId: string, instituteName: string): Promise<ApiResponse<StudentAssignmentSubmission[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSubmissions = getStoredSubmissions();
      const studentSubmissions = allSubmissions.filter(
        sub => sub.studentId === studentId && sub.instituteName === instituteName
      );
      resolve({ success: true, data: studentSubmissions });
    }, 200);
  });
};

export const addStudentSubmission = async (
  studentId: string, 
  assignmentId: string, 
  instituteName: string
): Promise<ApiResponse<StudentAssignmentSubmission>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const assignments = getStoredAssignments();
      const assignment = assignments.find(a => a.id === assignmentId && a.instituteName === instituteName);

      if (!assignment) {
        resolve({ success: false, error: "Assignment not found." });
        return;
      }

      const submissions = getStoredSubmissions();
      const existingSubmission = submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
      if (existingSubmission) {
        resolve({ success: false, error: "You have already submitted this assignment." });
        return;
      }

      const submissionTime = new Date();
      const dueDate = new Date(assignment.dueDate);
      const status: 'On-Time' | 'Late' = submissionTime <= dueDate ? 'On-Time' : 'Late';

      const newSubmission: StudentAssignmentSubmission = {
        id: `sub_${Date.now().toString()}_${Math.random().toString(36).substring(2, 7)}`,
        assignmentId,
        studentId,
        instituteName,
        submittedAt: submissionTime.toISOString(),
        status,
      };
      submissions.push(newSubmission);
      saveStoredSubmissions(submissions);
      resolve({ success: true, data: newSubmission, message: `Assignment submitted ${status.toLowerCase()}.` });
    }, 300);
  });
};

// Used by AssignmentSubmissionView for students
export const getDisplayableAssignmentsForStudent = (
  allInstituteAssignments: Assignment[],
  studentSubmissions: StudentAssignmentSubmission[]
): StudentDisplayableAssignment[] => {
  const now = new Date();
  return allInstituteAssignments.map(assignment => {
    const submission = studentSubmissions.find(s => s.assignmentId === assignment.id);
    let studentSubmissionStatus: StudentDisplayableAssignment['studentSubmissionStatus'] = 'Pending';
    
    if (submission) {
      studentSubmissionStatus = submission.status;
    } else if (new Date(assignment.dueDate) < now) {
      studentSubmissionStatus = 'Missed';
    }

    return {
      ...assignment,
      studentSubmissionStatus,
      studentSubmittedAt: submission?.submittedAt,
    };
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort by due date
};


// Generate alerts for a student
export const generateStudentAssignmentAlerts = (
  studentId: string,
  displayableAssignments: StudentDisplayableAssignment[],
): AssignmentAlert[] => {
  const alerts: AssignmentAlert[] = [];
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  displayableAssignments.forEach(assignment => {
    const dueDate = new Date(assignment.dueDate);

    if (assignment.studentSubmissionStatus === 'Pending') {
      if (dueDate >= now && dueDate <= twoDaysFromNow) {
        alerts.push({
          id: `alert_upcoming_${assignment.id}`,
          assignmentId: assignment.id,
          title: assignment.title,
          message: `Reminder: "${assignment.title}" is due on ${dueDate.toLocaleDateString()}.`,
          type: 'warning',
          dueDate: assignment.dueDate,
        });
      }
    } else if (assignment.studentSubmissionStatus === 'Missed') {
       alerts.push({
          id: `alert_missed_${assignment.id}`,
          assignmentId: assignment.id,
          title: assignment.title,
          message: `Attention: You missed the deadline for "${assignment.title}" which was due on ${dueDate.toLocaleDateString()}.`,
          type: 'error',
          dueDate: assignment.dueDate,
        });
    }
    
    if (assignment.studentSubmittedAt) {
        const submittedDate = new Date(assignment.studentSubmittedAt);
        if (now.getTime() - submittedDate.getTime() < 24 * 60 * 60 * 1000) { 
            if (assignment.studentSubmissionStatus === 'On-Time') {
                 alerts.push({
                    id: `alert_submitted_ontime_${assignment.id}`,
                    assignmentId: assignment.id,
                    title: assignment.title,
                    message: `Great job! You submitted "${assignment.title}" on time.`,
                    type: 'success',
                });
            } else if (assignment.studentSubmissionStatus === 'Late') {
                 alerts.push({
                    id: `alert_submitted_late_${assignment.id}`,
                    assignmentId: assignment.id,
                    title: assignment.title,
                    message: `You submitted "${assignment.title}" late. Remember to check due dates.`,
                    type: 'info', 
                });
            }
        }
    }
  });

  return alerts.sort((a, b) => {
    const typeOrder = { 'error': 0, 'warning': 1, 'info': 2, 'success': 3 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0; 
  });
};


// Helper to get all submissions for an institute - used for admin academic overview
export const getSubmissionsForInstitute = async (instituteName: string): Promise<ApiResponse<StudentAssignmentSubmission[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSubmissions = getStoredSubmissions();
      const instituteSubmissions = allSubmissions.filter(sub => sub.instituteName === instituteName);
      resolve({ success: true, data: instituteSubmissions });
    }, 200);
  });
};

// New function for Admin Dashboard & Academic Performance View
export const getInstituteAssignmentStats = async (
  instituteName: string
): Promise<ApiResponse<{ onTimePercent: number; latePercent: number; missedPercent: number; totalActiveStudentsWithAssignments: number }>> => {
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      try {
        const allUsers = getUsers();
        const activeInstituteStudents = allUsers.filter(
          (user: User) => user.instituteName === instituteName && user.userType === UserType.Student && user.isActivated
        );
        const totalStudents = activeInstituteStudents.length;

        const assignmentsResponse = await getAssignmentsForInstitute(instituteName);
        const submissionsResponse = await getSubmissionsForInstitute(instituteName);

        if (!assignmentsResponse.success || !submissionsResponse.success) {
          throw new Error(assignmentsResponse.error || submissionsResponse.error || "Failed to fetch assignment data for stats.");
        }

        const instituteAssignments = assignmentsResponse.data || [];
        const instituteSubmissions = submissionsResponse.data || [];
        
        let onTimeSubmissionsCount = 0;
        let lateSubmissionsCount = 0;
        const submittedAssignmentIds = new Set<string>();

        instituteSubmissions.forEach(sub => {
          if (activeInstituteStudents.some(s => s.id === sub.studentId)) { // Only count submissions from active students in this institute
            if (sub.status === 'On-Time') onTimeSubmissionsCount++;
            if (sub.status === 'Late') lateSubmissionsCount++;
            submittedAssignmentIds.add(sub.assignmentId);
          }
        });
        
        const totalSubmissionsMadeByActiveStudents = onTimeSubmissionsCount + lateSubmissionsCount;

        const onTimePercent = totalSubmissionsMadeByActiveStudents > 0 ? (onTimeSubmissionsCount / totalSubmissionsMadeByActiveStudents) * 100 : 0;
        const latePercent = totalSubmissionsMadeByActiveStudents > 0 ? (lateSubmissionsCount / totalSubmissionsMadeByActiveStudents) * 100 : 0;
        
        let missedPercent = 0;
        const now = new Date();
        const pastDueAssignments = instituteAssignments.filter(assign => new Date(assign.dueDate) < now);
        
        let totalMissedInstances = 0;
        let studentsConsideredForMissed = 0;

        if (totalStudents > 0 && pastDueAssignments.length > 0) {
          activeInstituteStudents.forEach(student => {
            let studentHasRelevantPastDueAssignments = false;
            pastDueAssignments.forEach(assignment => {
               // Only consider assignments created *after* a student might have become active, or all if not trackable simply
               // For mock, assume all past due assignments are relevant.
                studentHasRelevantPastDueAssignments = true;
                const hasSubmitted = instituteSubmissions.some(
                    sub => sub.assignmentId === assignment.id && sub.studentId === student.id
                );
                if (!hasSubmitted) {
                    totalMissedInstances++;
                }
            });
            if(studentHasRelevantPastDueAssignments) studentsConsideredForMissed++;
          });
          const totalPossibleSubmissionsForPastDue = studentsConsideredForMissed * pastDueAssignments.length;
          missedPercent = totalPossibleSubmissionsForPastDue > 0 
            ? (totalMissedInstances / totalPossibleSubmissionsForPastDue) * 100 
            : 0;
        }
        
        resolve({ 
          success: true, 
          data: { 
            onTimePercent, 
            latePercent, 
            missedPercent, 
            totalActiveStudentsWithAssignments: studentsConsideredForMissed // Or totalStudents if logic is simpler
          } 
        });

      } catch (err: any) {
        console.error("Error in getInstituteAssignmentStats:", err);
        resolve({ 
          success: false, 
          error: err.message || "Failed to calculate institute assignment stats.",
          data: { onTimePercent: 0, latePercent: 0, missedPercent: 0, totalActiveStudentsWithAssignments: 0 }
        });
      }
    }, 350); // Slightly longer timeout for more complex aggregation
  });
};
