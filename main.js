const surahs = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
];

const grid = document.getElementById('surahGrid');
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');

function normalizeArabic(text) {
    if (!text) return "";
    return text
        .replace(/[\u064B-\u065F]/g, '') // Tashkeel
        .replace(/[إأآا]/g, 'ا') // Normalize Alef
        .replace(/ة/g, 'ه') // Teh Marbuta -> Heh
        .replace(/ى/g, 'ي'); // Alef Maqsura -> Ya
}

function renderSurahs(filterText = '') {
    grid.innerHTML = '';
    const normalizedFilter = filterText.trim();
    const toWestern = (s) => s.replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 1632);
    const westernFilter = toWestern(normalizedFilter);
    const isNumber = /^[0-9\u0660-\u0669]+$/.test(normalizedFilter);
    const searchNumber = isNumber ? parseInt(westernFilter) : null;
    const query = normalizeArabic(normalizedFilter);

    const filtered = surahs.filter((name, index) => {
        const surahNumber = index + 1;
        if (isNumber) {
            return surahNumber === searchNumber;
        }
        return normalizeArabic(name).includes(query);
    });

    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach((name, index) => {
           const btn = document.createElement('button');
           const surahIndex = surahs.indexOf(name);
           const surahNumber = surahIndex + 1;

           const isFiltered = !!filterText;
           const nameColor = isFiltered ? 'text-brand' : 'text-gray-700';
           const indicatorDisplay = isFiltered ? 'flex' : 'hidden';

           btn.className = `
                surah-card 
                group
                border 
                font-medium md:font-bold font-serif text-lg
                py-3 px-4 rounded-xl
                transition-all duration-300
                flex items-center justify-center
                relative overflow-hidden
                bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 ${nameColor} dark:text-white/80 hover:border-brand-gold dark:hover:border-brand-gold hover:text-brand-DEFAULT dark:hover:text-white hover:shadow-md
           `;
           
           btn.innerHTML = `
                <div class="flex items-center justify-between w-full">
                    <span class="w-7 h-7 bg-brand/10 dark:bg-white/10 text-brand dark:text-brand-gold rounded-full ${indicatorDisplay} items-center justify-center text-xs font-bold font-sans">
                        ${surahNumber.toLocaleString('ar-EG')}
                    </span>
                    <span class="relative z-10 flex-1 text-center">سورة ${name}</span>
                </div>
           `;
           
           btn.onclick = (e) => {
               // Sticky Hover Logic for Mobile
               // Check if this card is already active (selected)
               if (btn.classList.contains('active-surah')) {
                   // If already active, navigate
                   window.location.href = `ayahs.html?surah=${surahNumber}&name=${encodeURIComponent(name)}`;
               } else {
                   // If not active, activate this one and deactivate others
                   // Remove active class from all other cards
                   document.querySelectorAll('.surah-card').forEach(card => {
                       card.classList.remove('active-surah', 'border-brand-gold', 'text-brand-DEFAULT', 'shadow-md', 'dark:text-white');
                       card.classList.add('border-gray-200', 'dark:border-white/10', 'text-gray-700', 'dark:text-white/80');
                   });
                   
                   // Add active class to clicked card
                   btn.classList.add('active-surah', 'border-brand-gold', 'text-brand-DEFAULT', 'shadow-md', 'dark:text-white');
                   btn.classList.remove('border-gray-200', 'dark:border-white/10', 'text-gray-700', 'dark:text-white/80');
               }
           };

           grid.appendChild(btn);
        });
    }
}

// Initial Render
renderSurahs();

// Search Listener
searchInput.addEventListener('input', (e) => {
    renderSurahs(e.target.value);
});

