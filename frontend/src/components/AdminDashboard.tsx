// import { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   TextField,
//   MenuItem,
//   CircularProgress,
//   Collapse,
//   Button,
//   Chip,
// } from '@mui/material';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   Cell,
// } from 'recharts';
// import { format, isWithinInterval, parse, startOfDay, endOfDay } from 'date-fns';
// import {
//   TrendingUp,
//   Users,
//   Building2,
//   Award,
//   Filter,
//   ChevronDown,
// } from 'lucide-react';

// interface AssessmentDetail {
//   Candidate: string;
//   "Assessment Date": string;
//   Company: string;
//   Round: string;
// }

// interface ExpertData {
//   total_assessments: number;
//   successful_assessments: number;
//   conversion_ratio: number;
//   successful_assessments_details: AssessmentDetail[];
//   candidates: {
//     [key: string]: {
//       total_assessments: number;
//       successful_assessments: number;
//       non_successful_assessments: number;
//       conversion_ratio: number;
//       successful_assessments_details: AssessmentDetail[];
//       non_successful_assessments_details: AssessmentDetail[];
//     };
//   };
// }

// interface DashboardData {
//   totalAssessments: number;
//   totalExperts: number;
//   conversionRate: number;
//   topExpert: string;
//   topCompany: string;
//   expertPerformance: Array<{
//     name: string;
//     success: number;
//     failure: number;
//   }>;
//   expertConversion: Array<{
//     name: string;
//     rate: number;
//     total: number;
//   }>;
//   timelineTrend: Array<{
//     date: string;
//     count: number;
//   }>;
//   companyVolume: Array<{
//     name: string;
//     total: number;
//     success: number;
//     failure: number;
//   }>;
//   expertSummary: Array<{
//     name: string;
//     total: number;
//     success: number;
//     conversionRate: number;
//   }>;
//   candidatePerformance: Array<{
//     candidate: string;
//     expert: string;
//     total: number;
//     success: number;
//     failure: number;
//     conversionRate: number;
//   }>;
// }

// export function AdminDashboard() {
//   const [rawData, setRawData] = useState<Record<string, ExpertData> | null>(null);
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [selectedExpert, setSelectedExpert] = useState<string>('all');
//   const [selectedCompany, setSelectedCompany] = useState<string>('all');
//   const [showFilters, setShowFilters] = useState(false);

//   const processRawData = (rawData: Record<string, ExpertData>): DashboardData => {
//     if (!rawData || Object.keys(rawData).length === 0) {
//       return {
//         totalAssessments: 0,
//         totalExperts: 0,
//         conversionRate: 0,
//         topExpert: 'N/A',
//         topCompany: 'N/A',
//         expertPerformance: [],
//         expertConversion: [],
//         timelineTrend: [],
//         companyVolume: [],
//         expertSummary: [],
//         candidatePerformance: [],
//       };
//     }

//     const experts = Object.entries(rawData);
    
//     const totalAssessments = experts.reduce((sum, [_, data]) => sum + data.total_assessments, 0);
//     const totalExperts = experts.length;
    
//     const totalSuccessful = experts.reduce((sum, [_, data]) => sum + data.successful_assessments, 0);
//     const conversionRate = totalAssessments > 0 ? (totalSuccessful / totalAssessments) * 100 : 0;
    
//     const expertsWithMinAssessments = experts.filter(([_, data]) => data.total_assessments >= 10);
//     const topExpertEntry = expertsWithMinAssessments.length > 0 
//       ? expertsWithMinAssessments.reduce((prev, curr) => 
//           curr[1].conversion_ratio > prev[1].conversion_ratio ? curr : prev
//         )
//       : ['N/A', { conversion_ratio: 0 }];
    
//     // Fix for the topExpert type issue - ensure it's always a string
//     const topExpert = topExpertEntry[0].toString();
    
//     const companyStats = new Map<string, { success: number; total: number }>();
//     experts.forEach(([_, expertData]) => {
//       expertData.successful_assessments_details.forEach(detail => {
//         const company = detail.Company;
//         if (!company) return;

//         if (!companyStats.has(company)) {
//           companyStats.set(company, { success: 0, total: 0 });
//         }
//         const stats = companyStats.get(company)!;
//         stats.success++;
//         stats.total++;
//       });
      
//       Object.values(expertData.candidates).forEach(candidate => {
//         candidate.non_successful_assessments_details.forEach(detail => {
//           const company = detail.Company;
//           if (!company) return;

//           if (!companyStats.has(company)) {
//             companyStats.set(company, { success: 0, total: 0 });
//           }
//           companyStats.get(company)!.total++;
//         });
//       });
//     });
    
//     const topCompanyEntry = Array.from(companyStats.entries())
//       .reduce((prev, curr) => curr[1].total > prev[1].total ? curr : prev, ['N/A', { total: 0, success: 0 }]);
//     const topCompany = topCompanyEntry[0];
    
//     const expertPerformance = experts.map(([name, data]) => ({
//       name,
//       success: data.successful_assessments,
//       failure: Object.values(data.candidates).reduce(
//         (sum, candidate) => sum + candidate.non_successful_assessments,
//         0
//       ),
//     }));
    
//     const expertConversion = experts.map(([name, data]) => ({
//       name,
//       rate: data.conversion_ratio,
//       total: data.total_assessments,
//     }));
    
//     const timelineTrend = new Map<string, number>();
//     experts.forEach(([_, expertData]) => {
//       expertData.successful_assessments_details.forEach(detail => {
//         if (!detail["Assessment Date"]) return;
//         try {
//           const date = format(new Date(detail["Assessment Date"]), 'yyyy-MM-dd');
//           timelineTrend.set(date, (timelineTrend.get(date) || 0) + 1);
//         } catch (error) {
//           console.error('Error parsing date:', detail["Assessment Date"]);
//         }
//       });
//     });
    
//     const companyVolume = Array.from(companyStats.entries()).map(([name, stats]) => ({
//       name,
//       total: stats.total,
//       success: stats.success,
//       failure: stats.total - stats.success,
//     }));
    
//     const expertSummary = experts.map(([name, data]) => ({
//       name,
//       total: data.total_assessments,
//       success: data.successful_assessments,
//       conversionRate: data.conversion_ratio,
//     }));
    
//     const candidatePerformance = experts.flatMap(([expertName, expertData]) =>
//       Object.entries(expertData.candidates).map(([candidateName, candidateData]) => ({
//         candidate: candidateName,
//         expert: expertName,
//         total: candidateData.total_assessments,
//         success: candidateData.successful_assessments,
//         failure: candidateData.non_successful_assessments,
//         conversionRate: candidateData.conversion_ratio,
//       }))
//     );
    
//     return {
//       totalAssessments,
//       totalExperts,
//       conversionRate,
//       topExpert,
//       topCompany,
//       expertPerformance,
//       expertConversion,
//       timelineTrend: Array.from(timelineTrend.entries())
//         .map(([date, count]) => ({ date, count }))
//         .sort((a, b) => a.date.localeCompare(b.date)),
//       companyVolume,
//       expertSummary,
//       candidatePerformance,
//     };
//   };

