/* =========================================
   TAKO WEBSITE JAVASCRIPT
========================================= */

const CONTRACT = "0x0ee375090f423934ebfbb241a3eb2ee4e01eaf0a";

/* =========================================
   MOBILE MENU
========================================= */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

function closeMobileMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
}

function toggleMobileMenu() {
    if (!mobileMenu || !menuBtn) return;
    const isOpen = mobileMenu.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", toggleMobileMenu);

    mobileMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMobileMenu();
    });

    document.addEventListener("click", (e) => {
        if (
            mobileMenu.classList.contains("active") &&
            !mobileMenu.contains(e.target) &&
            !menuBtn.contains(e.target)
        ) {
            closeMobileMenu();
        }
    });
}

/* =========================================
   COPY CONTRACT
========================================= */
const copyButton = document.getElementById("copyContract");

if (copyButton) {
    copyButton.addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(CONTRACT);
            const original = copyButton.textContent;
            copyButton.textContent = "COPIED ✓";
            copyButton.disabled = true;

            setTimeout(() => {
                copyButton.textContent = original;
                copyButton.disabled = false;
            }, 1800);
        } catch (err) {
            prompt("Copy this contract address:", CONTRACT);
        }
    });
}

/* =========================================
   MARKET DATA (DexScreener)
========================================= */
async function loadMarketData() {
    const priceEl = document.getElementById("price");
    const mcapEl = document.getElementById("marketCap");
    const liqEl = document.getElementById("liquidity");
    const volEl = document.getElementById("volume");

    if (!priceEl || !mcapEl || !liqEl || !volEl) return;

    try {
        const res = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${CONTRACT}`
        );

        if (!res.ok) throw new Error("API unavailable");

        const data = await res.json();

        if (!data.pairs || data.pairs.length === 0) {
            throw new Error("No pairs found");
        }

        const pair = [...data.pairs].sort(
            (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
        )[0];

        const price = Number(pair.priceUsd || 0);
        const marketCap = Number(pair.marketCap || pair.fdv || 0);
        const liquidity = Number(pair.liquidity?.usd || 0);
        const volume = Number(pair.volume?.h24 || 0);

        priceEl.textContent = formatPrice(price);
        mcapEl.textContent = formatMoney(marketCap);
        liqEl.textContent = formatMoney(liquidity);
        volEl.textContent = formatMoney(volume);
    } catch (err) {
        console.error("TAKO market data error:", err);
        priceEl.textContent = "—";
        mcapEl.textContent = "—";
        liqEl.textContent = "—";
        volEl.textContent = "—";
    }
}

function formatPrice(price) {
    if (!price || price <= 0) return "$0";
    if (price < 1e-6) return "$" + price.toExponential(2);
    if (price < 0.01) return "$" + price.toFixed(8);
    return "$" + price.toFixed(6);
}

function formatMoney(value) {
    if (!value || value <= 0) return "$0";
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
    if (value >= 1e3) return "$" + (value / 1e3).toFixed(1) + "K";
    return "$" + value.toFixed(0);
}

loadMarketData();
setInterval(loadMarketData, 60000);

/* =========================================
   SCROLL REVEAL
========================================= */
const revealEls = document.querySelectorAll(
    ".stat-card, .timeline-item, .token-row, .verify-card, .dist-card, .fact"
);

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealEls.forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(28px)";
        el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
        observer.observe(el);
    });
}

/* =========================================
   ACTIVE NAV LINK
========================================= */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

function updateActiveNav() {
    let current = "";

    sections.forEach((section) => {
        const top = section.offsetTop - 160;
        if (window.scrollY >= top) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
}

let scrollTimeout;
window.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveNav, 40);
}, { passive: true });

updateActiveNav();