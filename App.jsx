import React, { useState, useEffect } from 'react';

const defaultLevers = [
  { id: 'webinar', name: 'Webinar', monthlyUnits: 90, attributionDays: 6, dailyRate: 15.0, color: '#3B82F6' },
  { id: 'vsl-calls', name: 'VSL-calls', monthlyUnits: 70, attributionDays: 21, dailyRate: 3.3, color: '#8B5CF6' },
  { id: 'hot-apps', name: 'Hot Apps', monthlyUnits: 70, attributionDays: 21, dailyRate: 3.3, color: '#EC4899' },
  { id: 'lead-magnet', name: 'Lead Magnet', monthlyUnits: 16, attributionDays: 21, dailyRate: 0.8, color: '#F59E0B' },
  { id: 'free-fb-group', name: 'Free FB Group', monthlyUnits: 38, attributionDays: 21, dailyRate: 1.8, color: '#10B981' },
  { id: 'like-live-web', name: 'Like Live Web', monthlyUnits: 30, attributionDays: 3, dailyRate: 10.0, color: '#EF4444' },
  { id: 'fireside-chats', name: 'Fireside Chats', monthlyUnits: 10, attributionDays: 3, dailyRate: 3.3, color: '#6366F1' },
  { id: 'advocate-challenge', name: 'Advocate Challenge', monthlyUnits: 10, attributionDays: 3, dailyRate: 3.3, color: '#14B8A6' },
  { id: 'affiliate-challenge', name: 'Affiliate Challenge', monthlyUnits: 10, attributionDays: 3, dailyRate: 3.3, color: '#F97316' },
  { id: 'financing', name: 'Financing', monthlyUnits: 20, attributionDays: 21, dailyRate: 1.0, color: '#84CC16' },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const leverColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const STORAGE_KEY = 'lever-calendar-pro-v2';

const saveToStorage = async (data) => {
  try {
    if (window.storage) {
      await window.storage.set(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.log('Storage error:', e);
  }
};

const loadFromStorage = async () => {
  try {
    if (window.storage) {
      const result = await window.storage.get(STORAGE_KEY);
      if (result?.value) return JSON.parse(result.value);
    } else {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    console.log('Storage error:', e);
  }
  return null;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

export default function LeverCalendarPro() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [teamName, setTeamName] = useState('Sales Team');
  const [averageUnitRevenue, setAverageUnitRevenue] = useState(5000);
  const [monthlyBudgets, setMonthlyBudgets] = useState(() => {
    const budgets = {};
    for (let y = 2024; y <= 2030; y++) {
      for (let m = 0; m < 12; m++) {
        budgets[`${y}-${m}`] = 364;
      }
    }
    return budgets;
  });
  const [levers, setLevers] = useState(defaultLevers);
  const [calendarData, setCalendarData] = useState({});
  const [actualsData, setActualsData] = useState({});
  const [notesData, setNotesData] = useState({});
  const [draggedLever, setDraggedLever] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('plan');
  const [showDayModal, setShowDayModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('levers');
  const [isLoading, setIsLoading] = useState(true);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthKey = `${currentYear}-${currentMonth}`;
  const budget = monthlyBudgets[monthKey] || 364;
  const getDateKey = (day) => `${monthKey}-${day}`;

  useEffect(() => {
    const loadData = async () => {
      const saved = await loadFromStorage();
      if (saved) {
        if (saved.calendarData) setCalendarData(saved.calendarData);
        if (saved.actualsData) setActualsData(saved.actualsData);
        if (saved.notesData) setNotesData(saved.notesData);
        if (saved.monthlyBudgets) setMonthlyBudgets(prev => ({ ...prev, ...saved.monthlyBudgets }));
        if (saved.teamName) setTeamName(saved.teamName);
        if (saved.averageUnitRevenue) setAverageUnitRevenue(saved.averageUnitRevenue);
        if (saved.levers) setLevers(saved.levers);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage({ calendarData, actualsData, notesData, monthlyBudgets, teamName, averageUnitRevenue, levers });
    }
  }, [calendarData, actualsData, notesData, monthlyBudgets, teamName, averageUnitRevenue, levers, isLoading]);

  const handleDragStart = (lever) => setDraggedLever(lever);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (day) => {
    if (draggedLever) {
      const dateKey = getDateKey(day);
      setCalendarData(prev => {
        const dayLevers = prev[dateKey] || [];
        if (!dayLevers.find(l => l.id === draggedLever.id)) {
          return { ...prev, [dateKey]: [...dayLevers, draggedLever] };
        }
        return prev;
      });
      setDraggedLever(null);
    }
  };

  const removeLever = (day, leverId) => {
    const dateKey = getDateKey(day);
    setCalendarData(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(l => l.id !== leverId)
    }));
  };

  const toggleLeverOnDay = (day, lever) => {
    const dateKey = getDateKey(day);
    const dayLevers = calendarData[dateKey] || [];
    const exists = dayLevers.find(l => l.id === lever.id);
    if (exists) {
      removeLever(day, lever.id);
    } else {
      setCalendarData(prev => ({ ...prev, [dateKey]: [...dayLevers, lever] }));
    }
  };

  const updateActuals = (day, value) => {
    const dateKey = getDateKey(day);
    setActualsData(prev => ({ ...prev, [dateKey]: value === '' ? null : Number(value) }));
  };

  const updateNotes = (day, note) => {
    const dateKey = getDateKey(day);
    setNotesData(prev => ({ ...prev, [dateKey]: note }));
  };

  const getDayForecast = (day) => {
    const dateKey = getDateKey(day);
    const dayLevers = calendarData[dateKey] || [];
    return dayLevers.reduce((sum, lever) => sum + lever.dailyRate, 0);
  };

  const getDayActual = (day) => actualsData[getDateKey(day)] ?? null;
  const getDayVariance = (day) => {
    const forecast = getDayForecast(day);
    const actual = getDayActual(day);
    if (actual === null || forecast === 0) return null;
    return actual - forecast;
  };

  const getVarianceStatus = (day) => {
    const variance = getDayVariance(day);
    if (variance === null) return 'pending';
    if (variance >= 0) return 'hit';
    if (variance >= -2) return 'close';
    return 'miss';
  };

  const getMonthlyTotals = () => {
    let forecast = 0, actual = 0, daysReported = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      forecast += getDayForecast(day);
      const dayActual = getDayActual(day);
      if (dayActual !== null) { actual += dayActual; daysReported++; }
    }
    return { forecast, actual, daysReported };
  };

  const getWeeklyData = () => {
    const weeks = [];
    let week = { forecast: 0, actual: 0, daysReported: 0, days: [] };
    let dayCount = 0;
    for (let i = 0; i < firstDay; i++) dayCount++;
    for (let day = 1; day <= daysInMonth; day++) {
      const forecast = getDayForecast(day);
      const actual = getDayActual(day);
      week.forecast += forecast;
      week.days.push(day);
      if (actual !== null) { week.actual += actual; week.daysReported++; }
      dayCount++;
      if (dayCount === 7 || day === daysInMonth) {
        weeks.push(week);
        week = { forecast: 0, actual: 0, daysReported: 0, days: [] };
        dayCount = 0;
      }
    }
    return weeks;
  };

  const getLeverStats = () => {
    const stats = {};
    levers.forEach(lever => { stats[lever.id] = { daysUsed: 0, projectedUnits: 0 }; });
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(day);
      const dayLevers = calendarData[dateKey] || [];
      dayLevers.forEach(lever => {
        if (stats[lever.id]) {
          stats[lever.id].daysUsed++;
          stats[lever.id].projectedUnits += lever.dailyRate;
        }
      });
    }
    return stats;
  };

  const updateLever = (leverId, field, value) => {
    setLevers(prev => prev.map(l => {
      if (l.id === leverId) {
        const updated = { ...l, [field]: value };
        if (field === 'monthlyUnits' || field === 'attributionDays') {
          updated.dailyRate = Math.round((updated.monthlyUnits / updated.attributionDays) * 10) / 10;
        }
        return updated;
      }
      return l;
    }));
  };

  const addLever = () => {
    const newId = `lever-${Date.now()}`;
    const colorIndex = levers.length % leverColors.length;
    setLevers(prev => [...prev, {
      id: newId,
      name: 'New Lever',
      monthlyUnits: 30,
      attributionDays: 21,
      dailyRate: 1.4,
      color: leverColors[colorIndex]
    }]);
  };

  const deleteLever = (leverId) => {
    setLevers(prev => prev.filter(l => l.id !== leverId));
    setCalendarData(prev => {
      const updated = {};
      Object.keys(prev).forEach(key => {
        updated[key] = prev[key].filter(l => l.id !== leverId);
      });
      return updated;
    });
  };

  const updateMonthlyBudget = (year, month, value) => {
    setMonthlyBudgets(prev => ({ ...prev, [`${year}-${month}`]: Number(value) || 0 }));
  };

  const monthlyTotals = getMonthlyTotals();
  const weeklyData = getWeeklyData();
  const leverStats = getLeverStats();

  const forecastRevenue = monthlyTotals.forecast * averageUnitRevenue;
  const actualRevenue = monthlyTotals.actual * averageUnitRevenue;
  const budgetRevenue = budget * averageUnitRevenue;

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
    setSelectedDay(null);
  };

  const clearMonth = () => {
    const newCalendar = { ...calendarData };
    const newActuals = { ...actualsData };
    const newNotes = { ...notesData };
    for (let day = 1; day <= daysInMonth; day++) {
      const key = getDateKey(day);
      delete newCalendar[key];
      delete newActuals[key];
      delete newNotes[key];
    }
    setCalendarData(newCalendar);
    setActualsData(newActuals);
    setNotesData(newNotes);
  };

  const exportData = () => {
    const data = {
      teamName, averageUnitRevenue, levers, monthlyBudgets,
      month: `${months[currentMonth]} ${currentYear}`,
      calendarData, actualsData, notesData,
      summary: {
        unitForecast: monthlyTotals.forecast,
        unitActual: monthlyTotals.actual,
        unitBudget: budget,
        revenueForecast: forecastRevenue,
        revenueActual: actualRevenue,
        revenueBudget: budgetRevenue
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teamName.replace(/\s+/g, '-')}-${months[currentMonth]}-${currentYear}.json`;
    a.click();
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-2xl font-bold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setViewMode('plan')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'plan' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📅 Plan
            </button>
            <button onClick={() => setViewMode('track')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'track' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              📊 Track
            </button>
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
              ⚙️ Settings
            </button>
            <button onClick={exportData} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
              ⬇️ Export
            </button>
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Units Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">📦 Units</h3>
              <div className="text-sm text-gray-500">Budget: {budget} units</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 uppercase">Forecast</div>
                <div className="text-xl font-bold text-blue-600">{monthlyTotals.forecast.toFixed(1)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Actual</div>
                <div className="text-xl font-bold text-green-600">{monthlyTotals.daysReported > 0 ? monthlyTotals.actual.toFixed(1) : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Variance</div>
                <div className={`text-xl font-bold ${monthlyTotals.actual - monthlyTotals.forecast >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyTotals.daysReported > 0 ? `${(monthlyTotals.actual - monthlyTotals.forecast) >= 0 ? '+' : ''}${(monthlyTotals.actual - monthlyTotals.forecast).toFixed(1)}` : '—'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Forecast vs Budget</span>
                  <span>{((monthlyTotals.forecast / budget) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((monthlyTotals.forecast / budget) * 100, 100)}%` }} />
                </div>
              </div>
              {monthlyTotals.daysReported > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Actual vs Forecast</span>
                    <span>{((monthlyTotals.actual / monthlyTotals.forecast) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${monthlyTotals.actual >= monthlyTotals.forecast ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((monthlyTotals.actual / monthlyTotals.forecast) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">💰 Revenue</h3>
              <div className="text-sm text-gray-500">AUR: {formatCurrency(averageUnitRevenue)}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-xs text-gray-500 uppercase">Forecast</div>
                <div className="text-xl font-bold text-blue-600">{formatCurrency(forecastRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Actual</div>
                <div className="text-xl font-bold text-green-600">{monthlyTotals.daysReported > 0 ? formatCurrency(actualRevenue) : '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase">Variance</div>
                <div className={`text-xl font-bold ${actualRevenue - forecastRevenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyTotals.daysReported > 0 ? `${(actualRevenue - forecastRevenue) >= 0 ? '+' : ''}${formatCurrency(actualRevenue - forecastRevenue)}` : '—'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Forecast vs Budget ({formatCurrency(budgetRevenue)})</span>
                  <span>{((forecastRevenue / budgetRevenue) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min((forecastRevenue / budgetRevenue) * 100, 100)}%` }} />
                </div>
              </div>
              {monthlyTotals.daysReported > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Actual vs Forecast</span>
                    <span>{((actualRevenue / forecastRevenue) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all ${actualRevenue >= forecastRevenue ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((actualRevenue / forecastRevenue) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 space-y-4">
            {viewMode === 'plan' ? (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-700 mb-2">Sales Levers</h2>
                <p className="text-xs text-gray-500 mb-3">Drag to calendar or click day first</p>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {levers.map(lever => {
                    const stats = leverStats[lever.id] || { daysUsed: 0, projectedUnits: 0 };
                    return (
                      <div
                        key={lever.id}
                        draggable
                        onDragStart={() => handleDragStart(lever)}
                        onClick={() => selectedDay && toggleLeverOnDay(selectedDay, lever)}
                        className="p-2 rounded-lg cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: lever.color + '20', borderLeft: `4px solid ${lever.color}` }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm text-gray-800">{lever.name}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: lever.color }}>{lever.dailyRate}/d</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{stats.daysUsed}d → {stats.projectedUnits.toFixed(1)} units</div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={clearMonth} className="mt-4 w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">Clear Month</button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-700 mb-3">Performance Legend</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500" /><span>Hit/Exceeded</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500" /><span>Close (-2 to 0)</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500" /><span>Missed</span></div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-300" /><span>Pending</span></div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-700 mb-3">Weekly Summary</h2>
              <div className="space-y-3">
                {weeklyData.map((week, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex justify-between font-medium">
                      <span>Week {i + 1}</span>
                      <span className={week.actual >= week.forecast ? 'text-green-600' : 'text-gray-600'}>
                        {week.daysReported > 0 ? `${week.actual.toFixed(1)} / ` : ''}{week.forecast.toFixed(1)}
                      </span>
                    </div>
                    {week.daysReported > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className={`h-1.5 rounded-full ${week.actual >= week.forecast ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min((week.actual / week.forecast) * 100, 100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 border-b">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h2 className="text-xl font-semibold text-gray-800">{months[currentMonth]} {currentYear}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 border-b">
                {daysOfWeek.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-24 p-1 border-r border-b bg-gray-50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKey(day);
                  const dayLevers = calendarData[dateKey] || [];
                  const forecast = getDayForecast(day);
                  const actual = getDayActual(day);
                  const status = getVarianceStatus(day);
                  const note = notesData[dateKey] || '';
                  const isSelected = selectedDay === day;
                  const statusColors = { hit: 'bg-green-50 border-green-300', close: 'bg-amber-50 border-amber-300', miss: 'bg-red-50 border-red-300', pending: '' };

                  return (
                    <div
                      key={day}
                      className={`min-h-24 p-1 border-r border-b transition-colors cursor-pointer ${isSelected ? 'ring-2 ring-blue-400 ring-inset bg-blue-50' : 'hover:bg-gray-50'} ${viewMode === 'track' && actual !== null ? statusColors[status] : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(day)}
                      onClick={() => { setSelectedDay(day); if (viewMode === 'track') setShowDayModal(true); }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-gray-700">{day}</span>
                        <div className="flex flex-col items-end gap-0.5">
                          {forecast > 0 && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">F:{forecast.toFixed(1)}</span>}
                          {actual !== null && <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${status === 'hit' ? 'bg-green-100 text-green-700' : status === 'close' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>A:{actual}</span>}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        {dayLevers.slice(0, 3).map(lever => (
                          <div key={lever.id} className="text-xs px-1 py-0.5 rounded truncate flex items-center justify-between group" style={{ backgroundColor: lever.color + '30', color: lever.color }}>
                            <span className="truncate font-medium">{lever.name}</span>
                            {viewMode === 'plan' && <button onClick={(e) => { e.stopPropagation(); removeLever(day, lever.id); }} className="opacity-0 group-hover:opacity-100 ml-1 hover:text-red-600">×</button>}
                          </div>
                        ))}
                        {dayLevers.length > 3 && <div className="text-xs text-gray-500 pl-1">+{dayLevers.length - 3} more</div>}
                      </div>
                      {note && <div className="mt-1 text-xs text-gray-400 truncate">📝</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedDay && viewMode === 'plan' && (
              <div className="mt-4 bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Day {selectedDay} - Quick Toggle</h3>
                <div className="flex flex-wrap gap-2">
                  {levers.map(lever => {
                    const isActive = (calendarData[getDateKey(selectedDay)] || []).find(l => l.id === lever.id);
                    return (
                      <button key={lever.id} onClick={() => toggleLeverOnDay(selectedDay, lever)} className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${isActive ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: lever.color + (isActive ? '40' : '20'), color: lever.color }}>
                        {lever.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Settings</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="flex border-b">
                <button onClick={() => setSettingsTab('levers')} className={`px-6 py-3 font-medium ${settingsTab === 'levers' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Levers</button>
                <button onClick={() => setSettingsTab('budgets')} className={`px-6 py-3 font-medium ${settingsTab === 'budgets' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Monthly Budgets</button>
                <button onClick={() => setSettingsTab('revenue')} className={`px-6 py-3 font-medium ${settingsTab === 'revenue' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Revenue</button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {settingsTab === 'levers' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-gray-600">Configure your sales conversion mechanisms. Daily rate auto-calculates from Monthly Units ÷ Attribution Days.</p>
                      <button onClick={addLever} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add Lever</button>
                    </div>
                    <div className="space-y-3">
                      {levers.map((lever, idx) => (
                        <div key={lever.id} className="p-4 border rounded-lg" style={{ borderLeftColor: lever.color, borderLeftWidth: '4px' }}>
                          <div className="grid grid-cols-6 gap-3 items-end">
                            <div className="col-span-2">
                              <label className="block text-xs text-gray-500 mb-1">Name</label>
                              <input type="text" value={lever.name} onChange={(e) => updateLever(lever.id, 'name', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Monthly Units</label>
                              <input type="number" value={lever.monthlyUnits} onChange={(e) => updateLever(lever.id, 'monthlyUnits', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Attribution Days</label>
                              <input type="number" value={lever.attributionDays} onChange={(e) => updateLever(lever.id, 'attributionDays', Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Daily Rate</label>
                              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium">{lever.dailyRate}/day</div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Color</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={lever.color} onChange={(e) => updateLever(lever.id, 'color', e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                                <button onClick={() => deleteLever(lever.id)} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">Delete</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {settingsTab === 'budgets' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Set unit budgets for each month. These targets determine your forecast progress.</p>
                    <div className="grid grid-cols-2 gap-6">
                      {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                        <div key={year}>
                          <h3 className="font-semibold text-gray-700 mb-3">{year}</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {months.map((month, idx) => (
                              <div key={`${year}-${idx}`}>
                                <label className="block text-xs text-gray-500 mb-1">{month.substring(0, 3)}</label>
                                <input
                                  type="number"
                                  value={monthlyBudgets[`${year}-${idx}`] || 0}
                                  onChange={(e) => updateMonthlyBudget(year, idx, e.target.value)}
                                  className={`w-full px-2 py-1 border rounded text-sm ${year === currentYear && idx === currentMonth ? 'border-blue-500 bg-blue-50' : ''}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {settingsTab === 'revenue' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Set your Average Unit Revenue to calculate revenue forecasts from unit projections.</p>
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Average Unit Revenue (AUR)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={averageUnitRevenue}
                          onChange={(e) => setAverageUnitRevenue(Number(e.target.value))}
                          className="w-full px-4 py-3 border-2 rounded-lg text-lg"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Current month projection: {monthlyTotals.forecast.toFixed(1)} units × {formatCurrency(averageUnitRevenue)} = {formatCurrency(forecastRevenue)}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Done</button>
              </div>
            </div>
          </div>
        )}

        {/* Day Detail Modal */}
        {showDayModal && selectedDay && viewMode === 'track' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDayModal(false)}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{months[currentMonth]} {selectedDay}, {currentYear}</h3>
                <button onClick={() => setShowDayModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Active Levers</label>
                <div className="flex flex-wrap gap-2">
                  {(calendarData[getDateKey(selectedDay)] || []).map(lever => (
                    <span key={lever.id} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: lever.color + '30', color: lever.color }}>{lever.name}</span>
                  ))}
                  {(calendarData[getDateKey(selectedDay)] || []).length === 0 && <span className="text-gray-400 text-sm">No levers scheduled</span>}
                </div>
              </div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Daily Forecast</div>
                <div className="text-2xl font-bold text-blue-700">{getDayForecast(selectedDay).toFixed(1)} units</div>
                <div className="text-sm text-blue-500">{formatCurrency(getDayForecast(selectedDay) * averageUnitRevenue)} revenue</div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Actual Units Collected</label>
                <input type="number" value={actualsData[getDateKey(selectedDay)] ?? ''} onChange={(e) => updateActuals(selectedDay, e.target.value)} placeholder="Enter actual units..." className="w-full px-4 py-3 border-2 rounded-lg text-lg focus:border-blue-500 focus:outline-none" />
              </div>
              {getDayActual(selectedDay) !== null && (
                <div className={`mb-4 p-3 rounded-lg ${getDayVariance(selectedDay) >= 0 ? 'bg-green-50' : getDayVariance(selectedDay) >= -2 ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <div className={`text-sm font-medium ${getDayVariance(selectedDay) >= 0 ? 'text-green-600' : getDayVariance(selectedDay) >= -2 ? 'text-amber-600' : 'text-red-600'}`}>Variance</div>
                  <div className={`text-2xl font-bold ${getDayVariance(selectedDay) >= 0 ? 'text-green-700' : getDayVariance(selectedDay) >= -2 ? 'text-amber-700' : 'text-red-700'}`}>{getDayVariance(selectedDay) >= 0 ? '+' : ''}{getDayVariance(selectedDay).toFixed(1)} units</div>
                  <div className={`text-sm ${getDayVariance(selectedDay) >= 0 ? 'text-green-500' : getDayVariance(selectedDay) >= -2 ? 'text-amber-500' : 'text-red-500'}`}>{getDayVariance(selectedDay) >= 0 ? '+' : ''}{formatCurrency(getDayVariance(selectedDay) * averageUnitRevenue)} revenue</div>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Manager Notes</label>
                <textarea value={notesData[getDateKey(selectedDay)] || ''} onChange={(e) => updateNotes(selectedDay, e.target.value)} placeholder="Add context about today's performance..." rows={3} className="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 focus:outline-none resize-none" />
              </div>
              <button onClick={() => setShowDayModal(false)} className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save & Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