//   const clearFilters = () => {
//     setStartDate(null);
//     setEndDate(null);
//     setSelectedExpert('all');
//     setSelectedCompany('all');
//     if (rawData) {
//       const processedData = processRawData(rawData);
//       setData(processedData);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/admin/data'); // ✅ Updated URL
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const fetchedData = await response.json();
//         console.log("Fetched Data:", fetchedData); 
//         setRawData(fetchedData);
//         const processedData = processRawData(fetchedData);
//         setData(processedData);
//         setLoading(false);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, []);
  

//   useEffect(() => {
//     if (!rawData) return;

//     const isDateInRange = (dateStr: string) => {
//       if (!startDate || !endDate) return true;
//       try {
//         const date = parse(dateStr, 'M/d/yyyy', new Date());
//         return isWithinInterval(date, {
//           start: startOfDay(startDate),
//           end: endOfDay(endDate)
//         });
//       } catch (error) {
//         console.error('Error parsing date:', dateStr);
//         return false;
//       }
//     };

//     // Fix for the type issue with filterAssessmentsByDate
//     const filterAssessmentsByDate = (details: AssessmentDetail[] | undefined): AssessmentDetail[] => {
//       if (!details) return [];
//       return details.filter(detail => isDateInRange(detail["Assessment Date"]));
//     };

//     const filteredExperts = Object.entries(rawData).reduce((acc, [expertName, expertData]) => {
//       if (selectedExpert !== 'all' && expertName !== selectedExpert) return acc;

//       const successfulAssessmentsDetails = expertData.successful_assessments_details || [];

//       const filteredSuccessfulAssessments = successfulAssessmentsDetails.filter(detail => {
//         const dateMatch = isDateInRange(detail["Assessment Date"]);
//         const companyMatch = selectedCompany === 'all' || detail.Company === selectedCompany;
//         return dateMatch && companyMatch;
//       });

//       const filteredCandidates = Object.entries(expertData.candidates || {}).reduce((candAcc, [candidateName, candidateData]) => {
//         const filteredSuccessful = filterAssessmentsByDate(candidateData.successful_assessments_details);
//         const filteredNonSuccessful = filterAssessmentsByDate(candidateData.non_successful_assessments_details);

//         if (filteredSuccessful.length === 0 && filteredNonSuccessful.length === 0) return candAcc;

//         candAcc[candidateName] = {
//           ...candidateData,
//           total_assessments: filteredSuccessful.length + filteredNonSuccessful.length,
//           successful_assessments: filteredSuccessful.length,
//           non_successful_assessments: filteredNonSuccessful.length,
//           successful_assessments_details: filteredSuccessful,
//           non_successful_assessments_details: filteredNonSuccessful,
//           conversion_ratio: filteredSuccessful.length / (filteredSuccessful.length + filteredNonSuccessful.length) * 100 || 0
//         };

//         return candAcc;
//       }, {} as typeof expertData.candidates);

//       const totalAssessments = Object.values(filteredCandidates).reduce(
//         (sum, candidate) => sum + candidate.total_assessments,
//         0
//       );
//       const successfulAssessments = Object.values(filteredCandidates).reduce(
//         (sum, candidate) => sum + candidate.successful_assessments,
//         0
//       );

//       acc[expertName] = {
//         ...expertData,
//         total_assessments: totalAssessments,
//         successful_assessments: successfulAssessments,
//         conversion_ratio: totalAssessments > 0 ? (successfulAssessments / totalAssessments) * 100 : 0,
//         successful_assessments_details: filteredSuccessfulAssessments,
//         candidates: filteredCandidates
//       };

//       return acc;
//     }, {} as Record<string, ExpertData>);

//     const processed = processRawData(filteredExperts);
//     setData(processed);
//   }, [rawData, startDate, endDate, selectedExpert, selectedCompany]);

//   const expertColumns: GridColDef[] = [
//     { field: 'id', headerName: 'Expert', flex: 1, valueGetter: (params) => params.row.name },
//     { field: 'total', headerName: 'Total Assessments', type: 'number', width: 150 },
//     { field: 'success', headerName: 'Successful Assessments', type: 'number', width: 180 },
//     {
//       field: 'conversionRate',
//       headerName: 'Conversion Rate',
//       type: 'number',
//       width: 150,
//       valueFormatter: (params) => `${params.value.toFixed(1)}%`,
//       cellClassName: (params) => {
//         if (params.value >= 70) return 'text-green-600';
//         if (params.value < 5) return 'text-red-600';
//         return '';
//       },
//     },
//   ];

//   const candidateColumns: GridColDef[] = [
//     { field: 'candidate', headerName: 'Candidate', flex: 1 },
//     { field: 'expert', headerName: 'Expert', flex: 1 },
//     { field: 'total', headerName: 'Total', type: 'number', width: 100 },
//     { field: 'success', headerName: 'Success', type: 'number', width: 100 },
//     { field: 'failure', headerName: 'Failure', type: 'number', width: 100 },
//     {
//       field: 'conversionRate',
//       headerName: 'Conversion Rate',
//       type: 'number',
//       width: 150,
//       valueFormatter: (params) => `${params.value.toFixed(1)}%`,
//       cellClassName: (params) => {
//         if (params.value >= 70) return 'text-green-600';
//         if (params.value < 5) return 'text-red-600';
//         return '';
//       },
//     },
//   ];

//   const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#8b5cf6', '#f59e0b'];

//   if (loading) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (!data) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <Typography>No data available</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box className="p-6">
//       <Box className="mb-6 flex justify-between items-center">
//         <Box className="flex items-center gap-4">
//           <Button
//             variant="outlined"
//             startIcon={<Filter size={16} />}
//             endIcon={<ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
//             onClick={() => setShowFilters(!showFilters)}
//             sx={{ textTransform: 'none' }}
//           >
//             Filters
//           </Button>
//           {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
//             <Button
//               variant="text"
//               color="error"
//               onClick={clearFilters}
//               sx={{ textTransform: 'none' }}
//             >
//               Clear Filters
//             </Button>
//           )}
//         </Box>
//         {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
//           <Box className="flex items-center gap-2">
//             <Typography variant="body2" color="text.secondary">
//               Active Filters:
//             </Typography>
//             {startDate && endDate && (
//               <Chip
//                 label={`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`}
//                 onDelete={() => {
//                   setStartDate(null);
//                   setEndDate(null);
//                 }}
//                 size="small"
//               />
//             )}
//             {selectedExpert !== 'all' && (
//               <Chip
//                 label={`Expert: ${selectedExpert}`}
//                 onDelete={() => setSelectedExpert('all')}
//                 size="small"
//               />
//             )}
//             {selectedCompany !== 'all' && (
//               <Chip
//                 label={`Company: ${selectedCompany}`}
//                 onDelete={() => setSelectedCompany('all')}
//                 size="small"
//               />
//             )}
//           </Box>
//         )}
//       </Box>

