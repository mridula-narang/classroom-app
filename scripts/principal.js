document.addEventListener("DOMContentLoaded", function() {
    // Attach click event listeners to all sidebar items
    const sidenavItems = document.querySelectorAll(".sidenav-item");

    sidenavItems.forEach(item => {
        item.addEventListener("click", function() {
            const contentToShow = item.getAttribute("data-content");
            loadContent(contentToShow);
        });
    });

    function loadContent(contentToShow) {
        const content = document.getElementById("content");

        switch(contentToShow) {
            case 'classrooms':
                loadClassroom();
                break;
            case 'teachers':
                loadTeachers();
                break;
            case 'students':
                loadStudents();
                break;
            case 'create-classroom':
                loadCreateClassroomForm();
                break;
            default:
                content.innerHTML = "<h2>Welcome to the Principal Dashboard</h2>";
        }
    }

    function loadCreateClassroomForm() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2 class="classhead">Create a Classroom</h2>
            <form id="createClassroomForm">
                <label for="className">Classroom Name:</label>
                <input type="text" id="className" name="className" required>
                
                <label for="startTime">Start Time:</label>
                <input type="time" id="startTime" name="startTime" required>

                <label for="endTime">End Time:</label>
                <input type="time" id="endTime" name="endTime" required>

                <label for="days">Days (comma-separated):</label>
                <input type="text" id="days" name="days" placeholder="e.g., Monday, Tuesday" required>

                <button type="submit">Create Classroom</button>
            </form>
        `;

        document.getElementById("createClassroomForm").addEventListener("submit", function(event) {
            event.preventDefault();
            createClassroom();
        });
    }

    function createClassroom() {
        const className = document.getElementById("className").value;
        const startTime = document.getElementById("startTime").value;
        const endTime = document.getElementById("endTime").value;
        const days = document.getElementById("days").value.split(',').map(day => day.trim());

        axios.post('/api/classrooms', {
            name: className,
            startTime: startTime,
            endTime: endTime,
            days: days
        })
        .then(response => {
            alert('Classroom created successfully!');
        })
        .catch(error => {
            alert('Error creating classroom: ' + error.response.data.message);
        });
    }

    function loadClassroom() {
        axios.get('/api/classrooms')
            .then(response => {
                const classrooms = response.data.classrooms;
                const content = document.getElementById("content");
                content.innerHTML = `
                    <h2>Classrooms</h2>
                    <ul>
                `;

                classrooms.forEach(classroom => {
                    content.innerHTML += `
                        <li>
                            Class: ${classroom.name}<br>
                            Start Time: ${classroom.startTime}<br>
                            End Time: ${classroom.endTime}<br>
                            Days: ${classroom.days.join(', ')}
                        </li>
                        <hr>
                    `;
                });

                content.innerHTML += `
                    </ul>
                `;
            })
            .catch(error => {
                console.error('Error fetching classrooms:', error);
                alert('Error fetching classrooms: ' + error.message);
            });
    }

    function loadTeachers() {
        axios.get('/api/teachers')
            .then(response => {
                const teachers = response.data.teachers;
                const content = document.getElementById("content");
                content.innerHTML = `
                    <h2>Teachers</h2>
                    <button id="addTeacher">Add Teacher</button>
                    <button id="assignClassroom">Assign Classroom</button>
                    <ul id="teacherList">
                `;
    
                teachers.forEach(teacher => {
                    content.innerHTML += `
                        <li>
                            Name: ${teacher.name}<br>
                            Email: ${teacher.email}<br>
                            Classroom: ${teacher.assignedClassroom ? teacher.assignedClassroom.name : 'None'}
                            <button class="deleteTeacher" data-id="${teacher._id}">Delete</button>
                        </li>
                        <hr>
                    `;
                });
    
                content.innerHTML += `</ul>`;
    
                // Add event listeners to buttons
                document.getElementById('addTeacher').addEventListener('click', () => {
                    loadAddTeacherForm();
                });
    
                document.getElementById('assignClassroom').addEventListener('click', () => {
                    loadAssignClassroomForm();
                });
    
                document.querySelectorAll('.deleteTeacher').forEach(button => {
                    button.addEventListener('click', () => {
                        const teacherId = button.getAttribute('data-id');
                        deleteTeacher(teacherId);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching teachers:', error);
                alert('Error fetching teachers: ' + error.message);
            });
    }
    
    function loadAddTeacherForm() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>Add Teacher</h2>
            <form id="addTeacherForm">
                <label for="teacherName">Name:</label>
                <input type="text" id="teacherName" name="teacherName" required>
    
                <label for="teacherEmail">Email:</label>
                <input type="email" id="teacherEmail" name="teacherEmail" required>

                <label for="teacherPassword">Password:</label>
                <input type="password" id="teacherPassword" name="teacherPassword" required>
    
                <button type="submit">Add Teacher</button>
            </form>
        `;
    
        document.getElementById("addTeacherForm").addEventListener("submit", function(event) {
            event.preventDefault();
            addTeacher();
        });
    }
    
    function addTeacher() {
        const name = document.getElementById("teacherName").value;
        const email = document.getElementById("teacherEmail").value;
        const password = document.getElementById("teacherPassword").value;
    
        axios.post('/api/teachers', { name, email, password })  // Include password here
            .then(response => {
                alert('Teacher added successfully!');
                loadTeachers(); // Refresh the list of teachers
            })
            .catch(error => {
                alert('Error adding teacher: ' + error.response.data.message);
            });
    }
    
    
    function deleteTeacher(teacherId) {
        axios.delete(`/api/teachers/${teacherId}`)
            .then(response => {
                alert('Teacher deleted successfully!');
                loadTeachers(); // Refresh the list of teachers
            })
            .catch(error => {
                alert('Error deleting teacher: ' + error.response.data.message);
            });
    }
    
    function loadAssignClassroomForm() {
        axios.get('/api/classrooms')
            .then(response => {
                const classrooms = response.data.classrooms;
                const content = document.getElementById("content");
                content.innerHTML = `
                    <h2>Assign Classroom to Teacher</h2>
                    <form id="assignClassroomForm">
                        <label for="teacherId">Teacher:</label>
                        <select id="teacherId" name="teacherId" required>
                            <!-- Options will be populated dynamically -->
                        </select>
    
                        <label for="classroomId">Classroom:</label>
                        <select id="classroomId" name="classroomId" required>
                            <!-- Options will be populated dynamically -->
                        </select>
    
                        <button type="submit">Assign Classroom</button>
                    </form>
                `;
    
                // Populate select options
                const teacherSelect = document.getElementById("teacherId");
                const classroomSelect = document.getElementById("classroomId");
    
                // Fetch teachers and classrooms for select options
                axios.get('/api/teachers')
                    .then(response => {
                        const teachers = response.data.teachers;
                        teachers.forEach(teacher => {
                            const option = document.createElement("option");
                            option.value = teacher._id;
                            option.textContent = teacher.name;
                            teacherSelect.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching teachers:', error);
                    });
    
                classrooms.forEach(classroom => {
                    const option = document.createElement("option");
                    option.value = classroom._id;
                    option.textContent = classroom.name;
                    classroomSelect.appendChild(option);
                });
    
                document.getElementById("assignClassroomForm").addEventListener("submit", function(event) {
                    event.preventDefault();
                    assignClassroom();
                });
            })
            .catch(error => {
                console.error('Error fetching classrooms:', error);
            });
    }
    
    function assignClassroom() {
        const teacherId = document.getElementById("teacherId").value;
        const classroomId = document.getElementById("classroomId").value;
    
        axios.put(`/api/teachers/${teacherId}/assign-classroom`, { classroomId })
            .then(response => {
                alert('Classroom assigned successfully!');
                loadTeachers(); // Refresh the list of teachers
            })
            .catch(error => {
                alert('Error assigning classroom: ' + error.response.data.message);
            });
    }    

    function loadStudents() {
        axios.get('/api/students')
            .then(response => {
                const students = response.data.students;
                const content = document.getElementById("content");
                content.innerHTML = `
                    <h2>Students</h2>
                    <button id="addStudent">Add Student</button>
                    <button id="assignStudent">Assign Classroom</button>
                    <ul id="studentList">
                `;
    
                students.forEach(student => {
                    content.innerHTML += `
                        <li>
                            Name: ${student.name}<br>
                            Email: ${student.email}<br>
                            Classroom: ${student.assignedClassroom ? student.assignedClassroom.name : 'None'}
                            <button class="deleteStudent" data-id="${student._id}">Delete</button>
                        </li>
                        <hr>
                    `;
                });
    
                content.innerHTML += `</ul>`;
    
                // Add event listeners to buttons
                document.getElementById('addStudent').addEventListener('click', () => {
                    loadAddStudentForm();
                });
    
                document.getElementById('assignStudent').addEventListener('click', () => {
                    loadAssignStudentForm();
                });
    
                document.querySelectorAll('.deleteStudent').forEach(button => {
                    button.addEventListener('click', () => {
                        const studentId = button.getAttribute('data-id');
                        deleteStudent(studentId);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching students:', error);
                alert('Error fetching students: ' + error.message);
            });
    }    
    
    function loadAddStudentForm() {
        const content = document.getElementById("content");
        content.innerHTML = `
            <h2>Add Student</h2>
            <form id="addStudentForm">
                <label for="studentName">Name:</label>
                <input type="text" id="studentName" name="studentName" required>
    
                <label for="studentEmail">Email:</label>
                <input type="email" id="studentEmail" name="studentEmail" required>
    
                <button type="submit">Add Student</button>
            </form>
        `;
    
        document.getElementById("addStudentForm").addEventListener("submit", function(event) {
            event.preventDefault();
            addStudent();
        });
    }

    function addStudent() {
        const name = document.getElementById("studentName").value;
        const email = document.getElementById("studentEmail").value;

        axios.post('/api/students', { name, email })
            .then(response => {
                alert('Student added successfully!');
                loadStudents(); // Refresh the list of students
            })
            .catch(error => {
                alert('Error adding student: ' + error.response.data.message);
            });
    }
    

    function deleteStudent(studentId) {
        axios.delete(`/api/students/${studentId}`)
            .then(response => {
                alert('Student deleted successfully!');
                loadStudents(); // Refresh the list of students
            })
            .catch(error => {
                alert('Error deleting student: ' + error.response.data.message);
            });
    }
    
    function loadAssignStudentForm() {
        axios.get('/api/classrooms')
            .then(response => {
                const classrooms = response.data.classrooms;
                const content = document.getElementById("content");
                content.innerHTML = `
                    <h2>Assign Classroom to Student</h2>
                    <form id="assignStudentForm">
                        <label for="studentId">Student:</label>
                        <select id="studentId" name="studentId" required>
                            <!-- Options will be populated dynamically -->
                        </select>
    
                        <label for="classroomId">Classroom:</label>
                        <select id="classroomId" name="classroomId" required>
                            <!-- Options will be populated dynamically -->
                        </select>
    
                        <button type="submit">Assign Classroom</button>
                    </form>
                `;
    
                // Populate select options
                const studentSelect = document.getElementById("studentId");
                const classroomSelect = document.getElementById("classroomId");
    
                // Fetch students and classrooms for select options
                axios.get('/api/students')
                    .then(response => {
                        const students = response.data.students;
                        students.forEach(student => {
                            const option = document.createElement("option");
                            option.value = student._id;
                            option.textContent = student.name;
                            studentSelect.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching students:', error);
                    });
    
                classrooms.forEach(classroom => {
                    const option = document.createElement("option");
                    option.value = classroom._id;
                    option.textContent = classroom.name;
                    classroomSelect.appendChild(option);
                });
    
                document.getElementById("assignStudentForm").addEventListener("submit", function(event) {
                    event.preventDefault();
                    assignStudent();
                });
            })
            .catch(error => {
                console.error('Error fetching classrooms:', error);
            });
    }
    
    function assignStudent() {
        const studentId = document.getElementById("studentId").value;
        const classroomId = document.getElementById("classroomId").value;
    
        axios.put(`/api/students/${studentId}/assign`, { classroomId })
            .then(response => {
                alert('Classroom assigned successfully!');
                loadStudents(); // Refresh the list of students
            })
            .catch(error => {
                console.error('Error assigning classroom:', error.response ? error.response.data.message : error.message);
                alert('Error assigning classroom: ' + (error.response ? error.response.data.message : error.message));
            });
    }

    
       

    // Make functions available globally
    window.showAddStudentForm = loadAddStudentForm;
    window.assignClassroom = loadAssignClassroomForm;
    window.loadAddStudentForm = loadAddStudentForm;


});