// ====== Verse Tracking ======
function loadLastReadVerse() {
    let savedSurah = localStorage.getItem('lastReadSurah');
    let savedAyah = localStorage.getItem('lastReadAyah');

    const trackerCard = document.getElementById('verseTrackerCard');
    const trackerText = document.getElementById('verseTrackerText');

    if (!savedSurah || !savedAyah) {
        // Default to Surah 1, Ayah 1 (Al-Fatiha) if no saved history
        savedSurah = "1";
        savedAyah = "1";
    }

    const surahNum = parseInt(savedSurah);
    const ayahNum = parseInt(savedAyah);
    const surahName = surahs[surahNum - 1];

    // Check Auto-Resume Preference
    if (localStorage.getItem('kran_auto_resume') === 'true') {
        // Redirect to Ayahs page with hash
        window.location.href = `ayahs.html?surah=${surahNum}&name=${encodeURIComponent(surahName)}#ayah-${ayahNum}`;
        return;
    }

    // Update tracker card text
    if (trackerText) {
        trackerText.textContent = `سورة ${surahName} - الآية ${ayahNum.toLocaleString('ar-EG')}`;
    }

    // Make tracker card clickable (Updated Link)
    if (trackerCard) {
        trackerCard.style.display = 'block'; // Always show the tracker
        trackerCard.onclick = () => {
            window.location.href = `ayahs.html?surah=${surahNum}&name=${encodeURIComponent(surahName)}#ayah-${ayahNum}`;
        };
    }

    // Inject "Continue Reading" Button in Hero Section (If not exists)
    const searchContainer = document.querySelector('.relative.max-w-2xl.mx-auto.mt-6');
    if (searchContainer && !document.getElementById('heroResumeBtn')) {
        const btn = document.createElement('button');
        btn.id = 'heroResumeBtn';
        btn.className = 'mt-6 bg-[#D4AF37] text-white px-6 md:px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto animate-fade-in-up font-serif';
        btn.innerHTML = `
            <span>متابعة القراءة: سورة ${surahName} آية ${ayahNum.toLocaleString('ar-EG')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
            </svg>
        `;
        btn.onclick = () => {
             window.location.href = `ayahs.html?surah=${surahNum}&name=${encodeURIComponent(surahName)}#ayah-${ayahNum}`;
        };
        searchContainer.after(btn);
    }

    // Update reading progress
    updateReadingProgress(surahNum, ayahNum);
}

function updateReadingProgress(surah, ayah) {
    // Simple calculation: assuming we track verses sequentially
    // This is a simplified version - you could improve by tracking all read verses
    const totalVerses = 6236;
    const ayahCounts = [
        7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
        123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
        112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
        34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
        54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
        60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
        14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
        28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
        29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
        15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
        11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
        5, 4, 5, 6
    ];

    // Calculate total verses read up to current surah and ayah
    let versesRead = 0;
    for (let i = 0; i < surah - 1; i++) {
        versesRead += ayahCounts[i];
    }
    versesRead += ayah;

    const percentage = ((versesRead / totalVerses) * 100).toFixed(1);

    // Update progress bar
    const progressTitle = document.querySelector('.text-base.font-medium.text-\\[\\#1B4332\\]');
    const progressBar = document.querySelector('.bg-emerald-600.h-2.rounded-full');
    const progressPercent = document.querySelector('.text-2xl.font-bold.text-gray-700');
    const versesReadText = document.querySelectorAll('.text-xs.text-gray-500 span')[0];

    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }

    if (progressPercent) {
        progressPercent.textContent = `${parseFloat(percentage).toLocaleString('ar-EG')}٪`;
    }

    if (versesReadText) {
        versesReadText.textContent = `تم قراءة ${versesRead.toLocaleString('ar-EG')} آية`;
    }

    // Celebration check
    if (versesRead === totalVerses) {
        if (progressTitle) {
            progressTitle.innerHTML = 'مبروك الختمة <span class="text-xl">🎉</span>';
            progressTitle.classList.add('text-brand-gold');
        }
        
        // Modal trigger logic (show only once per session or until closed)
        const modal = document.getElementById('celebrationModal');
        if (modal && !sessionStorage.getItem('celebrated')) {
            modal.style.display = 'flex';
            sessionStorage.setItem('celebrated', 'true');
        }
    }
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadLastReadVerse();
});