//       <Collapse in={showFilters}>
//         <Box className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4">
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <DatePicker
//               label="Start Date"
//               value={startDate}
//               onChange={(newValue) => setStartDate(newValue)}
//             />
//             <DatePicker
//               label="End Date"
//               value={endDate}
//               onChange={(newValue) => setEndDate(newValue)}
//             />
//           </LocalizationProvider>
//           <TextField
//             select
//             label="Expert"
//             value={selectedExpert}
//             onChange={(e) => setSelectedExpert(e.target.value)}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All Experts</MenuItem>
//             {data?.expertSummary.map((expert) => (
//               <MenuItem key={expert.name} value={expert.name}>
//                 {expert.name}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             select
//             label="Company"
//             value={selectedCompany}
//             onChange={(e) => setSelectedCompany(e.target.value)}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All Companies</MenuItem>
//             {data?.companyVolume.map((company) => (
//               <MenuItem key={company.name} value={company.name}>
//                 {company.name}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Box>
//       </Collapse>

//       <Grid container spacing={3} className="mb-6">
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Users className="text-blue-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Total Assessments
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.totalAssessments.toLocaleString()}+
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Building2 className="text-green-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Total Experts
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.totalExperts}+
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <TrendingUp className="text-purple-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Conversion Rate
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.conversionRate.toFixed(1)}%
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Award className="text-yellow-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Top Expert
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.topExpert}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Building2 className="text-red-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Top Company
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.topCompany}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       <Grid container spacing={3} className="mb-6">
//         <Grid item xs={12} md={6}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top 10 Experts - Success vs Failures
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.expertPerformance.slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Legend />
//                 <Bar dataKey="success" name="Success" radius={[4, 4, 0, 0]}>
//                   {data?.expertPerformance.slice(0, 10).map((_, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[0]} />
//                   ))}
//                 </Bar>
//                 <Bar dataKey="failure" name="Failure" radius={[4, 4, 0, 0]}>
//                   {data?.expertPerformance.slice(0, 10).map((_, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[1]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top Experts by Conversion Rate
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.expertConversion
//                   .filter(expert => expert.total >= 10)
//                   .sort((a, b) => b.rate - a.rate)
//                   .slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Bar dataKey="rate" name="Conversion Rate (%)" radius={[4, 4, 0, 0]}>
//                   {data?.expertConversion
//                     .filter(expert => expert.total >= 10)
//                     .sort((a, b) => b.rate - a.rate)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[2]} />
//                     ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Assessment Trend Over Time
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={data.timelineTrend}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <RechartsTooltip />
//                 <Line 
//                   type="monotone" 
//                   dataKey="count" 
//                   stroke="#8b5cf6" 
//                   name="Assessments"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top 10 Companies by Assessment Volume
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.companyVolume
//                   .sort((a, b) => b.total - a.total)
//                   .slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Legend />
//                 <Bar dataKey="success" name="Success" stackId="a" radius={[4, 4, 0, 0]}>
//                   {data?.companyVolume
//                     .sort((a, b) => b.total - a.total)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[0]} />
//                     ))}
//                 </Bar>
//                 <Bar dataKey="failure" name="Failure" stackId="a" radius={[4, 4, 0, 0]}>
//                   {data?.companyVolume
//                     .sort((a, b) => b.total - a.total)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[1]} />
//                     ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Expert Summary
//             </Typography>
//             <Box sx={{ height: 400 }}>
//               <DataGrid
//                 rows={data?.expertSummary.map((row, index) => ({ ...row, id: index })) || []}
//                 columns={expertColumns}
//                 pageSizeOptions={[10, 25, 50]}
//                 initialState={{
//                   pagination: { paginationModel: { pageSize: 10 } },
//                 }}
//                 disableRowSelectionOnClick
//                 sx={{
//                   '& .MuiDataGrid-cell': {
//                     fontSize: '0.875rem',
//                   },
//                   '& .MuiDataGrid-columnHeader': {
//                     backgroundColor: '#f8fafc',
//                     fontWeight: 600,
//                   },
//                 }}
//               />
//             </Box>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Candidate Performance
//             </Typography>
//             <Box sx={{ height: 400 }}>
//               <DataGrid
//                 rows={data?.candidatePerformance.map((row, index) => ({ ...row, id: index })) || []}
//                 columns={candidateColumns}
//                 pageSizeOptions={[10, 25, 50]}
//                 initialState={{
//                   pagination: { paginationModel: { pageSize: 10 } },
//                 }}
//                 disableRowSelectionOnClick
//                 sx={{
//                   '& .MuiDataGrid-cell': {
//                     fontSize: '0.875rem',
//                   },
//                   '& .MuiDataGrid-columnHeader': {
//                     backgroundColor: '#f8fafc',
//                     fontWeight: 600,
//                   },
//                 }}
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }





// import { useState, useEffect } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   TextField,
//   MenuItem,
//   CircularProgress,
//   Collapse,
//   Button,
//   Chip,
// } from '@mui/material';
// import { DataGrid, GridColDef } from '@mui/x-data-grid';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RechartsTooltip,
//   Legend,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   Cell,
// } from 'recharts';
// import { format, isWithinInterval, parse, startOfDay, endOfDay } from 'date-fns';
// import {
//   TrendingUp,
//   Users,
//   Building2,
//   Award,
//   Filter,
//   ChevronDown,
// } from 'lucide-react';

// interface AssessmentDetail {
//   Candidate: string;
//   "Assessment Date": string;
//   Company: string;
//   Round: string;
// }
// interface ExpertData {
//   total_assessments: number;
//   successful_assessments: number;
//   conversion_ratio: number;
//   successful_assessments_details: AssessmentDetail[];
//   candidates: {
//     [candidateName: string]: {
//       total_assessments: number;
//       successful_assessments: number;
//       non_successful_assessments: number;
//       conversion_ratio: number;
//       successful_assessments_details: AssessmentDetail[];
//       non_successful_assessments_details: AssessmentDetail[];
//     };
//   };
// }

// interface DashboardData {
//   totalAssessments: number;
//   totalExperts: number;
//   conversionRate: number;
//   topExpert: string;
//   topCompany: string;
//   expertPerformance: Array<{
//     name: string;
//     success: number;
//     failure: number;
//   }>;
//   expertConversion: Array<{
//     name: string;
//     rate: number;
//     total: number;
//   }>;
//   timelineTrend: Array<{
//     date: string;
//     count: number;
//   }>;
//   companyVolume: Array<{
//     name: string;
//     total: number;
//     success: number;
//     failure: number;
//   }>;
//   expertSummary: Array<{
//     name: string;
//     total: number;
//     success: number;
//     conversionRate: number;
//   }>;
//   candidatePerformance: Array<{
//     candidate: string;
//     expert: string;
//     total: number;
//     success: number;
//     failure: number;
//     conversionRate: number;
//   }>;
// }

// export function AdminDashboard() {
//   const [rawData, setRawData] = useState<Record<string, ExpertData> | null>(null);
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [selectedExpert, setSelectedExpert] = useState<string>('all');
//   const [selectedCompany, setSelectedCompany] = useState<string>('all');
//   const [showFilters, setShowFilters] = useState(false);

