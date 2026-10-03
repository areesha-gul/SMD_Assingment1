import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native';
import { BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 32;

// ---------- helper functions ----------
function getPercent(course) {
  if (course.total === 0) return 0;
  return (course.attended / course.total) * 100;
}

// 3 levels: Safe (80+), Warning (75-79), Low (below 75)
function getStatus(course) {
  const p = getPercent(course);
  if (p >= 80) return 'Safe';
  if (p >= 75) return 'Warning';
  return 'Low';
}

function getColor(status) {
  if (status === 'Safe') return '#3E8E5A';
  if (status === 'Warning') return '#D9822B';
  return '#C0392B';
}

function classesCanSkip(course) {
  const n = Math.floor(course.attended / 0.75 - course.total);
  return n < 0 ? 0 : n;
}

function classesNeeded(course) {
  return Math.ceil(3 * course.total - 4 * course.attended);
}

// marks percentage of one course (null if no marks yet)
function getMarksPercent(course) {
  if (course.marks.length === 0) return null;
  let got = 0;
  let max = 0;
  course.marks.forEach((m) => {
    got = got + m.got;
    max = max + m.max;
  });
  return (got / max) * 100;
}

function getGrade(p) {
  if (p >= 85) return 'A';
  if (p >= 75) return 'B';
  if (p >= 65) return 'C';
  if (p >= 50) return 'D';
  return 'F';
}

// ---------- reusable components ----------
function Button({ title, onPress, color }) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color || '#2F6F62' }]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.grey}>{label}</Text>
    </View>
  );
}

function CourseCard({ course, onPresent, onAbsent, onOpen }) {
  const status = getStatus(course);
  const color = getColor(status);

  return (
    <View style={styles.card}>
      <Text style={styles.courseName}>{course.name}</Text>
      <Text style={styles.grey}>{course.code}</Text>
      <Text style={[styles.percent, { color: color }]}>
        {getPercent(course).toFixed(1)}% ({status})
      </Text>
      <Text style={styles.grey}>Attended {course.attended} of {course.total} classes</Text>

      {status === 'Low' ? (
        <Text style={[styles.tip, { color: '#C0392B' }]}>
          Warning! Attend the next {classesNeeded(course)} class(es) to reach 75%.
        </Text>
      ) : (
        <Text style={styles.tip}>You can skip {classesCanSkip(course)} more class(es).</Text>
      )}

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 5 }}><Button title="Present" onPress={onPresent} /></View>
        <View style={{ flex: 1, marginLeft: 5 }}><Button title="Absent" color="#C0392B" onPress={onAbsent} /></View>
      </View>
      <View style={{ height: 8 }} />
      <Button title="Marks & Details" color="#555" onPress={onOpen} />
    </View>
  );
}

