
import React, { useState, useEffect, useCallback } from 'react';
import { CurrentUser, UserType, Assignment, StudentAssignmentSubmission, StudentDisplayableAssignment, AssignmentAlert } from '../types';
import {
  createAssignment,
  getAssignmentsForInstitute,
  getStudentSubmissionsForStudent,
  addStudentSubmission,
  getDisplayableAssignmentsForStudent,
  generateStudentAssignmentAlerts,
  getSubmissionsForInstitute,
} from '../services/assignmentService';
import {
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon
} from './icons';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  titleExtra?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, icon, titleExtra }) => (
  <div className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow dark:bg-base-200-dark bg-white ${className} dark:shadow-brand-primary-dark/10`}>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        {icon && <span className="mr-3 text-brand-primary dark:text-brand-primary-light">{icon}</span>}
        <h2 className="text-xl font-semibold text-brand-primary dark:text-brand-primary-light">{title}</h2>
      </div>
      {titleExtra}
    </div>
    {children}
  </div>
);

const LoadingSpinner: React.FC<{text?: string}> = ({text = "Loading..."}) => (
    <div className="flex flex-col items-center justify-center p-4">
        <svg className="animate-spin h-8 w-8 text-brand-primary dark:text-brand-primary-light mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </div>
);

const getStatusColor = (status: StudentDisplayableAssignment['studentSubmissionStatus'] | AssignmentAlert['type']) => {
    switch (status) {
      case 'On-Time': case 'success': return 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 border-green-500/50 dark:border-green-500/70';
      case 'Late': case 'info': return 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 border-amber-500/50 dark:border-amber-500/70';
      case 'Pending': case 'warning': return 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 border-blue-500/50 dark:border-blue-500/70';
      case 'Missed': case 'error': return 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border-red-500/50 dark:border-red-500/70';
      default: return 'text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 border-slate-500/50 dark:border-slate-500/70';
    }
};

interface AssignmentSubmissionViewProps {
  currentUser: CurrentUser;
}

export const AssignmentSubmissionView: React.FC<AssignmentSubmissionViewProps> = ({ currentUser }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentDisplayableAssignments, setStudentDisplayableAssignments] = useState<StudentDisplayableAssignment[]>([]);
  const [alerts, setAlerts] = useState<AssignmentAlert[]>([]);

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState('');

  const [allInstituteSubmissions, setAllInstituteSubmissions] = useState<StudentAssignmentSubmission[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isSubmittingStudentAction, setIsSubmittingStudentAction] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFormMessage(null);
    try {
      if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
        const assignResponse = await getAssignmentsForInstitute(currentUser.instituteName);
        if (assignResponse.success && assignResponse.data) {
          setAssignments(assignResponse.data);
        } else {
          setError(assignResponse.error || "Failed to load assignments.");
        }
        const allSubmissionsResponse = await getSubmissionsForInstitute(currentUser.instituteName);
        if (allSubmissionsResponse.success && allSubmissionsResponse.data) {
            setAllInstituteSubmissions(allSubmissionsResponse.data);
        }

      } else if (currentUser.userType === UserType.Student) {
        const assignResponse = await getAssignmentsForInstitute(currentUser.instituteName);
        const subsResponse = await getStudentSubmissionsForStudent(currentUser.id, currentUser.instituteName);

        if (assignResponse.success && subsResponse.success && assignResponse.data && subsResponse.data) {
          const displayable = getDisplayableAssignmentsForStudent(assignResponse.data, subsResponse.data);
          setStudentDisplayableAssignments(displayable);
          setAlerts(generateStudentAssignmentAlerts(currentUser.id, displayable));
        } else {
          setError(assignResponse.error || subsResponse.error || "Failed to load assignment data.");
        }
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    }
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentDueDate) {
      setFormMessage({type: 'error', text: 'Title and Due Date are required.'});
      return;
    }
    setIsSubmittingForm(true);
    setFormMessage(null);
    const response = await createAssignment(currentUser, newAssignmentTitle, newAssignmentDueDate);
    if (response.success) {
      setFormMessage({type: 'success', text: response.message || 'Assignment created!'});
      setNewAssignmentTitle('');
      setNewAssignmentDueDate('');
      fetchData();
    } else {
      setFormMessage({type: 'error', text: response.error || 'Failed to create assignment.'});
    }
    setIsSubmittingForm(false);
  };

  const handleStudentSubmitAssignment = async (assignmentId: string) => {
    setIsSubmittingStudentAction(assignmentId);
    setFormMessage(null);
    const response = await addStudentSubmission(currentUser.id, assignmentId, currentUser.instituteName);
    if (response.success) {
        fetchData();
    } else {
        alert(`Error submitting assignment: ${response.error}`);
    }
    setIsSubmittingStudentAction(null);
  };

  if (isLoading) return <LoadingSpinner text="Loading assignments..." />;
  if (error) return <p className="text-red-500 dark:text-red-400 text-center p-4">{error}</p>;

  if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
    const roleDisplay = currentUser.userType === UserType.SuperAdmin ? "Super Admin" : "Teacher";
    return (
      <div className="space-y-8">
        <Card title={`Create New Assignment (as ${roleDisplay})`} icon={<PlusCircleIcon className="w-6 h-6" />} className="border-b-4 border-brand-primary dark:border-brand-primary-light">
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label htmlFor="assignmentTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignment Title</label>
              <input
                type="text"
                id="assignmentTitle"
                value={newAssignmentTitle}
                onChange={(e) => setNewAssignmentTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent outline-none dark:bg-slate-700 dark:text-white"
                placeholder="e.g., Chapter 5 Reading Quiz"
                disabled={isSubmittingForm}
              />
            </div>
            <div>
              <label htmlFor="assignmentDueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                id="assignmentDueDate"
                value={newAssignmentDueDate}
                onChange={(e) => setNewAssignmentDueDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-brand-primary dark:focus:ring-brand-primary-light focus:border-transparent outline-none dark:bg-slate-700 dark:text-white"
                min={new Date().toISOString().split('T')[0]}
                disabled={isSubmittingForm}
              />
            </div>
            {formMessage && (
              <p className={`text-sm p-2 rounded-md ${formMessage.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                {formMessage.text}
              </p>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center px-6 py-2.5 bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-colors disabled:opacity-60"
              disabled={isSubmittingForm}
            >
              {isSubmittingForm ? (
                <LoadingSpinner text="Creating..." />
              ) : (
                <> <PlusCircleIcon className="w-5 h-5 mr-2" /> Create Assignment </>
              )}
            </button>
          </form>
        </Card>

        <Card title="Manage Assignments" icon={<ClipboardDocumentListIcon className="w-6 h-6" />}>
          {assignments.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No assignments created for {currentUser.instituteName} yet.</p>
          ) : (
            <div className="space-y-3">
              {assignments.map(assignment => {
                const submissionCount = allInstituteSubmissions.filter(sub => sub.assignmentId === assignment.id).length;
                return (
                <div key={assignment.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{assignment.title}</h3>
                    <span className="text-xs px-2 py-1 bg-brand-accent/20 text-brand-accent-dark dark:bg-brand-accent/30 dark:text-brand-accent-light rounded-full">
                        Submissions: {submissionCount}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                    <CalendarDaysIcon className="w-4 h-4 mr-1.5 opacity-70" />
                    Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Created: {new Date(assignment.createdAt).toLocaleDateString()}</p>
                </div>
              )})}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // --- STUDENT VIEW ---
  return (
    <div className="space-y-8">
      {alerts.length > 0 && (
        <Card title="Notifications & Alerts" icon={<BellIcon className="w-6 h-6" />} className="border-b-4 border-yellow-500 dark:border-yellow-400">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-3 rounded-md text-sm flex items-start ${getStatusColor(alert.type)} border-l-4`}>
                {alert.type === 'warning' && <ClockIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0" />}
                {alert.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0" />}
                {alert.type === 'success' && <CheckBadgeIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0" />}
                {alert.type === 'info' && <BellIcon className="w-5 h-5 mr-2.5 mt-0.5 flex-shrink-0" />}
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Your Assignments" icon={<ClipboardDocumentListIcon className="w-6 h-6" />}>
        {studentDisplayableAssignments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No assignments found for you at {currentUser.instituteName}.</p>
        ) : (
          <div className="space-y-4">
            {studentDisplayableAssignments.map(assignment => (
              <div key={assignment.id} className={`p-4 rounded-lg shadow-md ${getStatusColor(assignment.studentSubmissionStatus)} border-l-4`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{assignment.title}</h3>
                    <p className="text-xs opacity-80 mt-0.5 flex items-center">
                      <CalendarDaysIcon className="w-3.5 h-3.5 mr-1 opacity-70" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end">
                     <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${getStatusColor(assignment.studentSubmissionStatus).replace(/bg-(.+?)\s/, '')}`}>
                        {assignment.studentSubmissionStatus === 'On-Time' ? 'Submitted On-Time' :
                         assignment.studentSubmissionStatus === 'Late' ? 'Submitted Late' :
                         assignment.studentSubmissionStatus}
                     </span>
                     {assignment.studentSubmittedAt && (
                        <p className="text-xs opacity-70 mt-1">
                            Submitted: {new Date(assignment.studentSubmittedAt).toLocaleDateString()}
                        </p>
                     )}
                  </div>
                </div>
                {assignment.studentSubmissionStatus === 'Pending' && (
                  <button
                    onClick={() => handleStudentSubmitAssignment(assignment.id)}
                    disabled={isSubmittingStudentAction === assignment.id}
                    className="mt-3 flex items-center justify-center px-4 py-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-light focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-colors disabled:opacity-60"
                  >
                    {isSubmittingStudentAction === assignment.id ? (
                      <LoadingSpinner text="Submitting..." />
                    ) : (
                      <> <PaperAirplaneIcon className="w-4 h-4 mr-2 transform -rotate-45" /> Mark as Submitted </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