//   const processRawData = (data: Record<string, ExpertData>) => {
//     if (!data) {
//       console.error("processRawData received null or undefined data");
//       return {
//         totalAssessments: 0,
//         totalExperts: 0,
//         conversionRate: 0,
//         topExpert: "None",
//         topCompany: "None",
//         expertSummary: [],
//         expertPerformance: [],
//         expertConversion: [],
//         timelineTrend: [],
//         companyVolume: [],
//         candidatePerformance: []
//       };
//     }

//     const experts = Object.entries(rawData);

    
//     const totalAssessments = experts.reduce((sum, [_, data]) => sum + data.total_assessments, 0);
//     const totalExperts = experts.length;
    
//     const totalSuccessful = experts.reduce((sum, [_, data]) => sum + data.successful_assessments, 0);
//     const conversionRate = totalAssessments > 0 ? (totalSuccessful / totalAssessments) * 100 : 0;
    
//     const expertsWithMinAssessments = experts.filter(([_, data]) => data.total_assessments >= 10);
//     const topExpertEntry = expertsWithMinAssessments.length > 0 
//       ? expertsWithMinAssessments.reduce((prev, curr) => 
//           curr[1].conversion_ratio > prev[1].conversion_ratio ? curr : prev
//         )
//       : ['N/A', { conversion_ratio: 0 }];
    
//     // Fix for the topExpert type issue - ensure it's always a string
//     const topExpert = topExpertEntry[0].toString();
    
//     const companyStats = new Map<string, { success: number; total: number }>();

//     (experts || []).forEach(([_, expertData]) => {
//       // ✅ Safely handle successful_assessments_details
//       const successDetails = expertData?.successful_assessments_details;
//       if (Array.isArray(successDetails)) {
//         successDetails.forEach(detail => {
//           const company = detail?.Company;
//           if (!company) return;
    
//           if (!companyStats.has(company)) {
//             companyStats.set(company, { success: 0, total: 0 });
//           }
//           const stats = companyStats.get(company)!;
//           stats.success++;
//           stats.total++;
//         });
//       }
    
//       // ✅ Safely handle candidates and their non-successful assessments
//       const candidates = expertData?.candidates;
//       if (candidates && typeof candidates === 'object' && candidates !== null && !Array.isArray(candidates)) {
//         Object.values(candidates).forEach(candidate => {
      
//           const nonSuccessDetails = candidate?.non_successful_assessments_details;
//           if (Array.isArray(nonSuccessDetails)) {
//             nonSuccessDetails.forEach(detail => {
//               const company = detail?.Company;
//               if (!company) return;
    
//               if (!companyStats.has(company)) {
//                 companyStats.set(company, { success: 0, total: 0 });
//               }
//               companyStats.get(company)!.total++;
//             });
//           }
//         });
//       }
//     });
    


// // 🔹 Top company calculation
// const topCompanyEntry = Array.from(companyStats.entries()).reduce(
//   (prev, curr) => (curr[1].total > prev[1].total ? curr : prev),
//   ['N/A', { total: 0, success: 0 }]
// );
// const topCompany = topCompanyEntry[0];

// // 🔹 Expert performance
// const expertPerformance = experts.map(([name, data]) => ({
//   name,
//   success: data.successful_assessments || 0,
//   failure: data.candidates
//     ? Object.values(data.candidates).reduce(
//         (sum, candidate) => sum + (candidate.non_successful_assessments || 0),
//         0
//       )
//     : 0,
// }));

// // 🔹 Expert conversion
// const expertConversion = experts.map(([name, data]) => ({
//   name,
//   rate: data.conversion_ratio || 0,
//   total: data.total_assessments || 0,
// }));

// // 🔹 Timeline trend (dates of successful assessments)
// const timelineTrend = new Map<string, number>();

// experts.forEach(([_, expertData]) => {
//   if (Array.isArray(expertData.successful_assessments_details)) {
//     expertData.successful_assessments_details.forEach(detail => {
//       const dateStr = detail?.["Assessment Date"];
//       if (!dateStr) return;

//       try {
//         const date = format(new Date(dateStr), 'yyyy-MM-dd');
//         timelineTrend.set(date, (timelineTrend.get(date) || 0) + 1);
//       } catch (error) {
//         console.error('❌ Error parsing date:', dateStr);
//       }
//     });
//   }
// });

    
//     const companyVolume = Array.from(companyStats.entries()).map(([name, stats]) => ({
//       name,
//       total: stats.total,
//       success: stats.success,
//       failure: stats.total - stats.success,
//     }));
    
//     const expertSummary = experts.map(([name, data]) => ({
//       name,
//       total: data.total_assessments,
//       success: data.successful_assessments,
//       conversionRate: data.conversion_ratio,
//     }));
    
//     const candidatePerformance = experts.flatMap(([expertName, expertData]) =>
//       Object.entries(expertData.candidates).map(([candidateName, candidateData]) => ({
//         candidate: candidateName,
//         expert: expertName,
//         total: candidateData.total_assessments,
//         success: candidateData.successful_assessments,
//         failure: candidateData.non_successful_assessments,
//         conversionRate: candidateData.conversion_ratio,
//       }))
//     );
    
//     return {
//       totalAssessments,
//       totalExperts,
//       conversionRate,
//       topExpert,
//       topCompany,
//       expertPerformance,
//       expertConversion,
//       timelineTrend: Array.from(timelineTrend.entries())
//         .map(([date, count]) => ({ date, count }))
//         .sort((a, b) => a.date.localeCompare(b.date)),
//       companyVolume,
//       expertSummary,
//       candidatePerformance,
//     };
//   };

//   const clearFilters = () => {
//     setStartDate(null);
//     setEndDate(null);
//     setSelectedExpert('all');
//     setSelectedCompany('all');
//     if (rawData) {
//       const processedData = processRawData(rawData);
//       setData(processedData);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/admin/data'); // ✅ Updated URL
//         if (!response.ok) {
//           throw new Error('Failed to fetch data');
//         }
//         const fetchedData = await response.json();
//         console.log("Fetched Data:", fetchedData); 
//         setRawData(fetchedData);
//         const processedData = processRawData(fetchedData);
//         setData(processedData);
//         setLoading(false);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, []);
  

//   useEffect(() => {
//     if (!rawData) return;

//     const isDateInRange = (dateStr: string) => {
//       if (!startDate || !endDate) return true;
//       try {
//         const date = parse(dateStr, 'M/d/yyyy', new Date());
//         return isWithinInterval(date, {
//           start: startOfDay(startDate),
//           end: endOfDay(endDate)
//         });
//       } catch (error) {
//         console.error('Error parsing date:', dateStr);
//         return false;
//       }
//     };

//     // Fix for the type issue with filterAssessmentsByDate
//     const filterAssessmentsByDate = (details: AssessmentDetail[] | undefined): AssessmentDetail[] => {
//       if (!details) return [];
//       return details.filter(detail => isDateInRange(detail["Assessment Date"]));
//     };

//     const filteredExperts = Object.entries(rawData).reduce((acc, [expertName, expertData]) => {
//       if (selectedExpert !== 'all' && expertName !== selectedExpert) return acc;

