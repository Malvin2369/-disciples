// Import the necessary Firebase SDKs
import { app } from "../firebase.js";
import { getFirestore, collection, getDocs, orderBy, query, limit } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore(app);

// Function to fetch latest posts and render them
const fetchAndRenderLatestPosts = async (containerId, collectionName, limitCount = 3) => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
    }

    try {
        const q = query(collection(db, collectionName), orderBy("date", "desc"), limit(limitCount));
        const querySnapshot = await getDocs(q);
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({ id: doc.id, ...doc.data() });
        });

        if (posts.length === 0) {
            container.innerHTML = `<p class="text-gray-400 text-center col-span-full">No articles found in this section.</p>`;
            return;
        }

        container.innerHTML = posts.map(post => `
            <a href="#" data-post-id="${post.id}" data-type="${collectionName}" class="post-card bg-gray-800 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <img src="${post.imageUrl}" alt="${post.title}" class="w-full h-48 object-cover rounded-lg mb-4"/>
                <h4 class="text-xl font-bold text-white mb-1">${post.title}</h4>
                <p class="text-sm text-gray-500 mb-4">${post.date}</p>
                <p class="text-gray-400">${post.summary}</p>
            </a>
        `).join('');

        // Attach event listeners to the newly rendered cards
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = card.dataset.postId;
                const post = posts.find(p => p.id === postId);
                if (post) {
                    openModal(post);
                }
            });
        });

    } catch (e) {
        console.error(`Error fetching latest posts from ${collectionName}: `, e);
        container.innerHTML = `<p class="text-red-500 text-center col-span-full">Failed to load content. Please check your Firebase rules.</p>`;
    }
};

// Function to open the modal with post details
const openModal = (data) => {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modalContent || !modalOverlay) {
        console.error('Modal elements not found!');
        return;
    }

    modalContent.innerHTML = `
        <div class="text-white">
            <img src="${data.imageUrl}" alt="${data.title}" class="w-full rounded-lg mb-6 max-h-72 object-cover" />
            <h3 class="text-3xl font-bold mb-2 text-blue-400">${data.title}</h3>
            <p class="text-sm text-gray-500 mb-4">By ${data.author} on ${data.date}</p>
            <div class="prose prose-invert max-w-none text-gray-300">
                ${data.fullContent}
            </div>
        </div>
    `;
    modalOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
};

// Main function to run when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and render latest blog posts and projects
    await fetchAndRenderLatestPosts('latest-blog-container', 'blogPosts', 3);
    await fetchAndRenderLatestPosts('latest-projects-container', 'projects', 3);

    // Close modal listener
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    if (closeModalBtn && modalOverlay) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('is-visible');
            document.body.style.overflow = '';
        });
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        });
    }
});