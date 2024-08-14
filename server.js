const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use('/styles', express.static('styles'));
app.use('/assets', express.static('assets'));
app.use('/scripts', express.static('scripts'));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://mridulagn123:hello123@cluster0.1anp1bv.mongodb.net/classroom_db?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
.then((x) => {
    console.log('Connected to mongodb: ', x.connections[0].name);
})
.catch((err) => {
    console.log('Error connecting to mongodb: ', err);
});

const user_schema = new mongoose.Schema({
    email: String,
    password: String,
});

const sign_up_schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const classroomSchema = new mongoose.Schema({
    name: String,
    startTime: String,
    endTime: String,
    days: [String],
});

const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    assignedClassroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
});

const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    assignedClassroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
});



const User = mongoose.model('User', user_schema);
const SignUp = mongoose.model('SignUp', sign_up_schema);
const Classroom = mongoose.model('Classroom', classroomSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const Student = mongoose.model('Student', studentSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/principal', (req, res) => {
    res.sendFile(__dirname + '/principal.html');
});

app.get('/teacher', (req, res) => {
    res.sendFile(__dirname + '/teacher.html');
});

app.get('/student', (req, res) => {
    res.sendFile(__dirname + '/student.html');
});


app.post('/', (req, res) => {
    console.log('Form submitted:', req.body);

    // Check if the login is for the principal
    if (req.body.email === 'principal@classroom.com' && req.body.password === 'Admin') {
        res.redirect('/principal');
    } else {
        // Check if the login is for a teacher
        Teacher.findOne({ email: req.body.email, password: req.body.password })
            .then((teacher) => {
                if (teacher) {
                    // Successful teacher login
                    // Redirect to teacher.html with teacherId as a query parameter
                    res.redirect(`/teacher?teacherId=${teacher._id}`);
                } else {
                    // Check if the login is for a student
                    Student.findOne({ email: req.body.email, password: req.body.password })
                        .then((student) => {
                            if (student) {
                                // Successful student login
                                // Redirect to student.html with studentId as a query parameter
                                res.redirect(`/student?studentId=${student._id}`);
                            } else {
                                // Invalid credentials
                                res.status(401).send('Invalid credentials');
                            }
                        })
                        .catch((error) => {
                            console.error('Error logging in:', error);
                            res.status(500).send('Internal Server Error');
                        });
                }
            })
            .catch((error) => {
                console.error('Error logging in:', error);
                res.status(500).send('Internal Server Error');
            });
    }
});



// Create a new classroom
app.post('/api/classrooms', (req, res) => {
    const newClassroom = new Classroom({
        name: req.body.name,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        days: req.body.days
    });

    newClassroom.save()
        .then((classroom) => {
            res.status(201).send({ message: 'Classroom created successfully', classroom });
        })
        .catch((error) => {
            console.error('Error creating classroom:', error);
            res.status(500).send({ message: 'Error creating classroom', error });
        });
});

// Get all classrooms
app.get('/api/classrooms', (req, res) => {
    Classroom.find()
        .then((classrooms) => {
            res.send({ classrooms });
        })
        .catch((error) => {
            console.error('Error fetching classrooms:', error);
            res.status(500).send({ message: 'Error fetching classrooms', error });
        });
});

// Get all teachers
app.get('/api/teachers', (req, res) => {
    Teacher.find().populate('assignedClassroom')
        .then((teachers) => {
            res.send({ teachers });
        })
        .catch((error) => {
            console.error('Error fetching teachers:', error);
            res.status(500).send({ message: 'Error fetching teachers', error });
        });
});