//       const successfulAssessmentsDetails = expertData.successful_assessments_details || [];

//       const filteredSuccessfulAssessments = successfulAssessmentsDetails.filter(detail => {
//         const dateMatch = isDateInRange(detail["Assessment Date"]);
//         const companyMatch = selectedCompany === 'all' || detail.Company === selectedCompany;
//         return dateMatch && companyMatch;
//       });

//       const filteredCandidates = Object.entries(expertData.candidates || {}).reduce((candAcc, [candidateName, candidateData]) => {
//         const filteredSuccessful = filterAssessmentsByDate(candidateData.successful_assessments_details);
//         const filteredNonSuccessful = filterAssessmentsByDate(candidateData.non_successful_assessments_details);

//         if (filteredSuccessful.length === 0 && filteredNonSuccessful.length === 0) return candAcc;

//         candAcc[candidateName] = {
//           ...candidateData,
//           total_assessments: filteredSuccessful.length + filteredNonSuccessful.length,
//           successful_assessments: filteredSuccessful.length,
//           non_successful_assessments: filteredNonSuccessful.length,
//           successful_assessments_details: filteredSuccessful,
//           non_successful_assessments_details: filteredNonSuccessful,
//           conversion_ratio: filteredSuccessful.length / (filteredSuccessful.length + filteredNonSuccessful.length) * 100 || 0
//         };

//         return candAcc;
//       }, {} as typeof expertData.candidates);

//       const totalAssessments = Object.values(filteredCandidates).reduce(
//         (sum, candidate) => sum + candidate.total_assessments,
//         0
//       );
//       const successfulAssessments = Object.values(filteredCandidates).reduce(
//         (sum, candidate) => sum + candidate.successful_assessments,
//         0
//       );

//       acc[expertName] = {
//         ...expertData,
//         total_assessments: totalAssessments,
//         successful_assessments: successfulAssessments,
//         conversion_ratio: totalAssessments > 0 ? (successfulAssessments / totalAssessments) * 100 : 0,
//         successful_assessments_details: filteredSuccessfulAssessments,
//         candidates: filteredCandidates
//       };

//       return acc;
//     }, {} as Record<string, ExpertData>);

//     const processed = processRawData(filteredExperts);
//     setData(processed);
//   }, [rawData, startDate, endDate, selectedExpert, selectedCompany]);

//   const expertColumns: GridColDef[] = [
//     { field: 'id', headerName: 'Expert', flex: 1, valueGetter: (params) => params.row.name },
//     { field: 'total', headerName: 'Total Assessments', type: 'number', width: 150 },
//     { field: 'success', headerName: 'Successful Assessments', type: 'number', width: 180 },
//     {
//       field: 'conversionRate',
//       headerName: 'Conversion Rate',
//       type: 'number',
//       width: 150,
//       valueFormatter: (params) => `${params.value.toFixed(1)}%`,
//       cellClassName: (params) => {
//         if (params.value >= 70) return 'text-green-600';
//         if (params.value < 5) return 'text-red-600';
//         return '';
//       },
//     },
//   ];

//   const candidateColumns: GridColDef[] = [
//     { field: 'candidate', headerName: 'Candidate', flex: 1 },
//     { field: 'expert', headerName: 'Expert', flex: 1 },
//     { field: 'total', headerName: 'Total', type: 'number', width: 100 },
//     { field: 'success', headerName: 'Success', type: 'number', width: 100 },
//     { field: 'failure', headerName: 'Failure', type: 'number', width: 100 },
//     {
//       field: 'conversionRate',
//       headerName: 'Conversion Rate',
//       type: 'number',
//       width: 150,
//       valueFormatter: (params) => `${params.value.toFixed(1)}%`,
//       cellClassName: (params) => {
//         if (params.value >= 70) return 'text-green-600';
//         if (params.value < 5) return 'text-red-600';
//         return '';
//       },
//     },
//   ];

//   const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#8b5cf6', '#f59e0b'];

//   if (loading) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <Typography color="error">{error}</Typography>
//       </Box>
//     );
//   }

//   if (!data) {
//     return (
//       <Box className="flex items-center justify-center min-h-screen">
//         <Typography>No data available</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box className="p-6">
//       <Box className="mb-6 flex justify-between items-center">
//         <Box className="flex items-center gap-4">
//           <Button
//             variant="outlined"
//             startIcon={<Filter size={16} />}
//             endIcon={<ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
//             onClick={() => setShowFilters(!showFilters)}
//             sx={{ textTransform: 'none' }}
//           >
//             Filters
//           </Button>
//           {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
//             <Button
//               variant="text"
//               color="error"
//               onClick={clearFilters}
//               sx={{ textTransform: 'none' }}
//             >
//               Clear Filters
//             </Button>
//           )}
//         </Box>
//         {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
//           <Box className="flex items-center gap-2">
//             <Typography variant="body2" color="text.secondary">
//               Active Filters:
//             </Typography>
//             {startDate && endDate && (
//               <Chip
//                 label={`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`}
//                 onDelete={() => {
//                   setStartDate(null);
//                   setEndDate(null);
//                 }}
//                 size="small"
//               />
//             )}
//             {selectedExpert !== 'all' && (
//               <Chip
//                 label={`Expert: ${selectedExpert}`}
//                 onDelete={() => setSelectedExpert('all')}
//                 size="small"
//               />
//             )}
//             {selectedCompany !== 'all' && (
//               <Chip
//                 label={`Company: ${selectedCompany}`}
//                 onDelete={() => setSelectedCompany('all')}
//                 size="small"
//               />
//             )}
//           </Box>
//         )}
//       </Box>

//       <Collapse in={showFilters}>
//         <Box className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4">
//           <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <DatePicker
//               label="Start Date"
//               value={startDate}
//               onChange={(newValue) => setStartDate(newValue)}
//             />
//             <DatePicker
//               label="End Date"
//               value={endDate}
//               onChange={(newValue) => setEndDate(newValue)}
//             />
//           </LocalizationProvider>
//           <TextField
//             select
//             label="Expert"
//             value={selectedExpert}
//             onChange={(e) => setSelectedExpert(e.target.value)}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All Experts</MenuItem>
//             {data?.expertSummary.map((expert) => (
//               <MenuItem key={expert.name} value={expert.name}>
//                 {expert.name}
//               </MenuItem>
//             ))}
//           </TextField>
//           <TextField
//             select
//             label="Company"
//             value={selectedCompany}
//             onChange={(e) => setSelectedCompany(e.target.value)}
//             sx={{ minWidth: 200 }}
//           >
//             <MenuItem value="all">All Companies</MenuItem>
//             {data?.companyVolume.map((company) => (
//               <MenuItem key={company.name} value={company.name}>
//                 {company.name}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Box>
//       </Collapse>

