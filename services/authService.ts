// services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { SignupFormData, CurrentUser, UserType, AddStudentFormData, AddTeacherFormData } from '../types';

// Collections in Firestore
const USERS_COLLECTION = 'users';
const INSTITUTES_COLLECTION = 'institutes';
const PRE_REGISTERED_USERS_COLLECTION = 'preRegisteredUsers';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to create user document
const createUserDocument = async (user: User, userData: any) => {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  await setDoc(userRef, {
    ...userData,
    uid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Helper function to check if institute exists
const checkInstituteExists = async (instituteName: string): Promise<boolean> => {
  const instituteQuery = query(
    collection(db, INSTITUTES_COLLECTION),
    where('name', '==', instituteName.toLowerCase())
  );
  const snapshot = await getDocs(instituteQuery);
  return !snapshot.empty;
};

// Helper function to create institute
const createInstitute = async (instituteName: string, superAdminUid: string) => {
  const instituteRef = collection(db, INSTITUTES_COLLECTION);
  await addDoc(instituteRef, {
    name: instituteName.toLowerCase(),
    displayName: instituteName,
    superAdminUid,
    createdAt: serverTimestamp(),
    isActive: true
  });
};

// Helper function to check pre-registration
const checkPreRegistration = async (email: string, instituteName: string, userType: UserType) => {
  const preRegQuery = query(
    collection(db, PRE_REGISTERED_USERS_COLLECTION),
    where('email', '==', email.toLowerCase()),
    where('instituteName', '==', instituteName.toLowerCase()),
    where('userType', '==', userType),
    where('isUsed', '==', false)
  );
  const snapshot = await getDocs(preRegQuery);
  return snapshot.docs[0] || null;
};

// Sign up function
export const signupUser = async (formData: SignupFormData): Promise<ApiResponse<CurrentUser>> => {
  try {
    const { firstName, lastName, email, password, userType, instituteName } = formData;
    
    // For SuperAdmin: Check if institute already exists
    if (userType === UserType.SuperAdmin) {
      const instituteExists = await checkInstituteExists(instituteName);
      if (instituteExists) {
        return {
          success: false,
          error: 'An institute with this name already exists. Please contact support if you are the authorized SuperAdmin.'
        };
      }
    } else {
      // For Teacher/Student: Check if institute exists
      const instituteExists = await checkInstituteExists(instituteName);
      if (!instituteExists) {
        return {
          success: false,
          error: 'Institute not found. Please verify the institute name or contact your administrator.'
        };
      }

      // Check pre-registration
      const preRegDoc = await checkPreRegistration(email, instituteName, userType);
      if (!preRegDoc) {
        return {
          success: false,
          error: `You must be pre-registered by a ${userType === UserType.Teacher ? 'SuperAdmin' : 'Teacher'} before signing up.`
        };
      }
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      userType,
      instituteName: instituteName.toLowerCase(),
      displayInstituteName: instituteName,
      isActive: true
    };

    // Create user document
    await createUserDocument(user, userData);

    // If SuperAdmin, create institute
    if (userType === UserType.SuperAdmin) {
      await createInstitute(instituteName, user.uid);
    } else {
      // Mark pre-registration as used
      const preRegDoc = await checkPreRegistration(email, instituteName, userType);
      if (preRegDoc) {
        await setDoc(doc(db, PRE_REGISTERED_USERS_COLLECTION, preRegDoc.id), 
          { isUsed: true, usedAt: serverTimestamp() }, 
          { merge: true }
        );
      }
    }

    const currentUser: CurrentUser = {
      uid: user.uid,
      firstName,
      lastName,
      email: email.toLowerCase(),
      userType,
      instituteName: instituteName.toLowerCase(),
      displayInstituteName: instituteName
    };

    return {
      success: true,
      data: currentUser,
      message: 'Account created successfully!'
    };

  } catch (error: any) {
    console.error('Signup error:', error);
    let errorMessage = 'Signup failed. Please try again.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please choose a stronger password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Login function
export const loginUser = async (email: string, password: string, instituteName: string): Promise<ApiResponse<CurrentUser>> => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    
    if (!userDoc.exists()) {
      await signOut(auth);
      return {
        success: false,
        error: 'User profile not found. Please contact support.'
      };
    }

    const userData = userDoc.data();

    // Verify institute name matches
    if (userData.instituteName !== instituteName.toLowerCase()) {
      await signOut(auth);
      return {
        success: false,
        error: 'Institute name does not match your account. Please verify the institute name.'
      };
    }

    // Check if user is active
    if (!userData.isActive) {
      await signOut(auth);
      return {
        success: false,
        error: 'Your account has been deactivated. Please contact your administrator.'
      };
    }

    const currentUser: CurrentUser = {
      uid: user.uid,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userType: userData.userType,
      instituteName: userData.instituteName,
      displayInstituteName: userData.displayInstituteName || instituteName
    };

    return {
      success: true,
      data: currentUser,
      message: 'Login successful!'
    };

  } catch (error: any) {
    console.error('Login error:', error);
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

// Teacher adds student
export const teacherAddStudent = async (currentUser: CurrentUser, formData: AddStudentFormData): Promise<ApiResponse> => {
  try {
    if (currentUser.userType !== UserType.Teacher && currentUser.userType !== UserType.SuperAdmin) {
      return {
        success: false,
        error: 'Only teachers and super admins can add students.'
      };
    }

    const { firstName, lastName, email } = formData;

    // Check if email is already pre-registered
    const existingPreReg = await checkPreRegistration(email, currentUser.instituteName, UserType.Student);
    if (existingPreReg) {
      return {
        success: false,
        error: 'This student is already pre-registered.'
      };
    }

    // Check if user already exists with this email
    const existingUserQuery = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
      return {
        success: false,
        error: 'A user with this email already exists.'
      };
    }

    // Add to pre-registration collection
    await addDoc(collection(db, PRE_REGISTERED_USERS_COLLECTION), {
      firstName,
      lastName,
      email: email.toLowerCase(),
      userType: UserType.Student,
      instituteName: currentUser.instituteName,
      displayInstituteName: currentUser.displayInstituteName,
      addedBy: currentUser.uid,
      addedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isUsed: false,
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: `Student ${firstName} ${lastName} has been pre-registered successfully!`
    };

  } catch (error: any) {
    console.error('Add student error:', error);
    return {
      success: false,
      error: 'Failed to pre-register student. Please try again.'
    };
  }
};

// SuperAdmin adds teacher
export const superAdminAddTeacher = async (currentUser: CurrentUser, formData: AddTeacherFormData): Promise<ApiResponse> => {
  try {
    if (currentUser.userType !== UserType.SuperAdmin) {
      return {
        success: false,
        error: 'Only super admins can add teachers.'
      };
    }

    const { firstName, lastName, email } = formData;

    // Check if email is already pre-registered
    const existingPreReg = await checkPreRegistration(email, currentUser.instituteName, UserType.Teacher);
    if (existingPreReg) {
      return {
        success: false,
        error: 'This teacher is already pre-registered.'
      };
    }

    // Check if user already exists with this email
    const existingUserQuery = query(
      collection(db, USERS_COLLECTION),
      where('email', '==', email.toLowerCase())
    );
    const existingUserSnapshot = await getDocs(existingUserQuery);
    if (!existingUserSnapshot.empty) {
      return {
        success: false,
        error: 'A user with this email already exists.'
      };
    }

    // Add to pre-registration collection
    await addDoc(collection(db, PRE_REGISTERED_USERS_COLLECTION), {
      firstName,
      lastName,
      email: email.toLowerCase(),
      userType: UserType.Teacher,
      instituteName: currentUser.instituteName,
      displayInstituteName: currentUser.displayInstituteName,
      addedBy: currentUser.uid,
      addedByName: `${currentUser.firstName} ${currentUser.lastName}`,
      isUsed: false,
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      message: `Teacher ${firstName} ${lastName} has been pre-registered successfully!`
    };

  } catch (error: any) {
    console.error('Add teacher error:', error);
    return {
      success: false,
      error: 'Failed to pre-register teacher. Please try again.'
    };
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};
