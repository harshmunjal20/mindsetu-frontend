
import React, { useState, useEffect } from 'react';
import { CurrentUser, SubjectGrade, OverallPerformance, UserType, AdminInstituteAcademicStats, AdminAcademicInsights, User } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { generateAdminAcademicInsights } from '../services/geminiService';
import { getInstituteAssignmentStats } from '../services/assignmentService';
import { LightBulbIcon, AcademicCapIcon as ChartIcon } from './icons';

// Mock Data - In a real app, this would be fetched based on currentUser.id
const mockOverallPerformance: OverallPerformance = {
  gpa: 3.5,
  totalCredits: 60,
  alerts: ["Consider focusing on Math 101 to improve overall GPA."],
};

const mockSubjectGrades: SubjectGrade[] = [
  { id: '1', name: 'Physics 101', grade: 85, term: 'Fall 2023', credits: 3 },
  { id: '2', name: 'CompSci 101', grade: 92, term: 'Fall 2023', credits: 4 },
  { id: '3', name: 'Math 101', grade: 70, term: 'Fall 2023', credits: 3 },
  { id: '4', name: 'Physics 201', grade: 88, term: 'Spring 2024', credits: 3 },
  { id: '5', name: 'CompSci 201', grade: 95, term: 'Spring 2024', credits: 4 },
  { id: '6', name: 'Math 201', grade: 78, term: 'Spring 2024', credits: 3 },
  { id: '7', name: 'Data Structures', grade: 80, term: 'Current', credits: 4 },
  { id: '8', name: 'Algorithms', grade: 75, term: 'Current', credits: 4 },
];

const CHART_COLORS = ['#4338ca', '#14b8a6', '#22d3ee', '#6366f1', '#0d9488', '#06b6d4'];
const USERS_STORAGE_KEY = 'mindsetu_users';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, icon }) => (
  <div className={`p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow dark:bg-base-200-dark bg-white ${className} dark:shadow-brand-primary-dark/10`}>
    <div className="flex items-center mb-4">
      {icon && <span className="mr-3 text-brand-primary dark:text-brand-primary-light">{icon}</span>}
      <h2 className="text-xl font-semibold text-brand-primary dark:text-brand-primary-light">{title}</h2>
    </div>
    {children}
  </div>
);


interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, colorClass = 'text-brand-primary dark:text-brand-primary-light' }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center border dark:border-slate-600 flex flex-col justify-between h-full">
    <div>
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</h3>
      <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
    {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{description}</p>}
  </div>
);

interface InsightSectionProps {
  title: string;
  content: string | string[];
  isLoading?: boolean;
  error?: string | null;
  icon?: React.ReactNode;
}

const InsightSection: React.FC<InsightSectionProps> = ({ title, content, isLoading, error, icon }) => (
  <div className="mt-4">
    <h3 className="text-lg font-semibold text-brand-secondary dark:text-brand-accent mb-2 flex items-center">
      {icon || <LightBulbIcon className="w-5 h-5 mr-2" />} {title}
    </h3>
    {isLoading && <p className="text-slate-500 dark:text-slate-400">Generating insights...</p>}
    {error && <p className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{error}</p>}
    {!isLoading && !error && (
      typeof content === 'string' ? (
        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
      ) : (
        <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {content.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      )
    )}
  </div>
);


interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; payload: any; color?: string }>;
  label?: string;
}