//       <Grid container spacing={3} className="mb-6">
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Users className="text-blue-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Total Assessments
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.totalAssessments.toLocaleString()}+
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Building2 className="text-green-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Total Experts
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.totalExperts}+
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <TrendingUp className="text-purple-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Conversion Rate
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.conversionRate.toFixed(1)}%
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Award className="text-yellow-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Top Expert
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.topExpert}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//         <Grid item xs={12} sm={6} md={2.4}>
//           <Card>
//             <CardContent>
//               <Box className="flex items-center gap-2 mb-2">
//                 <Building2 className="text-red-500" />
//                 <Typography variant="subtitle2" color="text.secondary">
//                   Top Company
//                 </Typography>
//               </Box>
//               <Typography variant="h4" component="div">
//                 {data.topCompany}
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       <Grid container spacing={3} className="mb-6">
//         <Grid item xs={12} md={6}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top 10 Experts - Success vs Failures
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.expertPerformance.slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Legend />
//                 <Bar dataKey="success" name="Success" radius={[4, 4, 0, 0]}>
//                   {data?.expertPerformance.slice(0, 10).map((_, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[0]} />
//                   ))}
//                 </Bar>
//                 <Bar dataKey="failure" name="Failure" radius={[4, 4, 0, 0]}>
//                   {data?.expertPerformance.slice(0, 10).map((_, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[1]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top Experts by Conversion Rate
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.expertConversion
//                   .filter(expert => expert.total >= 10)
//                   .sort((a, b) => b.rate - a.rate)
//                   .slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Bar dataKey="rate" name="Conversion Rate (%)" radius={[4, 4, 0, 0]}>
//                   {data?.expertConversion
//                     .filter(expert => expert.total >= 10)
//                     .sort((a, b) => b.rate - a.rate)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[2]} />
//                     ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Assessment Trend Over Time
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={data.timelineTrend}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <RechartsTooltip />
//                 <Line 
//                   type="monotone" 
//                   dataKey="count" 
//                   stroke="#8b5cf6" 
//                   name="Assessments"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Top 10 Companies by Assessment Volume
//             </Typography>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart 
//                 data={data?.companyVolume
//                   .sort((a, b) => b.total - a.total)
//                   .slice(0, 10)}
//                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="name" 
//                   angle={-45}
//                   textAnchor="end"
//                   height={80}
//                   interval={0}
//                   tick={{ fontSize: 12 }}
//                 />
//                 <YAxis />
//                 <RechartsTooltip
//                   contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
//                 />
//                 <Legend />
//                 <Bar dataKey="success" name="Success" stackId="a" radius={[4, 4, 0, 0]}>
//                   {data?.companyVolume
//                     .sort((a, b) => b.total - a.total)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[0]} />
//                     ))}
//                 </Bar>
//                 <Bar dataKey="failure" name="Failure" stackId="a" radius={[4, 4, 0, 0]}>
//                   {data?.companyVolume
//                     .sort((a, b) => b.total - a.total)
//                     .slice(0, 10)
//                     .map((_, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[1]} />
//                     ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Paper>
//         </Grid>
//       </Grid>

//       <Grid container spacing={3}>
//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Expert Summary
//             </Typography>
//             <Box sx={{ height: 400 }}>
//               <DataGrid
//                 rows={data?.expertSummary.map((row, index) => ({ ...row, id: index })) || []}
//                 columns={expertColumns}
//                 pageSizeOptions={[10, 25, 50]}
//                 initialState={{
//                   pagination: { paginationModel: { pageSize: 10 } },
//                 }}
//                 disableRowSelectionOnClick
//                 sx={{
//                   '& .MuiDataGrid-cell': {
//                     fontSize: '0.875rem',
//                   },
//                   '& .MuiDataGrid-columnHeader': {
//                     backgroundColor: '#f8fafc',
//                     fontWeight: 600,
//                   },
//                 }}
//               />
//             </Box>
//           </Paper>
//         </Grid>

//         <Grid item xs={12}>
//           <Paper className="p-4" elevation={2}>
//             <Typography variant="h6" className="mb-4 font-semibold">
//               Candidate Performance
//             </Typography>
//             <Box sx={{ height: 400 }}>
//               <DataGrid
//                 rows={data?.candidatePerformance.map((row, index) => ({ ...row, id: index })) || []}
//                 columns={candidateColumns}
//                 pageSizeOptions={[10, 25, 50]}
//                 initialState={{
//                   pagination: { paginationModel: { pageSize: 10 } },
//                 }}
//                 disableRowSelectionOnClick
//                 sx={{
//                   '& .MuiDataGrid-cell': {
//                     fontSize: '0.875rem',
//                   },
//                   '& .MuiDataGrid-columnHeader': {
//                     backgroundColor: '#f8fafc',
//                     fontWeight: 600,
//                   },
//                 }}
//               />
//             </Box>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }




import  { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  CircularProgress,
  Collapse,
  Button,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Tooltip,
} from 'recharts';
import { format, isWithinInterval, parse, startOfDay, endOfDay } from 'date-fns';
import {
  TrendingUp,
  Users,
  Building2,
  Award,
  Filter,
  ChevronDown,
} from 'lucide-react';

interface ExpertData {
  total_assessments: number;
  successful_assessments: number;
  conversion_ratio: number;
  successful_assessments_details: Array<{
    Candidate: string;
    "Assessment Date": string;
    Company: string;
    Round: string;
  }>;
  candidates: {
    [key: string]: {
      total_assessments: number;
      successful_assessments: number;
      non_successful_assessments: number;
      conversion_ratio: number;
      successful_assessments_details: Array<{
        Candidate: string;
        "Assessment Date": string;
        Company: string;
        Round: string;
      }>;
      non_successful_assessments_details: Array<{
        Candidate: string;
        "Assessment Date": string;
        Company: string;
        Round: string;
      }>;
    };
  };
}

interface DashboardData {
  totalAssessments: number;
  totalExperts: number;
  conversionRate: number;
  topExpert: string;
  topCompany: string;
  expertPerformance: Array<{
    name: string;
    success: number;
    failure: number;
  }>;
  expertConversion: Array<{
    name: string;
    rate: number;
    total: number;
  }>;
  timelineTrend: Array<{
    date: string;
    count: number;
  }>;
  companyVolume: Array<{
    name: string;
    total: number;
    success: number;
    failure: number;
  }>;
  expertSummary: Array<{
    name: string;
    total: number;
    success: number;
    conversionRate: number;
  }>;
  candidatePerformance: Array<{
    candidate: string;
    expert: string;
    total: number;
    success: number;
    failure: number;
    conversionRate: number;
  }>;
}

