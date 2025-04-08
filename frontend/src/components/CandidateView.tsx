import React, { useState, useMemo } from 'react';
import { ChevronDown, Building2, Calendar, Briefcase, User, Hash, Filter } from 'lucide-react';
import type { Candidate, RoundTotals } from '../types/report';
import { useAuth } from '../context/AuthContext';
import { mockPOCandidates } from '../data/mockPOCandidates';
import {
  Paper,
  Box,
  Collapse,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  ButtonGroup
} from '@mui/material';

interface CandidateData {
  name: string;
  totalInterviews: number;
  isPO: boolean;
  roundTotals: RoundTotals;
  experts: {
    [expertName: string]: {
      totalInterviews: number;
      roundTotals: RoundTotals;
      companies: {
        [companyName: string]: {
          isPO: boolean;
          interviews: Array<{
            date: string;
            round: string;
            feedback: string;
          }>;
        };
      };
    };
  };
}

export function CandidateView({ data }: { data: Candidate[] }) {
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({});
  const [expandedExperts, setExpandedExperts] = useState<Record<string, boolean>>({});
  const [] = useState<Record<string, boolean>>({});
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

  // Check if a candidate is in PO based on any entry having is_in_po=true
  const candidatePOStatus = useMemo(() => {
    const poStatus: Record<string, boolean> = {};
    
    // First check if any candidate has is_in_po=true in the data
    filteredData.forEach(candidate => {
      if (!poStatus[candidate.candidateName]) {
        poStatus[candidate.candidateName] = false;
      }
      
      // If this entry has is_in_po=true, mark the candidate as PO
      if (candidate.is_in_po) {
        poStatus[candidate.candidateName] = true;
      }
    });
    
    // Then check if any candidate is in the mock PO list
    mockPOCandidates.forEach(candidateName => {
      poStatus[candidateName] = true;
    });
    
    return poStatus;
  }, [filteredData]);

  // Get initials from candidate name
  const getInitials = (name: string): string => {
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Check if candidate is in mockPOCandidates list
  const isInMockList = (name: string): boolean => {
    return mockPOCandidates.includes(name);
  };

  const candidateData = useMemo(() => {
    const candidates: Record<string, CandidateData> = {};

    filteredData.forEach(candidate => {
      if (!candidates[candidate.candidateName]) {
        candidates[candidate.candidateName] = {
          name: candidate.candidateName,
          totalInterviews: 0,
          // Use the pre-computed PO status
          isPO: candidatePOStatus[candidate.candidateName] || false,
          roundTotals: {
            'Screening': 0,
            '1st': 0,
            '2nd': 0,
            '3rd': 0,
            'Technical': 0,
            'Final': 0,
            'Assessment': 0,
            'B.Assessment': 0
          },
          experts: {}
        };
      }

      // Add to candidate total interviews
      candidates[candidate.candidateName].totalInterviews += candidate.cumulative_total;
      
      // Add to candidate round totals
      Object.entries(candidate.round_totals).forEach(([round, count]) => {
        if (round in candidates[candidate.candidateName].roundTotals) {
          candidates[candidate.candidateName].roundTotals[round] += count;
        }
      });
      
      // Initialize expert data if not exists
      if (!candidates[candidate.candidateName].experts[candidate.expertName]) {
        candidates[candidate.candidateName].experts[candidate.expertName] = {
          totalInterviews: candidate.cumulative_total,
          roundTotals: { ...candidate.round_totals },
          companies: {}
        };
      } else {
        // Add to expert total interviews
        candidates[candidate.candidateName].experts[candidate.expertName].totalInterviews += candidate.cumulative_total;
        
        // Add to expert round totals
        Object.entries(candidate.round_totals).forEach(([round, count]) => {
          if (round in candidates[candidate.candidateName].experts[candidate.expertName].roundTotals) {
            candidates[candidate.candidateName].experts[candidate.expertName].roundTotals[round] += count;
          }
        });
      }

      // Add company details
      candidate.details.forEach(detail => {
        if (!candidates[candidate.candidateName].experts[candidate.expertName].companies[detail.company]) {
          candidates[candidate.candidateName].experts[candidate.expertName].companies[detail.company] = {
            isPO: detail.is_po,
            interviews: []
          };
        }

        detail.interview_dates.forEach(date => {
          date.interviews.forEach(interviewGroup => {
            interviewGroup.forEach(interview => {
              candidates[candidate.candidateName].experts[candidate.expertName].companies[detail.company].interviews.push({
                date: date.date,
                round: interview['actual round'],
                feedback: interview.feedback
              });
            });
          });
        });
      });
    });

    return Object.values(candidates);
  }, [filteredData, candidatePOStatus]);

  // Apply filters to candidate data
  const filteredCandidateData = useMemo(() => {
    let result = [...candidateData];
    
    // Apply PO filter
    if (poFilter === 'po') {
      result = result.filter(candidate => candidate.isPO);
    } else if (poFilter === 'not-po') {
      result = result.filter(candidate => !candidate.isPO);
    }
    
    // Apply total interviews filter
    if (totalFilter === 5) {
      result = result.filter(candidate => candidate.totalInterviews > 5);
    } else if (totalFilter === 10) {
      result = result.filter(candidate => candidate.totalInterviews > 10);
    } else if (totalFilter === -5) {
      result = result.filter(candidate => candidate.totalInterviews < 5);
    }
    
    return result;
  }, [candidateData, poFilter, totalFilter]);

  // Calculate overall total interviews for each candidate across all experts
  const candidateTotalInterviews = useMemo(() => {
    const totals: Record<string, number> = {};
    
    data.forEach(candidate => {
      if (!totals[candidate.candidateName]) {
        totals[candidate.candidateName] = 0;
      }
      totals[candidate.candidateName] += candidate.cumulative_total;
    });
    
    return totals;
  }, [data]);

  const toggleCandidate = (candidateName: string) => {
    setExpandedCandidates(prev => ({
      ...prev,
      [candidateName]: !prev[candidateName]
    }));
  };

  const toggleExpert = (candidateName: string, expertName: string) => {
    const key = `${candidateName}-${expertName}`;
    setExpandedExperts(prev => ({
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
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            Candidate View
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
            {filteredCandidateData.length} candidates found
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
            <ToggleButton value="po" aria-label="PO only">
              PO Only
            </ToggleButton>
            <ToggleButton value="not-po" aria-label="Not PO">
              Not PO
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
              onClick={() => handleTotalFilterChange(-5)}
              variant={totalFilter === -5 ? "contained" : "outlined"}
            >
              Total &lt; 5
            </Button>
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
          mb: 4,
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
              <TableCell sx={{ pl: 2 }}>Candidate</TableCell>
              {roundOrder.map(round => (
                <TableCell key={round} align="center" sx={{ px: 1 }}>{round}</TableCell>
              ))}
              <TableCell align="center" sx={{ px: 1 }}>Total</TableCell>
              <TableCell width={40} />
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCandidateData.length > 0 ? (
              filteredCandidateData.map((candidate) => {
                const overallTotal = candidateTotalInterviews[candidate.name] || 0;
                const expertTotal = candidate.totalInterviews;
                const hasOtherExperts = overallTotal > expertTotal;
                const isInMockPOList = isInMockList(candidate.name);
                const candidateInitials = getInitials(candidate.name);
                
                return (
                  <React.Fragment key={candidate.name}>
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
                      onClick={() => toggleCandidate(candidate.name)}
                    >
                      <TableCell sx={{ pl: 2, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            backgroundColor: '#f0f9ff',
                            p: 0.75,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <User className="text-blue-500" size={16} />
                          </Box>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                                {candidate.name}
                              </Typography>
                              {candidate.isPO && (
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
                              {isInMockPOList && (
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: '0.625rem',
                                    fontWeight: 600,
                                    color: '#7c3aed',
                                    backgroundColor: '#f3e8ff',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: '4px',
                                    lineHeight: 1,
                                    minWidth: '24px',
                                    textAlign: 'center'
                                  }}
                                >
                                  {candidateInitials}
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.25 }}>
                              {Object.keys(candidate.experts).length} expert{Object.keys(candidate.experts).length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      {roundOrder.map(round => (
                        <TableCell key={round} align="center" sx={{ py: 2, px: 1 }}>
                          {candidate.roundTotals[round] > 0 ? (
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
                              {candidate.roundTotals[round]}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</Typography>
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ py: 2, px: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
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
                            {expertTotal}
                          </Typography>
                          {hasOtherExperts && (
                            <Typography
                              sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                backgroundColor: '#f97316',
                                py: 0.25,
                                px: 1.5,
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              <Hash size={12} />
                              {overallTotal}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2, pr: 2 }}>
                        <IconButton 
                          size="small"
                          sx={{
                            padding: 0.25,
                            backgroundColor: '#f1f5f9',
                            transition: 'all 0.2s',
                            transform: expandedCandidates[candidate.name] ? 'rotate(-180deg)' : 'none',
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
                          borderBottom: expandedCandidates[candidate.name] ? '1px solid #e2e8f0' : 'none'
                        }}
                      >
                        <Collapse in={expandedCandidates[candidate.name]} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 2 }}>
                            {Object.entries(candidate.experts).map(([expertName, expertData]) => (
                              <Paper
                                key={expertName}
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
                                  onClick={() => toggleExpert(candidate.name, expertName)}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Box sx={{ 
                                        backgroundColor: '#e0f2fe',
                                        p: 0.75,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}>
                                        <Briefcase className="text-blue-600" size={14} />
                                      </Box>
                                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                                        {expertName}
                                      </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Box display="flex" gap={1}>
                                        {roundOrder.map(round => (
                                          expertData.roundTotals[round] > 0 && (
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
                                              {round}: {expertData.roundTotals[round]}
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
                                          Total: {expertData.totalInterviews}
                                        </Typography>
                                      </Box>
                                      <IconButton 
                                        size="small"
                                        sx={{
                                          padding: 0.25,
                                          backgroundColor: '#f1f5f9',
                                          transition: 'all 0.2s',
                                          transform: expandedExperts[`${candidate.name}-${expertName}`] ? 'rotate(-180deg)' : 'none',
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
                                <Collapse in={expandedExperts[`${candidate.name}-${expertName}`]}>
                                  <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
                                    {Object.entries(expertData.companies).map(([companyName, companyData]) => (
                                      <Box 
                                        key={companyName} 
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
                                              {companyName}
                                            </Typography>
                                            {companyData.isPO && (
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
                                        {companyData.interviews.map((interview, index) => (
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
                            ))}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography sx={{ color: '#64748b', fontSize: '0.875rem' }}>
                    No candidates match the current filters
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