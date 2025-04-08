import React, { useState, useMemo } from 'react';
import { ChevronDown, Users, Building2, Calendar, Briefcase, Hash, Filter, BarChart2 } from 'lucide-react';
import type { Candidate, ExpertStats } from '../types/report';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Collapse,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
  Button
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export function ReportTable({ data }: { data: Candidate[] }) {
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({});
  const [poFilter, setPoFilter] = useState<string | null>(null);
  const [totalFilter, setTotalFilter] = useState<number | null>(null);
  const { user } = useAuth();

  // Filter data based on user role and expert name
  const filteredData = useMemo(() => {
    if (user?.role === 'admin') {
      return data;
    } else if (user?.role === 'expert' && user?.expertName) {
      return data.filter(candidate => candidate.expertName === user.expertName);
    }
    return [];
  }, [data, user]);

  const expertStats = useMemo(() => {
    const stats: Record<string, ExpertStats & { poCount: number }> = {};

    filteredData.forEach(candidate => {
      if (!stats[candidate.expertName]) {
        stats[candidate.expertName] = {
          expert: candidate.expertName,
          poCount: 0,
          roundCounts: {
            '1st': 0,
            '2nd': 0,
            '3rd': 0,
            'Assessment': 0,
            'B.Assessment': 0,
            'Final': 0,
            'Screening': 0,
            'Technical': 0
          },
          totalInterviews: 0,
          candidates: [],
          candidateRoundCounts: {},
          interviewsByCandidate: {}
        };
      }

      if (candidate.is_in_po) {
        stats[candidate.expertName].poCount++;
      }

      Object.entries(candidate.round_totals).forEach(([round, count]) => {
        if (round in stats[candidate.expertName].roundCounts) {
          stats[candidate.expertName].roundCounts[round] += count;
        }
      });

      stats[candidate.expertName].totalInterviews += candidate.cumulative_total;

      if (!stats[candidate.expertName].candidates.includes(candidate.candidateName)) {
        stats[candidate.expertName].candidates.push(candidate.candidateName);
      }

      if (!stats[candidate.expertName].candidateRoundCounts[candidate.candidateName]) {
        stats[candidate.expertName].candidateRoundCounts[candidate.candidateName] = {
          ...candidate.round_totals,
          total: candidate.cumulative_total
        };
      }

      if (!stats[candidate.expertName].interviewsByCandidate[candidate.candidateName]) {
        stats[candidate.expertName].interviewsByCandidate[candidate.candidateName] = [];
      }

      candidate.details.forEach(detail => {
        detail.interview_dates.forEach(date => {
          date.interviews.forEach(interviewGroup => {
            interviewGroup.forEach(interview => {
              stats[candidate.expertName].interviewsByCandidate[candidate.candidateName].push({
                company: detail.company,
                is_po: detail.is_po,
                date: date.date,
                round: interview['actual round'],
                feedback: interview.feedback
              });
            });
          });
        });
      });
    });

    return Object.values(stats);
  }, [filteredData]);

  // Apply filters to expert stats
  const filteredExpertStats = useMemo(() => {
    let result = [...expertStats];
    
    // Apply PO filter
    if (poFilter === 'po') {
      result = result.filter(expert => expert.poCount > 0);
    } else if (poFilter === 'not-po') {
      result = result.filter(expert => expert.poCount === 0);
    }
    
    // Apply total interviews filter
    if (totalFilter === 5) {
      result = result.filter(expert => expert.totalInterviews > 5);
    } else if (totalFilter === 10) {
      result = result.filter(expert => expert.totalInterviews > 10);
    }
    
    return result;
  }, [expertStats, poFilter, totalFilter]);

  // Calculate overall total interviews for each candidate across all experts
  const candidateTotalInterviews = useMemo(() => {
    const totals: Record<string, number> = {};
    
    filteredData.forEach(candidate => {
      if (!totals[candidate.candidateName]) {
        totals[candidate.candidateName] = 0;
      }
      totals[candidate.candidateName] += candidate.cumulative_total;
    });
    
    return totals;
  }, [filteredData]);

  const toggleExpert = (expert: string) => {
    setExpandedExpert(prev => prev === expert ? null : expert);
  };

  const toggleCandidate = (expert: string, candidate: string) => {
    const key = `${expert}-${candidate}`;
    setExpandedCandidates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePoFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: string | null,
  ) => {
    setPoFilter(newFilter);
  };

  const handleTotalFilterChange = (newFilter: number | null) => {
    setTotalFilter(prevFilter => prevFilter === newFilter ? null : newFilter);
  };

  const roundOrder = ['Screening', '1st', '2nd', '3rd', 'Technical', 'Final'];

  return (
    <div className="max-w-[95%] mx-auto py-4">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart2 size={20} className="text-blue-600" />
            Expert View
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              backgroundColor: '#f1f5f9', 
              px: 2, 
              py: 0.5, 
              borderRadius: '16px',
              fontWeight: 500
            }}
          >
            {filteredExpertStats.length} experts found
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Filter size={16} className="text-gray-500" />
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
              Filters:
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={poFilter}
            exclusive
            onChange={handlePoFilterChange}
            aria-label="PO filter"
            size="small"
            sx={{ 
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500
              }
            }}
          >
            <ToggleButton value="po" aria-label="Has PO">
              Has PO
            </ToggleButton>
            <ToggleButton value="not-po" aria-label="No PO">
              No PO
            </ToggleButton>
          </ToggleButtonGroup>
          
          <ButtonGroup 
            variant="outlined" 
            size="small"
            sx={{ 
              '& .MuiButton-root': {
                textTransform: 'none',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 500
              }
            }}
          >
            <Button 
              onClick={() => handleTotalFilterChange(5)}
              variant={totalFilter === 5 ? "contained" : "outlined"}
            >
              Total &gt; 5
            </Button>
            <Button 
              onClick={() => handleTotalFilterChange(10)}
              variant={totalFilter === 10 ? "contained" : "outlined"}
            >
              Total &gt; 10
            </Button>
          </ButtonGroup>
          
          {(poFilter !== null || totalFilter !== null) && (
            <Button 
              variant="text" 
              size="small"
              onClick={() => {
                setPoFilter(null);
                setTotalFilter(null);
              }}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#ef4444'
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>
      
      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0',
          },
          '& .MuiTableRow-root:not(:last-child)': {
            borderBottom: '1px solid #e2e8f0'
          }
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#f8fafc',
              '& th': { 
                borderBottom: '2px solid #e2e8f0',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#475569',
                py: 2
              }
            }}>
              <TableCell sx={{ pl: 2 }}>Expert</TableCell>
              {roundOrder.map(round => (
                <TableCell key={round} align="center" sx={{ px: 1 }}>{round}</TableCell>
              ))}
              <TableCell align="center" sx={{ px: 1 }}>Total</TableCell>
              <TableCell width={40} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExpertStats.length > 0 ? (
              filteredExpertStats.map((stat) => (
                <React.Fragment key={stat.expert}>
                  <TableRow
                    hover
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: '#f1f5f9'
                      },
                      borderBottom: 'none !important'
                    }}
                    onClick={() => toggleExpert(stat.expert)}
                  >
                    <TableCell sx={{ pl: 2, py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ 
                          backgroundColor: '#e0f2fe',
                          p: 0.75,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Briefcase className="text-blue-600" size={16} />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                              {stat.expert}
                            </Typography>
                            {stat.poCount > 0 && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.625rem',
                                  fontWeight: 600,
                                  color: '#059669',
                                  backgroundColor: '#d1fae5',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: '4px',
                                  lineHeight: 1
                                }}
                              >
                                {stat.poCount} PO
                              </Typography>
                            )}
                          </Box>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                            {stat.candidates.length} candidate{stat.candidates.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {roundOrder.map(round => (
                      <TableCell key={round} align="center" sx={{ py: 2, px: 1 }}>
                        {stat.roundCounts[round] > 0 ? (
                          <Typography
                            sx={{
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: '#3b82f6',
                              backgroundColor: '#eff6ff',
                              py: 0.25,
                              px: 1,
                              borderRadius: '4px',
                              display: 'inline-block'
                            }}
                          >
                            {stat.roundCounts[round]}
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</Typography>
                        )}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ py: 2, px: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#ffffff',
                          backgroundColor: '#3b82f6',
                          py: 0.25,
                          px: 1.5,
                          borderRadius: '4px',
                          display: 'inline-block'
                        }}
                      >
                        {stat.totalInterviews}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, pr: 2 }}>
                      <IconButton 
                        size="small"
                        sx={{
                          padding: 0.25,
                          backgroundColor: '#f1f5f9',
                          transition: 'all 0.2s',
                          transform: expandedExpert === stat.expert ? 'rotate(-180deg)' : 'none',
                          '&:hover': {
                            backgroundColor: '#e2e8f0'
                          }
                        }}
                      >
                        <ChevronDown className="text-gray-600" size={14} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell 
                      colSpan={10} 
                      sx={{ 
                        py: 0,
                        borderBottom: expandedExpert === stat.expert ? '1px solid #e2e8f0' : 'none'
                      }}
                    >
                      <Collapse in={expandedExpert === stat.expert} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2 }}>
                          {stat.candidates.map((candidate) => {
                            const candidateData = filteredData.find(c => c.expertName === stat.expert && c.candidateName === candidate);
                            const overallTotal = candidateTotalInterviews[candidate] || 0;
                            const expertTotal = stat.candidateRoundCounts[candidate].total || 0;
                            const hasOtherExperts = overallTotal > expertTotal;
                            
                            return (
                              <Paper
                                key={candidate}
                                variant="outlined"
                                sx={{
                                  mb: 1.5,
                                  overflow: 'hidden',
                                  borderRadius: '8px',
                                  borderColor: '#e2e8f0',
                                  '&:last-child': { mb: 0 }
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 1.5,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#f8fafc' },
                                  }}
                                  onClick={() => toggleCandidate(stat.expert, candidate)}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Box sx={{ 
                                        backgroundColor: '#f0f9ff',
                                        p: 0.75,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <Users className="text-blue-500" size={14} />
                                      </Box>
                                      <Box>
                                        <Typography 
                                          sx={{ 
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                          }}
                                        >
                                          {candidate}
                                          {candidateData?.is_in_po && (
                                            <Typography
                                              component="span"
                                              sx={{
                                                fontSize: '0.625rem',
                                                fontWeight: 600,
                                                color: '#059669',
                                                backgroundColor: '#d1fae5',
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: '4px',
                                                lineHeight: 1
                                              }}
                                            >
                                              PO
                                            </Typography>
                                          )}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Box display="flex" gap={1}>
                                        {roundOrder.map(round => (
                                          stat.candidateRoundCounts[candidate][round] > 0 && (
                                            <Typography
                                              key={round}
                                              sx={{
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                color: '#3b82f6',
                                                backgroundColor: '#eff6ff',
                                                px: 1,
                                                py: 0.25,
                                                borderRadius: '4px',
                                                whiteSpace: 'nowrap'
                                              }}
                                            >
                                              {round}: {stat.candidateRoundCounts[candidate][round]}
                                            </Typography>
                                          )
                                        ))}
                                        <Typography
                                          sx={{
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: '#ffffff',
                                            backgroundColor: '#3b82f6',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          Total: {stat.candidateRoundCounts[candidate].total}
                                        </Typography>
                                        {hasOtherExperts && (
                                          <Typography
                                            sx={{
                                              fontSize: '0.75rem',
                                              fontWeight: 600,
                                              color: '#ffffff',
                                              backgroundColor: hasOtherExperts ? '#f97316' : '#3b82f6',
                                              px: 1,
                                              py: 0.25,
                                              borderRadius: '4px',
                                              whiteSpace: 'nowrap',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.5
                                            }}
                                          >
                                            <Hash size={12} />
                                            Overall: {overallTotal}
                                          </Typography>
                                        )}
                                       </Box>
                                      <IconButton 
                                        size="small"
                                        sx={{
                                          padding: 0.25,
                                          backgroundColor: '#f1f5f9',
                                          transition: 'all 0.2s',
                                          transform: expandedCandidates[`${stat.expert}-${candidate}`] ? 'rotate(-180deg)' : 'none',
                                          '&:hover': {
                                            backgroundColor: '#e2e8f0'
                                          }
                                        }}
                                      >
                                        <ChevronDown size={12} className="text-gray-600" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                </Box>
                                <Collapse in={expandedCandidates[`${stat.expert}-${candidate}`]}>
                                  <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                                    {Object.entries(stat.interviewsByCandidate[candidate].reduce((acc, interview) => {
                                      if (!acc[interview.company]) {
                                        acc[interview.company] = {
                                          interviews: [],
                                          is_po: interview.is_po
                                        };
                                      }
                                      acc[interview.company].interviews.push(interview);
                                      return acc;
                                    }, {} as Record<string, { interviews: typeof stat.interviewsByCandidate[string], is_po: boolean }>))
                                    .map(([company, { interviews, is_po }]) => (
                                      <Box 
                                        key={company} 
                                        sx={{ 
                                          mb: 2,
                                          '&:last-child': { mb: 0 },
                                          backgroundColor: '#ffffff',
                                          borderRadius: '8px',
                                          p: 2,
                                          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                                        }}
                                      >
                                        <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                                          <Box sx={{ 
                                            backgroundColor: '#f0f9ff',
                                            p: 0.75,
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}>
                                            <Building2 className="text-blue-500" size={14} />
                                          </Box>
                                          <Box display="flex" alignItems="center" gap={1}>
                                            <Typography 
                                              sx={{ 
                                                fontSize: '0.875rem',
                                                color: '#1e293b',
                                                fontWeight: 600
                                              }}
                                            >
                                              {company}
                                            </Typography>
                                            {is_po && (
                                              <Typography
                                                component="span"
                                                sx={{
                                                  fontSize: '0.625rem',
                                                  fontWeight: 600,
                                                  color: '#059669',
                                                  backgroundColor: '#d1fae5',
                                                  px: 1,
                                                  py: 0.25,
                                                  borderRadius: '4px',
                                                  lineHeight: 1
                                                }}
                                              >
                                                PO
                                              </Typography>
                                            )}
                                          </Box>
                                        </Box>
                                        {interviews.map((interview, index) => (
                                          <Box 
                                            key={index} 
                                            sx={{ 
                                              ml: 3,
                                              mb: 1.5,
                                              '&:last-child': { mb: 0 }
                                            }}
                                          >
                                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                              <Box sx={{ 
                                                backgroundColor: '#f1f5f9',
                                                p: 0.5,
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}>
                                                <Calendar size={12} className="text-gray-500" />
                                              </Box>
                                              <Typography 
                                                sx={{ 
                                                  fontSize: '0.75rem',
                                                  color: '#64748b',
                                                  fontWeight: 500
                                                }}
                                              >
                                                {formatDate(interview.date)}
                                              </Typography>
                                            </Box>
                                            <Box sx={{ ml: 2.5 }}>
                                              <Typography 
                                                sx={{
                                                  fontSize: '0.8125rem',
                                                  color: '#1e293b',
                                                  fontWeight: 600,
                                                  mb: 0.5
                                                }}
                                              >
                                                {interview.round}
                                              </Typography>
                                              <Typography 
                                                sx={{ 
                                                  fontSize: '0.8125rem',
                                                  color: '#475569',
                                                  lineHeight: 1.5
                                                }}
                                              >
                                                {interview.feedback}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        ))}
                                      </Box>
                                    ))}
                                  </Box>
                                </Collapse>
                              </Paper>
                            );
                          })}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    No experts match the current filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}