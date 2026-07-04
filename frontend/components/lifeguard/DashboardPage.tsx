'use client';

import {
  Activity,
  Pill,
  Calendar,
  Clock,
  TrendingUp,
  Heart,
  Droplets,
  Thermometer,
  Scale,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Bell,
  Plus,
  BarChart2,
  Stethoscope,
} from 'lucide-react';

const vitals = [
  { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'red', trend: '+2', good: true },
  { label: 'Blood Pressure', value: '118/78', unit: 'mmHg', icon: Activity, color: 'blue', trend: 'Normal', good: true },
  { label: 'Blood Glucose', value: '95', unit: 'mg/dL', icon: Droplets, color: 'green', trend: '-3', good: true },
  { label: 'Temperature', value: '98.6', unit: '°F', icon: Thermometer, color: 'orange', trend: 'Normal', good: true },
  { label: 'Weight', value: '68', unit: 'kg', icon: Scale, color: 'teal', trend: '-0.5 kg', good: true },
  { label: 'SpO2', value: '98', unit: '%', icon: TrendingUp, color: 'purple', trend: 'Normal', good: true },
];

const colorMap: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  red:    { bg: 'bg-[#FDEEEE]',  text: 'text-[#E05252]', bar: 'bg-[#E05252]', border: 'border-[#F5CFCF]' },
  blue:   { bg: 'bg-[#EAF1FE]',  text: 'text-[#2E6BE6]', bar: 'bg-[#2E6BE6]', border: 'border-[#C9D9F5]' },
  green:  { bg: 'bg-[#E9F7F2]',  text: 'text-[#12A17C]', bar: 'bg-[#12A17C]', border: 'border-[#CFEEE1]' },
  orange: { bg: 'bg-[#FBF3E4]',  text: 'text-[#E8A13D]', bar: 'bg-[#E8A13D]', border: 'border-[#F2DFB6]' },
  teal:   { bg: 'bg-[#E9F7F2]',  text: 'text-[#0B7A5E]', bar: 'bg-[#0B7A5E]', border: 'border-[#CFEEE1]' },
  purple: { bg: 'bg-[#F3EEFE]',  text: 'text-[#7C4FE0]', bar: 'bg-[#7C4FE0]', border: 'border-[#D4BEFC]' },
};

const medications = [
  { name: 'Amoxicillin 500mg', schedule: '3× daily with food', nextDose: '2:00 PM', remaining: 14, total: 21, color: 'blue', status: 'on-track' },
  { name: 'Ibuprofen 400mg', schedule: 'Every 6–8 hrs as needed', nextDose: '6:00 PM', remaining: 8, total: 20, color: 'orange', status: 'low' },
  { name: 'Metformin 500mg', schedule: 'Twice daily with meals', nextDose: '8:00 PM', remaining: 18, total: 30, color: 'green', status: 'on-track' },
  { name: 'Vitamin D3 1000IU', schedule: 'Once daily morning', nextDose: 'Tomorrow 8AM', remaining: 25, total: 30, color: 'teal', status: 'on-track' },
];

const appointments = [
  { doctor: 'Dr. Priya Sharma', specialty: 'Cardiologist', date: 'Jul 8, 2026', time: '10:30 AM', status: 'confirmed', avatar: 'PS' },
  { doctor: 'Dr. Arun Mehta', specialty: 'General Physician', date: 'Jul 15, 2026', time: '2:00 PM', status: 'pending', avatar: 'AM' },
  { doctor: 'Dr. Fatima Hassan', specialty: 'Endocrinologist', date: 'Aug 1, 2026', time: '11:00 AM', status: 'confirmed', avatar: 'FH' },
];

