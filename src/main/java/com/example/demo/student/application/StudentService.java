package com.example.demo.student.application;

import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.exception.DuplicateEmailException;
import com.example.demo.student.exception.StudentNotFoundException;
import com.example.demo.student.persistence.StudentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Transactional
    public void addStudent(Student student) {
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateEmailException(student.getEmail());
        }
        studentRepository.save(student);
    }

    @Transactional
    public void updateStudent(Long studentId, String name, String email, Gender gender) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException(
                        "Student with id " + studentId + " does not exists"));
        if (studentRepository.existsByEmailAndIdNot(email, studentId)) {
            throw new DuplicateEmailException(email);
        }
        student.setName(name);
        student.setEmail(email);
        student.setGender(gender);
        studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(
                    "Student with id " + studentId + " does not exists");
        }
        studentRepository.deleteById(studentId);
    }
}
