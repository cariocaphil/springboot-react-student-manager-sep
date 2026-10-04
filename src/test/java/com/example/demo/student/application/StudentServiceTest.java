package com.example.demo.student.application;

import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.exception.DuplicateEmailException;
import com.example.demo.student.exception.StudentNotFoundException;
import com.example.demo.student.persistence.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    private StudentService underTest;

    @BeforeEach
    void setUp() {
        underTest = new StudentService(studentRepository);
    }

    @Test
    void getAllStudents_returnsRepositoryResult() {
        Student student = new Student(1L, "Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.findAll()).willReturn(List.of(student));

        List<Student> actual = underTest.getAllStudents();

        assertThat(actual).containsExactly(student);
        verify(studentRepository).findAll();
    }

    @Test
    void addStudent_savesWhenEmailIsFree() {
        Student student = Student.createNew("Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.existsByEmail(student.getEmail())).willReturn(false);

        underTest.addStudent(student);

        ArgumentCaptor<Student> captor = ArgumentCaptor.forClass(Student.class);
        verify(studentRepository).save(captor.capture());
        Student saved = captor.getValue();
        assertThat(saved.getName()).isEqualTo(student.getName());
        assertThat(saved.getEmail()).isEqualTo(student.getEmail());
        assertThat(saved.getGender()).isEqualTo(student.getGender());
    }

    @Test
    void addStudent_throwsWhenEmailTaken() {
        Student student = Student.createNew("Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.existsByEmail(student.getEmail())).willReturn(true);

        assertThatThrownBy(() -> underTest.addStudent(student))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining(student.getEmail())
                .hasMessageContaining("taken");

        verify(studentRepository, never()).save(any());
    }

    @Test
    void updateStudent_updatesWhenStudentExistsAndEmailIsFree() {
        long id = 42L;
        Student existing = new Student(id, "Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.findById(id)).willReturn(Optional.of(existing));
        given(studentRepository.existsByEmailAndIdNot("jamila@updated.com", id)).willReturn(false);

        underTest.updateStudent(id, "Jamila Updated", "jamila@updated.com", Gender.OTHER);

        assertThat(existing.getName()).isEqualTo("Jamila Updated");
        assertThat(existing.getEmail()).isEqualTo("jamila@updated.com");
        assertThat(existing.getGender()).isEqualTo(Gender.OTHER);
        verify(studentRepository).save(existing);
    }

    @Test
    void updateStudent_allowsKeepingSameEmail() {
        long id = 42L;
        Student existing = new Student(id, "Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.findById(id)).willReturn(Optional.of(existing));
        given(studentRepository.existsByEmailAndIdNot("jamila@gmail.com", id)).willReturn(false);

        underTest.updateStudent(id, "Jamila II", "jamila@gmail.com", Gender.FEMALE);

        assertThat(existing.getName()).isEqualTo("Jamila II");
        verify(studentRepository).save(existing);
    }

    @Test
    void updateStudent_throwsWhenStudentMissing() {
        long id = 99L;
        given(studentRepository.findById(id)).willReturn(Optional.empty());

        assertThatThrownBy(() -> underTest.updateStudent(id, "A", "a@example.com", Gender.MALE))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining(String.valueOf(id));

        verify(studentRepository, never()).save(any());
    }

    @Test
    void updateStudent_throwsWhenEmailTakenByOther() {
        long id = 42L;
        Student existing = new Student(id, "Jamila", "jamila@gmail.com", Gender.FEMALE);
        given(studentRepository.findById(id)).willReturn(Optional.of(existing));
        given(studentRepository.existsByEmailAndIdNot("taken@example.com", id)).willReturn(true);

        assertThatThrownBy(() -> underTest.updateStudent(id, "Jamila", "taken@example.com", Gender.FEMALE))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("taken@example.com");

        verify(studentRepository, never()).save(any());
        verify(studentRepository).existsByEmailAndIdNot(eq("taken@example.com"), eq(id));
    }

    @Test
    void deleteStudent_deletesWhenStudentExists() {
        long id = 42L;
        given(studentRepository.existsById(id)).willReturn(true);

        underTest.deleteStudent(id);

        verify(studentRepository).deleteById(id);
    }

    @Test
    void deleteStudent_throwsWhenStudentMissing() {
        long id = 99L;
        given(studentRepository.existsById(id)).willReturn(false);

        assertThatThrownBy(() -> underTest.deleteStudent(id))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessageContaining(String.valueOf(id));

        verify(studentRepository, never()).deleteById(any());
    }
}