// Add a new teacher
app.post('/api/teachers', (req, res) => {
    const newTeacher = new Teacher({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    newTeacher.save()
        .then((teacher) => {
            res.status(201).send({ message: 'Teacher added successfully', teacher });
        })
        .catch((error) => {
            console.error('Error adding teacher:', error);
            res.status(500).send({ message: 'Error adding teacher', error });
        });
});

// Delete a teacher by ID
app.delete('/api/teachers/:id', (req, res) => {
    Teacher.findByIdAndDelete(req.params.id)
        .then((teacher) => {
            if (!teacher) {
                return res.status(404).send({ message: 'Teacher not found' });
            }
            res.send({ message: 'Teacher deleted successfully' });
        })
        .catch((error) => {
            console.error('Error deleting teacher:', error);
            res.status(500).send({ message: 'Error deleting teacher', error });
        });
});

// Assign a classroom to a teacher
app.put('/api/teachers/:id/assign-classroom', (req, res) => {
    Teacher.findByIdAndUpdate(req.params.id, { assignedClassroom: req.body.classroomId }, { new: true })
        .then((teacher) => {
            if (!teacher) {
                return res.status(404).send({ message: 'Teacher not found' });
            }
            res.send({ message: 'Classroom assigned successfully', teacher });
        })
        .catch((error) => {
            console.error('Error assigning classroom:', error);
            res.status(500).send({ message: 'Error assigning classroom', error });
        });
});

//Add student
app.post('/api/students', (req, res) => {
    const newStudent = new Student({
        name: req.body.name,
        email: req.body.email,
        assignedClassroom: req.body.classroomId // Reference the classroom by ID
    });

    newStudent.save()
        .then((student) => {
            res.status(201).send({ message: 'Student added successfully', student });
        })
        .catch((error) => {
            console.error('Error adding student:', error);
            res.status(500).send({ message: 'Error adding student', error });
        });
});

app.get('/api/students', (req, res) => {
    Student.find()
        .populate('assignedClassroom') // Ensure that 'assignedClassroom' is valid and populated
        .then((students) => {
            res.send({ students });
        })
        .catch((error) => {
            console.error('Error fetching students:', error);
            res.status(500).send({ message: 'Error fetching students', error });
        });
});


app.put('/api/students/:id/assign', (req, res) => {
    Student.findByIdAndUpdate(req.params.id, { assignedClassroom: req.body.classroomId }, { new: true })
        .then((student) => {
            if (!student) {
                return res.status(404).send({ message: 'Student not found' });
            }
            res.send({ message: 'Classroom assigned successfully', student });
        })
        .catch((error) => {
            console.error('Error assigning classroom:', error);
            res.status(500).send({ message: 'Error assigning classroom', error });
        });
});

app.delete('/api/students/:id', (req, res) => {
    Student.findByIdAndDelete(req.params.id)
        .then((student) => {
            if (!student) {
                return res.status(404).send({ message: 'Student not found' });
            }
            res.send({ message: 'Student deleted successfully', student });
        })
        .catch((error) => {
            console.error('Error deleting student:', error);
            res.status(500).send({ message: 'Error deleting student', error });
        });
});

// Get students by teacher's assigned classroom
app.get('/api/teachers/:id/students', (req, res) => {
    Teacher.findById(req.params.id)
        .populate('assignedClassroom')
        .then((teacher) => {
            if (!teacher) {
                return res.status(404).send({ message: 'Teacher not found' });
            }
            Student.find({ assignedClassroom: teacher.assignedClassroom._id })
                .then((students) => {
                    res.send({ students });
                })
                .catch((error) => {
                    console.error('Error fetching students:', error);
                    res.status(500).send({ message: 'Error fetching students', error });
                });
        })
        .catch((error) => {
            console.error('Error fetching teacher:', error);
            res.status(500).send({ message: 'Error fetching teacher', error });
        });
});

app.post('/api/students', (req, res) => {
    console.log('Received student data:', req.body); // Check if password is received

    const newStudent = new Student({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password, // Save the password
        assignedClassroom: req.body.classroomId
    });

    newStudent.save()
        .then((student) => {
            console.log('Saved student:', student);
            res.status(201).send({ message: 'Student added successfully', student });
        })
        .catch((error) => {
            console.error('Error adding student:', error);
            res.status(500).send({ message: 'Error adding student', error });
        });
});



app.delete('/api/students/:id', (req, res) => {
    Student.findByIdAndDelete(req.params.id)
        .then((student) => {
            if (!student) {
                return res.status(404).send({ message: 'Student not found' });
            }
            res.send({ message: 'Student deleted successfully', student });
        })
        .catch((error) => {
            console.error('Error deleting student:', error);
            res.status(500).send({ message: 'Error deleting student', error });
        });
});


app.listen(3000, function () {
    console.log("Server is running on port:", 3000);
});