// ---------- main app ----------
export default function App() {
  const [screen, setScreen] = useState('home'); // 'home', 'courses', 'add', 'detail'
  const [selectedId, setSelectedId] = useState(null);
  const [courses, setCourses] = useState([
    { id: 1, code: 'CS301', name: 'Operating Systems', attended: 20, total: 24,
      marks: [{ title: 'Quiz 1', got: 8, max: 10 }, { title: 'Midterm', got: 22, max: 30 }] },
    { id: 2, code: 'CS312', name: 'Mobile App Development', attended: 15, total: 22,
      marks: [{ title: 'Assignment 1', got: 6, max: 10 }] },
    { id: 3, code: 'MT204', name: 'Linear Algebra', attended: 26, total: 28, marks: [] },
    { id: 4, code: 'SS101', name: 'Technical Writing', attended: 9, total: 14, marks: [] },
  ]);

  // search, filter, sort
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortLow, setSortLow] = useState(true);

  // add-course form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [attended, setAttended] = useState('');
  const [total, setTotal] = useState('');
  const [error, setError] = useState('');

  // add-marks form
  const [markTitle, setMarkTitle] = useState('');
  const [markGot, setMarkGot] = useState('');
  const [markMax, setMarkMax] = useState('');
  const [markError, setMarkError] = useState('');

  function markAttendance(id, present) {
    const updated = courses.map((c) => {
      if (c.id === id) {
        return { ...c, attended: present ? c.attended + 1 : c.attended, total: c.total + 1 };
      }
      return c;
    });
    setCourses(updated);
  }

  function addCourse() {
    if (name.trim() === '' || code.trim() === '') {
      setError('Please enter the course name and code.');
      return;
    }
    // duplicate check using array method some()
    if (courses.some((c) => c.code === code.trim().toUpperCase())) {
      setError('This course code already exists.');
      return;
    }
    if (attended === '' || total === '' || isNaN(attended) || isNaN(total)) {
      setError('Attended and total classes must be numbers.');
      return;
    }
    if (Number(attended) > Number(total)) {
      setError('Attended classes cannot be more than total classes.');
      return;
    }
    const newCourse = {
      id: Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      attended: Number(attended),
      total: Number(total),
      marks: [],
    };
    setCourses([...courses, newCourse]);
    setName(''); setCode(''); setAttended(''); setTotal(''); setError('');
    setScreen('courses');
  }

  function addMarks() {
    if (markTitle.trim() === '') {
      setMarkError('Enter the assessment name (e.g. Quiz 2).');
      return;
    }
    if (markGot === '' || markMax === '' || isNaN(markGot) || isNaN(markMax)) {
      setMarkError('Marks must be numbers.');
      return;
    }
    if (Number(markMax) <= 0 || Number(markGot) > Number(markMax)) {
      setMarkError('Total must be above 0 and obtained cannot be more than total.');
      return;
    }
    const newMark = { title: markTitle.trim(), got: Number(markGot), max: Number(markMax) };
    setCourses(courses.map((c) => (c.id === selectedId ? { ...c, marks: [...c.marks, newMark] } : c)));
    setMarkTitle(''); setMarkGot(''); setMarkMax(''); setMarkError('');
  }

  function deleteCourse(id) {
    Alert.alert('Delete course?', 'This cannot be undone.', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: () => {
          setCourses(courses.filter((c) => c.id !== id));
          setScreen('courses');
        },
      },
    ]);
  }

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(47, 111, 98, ${opacity})`,
    labelColor: () => '#555555',
  };

  // ring is solid green, track (background ring) is light
  const progressConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => (opacity <= 0.3 ? 'rgba(47, 111, 98, 0.15)' : '#2F6F62'),
    labelColor: () => '#555555',
  };

  // ---------- HOME / DASHBOARD ----------
  if (screen === 'home') {
    const safeCount = courses.filter((c) => getStatus(c) === 'Safe').length;
    const warnCount = courses.filter((c) => getStatus(c) === 'Warning').length;
    const lowCourses = courses.filter((c) => getStatus(c) === 'Low');

    let totalPercent = 0;
    courses.forEach((c) => { totalPercent = totalPercent + getPercent(c); });
    const average = courses.length === 0 ? 0 : totalPercent / courses.length;

    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>My Attendance</Text>

        <View style={styles.row}>
          <StatBox label="Courses" value={courses.length} />
          <StatBox label="Average" value={average.toFixed(0) + '%'} />
          <StatBox label="At risk" value={lowCourses.length} />
        </View>

        {lowCourses.length > 0 ? (
          <View style={[styles.card, { borderColor: '#C0392B' }]}>
            <Text style={styles.courseName}>Needs attention</Text>
            {lowCourses.map((c) => (
              <Text key={c.id}>• {c.name}: attend next {classesNeeded(c)} class(es)</Text>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.courseName}>No course is below 75%. Great!</Text>
          </View>
        )}

        {courses.length > 0 && (
          <View>
            <Text style={styles.subtitle}>Attendance % per course</Text>
            <BarChart
              data={{
                labels: courses.map((c) => c.code),
                datasets: [{ data: courses.map((c) => Math.round(getPercent(c))) }],
              }}
              width={screenWidth}
              height={220}
              yAxisSuffix="%"
              fromZero
              chartConfig={chartConfig}
            />

            <Text style={styles.subtitle}>Course status</Text>
            <PieChart
              data={[
                { name: 'Safe', population: safeCount, color: '#3E8E5A', legendFontColor: '#333', legendFontSize: 13 },
                { name: 'Warning', population: warnCount, color: '#D9822B', legendFontColor: '#333', legendFontSize: 13 },
                { name: 'Low', population: lowCourses.length, color: '#C0392B', legendFontColor: '#333', legendFontSize: 13 },
              ]}
              width={screenWidth}
              height={150}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />

            <Text style={styles.subtitle}>Overall attendance vs 75% goal</Text>
            <View style={[styles.card, styles.center]}>
              <ProgressChart
                data={{ labels: ['Average'], data: [Math.min(average / 100, 1)] }}
                width={160}
                height={160}
                strokeWidth={14}
                radius={50}
                hideLegend={true}
                chartConfig={progressConfig}
              />
              <Text style={styles.percent}>{average.toFixed(0)}% average</Text>
              <Text style={styles.grey}>
                {average >= 75 ? 'You are above the 75% goal.' : 'You are below the 75% goal.'}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 8 }} />
        <Button title="View / Update Courses" onPress={() => setScreen('courses')} />
        <View style={{ height: 10 }} />
        <Button title="Add a Course" color="#555" onPress={() => setScreen('add')} />
      </ScrollView>
    );
  }

  // ---------- COURSES ----------
  if (screen === 'courses') {
    let shown = courses.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (filter !== 'All') {
      shown = shown.filter((c) => getStatus(c) === filter);
    }
    // sort a COPY of the array
    shown = [...shown].sort((a, b) => {
      if (sortLow) return getPercent(a) - getPercent(b);
      return a.name.localeCompare(b.name);
    });

    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setScreen('home')}>
          <Text style={styles.back}>‹ Back to dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Courses</Text>

        <TextInput style={styles.input} placeholder="Search course..." value={search} onChangeText={setSearch} />

        <View style={styles.row}>
          {['All', 'Safe', 'Warning', 'Low'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={filter === f ? { color: 'white' } : null}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={sortLow ? 'Sorted: lowest attendance first (tap for A-Z)' : 'Sorted: A-Z (tap for lowest first)'}
          color="#D9822B"
          onPress={() => setSortLow(!sortLow)}
        />
        <View style={{ height: 12 }} />

        {shown.length === 0 ? (
          <Text style={styles.grey}>No courses found.</Text>
        ) : (
          shown.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onPresent={() => markAttendance(c.id, true)}
              onAbsent={() => markAttendance(c.id, false)}
              onOpen={() => { setSelectedId(c.id); setScreen('detail'); }}
            />
          ))
        )}

        <Button title="Add a Course" onPress={() => setScreen('add')} />
      </ScrollView>
    );
  }

  // ---------- DETAIL (marks) ----------
  if (screen === 'detail') {
    const course = courses.find((c) => c.id === selectedId);
    const marksPercent = getMarksPercent(course);

    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setScreen('courses')}>
          <Text style={styles.back}>‹ Back to courses</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{course.name}</Text>

        <View style={styles.card}>
          <Text style={styles.courseName}>Marks</Text>
          {marksPercent === null ? (
            <Text style={styles.grey}>No marks added yet.</Text>
          ) : (
            <View>
              <Text style={styles.percent}>{marksPercent.toFixed(1)}% - Grade {getGrade(marksPercent)}</Text>
              {course.marks.map((m, index) => (
                <Text key={index}>{m.title}: {m.got}/{m.max}</Text>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.subtitle}>Add marks</Text>
        <TextInput style={styles.input} placeholder="Assessment (e.g. Quiz 2)" value={markTitle} onChangeText={setMarkTitle} />
        <TextInput style={styles.input} placeholder="Marks obtained" value={markGot} onChangeText={setMarkGot} keyboardType="numeric" maxLength={5} />
        <TextInput style={styles.input} placeholder="Total marks" value={markMax} onChangeText={setMarkMax} keyboardType="numeric" maxLength={5} />
        {markError !== '' && <Text style={styles.error}>{markError}</Text>}
        <Button title="Save Marks" onPress={addMarks} />
        <View style={{ height: 10 }} />
        <Button title="Delete this course" color="#C0392B" onPress={() => deleteCourse(course.id)} />
      </ScrollView>
    );
  }

  // ---------- ADD COURSE ----------
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={() => setScreen('home')}>
        <Text style={styles.back}>‹ Back to dashboard</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Add a Course</Text>

      <TextInput style={styles.input} placeholder="Course name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Course code (e.g. CS201)" value={code} onChangeText={setCode}
        autoCapitalize="characters" maxLength={6} />
      <TextInput style={styles.input} placeholder="Classes attended" value={attended} onChangeText={setAttended}
        keyboardType="numeric" maxLength={3} />
      <TextInput style={styles.input} placeholder="Total classes held" value={total} onChangeText={setTotal}
        keyboardType="numeric" maxLength={3} />

      {error !== '' && <Text style={styles.error}>{error}</Text>}
      <Button title="Save Course" onPress={addCourse} />
    </ScrollView>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F4EE', paddingTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#1E2A28' },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 14, marginBottom: 6 },
  back: { color: '#2F6F62', fontSize: 16, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#DDE3DC' },
  courseName: { fontSize: 17, fontWeight: 'bold' },
  grey: { color: '#6B7A76', marginTop: 2 },
  percent: { fontSize: 22, fontWeight: 'bold', marginVertical: 6 },
  tip: { marginVertical: 8 },
  center: { alignItems: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  statBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 12, margin: 4, alignItems: 'center', borderWidth: 1, borderColor: '#DDE3DC' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#2F6F62' },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#DDE3DC', backgroundColor: 'white', marginRight: 8, marginBottom: 10 },
  chipActive: { backgroundColor: '#2F6F62', borderColor: '#2F6F62' },
  button: { padding: 13, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#DDE3DC', borderRadius: 10, padding: 10, marginBottom: 10 },
  error: { color: '#C0392B', marginBottom: 10 },
});