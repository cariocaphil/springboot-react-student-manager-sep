-- Initial schema matching Hibernate 6.6 / Spring Boot 3.4 ddl-auto output on PostgreSQL.
-- No foreign keys (enrollment stores plain student_id / course_id by design).
-- Unique constraint names for single-column uniques match Hibernate-generated names.

CREATE SEQUENCE student_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE course_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE enrollment_sequence START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE app_user_sequence START WITH 1 INCREMENT BY 1;

CREATE TABLE student (
    id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT student_pkey PRIMARY KEY (id),
    CONSTRAINT ukfe0i52si7ybu0wjedj6motiim UNIQUE (email),
    CONSTRAINT student_gender_check CHECK (
        (gender)::text = ANY (
            (ARRAY['MALE'::varchar, 'FEMALE'::varchar, 'OTHER'::varchar])::text[]
        )
    )
);

CREATE TABLE course (
    id BIGINT NOT NULL,
    capacity INTEGER NOT NULL,
    description VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    CONSTRAINT course_pkey PRIMARY KEY (id)
);

CREATE TABLE enrollment (
    id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    student_id BIGINT NOT NULL,
    CONSTRAINT enrollment_pkey PRIMARY KEY (id),
    CONSTRAINT uk_enrollment_student_course UNIQUE (student_id, course_id)
);

CREATE TABLE app_user (
    id BIGINT NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(16) DEFAULT 'ADMIN'::varchar NOT NULL,
    username VARCHAR(255) NOT NULL,
    CONSTRAINT app_user_pkey PRIMARY KEY (id),
    CONSTRAINT uk3k4cplvh82srueuttfkwnylq0 UNIQUE (username),
    CONSTRAINT app_user_role_check CHECK (
        (role)::text = ANY (
            (ARRAY['ADMIN'::varchar, 'USER'::varchar])::text[]
        )
    )
);
