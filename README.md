# MySemester – Attendance & Marks Tracker

**Course:** Software for Mobile Devices – Assignment 1
**Student:** [Areesha Gul] ([I233080])
**Built with:** React Native (Expo), JavaScript, react-native-chart-kit

## 1. Problem

On the university student portal (FLEX), attendance is shown only as a raw number or percentage. Students still have to work out for themselves:

- "How many classes can I still miss and stay above 80%?"
- "How many classes do I need to attend to get back to 80%?"

Students often find out they are short on attendance too late.

## 2. Proposed Solution

MySemester is a mobile app that tracks attendance and marks for each course. It calculates the answers to the questions above automatically and updates the dashboard, warnings and charts whenever the data changes.

## 3. Major Features

| Feature | Description |
|---|---|
| Dashboard | Summary boxes (courses, average attendance, at-risk courses) and a warning card listing courses below 80% |
| Charts (react-native-chart-kit) | Bar Chart (attendance % per course), Pie Chart (Safe / Low courses), Progress Chart (overall attendance) |
| Attendance tracking | Present / Absent buttons update the percentage and status immediately |
| Smart recommendations | Shows how many classes can be skipped, or how many must be attended to reach 80% |
| Status levels | Safe (80% or more) and Low (below 80%), each with its own colour |
| Search, filter, sort | Search by name, filter by status, sort by lowest attendance or A–Z |
| Marks & grades | Add quiz/assignment/exam marks per course; shows percentage and grade |
| Add / delete course | Form with validation; delete asks for confirmation |
| Empty states | Messages shown when no course matches the search or filter |

## 4. Concepts Demonstrated

- **React:** components, props, `useState`, events (`onPress`, `onChangeText`), conditional rendering, lists with `key`
- **Reusable components:** `Button`, `StatBox`, `CourseCard`
- **JavaScript:** arrays/objects, `map`, `filter`, `find`, `some`, `forEach`, `sort`, spread operator, helper functions
- **Validation:** empty fields, non-numeric input, attended greater than total, duplicate course code, marks obtained greater than total; `keyboardType`, `maxLength`, `autoCapitalize`
- **Navigation:** screens are switched with a `screen` state variable (no side or bottom bars)

## 5. Key Formulas

Let `attended` = classes attended and `total` = classes held.

- Attendance % = `attended / total × 100`
- Classes that can still be skipped = `floor(attended / 0.8 − total)`
- Classes needed to reach 80% = `ceil(4 × total − 5 × attended)`

## 6. Setup and Run

### Option A – Expo Snack
1. Open [snack.expo.dev](https://snack.expo.dev)
2. Paste the contents of `App.js` into the editor
3. Add the dependencies `react-native-chart-kit` and `react-native-svg` when prompted
4. Run on the Android/iOS preview or scan the QR code with Expo Go

### Option B – Local
```bash
npx create-expo-app mysemester --template blank
cd mysemester
npx expo install react-native-svg
npm install react-native-chart-kit
# replace App.js with the App.js from this repository
npx expo start
```
Scan the QR code with the Expo Go app, or press `a` for the Android emulator.

## 7. Project Structure

```
App.js          # whole application (screens, components, logic)
README.md
```

## 8. AI Usage

AI tools were used as a development assistant. See the AI Usage Report submitted with this assignment.