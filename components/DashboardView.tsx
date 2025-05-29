
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mood, MoodEntry, UserType, CurrentUser, StudentAttitudeStats, DropoutRiskAnalysis, AdminDashboardData, MoodTrendData as OriginalMoodTrendData } from '../types';
import { MOOD_EMOJI_MAP } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { UserAddIcon, SubscriptionIcon, LightBulbIcon, UsersIcon as ManagementIcon, AlertTriangleIcon as RiskIcon } from './icons'; 
import { getStudentAttitudeStatsForInstitute, getJournalEntriesForUser } from '../services/dataService';
import { getInstituteAssignmentStats } from '../services/assignmentService';
import { generateStudentDropoutRiskAnalysis } from '../services/geminiService';


// Student Mood Trend Data - extended to include original mood for better tooltips
interface StudentMoodTrendData {
  date: string; // Short day name e.g., "Mon"
  moodScore: number;
  originalMood: Mood;
}

// Student Academic Data - Attendance removed
const mockAcademicDataStudent = [
  { metric: 'Assignments On Time', value: '85%', trend: 'stable' },
  // { metric: 'Class Attendance', value: '92%', trend: 'up' }, // Removed
  { metric: 'Overall Grade', value: 'B+', trend: 'stable' },
];


const CHART_COLORS = ['#4338ca', '#14b8a6', '#22d3ee', '#6366f1', '#0d9488', '#06b6d4', '#a5b4fc'];
const ATTITUDE_CHART_COLORS = {
    positive: '#22c55e',
    negative: '#ef4444',
    neutral: '#64748b'
};

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  titleExtra?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className, titleExtra, icon }) => (
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


interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; payload: any; color?: string; }>;
  label?: string;
}

const MoodChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const moodName = dataPoint.name; // For Pie chart
    const moodValue = dataPoint.value; // For Pie chart

    let title = label || moodName;
    let displayText = `${moodName}: ${moodValue}`;

    // For Line Chart (Weekly Mood Trend)
    if (dataPoint.payload && typeof dataPoint.payload.moodScore === 'number' && dataPoint.payload.originalMood) {
        const originalMood = dataPoint.payload.originalMood as Mood;
        displayText = `${MOOD_EMOJI_MAP[originalMood]} ${originalMood} (Score: ${dataPoint.payload.moodScore})`;
        title = label || dataPoint.payload.date; // Date from XAxis
    } 
    // For Pie Chart (Mood Distribution)
    else if (moodName && typeof moodValue === 'number' && MOOD_EMOJI_MAP[moodName as Mood] && dataPoint.payload && typeof dataPoint.payload.percent === 'number') {
         const percentage = (dataPoint.payload.percent * 100).toFixed(0);
         displayText = `${MOOD_EMOJI_MAP[moodName as Mood]} ${moodName}: ${percentage}%`;
    }


    return (
      <div className="bg-white/95 dark:bg-slate-800/95 p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-brand-primary dark:text-brand-primary-light mb-1">{title}</p>
         <p className="text-base-content-light dark:text-base-content-dark flex items-center">
            {dataPoint.color && <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: dataPoint.color }}></span>}
            {displayText}
          </p>
      </div>
    );
  }
  return null;
};

const AttitudePieChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 p-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl text-sm">
        <p className="font-bold text-brand-primary dark:text-brand-primary-light mb-1">{data.name} Attitude</p>
        <p className="text-base-content-light dark:text-base-content-dark">
          {`${data.value.toFixed(1)}% of analyzed students`}
        </p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold text-lg">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
        opacity={0.5}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="dark:fill-slate-200 text-sm">
        {`${payload.name}`}
      </text>
       <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="dark:fill-slate-400 text-xs">
        {`(${(value).toFixed(1)}%)`}
      </text>
    </g>
  );
};


