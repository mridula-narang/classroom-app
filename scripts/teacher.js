document.addEventListener("DOMContentLoaded", function() {
    function loadStudentsForTeacher() {
        axios.get('/api/students')
            .then(response => {
                console.log('Response data:', response.data);
                const students = response.data.students;
                const studentsList = document.getElementById("studentsList");
                
                if (students.length === 0) {
                    studentsList.innerHTML = "<p>No students found.</p>";
                } else {
                    studentsList.innerHTML = `<ul>`;
                    students.forEach(student => {
                        studentsList.innerHTML += `
                            <li>
                                Name: ${student.name}<br>
                                Email: ${student.email}
                                <button onclick="deleteStudent('${student._id}')">Delete</button>
                            </li>
                            <hr>
                        `;
                    });
                    studentsList.innerHTML += `</ul>`;
                }
            })
            .catch(error => {
                console.error('Error fetching students:', error);
                document.getElementById("studentsList").innerHTML = '<p>Error loading students.</p>';
            });
    }

    function addStudent(event) {
        event.preventDefault();
        const name = document.getElementById('studentName').value;
        const email = document.getElementById('studentEmail').value;
        const password = document.getElementById('studentPassword').value;
    
        axios.post('/api/students', {
            name: name,
            email: email,
            password: password // Make sure this is included in the request
        })
        .then(response => {
            console.log('Student added:', response.data);
            loadStudentsForTeacher(); // Reload the student list
        })
        .catch(error => {
            console.error('Error adding student:', error);
        });
    }
    

    // Define deleteStudent function in the global scope
    window.deleteStudent = function(studentId) {
        axios.delete(`/api/students/${studentId}`)
            .then(response => {
                console.log('Student deleted:', response.data);
                loadStudentsForTeacher(); // Reload the student list
            })
            .catch(error => {
                console.error('Error deleting student:', error);
            });
    };

    // Add event listener for student form submission
    document.getElementById('studentForm').addEventListener('submit', addStudent);

    // Load students when the page is ready
    loadStudentsForTeacher();
});