export function AdminDashboard() {
  const [rawData, setRawData] = useState<Record<string, ExpertData> | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedExpert, setSelectedExpert] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const processRawData = (rawData: Record<string, ExpertData>): DashboardData => {
    if (!rawData || Object.keys(rawData).length === 0) {
      return {
        totalAssessments: 0,
        totalExperts: 0,
        conversionRate: 0,
        topExpert: 'N/A',
        topCompany: 'N/A',
        expertPerformance: [],
        expertConversion: [],
        timelineTrend: [],
        companyVolume: [],
        expertSummary: [],
        candidatePerformance: [],
      };
    }

    
    

    const experts = Object.entries(rawData);
    
    const totalAssessments = experts.reduce((sum, [_, data]) => sum + data.total_assessments, 0);
    const totalExperts = experts.length;
    
    const totalSuccessful = experts.reduce((sum, [_, data]) => sum + data.successful_assessments, 0);
    const conversionRate = totalAssessments > 0 ? (totalSuccessful / totalAssessments) * 100 : 0;
    
    const expertsWithMinAssessments = experts.filter(([_, data]) => data.total_assessments >= 10);
    const topExpertEntry = expertsWithMinAssessments.length > 0 
      ? expertsWithMinAssessments.reduce((prev, curr) => 
          curr[1].conversion_ratio > prev[1].conversion_ratio ? curr : prev
        )
      : ['N/A', { conversion_ratio: 0 }];
    
    const companyStats = new Map<string, { success: number; total: number }>();
    experts.forEach(([, expertData]) => {
      expertData.successful_assessments_details.forEach(detail => {
        const company = detail.Company;
        if (!company) return;

        if (!companyStats.has(company)) {
          companyStats.set(company, { success: 0, total: 0 });
        }
        const stats = companyStats.get(company)!;
        stats.success++;
        stats.total++;
      });
      
      Object.values(expertData.candidates).forEach(candidate => {
        candidate.non_successful_assessments_details.forEach(detail => {
          const company = detail.Company;
          if (!company) return;

          if (!companyStats.has(company)) {
            companyStats.set(company, { success: 0, total: 0 });
          }
          companyStats.get(company)!.total++;
        });
      });
    });
    
    const topCompanyEntry = Array.from(companyStats.entries())
      .reduce((prev, curr) => curr[1].total > prev[1].total ? curr : prev, ['N/A', { total: 0, success: 0 }]);
    const topCompany = topCompanyEntry[0];
    
    const expertPerformance = experts.map(([name, data]) => ({
      name,
      success: data.successful_assessments,
      failure: Object.values(data.candidates).reduce(
        (sum, candidate) => sum + candidate.non_successful_assessments,
        0
      ),
    }));
    
    const expertConversion = experts.map(([name, data]) => ({
      name,
      rate: data.conversion_ratio,
      total: data.total_assessments,
    }));
    
    const timelineTrend = new Map<string, number>();
    experts.forEach(([_, expertData]) => {
      expertData.successful_assessments_details.forEach(detail => {
        if (!detail["Assessment Date"]) return;
        try {
          const date = format(new Date(detail["Assessment Date"]), 'yyyy-MM-dd');
          timelineTrend.set(date, (timelineTrend.get(date) || 0) + 1);
        } catch (error) {
          console.error('Error parsing date:', detail["Assessment Date"]);
        }
      });
    });
    
    const companyVolume = Array.from(companyStats.entries()).map(([name, stats]) => ({
      name,
      total: stats.total,
      success: stats.success,
      failure: stats.total - stats.success,
    }));
    
    const expertSummary = experts.map(([name, data]) => ({
      name,
      total: data.total_assessments,
      success: data.successful_assessments,
      conversionRate: data.conversion_ratio,
    }));
    
    const candidatePerformance = experts.flatMap(([expertName, expertData]) =>
      Object.entries(expertData.candidates).map(([candidateName, candidateData]) => ({
        candidate: candidateName,
        expert: expertName,
        total: candidateData.total_assessments,
        success: candidateData.successful_assessments,
        failure: candidateData.non_successful_assessments,
        conversionRate: candidateData.conversion_ratio,
      }))
    );


    
    
    return {
      totalAssessments,
      totalExperts,
      conversionRate,
      topExpert: typeof topExpertEntry[0] === 'string' ? topExpertEntry[0] : '',

      topCompany,
      expertPerformance,
      expertConversion,
      timelineTrend: Array.from(timelineTrend.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      companyVolume,
      expertSummary,
      candidatePerformance,
    };
  };


  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedExpert('all');
    setSelectedCompany('all');
    if (rawData) {
      const processedData = processRawData(rawData);
      setData(processedData);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/ItsmeBlackOps/Reports/refs/heads/main/demo.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const fetchedData = await response.json();
        setRawData(fetchedData);
        const processedData = processRawData(fetchedData);
        setData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!rawData) return;

    const isDateInRange = (dateStr: string) => {
      if (!startDate || !endDate) return true;
      try {
        const date = parse(dateStr, 'M/d/yyyy', new Date());
        return isWithinInterval(date, {
          start: startOfDay(startDate),
          end: endOfDay(endDate)
        });
      } catch (error) {
        console.error('Error parsing date:', dateStr);
        return false;
      }
    };
    const filterAssessmentsByDate = (
      details: Array<{ [key: string]: string }> | undefined
    ): { Candidate: string; "Assessment Date": string; Company: string; Round: string }[] => {
      if (!details) return [];
      return details.filter(detail => isDateInRange(detail["Assessment Date"])) as any;
    };
    

    const filteredExperts = Object.entries(rawData).reduce((acc, [expertName, expertData]) => {
      if (selectedExpert !== 'all' && expertName !== selectedExpert) return acc;

      const successfulAssessmentsDetails = expertData.successful_assessments_details || [];

      const filteredSuccessfulAssessments = successfulAssessmentsDetails.filter(detail => {
        const dateMatch = isDateInRange(detail["Assessment Date"]);
        const companyMatch = selectedCompany === 'all' || detail.Company === selectedCompany;
        return dateMatch && companyMatch;
      });

      const filteredCandidates = Object.entries(expertData.candidates || {}).reduce((candAcc, [candidateName, candidateData]) => {
        const filteredSuccessful = filterAssessmentsByDate(candidateData.successful_assessments_details);
        const filteredNonSuccessful = filterAssessmentsByDate(candidateData.non_successful_assessments_details);

        if (filteredSuccessful.length === 0 && filteredNonSuccessful.length === 0) return candAcc;

        candAcc[candidateName] = {
          ...candidateData,
          total_assessments: filteredSuccessful.length + filteredNonSuccessful.length,
          successful_assessments: filteredSuccessful.length,
          non_successful_assessments: filteredNonSuccessful.length,
          successful_assessments_details: filteredSuccessful,
          non_successful_assessments_details: filteredNonSuccessful,
          conversion_ratio: filteredSuccessful.length / (filteredSuccessful.length + filteredNonSuccessful.length) * 100 || 0
        };

        return candAcc;
      }, {} as typeof expertData.candidates);

      const totalAssessments = Object.values(filteredCandidates).reduce(
        (sum, candidate) => sum + candidate.total_assessments,
        0
      );
      const successfulAssessments = Object.values(filteredCandidates).reduce(
        (sum, candidate) => sum + candidate.successful_assessments,
        0
      );

      acc[expertName] = {
        ...expertData,
        total_assessments: totalAssessments,
        successful_assessments: successfulAssessments,
        conversion_ratio: totalAssessments > 0 ? (successfulAssessments / totalAssessments) * 100 : 0,
        successful_assessments_details: filteredSuccessfulAssessments,
        candidates: filteredCandidates
      };

      return acc;
    }, {} as Record<string, ExpertData>);

    const processed = processRawData(filteredExperts);
    setData(processed);
  }, [rawData, startDate, endDate, selectedExpert, selectedCompany]);

  const expertColumns: GridColDef[] = [
    { field: 'id', headerName: 'Expert', flex: 1, valueGetter: (params) => params.row.name },
    { field: 'total', headerName: 'Total Assessments', type: 'number', width: 150 },
    { field: 'success', headerName: 'Successful Assessments', type: 'number', width: 180 },
    {
      field: 'conversionRate',
      headerName: 'Conversion Rate',
      type: 'number',
      width: 150,
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
      cellClassName: (params) => {
        if (params.value >= 70) return 'text-green-600';
        if (params.value < 5) return 'text-red-600';
        return '';
      },
    },
  ];

  const candidateColumns: GridColDef[] = [
    { field: 'candidate', headerName: 'Candidate', flex: 1 },
    { field: 'expert', headerName: 'Expert', flex: 1 },
    { field: 'total', headerName: 'Total', type: 'number', width: 100 },
    { field: 'success', headerName: 'Success', type: 'number', width: 100 },
    { field: 'failure', headerName: 'Failure', type: 'number', width: 100 },
    {
      field: 'conversionRate',
      headerName: 'Conversion Rate',
      type: 'number',
      width: 150,
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
      cellClassName: (params) => {
        if (params.value >= 70) return 'text-green-600';
        if (params.value < 5) return 'text-red-600';
        return '';
      },
    },
  ];

  const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#8b5cf6', '#f59e0b'];

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <Typography>No data available</Typography>
      </Box>
    );
  }

  
  return (
    <Box className="p-6">
      <Box className="mb-6 flex justify-between items-center">
        <Box className="flex items-center gap-4">
          <Button
            variant="outlined"
            startIcon={<Filter size={16} />}
            endIcon={<ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ textTransform: 'none' }}
          >
            Filters
          </Button>
          {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
            <Button
              variant="text"
              color="error"
              onClick={clearFilters}
              sx={{ textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        {(startDate || endDate || selectedExpert !== 'all' || selectedCompany !== 'all') && (
          <Box className="flex items-center gap-2">
            <Typography variant="body2" color="text.secondary">
              Active Filters:
            </Typography>
            {startDate && endDate && (
              <Chip
                label={`${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`}
                onDelete={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
                size="small"
              />
            )}
            {selectedExpert !== 'all' && (
              <Chip
                label={`Expert: ${selectedExpert}`}
                onDelete={() => setSelectedExpert('all')}
                size="small"
              />
            )}
            {selectedCompany !== 'all' && (
              <Chip
                label={`Company: ${selectedCompany}`}
                onDelete={() => setSelectedCompany('all')}
                size="small"
              />
            )}
          </Box>
        )}
      </Box>

      <Collapse in={showFilters}>
        <Box className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
            />
          </LocalizationProvider>
          <TextField
            select
            label="Expert"
            value={selectedExpert}
            onChange={(e) => setSelectedExpert(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Experts</MenuItem>
            {data?.expertSummary.map((expert) => (
              <MenuItem key={expert.name} value={expert.name}>
                {expert.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Companies</MenuItem>
            {data?.companyVolume.map((company) => (
              <MenuItem key={company.name} value={company.name}>
                {company.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Collapse>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <Users className="text-blue-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Assessments
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {data.totalAssessments.toLocaleString()}+
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <Building2 className="text-green-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Total Experts
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {data.totalExperts}+
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-purple-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Conversion Rate
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {data.conversionRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <Award className="text-yellow-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Top Expert
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {data.topExpert}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <Building2 className="text-red-500" />
                <Typography variant="subtitle2" color="text.secondary">
                  Top Company
                </Typography>
              </Box>
              <Typography variant="h4" component="div">
                {data.topCompany}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={6}>
          <Paper className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-4 font-semibold">
              Top 10 Experts - Success vs Failures
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data?.expertPerformance.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="success" name="Success" radius={[4, 4, 0, 0]}>
                  {data?.expertPerformance.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[0]} />
                  ))}
                </Bar>
                <Bar dataKey="failure" name="Failure" radius={[4, 4, 0, 0]}>
                  {data?.expertPerformance.slice(0, 10).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-4 font-semibold">
              Top Experts by Conversion Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data?.expertConversion
                  .filter(expert => expert.total >= 10)
                  .sort((a, b) => b.rate - a.rate)
                  .slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="rate" name="Conversion Rate (%)" radius={[4, 4, 0, 0]}>
                  {data?.expertConversion
                    .filter(expert => expert.total >= 10)
                    .sort((a, b) => b.rate - a.rate)
                    .slice(0, 10)
                    .map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[2]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-4 font-semibold">
              Assessment Trend Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.timelineTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  name="Assessments"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-4 font-semibold">
              Top 10 Companies by Assessment Volume
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data?.companyVolume
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="success" name="Success" stackId="a" radius={[4, 4, 0, 0]}>
                  {data?.companyVolume
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10)
                    .map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[0]} />
                    ))}
                </Bar>
                <Bar dataKey="failure" name="Failure" stackId="a" radius={[4, 4, 0, 0]}>
                  {data?.companyVolume
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 10)
                    .map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[1]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      

      <Grid container spacing={3}>
  {/* Table Section */}
  <Grid item xs={12}>
    <Paper className="p-4" elevation={2}>
      <Typography variant="h6" className="mb-4 font-semibold">
        Expert Summary
      </Typography>
      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={data?.expertSummary.map((row, index) => ({ ...row, id: index })) || []}
          columns={expertColumns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#f8fafc',
              fontWeight: 600,
            },
          }}
        />
      </Box>
    </Paper>
  </Grid>

  {/* Chart Section */}
  <Grid item xs={12}>
  <Paper className="p-4" elevation={2}>
    <Typography variant="h6" className="mb-4 font-semibold">
      Expert Assessment Performance
    </Typography>

    
    
    <ResponsiveContainer width="100%" height={400}>
      
      <BarChart
        data={data?.expertSummary || []}
        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="expert"
          angle={-45}
          textAnchor="end"
          interval={0} // Show all names
          height={80}
          tick={{ fontSize: 12 }}
        />
        

        <YAxis />

        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        />

        <Legend />

        {/* Grouped bars - not stacked */}
        <Bar dataKey="success" name="Success" fill="#4ade80" />
        <Bar dataKey="failure" name="Failure" fill="#f87171" />
      </BarChart>
    </ResponsiveContainer>
  </Paper>
</Grid>

</Grid>



        <Grid container spacing={3}>
       

        

        

       



        <Grid item xs={12} sx={{ mt: 4 }} >
          <Paper className="p-4" elevation={2}>
            <Typography variant="h6" className="mb-4 font-semibold">
              Candidate Performance
            </Typography>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={data?.candidatePerformance.map((row, index) => ({ ...row, id: index })) || []}
                columns={candidateColumns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    backgroundColor: '#f8fafc',
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid> 


        


        







      </Grid>
      
    </Box>
  );
}