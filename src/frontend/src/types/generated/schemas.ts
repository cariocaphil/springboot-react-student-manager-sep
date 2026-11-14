import { z } from "zod";

// <Schemas>
export type ApiErrorResponse = z.infer<typeof ApiErrorResponse>;
export const ApiErrorResponse = z.strictObject({
  code: z.enum([
    "EMAIL_TAKEN",
    "STUDENT_NOT_FOUND",
    "COURSE_NOT_FOUND",
    "ENROLLMENT_NOT_FOUND",
    "DUPLICATE_ENROLLMENT",
    "COURSE_FULL",
    "COURSE_CAPACITY_BELOW_ENROLLMENT_COUNT",
    "VALIDATION_FAILED",
    "BAD_REQUEST",
  ]),
  error: z.string(),
  message: z.string(),
  status: z.number().int(),
});

export type CourseRequest = z.infer<typeof CourseRequest>;
export const CourseRequest = z.strictObject({
  capacity: z.number().int().min(1),
  description: z.string().optional(),
  title: z.string().min(1),
});

export type CourseResponse = z.infer<typeof CourseResponse>;
export const CourseResponse = z.strictObject({
  capacity: z.number().int().min(1),
  description: z.string().optional(),
  id: z.number().int(),
  title: z.string().min(1),
});

export type CurrentUserResponse = z.infer<typeof CurrentUserResponse>;
export const CurrentUserResponse = z.strictObject({ role: z.enum(["ADMIN", "USER"]), username: z.string().min(1) });

export type EnrollmentRequest = z.infer<typeof EnrollmentRequest>;
export const EnrollmentRequest = z.strictObject({ courseId: z.number().int(), studentId: z.number().int() });

export type EnrollmentResponse = z.infer<typeof EnrollmentResponse>;
export const EnrollmentResponse = z.strictObject({
  courseId: z.number().int(),
  enrolledAt: z.iso.datetime(),
  id: z.number().int(),
  studentId: z.number().int(),
});

export type StudentRequest = z.infer<typeof StudentRequest>;
export const StudentRequest = z.strictObject({
  email: z.email().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  name: z.string().min(1),
});

export type StudentResponse = z.infer<typeof StudentResponse>;
export const StudentResponse = z.strictObject({
  email: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  id: z.number().int(),
  name: z.string().min(1),
});

// </Schemas>
