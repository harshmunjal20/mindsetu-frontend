
import { User, SignupFormData, CurrentUser, ApiResponse, AddStudentFormData, UserType } from '../types';


const USERS_STORAGE_KEY = 'mindsetu_users';

// Helper to get users from localStorage
export const getUsers = (): User[] => { 
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Initialize with more diverse mock data if none exists
const initializeMockUsers = () => {
  const existingUsers = getUsers();
  if (existingUsers.length === 0) {
    const mockUsers: User[] = [
      // Admin for "Greenwood High"
      {
        id: 'admin1',
        firstName: 'Alice',
        lastName: 'Principal',
        email: 'alice@greenwood.edu',
        password: 'password123',
        userType: UserType.Admin,
        instituteName: 'greenwood high',
        isActivated: true,
        isPreRegisteredByAdmin: false,
      },
      // Students for "Greenwood High"
      {
        id: 'student1gw',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@greenwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'greenwood high',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },
      {
        id: 'student2gw',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@greenwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'greenwood high',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },
      {
        id: 'student3gw',
        firstName: 'Diana',
        lastName: 'Prince',
        email: 'diana@greenwood.edu',
        // No password, pre-registered but not yet activated by student signup
        userType: UserType.Student,
        instituteName: 'greenwood high',
        isActivated: false,
        isPreRegisteredByAdmin: true,
      },
       {
        id: 'student4gw',
        firstName: 'Edward',
        lastName: 'Nigma',
        email: 'edward@greenwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'greenwood high',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },
      {
        id: 'student5gw',
        firstName: 'Fiona',
        lastName: 'Gallagher',
        email: 'fiona@greenwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'greenwood high',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },

      // Admin for "Oakwood Academy"
      {
        id: 'admin2',
        firstName: 'David',
        lastName: 'Dean',
        email: 'david@oakwood.edu',
        password: 'password123',
        userType: UserType.Admin,
        instituteName: 'oakwood academy',
        isActivated: true,
        isPreRegisteredByAdmin: false,
      },
      // Students for "Oakwood Academy"
      {
        id: 'student1oa',
        firstName: 'Eve',
        lastName: 'Online',
        email: 'eve@oakwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'oakwood academy',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },
      {
        id: 'student2oa',
        firstName: 'Frank',
        lastName: 'Castle',
        email: 'frank@oakwood.edu',
        password: 'password123',
        userType: UserType.Student,
        instituteName: 'oakwood academy',
        isActivated: true,
        isPreRegisteredByAdmin: true,
      },
    ];
    saveUsers(mockUsers);
  }
};
initializeMockUsers();


export const signupUser = async (formData: SignupFormData): Promise<ApiResponse<CurrentUser>> => {
  return new Promise((resolve) => {
    setTimeout(() => { // Simulate network delay
      const users = getUsers();
      const instituteNameLower = formData.instituteName.toLowerCase();

      if (!formData.password || formData.password.length < 6) {
        resolve({ success: false, error: 'Password must be at least 6 characters long.' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        resolve({ success: false, error: 'Passwords do not match.' });
        return;
      }
      if (!formData.instituteName.trim()) {
        resolve({ success: false, error: 'Institute name is required.' });
        return;
      }

      if (formData.userType === UserType.Admin) {
        const existingAdminForInstitute = users.find(user => user.userType === UserType.Admin && user.instituteName === instituteNameLower);
        if (existingAdminForInstitute) {
          resolve({ success: false, error: `An admin for institute '${formData.instituteName}' already exists.` });
          return;
        }
        // Check if email is already used by another admin, regardless of institute
        const existingAdminEmail = users.find(user => user.userType === UserType.Admin && user.email === formData.email);
        if (existingAdminEmail) {
            resolve({ success: false, error: `This email is already registered by an administrator.` });
            return;
        }

        const newAdmin: User = {
          id: Date.now().toString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: UserType.Admin,
          instituteName: instituteNameLower,
          isActivated: true, // Admins are active on creation
          isPreRegisteredByAdmin: false, 
        };
        users.push(newAdmin);
        saveUsers(users);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...adminToReturn } = newAdmin;
        resolve({ success: true, data: adminToReturn });

      } else { // UserType.Student - Account Claiming
        const instituteAdminExists = users.some(user => user.userType === UserType.Admin && user.instituteName === instituteNameLower);
        if (!instituteAdminExists) {
          resolve({ success: false, error: `Institute '${formData.instituteName}' is not registered with Mindsetu. Please contact your institute administrator.` });
          return;
        }

        const studentIndex = users.findIndex(user => 
          user.email === formData.email && 
          user.instituteName === instituteNameLower &&
          user.userType === UserType.Student
        );

        if (studentIndex === -1) {
          resolve({ success: false, error: 'You have not been pre-registered by an administrator for this institute. Please contact them.' });
          return;
        }

        const studentToActivate = users[studentIndex];

        if (!studentToActivate.isPreRegisteredByAdmin) {
             resolve({ success: false, error: 'This account was not pre-registered by an administrator. Please contact them.' });
             return;
        }

        if (studentToActivate.isActivated) {
          resolve({ success: false, error: 'This account is already active. Please try logging in.' });
          return;
        }
        
        // Activate the student
        studentToActivate.password = formData.password;
        studentToActivate.firstName = formData.firstName; // Allow student to confirm/update their name
        studentToActivate.lastName = formData.lastName;
        studentToActivate.isActivated = true;
        
        users[studentIndex] = studentToActivate;
        saveUsers(users);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...activatedStudent } = studentToActivate;
        resolve({ success: true, data: activatedStudent, message: 'Account activated successfully! You can now log in.' } as any); 
      }
    }, 500);
  });
};

export const loginUser = async (emailInput: string, passwordInput: string, instituteNameInput: string): Promise<ApiResponse<CurrentUser>> => {
  return new Promise((resolve) => {
    setTimeout(() => { // Simulate network delay
      const users = getUsers();
      const instituteNameLower = instituteNameInput.toLowerCase();
      const potentialUser = users.find(u => u.email === emailInput && u.instituteName === instituteNameLower);

      if (!potentialUser) {
        resolve({ success: false, error: 'Invalid email, institute, or user not found.' });
        return;
      }

      if (potentialUser.password !== passwordInput) {
        resolve({ success: false, error: 'Invalid password.' });
        return;
      }

      if (!potentialUser.isActivated) {
        if (potentialUser.userType === UserType.Student && potentialUser.isPreRegisteredByAdmin) {
             resolve({ success: false, error: 'Your account has been pre-registered. Please complete the signup process to activate your account and set your password.' });
        } else if (potentialUser.userType === UserType.Student) {
             resolve({ success: false, error: 'Your student account is not active. Please contact your institute administrator.' });
        } else {
            resolve({ success: false, error: 'This account is not currently active.' });
        }
        return;
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userToReturn } = potentialUser; 
      resolve({ success: true, data: userToReturn });
    }, 500);
  });
};

export const adminAddStudent = async (adminUser: CurrentUser, studentData: AddStudentFormData): Promise<ApiResponse<User>> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      if (adminUser.userType !== UserType.Admin) {
        resolve({ success: false, error: "Unauthorized: Only Admins can add students." });
        return;
      }

      const users = getUsers();
      const existingStudent = users.find(user => user.email === studentData.email && user.instituteName === adminUser.instituteName);
      
      if (existingStudent) {
        if (existingStudent.isActivated) {
            resolve({ success: false, error: `Student with email ${studentData.email} already exists and is active at ${adminUser.instituteName}.` });
        } else if (existingStudent.isPreRegisteredByAdmin) {
            resolve({ success: false, error: `Student with email ${studentData.email} is already pre-registered and pending activation by the student.` });
        } else {
            // This case should ideally not happen if flow is followed, but handles if a student record exists somehow without pre-registration.
            resolve({ success: false, error: `An account for ${studentData.email} at ${adminUser.instituteName} already exists with an undetermined status. Please review.` });
        }
        return;
      }

      const newStudent: User = {
        id: Date.now().toString(),
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        // Password is not set by admin; student sets it during their signup/claim process
        userType: UserType.Student, 
        instituteName: adminUser.instituteName, // Inherit admin's institute name (already lowercase)
        isActivated: false, // Student is NOT active until they complete signup
        isPreRegisteredByAdmin: true, // Marked as pre-registered by admin
      };
      users.push(newStudent);
      saveUsers(users);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...studentToReturn } = newStudent;
      resolve({ success: true, data: studentToReturn, message: `Student ${newStudent.firstName} pre-registered. They can now complete their signup.` } as any);
    }, 500);
  });
};


