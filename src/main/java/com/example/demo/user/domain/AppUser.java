package com.example.demo.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @SequenceGenerator(
            name = "app_user_sequence",
            sequenceName = "app_user_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "app_user_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    /** BCrypt hash only — never store plaintext. */
    @ToString.Exclude
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /**
     * Application role. SQL default keeps {@code ddl-auto=update} safe for existing
     * {@code app_user} rows that predate this column.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(16) not null default 'ADMIN'")
    private Role role;

    public AppUser(Long id, String username, String passwordHash, Role role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /** New user before persistence; id is assigned by the database. */
    public static AppUser createNew(String username, String passwordHash, Role role) {
        return new AppUser(null, username, passwordHash, role);
    }
}
