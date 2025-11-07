// Import the necessary Firebase SDKs
import { app } from "../firebase.js";
import { getFirestore, collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Initialize Firebase and Firestore
const db = getFirestore(app);

// Function to fetch articles from Firestore
const fetchArticles = async () => {
    const q = query(collection(db, "projects"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const articles = [];
    querySnapshot.forEach((doc) => {
        articles.push({ id: doc.id, ...doc.data() });
    });
    return articles;
};

// Function to render articles grouped by category
const renderArticlesByCategory = (articles, container) => {
    // Group articles by category. Posts without a category will be 'Uncategorized'.
    const categorizedArticles = articles.reduce((acc, article) => {
        const category = article.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(article);
        return acc;
    }, {});

    container.innerHTML = ''; // Clear existing content

    // Loop through the grouped categories and render sections for each
    for (const category in categorizedArticles) {
        const categorySection = document.createElement('div');
        categorySection.className = 'mb-16';
        categorySection.innerHTML = `
            <h2 class="text-3xl font-bold text-green-400 mb-8">${category}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="category-${category.replace(/\s+/g, '-').toLowerCase()}">
                </div>
        `;
        container.appendChild(categorySection);

        const categoryContainer = document.getElementById(`category-${category.replace(/\s+/g, '-').toLowerCase()}`);
        const articlesToRender = categorizedArticles[category];
        
        // Render the articles within this category section
        categoryContainer.innerHTML = articlesToRender.map(article => `
            <a href="#" data-article-id="${article.id}" class="blog-post-card bg-gray-900 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
                <img src="${article.imageUrl}" alt="${article.title}" class="w-full h-48 object-cover rounded-lg mb-4"/>
                <h4 class="text-xl font-bold text-aliceblue mb-1">${article.title}</h4>
                <p class="text-sm text-gray-500 mb-4">${article.date}</p>
                <p class="text-gray-400">${article.summary}</p>
            </a>
        `).join('');
    }
    
    setupArticleListeners(articles);
};

// Function to open the modal with article details
const openModal = (data) => {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    if (!modalContent || !modalOverlay) {
        console.error('Modal elements not found!');
        return;
    }
    let modalHtml = `
        <div class="text-white">
            <img src="${data.imageUrl}" alt="${data.title}" class="w-full rounded-lg mb-6 max-h-72 object-cover" />
            <h3 class="text-3xl font-bold mb-2 text-blue-400">${data.title}</h3>
            <p class="text-sm text-gray-500 mb-4">By ${data.author} on ${data.date}</p>
            <div class="prose prose-invert max-w-none text-gray-300">
                ${data.content}
            </div>
        </div>
    `;
    modalContent.innerHTML = modalHtml;
    modalOverlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
};

// Setup click listeners for article cards
const setupArticleListeners = (articles) => {
    document.querySelectorAll('.blog-post-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const articleId = card.dataset.articleId;
            const article = articles.find(a => a.id === articleId);
            if (article) {
                openModal({ 
                    type: 'projects', 
                    title: article.title, 
                    content: article.fullContent,
                    imageUrl: article.imageUrl,
                    author: article.author,
                    date: article.date
                });
            }
        });
    });
};

// Initial page load function
let articles = [];
document.addEventListener('DOMContentLoaded', async () => {
    articles = await fetchArticles();
    const articlesContainer = document.getElementById('articles-container');
    renderArticlesByCategory(articles, articlesContainer);
    
    // Modal UI Listeners
    const modalOverlay = document.getElementById('modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
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
});