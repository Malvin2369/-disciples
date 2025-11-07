// Import the necessary Firebase SDKs
import { app } from "../firebase.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Initialize Firebase and its services
const auth = getAuth(app);
const db = getFirestore(app);

const adminUserId = "JZFuI9Q6gHgGsmTM77zyn8SE7ok1"; // Your admin User ID
const loginFormContainer = document.getElementById('login-form-container');
const adminPanelContainer = document.getElementById('admin-panel-container');
const existingPostsContainer = document.getElementById('existing-posts-container');
const newPostForm = document.getElementById('new-post-form');
const postStatus = document.getElementById('post-status');

// Listen for auth state changes to toggle the admin panel visibility
onAuthStateChanged(auth, (user) => {
    if (user && user.uid === adminUserId) {
        loginFormContainer.style.display = 'none';
        adminPanelContainer.style.display = 'block';
        existingPostsContainer.style.display = 'block';
        fetchAndDisplayAdminPosts(); // This function will display the list of posts
    } else {
        loginFormContainer.style.display = 'block';
        adminPanelContainer.style.display = 'none';
        existingPostsContainer.style.display = 'none';
    }
});

// Handle login form submission
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['email'].value;
    const password = loginForm['password'].value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById('login-error').textContent = ""; // Clear errors
        })
        .catch((err) => {
            document.getElementById('login-error').textContent = "Login failed: " + err.message;
        });
});

newPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const articleType = document.querySelector('input[name="articleType"]:checked').value;

    const postData = {
        title: newPostForm['title'].value,
        summary: newPostForm['summary'].value,
        imageUrl: newPostForm['imageUrl'].value,
        fullContent: newPostForm['fullContent'].value,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        author: "Admin",
        category: newPostForm['category'].value
    };

    if (newPostForm.dataset.postId) {
        // Edit existing post
        const postId = newPostForm.dataset.postId;
        const postRef = doc(db, articleType, postId);
        try {
            await updateDoc(postRef, postData);
            postStatus.textContent = "Article updated successfully!";
            newPostForm.reset();
            newPostForm.querySelector('button[type="submit"]').textContent = 'Publish';
            delete newPostForm.dataset.postId;
            fetchAndDisplayAdminPosts();
        } catch (e) {
            postStatus.textContent = "Error updating article: " + e.message;
        }
    } else {
        // Create new post
        try {
            await addDoc(collection(db, articleType), postData);
            postStatus.textContent = "Article published successfully!";
            newPostForm.reset();
            fetchAndDisplayAdminPosts();
        } catch (e) {
            postStatus.textContent = "Error publishing article: " + e.message;
        }
    }
});

// Update the fetch function to handle both collections
const fetchAndDisplayAdminPosts = async () => {
    try {
        existingPostsContainer.innerHTML = '';
        const blogQuery = query(collection(db, "blogPosts"), orderBy("date", "desc"));
        const projectsQuery = query(collection(db, "projects"), orderBy("date", "desc"));

        const blogSnapshot = await getDocs(blogQuery);
        const projectsSnapshot = await getDocs(projectsQuery);

        // Display Blog Posts
        displayPosts(blogSnapshot, "blogPosts");
        // Display Projects
        displayPosts(projectsSnapshot, "projects");

    } catch (e) {
        console.error("Error fetching admin posts: ", e);
    }
};

const displayPosts = (snapshot, collectionName) => {
    snapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.className = 'bg-gray-800 p-4 rounded-lg shadow-md mb-4 flex justify-between items-center';
        postElement.innerHTML = `
            <div>
                <h4 class="text-xl font-bold">${post.title}</h4>
                <p class="text-gray-400 text-sm">${post.date}</p>
                <p class="text-gray-400 text-xs mt-1">Type: ${collectionName === 'blogPosts' ? 'Blog Post' : 'Project'}</p>
            </div>
            <div>
                <button data-id="${doc.id}" data-type="${collectionName}" class="edit-btn bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-xs mr-2">Edit</button>
                <button data-id="${doc.id}" data-type="${collectionName}" class="delete-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs">Delete</button>
            </div>
        `;
        existingPostsContainer.appendChild(postElement);
    });

    // Attach event listeners for edit and delete
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.dataset.id;
            const postType = button.dataset.type;
            const postRef = doc(db, postType, postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data();
                newPostForm.querySelector('input[name="articleType"][value="' + postType + '"]').checked = true;
                newPostForm['title'].value = postData.title;
                newPostForm['summary'].value = postData.summary;
                newPostForm['imageUrl'].value = postData.imageUrl;
                newPostForm['fullContent'].value = postData.fullContent;
                newPostForm.querySelector('button[type="submit"]').textContent = 'Update';
                newPostForm.dataset.postId = postId;
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const postId = button.dataset.id;
            const postType = button.dataset.type;
            if (confirm("Are you sure you want to delete this article?")) {
                try {
                    await deleteDoc(doc(db, postType, postId));
                    postStatus.textContent = "Article deleted successfully!";
                    fetchAndDisplayAdminPosts();
                } catch (e) {
                    postStatus.textContent = "Error deleting article: " + e.message;
                }
            }
        });
    });
};