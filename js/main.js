// AL-ANVAR Interactive Features

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            if (mobileMenu.classList.contains('hidden')) {
                menuIcon.className = 'fa-solid fa-bars';
            } else {
                menuIcon.className = 'fa-solid fa-xmark';
            }
        });

        // Close mobile menu on clicking nav link
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                menuIcon.className = 'fa-solid fa-bars';
            });
        });
    }

    // FAQ Accordion
    const faqButtons = document.querySelectorAll('.faq-btn');
    faqButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            const isOpen = !content.classList.contains('hidden');

            // Close all others
            document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
            document.querySelectorAll('.faq-btn i').forEach(i => i.style.transform = 'rotate(0deg)');

            if (!isOpen) {
                content.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
});

// Modal functions
function openBookingModal(tariffName) {
    const modal = document.getElementById('bookingModal');
    const modalContainer = document.getElementById('modalContainer');
    const titleEl = document.getElementById('modalTariffTitle');
    const inputEl = document.getElementById('selectedTariffInput');

    if (tariffName) {
        titleEl.textContent = tariffName;
        inputEl.value = tariffName;
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContainer.classList.remove('scale-95', 'opacity-0');
        modalContainer.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    const modalContainer = document.getElementById('modalContainer');

    modalContainer.classList.remove('scale-100', 'opacity-100');
    modalContainer.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 200);
}

// Modal Click Outside to Close
window.addEventListener('click', (e) => {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        closeBookingModal();
    }
});

// Form Submissions
function handleFormSubmit(e) {
    e.preventDefault();
    e.target.reset();
    showToast();
}

function handleModalSubmit(e) {
    e.preventDefault();
    closeBookingModal();
    e.target.reset();
    showToast();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4500);
}
