import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile as updateAuthProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArf589xG_5scxJfF75awq_bkWhhjnogFM",
  authDomain: "kokoro-scans.firebaseapp.com",
  databaseURL: "https://kokoro-scans-default-rtdb.firebaseio.com",
  projectId: "kokoro-scans",
  storageBucket: "kokoro-scans.firebasestorage.app",
  messagingSenderId: "57908242580",
  appId: "1:57908242580:web:283734ff2df9b70e80ac81"
};

let app;
let auth: any = null;
let db: any = null;
let isFirebaseAvailable = false;

try {
  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseAvailable = true;
} catch (error) {
  console.warn("Firebase failed to initialize. Falling back to Mock/LocalStorage system.", error);
}

export { auth, db, isFirebaseAvailable };

// Interfaces for our application
export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  text: string;
  gifUrl?: string;
  createdAt: number;
}

export interface Comment {
  id: string;
  mangaId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  text: string;
  gifUrl?: string;
  createdAt: number;
  likes: string[]; // List of userIds who liked
  replies: CommentReply[];
}

export interface UserBookmark {
  mangaId: string;
  bookmarkedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favorites: string[]; // Array of mangaIds
}

// Global state for LocalStorage fallback
const getLocalUsers = (): Record<string, UserProfile> => {
  const data = localStorage.getItem("kokoro_users");
  return data ? JSON.parse(data) : {};
};

const saveLocalUsers = (users: Record<string, UserProfile>) => {
  localStorage.setItem("kokoro_users", JSON.stringify(users));
};

const getLocalComments = (mangaId: string): Comment[] => {
  const data = localStorage.getItem(`kokoro_comments_${mangaId}`);
  if (!data) {
    return [];
  }
  const comments = JSON.parse(data) as Comment[];
  const cleanComments = comments.filter((comment) => !comment.id.startsWith("starter_") && !comment.userId.startsWith("demo_user_"));
  if (cleanComments.length !== comments.length) {
    localStorage.setItem(`kokoro_comments_${mangaId}`, JSON.stringify(cleanComments));
  }
  return cleanComments;
};

const saveLocalComments = (mangaId: string, comments: Comment[]) => {
  localStorage.setItem(`kokoro_comments_${mangaId}`, JSON.stringify(comments));
};