const RiskIndicator: React.FC<{ level: DropoutRiskAnalysis['riskLevel'] }> = ({ level }) => {
  let bgColor = 'bg-slate-500';
  let textColor = 'text-white';
  if (level === 'Low') { bgColor = 'bg-green-500 dark:bg-green-600'; }
  else if (level === 'Moderate') { bgColor = 'bg-yellow-500 dark:bg-yellow-400'; textColor="text-slate-800"}
  else if (level === 'High') { bgColor = 'bg-red-500 dark:bg-red-600'; }
  else if (level === 'Unavailable') {bgColor = 'bg-slate-300 dark:bg-slate-600'; textColor="text-slate-700 dark:text-slate-200"}

  return (
    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${textColor}`}>
      {level}
    </span>
  );
};

interface DashboardViewProps {
  currentUser: CurrentUser | null;
}

const getMoodScore = (mood: Mood): number => {
  switch (mood) {
    case Mood.Sad:
    case Mood.Stressed:
      return 1;
    case Mood.Anxious:
      return 2;
    case Mood.Neutral:
      return 3;
    case Mood.Calm:
    case Mood.Grateful:
      return 4;
    case Mood.Happy:
    case Mood.Excited:
      return 5;
    default:
      return 3; // Default to Neutral score
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser }) => {
  const [currentQuote, setCurrentQuote] = useState("Today is a new opportunity to grow and learn.");
  const navigate = useNavigate();

  // Admin/Teacher states
  const [adminDashboardData, setAdminDashboardData] = useState<AdminDashboardData>({});
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [errorAdminData, setErrorAdminData] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState(0);

  // Student states for dynamic journal data
  const [studentJournalEntries, setStudentJournalEntries] = useState<MoodEntry[] | null>(null);
  const [isLoadingStudentJournal, setIsLoadingStudentJournal] = useState(false);
  const [errorStudentJournal, setErrorStudentJournal] = useState<string | null>(null);

  const [dynamicMoodTrend, setDynamicMoodTrend] = useState<StudentMoodTrendData[]>([]);
  const [dynamicMoodDistribution, setDynamicMoodDistribution] = useState<Array<{name: Mood, value: number}>>([]);


  useEffect(() => {
    const quotes = [
      "Believe you can and you're halfway there. - Theodore Roosevelt", "The only way to do great work is to love what you do. - Steve Jobs", "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.", "Great things never come from comfort zones."
    ];
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) {
      const fetchAdminDashboardData = async () => {
        setIsLoadingAdminData(true);
        setErrorAdminData(null);
        try {
          const attitudeResponse = await getStudentAttitudeStatsForInstitute(currentUser.instituteName);
          const academicStatsResponse = await getInstituteAssignmentStats(currentUser.instituteName);

          if (!attitudeResponse.success || !academicStatsResponse.success) {
            let errorMsg = "";
            if (!attitudeResponse.success) errorMsg += (attitudeResponse.error || "Failed to load attitude stats. ");
            if (!academicStatsResponse.success) errorMsg += (academicStatsResponse.error || "Failed to load academic stats.");
            throw new Error(errorMsg || "Failed to load dashboard data.");
          }

          const attitudeStats = attitudeResponse.data;
          const academicStats = academicStatsResponse.data;

          if (!attitudeStats || !academicStats ) {
             throw new Error("Missing critical data for dashboard analytics.");
          }

          const dropoutRiskResponse = await generateStudentDropoutRiskAnalysis(
            { onTimePercent: academicStats.onTimePercent, latePercent: academicStats.latePercent, missedPercent: academicStats.missedPercent },
            attitudeStats,
            { name: currentUser.instituteName, totalStudents: attitudeStats.totalStudentsInInstitute }
          );

          setAdminDashboardData({
            attitudeStats: attitudeStats,
            dropoutRisk: dropoutRiskResponse.success ? dropoutRiskResponse.data : {
                riskLevel: "Unavailable",
                analysisText: dropoutRiskResponse.error || "Dropout risk analysis AI call failed.",
                contributingFactors: [],
                proactiveSuggestions: ["Check Gemini API key and service status."]
            }
          });

        } catch (err: any) {
          setErrorAdminData(err.message || "Failed to load dashboard analytics.");
        } finally {
          setIsLoadingAdminData(false);
        }
      };
      fetchAdminDashboardData();
    } else if (currentUser.userType === UserType.Student) {
      const fetchStudentJournalData = async () => {
        setIsLoadingStudentJournal(true);
        setErrorStudentJournal(null);
        try {
          const response = await getJournalEntriesForUser(currentUser.id);
          if (response.success && response.data) {
            setStudentJournalEntries(response.data);
          } else {
            setErrorStudentJournal(response.error || "Failed to load journal entries.");
            setStudentJournalEntries([]); // Set to empty array on error to avoid null checks later
          }
        } catch (err: any) {
          setErrorStudentJournal(err.message || "An unexpected error occurred.");
          setStudentJournalEntries([]);
        } finally {
          setIsLoadingStudentJournal(false);
        }
      };
      fetchStudentJournalData();
    }
  }, [currentUser]);


  // Process student journal entries for charts
  useEffect(() => {
    if (currentUser?.userType === UserType.Student && studentJournalEntries) {
      if (studentJournalEntries.length > 0) {
        // Process for Weekly Mood Trend
        const dailyLatestEntries: { [dateKey: string]: MoodEntry } = {};
        studentJournalEntries.forEach(entry => {
          const entryDate = new Date(entry.date);
          const dateKey = entryDate.toISOString().split('T')[0]; // YYYY-MM-DD
          if (!dailyLatestEntries[dateKey] || new Date(entry.date) > new Date(dailyLatestEntries[dateKey].date)) {
            dailyLatestEntries[dateKey] = entry;
          }
        });

        const sortedUniqueDays = Object.values(dailyLatestEntries)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const last7DaysData = sortedUniqueDays.slice(0, 7).reverse(); // Take last 7 and reverse for chronological chart
        
        setDynamicMoodTrend(last7DaysData.map(entry => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
          moodScore: getMoodScore(entry.mood),
          originalMood: entry.mood,
        })));

        // Process for Mood Distribution
        const moodCounts: { [key in Mood]?: number } = {};
        studentJournalEntries.forEach(entry => {
          moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        setDynamicMoodDistribution(
          (Object.keys(moodCounts) as Mood[]).map(mood => ({
            name: mood,
            value: moodCounts[mood]!,
          }))
        );
      } else {
        setDynamicMoodTrend([]);
        setDynamicMoodDistribution([]);
      }
    }
  }, [studentJournalEntries, currentUser]);


  const onPieEnter = useCallback((_: any, index: number) => {
    setActivePieIndex(index);
  }, [setActivePieIndex]);


  if (!currentUser) {
    return <p>Loading user data or redirecting...</p>;
  }

  const userRoleDisplay = currentUser.userType === UserType.SuperAdmin ? "Super Admin" : currentUser.userType;
  const welcomeMessage = `Welcome back, ${currentUser.firstName}!`;
  const capitalizedInstituteName = currentUser.instituteName.charAt(0).toUpperCase() + currentUser.instituteName.slice(1);


  const renderStudentMoodTrendChart = () => {
    if (isLoadingStudentJournal) return <p className="text-center py-10 text-slate-500 dark:text-slate-400">Loading mood data...</p>;
    if (errorStudentJournal) return <p className="text-center py-10 text-red-500 dark:text-red-400">Error: {errorStudentJournal}</p>;
    if (dynamicMoodTrend.length === 0) return <p className="text-center py-10 text-slate-500 dark:text-slate-400">No mood data logged yet. Start journaling to see your trend!</p>;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dynamicMoodTrend}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
          <XAxis dataKey="date" className="text-xs text-slate-500 dark:text-slate-400" />
          <YAxis 
            domain={[1, 5]} 
            ticks={[1, 2, 3, 4, 5]} 
            tickFormatter={(value) => ({1: Mood.Sad, 2: Mood.Anxious, 3: Mood.Neutral, 4: Mood.Calm, 5: Mood.Happy}[value] || value.toString())}
            className="text-xs text-slate-500 dark:text-slate-400" 
           />
          <Tooltip content={<MoodChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.875rem' }} formatter={() => "Your Mood"}/>
          <Line type="monotone" dataKey="moodScore" name="Mood Level" stroke={CHART_COLORS[0]} strokeWidth={2} activeDot={{ r: 8, fill: CHART_COLORS[0] }} dot={{fill: CHART_COLORS[1], r:4}} />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderStudentMoodDistributionChart = () => {
    if (isLoadingStudentJournal) return <p className="text-center py-10 text-slate-500 dark:text-slate-400">Loading mood distribution...</p>;
    if (errorStudentJournal) return <p className="text-center py-10 text-red-500 dark:text-red-400">Error: {errorStudentJournal}</p>;
    if (dynamicMoodDistribution.length === 0) return <p className="text-center py-10 text-slate-500 dark:text-slate-400">No mood entries found to display distribution.</p>;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dynamicMoodDistribution}
            cx="50%" cy="50%"
            labelLine={false}
            outerRadius={100}
            fill={CHART_COLORS[1]}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${MOOD_EMOJI_MAP[name as Mood]} ${(percent * 100).toFixed(0)}%`}
          >
            {dynamicMoodDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<MoodChartTooltip />} />
          <Legend formatter={(value) => <span className="text-slate-600 dark:text-slate-300 text-sm">{MOOD_EMOJI_MAP[value as Mood]} {value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    );
  };


  return (
    <div className="space-y-6">
      <Card title={welcomeMessage} titleExtra={<span className="text-sm text-brand-secondary dark:text-brand-accent">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>}>
        <p className="text-lg italic text-slate-600 dark:text-slate-300">"{currentQuote}"</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You are logged in as: <span className="font-semibold">{userRoleDisplay}</span> at <span className="font-semibold">{capitalizedInstituteName}</span></p>
      </Card>

      {/* SUPERADMIN SPECIFIC DASHBOARD SECTION */}
      {currentUser.userType === UserType.SuperAdmin && (
        <Card title="Teacher Management" icon={<ManagementIcon className="w-6 h-6" />}>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            As a SuperAdmin, you can pre-register new teachers for {capitalizedInstituteName}.
          </p>
          <button
            onClick={() => navigate('/add-teacher')}
            className="flex items-center justify-center w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-all duration-150 ease-in-out"
          >
            <ManagementIcon className="w-5 h-5 mr-2" />
            Add New Teacher
          </button>
        </Card>
      )}

      {/* TEACHER SPECIFIC DASHBOARD SECTION (Also accessible by SuperAdmin as they share teacher features) */}
      {(currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) && (
        <Card title="Student Management" icon={<UserAddIcon className="w-6 h-6" />}>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            As a {userRoleDisplay}, you can pre-register new students for {capitalizedInstituteName}.
          </p>
          <button
            onClick={() => navigate('/add-student')}
            className="flex items-center justify-center w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-all duration-150 ease-in-out"
          >
            <UserAddIcon className="w-5 h-5 mr-2" />
            Add New Student
          </button>
        </Card>
      )}

      {/* INSTITUTE ANALYTICS FOR TEACHER & SUPERADMIN */}
      {(currentUser.userType === UserType.Teacher || currentUser.userType === UserType.SuperAdmin) && (
        <>
          {isLoadingAdminData && (
            <Card title="Institute Analytics">
              <div className="flex justify-center items-center h-40">
                <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="ml-3 text-slate-500 dark:text-slate-400">Loading institute analytics...</p>
              </div>
            </Card>
          )}
          {errorAdminData && (
            <Card title="Institute Analytics Error">
              <p className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                Error loading analytics: {errorAdminData}
              </p>
            </Card>
          )}

          {!isLoadingAdminData && !errorAdminData && adminDashboardData.attitudeStats && (
            <Card title="Student Attitude Overview" icon={<ManagementIcon className="w-6 h-6" />}>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Based on journal entries from {adminDashboardData.attitudeStats.analyzedStudentCount} of {adminDashboardData.attitudeStats.totalStudentsInInstitute} students in {capitalizedInstituteName}.
              </p>
              {adminDashboardData.attitudeStats.analyzedStudentCount > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      activeIndex={activePieIndex}
                      activeShape={renderActiveShape}
                      data={[
                        { name: 'Positive', value: adminDashboardData.attitudeStats.positivePercent },
                        { name: 'Negative', value: adminDashboardData.attitudeStats.negativePercent },
                        { name: 'Neutral/Mixed', value: adminDashboardData.attitudeStats.neutralPercent },
                      ].filter(d => d.value > 0) }
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill={ATTITUDE_CHART_COLORS.positive}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      <Cell fill={ATTITUDE_CHART_COLORS.positive} />
                      <Cell fill={ATTITUDE_CHART_COLORS.negative} />
                      <Cell fill={ATTITUDE_CHART_COLORS.neutral} />
                    </Pie>
                    <Tooltip content={<AttitudePieChartTooltip />} />
                     <Legend
                        formatter={(value) => <span style={{ color: (ATTITUDE_CHART_COLORS as any)[value.toLowerCase()] || '#000' }} className="text-sm">{value} Attitude</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-center py-10">
                  Not enough journal data available from students in {capitalizedInstituteName} to display attitude overview.
                </p>
              )}
            </Card>
          )}

          {!isLoadingAdminData && !errorAdminData && adminDashboardData.dropoutRisk && (
             <Card title="Student Dropout Risk Analysis (AI Simulated)" icon={<RiskIcon className="w-6 h-6" />}>
                <div className="mb-4">
                    <span className="mr-2 font-semibold text-slate-700 dark:text-slate-200">Overall Risk Level:</span>
                    <RiskIndicator level={adminDashboardData.dropoutRisk.riskLevel} />
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm leading-relaxed">{adminDashboardData.dropoutRisk.analysisText}</p>

                {adminDashboardData.dropoutRisk.contributingFactors.length > 0 && (
                    <div className="mb-3">
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1">Key Contributing Factors:</h4>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-slate-600 dark:text-slate-300 text-xs">
                            {adminDashboardData.dropoutRisk.contributingFactors.map((factor, i) => <li key={`factor-${i}`}>{factor}</li>)}
                        </ul>
                    </div>
                )}
                {adminDashboardData.dropoutRisk.proactiveSuggestions.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm mb-1">Proactive Suggestions:</h4>
                        <ul className="list-disc list-inside pl-1 space-y-0.5 text-slate-600 dark:text-slate-300 text-xs">
                            {adminDashboardData.dropoutRisk.proactiveSuggestions.map((tip, i) => <li key={`tip-${i}`}>{tip}</li>)}
                        </ul>
                    </div>
                )}
                <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400 italic">
                  (This is an AI-simulated analysis based on aggregated academic and mood data.)
                </p>
             </Card>
          )}
          {!isLoadingAdminData && !errorAdminData && Object.keys(adminDashboardData).length === 0 && (
             <Card title="Institute Analytics">
                <p className="text-slate-500 dark:text-slate-400 text-center py-10">No analytics data to display currently. Data will populate as students use the app.</p>
             </Card>
           )}
          <Card title="Counselor Insights (Anonymized & Mocked)" icon={<LightBulbIcon className="w-6 h-6" />}>
            <div className="bg-brand-accent/10 dark:bg-brand-accent/20 border-l-4 border-brand-accent dark:border-brand-accent-light p-4 rounded">
              <p className="text-brand-secondary-dark dark:text-brand-accent-light">
                AI has detected <strong className="font-semibold">2 students</strong> with consistently low self-reported mood and concerning engagement patterns (e.g., declining academic performance or late late assignment submissions) over the past two weeks.
                Further review by counseling staff is recommended.
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">(This is a simulated alert for demonstration)</p>
          </Card>
        </>
      )}


      {/* STUDENT DASHBOARD SECTIONS */}
      {currentUser.userType === UserType.Student && (
        <>
          <Card title="Current Subscription Plan" icon={<SubscriptionIcon className="w-6 h-6" />}>
            <div className="text-slate-700 dark:text-slate-200">
              <p className="mb-1">
                <span className="font-semibold">Plan:</span> Starter Plan
              </p>
              <p>
                <span className="font-semibold">Institute:</span> {capitalizedInstituteName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                This is your current institute's plan. For details on features, please contact your institute administrator.
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Weekly Mood Trend">
                {renderStudentMoodTrendChart()}
            </Card>

            <Card title="Mood Distribution">
                {renderStudentMoodDistributionChart()}
            </Card>
          </div>
           <Card title="Academic Snapshot">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Quick overview of your academic standing. For more details, visit the <button onClick={() => navigate('/academics')} className="text-brand-secondary hover:underline dark:text-brand-accent">Academics</button> page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
              {mockAcademicDataStudent.map((item) => (
                <div key={item.metric} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center border dark:border-slate-600">
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.metric}</h3>
                  <p className="text-2xl font-bold text-brand-primary dark:text-brand-primary-light">{item.value}</p>
                  {item.trend && (
                    <span className={`text-xs ${item.trend === 'up' ? 'text-green-500' : item.trend === 'down' ? 'text-red-500' : 'text-slate-500'}`}>
                      {item.trend === 'up' ? '▲' : item.trend === 'down' ? '▼' : '●'} {item.trend}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">(Mock data for demonstration purposes)</p>
          </Card>
        </>
      )}
    </div>
  );
};
