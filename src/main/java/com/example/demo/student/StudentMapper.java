package com.example.demo.student;

final class StudentMapper {

    private StudentMapper() {
    }

    static Student toEntity(StudentRequest request) {
        return new Student(null, request.name(), request.email(), request.gender());
    }

    static StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getGender()
        );
    }
}
