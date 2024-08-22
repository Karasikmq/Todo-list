document.addEventListener('DOMContentLoaded', function() {
    const studentsTableBody = document.getElementById('students-table').querySelector('tbody');
    const addStudentForm = document.getElementById('add-student-form');
    const startYearSelect = document.getElementById('start-year');

    const filterForm = document.getElementById('filter-form');
    const filterFio = document.getElementById('filter-fio');
    const filterFaculty = document.getElementById('filter-faculty');
    const filterStartYear = document.getElementById('filter-start-year');
    const filterEndYear = document.getElementById('filter-end-year');

    let students = [];

    // Load students from localStorage
    function loadStudents() {
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
            students = JSON.parse(savedStudents);
        }
        applyFilters(); // Apply filters to loaded data
    }

    // Save students to localStorage
    function saveStudents() {
        localStorage.setItem('students', JSON.stringify(students));
    }

    function populateStartYearSelect() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            startYearSelect.appendChild(option);
        }
    }

    function getCurrentCourse(startYear) {
        const currentYear = new Date().getFullYear();
        const course = currentYear - startYear + 1;
        return (course >= 1 && course <= 4) ? `не закончил (${course})` : "Закончил";
    }

    function calculateAge(birthDate) {
        const diff = new Date() - birthDate;
        const age = new Date(diff).getUTCFullYear() - 1970;
        return age;
    }

    function displayStudents() {
        studentsTableBody.innerHTML = '';
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.lastName} ${student.firstName} ${student.patronymic}</td>
                <td>${student.birthDate.toLocaleDateString()} (${calculateAge(student.birthDate)} лет)</td>
                <td>${student.startYear} (${getCurrentCourse(student.startYear)})</td>
                <td>${student.faculty}</td>
                <td><button class="delete-student" data-index="${index}">Удалить</button></td>
            `;
            studentsTableBody.appendChild(row);
        });

        const deleteButtons = document.querySelectorAll('.delete-student');
        deleteButtons.forEach(button => {
            button.addEventListener('click', deleteStudent);
        });
    }

    function displayFilteredStudents(filteredStudents) {
        studentsTableBody.innerHTML = '';
        filteredStudents.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.lastName} ${student.firstName} ${student.patronymic}</td>
                <td>${student.birthDate.toLocaleDateString()} (${calculateAge(student.birthDate)} лет)</td>
                <td>${student.startYear} (${getCurrentCourse(student.startYear)})</td>
                <td>${student.faculty}</td>
                <td><button class="delete-student" data-index="${index}">Удалить</button></td>
            `;
            studentsTableBody.appendChild(row);
        });

        const deleteButtons = document.querySelectorAll('.delete-student');
        deleteButtons.forEach(button => {
            button.addEventListener('click', deleteStudent);
        });
    }

    function deleteStudent(event) {
        const studentIndex = event.target.getAttribute('data-index');
        students.splice(studentIndex, 1);
        saveStudents(); // Save changes after deletion
        applyFilters(); // Apply filters to updated data
    }

    addStudentForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const patronymic = document.getElementById('patronymic').value.trim();
        const birthDateValue = document.getElementById('birth-date').value;
        const birthDate = new Date(birthDateValue);
        const startYear = parseInt(document.getElementById('start-year').value.trim());
        const faculty = document.getElementById('faculty').value.trim();

        const minBirthDate = new Date('1940-01-01');
        const currentDate = new Date();

        if (!firstName || !lastName || !patronymic || isNaN(birthDate) || isNaN(startYear) || !faculty) {
            alert('Пожалуйста, заполните все поля правильно.');
            return;
        }

        if (birthDate < minBirthDate || birthDate > currentDate) {
            alert('Пожалуйста, введите корректную дату рождения (от 1940 года до текущего дня).');
            return;
        }

        const newStudent = {
            firstName: firstName,
            lastName: lastName,
            patronymic: patronymic,
            birthDate: birthDate,
            startYear: startYear,
            faculty: faculty,
        };

        students.push(newStudent);
        saveStudents(); // Save new student
        applyFilters(); // Apply filters to updated data
        addStudentForm.reset();
    });

    filterFio.addEventListener('input', applyFilters);
    filterFaculty.addEventListener('input', applyFilters);
    filterStartYear.addEventListener('input', applyFilters);
    filterEndYear.addEventListener('input', applyFilters);

    function applyFilters() {
        const filteredStudents = students.filter(student => {
            const fullName = `${student.lastName} ${student.firstName} ${student.patronymic}`.toLowerCase();
            const fioMatch = fullName.includes(filterFio.value.toLowerCase());
            const facultyMatch = student.faculty.toLowerCase().includes(filterFaculty.value.toLowerCase());
            const startYearMatch = filterStartYear.value ? student.startYear >= parseInt(filterStartYear.value) : true;
            const endYearMatch = filterEndYear.value ? (student.startYear + 4) <= parseInt(filterEndYear.value) : true;

            return fioMatch && facultyMatch && startYearMatch && endYearMatch;
        });
        displayFilteredStudents(filteredStudents);
    }

    function populateFilterYearSelects() {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2000; year--) {
            const optionStart = document.createElement('option');
            optionStart.value = year;
            optionStart.textContent = year;
            filterStartYear.appendChild(optionStart);

            const optionEnd = document.createElement('option');
            optionEnd.value = year;
            optionEnd.textContent = year;
            filterEndYear.appendChild(optionEnd);
        }
    }

    populateStartYearSelect();
    populateFilterYearSelects();
    loadStudents(); // Load students from localStorage

    // Sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', function() {
            const sortKey = th.getAttribute('data-sort');
            if (sortKey === 'fio') {
                students.sort((a, b) => {
                    const fullNameA = `${a.lastName} ${a.firstName} ${a.patronymic}`.toLowerCase();
                    const fullNameB = `${b.lastName} ${b.firstName} ${b.patronymic}`.toLowerCase();
                    return fullNameA.localeCompare(fullNameB);
                });
            } else if (sortKey === 'birthDate') {
                students.sort((a, b) => a.birthDate - b.birthDate);
            } else if (sortKey === 'startYear') {
                students.sort((a, b) => a.startYear - b.startYear);
            } else if (sortKey === 'faculty') {
                students.sort((a, b) => a.faculty.localeCompare(b.faculty));
            }
            saveStudents(); // Save sorted students
            applyFilters(); // Apply filters to sorted data
        });
    });
});
