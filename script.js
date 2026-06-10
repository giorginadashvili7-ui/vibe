  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAGgAZ7o9p0qUHdeU4CK-OXn4QaB_XD0ow",
            authDomain: "chillstep-8614c.firebaseapp.com",
            databaseURL: "https://chillstep-8614c-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "chillstep-8614c",
            storageBucket: "chillstep-8614c.firebasestorage.app",
            messagingSenderId: "209607140121",
            appId: "1:209607140121:web:f46b7e95eb4cd6e01d5b88",
            measurementId: "G-204V1J70S6"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        // Notification System
        const notificationContainer = document.getElementById('notification-container');
        const modalOverlay = document.getElementById('modal-overlay');

        function showNotification(type = 'info', title = '', message = '', duration = 4000) {
            const notification = document.createElement('div');
            notification.className = `notification`;
            
            const icons = {
                success: '<i class="fa-solid fa-circle-check"></i>',
                error: '<i class="fa-solid fa-circle-exclamation"></i>',
                info: '<i class="fa-solid fa-circle-info"></i>',
                warning: '<i class="fa-solid fa-triangle-exclamation"></i>'
            };

            notification.innerHTML = `
                <div class="notification-icon ${type}">${icons[type]}</div>
                <div class="notification-content">
                    ${title ? `<div class="notification-title">${title}</div>` : ''}
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close" aria-label="დახურვა">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            `;

            notificationContainer.appendChild(notification);

            const closeBtn = notification.querySelector('.notification-close');
            const removeNotification = () => {
                notification.classList.add('exit');
                setTimeout(() => notification.remove(), 300);
            };

            closeBtn.addEventListener('click', removeNotification);

            if (duration > 0) {
                setTimeout(removeNotification, duration);
            }

            return notification;
        }

        function showAlert(type = 'info', title = '', message = '', confirmText = 'დასტუმრება', onConfirm = null, cancelText = 'გაუქმება', onCancel = null) {
            const modal = document.createElement('div');
            modal.className = 'modal-dialog';
            
            const icons = {
                success: 'fa-circle-check',
                error: 'fa-circle-exclamation',
                info: 'fa-circle-info',
                warning: 'fa-triangle-exclamation'
            };

            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-icon ${type}">
                        <i class="fa-solid ${icons[type]}"></i>
                    </div>
                    ${title ? `<div class="modal-title">${title}</div>` : ''}
                    <div class="modal-message">${message}</div>
                    <div class="modal-buttons">
                        <button class="modal-btn confirm">${confirmText}</button>
                        ${cancelText ? `<button class="modal-btn cancel">${cancelText}</button>` : ''}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modalOverlay.classList.remove('hidden');

            const confirmBtn = modal.querySelector('.confirm');
            const cancelBtn = modal.querySelector('.cancel');

            const closeModal = () => {
                modal.classList.add('exit');
                modalOverlay.classList.add('hidden');
                setTimeout(() => modal.remove(), 300);
            };

            confirmBtn.addEventListener('click', () => {
                closeModal();
                if (onConfirm) onConfirm();
            });

            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    closeModal();
                    if (onCancel) onCancel();
                });
            }

            modalOverlay.addEventListener('click', closeModal);
        }

        // Shortcut functions for different notification types
        function notifySuccess(title, message, duration = 3000) {
            return showNotification('success', title, message, duration);
        }

        function notifyError(title, message, duration = 5000) {
            return showNotification('error', title, message, duration);
        }

        function notifyInfo(title, message, duration = 3000) {
            return showNotification('info', title, message, duration);
        }

        function notifyWarning(title, message, duration = 4000) {
            return showNotification('warning', title, message, duration);
        }

        function alertSuccess(title, message, onConfirm = null) {
            return showAlert('success', title, message, 'დასტუმრება', onConfirm);
        }

        function alertError(title, message, onConfirm = null) {
            return showAlert('error', title, message, 'დასტუმრება', onConfirm);
        }

        function alertInfo(title, message, onConfirm = null) {
            return showAlert('info', title, message, 'დასტუმრება', onConfirm);
        }

        function confirm(title, message, onConfirm, onCancel) {
            return showAlert('warning', title, message, 'დასტუმრება', onConfirm, 'გაუქმება', onCancel);
        }

        let isLoginMode = true;

        let currentUserData = null;
        let base64ImageString = "";
        let cameraStream = null;

        const authScreen = document.getElementById('auth-screen');
        const feedScreen = document.getElementById('feed-screen');
        const authTitle = document.getElementById('auth-title');
        const usernameGroup = document.getElementById('username-group');
        const btnAuthSubmit = document.getElementById('btn-auth-submit');
        const toggleAuthMode = document.getElementById('toggle-auth-mode');

        const navFeed = document.getElementById('nav-feed');
        const navAdmin = document.getElementById('nav-admin');
        const navLogout = document.getElementById('nav-logout');

        const previewContainer = document.getElementById('preview-container');
        const previewImg = document.getElementById('preview-img');
        const btnSharePost = document.getElementById('btn-share-post');
        const postText = document.getElementById('post-text');
        const postsContainer = document.getElementById('posts-container');

        const btnOpenCamera = document.getElementById('btn-open-camera');
        const btnCloseCamera = document.getElementById('btn-close-camera');
        const btnCapture = document.getElementById('btn-capture');
        const cameraContainer = document.getElementById('camera-container');
        const cameraVideo = document.getElementById('camera-video');
        const btnClearPreview = document.getElementById('btn-clear-preview');
        const moodButtons = document.getElementById('mood-buttons');
        const promptNote = document.getElementById('prompt-note');
        const btnRandomPrompt = document.getElementById('btn-random-prompt');
        let selectedMood = '✨ სასიამოვნო';
        let openCommentsTracker = new Set();

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                currentUserData = userDoc.exists() ? userDoc.data() : { uid: user.uid, username: user.email.split('@')[0], role: "user" };
                currentUserData.uid = user.uid;

                authScreen.classList.add('hidden');
                feedScreen.classList.remove('hidden');
                navFeed.classList.remove('hidden');
                navLogout.classList.remove('hidden');
                if (currentUserData.role === 'admin') navAdmin?.classList.remove('hidden');
                loadFeed();
            } else {
                authScreen.classList.remove('hidden');
                feedScreen.classList.add('hidden');
            }
        });

        toggleAuthMode.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            usernameGroup.classList.toggle('hidden', isLoginMode);
            authTitle.innerText = isLoginMode ? "სისტემაში შესვლა" : "რეგისტრაცია";
            btnAuthSubmit.innerText = isLoginMode ? "შესვლა" : "დარეგისტრირება";
        });

        btnAuthSubmit.addEventListener('click', async () => {
            const email = document.getElementById('auth-email').value.trim();
            const password = document.getElementById('auth-password').value.trim();
            const username = document.getElementById('auth-username').value.trim();
            if (!email || !password) return notifyError("შეცდომა", "გთხოვთ, შეავსოთ ველები!");
            try {
                if (isLoginMode) { await signInWithEmailAndPassword(auth, email, password); } 
                else {
                    if (!username) return notifyError("შეცდომა", "მიუთითეთ მომხმარებლის სახელი!");
                    const cred = await createUserWithEmailAndPassword(auth, email, password);
                    await setDoc(doc(db, "users", cred.user.uid), { username, email, role: "user", createdAt: new Date().toISOString() });
                }
            } catch (err) { notifyError("შეცდომა", err.message); }
        });

        navLogout.addEventListener('click', () => signOut(auth).then(() => location.reload()));

        btnOpenCamera.addEventListener('click', async () => {
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
                cameraVideo.srcObject = cameraStream;
                cameraContainer.classList.remove('hidden');
            } catch { notifyError("შეცდომა", "კამერის ჩართვა ვერ მოხერხდა."); }
        });

        const stopCam = () => { if (cameraStream) cameraStream.getTracks().forEach(t => t.stop()); cameraContainer.classList.add('hidden'); };
        btnCloseCamera.addEventListener('click', stopCam);

        btnCapture.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = cameraVideo.videoWidth || 640;
            canvas.height = cameraVideo.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
            ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);
            base64ImageString = canvas.toDataURL('image/jpeg', 0.7);
            previewImg.src = base64ImageString;
            previewContainer.classList.remove('hidden');
            stopCam();
        });

        btnClearPreview.addEventListener('click', () => {
            base64ImageString = ""; previewContainer.classList.add('hidden');
        });

        const promptIdeas = [
            "დღეს მოვყვები ჩემს ყველაზე სასაცილო მოგონებას...",
            "მე აღმოვაჩინე ახალი ადგილი, რომელიც უნდა ნახო...",
            "ჩემს მეგობრებს ვაჩვენე რაღაც, რაც...",
            "ამ კვირას ჩემთვის ყველაზე მნიშვნელოვანი იყო...",
            "ამ დღის შემდეგ ყველაფერი შეიცვალა...",
            "ისევ დავბრუნდი და ..."
        ];

        function pickPrompt() {
            return promptIdeas[Math.floor(Math.random() * promptIdeas.length)];
        }

        function updatePromptNote() {
            if (!promptNote) return;
            promptNote.textContent = `დაიწყე ამით: "${pickPrompt()}"`;
        }

        function setMood(mood, button) {
            selectedMood = mood;
            moodButtons?.querySelectorAll('.mood-pill').forEach((pill) => pill.classList.toggle('active', pill === button));
        }

        moodButtons?.querySelectorAll('.mood-pill').forEach((button) => {
            button.addEventListener('click', () => setMood(button.dataset.mood, button));
        });

        btnRandomPrompt?.addEventListener('click', () => {
            const prompt = pickPrompt();
            postText.value = prompt;
            postText.focus();
            updatePromptNote();
        });

        updatePromptNote();

        btnSharePost.addEventListener('click', async () => {
            const txt = postText.value.trim();
            if (!txt && !base64ImageString) return notifyError("შეცდომა", "პოსტი ცარიელია!");
            try {
                await addDoc(collection(db, "posts"), {
                    userId: currentUserData.uid,
                    authorName: currentUserData.username,
                    text: txt,
                    mood: selectedMood,
                    image: base64ImageString,
                    reactions: { love: [], fire: [] },
                    comments: [],
                    createdAt: new Date().toISOString()
                });
                postText.value = ""; btnClearPreview.click();
                notifySuccess("წარმატება", "პოსტი გამოქვეყნებულია!");
            } catch (err) { notifyError("შეცდომა", err.message); }
        });

        function loadFeed() {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            onSnapshot(q, (snap) => {
                postsContainer.innerHTML = "";
                snap.forEach(d => {
                    const p = d.data(); p.id = d.id;
                    if (!p.reactions || Array.isArray(p.reactions)) p.reactions = { love: [], fire: [] };
                    if (!p.comments) p.comments = [];

                    const hasR = (t) => p.reactions[t]?.includes(currentUserData?.uid);
                    const isOwner = p.userId === currentUserData?.uid;
                    const isCommentsSectionOpen = openCommentsTracker.has(p.id);

                    const card = document.createElement('div');
                    card.className = 'post-card';
                    card.style.marginBottom = '1.5rem';
                    
                    let commentsHtml = '';
                    p.comments.forEach(c => {
                        const canDeleteComment = c.userId === currentUserData.uid || currentUserData.role === 'admin';
                        commentsHtml += `
                            <div class="comment-item">
                                <span class="comment-user">@${c.author}:</span>${c.text}
                                ${canDeleteComment ? `<button class="btn-comment-delete" data-post-id="${p.id}" data-comment='${encodeURIComponent(JSON.stringify(c))}'>წაშლა</button>` : ''}
                            </div>
                        `;
                    });

                    card.innerHTML = `
                        <div class="post-header">
                            <span class="post-user">@${p.authorName}</span>
                            <span class="post-time">${new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                        ${p.mood ? `<div class="post-mood">${p.mood}</div>` : ''}
                        <div class="post-text">${p.text || ""}</div>
                        ${p.image ? `<div class="post-img-holder"><img src="${p.image}"></div>` : ''}
                        <div class="post-footer">
                            <div class="react-group">
                                <button class="react-btn ${hasR('love') ? 'active' : ''}" data-id="${p.id}" data-type="love"><i class="fa-solid fa-heart"></i> <span>${p.reactions.love?.length || 0}</span></button>
                                <button class="react-btn ${hasR('fire') ? 'active' : ''}" data-id="${p.id}" data-type="fire"><i class="fa-solid fa-fire"></i> <span>${p.reactions.fire?.length || 0}</span></button>
                                <button class="btn-comment-toggle ${isCommentsSectionOpen ? 'active' : ''}" data-id="${p.id}"><i class="fa-regular fa-comment-dots"></i> <span>${p.comments.length}</span></button>
                            </div>
                            ${isOwner ? `<button class="btn-delete-post" data-id="${p.id}"><i class="fa-solid fa-trash-can"></i> წაშლა</button>` : ''}
                        </div>
                        <div class="comments-section ${isCommentsSectionOpen ? '' : 'hidden'}" id="comments-section-${p.id}">
                            <div class="comment-list">${commentsHtml}</div>
                            <div class="comment-form">
                                <input type="text" class="comment-input" placeholder="დაწერე კომენტარი..." id="input-${p.id}">
                                <button type="button" class="btn-comment-submit" data-id="${p.id}"><i class="fa-solid fa-paper-plane"></i></button>
                            </div>
                        </div>
                    `;
                    postsContainer.appendChild(card);
                });

                document.querySelectorAll('.react-btn').forEach(b => b.addEventListener('click', handleReaction));
                document.querySelectorAll('.btn-delete-post').forEach(b => b.addEventListener('click', deletePost));
                document.querySelectorAll('.btn-comment-toggle').forEach(b => b.addEventListener('click', toggleComments));
                document.querySelectorAll('.btn-comment-submit').forEach(b => b.addEventListener('click', submitComment));
                document.querySelectorAll('.btn-comment-delete').forEach(b => b.addEventListener('click', deleteComment));
            });
        }

        async function handleReaction(e) {
            const id = e.currentTarget.dataset.id;
            const type = e.currentTarget.dataset.type;
            const ref = doc(db, "posts", id);
            try {
                const snap = await getDoc(ref);
                if (!snap.exists()) throw new Error("საფოსტო ჩანაწერი არ არსებობს");
                const r = snap.data().reactions?.[type] || [];
                await updateDoc(ref, { [`reactions.${type}`]: r.includes(currentUserData.uid) ? arrayRemove(currentUserData.uid) : arrayUnion(currentUserData.uid) });
            } catch (err) {
                console.error('Reaction update failed:', err);
                notifyError('შეცდომა', 'რეაქცია ვერ დაემატა: ' + (err.message || err));
            }
        }

        async function deletePost(e) {
            const id = e.currentTarget.dataset.id;
            confirm("Vibe", "ნამდვილად გსურთ ამ პოსტის წაშლა?", 
                async () => {
                    try { 
                        await deleteDoc(doc(db, "posts", id));
                        notifySuccess("წარმატება", "პოსტი წაიშალა.");
                    } catch (err) { 
                        notifyError("შეცდომა", "შეცდომა წაშლისას."); 
                    }
                }
            );
        }

        async function deleteComment(e) {
            const postId = e.currentTarget.dataset.postId;
            const commentData = e.currentTarget.dataset.comment;
            if (!postId || !commentData) return;
            confirm("Vibe", "ნამდვილად გსურთ ეს კომენტარი წაშალოთ?",
                async () => {
                    try {
                        const comment = JSON.parse(decodeURIComponent(commentData));
                        await updateDoc(doc(db, "posts", postId), {
                            comments: arrayRemove(comment)
                        });
                        notifySuccess("წარმატება", "კომენტარი წაიშალა.");
                    } catch (err) {
                        console.error('Comment delete failed:', err);
                        notifyError('შეცდომა', 'კომენტარი ვერ წაიშალა.');
                    }
                }
            );
        }

        function toggleComments(e) {
            const id = e.currentTarget.dataset.id;
            const section = document.getElementById(`comments-section-${id}`);
            if (!section) return;
            
            if (section.classList.contains('hidden')) {
                section.classList.remove('hidden');
                e.currentTarget.classList.add('active');
                openCommentsTracker.add(id);
            } else {
                section.classList.add('hidden');
                e.currentTarget.classList.remove('active');
                openCommentsTracker.delete(id);
            }
        }

        async function submitComment(e) {
            const id = e.currentTarget.dataset.id;
            const input = document.getElementById(`input-${id}`);
            const text = input.value.trim();
            if (!text) return;

            const ref = doc(db, "posts", id);
            try {
                await updateDoc(ref, {
                    comments: arrayUnion({
                        author: currentUserData.username,
                        userId: currentUserData.uid,
                        text: text,
                        createdAt: new Date().toISOString()
                    })
                });
                input.value = "";
            } catch (err) {
                console.error('Comment update failed:', err);
                notifyError('შეცდომა', 'კომენტარი ვერ დაემატა: ' + (err.message || err));
            }
        }