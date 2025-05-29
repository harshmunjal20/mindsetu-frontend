
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mood, MoodTrendData, UserType, CurrentUser, StudentAttitudeStats, DropoutRiskAnalysis, AdminDashboardData } from '../types';
import { MOOD_EMOJI_MAP } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { UserAddIcon, SubscriptionIcon, LightBulbIcon, UsersIcon, AlertTriangleIcon as RiskIcon } from './icons'; 
import { getStudentAttitudeStatsForInstitute } from '../services/dataService';
import { getInstituteAssignmentStats } from '../services/assignmentService';
import { generateStudentDropoutRiskAnalysis } from '../services/geminiService';


// Mock data (only for student view now)
const mockMoodHistory: MoodTrendData[] = [
  { date: 'Mon', moodScore: 4 }, { date: 'Tue', moodScore: 2 }, { date: 'Wed', moodScore: 5 },
  { date: 'Thu', moodScore: 3 }, { date: 'Fri', moodScore: 5 }, { date: 'Sat', moodScore: 4 }, { date: 'Sun', moodScore: 3 },
];

const mockAcademicDataStudent = [ // Renamed to avoid conflict
  { metric: 'Assignments On Time', value: '85%', trend: 'stable' }, { metric: 'Class Attendance', value: '92%', trend: 'up' }, { metric: 'Overall Grade', value: 'B+', trend: 'stable' },
];

const mockMoodDistributionStudent = [ // Renamed
  { name: Mood.Happy, value: 400 }, { name: Mood.Calm, value: 300 }, { name: Mood.Neutral, value: 200 },
  { name: Mood.Anxious, value: 150 }, { name: Mood.Stressed, value: 100 }, { name: Mood.Excited, value: 250 }, { name: Mood.Grateful, value: 280 },
];


const CHART_COLORS = ['#4338ca', '#14b8a6', '#22d3ee', '#6366f1', '#0d9488', '#06b6d4', '#a5b4fc']; // Indigo, Teal, Cyan shades
const ATTITUDE_CHART_COLORS = {
    positive: '#22c55e', // green-500
    negative: '#ef4444', // red-500
    neutral: '#64748b'   // slate-500
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
  payload?: Array<{ name: string; value: number | string; payload: any; color?: string; }>; // payload.payload can be complex
  label?: string;
}

const MoodChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const moodName = dataPoint.name; // For Pie chart, this is the mood name
    const moodValue = dataPoint.value;

    let title = label || moodName; // label for Line, moodName for Pie
    let displayText = `${moodName}: ${moodValue}`;

    if (dataPoint.payload && dataPoint.payload.moodScore) { // Line chart specific (mood trend)
        const moodScore = dataPoint.payload.moodScore as number;
        const moodEnumKey = (Object.keys(MOOD_EMOJI_MAP) as Mood[])[moodScore -1];
        if (moodEnumKey) {
             displayText = `Mood Level: ${moodScore} (${MOOD_EMOJI_MAP[moodEnumKey]} ${moodEnumKey})`;
        } else {
            displayText = `Mood Level: ${moodScore}`;
        }
        title = label || dataPoint.payload.date;
    } else if (moodName && typeof moodValue === 'number' && MOOD_EMOJI_MAP[moodName as Mood]) { // Pie chart (mood distribution)
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
    const data = payload[0].payload; // Here payload refers to the data item for the slice
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

// For Pie Chart active shape
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
      <Sector // For hover effect outer ring
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

export const DashboardView: React.FC<DashboardViewProps> = ({ currentUser }) => {
  const [currentQuote, setCurrentQuote] = useState("Today is a new opportunity to grow and learn.");
  const navigate = useNavigate();

  // Admin specific state
  const [adminDashboardData, setAdminDashboardData] = useState<AdminDashboardData>({});
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [errorAdminData, setErrorAdminData] = useState<string | null>(null);
  const [activePieIndex, setActivePieIndex] = useState(0);


  useEffect(() => {
    const quotes = [
      "Believe you can and you're halfway there. - Theodore Roosevelt", "The only way to do great work is to love what you do. - Steve Jobs", "Your limitation—it's only your imagination.",
      "Push yourself, because no one else is going to do it for you.", "Great things never come from comfort zones."
    ];
    setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);
  
  // Fetch admin-specific data
  useEffect(() => {
    if (currentUser?.userType === UserType.Admin) {
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
            throw new Error(errorMsg);
          }
          
          const attitudeStats = attitudeResponse.data;
          const academicStats = academicStatsResponse.data;

          if (!attitudeStats || !academicStats ) {
             throw new Error("Missing critical data for admin dashboard.");
          }
          
          const dropoutRiskResponse = await generateStudentDropoutRiskAnalysis(
            { onTimePercent: academicStats.onTimePercent, latePercent: academicStats.latePercent, missedPercent: academicStats.missedPercent },
            attitudeStats,
            { name: currentUser.instituteName, totalStudents: attitudeStats.totalStudentsInInstitute }
          );
          
          setAdminDashboardData({
            attitudeStats: attitudeStats,
            dropoutRisk: dropoutRiskResponse.success ? dropoutRiskResponse.data : { // Provide fallback if AI fails
                riskLevel: "Unavailable",
                analysisText: dropoutRiskResponse.error || "Dropout risk analysis AI call failed.",
                contributingFactors: [],
                proactiveSuggestions: ["Check Gemini API key and service status."]
            }
          });

        } catch (err: any) {
          setErrorAdminData(err.message || "Failed to load admin dashboard analytics.");
        } finally {
          setIsLoadingAdminData(false);
        }
      };
      fetchAdminDashboardData();
    }
  }, [currentUser]);


  const onPieEnter = useCallback((_: any, index: number) => {
    setActivePieIndex(index);
  }, [setActivePieIndex]);


  if (!currentUser) {
    return <p>Loading user data or redirecting...</p>; 
  }

  const welcomeMessage = `Welcome back, ${currentUser.firstName}!`;
  const userType = currentUser.userType;
  const capitalizedInstituteName = currentUser.instituteName.charAt(0).toUpperCase() + currentUser.instituteName.slice(1);


  return (
    <div className="space-y-6">
      <Card title={welcomeMessage} titleExtra={<span className="text-sm text-brand-secondary dark:text-brand-accent">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>}>
        <p className="text-lg italic text-slate-600 dark:text-slate-300">"{currentQuote}"</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">You are logged in as: <span className="font-semibold">{userType}</span> at <span className="font-semibold">{capitalizedInstituteName}</span></p>
      </Card>

      {/* ADMIN SPECIFIC DASHBOARD SECTIONS */}
      {userType === UserType.Admin && (
        <>
          <Card title="Student Management" icon={<UserAddIcon className="w-6 h-6" />}>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              As an {userType}, you can manage student accounts and view anonymized insights.
            </p>
            <button
              onClick={() => navigate('/add-student')}
              className="flex items-center justify-center w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary-dark text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 dark:focus:ring-offset-base-200-dark transition-all duration-150 ease-in-out"
            >
              <UserAddIcon className="w-5 h-5 mr-2" />
              Add New Student
            </button>
          </Card>
          
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
            <Card title="Student Attitude Overview" icon={<UsersIcon className="w-6 h-6" />}>
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
                      ].filter(d => d.value > 0) } // Filter out zero values for cleaner chart
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill={ATTITUDE_CHART_COLORS.positive} // Default fill, cells override
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      <Cell fill={ATTITUDE_CHART_COLORS.positive} />
                      <Cell fill={ATTITUDE_CHART_COLORS.negative} />
                      <Cell fill={ATTITUDE_CHART_COLORS.neutral} />
                    </Pie>
                    <Tooltip content={<AttitudePieChartTooltip />} />
                     <Legend 
                        formatter={(value, entry) => {
                            const color = entry.color;
                            return <span style={{ color }} className="text-sm">{value} Attitude</span>;
                        }}
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

           {userType === UserType.Admin && !isLoadingAdminData && !errorAdminData && Object.keys(adminDashboardData).length === 0 && (
             <Card title="Institute Analytics">
                <p className="text-slate-500 dark:text-slate-400 text-center py-10">No analytics data to display currently. Data will populate as students use the app.</p>
             </Card>
           )}

          {/* Existing Counselor Insights card for Admin */}
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
      {userType === UserType.Student && (
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockMoodHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
                  <XAxis dataKey="date" className="text-xs text-slate-500 dark:text-slate-400" />
                  <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tickFormatter={(value) => [Mood.Sad, Mood.Anxious, Mood.Neutral, Mood.Calm, Mood.Happy][value-1]} className="text-xs text-slate-500 dark:text-slate-400" />
                  <Tooltip content={<MoodChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.875rem', color: 'var(--base-content-color)' }} />
                  <Line type="monotone" dataKey="moodScore" name="Mood Level" stroke={CHART_COLORS[0]} strokeWidth={2} activeDot={{ r: 8, fill: CHART_COLORS[0] }} dot={{fill: CHART_COLORS[1], r:4}} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Mood Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={mockMoodDistributionStudent} 
                    cx="50%" cy="50%" 
                    labelLine={false} 
                    outerRadius={100} 
                    fill={CHART_COLORS[1]} 
                    dataKey="value" 
                    nameKey="name"
                    label={({ name, percent }) => `${MOOD_EMOJI_MAP[name as Mood]} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockMoodDistributionStudent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<MoodChartTooltip />} />
                  <Legend formatter={(value) => <span className="text-slate-600 dark:text-slate-300 text-sm">{MOOD_EMOJI_MAP[value as Mood]} {value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
           <Card title="Academic Snapshot">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Quick overview of your academic standing. For more details, visit the <button onClick={() => navigate('/academics')} className="text-brand-secondary hover:underline dark:text-brand-accent">Academics</button> page.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