const recentReports = [
  { name: 'Complete Blood Count', date: 'Jun 28, 2026', type: 'Lab Report', result: 'Normal', good: true },
  { name: 'Chest X-Ray', date: 'Jun 20, 2026', type: 'Radiology', result: 'Clear', good: true },
  { name: 'Lipid Panel', date: 'Jun 10, 2026', type: 'Lab Report', result: 'Borderline', good: false },
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const adherenceData = [85, 100, 92, 78, 100, 88, 95];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#E3EAF6] px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="pl-10 md:pl-0">
            <h1 className="text-xl font-extrabold text-[#0F1E40]">Health Dashboard</h1>
            <p className="text-xs text-[#8B98B5] mt-0.5">Last updated: Just now</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-[#2E6BE6] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-blue-200 hover:bg-[#1E4FC0] transition-all">
              <Plus size={14} />
              <span className="hidden sm:inline">Add Record</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-8 py-6 space-y-6 max-w-6xl mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Medicines Today', value: '3/4', sub: '1 pending', icon: Pill, color: 'blue' },
            { label: 'Next Appointment', value: 'Jul 8', sub: 'Dr. Priya', icon: Calendar, color: 'green' },
            { label: 'Reports Pending', value: '0', sub: 'All clear', icon: FileText, color: 'teal' },
            { label: 'Health Score', value: '87/100', sub: '+5 this week', icon: Heart, color: 'red' },
          ].map(({ label, value, sub, icon: Icon, color }) => {
            const c = colorMap[color];
            return (
              <div key={label} className={`bg-white rounded-2xl p-5 border ${c.border} shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <ChevronRight size={14} className="text-[#C9D9F5]" />
                </div>
                <div className="text-2xl font-extrabold text-[#0F1E40] mb-0.5">{value}</div>
                <div className="text-xs text-[#8B98B5] font-medium">{label}</div>
                <div className={`text-xs ${c.text} font-semibold mt-1`}>{sub}</div>
              </div>
            );
          })}
        </div>

        {/* Vitals grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#0F1E40]">Current Vitals</h2>
            <span className="text-xs text-[#8B98B5]">Updated today, 9:30 AM</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {vitals.map(({ label, value, unit, icon: Icon, color, trend, good }) => {
              const c = colorMap[color];
              return (
                <div key={label} className={`bg-white rounded-2xl p-4 border ${c.border} shadow-sm text-center hover:shadow-md transition-shadow`}>
                  <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <Icon size={18} className={c.text} />
                  </div>
                  <div className="text-xl font-extrabold text-[#0F1E40]">{value}</div>
                  <div className="text-xs text-[#8B98B5] font-medium mb-2">{unit}</div>
                  <div className="text-[10px] text-[#3D4E73] font-medium mb-1">{label}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${good ? 'bg-[#E9F7F2] text-[#12A17C]' : 'bg-[#FBF3E4] text-[#E8A13D]'}`}>
                    {trend}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two columns: Medications + Adherence */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Medication Reminders */}
          <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F8FE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EAF1FE] rounded-lg flex items-center justify-center">
                  <Pill size={16} className="text-[#2E6BE6]" />
                </div>
                <span className="font-bold text-[#0F1E40] text-sm">Medication Reminders</span>
              </div>
              <button className="text-[#2E6BE6] text-xs font-semibold hover:underline">+ Add</button>
            </div>
            <div className="divide-y divide-[#F5F8FE]">
              {medications.map(({ name, schedule, nextDose, remaining, total, color, status }) => {
                const c = colorMap[color];
                const pct = Math.round((remaining / total) * 100);
                return (
                  <div key={name} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#26355A] truncate">{name}</div>
                        <div className="text-xs text-[#8B98B5]">{schedule}</div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                        <Clock size={11} className="text-[#8B98B5]" />
                        <span className="text-xs text-[#5B6B8C] font-medium">{nextDose}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F5F8FE] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${c.bar} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold ${status === 'low' ? 'text-[#E05252]' : 'text-[#12A17C]'}`}>
                        {remaining} left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Adherence */}
          <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F8FE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E9F7F2] rounded-lg flex items-center justify-center">
                  <BarChart2 size={16} className="text-[#12A17C]" />
                </div>
                <span className="font-bold text-[#0F1E40] text-sm">Weekly Adherence</span>
              </div>
              <span className="text-xs font-bold text-[#12A17C] bg-[#E9F7F2] px-2 py-1 rounded-full">91% avg</span>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-end justify-between gap-2 h-28">
                {weekDays.map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-[#12A17C]">{adherenceData[i]}%</span>
                    <div className="w-full bg-[#F5F8FE] rounded-t-lg overflow-hidden" style={{ height: '80px' }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${adherenceData[i] >= 90 ? 'bg-gradient-to-t from-[#0B7A5E] to-[#12A17C]' : adherenceData[i] >= 75 ? 'bg-gradient-to-t from-[#8A6414] to-[#E8A13D]' : 'bg-gradient-to-t from-[#A33B3B] to-[#E05252]'}`}
                        style={{ height: `${adherenceData[i]}%`, marginTop: 'auto' }}
                      />
                    </div>
                    <span className="text-[10px] text-[#8B98B5] font-medium">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-4">
              <div className="p-3 bg-[#E9F7F2] rounded-xl">
                <div className="flex items-center gap-2 text-[#0B7A5E] text-xs font-semibold">
                  <CheckCircle size={13} />
                  Great job! You missed only 1 dose this week.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments + Reports */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F8FE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FBF3E4] rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-[#E8A13D]" />
                </div>
                <span className="font-bold text-[#0F1E40] text-sm">Upcoming Appointments</span>
              </div>
              <button className="text-[#2E6BE6] text-xs font-semibold hover:underline">Book New</button>
            </div>
            <div className="divide-y divide-[#F5F8FE]">
              {appointments.map(({ doctor, specialty, date, time, status, avatar }) => (
                <div key={doctor} className="px-5 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A8C3F5] to-[#2E6BE6] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#26355A] truncate">{doctor}</div>
                    <div className="text-xs text-[#8B98B5]">{specialty}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-semibold text-[#3D4E73]">{date}</div>
                    <div className="text-xs text-[#8B98B5]">{time}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block ${status === 'confirmed' ? 'bg-[#E9F7F2] text-[#12A17C]' : 'bg-[#FBF3E4] text-[#E8A13D]'}`}>
                      {status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl border border-[#E3EAF6] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#F5F8FE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EAF1FE] rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-[#2E6BE6]" />
                </div>
                <span className="font-bold text-[#0F1E40] text-sm">Recent Reports</span>
              </div>
              <button className="text-[#2E6BE6] text-xs font-semibold hover:underline">Upload</button>
            </div>
            <div className="divide-y divide-[#F5F8FE]">
              {recentReports.map(({ name, date, type, result, good }) => (
                <div key={name} className="px-5 py-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${good ? 'bg-[#E9F7F2]' : 'bg-[#FBF3E4]'}`}>
                    {good
                      ? <CheckCircle size={18} className="text-[#12A17C]" />
                      : <AlertCircle size={18} className="text-[#E8A13D]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#26355A] truncate">{name}</div>
                    <div className="text-xs text-[#8B98B5]">{type} · {date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${good ? 'bg-[#E9F7F2] text-[#12A17C]' : 'bg-[#FBF3E4] text-[#E8A13D]'}`}>
                    {result}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4">
              <button className="w-full flex items-center justify-center gap-2 bg-[#F5F8FE] border border-[#E3EAF6] text-[#5B6B8C] hover:text-[#2E6BE6] hover:border-[#A8C3F5] text-xs font-semibold py-2.5 rounded-xl transition-all">
                <Stethoscope size={13} />
                View all medical records
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#0F1E40]">Health Alerts</h2>
          <div className="flex items-start gap-3 bg-[#FBF3E4] border border-[#F2DFB6] rounded-2xl px-5 py-4">
            <Bell size={16} className="text-[#E8A13D] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#8A6414]">Ibuprofen supply running low</div>
              <div className="text-xs text-[#8A6414]/80 mt-0.5">Only 8 tablets remaining. Consider refilling your prescription soon.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#EAF1FE] border border-[#C9D9F5] rounded-2xl px-5 py-4">
            <Calendar size={16} className="text-[#2E6BE6] mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#1E4FC0]">Appointment reminder</div>
              <div className="text-xs text-[#1E4FC0]/80 mt-0.5">Dr. Priya Sharma — Cardiologist, July 8 at 10:30 AM. 5 days away.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
