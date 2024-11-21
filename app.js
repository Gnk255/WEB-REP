require('dotenv').config(); // Завантаження змінних середовища з файлу .env
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');
const app = express();

const mongoURI = `mongodb+srv://vadimgolubenko777:bSEnBXrfh6KiJ3Wb@ecsdb.576vw.mongodb.net/?retryWrites=true&w=majority&appName=ECSDB`;

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Налаштування EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware для обробки POST-запитів
app.use(express.urlencoded({ extended: true }));

// Статичні файли
app.use(express.static('public'));

// Маршрут для головної сторінки (перегляд успішності студентів)
app.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.render('index', { students });
  } catch (err) {
    console.error('Failed to fetch students:', err);
    res.status(500).send('Server error');
  }
});

// Маршрут для сторінки додавання студента
app.get('/add-student', (req, res) => {
  res.render('addStudent');
});

// Маршрут для обробки форми додавання студента
app.post('/add-student', async (req, res) => {
  const { fullName, group } = req.body;
  try {
    const newStudent = new Student({ fullName, group, subjects: [] });
    await newStudent.save();
    res.redirect('/');
  } catch (err) {
    console.error('Failed to add student:', err);
    res.status(500).send('Server error');
  }
});

// Маршрут для сторінки додавання предмету та оцінок студенту
app.get('/add-subject/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    res.render('addSubject', { student });
  } catch (err) {
    console.error('Failed to fetch student:', err);
    res.status(500).send('Server error');
  }
});

// Маршрут для обробки форми додавання предмету та оцінок студенту
app.post('/add-subject/:id', async (req, res) => {
  const { subjectName, grades } = req.body;
  const gradesArray = grades.split(',').map(grade => parseFloat(grade.trim()));

  // Перевірка, щоб оцінки не перевищували 100
  if (gradesArray.some(grade => grade > 100)) {
    return res.status(400).send('Оцінка не може бути більше 100');
  }

  try {
    const student = await Student.findById(req.params.id);
    student.subjects.push({ subjectName, grades: gradesArray });
    await student.save();
    res.redirect('/');
  } catch (err) {
    console.error('Failed to add subject:', err);
    res.status(500).send('Server error');
  }
});

// Маршрут для видалення студента
app.post('/delete-student/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error('Failed to delete student:', err);
    res.status(500).send('Server error');
  }
});

// Маршрут для видалення предмету у студента
app.post('/delete-subject/:studentId/:subjectIndex', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    student.subjects.splice(req.params.subjectIndex, 1);
    await student.save();
    res.redirect('/');
  } catch (err) {
    console.error('Failed to delete subject:', err);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