const CustomTooltipContent: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-brand-primary dark:text-brand-primary-light mb-1">{label || payload[0].payload.name}</p>
        {payload.map((pld, index) => (
          <p key={index} style={{ color: pld.color }} className="flex items-center text-base-content-light dark:text-base-content-dark">
            {pld.color && <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: pld.color }}></span>}
            {pld.name}: {pld.value}
            {pld.payload.term && <span className="ml-1 text-xs opacity-70">({pld.payload.term})</span>}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface AcademicPerformanceViewProps {
  currentUser: CurrentUser;
}

export const AcademicPerformanceView: React.FC<AcademicPerformanceViewProps> = ({ currentUser }) => {
  const [instituteStats, setInstituteStats] = useState<AdminInstituteAcademicStats | null>(null); // Re-using Admin types for institute level
  const [insights, setInsights] = useState<AdminAcademicInsights | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [usedMockDataForInsights, setUsedMockDataForInsights] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
      const fetchInstituteData = async () => {
        setIsLoadingData(true);
        setErrorData(null);
        setInsights(null);
        setUsedMockDataForInsights(false);

        try {
          const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
          const allUsers: User[] = usersJson ? JSON.parse(usersJson) : [];

          const activeInstituteStudents = allUsers.filter(
            user => user.instituteName === currentUser.instituteName && user.userType === UserType.Student && user.isActivated
          );
          const totalStudents = activeInstituteStudents.length;

          const assignmentStatsResponse = await getInstituteAssignmentStats(currentUser.instituteName);

          if (!assignmentStatsResponse.success || !assignmentStatsResponse.data) {
             throw new Error(assignmentStatsResponse.error || "Failed to fetch institute assignment statistics.");
          }

          const { onTimePercent, latePercent, missedPercent } = assignmentStatsResponse.data;

          const actualStatsForView: AdminInstituteAcademicStats = {
            totalStudents,
            assignmentsOnTimePercent: onTimePercent,
            assignmentsLatePercent: latePercent,
            assignmentsMissedPercent: missedPercent,
          };
          setInstituteStats(actualStatsForView);

          const statsForGeminiAPI: {
            totalStudents: number;
            onTimePercent: number;
            latePercent: number;
            missedPercent: number;
            instituteName: string;
          } = {
            totalStudents: actualStatsForView.totalStudents,
            onTimePercent: 0,
            latePercent: 0,
            missedPercent: 0,
            instituteName: currentUser.instituteName.charAt(0).toUpperCase() + currentUser.instituteName.slice(1),
          };

          if (actualStatsForView.totalStudents > 0 && actualStatsForView.assignmentsOnTimePercent === 0 && actualStatsForView.assignmentsLatePercent === 0 && actualStatsForView.assignmentsMissedPercent === 0) {
            statsForGeminiAPI.onTimePercent = 70;
            statsForGeminiAPI.latePercent = 20;
            statsForGeminiAPI.missedPercent = 10;
            setUsedMockDataForInsights(true);
          } else {
            statsForGeminiAPI.onTimePercent = actualStatsForView.assignmentsOnTimePercent;
            statsForGeminiAPI.latePercent = actualStatsForView.assignmentsLatePercent;
            statsForGeminiAPI.missedPercent = actualStatsForView.assignmentsMissedPercent;
            setUsedMockDataForInsights(false);
          }

          const insightsResponse = await generateAdminAcademicInsights(statsForGeminiAPI);

          if (insightsResponse.success && insightsResponse.data) {
            setInsights(insightsResponse.data);
          } else {
            setErrorData(insightsResponse.error || "Failed to load AI insights.");
            if (insightsResponse.data) setInsights(insightsResponse.data);
          }

        } catch (err: any) {
          setErrorData(err.message || "An error occurred while fetching institute data.");
          setInsights({
            academicPressureAnalysis: "Could not retrieve AI analysis due to a data fetching error.",
            studentRetentionTips: ["Ensure all systems are operational.", "Review student support resources."]
          });
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchInstituteData();
    }
  }, [currentUser]);


  if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
    const capitalizedInstituteName = currentUser.instituteName.charAt(0).toUpperCase() + currentUser.instituteName.slice(1);
    const roleDisplay = currentUser.userType === UserType.SuperAdmin ? "Super Admin" : "Teacher";
    return (
      <div className="space-y-6">
        <Card
            title={`Academic Overview for ${capitalizedInstituteName}`}
            icon={<ChartIcon className="w-7 h-7" />}
            className="border-b-4 border-brand-primary dark:border-brand-primary-light"
        >
            <p className="text-sm text-slate-600 dark:text-slate-400">
                This dashboard provides an aggregated overview of student academic engagement patterns within your institute.
                You are viewing this as a {roleDisplay}. AI-generated insights are based on available data.
            </p>
        </Card>

        {isLoadingData && <p className="text-center py-4 text-slate-500 dark:text-slate-400">Loading institute data...</p>}
        {!isLoadingData && errorData && !instituteStats &&
           <Card title="Data Error" icon={<ChartIcon className="w-6 h-6" />}>
             <p className="text-red-500 dark:text-red-400">{errorData}</p>
           </Card>
        }

        {instituteStats && (
          <Card title="Institute Engagement Statistics" icon={<ChartIcon className="w-6 h-6" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Active Students" value={instituteStats.totalStudents} />
              <StatCard
                title="Assignments On-Time"
                value={`${instituteStats.assignmentsOnTimePercent.toFixed(1)}%`}
                colorClass="text-green-600 dark:text-green-400"
                description="Of submitted assignments"
              />
              <StatCard
                title="Assignments Late"
                value={`${instituteStats.assignmentsLatePercent.toFixed(1)}%`}
                colorClass="text-amber-600 dark:text-amber-400"
                description="Of submitted assignments"
              />
              <StatCard
                title="Assignments Missed"
                value={`${instituteStats.assignmentsMissedPercent.toFixed(1)}%`}
                colorClass="text-red-600 dark:text-red-400"
                description="Of past-due assignments by active students"
              />
            </div>
          </Card>
        )}

        <Card title="AI-Powered Insights" icon={<LightBulbIcon className="w-6 h-6" />}>
          {isLoadingData && <p className="text-center py-4 text-slate-500 dark:text-slate-400">Loading AI insights...</p>}
          {!isLoadingData && errorData &&
            <div className="text-center py-4 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              <p><strong>Error loading insights:</strong> {errorData}</p>
              {insights?.academicPressureAnalysis && insights?.studentRetentionTips && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Displaying fallback information if available.</p>
              )}
            </div>
          }
          {insights && (
            <>
              <InsightSection
                title="Academic Pressure Analysis"
                content={insights.academicPressureAnalysis}
                isLoading={isLoadingData && !insights.academicPressureAnalysis}
                error={!isLoadingData && errorData && !insights.academicPressureAnalysis ? errorData : null}
              />
              <InsightSection
                title="Student Retention Pro-Tips"
                content={insights.studentRetentionTips}
                isLoading={isLoadingData && !insights.studentRetentionTips?.length}
                error={!isLoadingData && errorData && !insights.studentRetentionTips?.length ? errorData : null}
                icon={<ChartIcon className="w-5 h-5 mr-2" />}
              />
              {usedMockDataForInsights && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center italic">
                  (Note: AI analysis was based on illustrative sample data as no current assignment activity is recorded for students in this institute.)
                </p>
              )}
            </>
          )}
           {!isLoadingData && !insights && !errorData && (
            <p className="text-slate-500 dark:text-slate-400">No insights available at the moment. More data might be needed.</p>
          )}
        </Card>
      </div>
    );
  }

  // --- STUDENT VIEW ---
  const gradeTrendData = mockSubjectGrades
    .filter(sg => sg.term !== 'Current')
    .reduce((acc, subject) => {
      let termEntry = acc.find(item => item.term === subject.term);
      if (!termEntry) {
        termEntry = { term: subject.term };
        acc.push(termEntry);
      }
      (termEntry as any)[subject.name] = subject.grade;
      return acc;
    }, [] as Array<{ term: string; [subjectName: string]: number | string }>)
    .sort((a, b) => a.term.localeCompare(b.term));

  const uniqueSubjectNames = Array.from(new Set(mockSubjectGrades.filter(sg => sg.term !== 'Current').map(sg => sg.name)));
  const currentSemesterGrades = mockSubjectGrades.filter(sg => sg.term === 'Current');
  const capitalizedInstituteNameStudent = currentUser.instituteName.charAt(0).toUpperCase() + currentUser.instituteName.slice(1);


  return (
    <div className="space-y-6">
      <Card title="Student Academic Profile" className="border-b-4 border-brand-secondary dark:border-brand-accent">
        <div className="mb-4">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {currentUser.firstName} {currentUser.lastName}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {currentUser.email}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Institute: {capitalizedInstituteNameStudent}
          </p>
        </div>
         <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          Displaying academic performance for the logged-in student.
        </p>
      </Card>

      <Card title="Overall Academic Standing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Current GPA</h3>
            <p className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light">{mockOverallPerformance.gpa.toFixed(2)}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border dark:border-slate-600">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Credits Earned</h3>
            <p className="text-3xl font-bold text-brand-primary dark:text-brand-primary-light">{mockOverallPerformance.totalCredits}</p>
          </div>
        </div>
        {mockOverallPerformance.alerts.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 rounded">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Alerts:</strong> {mockOverallPerformance.alerts.join(' ')}
            </p>
          </div>
        )}
      </Card>

      <Card title="Grade Trends Over Time">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={gradeTrendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
            <XAxis dataKey="term" className="text-xs text-slate-500 dark:text-slate-400" />
            <YAxis domain={[0, 100]} className="text-xs text-slate-500 dark:text-slate-400" />
            <Tooltip content={<CustomTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: '0.875rem', color: 'var(--base-content-color)' }} />
            {uniqueSubjectNames.map((subjectName, index) => (
              <Line
                key={subjectName}
                type="monotone"
                dataKey={subjectName}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Current Semester Performance">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={currentSemesterGrades} layout="vertical" margin={{ left: 20, right:20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
            <XAxis type="number" domain={[0, 100]} className="text-xs text-slate-500 dark:text-slate-400" />
            <YAxis dataKey="name" type="category" width={120} interval={0} className="text-xs text-slate-500 dark:text-slate-400" />
            <Tooltip content={<CustomTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: '0.875rem', color: 'var(--base-content-color)' }} />
            <Bar dataKey="grade" name="Grade (%)" radius={[0, 5, 5, 0]}>
              {currentSemesterGrades.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400">(All data is mocked for demonstration purposes and represents a sample student. This view would show your specific data.)</p>
    </div>
  );
};
