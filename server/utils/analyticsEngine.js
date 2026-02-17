// =============================================
// ATTENDANCE PREDICTION — Safe Linear Regression
// =============================================
const predictAttendance = (attendanceHistory) => {
  // Guard: need at least 2 data points for regression
  if (!attendanceHistory || !Array.isArray(attendanceHistory) || attendanceHistory.length < 2) {
    // If we have exactly 1 record, return that as the "prediction"
    if (attendanceHistory && attendanceHistory.length === 1) {
      return {
        predicted: attendanceHistory[0].percentage || 0,
        trend: 'insufficient_data',
        slope: 0,
        historicalAvg: attendanceHistory[0].percentage || 0
      };
    }
    return {
      predicted: null,
      trend: 'insufficient_data',
      slope: 0,
      historicalAvg: 0
    };
  }

  const n = attendanceHistory.length;

  // Filter out any NaN/undefined percentages
  const y = attendanceHistory.map(a => {
    const val = Number(a.percentage);
    return isNaN(val) ? 0 : val;
  });

  const x = attendanceHistory.map((_, i) => i + 1);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);

  // Denominator for slope calculation
  const denominator = n * sumX2 - sumX * sumX;

  let slope = 0;
  let intercept = sumY / n;

  // Only calculate slope if denominator is not zero (avoids division by zero)
  if (denominator !== 0) {
    slope = (n * sumXY - sumX * sumY) / denominator;
    intercept = (sumY - slope * sumX) / n;
  }

  const nextPeriod = n + 1;
  let predicted = slope * nextPeriod + intercept;

  // Clamp between 0 and 100
  predicted = Math.max(0, Math.min(100, predicted));

  // Handle NaN just in case
  if (isNaN(predicted)) {
    predicted = sumY / n; // fallback to average
  }
  if (isNaN(predicted)) {
    predicted = 0;
  }

  let trend = 'stable';
  if (slope > 2) trend = 'improving';
  else if (slope < -2) trend = 'declining';

  const historicalAvg = n > 0 ? sumY / n : 0;

  return {
    predicted: Math.round(predicted * 100) / 100,
    trend,
    slope: Math.round(slope * 100) / 100,
    historicalAvg: Math.round(historicalAvg * 100) / 100
  };
};

// =============================================
// SUBJECT RISK SCORE (0-100, higher = more risky)
// =============================================
const calculateSubjectRiskScore = (students) => {
  if (!students || !Array.isArray(students) || students.length === 0) {
    return 0;
  }

  // Filter out students with invalid data
  const validStudents = students.filter(s => typeof s.percentage === 'number' && !isNaN(s.percentage));

  if (validStudents.length === 0) return 0;

  const avgPercentage = validStudents.reduce((sum, s) => sum + s.percentage, 0) / validStudents.length;
  const belowThreshold = validStudents.filter(s => s.percentage < 75).length;
  const criticalCount = validStudents.filter(s => s.percentage < 50).length;
  const belowRatio = belowThreshold / validStudents.length;
  const criticalRatio = criticalCount / validStudents.length;

  let riskScore = 0;
  riskScore += (100 - avgPercentage) * 0.4;
  riskScore += belowRatio * 100 * 0.35;
  riskScore += criticalRatio * 100 * 0.25;

  riskScore = Math.round(Math.min(100, Math.max(0, riskScore)));

  // Final NaN guard
  if (isNaN(riskScore)) return 0;

  return riskScore;
};

// =============================================
// STUDENT RISK CLASSIFICATION
// =============================================
const classifyStudentRisk = (percentage) => {
  const pct = Number(percentage);
  if (isNaN(pct)) return 'At Risk';
  if (pct >= 75) return 'Safe';
  if (pct >= 50) return 'At Risk';
  return 'Critical';
};

// =============================================
// GENERATE RISK ALERTS
// =============================================
const generateRiskAlerts = (students, subject) => {
  if (!students || !Array.isArray(students)) return [];

  const alerts = [];

  students.forEach(student => {
    const pct = Number(student.percentage);
    if (isNaN(pct)) return;

    if (pct < 50) {
      alerts.push({
        level: 'critical',
        studentName: student.studentName || 'Unknown',
        rollNo: student.rollNo || 'N/A',
        message: `${student.studentName || 'Unknown'} (${student.rollNo || 'N/A'}) has CRITICAL attendance of ${pct}% in ${subject}`
      });
    } else if (pct < 75) {
      alerts.push({
        level: 'warning',
        studentName: student.studentName || 'Unknown',
        rollNo: student.rollNo || 'N/A',
        message: `${student.studentName || 'Unknown'} (${student.rollNo || 'N/A'}) is AT RISK with ${pct}% attendance in ${subject}`
      });
    }
  });

  return alerts.sort((a, b) => (a.level === 'critical' ? -1 : 1));
};

module.exports = {
  predictAttendance,
  calculateSubjectRiskScore,
  classifyStudentRisk,
  generateRiskAlerts
};