// Unified Service to manage Auth and Database
export const DBService = {
  // Authentication Actions
  onAuthChange: (callback: (user: any | null) => void) => {
    if (isFirebaseAvailable && auth) {
      return onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          // Sync with LocalStorage or just trigger callback
          const normalizedUser = {
            uid: fbUser.uid,
            email: fbUser.email || "",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuário",
            photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
          };
          callback(normalizedUser);
        } else {
          // Check if mock user is logged in
          const mockSession = localStorage.getItem("kokoro_session");
          if (mockSession) {
            callback(JSON.parse(mockSession));
          } else {
            callback(null);
          }
        }
      });
    } else {
      // Local check
      const checkSession = () => {
        const mockSession = localStorage.getItem("kokoro_session");
        callback(mockSession ? JSON.parse(mockSession) : null);
      };
      checkSession();
      // Listen to storage events for cross-tab sync
      window.addEventListener("storage", checkSession);
      return () => window.removeEventListener("storage", checkSession);
    }
  },

  signInEmail: async (email: string, pass: string): Promise<any> => {
    if (isFirebaseAvailable && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const user = {
          uid: cred.user.uid,
          email: cred.user.email || "",
          displayName: cred.user.displayName || email.split("@")[0],
          photoURL: cred.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cred.user.uid}`,
        };
        // Save locally for fallback synchronization
        localStorage.setItem("kokoro_session", JSON.stringify(user));
        return user;
      } catch (error: any) {
        // Fallback to local accounts if Firebase auth is blocked / disabled in console
        console.warn("Firebase Auth error. Checking local database as backup.", error.message);
        return DBService.signInEmailMock(email, pass);
      }
    } else {
      return DBService.signInEmailMock(email, pass);
    }
  },

  signInEmailMock: async (email: string, pass: string): Promise<any> => {
    if (!pass || pass.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }
    const users = getLocalUsers();
    const existing = Object.values(users).find(u => u.email === email);
    if (!existing) {
      throw new Error("Usuário não encontrado. Crie uma conta primeiro!");
    }
    // Simple mock check
    const user = {
      uid: existing.uid,
      email: existing.email,
      displayName: existing.displayName,
      photoURL: existing.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${existing.uid}`,
    };
    localStorage.setItem("kokoro_session", JSON.stringify(user));
    return user;
  },

  signUpEmail: async (email: string, pass: string, name: string): Promise<any> => {
    if (isFirebaseAvailable && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const user = {
          uid: cred.user.uid,
          email: cred.user.email || "",
          displayName: name || email.split("@")[0],
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cred.user.uid}`,
        };
        // Sync profile to Firestore if working
        if (db) {
          try {
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              favorites: []
            });
          } catch (e) {
            console.error("Failed to save profile to Firestore, continuing locally", e);
          }
        }
        localStorage.setItem("kokoro_session", JSON.stringify(user));
        return user;
      } catch (error: any) {
        console.warn("Firebase Signup error. Registering in local database backup.", error.message);
        return DBService.signUpEmailMock(email, pass, name);
      }
    } else {
      return DBService.signUpEmailMock(email, pass, name);
    }
  },

  signUpEmailMock: async (email: string, pass: string, name: string): Promise<any> => {
    if (!pass || pass.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }
    const users = getLocalUsers();
    const existing = Object.values(users).find(u => u.email === email);
    if (existing) {
      throw new Error("Este email já está cadastrado.");
    }
    const uid = "mock_" + Math.random().toString(36).substr(2, 9);
    const newUser: UserProfile = {
      uid,
      email,
      displayName: name || email.split("@")[0],
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
      favorites: []
    };
    users[uid] = newUser;
    saveLocalUsers(users);
    
    const userSession = {
      uid: newUser.uid,
      email: newUser.email,
      displayName: newUser.displayName,
      photoURL: newUser.photoURL
    };
    localStorage.setItem("kokoro_session", JSON.stringify(userSession));
    return userSession;
  },

  signInGoogle: async (): Promise<any> => {
    if (isFirebaseAvailable && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        const user = {
          uid: cred.user.uid,
          email: cred.user.email || "",
          displayName: cred.user.displayName || "Google User",
          photoURL: cred.user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${cred.user.uid}`,
        };
        
        // Sync to Firestore
        if (db) {
          try {
            await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL
            }, { merge: true });
          } catch (e) {
            console.warn("Could not sync Google user profile to Firestore.", e);
          }
        }
        
        localStorage.setItem("kokoro_session", JSON.stringify(user));
        return user;
      } catch (error: any) {
        console.warn("Google Sign-In failed or blocked. Simulating Google Sign-In for demo.", error.message);
        return DBService.signInGoogleMock();
      }
    } else {
      return DBService.signInGoogleMock();
    }
  },

  signInGoogleMock: async (): Promise<any> => {
    // Generate a quick mock Google user
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const googleUser = {
      uid: `google_mock_${randomId}`,
      email: `google.user${randomId}@gmail.com`,
      displayName: `Gamer Google ${randomId}`,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=google${randomId}`,
    };
    
    // Save to users record
    const users = getLocalUsers();
    users[googleUser.uid] = {
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName,
      photoURL: googleUser.photoURL,
      favorites: []
    };
    saveLocalUsers(users);
    
    localStorage.setItem("kokoro_session", JSON.stringify(googleUser));
    return googleUser;
  },

  signOutUser: async () => {
    localStorage.removeItem("kokoro_session");
    if (isFirebaseAvailable && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Firebase signOut failed", e);
      }
    }
    // Dispatch standard event
    window.dispatchEvent(new Event("storage"));
  },

  updateUserProfile: async (user: any, displayName: string, photoURL: string): Promise<any> => {
    const cleanName = displayName.trim();
    const cleanPhoto = photoURL.trim();
    if (!cleanName) {
      throw new Error("O nome de exibição não pode ficar vazio.");
    }

    const updatedUser = {
      ...user,
      displayName: cleanName,
      photoURL: cleanPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`
    };

    if (isFirebaseAvailable && auth?.currentUser && user.uid === auth.currentUser.uid) {
      try {
        await updateAuthProfile(auth.currentUser, {
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL
        });
      } catch (e) {
        console.warn("Could not update Firebase Auth profile. Continuing with local session.", e);
      }
    }

    if (isFirebaseAvailable && db && user.uid && !user.uid.startsWith("mock_") && !user.uid.startsWith("google_mock_")) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL
        }, { merge: true });
      } catch (e) {
        console.warn("Could not update Firestore profile. Saving locally.", e);
      }
    }

    const users = getLocalUsers();
    users[user.uid] = {
      uid: user.uid,
      email: user.email,
      displayName: updatedUser.displayName,
      photoURL: updatedUser.photoURL,
      favorites: users[user.uid]?.favorites || JSON.parse(localStorage.getItem(`favs_${user.uid}`) || "[]")
    };
    saveLocalUsers(users);
    localStorage.setItem("kokoro_session", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("storage"));
    return updatedUser;
  },

  // BOOKMARKS/FAVORITES
  getFavorites: async (userId: string): Promise<string[]> => {
    if (isFirebaseAvailable && db && userId && !userId.startsWith("mock_") && !userId.startsWith("google_mock_")) {
      try {
        const uDoc = await getDoc(doc(db, "users", userId));
        if (uDoc.exists()) {
          return uDoc.data().favorites || [];
        }
      } catch (e) {
        console.error("Error reading Firestore favorites, trying local", e);
      }
    }
    // Local fallback
    const users = getLocalUsers();
    return users[userId]?.favorites || JSON.parse(localStorage.getItem(`favs_${userId}`) || "[]");
  },

  toggleFavorite: async (userId: string, mangaId: string): Promise<string[]> => {
    // Read current favorites
    let currentFavs = await DBService.getFavorites(userId);
    if (currentFavs.includes(mangaId)) {
      currentFavs = currentFavs.filter(id => id !== mangaId);
    } else {
      currentFavs.push(mangaId);
    }

    // Save to Firestore if working
    if (isFirebaseAvailable && db && userId && !userId.startsWith("mock_") && !userId.startsWith("google_mock_")) {
      try {
        await setDoc(doc(db, "users", userId), { favorites: currentFavs }, { merge: true });
      } catch (e) {
        console.error("Failed to save favorite in Firestore. Saving locally.", e);
      }
    }

    // Always save locally
    const users = getLocalUsers();
    if (users[userId]) {
      users[userId].favorites = currentFavs;
      saveLocalUsers(users);
    }
    localStorage.setItem(`favs_${userId}`, JSON.stringify(currentFavs));
    
    return currentFavs;
  },

  getMangaViews: async (mangaId: string): Promise<number> => {
    if (isFirebaseAvailable && db) {
      try {
        const statsDoc = await getDoc(doc(db, "mangaStats", mangaId));
        if (statsDoc.exists()) {
          return Number(statsDoc.data().views || 0);
        }
      } catch (e) {
        console.warn("Could not read Firestore view counter. Using local counter.", e);
      }
    }
    return Number(localStorage.getItem(`views_${mangaId}`) || "0");
  },

  incrementMangaViews: async (mangaId: string): Promise<number> => {
    const nextViews = (await DBService.getMangaViews(mangaId)) + 1;
    localStorage.setItem(`views_${mangaId}`, String(nextViews));

    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, "mangaStats", mangaId), { views: nextViews }, { merge: true });
      } catch (e) {
        console.warn("Could not update Firestore view counter. Saved locally.", e);
      }
    }

    return nextViews;
  },

  // COMMENTS SYSTEM
  getComments: async (mangaId: string): Promise<Comment[]> => {
    if (isFirebaseAvailable && db) {
      try {
        const q = query(collection(db, `mangas/${mangaId}/comments`), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list: Comment[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Comment);
          });
          return list;
        }
      } catch (e) {
        console.warn("Firestore comments fetch failed or collection empty. Using local comments.", e);
      }
    }
    return getLocalComments(mangaId).sort((a, b) => b.createdAt - a.createdAt);
  },

  addComment: async (mangaId: string, user: any, text: string, gifUrl?: string): Promise<Comment> => {
    const newComment: Comment = {
      id: "comment_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      mangaId,
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      userPhoto: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
      text,
      gifUrl,
      createdAt: Date.now(),
      likes: [],
      replies: []
    };

    // Firebase write
    if (isFirebaseAvailable && db && !user.uid.startsWith("mock_") && !user.uid.startsWith("google_mock_")) {
      try {
        // We write to a nested collection for scalability
        await setDoc(doc(db, `mangas/${mangaId}/comments`, newComment.id), newComment);
        return newComment;
      } catch (e) {
        console.error("Firestore write comment failed. Writing locally.", e);
      }
    }

    // Local write
    const comments = getLocalComments(mangaId);
    comments.push(newComment);
    saveLocalComments(mangaId, comments);
    return newComment;
  },

  deleteComment: async (mangaId: string, commentId: string, userId: string): Promise<boolean> => {
    // Firebase delete
    if (isFirebaseAvailable && db && !userId.startsWith("mock_") && !userId.startsWith("google_mock_")) {
      try {
        const commentRef = doc(db, `mangas/${mangaId}/comments`, commentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists() && commentSnap.data().userId === userId) {
          await deleteDoc(commentRef);
          return true;
        } else if (!commentSnap.exists()) {
          // Might only be in local
        } else {
          throw new Error("Sem autorização para deletar!");
        }
      } catch (e) {
        console.error("Firestore delete comment error", e);
      }
    }

    // Local delete
    const comments = getLocalComments(mangaId);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      if (comment.userId === userId) {
        const filtered = comments.filter(c => c.id !== commentId);
        saveLocalComments(mangaId, filtered);
        return true;
      }
      throw new Error("Não é possível apagar o comentário de outra pessoa.");
    }
    return false;
  },

  likeComment: async (mangaId: string, commentId: string, userId: string): Promise<Comment> => {
    // Firebase like
    if (isFirebaseAvailable && db && !userId.startsWith("mock_") && !userId.startsWith("google_mock_")) {
      try {
        const commentRef = doc(db, `mangas/${mangaId}/comments`, commentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
          const data = commentSnap.data() as Comment;
          let likes = data.likes || [];
          if (likes.includes(userId)) {
            likes = likes.filter(id => id !== userId);
          } else {
            likes.push(userId);
          }
          await updateDoc(commentRef, { likes });
          return { ...data, id: commentId, likes };
        }
      } catch (e) {
        console.error("Firestore like error", e);
      }
    }

    // Local like
    const comments = getLocalComments(mangaId);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      if (!comment.likes) comment.likes = [];
      if (comment.likes.includes(userId)) {
        comment.likes = comment.likes.filter(id => id !== userId);
      } else {
        comment.likes.push(userId);
      }
      saveLocalComments(mangaId, comments);
      return comment;
    }
    throw new Error("Comentário não encontrado.");
  },

  replyToComment: async (mangaId: string, commentId: string, user: any, replyText: string, gifUrl?: string): Promise<Comment> => {
    const newReply: CommentReply = {
      id: "reply_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0],
      userEmail: user.email,
      userPhoto: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
      text: replyText,
      gifUrl,
      createdAt: Date.now()
    };

    // Firebase reply
    if (isFirebaseAvailable && db && !user.uid.startsWith("mock_") && !user.uid.startsWith("google_mock_")) {
      try {
        const commentRef = doc(db, `mangas/${mangaId}/comments`, commentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
          const data = commentSnap.data() as Comment;
          const replies = data.replies || [];
          replies.push(newReply);
          await updateDoc(commentRef, { replies });
          return { ...data, id: commentId, replies };
        }
      } catch (e) {
        console.error("Firestore reply error", e);
      }
    }

    // Local reply
    const comments = getLocalComments(mangaId);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      if (!comment.replies) comment.replies = [];
      comment.replies.push(newReply);
      saveLocalComments(mangaId, comments);
      return comment;
    }
    throw new Error("Comentário principal não encontrado.");
  },

  deleteReply: async (mangaId: string, commentId: string, replyId: string, userId: string): Promise<Comment> => {
    // Firebase delete reply
    if (isFirebaseAvailable && db && !userId.startsWith("mock_") && !userId.startsWith("google_mock_")) {
      try {
        const commentRef = doc(db, `mangas/${mangaId}/comments`, commentId);
        const commentSnap = await getDoc(commentRef);
        if (commentSnap.exists()) {
          const data = commentSnap.data() as Comment;
          let replies = data.replies || [];
          const targetReply = replies.find(r => r.id === replyId);
          if (targetReply && targetReply.userId === userId) {
            replies = replies.filter(r => r.id !== replyId);
            await updateDoc(commentRef, { replies });
            return { ...data, id: commentId, replies };
          } else if (!targetReply) {
            throw new Error("Resposta não encontrada.");
          } else {
            throw new Error("Não autorizado a deletar esta resposta!");
          }
        }
      } catch (e) {
        console.error("Firestore delete reply error", e);
      }
    }

    // Local delete reply
    const comments = getLocalComments(mangaId);
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      if (!comment.replies) comment.replies = [];
      const reply = comment.replies.find(r => r.id === replyId);
      if (reply) {
        if (reply.userId === userId) {
          comment.replies = comment.replies.filter(r => r.id !== replyId);
          saveLocalComments(mangaId, comments);
          return comment;
        }
        throw new Error("Não é possível apagar a resposta de outra pessoa.");
      }
    }
    throw new Error("Resposta não encontrada.");
  }
};
