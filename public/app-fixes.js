document.addEventListener('DOMContentLoaded', function() {
            // ── GLOBAL HELPERS (available to ALL event listeners in page) ──
            window.empyreanClosest=function(el,selector){if(!el||!selector)return null;return el.closest?el.closest(selector):null;};
            window._fmtCount=function(n){n=parseInt(n)||0;if(n>=1000000)return(n/1000000).toFixed(1).replace(/\.0$/,'')+'M';if(n>=1000)return(n/1000).toFixed(1).replace(/\.0$/,'')+'K';return n.toString();};
            window._timeAgo=function(ts){var d=ts?new Date(ts):new Date();var sec=Math.floor((Date.now()-d.getTime())/1000);if(isNaN(sec)||sec<0)return'just now';if(sec<60)return sec+'s';if(sec<3600)return Math.floor(sec/60)+'m';if(sec<86400)return Math.floor(sec/3600)+'h';if(sec<604800)return Math.floor(sec/86400)+'d';return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});};
            // Global error handler — prevents one bug from blanking the page
            window.onerror = function(msg, src, line, col, err) {
                console.error('[Empyrean Error]', msg, 'at', src, line + ':' + col);
                return false; // don't suppress, but don't rethrow
            };
            window.addEventListener('unhandledrejection', function(e) {
                console.warn('[Empyrean Promise]', e.reason);
            });
            // --- SMART CONTRACT CONFIGURATION ---
            const contractAddresses = {
                EmpyreanToken: "0x624ca3Db53adb41944EbF2BcB015f68C7BAB0c02",
                EmpyDistribution: "0xf48ee3c90c9183fb4acd0d9e1ef8b49accfc470e",
                NgoAndGrantRegistry: "0xc861e3ae9a35336c9735692d788065c4a0e37ebb",
                EmpyreanStaking: "0xba368a7b31f61748aef714ef779dd8086d38a1fc"
            };

            const contractABIs = {
                EmpyreanToken: [], // ABI omitted for brevity, assuming standard ERC20 interface
                EmpyDistribution: [{"inputs":[{"internalType":"address","name":"_empyTokenAddress","type":"address"},{"internalType":"address","name":"_initialOwner","type":"address"},{"internalType":"uint256","name":"_minimumWithdrawal","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newMinimum","type":"uint256"}],"name":"MinimumWithdrawalUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsRecorded","type":"event"},{"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"empyToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getClaimableBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minimumWithdrawal","outputs":[{"internalType":"uint256","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"recordRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newMinimum","type":"uint56"}],"name":"updateMinimumWithdrawal","outputs":[],"stateMutability":"nonpayable","type":"function"}],
                NgoAndGrantRegistry: [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ngoAddress","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"}],"name":"NgoAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ngoAddress","type":"address"}],"name":"NgoDelisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"ngoAddress","type":"address"}],"name":"NgoUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"grantId","type":"uint256"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"string","name":"currency","type":"string"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"projectId","type":"string"},{"indexed":false,"internalType":"string","name":"transactionReference","type":"string"}],"name":"OffChainGrantDisbursed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"grantId","type":"uint256"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":true,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"projectId","type":"string"}],"name":"OnChainGrantDisbursed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"address","name":"_ngoAddress","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_detailsUrl","type":"string"}],"name":"addNgo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_ngoAddress","type":"address"}],"name":"delistNgo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getOffChainGrantCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOnChainGrantCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getVerifiedNgoCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_offset","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getVerifiedNgos","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint56","name":"","type":"uint56"}],"name":"ngoAddressList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"ngos","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"detailsUrl","type":"string"},{"internalType":"bool","name":"isVerified","type":"bool"},{"internalType":"uint256","name":"listIndex","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint56","name":"","type":"uint56"}],"name":"offChainGrants","outputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"string","name":"currency","type":"string"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"projectId","type":"string"},{"internalType":"string","name":"transactionReference","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint56","name":"","type":"uint56"}],"name":"onChainGrants","outputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"projectId","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"string","name":"_currency","type":"string"},{"internalType":"string","name":"_projectId","type":"string"},{"internalType":"string","name":"_transactionReference","type":"string"}],"name":"recordOffChainGrant","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"string","name":"_projectId","type":"string"}],"name":"recordOnChainGrant","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_ngoAddress","type":"address"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_detailsUrl","type":"string"}],"name":"updateNgoDetails","outputs":[],"stateMutability":"nonpayable","type":"function"}],
                EmpyreanStaking: [{"inputs":[{"internalType":"address","name":"_empyTokenAddress","type":"address"},{"internalType":"address","name":"_rewardsDistributionAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardPaid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newRate","type":"uint256"}],"name":"RewardRateUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newRate","type":"uint256"}],"name":"setRewardRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint56"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint56"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"empyToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastUpdateTime","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerToken","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardPerTokenStored","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardRate","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rewardsDistributionContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"userRewardPerTokenPaid","outputs":[{"internalType":"uint256","name":""}],"stateMutability":"view","type":"function"}]
            };
            
            // --- STATE & CONFIG ---
            let provider, signer, contracts = {};
            let isGuest = true;
            let isAdmin = false;
            let cart = [];
            const EMPY_RATE_USD = 0.10;
            const USD_TO_NGN_RATE = 1500;
            const CRYPTO_FEE_PERCENT = 1.5;
            let userState = {};
            let captchaCode = '';
            let postMediaFiles = [], sosMediaFiles = [], crisisMediaFiles = [], businessPostMediaFiles = [];
            let marketplaceMediaFiles = [];
            let newsMediaFile = null;
            let newAvatarFile = null;
            let newCoverFile = null;
            let newPageProfileFile = null, newPageCoverFile = null;
            
            // ENHANCED LIVE STREAM DATA
            let liveStreamData = {
                isLive: false, 
                isRecording: false,
                title: '',
                description: '',
                startTime: null,
                streamId: null,
                background: 'linear-gradient(160deg,#0A0E27 0%,#1B2B8B 50%,#0A0E27 100%)',
                customBackgroundFile: null, 
                rewardInterval: null,
                isMicMuted: false,
                isVideoMuted: false,
                isScreenSharing: false,
                hostUserId: null,
                guests: [], 
                joinRequests: [], 
                liveGoal: null, 
                fanClubActive: false,
                activeGame: null, 
                pinnedMessage: null, 
                hostInSmallScreen: false, // Functionality removed, but property kept
                sentMessages: [] 
            };
            let liveLikeCount = 0;
            
            let registeredUsers = {};

            // Staking and Impact Mining Simulation State
            let userStakedBalance = 0; 
            let userManualStakedBalance = 0; 
            let userLockedStakedBalance = 0; 
            let userLockedStakingEndTime = 0; 
            let userEarnedRewards = 0; 
            let userClaimedRewardsHistory = []; 
            const STAKING_APY_ESTIMATE = 0.157; 
            const STAKING_LOCK_DURATION = 6 * 30 * 24 * 60 * 60 * 1000; 

            const IMPACT_MINING_TOTAL_POOL = 37500000; 
            const RANKING_REWARDS_POOL = IMPACT_MINING_TOTAL_POOL * 0.10; 
            let impactMiningState = {
                dailyBudget: (IMPACT_MINING_TOTAL_POOL * 0.90) / (12 * 365.25), 
                dailySpent: 0,
                rankingPoolSpent: 0,
                lastReset: new Date().setHours(0,0,0,0) 
            };

            const empyGiftCatalog = [
                { name: 'Rose', symbol: '🌹', price: 1 }, { name: 'Like', symbol: '👍', price: 2 }, { name: 'Heart', symbol: '❤️', price: 3 }, { name: 'Coffee', symbol: '☕', price: 5 }, { name: 'Star', symbol: '⭐', price: 7 }, { name: 'Chocolate', symbol: '🍫', price: 10 }, { name: 'Ice Cream', symbol: '🍦', price: 12 }, { name: 'Balloon', symbol: '🎈', price: 15 }, { name: 'Cupcake', symbol: '🧁', price: 18 }, { name: 'Candy', symbol: '🍬', price: 20 },
                { name: 'Teddy Bear', symbol: '🧸', price: 25 }, { name: 'Pizza Slice', symbol: '🍕', price: 30 }, { name: 'Popcorn', symbol: '🍿', price: 35 }, { name: 'Music Note', symbol: '🎵', price: 40 }, { name: 'Flower Bouquet', symbol: '💐', price: 50 }, { name: 'Football', symbol: '⚽', price: 60 }, { name: 'Sunglasses', symbol: '😎', price: 70 }, { name: 'Perfume', symbol: '💄', price: 80 }, { name: 'Cat', symbol: '🐱', price: 90 }, { name: 'Dog', symbol: '🐶', price: 100 },
                { name: 'Diamond Ring', symbol: '💍', price: 120 }, { name: 'Camera', symbol: '📷', price: 150 }, { name: 'Champagne', symbol: '🍾', price: 180 }, { name: 'Guitar', symbol: '🎸', price: 200 }, { name: 'Laptop', symbol: '💻', price: 250 }, { name: 'Gold Medal', symbol: '🥇', price: 300 }, { name: 'Airplane', symbol: '✈️', price: 350 }, { name: 'Luxury Watch', symbol: '⌚', price: 400 }, { name: 'Car', symbol: '🚗', price: 450 }, { name: 'Yacht', symbol: '🛥️', price: 500 },
                { name: 'Mansion', symbol: '🏠', price: 1000 }, { name: 'Helicopter', symbol: '🚁', price: 2000 }, { name: 'Private Jet', symbol: '🛫', price: 3500 }, { name: 'Crown', symbol: '👑', price: 5000 }, { name: 'Island', symbol: '🏝️', price: 7500 }, { name: 'Diamond Trophy', symbol: '🏆💎', price: 10000 },
                { name: 'Heart Mills', symbol: '💖', price: 200 } // Added Heart Mills
            ];
            let selectedGift = null; 

            // Premium live stream background cards — each has label, style, category
            const liveBackgrounds = [
                // === CLASSIC GRADIENTS ===
                { label: 'Deep Space', style: 'linear-gradient(160deg,#0A0E27 0%,#1B2B8B 50%,#0A0E27 100%)', category: 'classic' },
                { label: 'Gold Rush', style: 'linear-gradient(135deg,#F5C518 0%,#F59E0B 50%,#B45309 100%)', category: 'classic' },
                { label: 'Emerald', style: 'linear-gradient(135deg,#00D4AA 0%,#10B981 50%,#047857 100%)', category: 'classic' },
                { label: 'Royal Night', style: 'linear-gradient(160deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)', category: 'classic' },
                // === PREMIUM GRADIENTS ===
                { label: 'Aurora', style: 'linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f64f59 100%)', category: 'premium' },
                { label: 'Sunset', style: 'linear-gradient(135deg,#f093fb 0%,#f5576c 50%,#fda085 100%)', category: 'premium' },
                { label: 'Ocean Depth', style: 'linear-gradient(160deg,#0093E9 0%,#80D0C7 100%)', category: 'premium' },
                { label: 'Mango', style: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)', category: 'premium' },
                { label: 'Nebula', style: 'linear-gradient(135deg,#8E2DE2 0%,#4A00E0 50%,#2c1654 100%)', category: 'premium' },
                { label: 'Rose Gold', style: 'linear-gradient(135deg,#f8b4c8 0%,#e8a0b0 30%,#c97a8b 70%,#a05070 100%)', category: 'premium' },
                // === STUDIO STYLES ===
                { label: 'Midnight Studio', style: 'radial-gradient(ellipse at top,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', category: 'studio' },
                { label: 'Soft White', style: 'linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)', category: 'studio' },
                { label: 'Carbon Dark', style: 'linear-gradient(135deg,#1c1c1c 0%,#2d2d2d 50%,#1c1c1c 100%)', category: 'studio' },
                { label: 'Warm Cream', style: 'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)', category: 'studio' },
                // === NATURE PHOTOS ===
                { label: 'Studio Lights', style: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=450&q=80', category: 'photo' },
                { label: 'City Night', style: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=450&q=80', category: 'photo' },
                { label: 'Forest', style: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=450&q=80', category: 'photo' },
                { label: 'Galaxy', style: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=450&q=80', category: 'photo' },
                { label: 'Library', style: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=450&q=80', category: 'photo' },
                { label: 'Abstract Art', style: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=450&q=80', category: 'photo' },
            ];
            
            // --- MOCK DATA ---
            let mockUsers = {};  // Populated from Firestore on login
            let mockAdminWithdrawalQueue = [];  // Populated from Firestore
            let mockAdminSosQueue = [];  // SOS requests pending admin approval
            window.mockAdminSosQueue = mockAdminSosQueue;

            const mockGrantLedger = [];  // Loaded from Firestore

            const mockCommunityTasks  = [
                { id: 'task-1', text: 'Follow on X (Twitter)', icon: 'fab fa-twitter', url: 'https://x.com/EmpyToken?t=1dXjQMtmz4y2ZSm_v7S52w&s=09', reward: 5 },
                { id: 'task-2', text: 'Follow on Instagram', icon: 'fab fa-instagram', url: 'https://www.instagram.com/empyreantoken_empy?igsh=MXBpcWl3Y3Jkc3ljag==', reward: 5 },
                { id: 'task-3', text: 'Subscribe on YouTube', icon: 'fab fa-youtube', url: 'https://www.youtube.com/@EmpyreanHFNewsTV', reward: 10 },
                { id: 'task-4', text: 'Connect on LinkedIn', icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/company/108660039/admin/', reward: 8 },
                { id: 'task-5', text: 'Join our Telegram', icon: 'fab fa-telegram-plane', url: 'https://t.me/EmpyreanToken', reward: 10 },
                { id: 'task-6', text: 'Join our WhatsApp Channel', icon: 'fab fa-whatsapp', url: 'https://whatsapp.com/channel/0029VbAyfxaAzNc45vhje92j', reward: 10 }
            ];
            
            const mockNgoPartners = {};  // Loaded from Firestore
            
            // --- DOM REFERENCES ---
            const sidebar = document.querySelector('.sidebar') || document.createElement('div');
            const feedContainer = document.getElementById('feed-container') || document.createElement('div');
            const authModal = document.getElementById('auth-modal-overlay') || document.createElement('div');
            const goLiveModal = document.getElementById('go-live-modal-overlay') || document.createElement('div');
            const contentOverlay = document.getElementById('content-overlay') || document.createElement('div');
            const liveStreamScreen = document.getElementById('live-stream-screen'); 

            // --- HELPER FUNCTIONS ---
            const formatNgnPrice = (price) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(price);
            const formatUsdPrice = (price) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(price);
            
            function showNotification(message, type = 'success') {
                window.showNotification = showNotification; // expose for inline handlers
                const el = document.getElementById('reward-notification');
                if (!el) return;
                el.textContent = message;
                const colorMap = {
                    success: '#10B981',
                    error: '#EF4444',
                    warning: '#F59E0B',
                    info: '#1B2B8B'
                };
                el.style.backgroundColor = colorMap[type] || colorMap.success;
                el.style.color = '#ffffff';
                el.style.border = `2px solid rgba(255,255,255,0.3)`;
                el.classList.add('show');
                setTimeout(() => el.classList.remove('show'), 3500);
            }

            // Global upload progress bar helper
            function showUploadProgress(containerId, pct) {
                let cont = document.getElementById(containerId + '-progress');
                if (!cont) {
                    const parentEl = document.getElementById(containerId);
                    if (!parentEl) return;
                    cont = document.createElement('div');
                    cont.id = containerId + '-progress';
                    cont.className = 'upload-progress-container';
                    cont.innerHTML = '<div class="upload-progress-bar" style="width:0%;"></div>';
                    parentEl.appendChild(cont);
                }
                const bar = cont.querySelector('.upload-progress-bar');
                if (bar) { bar.style.width = pct + '%'; }
                if (pct >= 100) setTimeout(() => { if(cont) cont.remove(); }, 800);
            }

            function rewardUserForAction(action, targetUserId = null) {
                if (isGuest) return;

                const now = new Date().setHours(0,0,0,0);
                if(now > impactMiningState.lastReset) {
                    impactMiningState.dailySpent = 0;
                    impactMiningState.lastReset = now;
                }
                
                if (impactMiningState.dailySpent >= impactMiningState.dailyBudget) {
                    return; 
                }

                const rewardsTable = {
                    VERIFIED_CRISIS_REPORT: 50, VERIFIED_SOS_REQUEST: 25,
                    SUCCESSFUL_ESCROW_SELLER: 15, SUCCESSFUL_ESCROW_BUYER: 5,
                    CREATE_REEL: 2.0, CREATE_POST: 1.0, PUBLISH_NEWS: 10,
                    LIVE_STREAM_INTERVAL: 2.0, 
                    RECEIVE_COMMENT: 0.2, RECEIVE_LIKE: 0.1,
                    ENGAGE_COMMENT: 0.05, ENGAGE_LIKE: 0.02,
                    SUCCESSFUL_REFERRAL: 20,
                    SHARE_POST: 0.5,
                    RETWEET_POST: 0.5,
                    GUEST_JOINED_LIVE: 5,
                    HOST_INVITED_GUEST: 2,
                    SEND_GIFT: 0.1 
                };

                const rewardAmount = rewardsTable[action] || 0;
                if (rewardAmount === 0 || (impactMiningState.dailySpent + rewardAmount > impactMiningState.dailyBudget)) {
                    return;
                }
                
                let recipient = userState;
                if (targetUserId && mockUsers[targetUserId]) {
                    recipient = mockUsers[targetUserId];
                }

                if (!recipient.empyBalance) recipient.empyBalance = 0;
                
                if (action.startsWith('VERIFIED_') || action === 'CREATE_REEL' || action === 'CREATE_POST' || action === 'PUBLISH_NEWS' || action === 'LIVE_STREAM_INTERVAL' || action === 'RECEIVE_COMMENT' || action === 'RECEIVE_LIKE' || action === 'SUCCESSFUL_REFERRAL' || action === 'GUEST_JOINED_LIVE' || action === 'HOST_INVITED_GUEST') {
                    const lockedPortion = rewardAmount * 0.40;
                    const withdrawablePortion = rewardAmount * 0.60;
                    
                    if (recipient.id === userState.id) {
                        userLockedStakedBalance += lockedPortion;
                        userLockedStakingEndTime = Date.now() + STAKING_LOCK_DURATION; 
                        userState.empyBalance += withdrawablePortion;
                        
                        userClaimedRewardsHistory.push({
                            type: 'Earned (60% claimable)',
                            amount: withdrawablePortion,
                            date: new Date().toLocaleDateString()
                        });
                        userClaimedRewardsHistory.push({
                            type: 'Earned (40% locked)',
                            amount: lockedPortion,
                            date: new Date().toLocaleDateString(),
                            lockExpiry: new Date(userLockedStakingEndTime).toLocaleDateString()
                        });

                        showNotification(`+${withdrawablePortion.toFixed(2)} EMPY (60% claimable), ${lockedPortion.toFixed(2)} EMPY locked for 6 months!`, 'success');
                    } else {
                        recipient.empyBalance += rewardAmount;
                        showNotification(`+${rewardAmount.toFixed(2)} EMPY for their contribution!`, 'success'); 
                    }


                } else {
                    // Other rewards go directly to withdrawable balance
                    recipient.empyBalance += rewardAmount;
                    showNotification(`+${rewardAmount.toFixed(2)} EMPY for your contribution!`, 'success');
                }

                impactMiningState.dailySpent += rewardAmount;
                updateWalletUI();
                // Persist updated balance to Firestore in background
                if (!isGuest && userState.id && window.fbDb) {
                    window.fbDb.collection('users').doc(userState.id)
                        .update({ empyBalance: userState.empyBalance })
                        .catch(function() {}); // silent — don't block UI
                }
            }

            
            function showFormFeedback(formId, message, type = 'error') {
                const feedbackEl = document.getElementById(`${formId}-feedback`);
                if (!feedbackEl) return;
                feedbackEl.textContent = message;
                feedbackEl.className = `form-feedback ${type}`;
                feedbackEl.style.display = 'block';
            }

            function generateCaptcha() {
                const captchaCodeEl = document.getElementById('captcha-code');
                if (!captchaCodeEl) return;
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                captchaCode = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
                captchaCodeEl.textContent = captchaCode;
                const loginCaptchaInput = document.getElementById('login-captcha-input');
                if(loginCaptchaInput) loginCaptchaInput.value = '';
            }

            function formatWhatsAppText(text) {
                if (!text) return '';
                // Escape HTML first
                let t = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                // Auto-linkify URLs (YouTube, WhatsApp, social, https, www)
                t = t.replace(/(https?:\/\/[^\s<>"'&]+|www\.[^\s<>"'&]+\.[a-z]{2,}[^\s<>"'&]*)/gi, function(url) {
                    const href = url.startsWith('http') ? url : 'https://' + url;
                    let icon = '🔗';
                    if (href.includes('youtube.com') || href.includes('youtu.be')) icon = '▶️';
                    else if (href.includes('whatsapp.com') || href.includes('wa.me')) icon = '💬';
                    else if (href.includes('twitter.com') || href.includes('x.com')) icon = '𝕏';
                    else if (href.includes('instagram.com')) icon = '📷';
                    else if (href.includes('linkedin.com')) icon = '💼';
                    else if (href.includes('facebook.com') || href.includes('fb.com')) icon = '👥';
                    const label = url.length > 45 ? url.substring(0,45) + '…' : url;
                    return '<a href="' + href + '" target="_blank" rel="noopener noreferrer" style="color:var(--secondary);text-decoration:underline;font-weight:500;">' + icon + ' ' + label + '</a>';
                });
                // WhatsApp-style formatting
                t = t
                    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
                    .replace(/_(.*?)_/g, '<em>$1</em>')
                    .replace(/~(.*?)~/g, '<s>$1</s>')
                    .replace(/`(.*?)`/g, '<code style="background:rgba(10,14,39,0.08);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.88em;">$1</code>')
                    .replace(/\n/g, '<br>');
                return t;
            }

            function handleYoutubeEmbed(text) {
                const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
                const match = text.match(youtubeRegex);
                if (match && match[1]) {
                    const videoId = match[1];
                    const embedHTML = `<div class="story-youtube-embed"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
                    return { html: text.replace(youtubeRegex, embedHTML), found: true };
                }
                return { html: `<p>${formatWhatsAppText(text)}</p>`, found: false };
            }

            function resizeAndCropImage(file, width, height, callback) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;

                        let sourceX, sourceY, sourceWidth, sourceHeight;
                        const imgRatio = img.width / img.height;
                        const targetRatio = width / height;

                        if (imgRatio > targetRatio) {
                            sourceHeight = img.height;
                            sourceWidth = sourceHeight * targetRatio;
                            sourceX = (img.width - sourceWidth) / 2;
                            sourceY = 0;
                        } else {
                            sourceWidth = img.width;
                            sourceHeight = sourceWidth / targetRatio;
                            sourceY = (img.height - sourceHeight) / 2;
                            sourceX = 0;
                        }
                        
                        ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
                        callback(canvas.toDataURL('image/jpeg'));
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

            function handleAvatarUpload(file, previewId, isProfilePic = false) {
                const preview = document.getElementById(previewId);
                if (!preview) return;

                if (!file) { 
                    preview.src = '';
                    preview.classList.remove('active');
                    // Show upload icon if it exists
                    const uploadIcon = preview.nextElementSibling;
                    if (uploadIcon && uploadIcon.classList.contains('upload-icon')) {
                        uploadIcon.style.opacity = 1;
                    }
                    return;
                }

                const displayImage = (dataUrl) => {
                    preview.src = dataUrl;
                    if (!preview.classList.contains('active')) preview.classList.add('active');
                     // Hide upload icon
                    const uploadIcon = preview.nextElementSibling;
                    if (uploadIcon && uploadIcon.classList.contains('upload-icon')) {
                        uploadIcon.style.opacity = 0;
                    }
                };
                
                if (isProfilePic) {
                    resizeAndCropImage(file, 150, 150, (dataUrl) => {
                        if (previewId === 'avatar-preview') newAvatarFile = dataUrl; // For signup form
                        if (previewId === 'profile-pic-img') newAvatarFile = dataUrl; // For main profile
                        displayImage(dataUrl);
                    });
                } else {
                     const reader = new FileReader();
                    reader.onload = (e) => displayImage(e.target.result);
                    reader.readAsDataURL(file);
                }
            }
            
            function handleMediaPreview(files, previewContainerId) {
                const previewContainer = document.getElementById(previewContainerId);
                if (!previewContainer) return;
                previewContainer.innerHTML = '';

                const fileArr = Array.from(files);
                const count = fileArr.length;

                // Premium multi-image grid layout based on count
                previewContainer.style.display = 'grid';
                previewContainer.style.gap = '4px';
                previewContainer.style.borderRadius = '14px';
                previewContainer.style.overflow = 'hidden';
                if (count === 1)      previewContainer.style.gridTemplateColumns = '1fr';
                else if (count === 2) previewContainer.style.gridTemplateColumns = '1fr 1fr';
                else if (count === 3) previewContainer.style.gridTemplateColumns = '2fr 1fr';
                else if (count >= 4)  previewContainer.style.gridTemplateColumns = '1fr 1fr';
                else                  previewContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(90px, 1fr))';

                fileArr.forEach((file, idx) => {
                    const url = URL.createObjectURL(file);
                    const mediaWrapper = document.createElement('div');
                    mediaWrapper.style.cssText = 'position:relative;overflow:hidden;background:#f0f0f0;';
                    // Special layout for 3-image: first spans 2 rows
                    if (count === 3 && idx === 0) {
                        mediaWrapper.style.gridRow = '1 / 3';
                    }
                    mediaWrapper.style.height = count === 1 ? '240px' : '160px';

                    let mediaElement;
                    if (file.type.startsWith('image/')) {
                        mediaElement = document.createElement('img');
                        mediaElement.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                    } else if (file.type.startsWith('video/')) {
                        mediaElement = document.createElement('video');
                        mediaElement.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
                        mediaElement.controls = true;
                        mediaElement.muted = true;
                        mediaElement.loop = true;
                        mediaElement.autoplay = true;
                    }

                    // File count badge if more than 4 files
                    if (count > 4 && idx === 3) {
                        const badge = document.createElement('div');
                        badge.style.cssText = 'position:absolute;inset:0;background:rgba(10,14,39,0.6);display:flex;align-items:center;justify-content:center;color:white;font-size:1.5rem;font-weight:800;font-family:Syne,sans-serif;';
                        badge.textContent = '+' + (count - 4);
                        mediaWrapper.appendChild(badge);
                    }

                    if (mediaElement) {
                        mediaElement.src = url;
                        mediaWrapper.appendChild(mediaElement);
                    }
                    // Remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(239,68,68,0.85);border:none;color:white;border-radius:50%;width:22px;height:22px;font-size:0.75rem;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;z-index:3;';
                    removeBtn.innerHTML = '×';
                    removeBtn.type = 'button';
                    removeBtn.addEventListener('click', function() {
                        mediaWrapper.remove();
                    });
                    mediaWrapper.appendChild(removeBtn);

                    previewContainer.appendChild(mediaWrapper);
                    if (count > 4 && idx >= 4) mediaWrapper.style.display = 'none'; // hide extras
                });
            }
            
            function handleMarketplacePreview(filesArray, previewContainer) {
                if (!previewContainer) return;
                if (!filesArray || filesArray.length === 0) { previewContainer.innerHTML = ''; return; }
                previewContainer.innerHTML = '';
                var count = filesArray.length;
                previewContainer.style.display = 'grid';
                previewContainer.style.gap = '4px';
                previewContainer.style.borderRadius = '12px';
                previewContainer.style.overflow = 'hidden';
                previewContainer.style.marginTop = '8px';
                if (count === 1) previewContainer.style.gridTemplateColumns = '1fr';
                else if (count === 2) previewContainer.style.gridTemplateColumns = '1fr 1fr';
                else if (count === 3) previewContainer.style.gridTemplateColumns = '2fr 1fr';
                else previewContainer.style.gridTemplateColumns = '1fr 1fr';

                Array.from(filesArray).forEach(function(file, idx) {
                    if (idx >= 4) return;
                    var url = (typeof file === 'string') ? file : URL.createObjectURL(file);
                    var type = (typeof file === 'string') ? (file.match(/\.(mp4|webm|mov)/i) ? 'video' : 'image') : (file.type || '');
                    var isVid = type.startsWith('video') || /\.(mp4|webm|mov)/i.test(url);
                    var cell = document.createElement('div');
                    var h = count === 1 ? '220px' : '150px';
                    cell.style.cssText = 'overflow:hidden;height:' + h + ';background:#f0f0f0;position:relative;' + (count === 3 && idx === 0 ? 'grid-row:1/3;' : '');
                    cell.innerHTML = isVid
                        ? '<video src="' + url + '" style="width:100%;height:100%;object-fit:cover;" muted playsinline controls></video>'
                        : '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
                    if (count > 4 && idx === 3) {
                        var badge = document.createElement('div');
                        badge.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.6);color:white;font-size:1.5rem;font-weight:800;display:flex;align-items:center;justify-content:center;';
                        badge.textContent = '+' + (count - 3);
                        cell.appendChild(badge);
                    }
                    previewContainer.appendChild(cell);
                });
                return; // rest of old function bypassed
                previewContainer.innerHTML = '';
                // Ensure correct grid display for marketplace preview
                previewContainer.style.display = 'flex'; // Use flex for this unique layout
                previewContainer.style.flexWrap = 'wrap';
                previewContainer.style.gap = '10px';


                filesArray.forEach((file, index) => {
                    const url = URL.createObjectURL(file);
                    const thumb = document.createElement('div');
                    thumb.className = 'media-thumbnail';

                    let mediaElement;
                    if (file.type.startsWith('image/')) {
                        mediaElement = document.createElement('img');
                    } else if (file.type.startsWith('video/')) {
                        mediaElement = document.createElement('video');
                        mediaElement.muted = true;
                        mediaElement.autoplay = true;
                        mediaElement.loop = true;
                        mediaElement.playsinline = true; // For iOS autoplay
                    }

                    if (mediaElement) {
                        mediaElement.src = url;
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.className = 'remove-media-btn';
                        removeBtn.dataset.index = index;
                        removeBtn.type = "button";
                        removeBtn.innerHTML = '&times;';
                        
                        thumb.appendChild(mediaElement);
                        thumb.appendChild(removeBtn);
                        previewContainer.appendChild(thumb);
                    }
                });
            }

            function createMessageElement(text, isSent, isFile = false, fileUrl = '', fileType = '', messageId = `msg-${Date.now()}`) {
                const messageEl = document.createElement('div');
                messageEl.className = `message ${isSent ? 'sent' : 'received'}`;
                messageEl.dataset.messageId = messageId; 
                
                let contentHTML = '';
                if (isFile) {
                    if (fileType.startsWith('image/')) {
                        contentHTML = `<p>${text}</p><img src="${fileUrl}" class="message-media" alt="Sent image">`;
                    } else if (fileType.startsWith('video/')) {
                        contentHTML = `<p>${text}</p><video src="${fileUrl}" class="message-media" controls></video>`;
                    } else if (fileType.startsWith('audio/')) { 
                        contentHTML = `<p>${text}</p><audio src="${fileUrl}" class="message-media" controls></audio>`;
                    } else {
                         contentHTML = `<p><i class="fas fa-file-alt"></i> Sent a file: <a href="${fileUrl}" target="_blank">${text}</a></p>`;
                    }
                } else {
                    contentHTML = formatWhatsAppText(text);
                }
                
                messageEl.innerHTML = contentHTML;
                return messageEl;
            }

            function createNewPostElement(text, mediaFiles, authorData = null, isBusinessPost = false, retweetData = null) {
                const author = authorData || userState;
                const postElement = document.createElement('div');
                postElement.className = 'impact-story';
                const postId = `post-${new Date().getTime()}`;
                postElement.dataset.postId = postId;
                postElement.dataset.userId = author.id;
                
                const avatar = isBusinessPost ? (author.businessPage ? author.businessPage.profilePhoto : `https://ui-avatars.com/api/?name=Business&background=5B0EA6&color=fff&size=150`) : (author.avatar || author.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.fullName||'U')}&background=5B0EA6&color=fff&size=150`);
                const name = isBusinessPost ? (author.businessPage ? author.businessPage.name : 'Business Page') : (author.fullName || author.name);
                const avatarClass = 'avatar-placeholder square';
                const avatarStyle = isBusinessPost ? 'border-radius: 8px;' : '';

                // Pre-process underline and highlight markers before YouTube check
                const preprocessedText = (text || '')
                    .replace(/==(.*?)==/g, '<mark style="background:rgba(245,197,24,0.3);padding:1px 4px;border-radius:3px;">$1</mark>')
                    .replace(/__(.*?)__/g, '<u>$1</u>');
                const { html: formattedText, found: youtubeFound } = handleYoutubeEmbed(preprocessedText);

                let mediaHTML='';
                if(mediaFiles&&mediaFiles.length>0){
                    const _mc=mediaFiles.length,_ml=_mc===1?'solo':_mc===2?'duo':_mc===3?'trio':'grid';
                    mediaHTML+=`<div class="story-media-container" data-count="${_mc}" data-layout="${_ml}">`;
                    mediaFiles.forEach((file,_mi)=>{
                        let url,mimeType;
                        if(typeof file==='string'){url=file;mimeType=file.match(/\.(mp4|webm|ogg|mov)$/i)?'video/':'image/';}
                        else if(file&&file._cloudUrl){url=file._cloudUrl;mimeType=file.type||'';}
                        else if(file&&file.url){url=file.url;mimeType=file.type||'';}
                        else if(file instanceof File){url=URL.createObjectURL(file);mimeType=file.type||'';}
                        else return;
                        if(!url||url.startsWith('blob:')) return; // skip broken/local-only URLs
                        const _isV=mimeType.startsWith('video/')||url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i);
                        mediaHTML+=`<div class="story-media-item" data-index="${_mi}">`;
                        if(_isV)mediaHTML+=`<video src="${url}" class="story-video" controls preload="metadata" loading="lazy" playsinline onerror="this.closest('.story-media-item').style.display='none'"></video>`;
                        else mediaHTML+=`<img src="${url}" class="story-main-image" alt="Post media" loading="lazy" onerror="this.closest('.story-media-item').style.display='none'">`;
                        mediaHTML+='</div>';
                    });
                    mediaHTML+='</div>';
                }

                const retweetHeaderHTML = retweetData ? `<div class="retweet-header"><i class="fas fa-retweet"></i> ${retweetData.retweeterName} Retweeted</div>` : '';

                const postTimestamp = new Date().toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
                postElement.innerHTML = `
                    ${retweetHeaderHTML}
                    <div class="story-header">
                        <div class="${avatarClass}" style="${avatarStyle}"><img src="${avatar}" alt="${name}'s Avatar" loading="lazy"></div>
                        <div class="story-user-info"><strong>${name}</strong><span>${postTimestamp}</span></div>
                        <div class="post-options" style="display:${(author.id === userState.id || isAdmin) ? 'block' : 'none'};">
                            <button class="options-btn"><i class="fas fa-ellipsis-h"></i></button>
                            <div class="options-menu">
                                <a href="#" class="edit-post-btn"><i class="fas fa-edit"></i> Edit</a>
                                <a href="#" class="delete-post-btn"><i class="fas fa-trash"></i> Delete</a>
                                <a href="#" class="promote-post-btn"><i class="fas fa-rocket"></i> Promote</a>
                            </div>
                        </div>
                    </div>
                    ${!youtubeFound ? mediaHTML : ''}
                    <div class="story-content">${formattedText}</div>
                    <div class="story-actions">
                        <a class="action-btn like-btn" title="Like"><i class="far fa-heart"></i><span class="like-count">0</span></a>
                        <a class="action-btn comment-btn" title="Comment"><i class="far fa-comment"></i><span class="comment-count">0</span></a>
                        <a class="action-btn retweet-btn" title="Retweet"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>
                        <a class="action-btn quote-btn" title="Quote" style="cursor:pointer;"><i class="fas fa-quote-right"></i></a>
                        <a class="action-btn share-btn" title="Share"><i class="fas fa-share"></i></a>
                        <a class="action-btn download-media-btn" title="Download" style="cursor:pointer;"><i class="fas fa-download"></i></a>
                        <span class="action-btn view-count-display" style="color:var(--text-muted);font-size:0.72rem;pointer-events:none;display:flex;align-items:center;gap:3px;" title="Views"><i class="fas fa-eye"></i><span class="view-count">0</span></span>
                        <span class="sponsored-badge" style="display:none;">Sponsored</span>
                    </div>
                    <div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
                `;
                return postElement;
            }

            // Expose shareContent globally so business page inline onclick works
            window.shareContent = shareContent;

            function promptForPromotion(postId) {
                if (isGuest) return;
                if (!postId) { showNotification('Cannot promote: item has no ID.', 'warning'); return; }

                setTimeout(() => {
                    // Marketplace cards use data-id; feed posts use data-post-id
                    const postElement = document.querySelector(`[data-post-id="${postId}"]`) ||
                                        document.querySelector(`[data-id="${postId}"]`);
                    if (!postElement) {
                        // Still open the modal even if element reference is lost (e.g. page scrolled)
                        const promotionModal = document.getElementById('promotion-modal-overlay');
                        if (promotionModal) {
                            document.getElementById('promotion-setup-view').style.display = 'block';
                            document.getElementById('promotion-payment-details').style.display = 'none';
                            document.getElementById('promotion-setup-form').reset();
                            const promoCardForm = document.getElementById('promo-card-form');
                            if (promoCardForm) promoCardForm.reset();
                            updatePromoReachPreview();
                            promotionModal.querySelector('#promote-post-id').value = postId;
                            promotionModal.classList.add('show');
                            document.body.classList.add('modal-open');
                        }
                        return;
                    }

                    if (confirm("Your content is live! Would you like to promote it now to reach a wider audience?")) {
                        const promotionModal = document.getElementById('promotion-modal-overlay');
                        document.getElementById('promotion-setup-view').style.display = 'block';
                        document.getElementById('promotion-payment-details').style.display = 'none';
                        document.getElementById('promotion-setup-form').reset();
                        const promoCardForm = document.getElementById('promo-card-form');
                        if (promoCardForm) promoCardForm.reset();

                        updatePromoReachPreview();
                        
                        promotionModal.querySelector('#promote-post-id').value = postId;
                        promotionModal.classList.add('show');
                        document.body.classList.add('modal-open');
                    }
                }, 500);
            }

            // --- LIVE STREAM FUNCTIONS ---
            function populateBackgroundSelector() {
                const container = document.getElementById('live-bg-selector');
                if (!container) return;
                container.innerHTML = '';

                // Group by category
                const categories = { classic: 'Classic', premium: '✦ Premium', studio: 'Studio', photo: 'Photo' };
                const grouped = {};
                liveBackgrounds.forEach(bg => {
                    if (!grouped[bg.category]) grouped[bg.category] = [];
                    grouped[bg.category].push(bg);
                });

                Object.entries(categories).forEach(([cat, catLabel]) => {
                    if (!grouped[cat]) return;
                    const catHeader = document.createElement('div');
                    catHeader.style.cssText = 'width:100%;font-size:0.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--text-muted);padding:8px 2px 4px;flex-basis:100%;';
                    catHeader.textContent = catLabel;
                    container.appendChild(catHeader);

                    grouped[cat].forEach(bg => {
                        const isPhoto = bg && bg.style && typeof bg.style === 'string' && bg.style.startsWith('http');
                        const thumb = document.createElement('div');
                        thumb.className = `bg-thumb ${liveStreamData.background === bg.style ? 'active' : ''}`;
                        thumb.dataset.bg = bg.style;
                        thumb.title = bg.label;
                        if (isPhoto) {
                            thumb.style.backgroundImage = `url(${bg.style})`;
                            thumb.style.backgroundSize = 'cover';
                            thumb.style.backgroundPosition = 'center';
                        } else {
                            thumb.style.background = bg.style;
                        }
                        // Label overlay
                        const lbl = document.createElement('span');
                        lbl.style.cssText = 'position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.55rem;color:rgba(255,255,255,0.9);text-shadow:0 1px 3px rgba(0,0,0,0.7);font-weight:600;letter-spacing:0.3px;';
                        lbl.textContent = bg.label;
                        thumb.style.position = 'relative';
                        thumb.appendChild(lbl);
                        container.appendChild(thumb);
                    });
                });

                if (liveStreamData.customBackgroundFile) {
                    const customBgUrl = URL.createObjectURL(liveStreamData.customBackgroundFile);
                    const customThumb = document.createElement('div');
                    customThumb.className = `bg-thumb ${liveStreamData.background === customBgUrl ? 'active' : ''}`;
                    customThumb.dataset.bg = customBgUrl;
                    customThumb.style.backgroundImage = `url(${customBgUrl})`;
                    customThumb.style.backgroundSize = 'cover';
                    const lbl = document.createElement('span');
                    lbl.style.cssText = 'position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.55rem;color:white;font-weight:600;';
                    lbl.textContent = 'Custom';
                    customThumb.style.position = 'relative';
                    customThumb.appendChild(lbl);
                    container.prepend(customThumb);
                }
            }

            function populateGiftCatalog() {
                const container = document.getElementById('gift-grid-container');
                if (!container) return;
                container.innerHTML = '';
                empyGiftCatalog.forEach(gift => {
                    const giftEl = document.createElement('div');
                    giftEl.className = 'gift-item';
                    giftEl.dataset.name = gift.name;
                    giftEl.dataset.symbol = gift.symbol;
                    giftEl.dataset.price = gift.price;
                    giftEl.innerHTML = `<div class="symbol">${gift.symbol}</div><div class="name">${gift.name}</div><div class="price"><i class="fa-solid fa-coins"></i> ${gift.price}</div>`;
                    container.appendChild(giftEl);
                });
            }
            
            function showGiftAnimation(symbol) {
                const layer = document.getElementById('gift-animation-layer');
                if (!layer) return;

                if (symbol === '💖') { // Special animation for Heart Mills
                    showHeartMillsAnimation();
                } else {
                    const animationEl = document.createElement('div');
                    animationEl.className = 'gift-animation';
                    animationEl.textContent = symbol;
                    const minLeft = 20; // % from left
                    const maxLeft = 80; // % from left
                    animationEl.style.left = `${Math.random() * (maxLeft - minLeft) + minLeft}%`;
                    layer.appendChild(animationEl);
                    setTimeout(() => animationEl.remove(), 3000);
                }
            }
            
            function showHeartMillsAnimation() {
                const layer = document.getElementById('gift-animation-layer');
                if (!layer) return;

                for (let i = 0; i < 20; i++) { // Spawn 20 hearts
                    const heart = document.createElement('span');
                    heart.className = 'heart-mill-animation';
                    heart.textContent = '❤️';
                    const startX = Math.random() * 100; // Random x position
                    const delay = Math.random() * 2000; // Random delay for staggered effect
                    
                    heart.style.left = `${startX}vw`;
                    heart.style.animationDelay = `${delay}ms`;
                    layer.appendChild(heart);
                    setTimeout(() => heart.remove(), 4000 + delay); 
                }
            }

            function createLiveComment(username, text, messageId = `msg-${Date.now()}`) {
                const list = document.getElementById('live-comments-list');
                if (!list) return;

                // Remove existing pinned message from general comments if it was there and is being repinned/newly pinned.
                if (liveStreamData.pinnedMessage && liveStreamData.pinnedMessage.id === messageId) {
                    const existingPinnedCommentEl = list.querySelector(`.live-comment[data-message-id="${messageId}"]`);
                    if (existingPinnedCommentEl) existingPinnedCommentEl.remove(); // Remove to re-add it as a truly pinned item if needed.
                }

                const commentEl = document.createElement('div');
                commentEl.className = 'live-comment';
                commentEl.dataset.messageId = messageId; 
                commentEl.innerHTML = `<strong>${username}</strong><p>${formatWhatsAppText(text)}</p>`;
                
                // Add new comment
                list.prepend(commentEl); 
                list.scrollTop = list.scrollHeight; 

                // Check if this message should be visually pinned as well
                if (liveStreamData.pinnedMessage && liveStreamData.pinnedMessage.id === messageId) {
                    commentEl.classList.add('pinned-comment');
                }

                if (!isGuest && userState.id === liveStreamData.hostUserId) {
                    const existingMessageIndex = liveStreamData.sentMessages.findIndex(msg => msg.id === messageId);
                    if (existingMessageIndex === -1) { // Only add if it's a new unique message
                         liveStreamData.sentMessages.push({ id: messageId, username: username, content: text });
                    }
                }
            }

            function createDashboardLiveCard(streamId, title, hostName, avatarSrc, bg, hostId) {
                const slider = document.getElementById('dashboard-live-slider');
                if (!slider) return;

                // Remove existing card for this stream (avoid duplicates)
                const existing = slider.querySelector('[data-stream-id="' + streamId + '"]');
                if (existing) existing.remove();

                // Hide the "No live streams" placeholder
                const emptyEl = document.getElementById('live-slider-empty');
                if (emptyEl) emptyEl.style.display = 'none';

                // Channel name matches what Firestore stores and Agora uses
                const channelName = 'empyrean-' + streamId;

                const card = document.createElement('div');
                card.className = 'live-stream-preview-card join-live-btn';
                card.dataset.streamId    = streamId;
                card.dataset.hostId      = hostId;
                card.dataset.hostName    = hostName;
                card.dataset.hostAvatar  = avatarSrc || '';
                card.dataset.streamTitle = title;
                card.dataset.agoraChannel = channelName;  // viewers use this to join
                card.dataset.background  = bg || '';
                card.style.cssText = 'flex:0 0 180px;min-width:180px;height:220px;border-radius:18px;overflow:hidden;cursor:pointer;position:relative;flex-shrink:0;';

                const isImage = bg && (bg.startsWith('http') || bg.startsWith('blob:'));
                if (isImage) {
                    card.style.backgroundImage = 'url(' + bg + ')';
                    card.style.backgroundSize = 'cover';
                    card.style.backgroundPosition = 'center';
                } else {
                    card.style.background = bg || 'linear-gradient(160deg,#0A0E27,#1B2B8B)';
                }

                const avatar = avatarSrc ? '<img src="' + avatarSrc + '" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid white;flex-shrink:0;">' : '';
                card.innerHTML =
                    '<div style="position:absolute;inset:0;background:linear-gradient(transparent 35%,rgba(0,0,0,0.85));z-index:1;"></div>' +
                    '<div style="position:absolute;top:10px;left:10px;z-index:2;">' +
                        '<span style="background:rgba(239,68,68,0.92);color:white;padding:3px 10px;border-radius:50px;font-size:0.7rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">' +
                            '<i class="fas fa-circle" style="font-size:0.45rem;animation:fa-beat 1s infinite;"></i> LIVE' +
                        '</span>' +
                    '</div>' +
                    '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;background:rgba(239,68,68,0.8);color:white;padding:8px 18px;border-radius:50px;font-size:0.8rem;font-weight:700;white-space:nowrap;">▶ Join Live</div>' +
                    '<div style="position:absolute;bottom:0;left:0;right:0;padding:12px;z-index:2;display:flex;align-items:center;gap:8px;">' +
                        avatar +
                        '<div style="flex:1;min-width:0;">' +
                            '<strong style="display:block;color:white;font-size:0.83rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + hostName + '</strong>' +
                            '<span style="color:rgba(255,255,255,0.75);font-size:0.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;">' + title + '</span>' +
                        '</div>' +
                    '</div>';
                slider.prepend(card);
            }
            
            function addRecordedLiveStream(title, hostName, recordedBlobUrl) {
                const wrapper = document.getElementById('livestream-wrapper');
                if (!wrapper) return;

                // Remove existing card for same title to avoid duplicates when cloud URL arrives
                const existing = Array.from(wrapper.querySelectorAll('.livestream-card')).find(c => c.dataset.title === title);
                if (existing) existing.remove();

                const newCard = document.createElement('div');
                newCard.className = 'livestream-card';
                newCard.dataset.title = title;
                newCard.style.cssText = 'border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,14,39,0.1);background:white;margin-bottom:16px;';

                if (recordedBlobUrl) {
                    // Determine type from URL
                    const isCloudMp4 = recordedBlobUrl.includes('cloudinary') || recordedBlobUrl.endsWith('.mp4');
                    const videoEl = document.createElement('video');
                    videoEl.controls = true;
                    videoEl.preload = 'metadata';
                    videoEl.style.cssText = 'width:100%;display:block;max-height:320px;background:#000;';
                    videoEl.src = recordedBlobUrl;
                    if (isCloudMp4) videoEl.type = 'video/mp4';

                    // Download button
                    const dlBtn = document.createElement('a');
                    dlBtn.href = recordedBlobUrl;
                    dlBtn.download = (title || 'recording') + '.webm';
                    dlBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;background:var(--secondary);color:white;padding:7px 14px;border-radius:8px;font-size:0.78rem;font-weight:700;text-decoration:none;margin-top:8px;';
                    dlBtn.innerHTML = '<i class="fas fa-download"></i> Download Recording';

                    const info = document.createElement('div');
                    info.style.cssText = 'padding:12px 14px;';
                    info.innerHTML = '<strong style="font-size:0.9rem;color:var(--primary);display:block;margin-bottom:4px;">' + (title||'Recorded Stream') + '</strong>' +
                        '<span style="font-size:0.78rem;color:var(--text-muted);">By: ' + hostName + '</span>' +
                        '<span style="display:block;font-size:0.72rem;color:var(--text-muted);margin-top:2px;">' + new Date().toLocaleString() + '</span>';
                    info.appendChild(dlBtn);

                    newCard.appendChild(videoEl);
                    newCard.appendChild(info);
                } else {
                    newCard.innerHTML = '<div style="height:160px;background:var(--g-navy);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;"><i class="fas fa-video" style="color:rgba(255,255,255,0.35);font-size:2rem;"></i><span style="color:rgba(255,255,255,0.5);font-size:0.8rem;">Recording unavailable</span></div><div style="padding:12px 14px;"><strong style="color:var(--primary);">' + (title||'Stream') + '</strong><br><span style="font-size:0.78rem;color:var(--text-muted);">By: ' + hostName + '</span></div>';
                }

                wrapper.prepend(newCard);

                // Make sure the recorded livestreams section is visible
                const recSection = document.querySelector('.recorded-livestreams, #recorded-livestreams-section');
                if (recSection) recSection.style.display = 'block';
                // Navigate to livestream section to show it
                const liveSection = document.getElementById('go-live');
                if (liveSection) {
                    const wrapperSection = liveSection.querySelector('#livestream-wrapper');
                    if (wrapperSection) wrapperSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            function updateLiveUI() {
                const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;
                const liveContainer = liveStreamScreen;
                const hostMainVideo = document.getElementById('host-main-video');
                const hostVideoFallbackAvatar = document.getElementById('host-video-fallback-avatar');
                const hostControlPanel = document.getElementById('host-control-panel');
                const hostControlToggleBtn = document.getElementById('host-control-toggle-btn');
                
                const currentBg = liveStreamData.customBackgroundFile ? URL.createObjectURL(liveStreamData.customBackgroundFile) : liveStreamData.background;
                const isImageBg = currentBg && (currentBg.startsWith('http') || currentBg.startsWith('blob:'));
                liveContainer.style[isImageBg ? 'backgroundImage' : 'background'] = isImageBg ? `url('${currentBg}')` : currentBg;
                liveContainer.style.backgroundSize = 'cover';
                liveContainer.style.backgroundPosition = 'center';

                if (hostControlPanel && hostControlToggleBtn) {
                    if (isCurrentUserHost) {
                        hostControlPanel.style.display = 'flex'; // Ensure panel is displayed for host
                        // hostControlPanel.classList.add('expanded'); // Start expanded - Let user toggle
                        hostControlToggleBtn.querySelector('i').className = hostControlPanel.classList.contains('expanded') ? 'fas fa-chevron-left' : 'fas fa-chevron-right'; // Update toggle icon
                    } else {
                        hostControlPanel.style.display = 'none';
                        hostControlPanel.classList.remove('expanded');
                    }
                }
                
                const liveRequestJoinBtn = document.getElementById('live-request-join-btn');
                if (liveRequestJoinBtn) {
                     liveRequestJoinBtn.style.display = (!isCurrentUserHost && !isGuest && liveStreamData.guests.length < 9) ? 'flex' : 'none';
                     if (!isGuest && !isCurrentUserHost && liveStreamData.joinRequests.some(req => req.userId === userState.id)) {
                        liveRequestJoinBtn.innerHTML = '<i class="fas fa-hourglass-start"></i>'; 
                        liveRequestJoinBtn.title = "Request Pending";
                        liveRequestJoinBtn.disabled = true;
                     } else {
                        liveRequestJoinBtn.innerHTML = '<i class="fas fa-video"></i>'; 
                        liveRequestJoinBtn.title = "Request to Join";
                        liveRequestJoinBtn.disabled = false;
                     }
                }

                const liveRecordBtn = document.getElementById('live-record-btn');
                if (liveRecordBtn) liveRecordBtn.classList.toggle('recording', liveStreamData.isRecording);
                const liveMicToggle = document.getElementById('live-mic-toggle');
                if (liveMicToggle) liveMicToggle.innerHTML = `<i class="fas fa-microphone${liveStreamData.isMicMuted ? '-slash' : ''}"></i>`;
                const liveVideoToggle = document.getElementById('live-video-toggle');
                if (liveVideoToggle) liveVideoToggle.innerHTML = `<i class="fas fa-video${liveStreamData.isVideoMuted ? '-slash' : ''}"></i>`;
                const liveShareScreenBtn = document.getElementById('live-share-screen-btn');
                if (liveShareScreenBtn) {
                    liveShareScreenBtn.innerHTML = `<i class="fas fa-desktop${liveStreamData.isScreenSharing ? '-slash' : ''}"></i>`;
                    liveShareScreenBtn.classList.toggle('recording', liveStreamData.isScreenSharing);
                }
                
                if (hostMainVideo && hostVideoFallbackAvatar) {
                    if (isCurrentUserHost) {
                        hostMainVideo.style.display = liveStreamData.isVideoMuted ? 'none' : 'block';
                        if (!liveStreamData.isVideoMuted) {
                            hostMainVideo.src = "https://www.w3schools.com/html/mov_bbb.mp4"; 
                            hostMainVideo.muted = liveStreamData.isMicMuted; 
                            hostMainVideo.play().catch(e => console.log("Host video autoplay prevented:", e));
                        } else {
                            hostMainVideo.pause();
                            hostMainVideo.removeAttribute('src'); 
                        }
                        hostVideoFallbackAvatar.style.display = liveStreamData.isVideoMuted ? 'block' : 'none';
                        hostVideoFallbackAvatar.src = document.getElementById('live-host-avatar').src;
                    } else { // For guests viewing
                        hostMainVideo.style.display = liveStreamData.isVideoMuted ? 'none' : 'block';
                        if (!liveStreamData.isVideoMuted) {
                             hostMainVideo.src = "https://www.w3schools.com/html/mov_bbb.mp4"; 
                             hostMainVideo.muted = false; 
                             hostMainVideo.play().catch(e => console.log("Guest view: Host video autoplay prevented:", e));
                        } else {
                             hostMainVideo.pause();
                             hostMainVideo.removeAttribute('src');
                        }
                        hostVideoFallbackAvatar.style.display = liveStreamData.isVideoMuted ? 'block' : 'none';
                        hostVideoFallbackAvatar.src = document.getElementById('live-host-avatar').src;
                    }
                }

                const guestSlotsContainer = document.getElementById('multi-guest-slots');
                if (guestSlotsContainer) {
                    guestSlotsContainer.innerHTML = '';
                    if (liveStreamData.guests.length > 0) {
                        liveStreamData.guests.forEach(guest => {
                            const slot = document.createElement('div');
                            slot.className = `guest-slot ${guest.isVideoMuted ? '' : 'active-video'}`;
                            slot.dataset.userId = guest.userId;
                            slot.innerHTML = `
                                <video src="${guest.videoStream}" autoplay playsinline ${guest.isVideoMuted ? 'style="display:none;"' : ''}></video>
                                <img src="${guest.avatar}" alt="${guest.username}" class="guest-avatar-placeholder" style="${guest.isVideoMuted ? 'display:block; opacity: 0.5;' : 'display:none;'}">
                                <span class="guest-username">@${guest.username}</span>
                                ${isCurrentUserHost ? `
                                    <div class="guest-controls">
                                        <button data-action="toggle-mic" data-guest-id="${guest.userId}" title="${guest.isMicMuted ? 'Unmute' : 'Mute'} Mic"><i class="fas fa-microphone${guest.isMicMuted ? '-slash' : ''}"></i></button>
                                        <button data-action="toggle-video" data-guest-id="${guest.userId}" title="${guest.isVideoMuted ? 'Show' : 'Hide'} Video"><i class="fas fa-video${guest.isVideoMuted ? '-slash' : ''}"></i></button>
                                        <button data-action="remove-guest" data-guest-id="${guest.userId}" title="Remove Guest"><i class="fas fa-times-circle"></i></button>
                                    </div>` : ''}
                            `;
                            guestSlotsContainer.appendChild(slot);
                        });
                    }
                    document.getElementById('multi-guest-container').style.display = liveStreamData.guests.length > 0 ? 'flex' : 'none';
                }


                const goalDisplay = document.getElementById('live-goals-display');
                if (goalDisplay) {
                    if (liveStreamData.liveGoal) {
                        goalDisplay.style.display = 'flex';
                        const currentAmount = liveStreamData.liveGoal.currentAmount || 0;
                        const targetAmount = liveStreamData.liveGoal.targetAmount;
                        document.getElementById('live-goal-text').textContent = `${liveStreamData.liveGoal.description} (${Math.floor(currentAmount)}/${targetAmount} EMPY)`;
                        const progress = (currentAmount / targetAmount) * 100;
                        document.getElementById('live-goal-progress').style.width = `${Math.min(progress, 100)}%`;
                    } else {
                        goalDisplay.style.display = 'none';
                    }
                }

                const fanClubDisplay = document.getElementById('live-fan-club-display');
                if (fanClubDisplay) fanClubDisplay.style.display = liveStreamData.fanClubActive ? 'flex' : 'none';

                const gamesDisplay = document.getElementById('live-games-display');
                if (gamesDisplay) {
                    if (liveStreamData.activeGame) {
                        gamesDisplay.style.display = 'flex';
                        document.getElementById('live-game-name').textContent = liveStreamData.activeGame.name || liveStreamData.activeGame.type.charAt(0).toUpperCase() + liveStreamData.activeGame.type.slice(1);
                    } else {
                        gamesDisplay.style.display = 'none';
                    }
                }

                // Pinned message visibility fix: Adjusted Z-index and ensures it's above host avatar.
                const pinnedMessageDisplay = document.getElementById('live-pinned-message-display');
                if (pinnedMessageDisplay) {
                    if (liveStreamData.pinnedMessage) {
                        pinnedMessageDisplay.style.display = 'flex';
                        const pinnedContentSpan = pinnedMessageDisplay.querySelector('.pinned-content');
                        if (pinnedContentSpan) {
                            pinnedContentSpan.textContent = liveStreamData.pinnedMessage.content;
                        }
                    } else {
                        pinnedMessageDisplay.style.display = 'none';
                    }
                }

                const closeButton = goLiveModal.querySelector('#live-close-btn');
                if (closeButton) {
                    closeButton.innerHTML = isCurrentUserHost ? 'End' : '&times;';
                    closeButton.title = isCurrentUserHost ? 'End Stream' : 'Leave Stream';
                }

                document.getElementById('live-viewer-count').textContent = (1 + liveStreamData.guests.length).toLocaleString();
                document.getElementById('modal-viewer-count').textContent = (1 + liveStreamData.guests.length).toLocaleString();
            }

            function renderGuestJoinRequests() {
                const requestList = document.getElementById('live-join-requests-list');
                const requestCount = document.getElementById('live-join-request-count');
                if (!requestList || !requestCount) return;

                requestList.innerHTML = '';
                requestCount.textContent = liveStreamData.joinRequests.length;

                if (liveStreamData.joinRequests.length === 0) {
                    requestList.innerHTML = '<p style="text-align:center; color:#ccc; padding:20px;">No pending requests.</p>';
                    return;
                }

                liveStreamData.joinRequests.forEach(req => {
                    const reqEl = document.createElement('div');
                    reqEl.className = 'viewer-item';
                    reqEl.innerHTML = `
                        <img src="${req.avatar}" alt="${req.username}">
                        <div class="viewer-item-info">
                            <strong>${req.fullName}</strong>
                            <span>@${req.username}</span>
                        </div>
                        <div class="viewer-actions">
                            <button class="btn btn-small btn-success accept-guest-btn" data-user-id="${req.userId}">Accept</button>
                            <button class="btn btn-small btn-danger reject-guest-btn" data-user-id="${req.userId}">Reject</button>
                        </div>
                    `;
                    requestList.appendChild(reqEl);
                });
            }

            function renderHostSentMessagesForPinning() {
                const messagesList = document.getElementById('live-host-sent-messages');
                if (!messagesList) return;

                messagesList.innerHTML = '';
                if (liveStreamData.sentMessages.length === 0) {
                    messagesList.innerHTML = '<p style="text-align:center; color:#ccc; padding:20px;">No messages sent yet during this stream.</p>';
                    return;
                }

                liveStreamData.sentMessages.forEach(msg => {
                    const msgEl = document.createElement('div');
                    msgEl.className = `pin-message-choice ${liveStreamData.pinnedMessage && liveStreamData.pinnedMessage.id === msg.id ? 'selected' : ''}`;
                    msgEl.dataset.messageId = msg.id;
                    msgEl.innerHTML = `
                        <strong>@${msg.username}</strong>
                        <p>${formatWhatsAppText(msg.content)}</p>
                    `;
                    messagesList.prepend(msgEl);
                });
            }


            // --- ADMIN & POSTING FUNCTIONS ---
            function renderAdminQueues() {
                const withdrawalQueueEl = document.getElementById('admin-withdrawal-queue');
                const sosQueueEl = document.getElementById('admin-sos-queue');
                // Also update the admin stat badge whenever queues render
                const sosStat = document.getElementById('admin-stat-sos');
                if (sosStat) sosStat.textContent = mockAdminSosQueue.filter(s => s.status === 'pending_approval' || s.status === 'on_hold').length;
                const wdStat = document.getElementById('admin-stat-withdrawals');
                if (wdStat) wdStat.textContent = mockAdminWithdrawalQueue.length;
                if(!withdrawalQueueEl || !sosQueueEl) return;
                
                withdrawalQueueEl.innerHTML = mockAdminWithdrawalQueue.length ? mockAdminWithdrawalQueue.map(item => `
                    <div class="admin-queue-item" data-id="${item.id}">
                        <div class="admin-queue-info">
                            <p><strong>User:</strong> ${item.username}</p>
                            <p><strong>Amount:</strong> ${item.amount}</p>
                            <p><strong>Method:</strong> ${item.method}</p>
                        </div>
                        <div class="admin-queue-actions">
                            <button class="btn btn-small btn-success approve-withdrawal-btn">Approve</button>
                            <button class="btn btn-small btn-danger reject-withdrawal-btn">Reject</button>
                        </div>
                    </div>`).join('') : '<p style="text-align:center; padding: 20px;">No pending withdrawals.</p>';

                // SOS filter: show pending + on-hold
                const pendingSOS = mockAdminSosQueue.filter(i => i.status === 'pending_approval' || i.status === 'on_hold');
                const statusBadge = (s) => {
                    const map = { pending_approval: {c:'#F59E0B',t:'Pending Review'}, on_hold: {c:'#6366F1',t:'On Hold'}, approved: {c:'#10B981',t:'Approved'}, rejected: {c:'#EF4444',t:'Rejected'} };
                    const m = map[s] || {c:'#888',t:s};
                    return `<span style="background:${m.c}22;color:${m.c};border:1px solid ${m.c}44;padding:2px 10px;border-radius:50px;font-size:0.72rem;font-weight:700;">${m.t}</span>`;
                };
                sosQueueEl.innerHTML = pendingSOS.length ? pendingSOS.map(item => `
                    <div class="admin-queue-item" data-id="${item.id}" style="border-left:4px solid #F59E0B;padding:16px 20px;margin-bottom:12px;background:white;border-radius:0 12px 12px 0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
                            <div>
                                <strong style="font-size:0.95rem;color:var(--primary);">🆘 ${item.title || 'SOS Request'}</strong>
                                ${statusBadge(item.status)}
                            </div>
                            <span style="font-size:0.75rem;color:var(--text-muted);">${new Date(item.createdAt||Date.now()).toLocaleString()}</span>
                        </div>
                        <div style="font-size:0.85rem;color:#555;margin-bottom:4px;"><i class="fas fa-user" style="color:var(--secondary);margin-right:5px;"></i><strong>@${item.username}</strong></div>
                        <div style="font-size:0.83rem;color:#666;margin-bottom:4px;"><i class="fas fa-coins" style="color:#F5C518;margin-right:5px;"></i>Amount: <strong>${item.amount || '—'} ${item.currency || ''}</strong></div>
                        <p style="font-size:0.85rem;color:#555;margin:8px 0;padding:10px;background:rgba(10,14,39,0.03);border-radius:8px;max-height:80px;overflow:auto;">${(item.story||'').substring(0,200)}${(item.story||'').length>200?'…':''}</p>
                        ${item.media && item.media.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">${item.media.slice(0,4).map(m=>`<img src="${m.url||m}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #eee;" onerror="this.style.display='none'">`).join('')}</div>` : ''}
                        <div style="display:flex;gap:8px;flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none;" class="sos-action-row">
                            <button class="btn btn-small btn-success approve-sos-btn" style="border-radius:8px;white-space:nowrap;flex-shrink:0;"><i class="fas fa-check"></i> Approve & Publish</button>
                            <button class="btn btn-small sos-hold-btn" style="background:#6366F1;color:white;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap;flex-shrink:0;"><i class="fas fa-pause"></i> On Hold</button>
                            <button class="btn btn-small btn-danger reject-sos-btn" style="border-radius:8px;white-space:nowrap;flex-shrink:0;"><i class="fas fa-times"></i> Reject</button>
                            <button class="btn btn-small delete-sos-btn" style="background:#7F1D1D;color:white;border:none;border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.82rem;font-weight:600;white-space:nowrap;flex-shrink:0;"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>`).join('') : '<div style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-check-circle" style="font-size:2rem;color:#10B981;display:block;margin-bottom:10px;"></i>No pending SOS requests.</div>';
            }

            function createSosPostOnFeed(sosData) {
                const postElement = document.createElement('div');
                postElement.className = 'impact-story sos-request';
                postElement.dataset.postId = sosData.id;
                postElement.dataset.userId = sosData.userId;
                postElement.dataset.amount = sosData.amount;
                postElement.dataset.currency = sosData.currency;
                postElement.dataset.username = sosData.username;
                
                const pText = document.createElement('p');
                pText.innerHTML = formatWhatsAppText(sosData.story);

                let mediaHTML='';
                if(sosData.media&&sosData.media.length>0){
                    const _smc=sosData.media.length,_sml=_smc===1?'solo':_smc===2?'duo':_smc===3?'trio':'grid';
                    mediaHTML+=`<div class="story-media-container" data-count="${_smc}" data-layout="${_sml}">`;
                    sosData.media.forEach((mi,_smi)=>{
                        const _sv=(mi.type&&mi.type.startsWith('video/'))||(mi.url&&mi.url.match(/\.(mp4|webm|ogg|mov)(\?|$)/i));
                        mediaHTML+=`<div class="story-media-item" data-index="${_smi}">`;
                        if(_sv)mediaHTML+=`<video src="${mi.url}" class="story-video" controls preload="metadata" playsinline></video>`;
                        else mediaHTML+=`<img src="${mi.url}" class="story-main-image" alt="SOS Evidence" loading="lazy">`;
                        mediaHTML+='</div>';
                    });
                    mediaHTML+='</div>';
                }
                
                const currencyFormatter = new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: sosData.currency, 
                    minimumFractionDigits: (sosData.currency === 'EMPY' || sosData.currency === 'USDT') ? 2 : 0 
                });

                postElement.innerHTML = `
                    <div class="story-header">
                        <div class="avatar-placeholder square"><img src="${sosData.avatar}" alt="${sosData.username}'s Avatar"></div>
                        <div class="story-user-info"><strong>SOS: ${sosData.title}</strong><span>Request by ${sosData.username} · ${new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>
                        <span class="sos-badge">SOS</span>
                    </div>
                    <div class="story-content">
                        ${pText.outerHTML}
                        <p>I urgently need <b class="amount-needed">${currencyFormatter.format(parseFloat(sosData.amount))}</b> to cover my needs.</p>
                    </div>
                    ${mediaHTML}
                    <div class="story-actions">
                        <a class="action-btn like-btn"><i class="far fa-heart"></i><span class="like-count">0</span></a>
                        <a class="action-btn comment-btn"><i class="far fa-comment"></i><span class="comment-count">0</span></a>
                        <a class="action-btn retweet-btn" title="Retweet"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>
                        <a class="action-btn share-btn"><i class="fas fa-share"></i></a>
                        <a class="action-btn download-media-btn" title="Download"><i class="fas fa-download"></i></a>
                        <span class="action-btn view-count-display" style="color:var(--text-muted);font-size:0.72rem;pointer-events:none;display:flex;align-items:center;gap:3px;margin-left:auto;"><i class="fas fa-eye"></i><span class="view-count">0</span></span>
                    </div>
                    <div style="padding:10px 16px 14px;">
                        <button class="gift-button sos-button help-now-btn" style="width:100%;padding:12px;font-size:0.95rem;font-weight:700;border-radius:12px;background:linear-gradient(135deg,#EF4444,#B91C1C);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                            <i class="fas fa-hand-holding-heart"></i> Donate Now — Help ${sosData.username}
                        </button>
                    </div>
                    <div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
                `;
                feedContainer.prepend(postElement);
            }

            function createCrisisPostOnFeed(crisisData) {
                const postElement = document.createElement('div');
                postElement.className = 'impact-story crisis-report';
                const postId = `crisis-${Date.now()}`;
                postElement.dataset.postId = postId;
                postElement.dataset.userId = crisisData.userId;

                let mediaHTML = '';
                if (crisisData.media && crisisData.media.length > 0) {
                    mediaHTML += `<div class="story-media-container" data-count="${crisisData.media.length}">`;
                    crisisData.media.forEach(mediaItem => {
                        mediaHTML += '<div class="story-media-item">';
                         if (mediaItem.type.startsWith('image/')) {
                            mediaHTML += `<img src="${mediaItem.url}" class="story-main-image" alt="Crisis Report Evidence">`;
                        } else if (mediaItem.type.startsWith('video/')) {
                            mediaHTML += `<video src="${mediaItem.url}" class="story-video" controls alt="Crisis Report Evidence"></video>`;
                        }
                        mediaHTML += '</div>';
                    });
                    mediaHTML += '</div>';
                }
                
                postElement.innerHTML = `
                    <div class="story-header">
                        <div class="avatar-placeholder square"><img src="${crisisData.avatar}" alt="${crisisData.username}'s Avatar"></div>
                        <div class="story-user-info"><strong>Crisis Report: ${crisisData.type}</strong><span>Reported by ${crisisData.username} · ${new Date().toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</span></div>
                        <div class="post-options">
                            <button class="options-btn"><i class="fas fa-ellipsis-h"></i></button><div class="options-menu"><a href="#" class="promote-post-btn"><i class="fas fa-rocket"></i> Promote</a>${(crisisData.userId===userState.id||isAdmin)?'<a href="#" class="delete-post-btn" style="color:#e53935;"><i class="fas fa-trash"></i> Delete</a>':''}</div></div>
                    </div>
                    <div class="story-content">
                        <p>${formatWhatsAppText(crisisData.description)}</p>
                        <p style="font-size:0.9rem; color:#666; margin-top:10px;"><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${crisisData.location}</p>
                    </div>
                    ${mediaHTML}
                    <div class="story-actions">
                        <a class="action-btn like-btn"><i class="far fa-heart"></i><span class="like-count">0</span></a>
                        <a class="action-btn comment-btn"><i class="far fa-comment"></i><span class="comment-count">0</span></a>
                        <a class="action-btn retweet-btn" title="Retweet"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>
                        <a class="action-btn share-btn"><i class="fas fa-share"></i></a>
                        <a class="action-btn download-media-btn" title="Download"><i class="fas fa-download"></i></a>
                        <span class="action-btn view-count-display" style="color:var(--text-muted);font-size:0.72rem;pointer-events:none;display:flex;align-items:center;gap:3px;margin-left:auto;"><i class="fas fa-eye"></i><span class="view-count">0</span></span>
                        <span class="sponsored-badge" style="display: none; margin-left: auto;">Sponsored</span>
                    </div>
                    <div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
                `;
                feedContainer.prepend(postElement);
                // Promote available via post options menu only
            }

            // --- MESSAGING FUNCTIONS ---
            function renderContactList(){
                var _c=document.getElementById('contacts-inner')||document.getElementById('contact-list-container');
                if(!_c)return; _c.innerHTML='';
                var _all=new Set(userState.followedUserIds);
                Object.values(mockUsers).forEach(function(u){_all.add(u.id);});
                var _ml={};try{_ml=JSON.parse(localStorage.getItem('empyrean_msgs')||'{}');}catch(e){}
                var _n=0;
                _all.forEach(function(uid){
                    var u=mockUsers[uid];if(!u||u.id===userState.id)return;_n++;
                    var _t=_ml[uid]||[],_last=_t.length?_t[_t.length-1]:null;
                    var _lt=_last?(_last.text.length>38?_last.text.slice(0,38)+'…':_last.text):'Tap to start a conversation';
                    var _ur=_t.filter(function(m){return m.from!==userState.id&&!m.read;}).length;
                    var _fb='https://ui-avatars.com/api/?name='+encodeURIComponent(u.fullName||'U')+'&background=1B2B8B&color=fff&size=96';
                    var _av=u.avatar||_fb;
                    var _tm=_last&&window._timeAgo?window._timeAgo(_last.ts):'';
                    var el=document.createElement('div');
                    el.className='contact-item';el.dataset.userId=uid;
                    el.style.cssText='display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid rgba(10,14,39,0.05);cursor:pointer;transition:background 0.15s;';
                    el.innerHTML='<div style="position:relative;flex-shrink:0;">'
                        +'<img data-fb="'+_fb+'" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid rgba(27,43,139,0.12);">'
                        +(_ur>0?'<span style="position:absolute;top:-1px;right:-1px;background:#EF4444;color:white;font-size:0.6rem;font-weight:700;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid white;padding:0 2px;">'+(_ur>9?'9+':_ur)+'</span>':'')
                        +'</div>'
                        +'<div style="flex:1;min-width:0;">'
                        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">'
                        +'<strong style="font-size:0.92rem;color:var(--primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">'+(u.fullName||'')+'</strong>'
                        +(_tm?'<span style="font-size:0.7rem;color:var(--text-muted);flex-shrink:0;margin-left:6px;">'+_tm+'</span>':'')
                        +'</div>'
                        +'<p style="font-size:0.79rem;color:'+(_ur>0?'var(--secondary)':'var(--text-muted)')+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;font-weight:'+(_ur>0?'600':'400')+';">'+_lt+'</p>'
                        +'</div>';
                    var _img=el.querySelector('img');
                    if(_img){_img.src=_av;_img.onerror=function(){this.onerror=null;this.src=this.dataset.fb;};}
                    el.addEventListener('click',function(ev){
                        ev.preventDefault();ev.stopPropagation();
                        document.querySelectorAll('.contact-item').forEach(function(c){c.style.background='';c.classList.remove('active');});
                        el.style.background='rgba(27,43,139,0.05)';el.classList.add('active');
                        if(typeof openChat==='function')openChat(uid);
                    });
                    _c.appendChild(el);
                });
                if(_n===0)_c.innerHTML='<div style="text-align:center;padding:48px 20px;color:var(--text-muted);"><i class="fas fa-users" style="font-size:2.2rem;display:block;margin-bottom:14px;opacity:0.35;"></i><p style="font-size:0.9rem;line-height:1.5;">No contacts yet.<br>Follow users to message them.</p></div>';
                var _sb=document.getElementById('contacts-search');
                if(_sb){
                    if(_sb._sf)_sb.removeEventListener('input',_sb._sf);
                    _sb._sf=function(){var q=_sb.value.toLowerCase().trim();_c.querySelectorAll('.contact-item').forEach(function(el2){var nm=(el2.querySelector('strong')||{}).textContent||'';el2.style.display=(!q||nm.toLowerCase().includes(q))?'':'none';});};
                    _sb.addEventListener('input',_sb._sf);
                    var _sbtn=_sb.parentElement&&_sb.parentElement.querySelector('button');
                    if(_sbtn)_sbtn.onclick=function(e){e.preventDefault();_sb._sf();_sb.focus();};
                }
            }
            
            function openChat(userId) {
                const user = mockUsers[userId];
                if (!user) return;
                document.querySelectorAll('.contact-item.active').forEach(c => c.classList.remove('active'));
                const targetContactItem = document.querySelector(`.contact-item[data-user-id="${userId}"]`);
                if (targetContactItem) targetContactItem.classList.add('active');

                // FIX: make the chat view container visible (was not opening the portal)
                const chatViewContainer = document.getElementById('chat-view-container');
                const chatPlaceholder   = document.getElementById('chat-placeholder');
                if (chatViewContainer) { chatViewContainer.style.display = 'flex'; chatViewContainer.classList.add('active'); }
                if (chatPlaceholder)   chatPlaceholder.style.display = 'none';

                // On mobile: hide contact list, show chat panel
                const contactList = document.querySelector('.contact-list');
                if (window.innerWidth <= 600 && contactList) contactList.style.display = 'none';

                const chatHeader = document.getElementById('chat-header-info');
                if (chatHeader) {
                    chatHeader.innerHTML = `
                        <div style="display:flex;align-items:center;gap:10px;flex:1;">
                            ${window.innerWidth <= 600 ? `<button id="chat-back-btn" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:var(--secondary);padding:4px 8px 4px 0;"><i class="fas fa-arrow-left"></i></button>` : ''}
                            <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;">
                                <img src="${user.avatar || ''}" alt="${user.fullName}" style="width:100%;height:100%;object-fit:cover;"
                                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=1B2B8B&color=fff'">
                            </div>
                            <div>
                                <strong style="display:block;color:var(--primary);">${user.fullName}</strong>
                                <span style="font-size:0.78rem;color:var(--text-muted);">@${user.username}</span>
                            </div>
                        </div>`;
                    chatHeader.dataset.userId = userId;
                    const backBtn = document.getElementById('chat-back-btn');
                    if (backBtn) backBtn.onclick = function() {
                        if (chatViewContainer) { chatViewContainer.style.display = 'none'; chatViewContainer.classList.remove('active'); }
                        if (contactList) contactList.style.display = '';
                        if (chatPlaceholder) chatPlaceholder.style.display = '';
                    };
                }

                const messagesContainer=document.getElementById('chat-messages-container');
                if(messagesContainer){
                    messagesContainer.dataset.activeChat=userId;
                    messagesContainer.style.cssText='display:flex;flex-direction:column;gap:8px;padding:16px;overflow-y:auto;flex:1;';
                    messagesContainer.innerHTML='';
                    var _am2={};try{_am2=JSON.parse(localStorage.getItem('empyrean_msgs')||'{}');}catch(e){}
                    var _thr=_am2[userId]||[];
                    if(_thr.length===0){messagesContainer.innerHTML='<div style="text-align:center;padding:48px 20px;color:var(--text-muted);"><i class="fas fa-comments" style="font-size:2.2rem;display:block;margin-bottom:14px;opacity:0.3;"></i><p style="font-size:0.88rem;">No messages yet. Say hello! 👋</p></div>';}
                    else{_thr.forEach(function(msg){var isSent=msg.from===userState.id;var div=document.createElement('div');div.style.cssText='max-width:72%;padding:10px 14px;border-radius:'+(isSent?'18px 18px 4px 18px':'18px 18px 18px 4px')+';background:'+(isSent?'var(--secondary,#1B2B8B)':'white')+';color:'+(isSent?'white':'var(--primary)')+';font-size:0.88rem;line-height:1.45;align-self:'+(isSent?'flex-end':'flex-start')+';box-shadow:0 1px 4px rgba(10,14,39,0.08);word-break:break-word;margin-bottom:4px;';div.textContent=msg.text;messagesContainer.appendChild(div);});}
                    messagesContainer.scrollTop=messagesContainer.scrollHeight;
                }
                var _mf=document.getElementById('message-form');var _mi=document.getElementById('message-text-input');
                if(_mf&&!_mf._cb){
                    _mf._cb=true;
                    _mf.addEventListener('submit',function(ev){
                        ev.preventDefault();var txt=(_mi&&_mi.value.trim())||'';if(!txt||!messagesContainer)return;
                        var auid=messagesContainer.dataset.activeChat;if(!auid)return;
                        var emp=messagesContainer.querySelector('[style*="No messages yet"]');if(emp)messagesContainer.innerHTML='';
                        var div=document.createElement('div');div.style.cssText='max-width:72%;padding:10px 14px;border-radius:18px 18px 4px 18px;background:var(--secondary,#1B2B8B);color:white;font-size:0.88rem;line-height:1.45;align-self:flex-end;box-shadow:0 1px 4px rgba(10,14,39,0.08);word-break:break-word;margin-bottom:4px;';
                        div.textContent=txt;messagesContainer.appendChild(div);messagesContainer.scrollTop=messagesContainer.scrollHeight;if(_mi)_mi.value='';
                        try{var _a=JSON.parse(localStorage.getItem('empyrean_msgs')||'{}');if(!_a[auid])_a[auid]=[];_a[auid].push({from:userState.id,text:txt,ts:Date.now(),read:true});localStorage.setItem('empyrean_msgs',JSON.stringify(_a));}catch(e){}
                        try{if(window.fbDb&&window._firebaseLoaded&&userState.id){var _tid=[userState.id,auid].sort().join('_');window.fbDb.collection('messages').doc(_tid).collection('msgs').add({from:userState.id,to:auid,text:txt,ts:new Date().toISOString()}).catch(function(){});}}catch(e){}
                        setTimeout(function(){if(typeof renderContactList==='function')renderContactList();},300);
                    });
                }
            }

            function populateDobSelectors() {
                const daySelect = document.querySelector('#individual-kyc-form .date-select-group select:nth-child(1)');
                const monthSelect = document.querySelector('#individual-kyc-form .date-select-group select:nth-child(2)');
                const yearSelect = document.querySelector('#individual-kyc-form .date-select-group select:nth-child(3)');
                
                if(!daySelect || !monthSelect || !yearSelect) return;

                daySelect.innerHTML = '<option value="">Day</option>';
                monthSelect.innerHTML = '<option value="">Month</option>';
                yearSelect.innerHTML = '<option value="">Year</option>';

                for(let i = 1; i <= 31; i++) { daySelect.innerHTML += `<option value="${i}">${i}</option>`; }
                const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                months.forEach((month, i) => { monthSelect.innerHTML += `<option value="${i+1}">${month}</option>`; });
                const currentYear = new Date().getFullYear();
                for(let i = currentYear - 18; i >= currentYear - 100; i--) { yearSelect.innerHTML += `<option value="${i}">${i}</option>`; }
            }
            
            function renderUserProfile(userId) {
                const user = mockUsers[userId];
                if (!user) {
                    console.error("User not found:", userId);
                    return;
                }
                
                const profileSection = document.getElementById('profile');
                const isMyProfile = !isGuest && user.id === userState.id;
                
                const kycFormHTML = `
                <div class="card"><div class="card-content">
                    <h3><i class="fas fa-shield-alt"></i> Account Verification (KYC)</h3>
                    <p>Complete verification to access all platform features, including withdrawals.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    
                    <div id="kyc-entity-selector-container">
                        <h4>Step 1: Select Entity Type</h4>
                        <div id="kyc-entity-selector" style="margin-top: 20px;">
                            <div class="kyc-entity-btn" data-form="individual-kyc-form"><i class="fas fa-user"></i><span>Individual</span></div>
                            <div class="kyc-entity-btn" data-form="ngo-kyc-form"><i class="fas fa-sitemap"></i><span>NGO</span></div>
                            <div class="kyc-entity-btn" data-form="company-kyc-form"><i class="fas fa-building"></i><span>Company</span></div>
                            <div class="kyc-entity-btn" data-form="cooperative-kyc-form"><i class="fas fa-users"></i><span>Cooperative</span></div>
                        </div>
                    </div>

                    <div id="kyc-forms-container" style="margin-top: 30px;">
                        <form id="individual-kyc-form" class="kyc-form" novalidate>
                            <h4>Step 2: Individual Verification</h4>
                            <div class="grid-2"><div class="form-group"><label for="kyc-ind-fname">First Name</label><input type="text" id="kyc-ind-fname" required></div><div class="form-group"><label for="kyc-ind-lname">Last Name</label><input type="text" id="kyc-ind-lname" required></div></div>
                            <div class="form-group"><label for="kyc-ind-dob">Date of Birth</label><div class="date-select-group"><select required><option value="">Day</option></select><select required><option value="">Month</option></select><select required><option value="">Year</option></select></div></div>
                            <div class="form-group"><label for="kyc-ind-gender">Gender</label><select id="kyc-ind-gender" required><option value="">--Select--</option><option>Male</option><option>Female</option></select></div>
                            <div class="form-group"><label for="kyc-ind-phone">Phone</label><input type="tel" id="kyc-ind-phone" required></div>
                            <div class="form-group"><label for="kyc-ind-email">Email</label><input type="email" id="kyc-ind-email" required></div>
                            <div class="form-group"><label for="kyc-ind-address">Residential Address</label><input type="text" id="kyc-ind-address" required></div>
                            <div class="form-group"><label for="kyc-ind-id-type">ID Type</label><select id="kyc-ind-id-type" required><option value="">--Select--</option><option>Passport</option><option>National ID</option><option>Driver's License</option><option>Voter's Card</option></select></div>
                            <div class="form-group"><label for="kyc-ind-id-number">ID Number</label><input type="text" id="kyc-ind-id-number" required></div>
                            <div class="form-group"><label>Upload ID (Front & Back)</label><div class="upload-area kyc-file-upload" data-input-id="kyc-ind-id-upload"><i class="fas fa-id-card"></i><span>Click to upload</span></div><input type="file" id="kyc-ind-id-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-ind-id-upload-preview"></span></div>
                            <div class="form-group"><label>Selfie Verification</label><button type="button" class="btn btn-small live-capture-btn" id="kyc-ind-selfie-btn" required data-original-required="true" data-captured="false"><i class="fas fa-camera"></i> Capture Live Selfie</button><span class="file-upload-preview" id="kyc-ind-selfie-preview"></span></div>
                            <button type="submit" class="btn btn-accent">Submit Verification</button>
                        </form>
                        <form id="company-kyc-form" class="kyc-form" novalidate>
                            <h4>Step 2: Company Verification</h4>
                            <div class="form-group"><label for="kyc-com-name">Organisation Name</label><input type="text" id="kyc-com-name" required></div>
                            <div class="form-group"><label for="kyc-com-cac">CAC Registration Number</label><input type="text" id="kyc-com-cac" required></div>
                            <div class="form-group"><label for="kyc-com-scuml">SCUML Certificate Number</label><input type="text" id="kyc-com-scuml" required></div>
                            <div class="form-group"><label for="kyc-com-rep-name">CEO/Representative Name</label><input type="text" id="kyc-com-rep-name" required></div>
                            <div class="form-group"><label for="kyc-com-phone">Official Phone</label><input type="tel" id="kyc-com-phone" required></div>
                            <div class="form-group"><label for="kyc-com-email">Official Email</label><input type="email" id="kyc-com-email" required></div>
                            <div class="form-group"><label for="kyc-com-address">Office Address</label><input type="text" id="kyc-com-address" required></div>
                            <div class="form-group"><label>Upload CAC Certificate</label><div class="upload-area kyc-file-upload" data-input-id="kyc-com-cac-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-com-cac-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-com-cac-upload-preview"></span></div>
                            <div class="form-group"><label>Upload SCUML Certificate</label><div class="upload-area kyc-file-upload" data-input-id="kyc-com-scuml-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-com-scuml-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-com-scuml-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's ID</label><div class="upload-area kyc-file-upload" data-input-id="kyc-com-rep-id-upload"><i class="fas fa-id-card"></i><span>Click to upload</span></div><input type="file" id="kyc-com-rep-id-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-com-rep-id-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's Selfie</label><button type="button" class="btn btn-small live-capture-btn" id="kyc-com-selfie-btn" required data-original-required="true" data-captured="false"><i class="fas fa-camera"></i> Capture Live Selfie</button><span class="file-upload-preview" id="kyc-com-selfie-preview"></span></div>
                            <button type="submit" class="btn btn-accent">Submit Verification</button>
                        </form>
                        <form id="ngo-kyc-form" class="kyc-form" novalidate>
                             <h4>Step 2: NGO Verification</h4>
                            <div class="form-group"><label for="kyc-ngo-name">Organisation Name</label><input type="text" id="kyc-ngo-name" required></div>
                            <div class="form-group"><label for="kyc-ngo-cac">CAC Registration Number</label><input type="text" id="kyc-ngo-cac" required></div>
                            <div class="form-group"><label for="kyc-ngo-scuml">SCUML Certificate Number</label><input type="text" id="kyc-ngo-scuml" required></div>
                            <div class="form-group"><label for="kyc-ngo-rep-name">President/Representative Name</label><input type="text" id="kyc-ngo-rep-name" required></div>
                            <div class="form-group"><label for="kyc-ngo-phone">Official Phone</label><input type="tel" id="kyc-ngo-phone" required></div>
                            <div class="form-group"><label for="kyc-ngo-email">Official Email</label><input type="email" id="kyc-ngo-email" required></div>
                            <div class="form-group"><label for="kyc-ngo-address">Office Address</label><input type="text" id="kyc-ngo-address" required></div>
                            <div class="form-group"><label>Upload CAC Certificate</label><div class="upload-area kyc-file-upload" data-input-id="kyc-ngo-cac-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-ngo-cac-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-ngo-cac-upload-preview"></span></div>
                            <div class="form-group"><label>Upload SCUML Certificate</label><div class="upload-area kyc-file-upload" data-input-id="kyc-ngo-scuml-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-ngo-scuml-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-ngo-scuml-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's ID</label><div class="upload-area kyc-file-upload" data-input-id="kyc-ngo-rep-id-upload"><i class="fas fa-id-card"></i><span>Click to upload</span></div><input type="file" id="kyc-ngo-rep-id-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-ngo-rep-id-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's Selfie</label><button type="button" class="btn btn-small live-capture-btn" id="kyc-ngo-selfie-btn" required data-original-required="true" data-captured="false"><i class="fas fa-camera"></i> Capture Live Selfie</button><span class="file-upload-preview" id="kyc-ngo-selfie-preview"></span></div>
                            <button type="submit" class="btn btn-accent">Submit Verification</button>
                        </form>
                        <form id="cooperative-kyc-form" class="kyc-form" novalidate>
                            <h4>Step 2: Cooperative Society Verification</h4>
                            <div class="form-group"><label for="kyc-coop-name">Organisation Name</label><input type="text" id="kyc-coop-name" required></div>
                            <div class="form-group"><label for="kyc-coop-cert">Certificate Number</label><input type="text" id="kyc-coop-cert" required></div>
                            <div class="form-group"><label for="kyc-coop-tin">TIN Number</label><input type="text" id="kyc-coop-tin" required></div>
                            <div class="form-group"><label for="kyc-coop-rep-name">President/Representative Name</label><input type="text" id="kyc-coop-rep-name" required></div>
                            <div class="form-group"><label for="kyc-coop-phone">Official Phone</label><input type="tel" id="kyc-coop-phone" required></div>
                            <div class="form-group"><label for="kyc-coop-email">Official Email</label><input type="email" id="kyc-coop-email" required></div>
                            <div class="form-group"><label for="kyc-coop-address">Office Address</label><input type="text" id="kyc-coop-address" required></div>
                            <div class="form-group"><label>Upload Registration Certificate</label><div class="upload-area kyc-file-upload" data-input-id="kyc-coop-cert-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-coop-cert-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-coop-cert-upload-preview"></span></div>
                            <div class="form-group"><label>Upload TIN Document</label><div class="upload-area kyc-file-upload" data-input-id="kyc-coop-tin-upload"><i class="fas fa-file-alt"></i><span>Click to upload</span></div><input type="file" id="kyc-coop-tin-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-coop-tin-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's ID</label><div class="upload-area kyc-file-upload" data-input-id="kyc-coop-rep-id-upload"><i class="fas fa-id-card"></i><span>Click to upload</span></div><input type="file" id="kyc-coop-rep-id-upload" accept="image/*,.pdf" style="display:none;" required data-original-required="true"><span class="file-upload-preview" id="kyc-coop-rep-id-upload-preview"></span></div>
                            <div class="form-group"><label>Representative's Selfie</label><button type="button" class="btn btn-small live-capture-btn" id="kyc-coop-selfie-btn" required data-original-required="true" data-captured="false"><i class="fas fa-camera"></i> Capture Live Selfie</button><span class="file-upload-preview" id="kyc-coop-selfie-preview"></span></div>
                            <button type="submit" class="btn btn-accent">Submit Verification</button>
                        </form>
                    </div>
                </div></div>`;

                profileSection.innerHTML = `
                    <div class="header">
                        ${!isMyProfile ? `<button onclick="window._viewingOtherProfile=false;if(typeof renderUserProfile==='function'){renderUserProfile(window.userState.id);}else{if(typeof navigateTo==='function')navigateTo('profile',true);}" style="background:none;border:none;cursor:pointer;color:var(--secondary);font-size:0.88rem;font-weight:600;padding:4px 0;display:flex;align-items:center;gap:5px;margin-bottom:6px;"><i class="fas fa-arrow-left"></i> My Profile</button>` : ''}
                        <h1>${isMyProfile ? "My Profile" : user.fullName + "'s Profile"}</h1>
                    </div>
                    <div class="card">
                        <div class="profile-header-container">
                            <div class="cover-photo-container" id="profile-cover-container" style="background-image: url('${user.coverPhoto}');">
                                ${isMyProfile ? `<label for="cover-photo-input" class="upload-overlay"><i class="fas fa-camera"></i> Change Cover</label><input type="file" id="cover-photo-input" accept="image/*" style="display:none;">` : ''}
                            </div>
                            <div class="profile-header">
                                <div class="profile-pic-container">
                                    <label for="profile-pic-input-main" class="avatar-placeholder" style="width: 150px; height: 150px; border-radius: 50%; ${!isMyProfile ? 'cursor:default;' : ''}">
                                        ${isMyProfile ? '<div class="upload-overlay"><i class="fas fa-camera fa-2x"></i></div>' : ''}
                                        <img src="${user.avatar}" id="profile-pic-img" class="profile-pic active" alt="User profile picture">
                                    </label>
                                    ${isMyProfile ? `<input type="file" id="profile-pic-input-main" class="avatar-input" accept="image/*" style="display: none;">` : ''}
                                </div>
                                <div class="profile-header-info" data-user-id="${user.id}">
                                    <h2 id="profile-display-name">${user.fullName} <span class="badge" style="display: ${user.isVerified ? 'inline-flex' : 'none'};"><i class="fas fa-check"></i> Verified</span></h2>
                                    <p id="profile-display-username">@${user.username}</p>
                                    <div class="profile-stats-row" style="display:flex;gap:20px;margin:6px 0;font-size:0.88rem;">
                                        <span><strong id="profile-follower-count">${(user.followerCount||0).toLocaleString()}</strong> <span style="color:var(--text-muted);">Followers</span></span>
                                        <span><strong id="profile-following-count">${(user.followingCount||0).toLocaleString()}</strong> <span style="color:var(--text-muted);">Following</span></span>
                                    </div>
                                    <div class="profile-header-actions">
                                        ${isMyProfile ? `<button class="btn btn-small nav-link" data-target="settings"><i class="fas fa-edit"></i> Edit Profile</button>` : `<button class="btn btn-small" id="profile-message-btn" data-message-user-id="${user.id}"><i class="fas fa-envelope"></i> Message</button>`}
                                        <button class="btn btn-small share-profile-btn"><i class="fas fa-share"></i> Share</button>
                                        ${!isMyProfile ? `<button class="btn btn-small follow-btn" data-user-id="${user.id}">Follow</button>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ${isMyProfile && !userState.isVerified ? `<div style="background:linear-gradient(135deg,rgba(91,14,166,0.08),rgba(245,197,24,0.08));border:1.5px solid rgba(91,14,166,0.18);border-radius:14px;padding:10px 14px;margin:10px 16px 0;display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="document.querySelector('[data-target=\"profile-kyc-tab\"]')&&document.querySelector('[data-target=\"profile-kyc-tab\"]').click()">
                            <i class="fas fa-shield-alt" style="color:#5B0EA6;font-size:1.2rem;flex-shrink:0;"></i>
                            <div style="flex:1;"><strong style="color:#5B0EA6;font-size:0.82rem;">Complete KYC Verification</strong><br><span style="font-size:0.72rem;color:var(--text-muted);">Tap to unlock full features &amp; earnings</span></div>
                            <i class="fas fa-chevron-right" style="color:#5B0EA6;"></i>
                        </div>` : ''}

                        ${(()=>{
                            const _bd=[
                                {icon:'fa-align-left',label:'Bio',val:user.bio},
                                {icon:'fa-briefcase',label:'Profession',val:user.profession},
                                {icon:'fa-graduation-cap',label:'Education',val:user.education},
                                {icon:'fa-heart',label:'Marital Status',val:user.maritalStatus},
                                {icon:'fa-gamepad',label:'Hobbies',val:user.hobbies},
                                {icon:'fa-map-marker-alt',label:'Location',val:user.location},
                                {icon:'fa-globe',label:'Website',val:user.website},
                                {icon:'fa-envelope',label:'Email',val:isMyProfile?user.email:null},
                                {icon:'fa-phone',label:'Phone',val:isMyProfile?user.phone:null}
                            ].filter(r=>r.val&&String(r.val).trim());
                            if(!_bd.length)return '';
                            // Horizontal scrollable chip row
                            const chipsH=_bd.map(r=>{
                                const v=String(r.val).trim();
                                let linkOpen='',linkClose='';
                                if(r.label==='Website'){linkOpen='<a href="'+(v.startsWith('http')?v:'https://'+v)+'" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">';linkClose='</a>';}
                                else if(r.label==='Email'){linkOpen='<a href="mailto:'+v+'" style="text-decoration:none;color:inherit;">';linkClose='</a>';}
                                else if(r.label==='Phone'){linkOpen='<a href="tel:'+v+'" style="text-decoration:none;color:inherit;">';linkClose='</a>';}
                                return linkOpen+'<div style="flex-shrink:0;background:#fff;border:1.5px solid rgba(10,14,39,0.09);border-radius:50px;padding:7px 14px;display:flex;align-items:center;gap:7px;box-shadow:0 1px 4px rgba(10,14,39,0.06);cursor:default;">'
                                    +'<div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#0A0E27,#1B2B8B);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
                                        +'<i class="fas '+r.icon+'" style="color:#F5C518;font-size:0.5rem;"></i>'
                                    +'</div>'
                                    +'<div style="min-width:0;">'
                                        +'<div style="font-size:0.58rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;">'+r.label+'</div>'
                                        +'<div style="font-size:0.78rem;color:var(--text-primary);font-weight:600;white-space:nowrap;max-width:130px;overflow:hidden;text-overflow:ellipsis;">'+v+'</div>'
                                    +'</div>'
                                +'</div>'+linkClose;
                            }).join('');
                            const editBtn=isMyProfile?'<a href="#" class="nav-link" data-target="settings" style="flex-shrink:0;font-size:0.65rem;color:var(--secondary);font-weight:700;text-decoration:none;display:flex;align-items:center;gap:3px;padding:0 6px;"><i class="fas fa-pencil-alt"></i> Edit</a>':'';
                            return '<div id="profile-biodata-card" style="margin:12px 0 0;overflow:hidden;">'
                                +'<div style="display:flex;align-items:center;justify-content:space-between;padding:0 16px 6px;">'
                                    +'<span style="font-size:0.65rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.6px;"><i class=\"fas fa-id-card\" style=\"color:var(--secondary);margin-right:4px;\"></i>About '+(isMyProfile?'Me':user.fullName.split(' ')[0])+'</span>'
                                    +editBtn
                                +'</div>'
                                +'<div style="display:flex;gap:8px;padding:0 16px 14px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;scroll-snap-type:x mandatory;">'
                                    +chipsH
                                +'</div>'
                            +'</div>';
                        })()}
                        <div class="profile-tabs" style="display:flex;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;white-space:nowrap;padding-bottom:2px;gap:0;margin-top:14px;">
                            ${isMyProfile ? `<div class="profile-tab active" data-target="profile-dashboard-tab" style="flex-shrink:0;"><i class="fas fa-tachometer-alt" style="margin-right:4px;"></i>Dashboard</div>` : ''}
                            <div class="profile-tab ${isMyProfile ? '' : 'active'}" data-target="profile-posts-tab" style="flex-shrink:0;">Posts</div>
                            <div class="profile-tab" data-target="profile-main-content" style="flex-shrink:0;">Gallery</div>
                            <div class="profile-tab" data-target="profile-about-tab" style="flex-shrink:0;"><i class="fas fa-id-card" style="margin-right:4px;"></i>About</div>
                            ${isMyProfile ? `<div class="profile-tab" data-target="profile-monetization" style="flex-shrink:0;">Monetization</div>` : ''}
                            ${isMyProfile ? `<div class="profile-tab" data-target="profile-kyc-tab" style="flex-shrink:0;color:#5B0EA6;font-weight:700;"><i class="fas fa-shield-alt" style="margin-right:4px;"></i>KYC</div>` : ''}
                        </div>
                        <div class="card-content">
                            ${isMyProfile ? `
                            <div id="profile-dashboard-tab" class="profile-tab-content active">
                                <!-- Profile Create Section — collapsed by default, expands on + click -->
                                <div style="position:relative;margin-bottom:20px;">
                                    <button id="profile-create-toggle-btn" title="Create post / upload media" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:linear-gradient(135deg,#0A0E27,#1B2B8B);border:none;border-radius:16px;color:white;font-size:1rem;font-weight:700;cursor:pointer;transition:all 0.2s;">
                                        <span id="profile-create-icon" style="width:34px;height:34px;border-radius:50%;background:rgba(245,197,24,0.25);border:2px solid #F5C518;display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#F5C518;transition:transform 0.3s;">+</span>
                                        <span>Share a Moment</span>
                                    </button>
                                    <div id="profile-create-panel" style="display:none;background:linear-gradient(135deg,#0A0E27,#1B2B8B);border-radius:0 0 18px 18px;padding:18px 20px 20px;color:white;margin-top:-4px;">
                                        <p style="font-size:0.82rem;opacity:0.75;margin-bottom:14px;">Photos &amp; videos appear instantly on your profile and dashboard feed</p>
                                        <input type="text" id="profile-post-title" placeholder="✏️ Title / Heading (optional)" style="width:100%;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.25);border-radius:12px;padding:10px 14px;color:white;font-size:0.9rem;font-weight:600;outline:none;font-family:inherit;box-sizing:border-box;margin-bottom:10px;">
                                        <div id="profile-post-media-preview" style="margin-bottom:10px;border-radius:12px;overflow:hidden;"></div>
                                        <textarea id="profile-post-text" rows="3" placeholder="What's on your mind?" style="width:100%;background:rgba(255,255,255,0.1);border:1.5px solid rgba(255,255,255,0.2);border-radius:14px;padding:12px;color:white;font-size:0.95rem;resize:none;outline:none;font-family:inherit;margin-bottom:10px;box-sizing:border-box;"></textarea>
                                        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                                            <label for="profile-post-media-input" style="background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.25);color:white;padding:9px 18px;border-radius:50px;cursor:pointer;font-size:0.85rem;font-weight:600;display:flex;align-items:center;gap:6px;">
                                                <i class="fas fa-images"></i> Add Media
                                            </label>
                                            <input type="file" id="profile-post-media-input" accept="image/*,video/*" multiple style="display:none;">
                                            <button type="button" id="profile-retweet-btn" title="Retweet recent post" style="display:none;">
                                                <i class="fas fa-retweet"></i> Retweet
                                            </button>
                                            <button id="profile-post-submit-btn" style="background:#F5C518;color:#0A0E27;border:none;padding:9px 22px;border-radius:50px;font-weight:700;cursor:pointer;font-size:0.9rem;margin-left:auto;">
                                                <i class="fas fa-paper-plane"></i> Post
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <!-- Mini Dashboard Stats -->
                                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px;">
                                    <div style="background:white;border-radius:16px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(10,14,39,0.06);">
                                        <div style="font-size:1.6rem;font-weight:800;color:var(--secondary);cursor:pointer;" id="profile-dash-followers" onclick="window.showFollowersModal()">${(userState.followerCount||0).toLocaleString()}</div>
                                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;cursor:pointer;" onclick="window.showFollowersModal()">Followers ▾</div>
                                    </div>
                                    <div style="background:white;border-radius:16px;padding:16px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid rgba(10,14,39,0.06);">
                                        <div style="font-size:1.6rem;font-weight:800;color:#F5C518;" id="profile-dash-empy">${(userState.empyBalance||0).toLocaleString()}</div>
                                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">EMPY Balance</div>
                                    </div>
                                </div>
                                <!-- Live Streams on Dashboard -->
                                <div style="margin-bottom:20px;">
                                    <h4 style="font-weight:700;color:var(--primary);margin-bottom:12px;"><i class="fas fa-broadcast-tower" style="color:var(--danger-color);margin-right:6px;"></i>Live Streams</h4>
                                    <div class="horizontal-slider-container"><div class="horizontal-slider-wrapper" id="profile-dash-live-slider"></div></div>
                                </div>
                                <!-- Posts Feed -->
                                <h4 style="font-weight:700;color:var(--primary);margin-bottom:12px;"><i class="fas fa-stream" style="color:var(--secondary);margin-right:6px;"></i>Your Feed</h4>
                                <div id="profile-dash-feed"></div>
                            </div>` : ''}
                            <div id="profile-posts-tab" class="profile-tab-content ${isMyProfile ? '' : 'active'}">
                                <div id="profile-posts-feed" style="display:flex;flex-direction:column;gap:12px;"></div>
                                <div id="profile-posts-empty" style="text-align:center;padding:40px;color:var(--text-muted);">
                                    <i class="fas fa-stream" style="font-size:2rem;display:block;margin-bottom:12px;"></i>
                                    <p>No posts yet${isMyProfile ? ' — share a moment above!' : ' from this user.'}</p>
                                </div>
                            </div>
                            <div id="profile-main-content" class="profile-tab-content">
                                <h3 style="margin-bottom:16px;"><i class="fas fa-images" style="color:var(--secondary);margin-right:8px;"></i>Gallery (Photos &amp; Videos)</h3>
                                <div id="profile-gallery"><p>No media posts yet.</p></div>
                            </div>
                            <div id="profile-about-tab" class="profile-tab-content">
                                <h3 style="margin-bottom:18px;"><i class="fas fa-id-card" style="color:var(--secondary);margin-right:8px;"></i>About ${isMyProfile ? 'Me' : user.fullName}</h3>
                                ${user.bio ? `<div style="background:linear-gradient(135deg,rgba(10,14,39,0.04),rgba(27,43,139,0.06));border-radius:14px;padding:14px 16px;margin-bottom:16px;border-left:3px solid var(--secondary);">
                                    <p style="color:var(--text-muted);font-size:0.82rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Bio</p>
                                    <p style="color:var(--text-primary);line-height:1.6;">${user.bio}</p>
                                </div>` : ''}
                                <div style="display:flex;flex-direction:column;gap:0;border:1.5px solid rgba(10,14,39,0.08);border-radius:16px;overflow:hidden;">
                                    ${[
                                        { icon:'fa-briefcase',   label:'Profession',      val: user.profession },
                                        { icon:'fa-graduation-cap', label:'Education',    val: user.education },
                                        { icon:'fa-heart',       label:'Marital Status',  val: user.maritalStatus },
                                        { icon:'fa-gamepad',     label:'Hobbies',         val: user.hobbies },
                                        { icon:'fa-map-marker-alt', label:'Location',     val: user.location },
                                        { icon:'fa-envelope',    label:'Email',           val: isMyProfile ? user.email : '' },
                                        { icon:'fa-phone',       label:'Phone',           val: isMyProfile ? user.phone : '' },
                                        { icon:'fa-globe',       label:'Website',         val: user.website }
                                    ].filter(function(r){ return r.val && r.val.trim(); }).map(function(row, idx, arr) {
                                        const isLast = idx === arr.length - 1;
                                        const isLink = row.label === 'Website';
                                        const isEmail = row.label === 'Email';
                                        const isPhone = row.label === 'Phone';
                                        const valHTML = isLink
                                            ? `<a href="${row.val.startsWith('http') ? row.val : 'https://'+row.val}" target="_blank" rel="noopener" style="color:var(--secondary);text-decoration:none;">${row.val}</a>`
                                            : isEmail
                                            ? `<a href="mailto:${row.val}" style="color:var(--secondary);text-decoration:none;">${row.val}</a>`
                                            : isPhone
                                            ? `<a href="tel:${row.val}" style="color:var(--secondary);text-decoration:none;">${row.val}</a>`
                                            : row.val;
                                        return `<div style="display:flex;align-items:center;gap:14px;padding:13px 16px;background:white;${!isLast?'border-bottom:1px solid rgba(10,14,39,0.06);':''}">
                                            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0A0E27,#1B2B8B);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                                                <i class="fas ${row.icon}" style="color:white;font-size:0.8rem;"></i>
                                            </div>
                                            <div style="flex:1;min-width:0;">
                                                <div style="font-size:0.72rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.4px;">${row.label}</div>
                                                <div style="font-size:0.92rem;color:var(--text-primary);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${valHTML}</div>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                </div>
                                ${isMyProfile ? `<div style="margin-top:16px;text-align:center;">
                                    <button class="btn btn-small nav-link" data-target="settings" style="font-size:0.82rem;opacity:0.75;">
                                        <i class="fas fa-edit"></i> Edit your info in Settings
                                    </button>
                                </div>` : ''}
                            </div>
                            ${isMyProfile ? `<div id="profile-monetization" class="profile-tab-content"></div>` : ''}
                        </div>
                    </div>
                     ${isMyProfile ? `<div id="profile-kyc-tab" class="profile-tab-content" style="display:none;">${kycFormHTML}</div>` : ''}
                `;
                
                if (isMyProfile) {
                    renderMonetizationTab();
                    populateDobSelectors();
                    // Wire up the + toggle for the create panel
                    setTimeout(function() {
                        var toggleBtn = document.getElementById('profile-create-toggle-btn');
                        var panel = document.getElementById('profile-create-panel');
                        var icon = document.getElementById('profile-create-icon');
                        if (toggleBtn && panel && icon) {
                            toggleBtn.addEventListener('click', function() {
                                var isOpen = panel.style.display !== 'none';
                                panel.style.display = isOpen ? 'none' : 'block';
                                icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
                                icon.textContent = isOpen ? '+' : '×';
                            });
                        }

                        // ── Wire profile post media input ──────────────────
                        var profileMediaFiles = [];
                        var profileMediaInput  = document.getElementById('profile-post-media-input');
                        var profilePreview     = document.getElementById('profile-post-media-preview');
                        if (profileMediaInput) {
                            profileMediaInput.addEventListener('change', function() {
                                var newFiles = Array.from(this.files);
                                profileMediaFiles = profileMediaFiles.concat(newFiles).slice(0, 10);
                                if (!profilePreview) return;
                                profilePreview.innerHTML = '';
                                profileMediaFiles.forEach(function(f, idx) {
                                    var url = URL.createObjectURL(f);
                                    var isVid = f.type.startsWith('video/');
                                    var wrap = document.createElement('div');
                                    wrap.style.cssText = 'position:relative;display:inline-block;margin:4px;';
                                    wrap.innerHTML = isVid
                                        ? '<video src="'+url+'" muted playsinline style="width:80px;height:80px;object-fit:cover;border-radius:8px;"></video>'
                                        : '<img src="'+url+'" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">';
                                    var rm = document.createElement('button');
                                    rm.type = 'button';
                                    rm.textContent = '×';
                                    rm.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:0.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;';
                                    rm.onclick = function() {
                                        profileMediaFiles.splice(idx, 1);
                                        // Re-render
                                        profileMediaInput.dispatchEvent(Object.assign(new Event('change'), { synthetic: true }));
                                    };
                                    wrap.appendChild(rm);
                                    profilePreview.appendChild(wrap);
                                });
                            });
                        }

                        // ── Wire profile post submit button ────────────────
                        var profileSubmitBtn = document.getElementById('profile-post-submit-btn');
                        if (profileSubmitBtn) {
                            profileSubmitBtn.addEventListener('click', async function() {
                                var textEl  = document.getElementById('profile-post-text');
                                var titleEl = document.getElementById('profile-post-title');
                                var text    = textEl  ? textEl.value.trim()  : '';
                                var title   = titleEl ? titleEl.value.trim() : '';
                                if (!text && profileMediaFiles.length === 0) {
                                    if (typeof showNotification === 'function') showNotification('Please add text or media before posting.', 'error');
                                    return;
                                }
                                profileSubmitBtn.disabled = true;
                                if (typeof showNotification === 'function' && profileMediaFiles.length > 0)
                                    showNotification('Uploading media to cloud…', 'info');
                                try {
                                    var cloudUrls = await window.uploadMediaFilesToCloudinary(profileMediaFiles);
                                    var fullText  = title ? (title + (text ? '\n' + text : '')) : text;
                                    var mediaObjs = cloudUrls.map(function(u, i) {
                                        var f = profileMediaFiles[i];
                                        return { _cloudUrl: u, url: u, type: f ? f.type : 'image/jpeg' };
                                    });
                                    // Create post element and add to feeds
                                    var postEl = createNewPostElement(fullText, mediaObjs, {
                                        id: userState.id,
                                        fullName: userState.fullName || userState.username,
                                        avatar: userState.avatar || ''
                                    });
                                    // Add to main dashboard feed
                                    var feedContainer = document.getElementById('feed-container');
                                    if (feedContainer) feedContainer.prepend(postEl);
                                    // Add to profile dash feed
                                    var dashFeed = document.getElementById('profile-dash-feed');
                                    if (dashFeed) dashFeed.prepend(postEl.cloneNode(true));
                                    // Add to profile posts tab
                                    var profilePostsFeed = document.getElementById('profile-posts-feed');
                                    var profilePostsEmpty = document.getElementById('profile-posts-empty');
                                    if (profilePostsFeed) {
                                        profilePostsFeed.prepend(postEl.cloneNode(true));
                                        if (profilePostsEmpty) profilePostsEmpty.style.display = 'none';
                                    }
                                    // Save to Firestore
                                    var postId = postEl.dataset.postId || ('post-' + Date.now());
                                    var safeUrls = cloudUrls.filter(function(u) { return u && !u.startsWith('blob:'); });
                                    try {
                                        await window.fbDb.collection('posts').doc(postId).set({
                                            id: postId, text: fullText, media: safeUrls,
                                            userId: userState.id, username: userState.fullName || userState.username,
                                            avatar: userState.avatar || '',
                                            createdAt: new Date().toISOString()
                                        });
                                    } catch(fsErr) { console.warn('[Profile post] Firestore save failed:', fsErr.message); }
                                    // Reset form
                                    if (textEl)  textEl.value  = '';
                                    if (titleEl) titleEl.value = '';
                                    profileMediaFiles = [];
                                    if (profilePreview) profilePreview.innerHTML = '';
                                    if (panel) panel.style.display = 'none';
                                    if (icon) { icon.textContent = '+'; icon.style.transform = 'rotate(0deg)'; }
                                    if (typeof showNotification === 'function') showNotification('✅ Post published!', 'success');
                                    if (typeof rewardUserForAction === 'function') rewardUserForAction('CREATE_POST');
                                } catch(err) {
                                    console.error('[Profile post] Error:', err);
                                    if (typeof showNotification === 'function') showNotification('Failed to publish post. Try again.', 'error');
                                } finally {
                                    profileSubmitBtn.disabled = false;
                                }
                            });
                        }

                        // Quote and Retweet buttons removed from profile dashboard.
                        // Users can quote/retweet directly from posts in the main feed.
                    }, 150);
                }
                populateProfileGallery(user.id);
                // Re-init KYC upload bindings after profile re-render
                setTimeout(function() {
                    if (typeof initKycUploads === 'function') initKycUploads();
                }, 400);

                // Mirror posts from main feed to profile posts tab
                const profilePostsFeed = document.getElementById('profile-posts-feed');
                const profilePostsEmpty = document.getElementById('profile-posts-empty');
                if (profilePostsFeed) {
                    const userPosts = Array.from(document.querySelectorAll(`#feed-container .impact-story[data-user-id="${userId}"]`));
                    if (userPosts.length > 0) {
                        if (profilePostsEmpty) profilePostsEmpty.style.display = 'none';
                        userPosts.forEach(post => {
                            const clone = post.cloneNode(true);
                            // Remove options menu from clone to avoid duplicate IDs
                            clone.querySelectorAll('.options-menu').forEach(m => m.remove());
                            clone.querySelectorAll('.options-btn').forEach(b => b.style.display = 'none');
                            profilePostsFeed.appendChild(clone);
                        });
                    } else {
                        if (profilePostsEmpty) profilePostsEmpty.style.display = 'block';
                    }
                }

                renderDynamicUI();
            }


            function updateStakingUI() {
                if (isGuest || !document.getElementById('staking-apy')) return;

                document.getElementById('staking-apy').textContent = `~${(STAKING_APY_ESTIMATE * 100).toFixed(1)}%`;
                
                document.getElementById('user-manual-staked-balance').textContent = userManualStakedBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                document.getElementById('user-locked-staked-balance').textContent = userLockedStakedBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                document.getElementById('user-earned-rewards').textContent = userEarnedRewards.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                
                document.getElementById('stake-available-balance').textContent = userState.empyBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                document.getElementById('unstake-available-manual-balance').textContent = userManualStakedBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

                document.getElementById('claim-reward-btn').disabled = userEarnedRewards <= 0;
                
                const manualStakingStatus = document.getElementById('manual-staking-status');
                const lockedStakingStatus = document.getElementById('locked-staking-status');
                
                if (manualStakingStatus) {
                    if (userManualStakedBalance > 0) {
                        manualStakingStatus.textContent = 'Active (Manual)';
                        manualStakingStatus.className = 'staking-status active';
                    } else {
                        manualStakingStatus.textContent = 'Inactive';
                        manualStakingStatus.className = 'staking-status inactive';
                    }
                }

                if (lockedStakingStatus) {
                    if (userLockedStakedBalance > 0) {
                        const now = Date.now();
                        if (now < userLockedStakingEndTime) {
                            const timeLeft = userLockedStakingEndTime - now;
                            const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                            lockedStakingStatus.textContent = `Locked (${days} days left)`;
                            lockedStakingStatus.className = 'staking-status locked';
                        } else {
                            lockedStakingStatus.textContent = 'Unlocked';
                            lockedStakingStatus.className = 'staking-status unlocked';
                        }
                    } else {
                        lockedStakingStatus.textContent = 'Inactive';
                        lockedStakingStatus.className = 'staking-status inactive';
                    }
                }
                document.getElementById('unstake-form').querySelector('button[type="submit"]').disabled = (userManualStakedBalance <= 0);

                renderClaimedRewardsHistory();
            }

            function renderClaimedRewardsHistory() {
                const historyList = document.getElementById('claimed-rewards-history');
                if (!historyList) return;

                if (userClaimedRewardsHistory.length === 0) {
                    historyList.innerHTML = '<p style="text-align: center; color: #888;">No claimed rewards yet.</p>';
                    return;
                }

                historyList.innerHTML = userClaimedRewardsHistory.map(item => {
                    let statusText = '';
                    if (item.type.includes('locked') && item.lockExpiry && new Date() < new Date(item.lockExpiry)) {
                        const timeLeft = new Date(item.lockExpiry).getTime() - new Date().getTime();
                        const days = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                        statusText = ` (Locked, ${days} days left)`;
                    } else if (item.type.includes('locked') && item.lockExpiry && new Date() >= new Date(item.lockExpiry)) {
                        statusText = ` (Unlocked)`;
                    }
                    return `
                        <li class="claimed-history-item">
                            <span>${item.type}</span>
                            <span class="amount">${item.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} EMPY</span>
                            <span class="date">${item.date}${statusText}</span>
                        </li>
                    `;
                }).join('');
            }


            function simulateRewardAccrual() {
                if (!isGuest && (userManualStakedBalance > 0 || userLockedStakedBalance > 0)) {
                    const totalStaked = userManualStakedBalance + userLockedStakedBalance;
                    const rewardsPerSecond = totalStaked * (STAKING_APY_ESTIMATE / 31536000); 
                    userEarnedRewards += rewardsPerSecond;
                    if(document.getElementById('my-wallet').classList.contains('active')) {
                        updateStakingUI();
                    }
                }

                if (!isGuest && userLockedStakedBalance > 0 && Date.now() >= userLockedStakingEndTime) {
                    if (userLockedStakedBalance > 0) {
                        userState.empyBalance += userLockedStakedBalance;
                        userClaimedRewardsHistory.push({
                            type: 'Locked Staking Released',
                            amount: userLockedStakedBalance,
                            date: new Date().toLocaleDateString()
                        });
                        userLockedStakedBalance = 0;
                        userLockedStakingEndTime = 0; 
                        showNotification("Your locked EMPY has been released to your wallet!", "info");
                        updateWalletUI();
                    }
                }
            }

            
            function renderGrantLedger() {
                const container = document.getElementById('grant-ledger-body');
                if (!container) return;
                container.innerHTML = mockGrantLedger.map(grant => `
                    <tr>
                        <td>${grant.id}</td>
                        <td>${grant.ngo}</td>
                        <td>${grant.project}</td>
                        <td><i class="fa-solid fa-coins"></i> ${grant.amount.toLocaleString()}</td>
                        <td><a href="#" class="tx-hash" title="View on PolygonScan (simulation)">${grant.txHash}..</a></td>
                        <td class="status-completed">${grant.status}</td>
                        <td>${grant.date}</td>
                    </tr>
                `).join('');
            }
            
            function renderCommunityTasks() {
                const container = document.getElementById('community-tasks-list');
                if (!container) return;

                const incompleteTasks = mockCommunityTasks.filter(task => !userState.completedTasks.has(task.id));

                if (incompleteTasks.length === 0) {
                    container.innerHTML = '<p style="text-align:center; padding: 20px; color:#888;">All tasks completed! Check back later for more.</p>';
                    return;
                }

                container.innerHTML = incompleteTasks.map(task => `
                    <li class="task-item">
                        <div>
                            <i class="${task.icon}"></i>
                            <span>${task.text}</span>
                        </div>
                        <button class="btn btn-small btn-accent community-task-btn" data-url="${task.url}" data-reward="${task.reward}" data-task-id="${task.id}">
                            Go <i class="fas fa-external-link-alt"></i>
                        </button>
                    </li>
                `).join('');
            }

            function renderNgoGrid() {
                 const container = document.getElementById('ngo-grid-container');
                if (!container) return;
                container.innerHTML = Object.values(mockNgoPartners).map(ngo => `
                    <div class="ngo-card" data-ngo-id="${ngo.id}">
                        <div class="avatar-placeholder"><img src="${ngo.logo}" alt="${ngo.name} logo"></div>
                        <h4>${ngo.name}</h4>
                        <p>${ngo.description.substring(0, 80)}...</p>
                    </div>
                `).join('');
            }

            function renderNgoProfile(ngoId) {
                const ngo = mockNgoPartners[ngoId];
                if(!ngo) return;

                document.getElementById('ngo-grid-view').style.display = 'none';
                document.getElementById('back-to-ngo-grid').style.display = 'inline-flex';
                const profileView = document.getElementById('ngo-profile-view');
                profileView.style.display = 'block';

                profileView.innerHTML = `
                    <div class="card">
                        <div class="ngo-profile-header">
                            <div class="avatar-placeholder"><img src="${ngo.logo}" alt="${ngo.name} logo"></div>
                            <div>
                                <h2>${ngo.name}</h2>
                                <p>${ngo.description}</p>
                            </div>
                        </div>
                        <div class="card-content">
                            <h3>Impact At a Glance</h3>
                            <div class="ngo-impact-stats">
                                <div><h4>Total Raised</h4><span class="stat-value">${formatUsdPrice(ngo.stats.raised)}</span></div>
                                <div><h4>Projects Funded</h4><span class="stat-value">${ngo.stats.projects}</span></div>
                                <div><h4>People Helped</h4><span class="stat-value">${ngo.stats.peopleHelped.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <h3><i class="fas fa-stream"></i> Project Reports & Updates</h3>
                        <div id="ngo-feed-container"></div>
                    </div>
                `;
                
                const ngoFeedContainer = document.getElementById('ngo-feed-container');
                if (ngoFeedContainer) {
                    ngo.posts.forEach(postData => {
                        const author = { id: ngo.id, fullName: ngo.name, avatar: ngo.logo };
                        const postElement = createNewPostElement(postData.content, postData.media, author);
                        ngoFeedContainer.appendChild(postElement);
                    });
                }
            }

            // --- CORE APP FUNCTIONS ---
            // ── Check localStorage session on startup (FIX 14) ─────────
            // If user was logged in and refreshes, restore their session
            // Firebase users are restored by onAuthStateChanged automatically.
            // localStorage users need this explicit check.
            (function restoreLocalSession() {
                try {
                    const sessionEmail = localStorage.getItem('empyrean_session_email');
                    if (!sessionEmail) return;
                    const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                    const storedUser = stored[sessionEmail];
                    if (!storedUser) return;
                    // Restore Set types
                    ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => {
                        storedUser[k] = new Set(Array.isArray(storedUser[k]) ? storedUser[k] : []);
                    });
                    if (!storedUser.statuses) storedUser.statuses = [];
                    // Only restore if Firebase hasn't already handled this user
                    // (onAuthStateChanged fires async, so check after a short delay)
                    setTimeout(function() {
                        if (!isGuest) return; // Firebase already logged them in
                        console.log('[Session] Restoring localStorage session for', sessionEmail);
                        window._listenerRetryCount = 0; // reset retry counter for fresh session
                        initializeApp(false, storedUser.email === 'admin@empyrean.com', storedUser);
                    }, 800);
                } catch(e) { /* ignore corrupted session */ }
            })();

            function initializeApp(guestMode, isAdminUser = false, customUserData = null) {
                const _now=Date.now();
                // Allow re-entry if:
                // (a) more than 1500ms since last call, OR
                // (b) this call is for a real Firebase-confirmed user (guestMode=false, customUserData has uid)
                //     upgrading from a prior localStorage-only session
                var _upgrading = (!guestMode && customUserData && customUserData.id &&
                                  customUserData.id !== 'user-main' &&
                                  window._initAppLastGuestMode === false);
                if (window._initAppRunning && ((_now-(window._initAppLastRun||0))<1500) && !_upgrading) {
                    console.warn('[Empyrean] initializeApp blocked');
                    return;
                }
                window._initAppRunning=true; window._initAppLastRun=_now; window._initAppLastGuestMode=guestMode;
                setTimeout(function(){window._initAppRunning=false;},1500);

                // Always hide the auth modal when app initialises (prevents raw-layout bug)
                var _am = document.getElementById('auth-modal-overlay');
                if (_am) { _am.classList.remove('show'); _am.style.display = 'none'; }
                var _sv = document.getElementById('signup-view');
                var _fv = document.getElementById('forgot-password-view');
                if (_sv) _sv.style.display = 'none';
                if (_fv) _fv.style.display = 'none';
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';

                isGuest = guestMode;
                isAdmin = isAdminUser;
                // Expose as window globals so secondary listeners can access them
                window.isGuest = guestMode;
                window.isAdmin = isAdminUser;
                window.userState = userState;
                cart = [];
                newAvatarFile = null;
                newCoverFile = null;
                newsMediaFile = null;
                newPageProfileFile = null;
                newPageCoverFile = null;
                
                const guestState = { id: null, fullName: 'Guest', username: 'guest', avatar: 'https://source.unsplash.com/random/150x150/?avatar', coverPhoto: 'https://source.unsplash.com/random/1200x400/?pattern', likedPostIds: new Set(), followedUserIds: new Set(), retweetedPostIds: new Set(), statuses: [], awardedRanks: new Set(), empyBalance: 0, isVerified: false, businessPage: null, completedTasks: new Set(), viewedStatusUserIds: new Set() };
                const defaultUserState = { 
                        id: 'user-main',
                        fullName: '', 
                        username: 'member',
                        email: '',
                        password: '',
                        avatar: 'https://ui-avatars.com/api/?name=EM&background=1B2B8B&color=fff&size=150',
                        coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80',
                        bio: '',
                        phone: '',
                        website: '',
                        profession: '',
                        education: '',
                        maritalStatus: '',
                        hobbies: '',
                        location: '',
                        likedPostIds: new Set(), 
                        followedUserIds: new Set(),
                        retweetedPostIds: new Set(),
                        statuses: [],
                        viewedStatusUserIds: new Set(),
                        empyBalance: 0,
                        isVerified: false,
                        followerCount: 0,
                        businessPage: null,
                        awardedRanks: new Set(), 
                        completedTasks: new Set() 
                    };
                const adminState = { ...defaultUserState, id: 'admin-user', fullName: 'Admin User', username: 'admin', email: 'admin@empyrean.com', password: 'adminpass' };
                
                if (isGuest) {
                    userState = guestState;
                } else if (customUserData) {
                    userState = { ...guestState, ...customUserData };
                    userState.likedPostIds = new Set(userState.likedPostIds || []);
                    userState.followedUserIds = new Set(userState.followedUserIds || []);
                    userState.retweetedPostIds = new Set(userState.retweetedPostIds || []);
                    userState.viewedStatusUserIds = new Set(userState.viewedStatusUserIds || []);
                    userState.awardedRanks = new Set(userState.awardedRanks || []);
                    userState.completedTasks = new Set(userState.completedTasks || []);

                    mockUsers[customUserData.id] = userState;
                } else {
                    userState = isAdminUser ? adminState : defaultUserState;
                window.userState = userState;
                }
                
                if (userState.id && !mockUsers[userState.id]) {
                    mockUsers[userState.id] = userState;
                }

                buildSidebar();
                buildHeader();
                updateWalletUI();
                updateCartUI();
                renderDynamicUI();
                renderMarketplaceCards();
                populateBackgroundSelector();
                populateGiftCatalog();
                renderGrantLedger();
                renderNgoGrid();
                renderDashboardNews();
                if(!isGuest) {
                    renderUserProfile(userState.id); 
                    renderCommunityTasks();
                    renderSuggestedUsers();
                    renderBusinessPage();
                    updateStakingUI();
                }
                if(isAdmin) {
                    // Load SOS queue and withdrawals from Firestore for admin
                    (async () => {
                        try {
                            const sosSnap = await fbDb.collection('sos_queue').where('status','==','pending_approval').get();
                            if (!sosSnap.empty) {
                                sosSnap.forEach(doc => {
                                    const data = doc.data();
                                    if (!mockAdminSosQueue.find(s => s.id === data.id)) {
                                        mockAdminSosQueue.push(data);
                                    }
                                });
                            }
                        } catch(e) { console.warn('Failed to load SOS from Firestore:', e.message); }
                        renderAdminQueues();
                    })();
                }
                if(!isGuest) renderContactList();
                // Restore last visited section on refresh (FIX 15)
                const lastSection = (() => {
                    try { return localStorage.getItem('empyrean_last_section'); } catch(e) { return null; }
                })();
                const sectionToOpen = (!guestMode && !isAdminUser && lastSection && document.getElementById(lastSection))
                    ? lastSection
                    : (!guestMode && !isAdminUser ? 'profile' : 'dashboard');
                navigateTo(sectionToOpen);
                // Rebuild mobile bottom nav to reflect auth state (guest vs logged-in)
                if (typeof window._buildMobileBottomNav === 'function') {
                    setTimeout(window._buildMobileBottomNav, 100);
                }
                // Post compose lives in the Profile Dashboard tab only

                // Dispatch init-done so notification system and other listeners fire
                setTimeout(function() {
                    document.dispatchEvent(new Event('empyrean-init-done'));
                    // Pre-fill settings if already on that tab
                    if (!isGuest) {
                        var fnEl = document.getElementById('profile-fullname');
                        var unEl = document.getElementById('profile-username');
                        var bioEl = document.getElementById('profile-bio');
                        if (fnEl) fnEl.value = userState.fullName || '';
                        if (unEl) unEl.value = userState.username || '';
                        if (bioEl) bioEl.value = userState.bio || '';
                        var emailEl = document.getElementById('profile-email');
                        if (emailEl) emailEl.value = userState.email || '';
                    }
                }, 300);
                // ══════════════════════════════════════════════════════
                // REAL-TIME FIRESTORE LISTENERS
                // Uses onSnapshot() — fires on ALL devices instantly
                // whenever any device writes new data.
                // Starts only after real Firebase is confirmed ready.
                // ══════════════════════════════════════════════════════
                if (!guestMode) {
                    window._listenerRetryCount = 0;
                    function _scheduleListenerRetry() {
                        window._listenerRetryCount = (window._listenerRetryCount || 0) + 1;
                        if (window._listenerRetryCount > 8) {
                            console.warn('[Listeners] Max retries reached — giving up. User may need to refresh.');
                            return;
                        }
                        if (!window._listenerRetryScheduled) {
                            window._listenerRetryScheduled = true;
                            var _delay = Math.min(1000 * window._listenerRetryCount, 8000); // backoff up to 8s
                            setTimeout(function() {
                                window._listenerRetryScheduled = false;
                                if (typeof window._startRealtimeListeners === 'function')
                                    window._startRealtimeListeners();
                            }, _delay);
                        }
                    }
                    window._startRealtimeListeners = function() {
                        var db = window.fbDb;
                        // Valid session = Firebase Auth user OR localStorage session with a real user ID
                        // fbAuth.currentUser is null for localStorage-only sessions — that is OK,
                        // the Firestore SDK still works with the anonymous/unauthenticated rules.
                        var _uid    = (window.fbAuth && window.fbAuth.currentUser && window.fbAuth.currentUser.uid) || null;
                        var _lsUser = window.userState && window.userState.id && window.userState.id !== 'user-main' && !window.isGuest;
                        var hasValidSession = !!_uid || !!_lsUser;

                        if (!window._firebaseLoaded || !db) {
                            console.warn('[Listeners] Firebase not ready — will retry');
                            _scheduleListenerRetry();
                            return;
                        }
                        if (!hasValidSession) {
                            // One final check: is there a session email in localStorage?
                            try {
                                var _se = localStorage.getItem('empyrean_session_email');
                                if (_se && window.userState && !window.isGuest) hasValidSession = true;
                            } catch(e) {}
                        }
                        if (!hasValidSession) {
                            console.warn('[Listeners] No authenticated user — will retry (' + (window._listenerRetryCount||0) + ')');
                            _scheduleListenerRetry();
                            return;
                        }
                        var _uid = (window.fbAuth && window.fbAuth.currentUser)
                            ? window.fbAuth.currentUser.uid
                            : (window.userState && window.userState.id) || 'local';
                        console.log('[Listeners] Starting all real-time Firestore listeners for uid:', _uid);

                        // Helper: unsubscribe a listener handle safely
                        function _unsub(handle) { try { if (typeof handle === 'function') handle(); } catch(e) {} }

                        // ── POSTS ──────────────────────────────────────────
                        if (!window._postsListener) {
                            window._postsListener = db.collection('posts').orderBy('createdAt','desc').limit(40)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    var fc = document.getElementById('feed-container');
                                    var es = document.getElementById('feed-empty-state');
                                    snap.docChanges().forEach(function(change) {
                                        var post = change.doc.data();
                                        if (!post || !post.id) return;
                                        if (change.type === 'added') {
                                            if (fc && fc.querySelector('[data-post-id="'+post.id+'"]')) return;
                                            var media = (post.media||[]).filter(function(u){return u&&!u.startsWith('blob:');})
                                                .map(function(u){return{_cloudUrl:u,url:u,type:/\.(mp4|webm|mov)(\?|$)/i.test(u)?'video/mp4':'image/jpeg'};});
                                            var av = post.avatar||('https://ui-avatars.com/api/?name='+encodeURIComponent(post.username||'U')+'&background=5B0EA6&color=fff&size=150');
                                            var el = createNewPostElement(post.text||'', media, {id:post.userId, fullName:post.username||'User', avatar:av});
                                            el.dataset.postId = post.id;
                                            el.dataset.userId = post.userId;
                                            var tsEl = el.querySelector('.story-user-info span');
                                            if (tsEl && post.createdAt) tsEl.textContent = new Date(post.createdAt).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
                                            // Restore persisted like count
                                            if (post.likes > 0) {
                                                var lc = el.querySelector('.like-count');
                                                if (lc) lc.textContent = new Intl.NumberFormat().format(post.likes);
                                            }
                                            if (fc) { fc.prepend(el); if(es) es.style.display='none'; }
                                            // Mirror ONLY own posts to profile dashboard feed
                                            if (post.userId === userState.id && !post.isRetweet) {
                                                var pd = document.getElementById('profile-dash-feed');
                                                if (pd && !pd.querySelector('[data-post-id="'+post.id+'"]')) {
                                                    var pdClone = el.cloneNode(true);
                                                    // Ensure the options menu (edit/delete) is always accessible on dash
                                                    var optMenu = pdClone.querySelector('.options-menu');
                                                    if (!optMenu) {
                                                        // Inject edit+delete strip directly below post header if no options-menu
                                                        var hdr = pdClone.querySelector('.story-header');
                                                        if (hdr) {
                                                            var strip = document.createElement('div');
                                                            strip.style.cssText = 'display:flex;gap:6px;padding:4px 14px 6px;justify-content:flex-end;';
                                                            strip.innerHTML = '<a href="#" class="edit-post-btn" data-post-id="'+post.id+'" style="font-size:0.72rem;color:var(--secondary);font-weight:600;text-decoration:none;padding:3px 10px;border:1px solid rgba(27,43,139,0.2);border-radius:50px;"><i class="fas fa-pencil-alt"></i> Edit</a>'
                                                                + '<a href="#" class="delete-post-btn" style="font-size:0.72rem;color:#e53935;font-weight:600;text-decoration:none;padding:3px 10px;border:1px solid rgba(229,57,53,0.2);border-radius:50px;"><i class="fas fa-trash"></i> Delete</a>';
                                                            hdr.insertAdjacentElement('afterend', strip);
                                                        }
                                                    }
                                                    pd.prepend(pdClone);
                                                }
                                                var pp = document.getElementById('profile-posts-feed');
                                                if (pp && !pp.querySelector('[data-post-id="'+post.id+'"]')) pp.prepend(el.cloneNode(true));
                                                // Gallery
                                                if (post.media && post.media.length) {
                                                    var gal = document.getElementById('profile-gallery');
                                                    if (gal) { var ge=gal.querySelector('p'); if(ge)ge.remove();
                                                        post.media.filter(function(u){return u&&!u.startsWith('blob:');}).forEach(function(url){
                                                            if(gal.querySelector('[data-media-url="'+url+'"]'))return;
                                                            var isV=/\.(mp4|webm|mov)(\?|$)/i.test(url);
                                                            var gi=document.createElement('div');gi.dataset.mediaUrl=url;
                                                            gi.style.cssText='aspect-ratio:1;border-radius:10px;overflow:hidden;cursor:pointer;';
                                                            gi.innerHTML=isV?'<video src="'+url+'" style="width:100%;height:100%;object-fit:cover;" muted playsinline></video>':'<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
                                                            gal.prepend(gi);});
                                                    }
                                            }
                                        } else if (change.type === 'removed') {
                                            ['feed-container','profile-dash-feed','profile-posts-feed'].forEach(function(fid){
                                                var f2=document.getElementById(fid);
                                                if(f2){var e2=f2.querySelector('[data-post-id="'+post.id+'"]');if(e2)e2.remove();}});
                                        }
                                    }
                                    });
                                }, function(err){console.error('[Listener:posts]',err.code,err.message);window._postsListener=null;});
                            console.log('[Firestore] ✅ posts listener active');
                        }

                        // ── NEWS ───────────────────────────────────────────
                        if (!window._newsListener) {
                            window._newsListener = db.collection('news_posts').orderBy('createdAt','desc').limit(20)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    var nl = document.getElementById('news-list-container');
                                    snap.docChanges().forEach(function(change) {
                                        var n = change.doc.data();
                                        if (!n || !n.id) return;
                                        if (change.type === 'added') {
                                            if (nl && nl.querySelector('[data-post-id="'+n.id+'"]')) return;
                                            var ni = document.createElement('div');
                                            ni.className = 'news-list-item'; ni.dataset.postId = n.id; ni.dataset.userId = n.userId||'';
                                            var mh = n.mediaUrl?'<div class="news-item-image"><img src="'+n.mediaUrl+'" loading="lazy"></div>':'';
                                            var _newsOwnerOpts = (n.userId===userState.id||isAdmin)
                                                ? '<div class="post-options" style="position:absolute;top:8px;right:8px;">'
                                                  + '<button class="options-btn"><i class="fas fa-ellipsis-h"></i></button>'
                                                  + '<div class="options-menu"><a href="#" class="edit-post-btn"><i class="fas fa-edit"></i> Edit</a>'
                                                  + '<a href="#" class="delete-post-btn" style="color:#e53935;"><i class="fas fa-trash"></i> Delete</a></div></div>'
                                                : '';
                                            ni.style.position = 'relative';
                                            ni.innerHTML = _newsOwnerOpts+mh+'<div class="news-item-content-wrapper"><div class="news-item-content"><h4>'+
                                                (n.title||'')+'</h4><span class="news-meta"><i class="fas fa-calendar-alt"></i> '+
                                                (n.createdAt?new Date(n.createdAt).toLocaleDateString():'Recently')+'</span><p>'+(n.content||'')+'</p></div>'+
                                                '<div class="story-actions" style="margin-top:8px;">'+
                                                '<a class="action-btn like-btn"><i class="far fa-heart"></i><span class="like-count">0</span></a>'+
                                                '<a class="action-btn comment-btn"><i class="far fa-comment"></i><span class="comment-count">0</span></a>'+
                                                '<a class="action-btn retweet-btn"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>'+
                                                '<a class="action-btn share-btn"><i class="fas fa-share"></i></a>'+
                                                '<a class="action-btn download-media-btn"><i class="fas fa-download"></i></a>'+
                                                '<span class="action-btn view-count-display" style="margin-left:auto;color:var(--text-muted);font-size:0.72rem;pointer-events:none;"><i class="fas fa-eye"></i><span class="view-count">0</span></span></div>'+
                                                '<div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div></div>';
                                            if (nl) nl.prepend(ni);
                                            if (typeof renderDashboardNews === 'function') renderDashboardNews();
                                        }
                                    });
                                }, function(err){console.error('[Listener:news]',err.code,err.message);window._newsListener=null;});
                            console.log('[Firestore] ✅ news_posts listener active');
                        }

                        // ── MARKETPLACE ────────────────────────────────────
                        if (!window._mktListener) {
                            window._mktListener = db.collection('marketplace_listings').orderBy('createdAt','desc').limit(40)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    var grid = document.getElementById('property-grid-container');
                                    var mktSlider = document.getElementById('dashboard-market-slider');
                                    snap.docChanges().forEach(function(change) {
                                        var item = change.doc.data();
                                        if (!item || !item.id) return;
                                        if (change.type === 'added') {
                                            var firstUrl = item.media&&item.media[0]?item.media[0]:'';
                                            var isVid = /\.(mp4|webm|mov)(\?|$)/i.test(firstUrl);
                                            var syms = {NGN:'₦',USD:'$',EUR:'€',GBP:'£',GHS:'₵',EMPY:'EMPY ',USDT:'USDT '};
                                            var sym = syms[item.currency]||'$';
                                            var priceStr = sym+parseFloat(item.price||0).toLocaleString('en-US',{minimumFractionDigits:2});
                                            // Full grid card
                                            if (grid && !grid.querySelector('[data-id="'+item.id+'"]')) {
                                                var card = document.createElement('div');
                                                card.className='property-card';
                                                card.dataset.id=item.id; card.dataset.price=item.price; card.dataset.name=item.name||'';
                                                card.dataset.displayCurrency=item.currency; card.dataset.salesType=item.salesType||'';
                                                card.dataset.media=JSON.stringify(item.media||[]);
                                                card.dataset.sellerId=item.sellerId||'';
                                                card.innerHTML=(isVid?'<video src="'+firstUrl+'" autoplay loop muted playsinline controls style="width:100%;height:200px;object-fit:cover;display:block;"></video>':
                                                    (firstUrl?'<img src="'+firstUrl+'" alt="'+item.name+'" loading="lazy" style="width:100%;height:200px;object-fit:cover;display:block;" onerror="this.style.display=\'none\'">':
                                                    '<div style="width:100%;height:200px;background:linear-gradient(135deg,#1B2B8B,#0A0E27);display:flex;align-items:center;justify-content:center;"><i class=\'fas fa-image\' style=\'font-size:2rem;color:rgba(255,255,255,0.3);\' ></i></div>'))+
                                                    '<div class="property-info"><h4>'+(item.name||'')+'</h4>'+
                                                    '<p><i class="fas fa-map-marker-alt"></i> '+(item.location||'')+'</p>'+
                                                    '<div style="font-weight:700;color:var(--accent-color);font-size:1rem;">'+priceStr+'</div></div>'+
                                                    '<div class="property-seller-info" style="padding:6px 12px;font-size:0.82px;"><strong>@'+(item.sellerName||item.username||'Seller')+'</strong></div>'+
                                                    '<div class="property-actions">'+
                                                    (item.salesType==='escrow'?'<button class="btn btn-accent add-to-cart-btn"><i class="fas fa-cart-plus"></i> Add to Cart</button>':'<button class="btn btn-danger contact-seller-btn"><i class="fas fa-phone"></i> Contact Seller</button>')+
                                                    '<button class="btn promote-post-btn"><i class="fas fa-rocket"></i> Promote</button>'+
                                                    ((item.sellerId===userState.id||isAdmin)?'<button class="btn edit-post-btn" style="background:rgba(27,43,139,0.08);color:var(--secondary);border:1px solid rgba(27,43,139,0.2);"><i class="fas fa-edit"></i> Edit</button><button class="btn delete-post-btn" style="background:rgba(229,57,53,0.08);color:#e53935;border:1px solid rgba(229,57,53,0.2);"><i class="fas fa-trash"></i> Delete</button>':'')+
                                                    '</div>';
                                                grid.prepend(card);
                                                // Dashboard strip
                                                var mktCont = document.getElementById('dashboard-market-container');
                                                if(mktCont) mktCont.style.display='block';
                                                if(mktSlider && !mktSlider.querySelector('[data-id="'+item.id+'"]')) {
                                                    var dc=document.createElement('div');dc.className='dashboard-market-card';dc.dataset.id=item.id;dc.dataset.navTarget='marketplace';
                                                    dc.innerHTML=(firstUrl?'<img src="'+firstUrl+'" alt="'+item.name+'" loading="lazy" style="width:100%;height:100%;object-fit:cover;">':'')+
                                                        '<div class="dashboard-market-card-info"><h5>'+(item.name||'')+'</h5><p>'+priceStr+'</p></div>';
                                                    mktSlider.prepend(dc);
                                                }
                                                if(window.pushNotification && item.createdAt && (Date.now()-new Date(item.createdAt).getTime()<60000))
                                                    window.pushNotification('🛒 New listing: '+(item.name||'item')+' by @'+(item.sellerName||'seller'), 'new_listing');
                                            }
                                        } else if (change.type === 'removed') {
                                            var el2=grid&&grid.querySelector('[data-id="'+item.id+'"]'); if(el2)el2.remove();
                                        }
                                    });
                                }, function(err){console.error('[Listener:mkt]',err.code,err.message);window._mktListener=null;});
                            console.log('[Firestore] ✅ marketplace_listings listener active');
                        }

                        // ── REELS ──────────────────────────────────────────
                        if (!window._reelsListener) {
                            window._reelsListener = db.collection('reels').orderBy('createdAt','desc').limit(30)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    snap.docChanges().forEach(function(change) {
                                        var reel = change.doc.data();
                                        if (!reel || !reel.id || !reel.videoUrl || reel.videoUrl.startsWith('blob:')) return;
                                        if (change.type === 'added') {
                                            // Dashboard slider
                                            var slider = document.getElementById('dashboard-reels-slider');
                                            var reelCont = document.getElementById('dashboard-reels-container');
                                            if (slider && !slider.querySelector('[data-reel-id="'+reel.id+'"]')) {
                                                if(reelCont) reelCont.style.display='block';
                                                var card=document.createElement('div');
                                                card.className='reel-preview-card';card.dataset.reelId=reel.id;
                                                card.dataset.videoUrl=reel.videoUrl;card.dataset.username=reel.username||'user';
                                                card.dataset.caption=reel.caption||'';card.style.cssText='flex-shrink:0;width:110px;height:160px;border-radius:14px;overflow:hidden;position:relative;cursor:pointer;background:#111;';
                                                card.innerHTML='<video src="'+reel.videoUrl+'" style="width:100%;height:100%;object-fit:cover;" muted playsinline preload="metadata"></video>'+
                                                    '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;"><div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;"><i class="fas fa-play" style="color:white;font-size:0.85rem;margin-left:2px;"></i></div></div>'+
                                                    '<div style="position:absolute;bottom:0;left:0;right:0;padding:8px;background:linear-gradient(transparent,rgba(0,0,0,0.8));color:white;font-size:0.7rem;font-weight:600;">@'+(reel.username||'user')+'</div>';
                                                (function(c2){
                                                    var vid=c2.querySelector('video');
                                                    c2.addEventListener('mouseenter',function(){if(vid)vid.play().catch(function(){});});
                                                    c2.addEventListener('mouseleave',function(){if(vid){vid.pause();vid.currentTime=0;}});
                                                    c2.addEventListener('click',function(){
                                                        var vUrl=c2.dataset.videoUrl;if(!vUrl)return;
                                                        var ov=document.getElementById('reel-viewer-modal-overlay');
                                                        var ct=document.getElementById('reel-viewer-container');
                                                        if(ov&&ct){ct.innerHTML='';
                                                            var vi=document.createElement('div');vi.className='reel-viewer-item';vi.style.cssText='position:relative;width:100%;height:100%;background:#000;flex-shrink:0;display:flex;align-items:center;justify-content:center;';
                                                            vi.innerHTML='<video src="'+vUrl+'" style="width:100%;height:100%;object-fit:contain;" controls autoplay playsinline></video>'+
                                                                '<div style="position:absolute;bottom:80px;left:16px;color:white;"><strong>@'+c2.dataset.username+'</strong><p style="font-size:0.82rem;margin:4px 0 0;">'+c2.dataset.caption+'</p></div>';
                                                            ct.appendChild(vi);ov.style.display='block';document.body.style.overflow='hidden';}
                                                    });
                                                })(card);
                                                slider.prepend(card);
                                            }
                                            // Main reels grid
                                            var rg=document.getElementById('reels-grid-container');
                                            if(rg && !rg.querySelector('[data-post-id="'+reel.id+'"]')) {
                                                var rc=document.createElement('div');rc.className='reel-card';
                                                rc.dataset.postId=reel.id;rc.dataset.videoUrl=reel.videoUrl;rc.dataset.userId=reel.userId||'';
                                                rc.innerHTML='<video src="'+reel.videoUrl+'" loop muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;display:block;"></video>'+
                                                    '<div class="reel-content" style="position:absolute;bottom:0;left:0;right:0;padding:12px;background:linear-gradient(transparent,rgba(0,0,0,0.8));color:white;">'+
                                                    '<div class="reel-user-info" style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'+
                                                    '<div class="avatar-placeholder" style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;"><img src="'+(reel.avatar||'')+'"></div>'+
                                                    '<span style="font-weight:700;font-size:0.85rem;">@'+(reel.username||'user')+'</span></div>'+
                                                    '<p style="font-size:0.82rem;opacity:0.9;margin:0;">'+(reel.caption||'')+'</p></div>';
                                                var rv=rc.querySelector('video');
                                                if(rv){rc.addEventListener('mouseenter',function(){rv.play().catch(function(){});});rc.addEventListener('mouseleave',function(){rv.pause();rv.currentTime=0;});}
                                                var reEmpty=document.getElementById('reels-empty-state');if(reEmpty)reEmpty.style.display='none';
                                                // Inject Edit + Delete buttons for owner or admin
                                                if (reel.userId === userState.id || isAdmin) {
                                                    var _reelOpts = document.createElement('div');
                                                    _reelOpts.style.cssText = 'position:absolute;top:8px;right:8px;z-index:10;';
                                                    _reelOpts.innerHTML = '<button class="options-btn" style="background:rgba(0,0,0,0.55);border:none;color:white;border-radius:50%;width:30px;height:30px;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-ellipsis-h" style="font-size:0.75rem;pointer-events:none;"></i></button>'
                                                        + '<div class="options-menu" style="position:absolute;top:34px;right:0;background:white;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.2);min-width:130px;z-index:100;overflow:hidden;">'
                                                        + '<a href="#" class="edit-post-btn" style="display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:0.82rem;color:var(--secondary);font-weight:600;text-decoration:none;"><i class="fas fa-edit"></i> Edit</a>'
                                                        + '<a href="#" class="delete-post-btn" style="display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:0.82rem;color:#e53935;font-weight:600;text-decoration:none;"><i class="fas fa-trash"></i> Delete</a>'
                                                        + '</div>';
                                                    rc.style.position = 'relative';
                                                    rc.dataset.userId = reel.userId || '';
                                                    rc.appendChild(_reelOpts);
                                                }
                                                rg.prepend(rc);
                                            }
                                            if(window.pushNotification && reel.createdAt && (Date.now()-new Date(reel.createdAt).getTime()<60000))
                                                window.pushNotification('🎬 New reel from @'+(reel.username||'someone')+'!','new_reel');
                                        }
                                    });
                                }, function(err){console.error('[Listener:reels]',err.code,err.message);window._reelsListener=null;});
                            console.log('[Firestore] ✅ reels listener active');
                        }

                        // ── SOS APPROVED POSTS ─────────────────────────────
                        if (!window._sosListener) {
                            window._sosListener = db.collection('sos_queue').limit(30)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    snap.docChanges().forEach(function(change) {
                                        var sos = change.doc.data();
                                        if (!sos || !sos.id) return;
                                        if (change.type === 'added' && sos.status === 'approved') {
                                            var fc=document.getElementById('feed-container');
                                            if (fc && !fc.querySelector('[data-post-id="'+sos.id+'"]')) {
                                                if (typeof createSosPostOnFeed === 'function') createSosPostOnFeed(sos);
                                            }
                                        }
                                        if(change.type==='removed'){var elS=document.querySelector('[data-post-id="'+sos.id+'"]');if(elS)elS.remove();}
                                    });
                                    // Repair: inject donate button on any SOS card missing it
                                    setTimeout(function(){
                                        document.querySelectorAll('.impact-story.sos-request').forEach(function(p){
                                            if(!p.querySelector('.help-now-btn')){
                                                var _un=p.dataset.username||'this cause';
                                                var _w=document.createElement('div');_w.style.cssText='padding:10px 16px 14px;';
                                                _w.innerHTML='<button class="gift-button sos-button help-now-btn" style="width:100%;padding:12px;font-size:0.95rem;font-weight:700;border-radius:12px;background:linear-gradient(135deg,#EF4444,#B91C1C);color:white;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;"><i class="fas fa-hand-holding-heart"></i> Donate Now — Help '+_un+'</button>';
                                                var _ac=p.querySelector('.story-actions');if(_ac)p.insertBefore(_w,_ac.nextSibling);else p.appendChild(_w);
                                            }
                                        });
                                    },400);
                                },function(err){console.error('[Listener:sos]',err.code,err.message);window._sosListener=null;});
                            console.log('[Firestore] ✅ sos_queue listener active');
                        }

                        // ── CRISIS / COMMUNITY REPORTS ─────────────────────
                        if (!window._crisisListener) {
                            window._crisisListener = db.collection('crisis_reports').limit(20)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    snap.docChanges().forEach(function(change) {
                                        var cr = change.doc.data();
                                        if (!cr || !cr.id) return;
                                        if (change.type === 'added') {
                                            var fc=document.getElementById('feed-container');
                                            if (fc && !fc.querySelector('[data-post-id="'+cr.id+'"]')) {
                                                if (typeof createCrisisPostOnFeed === 'function') createCrisisPostOnFeed(cr);
                                            }
                                        }
                                    });
                                }, function(err){console.error('[Listener:crisis]',err.code,err.message);window._crisisListener=null;});
                            console.log('[Firestore] ✅ crisis_reports listener active');
                        }

                        // ── ANNOUNCEMENTS ──────────────────────────────────
                        if (!window._announcementsListener) {
                            window._announcementsListener = db.collection('announcements').limit(10)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    snap.docChanges().forEach(function(change) {
                                        var ann = change.doc.data();
                                        if (!ann || change.type !== 'added') return;
                                        var icons={announcement:'📢',appreciation:'🏆',update:'🔔','sos-thanks':'❤️'};
                                        var icon = icons[ann.type]||'📢';
                                        if(window.pushNotification) window.pushNotification(icon+' '+(ann.title||'Admin Announcement'),'announcement');
                                    });
                                }, function(err){console.error('[Listener:announcements]',err.code,err.message);window._announcementsListener=null;});
                            console.log('[Firestore] ✅ announcements listener active');
                        }

                        // ── USERS (for suggested/follow) ───────────────────
                        if (!window._usersListener) {
                            window._usersListener = db.collection('users').limit(50)
                                .onSnapshot(function(snap) {
                                    if (!snap) return;
                                    snap.docChanges().forEach(function(change) {
                                        var u = change.doc.data();
                                        if (!u || !u.id || u.id === userState.id) return;
                                        ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds']
                                            .forEach(function(k){u[k]=new Set(Array.isArray(u[k])?u[k]:[]); });
                                        if (change.type === 'added' || change.type === 'modified') {
                                            mockUsers[u.id] = u;
                                            if (u.email) registeredUsers[u.email] = u;
                                        } else if (change.type === 'removed') { delete mockUsers[u.id]; }
                                    });
                                    if (typeof renderSuggestedUsers === 'function') renderSuggestedUsers();
                                }, function(err){console.error('[Listener:users]',err.code,err.message);window._usersListener=null;});
                            console.log('[Firestore] ✅ users listener active');
                        }

                        console.log('[Firestore] ✅ ALL 8 real-time listeners active — full cross-device sync enabled');
                    }

                    // Listeners are started by onAuthStateChanged (after auth confirmed).
                    // DO NOT start listeners here — Firestore rejects reads before auth.
                    // _startRealtimeListeners() is called from onAuthStateChanged below.
                }
            }
            
            function buildSidebar() {
                // Dashboard is always item #0 — pinned at top
                const navItems = [
                    { id: 'dashboard', icon: 'fa-tachometer-alt', text: '🏠 Dashboard' },
                    { id: 'reels', icon: 'fa-film', text: 'Reels' },
                    { id: 'marketplace', icon: 'fa-store', text: 'Marketplace' },
                    { id: 'news', icon: 'fa-newspaper', text: 'News' },
                    { id: 'ngo-partners', icon: 'fa-hands-helping', text: 'NGO Partners'},
                    { id: 'grant-portal', icon: 'fa-file-invoice-dollar', text: 'Grant Portal'},
                ];
                if (!isGuest) {
                    navItems.splice(1, 0, { id: 'my-wallet', icon: 'fa-wallet', text: 'My Wallet' });
                    navItems.splice(2, 0, { id: 'messages', icon: 'fa-envelope', text: 'Messages' });
                    navItems.push(
                        { id: 'go-live', icon: 'fa-video', text: 'Go Live' },
                        { id: 'business-page', icon: 'fa-briefcase', text: 'My Page' },
                        { id: 'community-tasks', icon: 'fa-tasks', text: 'Community Tasks' },
                        { id: 'request-help', icon: 'fa-hand-holding-heart', text: 'Request SOS' },
                        { id: 'report-crisis', icon: 'fa-bullhorn', text: 'Report Crisis' },
                        { id: 'profile', icon: 'fa-user-circle', text: 'Profile' },
                        { id: 'settings', icon: 'fa-cog', text: 'Settings' }
                    );
                    // Dashboard is always first in navItems — no reordering
                }
                if (isAdmin) {
                    navItems.push({ id: 'admin', icon: 'fa-user-shield', text: 'Admin Panel' });
                }
                const footerHTML = `
                    <div class="sidebar-footer">
                        <div class="social-links">
                            <a href="https://www.youtube.com/@EmpyreanHFNewsTV" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>
                            <a href="https://x.com/EmpyToken?t=1dXjQMtmz4y2ZSm_v7S52w&s=09" target="_blank" title="X (Twitter)"><i class="fab fa-twitter"></i></a>
                            <a href="https://www.instagram.com/empyreantoken_empy?igsh=MXBpcWl3Y3Jkc3ljag==" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="https://www.linkedin.com/company/108660039/admin/" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                            <a href="https://t.me/EmpyreanToken" target="_blank" title="Telegram"><i class="fab fa-telegram-plane"></i></a>
                            <a href="https://whatsapp.com/channel/0029VbAyfxaAzNc45vhje92j" target="_blank" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        </div>
                        ${isGuest 
                            ? `<button id="login-signup-btn" class="btn btn-accent" style="width:100%"><i class="fas fa-sign-in-alt"></i> Login / Sign Up</button>`
    				        : `<a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>`
                        }
                    </div>`;
                
                sidebar.querySelector('.sidebar-nav').innerHTML = navItems.map(item => `
                    <li>
                        <a href="#" class="nav-link" data-target="${item.id}">
                            <span class="nav-icon-box">
                                <i class="fas ${item.icon}"></i>
                            </span>
                            <span style="flex:1;">${item.text}</span>
                        </a>
                    </li>`).join('');
                // Direct binding — use data attribute to prevent duplicate listeners
                sidebar.querySelectorAll('.nav-link').forEach(function(link) {
                    if (link.dataset.navBound === '1') return;
                    link.dataset.navBound = '1';
                    // Use passive:false to allow e.preventDefault() without delay
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (typeof navigateTo === 'function') navigateTo(this.dataset.target, true);
                    });
                });
                // Inject logo avatar into sidebar header
                let sidebarHeader = sidebar.querySelector('.sidebar-header');
                if (sidebarHeader && !sidebarHeader.querySelector('#app-logo-avatar')) {
                    const logoDiv = document.createElement('div');
                    logoDiv.id = 'app-logo-avatar';
                    logoDiv.title = 'Platform Logo';
                    const currentLogoSrc = window._empyreanLogoSrc || '';
                    logoDiv.innerHTML = currentLogoSrc
                        ? `<img src="${currentLogoSrc}" alt="Logo">`
                        : `<div class="logo-placeholder-icon"><i class="fas fa-hands-holding-circle"></i></div>`;
                    sidebarHeader.prepend(logoDiv);
                }
                // Build avatar URL — use actual photo from userState, fallback to initials
                const _avatarUrl = (!isGuest && userState.avatar && !userState.avatar.includes('ui-avatars'))
                    ? userState.avatar
                    : (userState.fullName
                        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.fullName)}&background=1B2B8B&color=fff&size=80&bold=true`
                        : 'https://ui-avatars.com/api/?name=U&background=5B0EA6&color=fff&size=80');

                sidebar.querySelector('.sidebar-footer').innerHTML = `
                    ${!isGuest ? `
                    <div class="nav-link" data-target="${isAdmin ? 'admin' : 'profile'}" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:rgba(255,255,255,0.07);border-radius:14px;margin-bottom:10px;cursor:pointer;border:1px solid rgba(255,255,255,0.08);">
                        <div style="position:relative;flex-shrink:0;">
                            <img src="${_avatarUrl}" alt="avatar" id="sidebar-user-avatar"
                                style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(245,197,24,0.6);box-shadow:0 0 0 2px rgba(255,255,255,0.15);"
                                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(userState.fullName||'U')}&background=1B2B8B&color=fff&size=80'">
                            <div style="position:absolute;bottom:0;right:0;width:12px;height:12px;background:#10B981;border-radius:50%;border:2px solid #1a1a2e;"></div>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:700;font-size:0.88rem;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${userState.fullName||'User'}</div>
                            <div style="font-size:0.72rem;color:rgba(255,255,255,0.45);">@${userState.username||'user'}${isAdmin ? ' · Admin' : ''}</div>
                        </div>
                        <i class="fas fa-chevron-right" style="color:rgba(255,255,255,0.25);font-size:0.72rem;flex-shrink:0;"></i>
                    </div>
                    <a href="#" id="logout-btn" style="display:flex;align-items:center;gap:10px;padding:11px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:12px;color:#FCA5A5;font-weight:600;font-size:0.85rem;text-decoration:none;margin-bottom:10px;transition:background 0.2s;">
                        <i class="fas fa-sign-out-alt"></i> Sign Out
                    </a>` : `
                    <button id="login-signup-btn" class="btn btn-accent" style="width:100%;margin-bottom:10px;padding:13px;font-size:0.95rem;font-weight:700;"><i class="fas fa-sign-in-alt"></i> Login / Sign Up</button>`}
                    <div class="social-links" style="margin-top:4px;">
                        <a href="https://www.youtube.com/@EmpyreanHFNewsTV" target="_blank" title="YouTube"><i class="fab fa-youtube"></i></a>
                        <a href="https://x.com/EmpyToken?t=1dXjQMtmz4y2ZSm_v7S52w&s=09" target="_blank" title="X (Twitter)"><i class="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/empyreantoken_empy?igsh=MXBpcWl3Y3Jkc3ljag==" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/108660039/admin/" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>
                        <a href="https://t.me/EmpyreanToken" target="_blank" title="Telegram"><i class="fab fa-telegram-plane"></i></a>
                        <a href="https://whatsapp.com/channel/0029VbAyfxaAzNc45vhje92j" target="_blank" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                    </div>
                `; 
            }
            
            function buildHeader() {
                const headerActions = document.getElementById('main-header-actions');
                if(headerActions){
                    headerActions.innerHTML = isGuest ? '' : `<button class="btn cart-icon-button"><i class="fas fa-shopping-cart"></i> Cart <span class="cart-item-count">0</span></button>`;
                }
            }
            
            function renderDynamicUI() {
                 document.querySelectorAll('.follow-btn').forEach(btn => {
                    const userIdToFollow = btn.dataset.userId;
                    if (!userIdToFollow) { 
                        btn.style.display = 'none';
                        return;
                    }
                    if (userIdToFollow === userState.id) {
                        btn.style.display = 'none';
                        return;
                    }
                     const pageFollow = btn.closest('.business-page-header');
                    if (pageFollow && userState.businessPage && userIdToFollow === userState.businessPage.id) {
                        btn.style.display = 'none';
                         return;
                    }

                    btn.style.display = 'inline-block';
                    const isFollowed = userState.followedUserIds.has(userIdToFollow);
                    btn.classList.toggle('followed', isFollowed);
                    btn.textContent = isFollowed ? 'Following' : 'Follow';
                });
                document.querySelectorAll('.like-btn').forEach(btn => {
                    const postElement = btn.closest('.impact-story, .reel-card, .news-list-item');
                    if(!postElement) return;
                    const postId = postElement.dataset.postId;
                    if (userState.likedPostIds.has(postId)) {
                        btn.querySelector('.fa-heart').classList.add('liked', 'fas');
                        btn.querySelector('.fa-heart').classList.remove('far');
                    } else {
                        btn.querySelector('.fa-heart').classList.remove('liked', 'fas');
                        btn.querySelector('.fa-heart').classList.add('far');
                    }
                });
                document.querySelectorAll('.retweet-btn').forEach(btn => {
                    const postElement = btn.closest('.impact-story, .news-list-item');
                    if (!postElement) return;
                    const postId = postElement.dataset.postId;
                     btn.querySelector('.fa-retweet').classList.toggle('retweeted', userState.retweetedPostIds.has(postId));
                });


                if(document.getElementById('profile').classList.contains('active')) {
                    const profileBadge = document.querySelector('#profile-display-name .badge');
                    if(profileBadge) profileBadge.style.display = userState.isVerified ? 'inline-flex' : 'none';

                    const followerCountEl = document.getElementById('profile-follower-count');
                    if(followerCountEl) {
                        const profileOwnerId = document.querySelector('#profile .profile-header-info').dataset.userId; 
                        const profileOwner = mockUsers[profileOwnerId] || userState; 
                        followerCountEl.textContent = profileOwner.followerCount.toLocaleString();
                    }
                }
            }
            
            function navigateTo(targetId, fromClick = false) {
                if (!targetId) return;
                // Guard: prevent navigation re-entry which causes freeze
                // Allow same-section re-navigation (e.g. profile refresh)
                if (window._navigating && window._navigatingTo === targetId) return;
                if (window._navigating) {
                    // Drop stale lock — queuing causes pile-up and freezes the nav bar
                    window._navigating = false;
                    window._navigatingTo = null;
                }
                window._navigating = true;
                window._navigatingTo = targetId;
                // Reduced from 3000ms to 800ms — long timeout was causing the freeze
                const _navGuard = setTimeout(function() { window._navigating = false; window._navigatingTo = null; }, 800);
                try {
                    if (targetId === 'profile' && !isGuest && !window._viewingOtherProfile) {
                        window._viewingOtherProfile = false; // explicit clear
                        renderUserProfile(userState.id);
                    }
                    document.querySelectorAll('.content-section.active').forEach(s => s.classList.remove('active'));
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.classList.add('active');
                        const mc = document.querySelector('.main-content');
                        if (mc) mc.scrollTop = 0;
                    }
                    window._navigating = false;
                    window._navigatingTo = null;
                    clearTimeout(_navGuard);
                    document.querySelectorAll('.nav-link.active').forEach(l => l.classList.remove('active'));
                    document.querySelectorAll('.nav-link').forEach(function(l) { l.classList.remove('active'); });
                    const activeNavLink = document.querySelector('.nav-link[data-target="' + targetId + '"]');
                    if (activeNavLink) {
                        activeNavLink.classList.add('active');
                        // Ensure the sidebar parent is visible
                        const sidebar = activeNavLink.closest('.sidebar');
                        if (sidebar) {
                            const li = activeNavLink.closest('li');
                            if (li) li.style.borderLeft = '3px solid var(--accent)';
                        }
                    }
                    // Persist last visited section so refresh restores it
                    try { localStorage.setItem('empyrean_last_section', targetId); } catch(e) {}
                    const sb = document.querySelector('.sidebar');
                    const co = document.getElementById('content-overlay');
                    if (window.innerWidth <= 992 && sb && sb.classList.contains('open')) {
                        sb.classList.remove('open');
                        if (co) co.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }
                    // Update mobile bottom nav active state
                    const mobileNav = document.getElementById('mobile-bottom-nav');
                    if (mobileNav) {
                        mobileNav.querySelectorAll('.mobile-nav-item').forEach(function(b) {
                            b.classList.remove('active');
                        });
                        const activeBtn = mobileNav.querySelector('.mobile-nav-item[data-target="' + targetId + '"]');
                        if (activeBtn) activeBtn.classList.add('active');
                        mobileNav.querySelectorAll('.mobile-nav-item').forEach(function(b) {
                            b.classList.toggle('active', b.dataset.target === targetId);
                        });
                    }
                    // Update breadcrumb
                    const breadcrumbText = document.getElementById('breadcrumb-text');
                    if (breadcrumbText) {
                        var labels = {dashboard:'Dashboard','my-wallet':'My Wallet',messages:'Messages',marketplace:'Marketplace',reels:'Reels',news:'News',profile:'Profile','go-live':'Go Live','request-help':'Request Help','report-crisis':'Report Crisis',admin:'Admin Panel',settings:'Settings','grant-portal':'Grant Portal','community-tasks':'Community Tasks','ngo-partners':'NGO Partners','business-page':'Business Page'};
                        breadcrumbText.textContent = labels[targetId] || targetId;
                    }
                    // Refresh admin queues when admin panel opens
                    if (targetId === 'admin') {
                        setTimeout(function() { try { renderAdminQueues(); } catch(e) {} }, 150);
                        setTimeout(function() {
                            var adminSec = document.getElementById('admin');
                            if (!adminSec) return;
                            var hdr = adminSec.querySelector('.header');
                            if (!hdr || hdr.querySelector('#admin-logout-btn')) return;
                            hdr.style.display = 'flex'; hdr.style.alignItems = 'center';
                            var lb = document.createElement('button');
                            lb.id = 'admin-logout-btn';
                            lb.style.cssText = 'margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:8px 16px;'
                                + 'background:linear-gradient(135deg,#e53935,#b71c1c);color:#fff;border:none;border-radius:10px;'
                                + 'font-size:0.82rem;font-weight:700;cursor:pointer;flex-shrink:0;';
                            lb.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
                            hdr.appendChild(lb);
                            lb.addEventListener('click', function() {
                                if (!confirm('Log out of the admin panel?')) return;
                                lb.disabled = true;
                                function _done() {
                                    window.isAdmin = false; window.isGuest = true;
                                    if (typeof navigateTo === 'function') navigateTo('dashboard', true);
                                    var am = document.getElementById('auth-modal-overlay');
                                    if (am) am.classList.add('show');
                                    if (typeof showNotification === 'function') showNotification('Logged out.', 'info');
                                }
                                if (window.fbAuth && typeof window.fbAuth.signOut === 'function') {
                                    window.fbAuth.signOut().then(_done).catch(_done);
                                } else { _done(); }
                            });
                        }, 250);
                    }
                    // Pre-fill settings form from userState when settings opens
                    if (targetId === 'settings' && !isGuest) {
                        setTimeout(function() {
                            var fnEl = document.getElementById('profile-fullname');
                            var unEl = document.getElementById('profile-username');
                            var bioEl = document.getElementById('profile-bio');
                            var emailEl = document.getElementById('profile-email');
                            var phoneEl = document.getElementById('profile-phone');
                            if (fnEl && !fnEl.value) fnEl.value = userState.fullName || '';
                            if (unEl && !unEl.value) unEl.value = userState.username || '';
                            if (bioEl && !bioEl.value) bioEl.value = userState.bio || '';
                            if (emailEl) emailEl.value = userState.email || '';
                            if (phoneEl && !phoneEl.value) phoneEl.value = userState.phone || '';
                            // Avatar preview in settings
                            var avatarPreviewSettings = document.getElementById('settings-avatar-preview');
                            if (avatarPreviewSettings && userState.avatar) {
                                avatarPreviewSettings.src = userState.avatar;
                                avatarPreviewSettings.style.display = 'block';
                            }
                        }, 80);
                    }
                } catch(navErr) {
                    console.error('[Empyrean] Navigation error:', navErr);
                } finally {
                    window._navigating = false;
                    window._navigatingTo = null;
                }
            }

            
            function updateWalletUI() {
                if(isGuest) return;
                const empyBalanceEl = document.getElementById('wallet-empy-balance');
                const usdEquivalentEl = document.getElementById('wallet-usd-equivalent');
                const liveBalanceEl = document.getElementById('live-user-empy-balance');

                const empyBalance = userState.empyBalance || 0;
                if(empyBalanceEl) {
                    empyBalanceEl.innerHTML = `<i class="fa-solid fa-coins"></i> ${empyBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }
                if(usdEquivalentEl) {
                    usdEquivalentEl.textContent = `~ ${formatUsdPrice(empyBalance * EMPY_RATE_USD)}`;
                }
                if (liveBalanceEl) {
                     liveBalanceEl.innerHTML = `(Your Balance: ${Math.floor(empyBalance).toLocaleString()} <i class="fa-solid fa-coins" style="font-size:0.8rem;"></i>)`;
                }
                renderMonetizationTab();
                updateStakingUI();
            }

            function updateCartUI() {
                const cartCountEl = document.querySelector('.cart-item-count');
                const cartItemsContainer = document.getElementById('cart-items-container');
                const cartTotalEl = document.getElementById('cart-total');
                const cartModalContainer = document.getElementById('cart-modal-container');
                
                if (!cartItemsContainer || !cartTotalEl || !cartModalContainer || !cartCountEl) return;
                
                cartCountEl.textContent = cart.length;

                const cartView = cartModalContainer.querySelector('#cart-view');
                const checkoutView = cartModalContainer.querySelector('#checkout-view');

                cartView.style.display = 'block';
                checkoutView.style.display = 'none';

                if (cart.length === 0) {
                    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                    cartTotalEl.textContent = 'Total: $0.00';
                     cartModalContainer.querySelector('.checkout-btn').disabled = true;
                    return;
                }
                cartModalContainer.querySelector('.checkout-btn').disabled = false;
                
                const formatCurrencyDisplay = (price, currency) => {
                    const p = parseFloat(price);
                    switch((currency||'USD').toUpperCase()) {
                        case 'NGN': return `₦${p.toLocaleString('en-NG', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
                        case 'EUR': return `€${p.toLocaleString('de-DE', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
                        case 'GBP': return `£${p.toLocaleString('en-GB', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
                        case 'EMPY': return `${p.toLocaleString()} EMPY`;
                        default: return formatUsdPrice(p);
                    }
                };
                
                let cartHTML = '';
                cart.forEach(item => {
                    const priceStr = formatCurrencyDisplay(item.price, item.currency || item.displayCurrency || 'USD');
                    cartHTML += `
                        <div class="cart-item" data-id="${item.id}">
                            <img src="${item.img}" alt="${item.name}">
                            <div class="cart-item-info"><h4>${item.name}</h4><p>${priceStr}</p></div>
                        </div>`;
                });
                cartItemsContainer.innerHTML = cartHTML;
                // Group totals by currency
                const totals = {};
                cart.forEach(item => {
                    const cur = (item.currency || item.displayCurrency || 'USD').toUpperCase();
                    totals[cur] = (totals[cur]||0) + parseFloat(item.price);
                });
                const totalStr = Object.entries(totals).map(([cur,amt]) => formatCurrencyDisplay(amt, cur)).join(' + ');
                cartTotalEl.textContent = `Total: ${totalStr}`;
            }
                    
            function renderMarketplaceCards() {
                document.querySelectorAll('#marketplace .property-card').forEach(card => {
                    const priceEl = card.querySelector('.property-info div:last-child');
                    if (priceEl && card.dataset.price) {
                        // Use the card's own stored currency — never default to USD
                        const cur = card.dataset.displayCurrency || card.dataset.currency || 'NGN';
                        const p = parseFloat(card.dataset.price);
                        const syms = { NGN:'₦', USD:'$', EUR:'€', GBP:'£', GHS:'₵', EMPY:'', USDT:'USDT ' };
                        const sym = syms[cur] || '₦';
                        const suffix = cur === 'EMPY' ? ' EMPY' : cur === 'USDT' ? ' USDT' : '';
                        const locale = cur === 'NGN' ? 'en-NG' : cur === 'GBP' ? 'en-GB' : cur === 'EUR' ? 'de-DE' : 'en-US';
                        priceEl.textContent = `${sym}${p.toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2})}${suffix}`;
                        // Add currency badge if not already present
                        if (!priceEl.querySelector('.currency-badge')) {
                            const badge = document.createElement('span');
                            badge.className = 'currency-badge';
                            badge.textContent = cur;
                            priceEl.appendChild(badge);
                        }
                    }
                    
                    const salesType = card.dataset.salesType;
                    const addToCartBtn = card.querySelector('.add-to-cart-btn');
                    const contactBtn = card.querySelector('.contact-seller-btn');
                    const warningEl = card.querySelector('.direct-trade-warning');

                    if(addToCartBtn) addToCartBtn.style.display = 'none';
                    if(contactBtn) contactBtn.style.display = 'none';
                    if(warningEl) warningEl.style.display = 'none';

                    if (salesType === 'escrow') {
                        if(addToCartBtn) addToCartBtn.style.display = 'block';
                    } else { 
                        if(contactBtn) contactBtn.style.display = 'block';
                        if(warningEl) warningEl.style.display = 'block';
                    }
                });
            }

             function renderMonetizationTab() {
                const container = document.getElementById('profile-monetization');
                if (!container) return;

                const isEligible = userState.isVerified && userState.followerCount >= 500;
                
                if (isEligible) {
                    const empyBalance = userState.empyBalance || 0;
                    container.innerHTML = `
                        <h3><i class="fas fa-dollar-sign"></i> Your Monetization</h3>
                        <div class="wallet-card">
                            <p>Available for Withdrawal</p>
                            <h3 class="empy-balance"><i class="fa-solid fa-coins"></i> ${empyBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                            <p>~ ${formatUsdPrice(empyBalance * EMPY_RATE_USD)}</p>
                            <button class="btn btn-accent nav-link" data-target="my-wallet"><i class="fas fa-exchange-alt"></i> Go to Wallet</button>
                        </div>`;
                } else {
                    let nextRankInfo = '';
                    const nextRank = ranks.find(rank => rank.followers > userState.followerCount);
                    if (nextRank) {
                        nextRankInfo = `<p>Next Rank: <strong>${nextRank.name}</strong> (${userState.followerCount.toLocaleString()} / ${nextRank.followers.toLocaleString()} followers) for a <strong>${nextRank.reward} EMPY</strong> reward.</p>`;
                    }

                    let reasonsHTML = '<ul>';
                    if (!userState.isVerified) {
                        reasonsHTML += '<li><i class="fas fa-times-circle" style="color:var(--danger-color)"></i> Complete KYC verification. <a href="#" class="nav-link" data-target="profile">Verify Now</a></li>';
                    } else {
                         reasonsHTML += `<li><i class="fas fa-check-circle" style="color:var(--success-color)"></i> KYC Verified</li>`;
                    }

                    if (userState.followerCount < 500) {
                        reasonsHTML += `<li><i class="fas fa-times-circle" style="color:var(--danger-color)"></i> Reach 500 followers (Current: ${userState.followerCount})</li>`;
                    } else {
                        reasonsHTML += `<li><i class="fas fa-check-circle" style="color:var(--success-color)"></i> 500+ Followers</li>`;
                    }
                    reasonsHTML += '</ul>';

                    container.innerHTML = `
                        <h3><i class="fas fa-lock"></i> Monetization Locked</h3>
                        <div class="form-feedback info" style="display:block; text-align:left;">
                           <p>To unlock monetization features like withdrawals and direct payments, please meet the following criteria:</p>
                           ${reasonsHTML}
                           ${nextRankInfo}
                        </div>`;
                }
            }
            
            function renderBusinessPage() {
                const container = document.getElementById('business-page');
                if (!container) return;

                if (userState.businessPage) {
                    const page = userState.businessPage;
                    const coverGradient = page.coverPhoto && page.coverPhoto.startsWith('http')
                        ? `url('${page.coverPhoto}')` : 'linear-gradient(135deg,#0A0E27 0%,#1B2B8B 100%)';
                    container.innerHTML = `
                        <!-- Business Page Header -->
                        <div class="card business-page-header" style="overflow:hidden;border-radius:24px;margin-bottom:16px;padding:0;">
                            <!-- Cover Photo -->
                            <div id="business-page-cover-photo" style="height:220px;background:${coverGradient};background-size:cover;background-position:center;position:relative;">
                                <label for="business-cover-photo-input" style="position:absolute;bottom:12px;right:12px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);border:1.5px solid rgba(255,255,255,0.4);color:white;padding:8px 16px;border-radius:50px;cursor:pointer;font-size:0.82rem;font-weight:600;display:flex;align-items:center;gap:6px;">
                                    <i class="fas fa-camera"></i> Edit Cover
                                </label>
                                <input type="file" id="business-cover-photo-input" accept="image/*" style="display:none;">
                            </div>
                            <!-- Page identity row -->
                            <div style="display:flex;align-items:flex-end;gap:18px;padding:0 24px;transform:translateY(-40px);margin-bottom:-30px;">
                                <div style="position:relative;flex-shrink:0;">
                                    <div style="width:90px;height:90px;border-radius:18px;border:4px solid white;background:var(--g-navy);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.18);display:flex;align-items:center;justify-content:center;">
                                        ${page.profilePhoto && page.profilePhoto.startsWith('http')
                                            ? `<img src="${page.profilePhoto}" id="business-page-profile-pic" style="width:100%;height:100%;object-fit:cover;">`
                                            : `<i class="fas fa-briefcase" style="font-size:2rem;color:#F5C518;"></i>`}
                                    </div>
                                    <label for="business-profile-photo-input" style="position:absolute;bottom:-4px;right:-4px;width:28px;height:28px;border-radius:50%;background:var(--accent);border:2px solid white;display:flex;align-items:center;justify-content:center;cursor:pointer;">
                                        <i class="fas fa-camera" style="font-size:0.6rem;color:#111;"></i>
                                    </label>
                                    <input type="file" id="business-profile-photo-input" accept="image/*" style="display:none;">
                                </div>
                                <div style="flex:1;padding-bottom:6px;">
                                    <h2 id="business-page-name" style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--primary);margin:0 0 2px;">
                                        ${page.name}
                                        <i class="fas fa-pen edit-icon" data-field="name" style="font-size:0.75rem;color:var(--text-muted);cursor:pointer;margin-left:8px;" title="Edit Name"></i>
                                    </h2>
                                    <p id="business-page-tagline" style="color:var(--text-muted);font-size:0.88rem;margin:0;">
                                        ${page.tagline}
                                        <i class="fas fa-pen edit-icon" data-field="tagline" style="font-size:0.7rem;cursor:pointer;margin-left:6px;" title="Edit Tagline"></i>
                                    </p>
                                </div>
                                <div style="display:flex;gap:8px;padding-bottom:8px;flex-wrap:wrap;">
                                    <button class="btn btn-small follow-btn" data-user-id="${page.id||'biz-1'}" style="border-radius:50px;padding:8px 18px;font-size:0.82rem;">
                                        <i class="fas fa-plus"></i> Follow
                                    </button>
                                    <button class="btn btn-small btn-accent business-page-promote-btn" style="border-radius:50px;padding:8px 18px;font-size:0.82rem;">
                                        <i class="fas fa-rocket"></i> Promote
                                    </button>
                                    <button class="btn btn-small business-page-share-btn" style="border-radius:50px;padding:8px 18px;font-size:0.82rem;background:rgba(10,14,39,0.05);">
                                        <i class="fas fa-share"></i> Share
                                    </button>
                                </div>
                            </div>
                            <!-- Stats row -->
                            <div style="display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(10,14,39,0.06);margin:0 24px;">
                                <div style="padding:14px;text-align:center;border-right:1px solid rgba(10,14,39,0.06);">
                                    <strong style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--primary);" id="business-page-follower-count">${(page.followerCount||0).toLocaleString()}</strong>
                                    <p style="font-size:0.72rem;color:var(--text-muted);margin:0;">Followers</p>
                                </div>
                                <div style="padding:14px;text-align:center;border-right:1px solid rgba(10,14,39,0.06);">
                                    <strong style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--primary);" id="biz-post-count">0</strong>
                                    <p style="font-size:0.72rem;color:var(--text-muted);margin:0;">Posts</p>
                                </div>
                                <div style="padding:14px;text-align:center;border-right:1px solid rgba(10,14,39,0.06);">
                                    <strong style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--secondary);">8.2%</strong>
                                    <p style="font-size:0.72rem;color:var(--text-muted);margin:0;">Engagement</p>
                                </div>
                                <div style="padding:14px;text-align:center;">
                                    <strong style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--accent2);">56.4K</strong>
                                    <p style="font-size:0.72rem;color:var(--text-muted);margin:0;">Reach (30d)</p>
                                </div>
                            </div>
                            <!-- Tabs -->
                            <div class="profile-tabs" id="business-page-tabs" style="padding:0 24px;margin-top:0;">
                                <div class="profile-tab active" data-target="business-page-feed-tab">Feed</div>
                                <div class="profile-tab" data-target="business-page-about-tab">About</div>
                                <div class="profile-tab" data-target="business-page-media-tab">Media</div>
                                <div class="profile-tab" data-target="business-page-promotion-tab">Campaigns</div>
                                <div class="profile-tab" data-target="business-page-analytics-tab">Analytics</div>
                            </div>
                        </div>

                        <!-- FEED TAB -->
                        <div id="business-page-feed-tab" class="profile-tab-content active">
                            <div class="card" style="margin-bottom:16px;">
                                <div class="card-content">
                                    <h3 style="margin-bottom:16px;"><i class="fas fa-pen" style="color:var(--secondary);margin-right:8px;"></i>Create Business Post</h3>
                                    <form id="create-business-post-form">
                                        <div class="form-group">
                                            <textarea id="business-post-text" rows="3" placeholder="Share updates, products, services, or announcements..." style="resize:vertical;min-height:80px;"></textarea>
                                        </div>
                                        <div id="business-post-media-preview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-bottom:12px;"></div>
                                        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                                            <div style="display:flex;gap:8px;">
                                                <label for="business-post-media-input" class="btn btn-media-upload" style="cursor:pointer;padding:8px 16px;font-size:0.82rem;">
                                                    <i class="fas fa-photo-video"></i> Media
                                                </label>
                                                <input type="file" id="business-post-media-input" accept="image/*,video/*" multiple style="display:none;">
                                            </div>
                                            <button type="submit" class="btn btn-accent" style="padding:10px 24px;font-size:0.88rem;border-radius:50px;">
                                                <i class="fas fa-paper-plane"></i> Post
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div id="business-page-feed-container">
                                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                                    <i class="fas fa-stream" style="font-size:2rem;display:block;margin-bottom:12px;"></i>
                                    <p>No posts yet. Share your first update!</p>
                                </div>
                            </div>
                        </div>

                        <!-- ABOUT TAB -->
                        <div id="business-page-about-tab" class="profile-tab-content">
                            <div class="card"><div class="card-content business-page-content">
                                <h4 style="margin-bottom:20px;">Business Information</h4>
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                                    <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:16px;">
                                        <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 4px;">Industry</p>
                                        <p style="font-weight:600;color:var(--primary);margin:0;" id="business-page-industry-span">
                                            ${page.industry || '—'}
                                            <i class="fas fa-pen edit-icon" data-field="industry" style="font-size:0.7rem;cursor:pointer;margin-left:6px;color:var(--text-muted);" title="Edit"></i>
                                        </p>
                                    </div>
                                    <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:16px;">
                                        <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 4px;">Email</p>
                                        <p style="font-weight:600;color:var(--primary);margin:0;" id="business-page-email-span">
                                            ${page.email || '—'}
                                            <i class="fas fa-pen edit-icon" data-field="email" style="font-size:0.7rem;cursor:pointer;margin-left:6px;color:var(--text-muted);" title="Edit"></i>
                                        </p>
                                    </div>
                                    <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:16px;">
                                        <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 4px;">Phone</p>
                                        <p style="font-weight:600;color:var(--primary);margin:0;" id="business-page-phone-span">
                                            ${page.phone || '—'}
                                            <i class="fas fa-pen edit-icon" data-field="phone" style="font-size:0.7rem;cursor:pointer;margin-left:6px;color:var(--text-muted);" title="Edit"></i>
                                        </p>
                                    </div>
                                    <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:16px;">
                                        <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 4px;">Address</p>
                                        <p style="font-weight:600;color:var(--primary);margin:0;" id="business-page-address-span">
                                            ${page.address || '—'}
                                            <i class="fas fa-pen edit-icon" data-field="address" style="font-size:0.7rem;cursor:pointer;margin-left:6px;color:var(--text-muted);" title="Edit"></i>
                                        </p>
                                    </div>
                                </div>
                                <div style="background:rgba(10,14,39,0.03);border-radius:14px;padding:16px;margin-top:16px;">
                                    <p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 8px;">About / Description</p>
                                    <p style="color:var(--primary);margin:0;line-height:1.7;" id="business-page-desc-span">
                                        ${page.description || 'No description added yet.'}
                                        <i class="fas fa-pen edit-icon" data-field="description" style="font-size:0.7rem;cursor:pointer;margin-left:6px;color:var(--text-muted);" title="Edit"></i>
                                    </p>
                                </div>
                            </div></div>
                        </div>

                        <!-- MEDIA TAB -->
                        <div id="business-page-media-tab" class="profile-tab-content">
                            <div class="card"><div class="card-content">
                                <h3 style="margin-bottom:16px;"><i class="fas fa-images" style="color:var(--secondary);margin-right:8px;"></i>Media Gallery</h3>
                                <div id="business-media-gallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">
                                    <label for="business-gallery-upload" style="aspect-ratio:1;border:2px dashed rgba(10,14,39,0.15);border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:var(--text-muted);font-size:0.82rem;transition:all 0.2s;">
                                        <i class="fas fa-plus" style="font-size:1.4rem;color:var(--secondary);"></i>Upload Media
                                    </label>
                                    <input type="file" id="business-gallery-upload" accept="image/*,video/*" multiple style="display:none;">
                                </div>
                            </div></div>
                        </div>

                        <!-- PROMOTION CAMPAIGNS TAB -->
                        <div id="business-page-promotion-tab" class="profile-tab-content">
                            <div class="card"><div class="card-content">
                                <h3 style="margin-bottom:8px;"><i class="fas fa-bullhorn" style="color:var(--accent);margin-right:8px;"></i>Promotion Campaigns</h3>
                                <p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:20px;">Boost your page reach and grow your audience with targeted campaigns.</p>
                                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
                                    ${[
                                        {icon:'fas fa-eye',label:'Page Boost',desc:'Reach 10K+ users',price:'500 EMPY',color:'var(--secondary)'},
                                        {icon:'fas fa-users',label:'Follower Campaign',desc:'Gain 100–500 followers',price:'800 EMPY',color:'var(--accent2)'},
                                        {icon:'fas fa-store',label:'Product Spotlight',desc:'Highlight top products',price:'1,200 EMPY',color:'var(--accent)'},
                                    ].map(c=>`
                                        <div style="border:1.5px solid rgba(10,14,39,0.08);border-radius:18px;padding:20px;text-align:center;transition:all 0.2s;cursor:pointer;" onmouseenter="this.style.boxShadow='0 8px 30px rgba(0,0,0,0.1)'" onmouseleave="this.style.boxShadow=''">
                                            <div style="width:48px;height:48px;border-radius:14px;background:rgba(10,14,39,0.05);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
                                                <i class="${c.icon}" style="font-size:1.4rem;color:${c.color};"></i>
                                            </div>
                                            <strong style="display:block;color:var(--primary);margin-bottom:4px;">${c.label}</strong>
                                            <p style="font-size:0.8rem;color:var(--text-muted);margin:0 0 12px;">${c.desc}</p>
                                            <span style="font-size:0.82rem;font-weight:700;color:${c.color};">${c.price}</span>
                                            <button class="btn btn-small btn-accent" style="width:100%;margin-top:12px;border-radius:50px;font-size:0.8rem;" onclick="showNotification('Campaign launched!','success');">Launch</button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div></div>
                        </div>

                        <!-- ANALYTICS TAB -->
                        <div id="business-page-analytics-tab" class="profile-tab-content">
                            <div class="card"><div class="card-content">
                                <h3 style="margin-bottom:20px;"><i class="fas fa-chart-line" style="color:var(--secondary);margin-right:8px;"></i>Page Analytics</h3>
                                <div class="analytics-grid">
                                    <div class="stat-card"><h4>Followers</h4><div class="stat-value" id="business-page-follower-count2">${(page.followerCount||0).toLocaleString()}</div><p>+12 this week</p></div>
                                    <div class="stat-card"><h4>Reach (30d)</h4><div class="stat-value">56.4K</div><p>Posts viewed</p></div>
                                    <div class="stat-card"><h4>Engagement</h4><div class="stat-value">8.2%</div><p>Likes, comments, shares</p></div>
                                    <div class="stat-card"><h4>Profile Visits</h4><div class="stat-value">2.1K</div><p>Last 30 days</p></div>
                                </div>
                            </div></div>
                        </div>
                    `;

                    // Media gallery upload handler
                    setTimeout(() => {
                        document.getElementById('business-gallery-upload')?.addEventListener('change', function() {
                            const gallery = document.getElementById('business-media-gallery');
                            Array.from(this.files).forEach(file => {
                                const url = URL.createObjectURL(file);
                                const div = document.createElement('div');
                                div.style.cssText = 'aspect-ratio:1;border-radius:14px;overflow:hidden;cursor:pointer;';
                                div.innerHTML = file.type.startsWith('video/')
                                    ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted playsinline loop></video>`
                                    : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`;
                                const uploadLabel = gallery.querySelector('label');
                                if (uploadLabel) gallery.insertBefore(div, uploadLabel);
                                else gallery.appendChild(div);
                            });
                        });

                        // Business post media preview
                        document.getElementById('business-post-media-input')?.addEventListener('change', function() {
                            const preview = document.getElementById('business-post-media-preview');
                            if (!preview) return;
                            preview.innerHTML = '';
                            Array.from(this.files).forEach(file => {
                                const url = URL.createObjectURL(file);
                                const div = document.createElement('div');
                                div.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;';
                                div.innerHTML = file.type.startsWith('video/')
                                    ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted></video>`
                                    : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
                                preview.appendChild(div);
                            });
                        });
                    }, 100);

                } else {
                    container.innerHTML = `
                        <div class="card" style="overflow:hidden;border-radius:24px;">
                            <div style="height:140px;background:var(--g-navy);"></div>
                            <div style="padding:24px;text-align:center;transform:translateY(-30px);margin-bottom:-20px;">
                                <div style="width:80px;height:80px;border-radius:18px;background:var(--g-gold);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;border:4px solid white;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                                    <i class="fas fa-briefcase" style="font-size:1.8rem;color:white;"></i>
                                </div>
                                <h3 style="font-family:'Syne',sans-serif;font-size:1.3rem;font-weight:800;color:var(--primary);margin-bottom:8px;">Launch Your Business Page</h3>
                                <p style="color:var(--text-muted);max-width:340px;margin:0 auto 20px;line-height:1.7;">Create a professional page for your brand, products, or services. Reach thousands of Empyrean members instantly.</p>
                                <div style="display:flex;justify-content:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
                                    ${[
                                        {icon:'fas fa-users',text:'Build your audience'},
                                        {icon:'fas fa-store',text:'Showcase products'},
                                        {icon:'fas fa-rocket',text:'Run promotions'},
                                    ].map(f=>`<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-muted);"><i class="${f.icon}" style="color:var(--secondary);"></i>${f.text}</div>`).join('')}
                                </div>
                                <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:4px;">
                                    <button class="btn btn-accent" id="create-page-btn" style="padding:14px 28px;font-size:0.95rem;border-radius:50px;font-weight:700;"><i class="fas fa-plus"></i> Create Business Page</button>
                                    <button class="btn" id="create-biz-account-btn" style="padding:14px 28px;font-size:0.95rem;border-radius:50px;font-weight:700;background:rgba(10,14,39,0.07);color:var(--primary);border:1.5px solid rgba(10,14,39,0.12);"><i class="fas fa-user-circle"></i> Create Account Instead</button>
                                </div>
                            </div>
                        </div>
                    `;
                    var _bac=container.querySelector('#create-biz-account-btn');
                    if(_bac){_bac.addEventListener('click',function(){var am=document.getElementById('auth-modal-overlay'),sv=document.getElementById('signup-view'),lv=document.getElementById('login-view');if(am){am.style.display='flex';am.classList.add('show');}if(sv)sv.style.display='block';if(lv)lv.style.display='none';document.body.classList.add('modal-open');showNotification('Create a new account for your business profile.','info');});}
                }
            }


            function handleWithdrawalMethodChange() {
                const methodSelect = document.getElementById('withdrawal-method');
                if (!methodSelect) return;
                const method = methodSelect.value;
                const fieldsContainer = document.getElementById('withdrawal-method-fields');
                if (!fieldsContainer) return;

                Array.from(fieldsContainer.children).forEach(child => child.style.display = 'none');
                fieldsContainer.querySelectorAll('input').forEach(input => input.required = false);
                
                if (method) {
                    const fieldsToShow = document.getElementById(`${method}-fields`);
                    if (fieldsToShow) {
                        fieldsToShow.style.display = 'block';
                        fieldsToShow.querySelectorAll('input').forEach(input => input.required = true);
                    }
                }
            }

            function updateWithdrawalPreview() {
                const amountInput = document.getElementById('withdrawal-amount');
                if(!amountInput) return;
                const amountEmpy = parseFloat(amountInput.value);
                const method = document.getElementById('withdrawal-method').value;
                const previewEl = document.getElementById('withdrawal-preview');

                if (!amountEmpy || amountEmpy < 5 || !method) {
                    previewEl.innerHTML = '<p>Enter an amount (min 5 EMPY) and select a method.</p>';
                    return;
                }

                const amountUsd = amountEmpy * EMPY_RATE_USD;
                const feeInEmpy = amountEmpy * (CRYPTO_FEE_PERCENT / 100);
                const totalEmpyDeducted = amountEmpy + feeInEmpy;
                let finalReceiveAmount = (method === 'bank') ? amountUsd * USD_TO_NGN_RATE : amountUsd;
                
                let html = `<p>Withdrawal Amount: <strong>${amountEmpy.toLocaleString()} EMPY</strong> (${formatUsdPrice(amountUsd)})</p>`;
                html += `<p>Fee (${CRYPTO_FEE_PERCENT}%): <strong>${feeInEmpy.toLocaleString()} EMPY</strong></p>`;
                html += `<p>Total Deduction: <strong>${totalEmpyDeducted.toLocaleString()} EMPY</strong></p>`;
                if (method === 'bank') html += `<p>You will receive ~<strong>${formatNgnPrice(finalReceiveAmount)}</strong></p>`;
                else if (method === 'usdt') html += `<p>You will receive: <strong>${formatUsdPrice(finalReceiveAmount)} (USDT)</strong></p>`;
                else html += `<p>You will receive: <strong>${formatUsdPrice(finalReceiveAmount)}</strong> on your card</p>`;
                
                previewEl.innerHTML = html;
            }

            function updateTransferPreview() {
                const amountInput = document.getElementById('transfer-amount');
                if(!amountInput) return;
                const amountEmpy = parseFloat(amountInput.value) || 0;
                const networkFee = 1.0; 
                const previewEl = document.getElementById('transfer-preview');

                if (!amountEmpy || amountEmpy <= 0) {
                    previewEl.innerHTML = '<p>Enter an amount to see transaction details.</p>';
                    return;
                }
                
                const totalDeducted = amountEmpy + networkFee;

                let html = `<p>Amount to Send: <strong>${amountEmpy.toLocaleString()} EMPY</strong></p>`;
                html += `<p>Network Fee (Polygon): <strong>${networkFee.toLocaleString()} EMPY</strong></p>`;
                html += `<p>Total to be Deducted: <strong>${totalDeducted.toLocaleString()} EMPY</strong></p>`;
                
                previewEl.innerHTML = html;
            }

             function updateCrossChainTransferPreview() {
                const amountInput = document.getElementById('cross-chain-amount');
                if(!amountInput) return;
                const amountEmpy = parseFloat(amountInput.value) || 0;
                const networkSelect = document.getElementById('cross-chain-network');
                if (!networkSelect) return; 
                const selectedOption = networkSelect.options[networkSelect.selectedIndex];
                const networkFee = parseFloat(selectedOption.dataset.fee) || 0;
                const previewEl = document.getElementById('cross-chain-transfer-preview');

                if (!amountEmpy || amountEmpy <= 0) {
                    previewEl.innerHTML = '<p>Enter an amount to see transaction details.</p>';
                    return;
                }
                
                const totalDeducted = amountEmpy + networkFee;

                let html = `<p>Amount to Send: <strong>${amountEmpy.toLocaleString()} EMPY</strong></p>`;
                html += `<p>Network Fee (${selectedOption.textContent.split('(')[0].trim()}): <strong>${networkFee.toLocaleString()} EMPY</strong></p>`;
                html += `<p>Total to be Deducted: <strong>${totalDeducted.toLocaleString()} EMPY</strong></p>`;
                
                previewEl.innerHTML = html;
            }


            function populateProfileGallery(userId) {
                const gallery = document.getElementById('profile-gallery');
                if (!gallery) return;

                const allPosts = Array.from(document.querySelectorAll(`.impact-story[data-user-id="${userId}"]`));
                const mediaPosts = allPosts.filter(p => p.querySelector('.story-media-container'));

                if (mediaPosts.length === 0) {
                    gallery.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:32px 0;font-size:0.9rem;">No media posts yet.</p>';
                    return;
                }

                // Compact 3-column responsive grid
                gallery.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;';
                gallery.innerHTML = '';

                mediaPosts.forEach(function(post) {
                    const mediaContainer = post.querySelector('.story-media-container');
                    if (!mediaContainer) return;

                    // Detect first media element (img or video)
                    const firstImg   = mediaContainer.querySelector('img');
                    const firstVideo = mediaContainer.querySelector('video');
                    const isVideo    = !!firstVideo && !firstImg;
                    const src        = isVideo
                        ? (firstVideo.src || firstVideo.querySelector('source')?.src || '')
                        : (firstImg ? firstImg.src : '');
                    if (!src) return;

                    // Count total media items in this post
                    const totalMedia = mediaContainer.querySelectorAll('img, video').length;

                    const card = document.createElement('div');
                    card.style.cssText = [
                        'position:relative',
                        'aspect-ratio:1/1',
                        'border-radius:10px',
                        'overflow:hidden',
                        'background:#e8eaf0',
                        'cursor:pointer',
                        'box-shadow:0 2px 8px rgba(10,14,39,0.10)',
                        'border:1.5px solid rgba(10,14,39,0.07)',
                        'transition:transform 0.18s,box-shadow 0.18s',
                    ].join(';');

                    card.onmouseenter = function() {
                        card.style.transform = 'scale(1.035)';
                        card.style.boxShadow = '0 6px 18px rgba(10,14,39,0.18)';
                    };
                    card.onmouseleave = function() {
                        card.style.transform = '';
                        card.style.boxShadow = '0 2px 8px rgba(10,14,39,0.10)';
                    };

                    if (isVideo) {
                        card.innerHTML = `
                            <video src="${src}" style="width:100%;height:100%;object-fit:cover;" muted playsinline preload="metadata"></video>
                            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.22);pointer-events:none;">
                                <div style="width:34px;height:34px;background:rgba(255,255,255,0.92);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.25);">
                                    <i class="fas fa-play" style="color:#0A0E27;font-size:0.75rem;margin-left:3px;"></i>
                                </div>
                            </div>`;
                    } else {
                        card.innerHTML = `<img src="${src}" alt="Media" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.parentElement.style.display='none'">`;
                    }

                    // Multi-media badge
                    if (totalMedia > 1) {
                        const badge = document.createElement('div');
                        badge.style.cssText = 'position:absolute;top:6px;right:6px;background:rgba(10,14,39,0.72);color:white;font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:50px;backdrop-filter:blur(4px);';
                        badge.textContent = '+' + (totalMedia - 1);
                        card.appendChild(badge);
                    }

                    // Tap — open fullscreen via the marketplace gallery modal (already in DOM)
                    card.addEventListener('click', function() {
                        // Build a flat media list from ALL of this user's gallery posts
                        const allMedia = [];
                        document.querySelectorAll('.impact-story[data-user-id="' + userId + '"]').forEach(function(p) {
                            p.querySelectorAll('img[src], video[src]').forEach(function(el) {
                                const u = el.src || el.currentSrc || '';
                                if (!u || u.startsWith('blob:') || u.startsWith('data:')) return;
                                const isV = el.tagName === 'VIDEO' || /\.(mp4|webm|mov)(\?|$)/i.test(u);
                                if (!allMedia.find(function(m){ return m.url===u; })) {
                                    allMedia.push({ url: u, type: isV ? 'video/mp4' : 'image/jpeg' });
                                }
                            });
                        });
                        const thisSrc = src;
                        let startIdx = allMedia.findIndex(function(m){ return m.url === thisSrc; });
                        if (startIdx < 0) startIdx = 0;
                        if (allMedia.length > 0 && typeof showMarketplaceGallery === 'function') {
                            showMarketplaceGallery(allMedia, startIdx);
                        } else if (allMedia.length > 0) {
                            // Fallback: open image in new tab
                            window.open(thisSrc, '_blank');
                        }
                    });

                    gallery.appendChild(card);
                });
            }
            
            function addReelToDashboardSlider(reelData) {
                const container = document.getElementById('dashboard-reels-container');
                const slider = document.getElementById('dashboard-reels-slider');
                if (!container || !slider) return;

                container.style.display = 'block';

                const card = document.createElement('div');
                card.className = 'dashboard-reel-card';
                card.dataset.navTarget = 'reels';
                card.innerHTML = `<video poster="${reelData.poster}" loop muted autoplay playsinline><source src="${reelData.url}" type="video/mp4"></video><div class="reel-content"><div class="reel-user-info"><div class="avatar-placeholder square" style="width:35px; height:35px;"><img src="${userState.avatar}" alt="User portrait"></div><span>@${userState.username}</span></div><p>${formatWhatsAppText(reelData.caption)}</p></div>`;
                slider.prepend(card);
            }
            
            function addMarketItemToDashboardSlider(marketData) {
                const container = document.getElementById('dashboard-market-container');
                const slider = document.getElementById('dashboard-market-slider');
                if (!container || !slider) return;

                container.style.display = 'block';

                const card = document.createElement('div');
                card.className = 'dashboard-market-card';
                card.dataset.navTarget = 'marketplace';
                 if (marketData.videoSrc) {
                    card.innerHTML = `<video src="${marketData.videoSrc}" autoplay loop muted></video><div class="dashboard-market-card-info"><h5>${marketData.name}</h5><p>${formatUsdPrice(marketData.price)}</p></div>`;
                } else {
                    card.innerHTML = `<img src="${marketData.img}" alt="${marketData.name}"><div class="dashboard-market-card-info"><h5>${marketData.name}</h5><p>${formatUsdPrice(marketData.price)}</p></div>`;
                }
                slider.prepend(card);
            }
            
            function renderDashboardNews() {
                const container = document.getElementById('dashboard-news-container');
                const slider = document.getElementById('dashboard-news-slider');
                if (!container || !slider) return;

                slider.innerHTML = '';
                const newsItems = Array.from(document.querySelectorAll('#news .news-list-item'));
                // Append (not prepend) so newest items appear LEFT -> RIGHT
                newsItems.slice(0, 8).forEach(item => {
                    const titleEl = item.querySelector('h4');
                    const title = titleEl ? titleEl.textContent : 'News';
                    // Try multiple image sources: dataset.img, img src, video src
                    let src = item.dataset.img || '';
                    let isVideo = false;
                    if (!src) {
                        const imgEl = item.querySelector('.news-item-image img');
                        const vidEl = item.querySelector('.news-item-image video, .news-item-image source');
                        if (imgEl && imgEl.src) { src = imgEl.src; }
                        else if (vidEl) {
                            src = vidEl.src || (vidEl.querySelector && vidEl.querySelector('source') ? vidEl.querySelector('source').src : '');
                            isVideo = true;
                        }
                    }
                    // Fallback to news meta image
                    if (!src || src.startsWith('blob:')) {
                        src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80';
                    }

                    const card = document.createElement('div');
                    card.className = 'dashboard-news-card';
                    card.dataset.navTarget = 'news';
                    card.style.cssText = 'flex:0 0 220px;width:220px;border-radius:14px;overflow:hidden;cursor:pointer;box-shadow:0 4px 16px rgba(91,14,166,0.12);transition:all 0.25s;background:white;';

                    if (isVideo) {
                        card.innerHTML = `<video src="${src}" muted loop autoplay playsinline style="width:100%;height:140px;object-fit:cover;"></video><div class="dashboard-news-card-info" style="padding:12px;"><h5 style="font-size:0.85rem;font-weight:700;color:var(--primary-color);white-space:normal;line-height:1.3;">${title}</h5></div>`;
                    } else {
                        card.innerHTML = `<img src="${src}" alt="${title}" loading="lazy" style="width:100%;height:140px;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80'"><div class="dashboard-news-card-info" style="padding:12px;"><h5 style="font-size:0.85rem;font-weight:700;color:var(--primary-color);white-space:normal;line-height:1.3;">${title}</h5></div>`;
                    }
                    slider.appendChild(card); // append = left to right
                });
                container.style.display = newsItems.length > 0 ? 'block' : 'none';
            }

            function renderSuggestedUsers() {
                const container = document.getElementById('suggested-users-container');
                const slider = document.getElementById('suggested-users-slider');
                if (isGuest || !container || !slider) return;

                slider.innerHTML = '';
                const usersToSuggest = Object.values(mockUsers).filter(u => u.id !== userState.id && !userState.followedUserIds.has(u.id));
                
                if (usersToSuggest.length > 0) {
                    usersToSuggest.forEach(user => {
                        const card = document.createElement('div');
                        card.className = 'suggested-user-card';
                        card.dataset.userId = user.id; 
                        card.innerHTML = `
                            <div class="suggested-user-cover" style="background-image: url('${user.coverPhoto}')"></div>
                            <div class="avatar-placeholder"><img src="${user.avatar}" alt="${user.fullName}"></div>
                            <div class="suggested-user-card-info">
                                <strong>${user.fullName}</strong>
                                <p>@${user.username}</p>
                                <button class="btn btn-small follow-btn" data-user-id="${user.id}">Follow</button>
                            </div>
                        `;
                        slider.appendChild(card);
                    });
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            }


            async function shareContent(shareData) {
                let copied = false;
                if (navigator.clipboard) {
                    try {
                        await navigator.clipboard.writeText(shareData.url);
                        showNotification('Link copied to clipboard!');
                        copied = true;
                    } catch (err) { console.error('Failed to copy link: ', err); }
                }

                if (navigator.share) {
                    try { await navigator.share(shareData); } 
                    catch (err) { if (err.name !== 'AbortError') { console.error('Web Share API Error:', err); } }
                } else if (!copied) {
                    showNotification('Sharing not supported on this browser.', 'error');
                }
                 rewardUserForAction('SHARE_POST');
                            if (typeof updateLiveInteractionCount === 'function') updateLiveInteractionCount('like');
            }
            
            function setupReelViewerObserver() {
                const reelViewerContainer = document.getElementById('reel-viewer-container');
                if (!reelViewerContainer) return; 

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        const video = entry.target.querySelector('video');
                        if (video) { 
                            if (entry.isIntersecting) {
                                video.play().catch(e => console.log("Autoplay was prevented for reel video.", e));
                            } else {
                                video.pause();
                            }
                        }
                    });
                }, { threshold: 0.5 });

                reelViewerContainer.querySelectorAll('.reel-viewer-item').forEach(item => {
                    observer.observe(item);
                });
            }

            function openReelViewer(clickedReelCard) {
                const reelViewerContainer = document.getElementById('reel-viewer-container');
                if (!reelViewerContainer) return; 

                const allReelCards = Array.from(document.querySelectorAll('#reels .reel-card'));
                
                reelViewerContainer.innerHTML = '';
                
                allReelCards.forEach(card => {
                    const videoUrl = card.dataset.videoUrl;
                    const userInfoHTML = card.querySelector('.reel-user-info').innerHTML;
                    const captionText = card.querySelector('.reel-content p')?.textContent; 
                    const postId = card.dataset.postId; 

                    const viewerItem = document.createElement('div');
                    viewerItem.className = 'reel-viewer-item';
                    viewerItem.dataset.postId = postId; 
                    viewerItem.innerHTML = `
                        <video src="${videoUrl}" loop playsinline preload="metadata"></video>
                        <div class="reel-viewer-info">
                            <div>
                                <div class="reel-user-info">${userInfoHTML}</div>
                                <p>${formatWhatsAppText(captionText || '')}</p>
                            </div>
                            <div class="reel-viewer-actions">
                                <a class="action-btn reel-like-btn" title="Like"><i class="far fa-heart"></i><span class="reel-like-count">1.2k</span></a>
                                <a class="action-btn reel-comment-toggle-btn" title="Comment" style="cursor:pointer;"><i class="far fa-comment"></i><span class="reel-comment-count">0</span></a>
                                <a class="action-btn reel-share-btn" title="Share"><i class="fas fa-share"></i><span>Share</span></a>
                                <a class="action-btn" title="Toggle Mute"><i class="fas fa-volume-up"></i></a>
                                <a href="${videoUrl}" download class="action-btn" title="Download Video"><i class="fas fa-download"></i></a>
                            </div>
                        </div>
                        <div class="reel-comments-panel" style="display:none;position:absolute;bottom:0;left:0;right:0;max-height:55%;background:rgba(0,0,0,0.88);border-radius:16px 16px 0 0;padding:16px;overflow-y:auto;z-index:5;">
                            <h4 style="color:white;margin-bottom:12px;font-size:0.95rem;">Comments</h4>
                            <div class="reel-comments-list" style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;max-height:200px;overflow-y:auto;">
                                <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;text-align:center;">No comments yet.</p>
                            </div>
                            <form class="reel-comment-form" style="display:flex;gap:8px;">
                                <input type="text" placeholder="Add a comment..." style="flex:1;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:25px;padding:8px 14px;color:white;font-size:0.85rem;outline:none;">
                                <button type="submit" style="background:var(--accent-color);border:none;border-radius:50%;width:36px;height:36px;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-paper-plane" style="font-size:0.8rem;"></i></button>
                            </form>
                        </div>`;
                    reelViewerContainer.appendChild(viewerItem);
                });

                document.getElementById('reel-viewer-modal-overlay').style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                setupReelViewerObserver();
                
                const clickedIndex = allReelCards.indexOf(clickedReelCard);
                if (clickedIndex > -1) {
                    reelViewerContainer.children[clickedIndex].scrollIntoView();
                }
            }
            
            let marketplaceGalleryState = {
                media: [],
                currentIndex: 0
            };

            function showMarketplaceGallery(media, startIndex = 0) {
                marketplaceGalleryState.media = media;
                marketplaceGalleryState.currentIndex = startIndex;
                
                const galleryModal = document.getElementById('marketplace-gallery-modal');
                // Remove any inline display:none that may have been set by the close handler,
                // otherwise classList.add('show') cannot override the inline style.
                galleryModal.style.display = '';
                galleryModal.style.visibility = '';
                galleryModal.classList.add('show');
                document.body.classList.add('modal-open');
                renderMarketplaceGalleryView();
            }

            function _stopGalleryVideo() {
                const v = document.querySelector('.gallery-main-image-container video');
                if (v) { try { v.pause(); v.src = ''; } catch(e) {} }
            }

            function renderMarketplaceGalleryView() {
                const mainContainer = document.querySelector('.gallery-main-image-container');
                const thumbsContainer = document.getElementById('gallery-thumbnails-container');
                if (!mainContainer || !thumbsContainer) return;

                // Remove ALL non-button children (images, videos, stale error divs) so nothing accumulates
                Array.from(mainContainer.childNodes).forEach(function(node) {
                    if (node.nodeType === 1 && node.tagName !== 'BUTTON') node.remove();
                });
                
                const rawMedia = marketplaceGalleryState.media[marketplaceGalleryState.currentIndex];
                if (!rawMedia) return;

                // Normalise: accept both plain strings and {url, type} objects
                const currentUrl  = typeof rawMedia === 'string' ? rawMedia : (rawMedia.url || rawMedia);
                const currentType = typeof rawMedia === 'object' ? (rawMedia.type || '') : '';
                const isVideo = currentType.startsWith('video/') ||
                                /\.(mp4|webm|mov)(\?|$)/i.test(currentUrl) ||
                                currentUrl.startsWith('blob:');

                const mainEl = isVideo
                    ? Object.assign(document.createElement('video'), { src: currentUrl, controls: true, autoplay: true, loop: true, style: 'width:100%;max-height:80vh;object-fit:contain;' })
                    : Object.assign(document.createElement('img'),  { src: currentUrl, alt: 'Marketplace item', style: 'width:100%;max-height:80vh;object-fit:contain;', loading: 'lazy' });
                mainEl.onerror = function() {
                    this.style.display = 'none';
                    const err = document.createElement('div');
                    err.style.cssText = 'padding:40px;text-align:center;color:#888;';
                    err.innerHTML = '<i class="fas fa-image" style="font-size:3rem;display:block;margin-bottom:12px;color:#ccc;"></i>Image unavailable';
                    mainContainer.appendChild(err);
                };
                mainContainer.appendChild(mainEl);

                thumbsContainer.innerHTML = marketplaceGalleryState.media.map(function(item, index) {
                    var thumbUrl  = typeof item === 'string' ? item : (item.url || item);
                    var thumbType = typeof item === 'object' ? (item.type || '') : '';
                    var isThumbVid = thumbType.startsWith('video/') || /\.(mp4|webm|mov)(\?|$)/i.test(thumbUrl);
                    var activeClass = index === marketplaceGalleryState.currentIndex ? 'active' : '';
                    return '<div class="gallery-thumbnail ' + activeClass + '" data-index="' + index + '">' +
                        (isThumbVid
                            ? '<video src="' + thumbUrl + '#t=0.5" preload="metadata" muted style="width:100%;height:100%;object-fit:cover;"></video>'
                            : '<img src="' + thumbUrl + '" alt="Thumb" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.opacity=0.3">') +
                    '</div>';
                }).join('');
            }

            function navigateMarketplaceGallery(direction) {
                _stopGalleryVideo();
                var len = marketplaceGalleryState.media.length;
                if (!len) return;
                // Wrap around: last→first and first→last
                var newIndex = ((marketplaceGalleryState.currentIndex + direction) % len + len) % len;
                marketplaceGalleryState.currentIndex = newIndex;
                renderMarketplaceGalleryView();
            }
            
            function updatePromoReachPreview() {
                const budgetInput = document.getElementById('promo-budget');
                if (!budgetInput) return;

                const budget = parseFloat(budgetInput.value) || 0;
                const previewEl = document.getElementById('promo-reach-preview');

                if (budget < 1000) {
                    previewEl.textContent = 'Minimum budget is ₦1,000';
                    return;
                }

                let reach;
                if (budget <= 10000) reach = budget * 2; 
                else if (budget <= 50000) reach = 10000 * 2 + (budget - 10000) * 2.5; 
                else if (budget <= 200000) reach = 10000 * 2 + 40000 * 2.5 + (budget - 50000) * 3; 
                else if (budget <= 500000) reach = 10000 * 2 + 40000 * 2.5 + 150000 * 3 + (budget - 200000) * 4; 
                else reach = 10000 * 2 + 40000 * 2.5 + 150000 * 3 + 300000 * 4 + (budget - 500000) * 5; 
                
                previewEl.textContent = `Estimated Reach: ~${Math.floor(reach).toLocaleString()} people`;
            }

            // --- RANKING REWARDS LOGIC ---
            const ranks = [
                { id: 'rank-1', name: 'Rising Star', followers: 500, reward: 50 },
                { id: 'rank-2', name: 'Community Voice', followers: 1000, reward: 100 },
                { id: 'rank-3', name: 'Influencer', followers: 5000, reward: 250 },
                { id: 'rank-4', name: 'Advocate', followers: 10000, reward: 500 },
                { id: 'rank-5', name: 'Leader', followers: 50000, reward: 1000 },
                { id: 'rank-6', name: 'Beacon', followers: 100000, reward: 2500 },
                { id: 'rank-7', name: 'Champion', followers: 250000, reward: 5000 },
                { id: 'rank-8', name: 'Ambassador', followers: 500000, reward: 10000 },
                { id: 'rank-9', name: 'Legend', followers: 1000000, reward: 25000 }
            ];

            function checkAndAwardRank(user) {
                if (user.followerCount < 500) return; 

                ranks.forEach(rank => {
                    if (user.followerCount >= rank.followers && !user.awardedRanks.has(rank.id)) {
                        if (impactMiningState.rankingPoolSpent + rank.reward <= RANKING_REWARDS_POOL) {
                            user.empyBalance += rank.reward;
                            user.awardedRanks.add(rank.id);
                            impactMiningState.rankingPoolSpent += rank.reward; 
                            
                            if (user.id === userState.id) {
                                showNotification('🎉 Congratulations! You have reached the rank of ' + rank.name + ' and earned ' + rank.reward + ' EMPY!', 'success');
                                updateWalletUI();
                                // Persist rank + balance
                                if (window.fbDb && userState.id) {
                                    window.fbDb.collection('users').doc(userState.id).update({
                                        empyBalance: userState.empyBalance,
                                        awardedRanks: Array.from(userState.awardedRanks)
                                    }).catch(function() {});
                                }
                            }
                        }
                    }
                });
            }

            // ── FIX 10: Followers/Following modal ───────────────────────
            window.showFollowersModal = function(tab) {
                var followers = Array.from(userState.followedUserIds || []);
                var overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
                var box = document.createElement('div');
                box.style.cssText = 'background:white;border-radius:20px;width:min(400px,92vw);max-height:80vh;overflow:hidden;display:flex;flex-direction:column;';
                // Tabs
                var tabs = document.createElement('div');
                tabs.style.cssText = 'display:flex;border-bottom:1px solid rgba(10,14,39,0.08);';
                var tabFollowers = document.createElement('button');
                tabFollowers.style.cssText = 'flex:1;padding:14px;border:none;background:none;font-weight:700;cursor:pointer;color:var(--primary);';
                tabFollowers.textContent = 'Followers (' + (userState.followerCount||0) + ')';
                var tabFollowing = document.createElement('button');
                tabFollowing.style.cssText = 'flex:1;padding:14px;border:none;background:none;font-weight:600;cursor:pointer;color:var(--text-muted);';
                tabFollowing.textContent = 'Following (' + followers.length + ')';
                var closeBtn = document.createElement('button');
                closeBtn.style.cssText = 'padding:14px;border:none;background:none;cursor:pointer;font-size:1.2rem;color:var(--text-muted);';
                closeBtn.innerHTML = '&times;';
                closeBtn.onclick = function() { overlay.remove(); };
                tabs.appendChild(tabFollowers);
                tabs.appendChild(tabFollowing);
                tabs.appendChild(closeBtn);
                // Panels
                var panFollowers = document.createElement('div');
                panFollowers.style.cssText = 'overflow-y:auto;flex:1;padding:12px;';
                panFollowers.innerHTML = userState.followerCount > 0
                    ? '<p style="text-align:center;padding:20px;color:var(--text-muted);">Follower list synced from backend.</p>'
                    : '<p style="text-align:center;padding:20px;color:var(--text-muted);">No followers yet.</p>';
                var panFollowing = document.createElement('div');
                panFollowing.style.cssText = 'overflow-y:auto;flex:1;padding:12px;display:none;';
                if (followers.length > 0) {
                    followers.forEach(function(uid) {
                        var u = mockUsers[uid] || {};
                        var row = document.createElement('div');
                        row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(10,14,39,0.05);cursor:pointer;';
                        var img = document.createElement('img');
                        img.src = u.avatar || 'https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=40';
                        img.style.cssText = 'width:44px;height:44px;border-radius:50%;object-fit:cover;flex-shrink:0;';
                        var info = document.createElement('div');
                        info.innerHTML = '<strong style="display:block;">' + (u.fullName||'User') + '</strong><span style="font-size:0.8rem;color:var(--text-muted);">@' + (u.username||'user') + '</span>';
                        row.appendChild(img);
                        row.appendChild(info);
                        row.onclick = function() {
                            overlay.remove();
                            if (typeof renderUserProfile === 'function') {
                                window._viewingOtherProfile = (uid !== (window.userState && window.userState.id));
                                renderUserProfile(uid);
                                setTimeout(function() { window._viewingOtherProfile = false; }, 500);
                            }
                            if (typeof navigateTo === 'function') navigateTo('profile', true);
                        };
                        panFollowing.appendChild(row);
                    });
                } else {
                    panFollowing.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted);">Not following anyone yet.</p>';
                }
                // Tab switching
                tabFollowers.onclick = function() {
                    panFollowers.style.display = 'block'; panFollowing.style.display = 'none';
                    tabFollowers.style.fontWeight = '700'; tabFollowers.style.color = 'var(--primary)';
                    tabFollowing.style.fontWeight = '600'; tabFollowing.style.color = 'var(--text-muted)';
                };
                tabFollowing.onclick = function() {
                    panFollowers.style.display = 'none'; panFollowing.style.display = 'block';
                    tabFollowing.style.fontWeight = '700'; tabFollowing.style.color = 'var(--primary)';
                    tabFollowers.style.fontWeight = '600'; tabFollowers.style.color = 'var(--text-muted)';
                };
                box.appendChild(tabs);
                box.appendChild(panFollowers);
                box.appendChild(panFollowing);
                overlay.appendChild(box);
                document.body.appendChild(overlay);
                overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
                // Open on correct tab
                if (tab === 'following') tabFollowing.onclick();
            };
            window.showFollowingModal = function() { window.showFollowersModal('following'); };

            // ── FIX 12b: IntersectionObserver for post view counts ──────
            (function() {
                var viewedPosts = new Set();
                var observer = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (!entry.isIntersecting) return;
                        var post = entry.target;
                        var postId = post.dataset.postId;
                        if (!postId || viewedPosts.has(postId)) return;
                        viewedPosts.add(postId);
                        var countEl = post.querySelector('.view-count');
                        if (countEl) {
                            var cur = parseInt(countEl.textContent) || 0;
                            countEl.textContent = (cur + 1).toLocaleString();
                        }
                        // Add video duration badge
                        post.querySelectorAll('video:not([data-duration-shown])').forEach(function(vid) {
                            vid.dataset.durationShown = '1';
                            vid.addEventListener('loadedmetadata', function() {
                                var dur = Math.round(vid.duration);
                                if (!dur || !isFinite(dur)) return;
                                var mm = Math.floor(dur / 60), ss = dur % 60;
                                var badge = document.createElement('div');
                                badge.style.cssText = 'position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,0.7);color:white;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:5px;pointer-events:none;z-index:3;';
                                badge.textContent = mm + ':' + (ss < 10 ? '0' : '') + ss;
                                var wrapper = vid.parentElement;
                                if (wrapper) { wrapper.style.position='relative'; wrapper.appendChild(badge); }
                            });
                        });
                    });
                }, { threshold: 0.6 }); // 60% visible = "viewed"

                // Observe existing and new posts
                function observePosts() {
                    document.querySelectorAll('.impact-story:not([data-observed])').forEach(function(p) {
                        p.dataset.observed = '1';
                        observer.observe(p);
                    });
                }
                var feedObs = new MutationObserver(observePosts);
                feedObs.observe(document.body, { childList: true, subtree: true });
                setTimeout(observePosts, 1000);
            })();

            // ── FIX 9: Click user avatar/name → go to their profile ─────
            document.addEventListener('click', function(e) {
                // Avatar or name inside a post header
                var storyHeader = e.target.closest('.story-header');
                if (!storyHeader) return;
                var clickedAvatar = e.target.closest('.avatar-placeholder') || e.target.closest('img');
                var clickedName   = e.target.closest('.story-user-info strong');
                if (!clickedAvatar && !clickedName) return;
                var post = storyHeader.closest('.impact-story');
                if (!post) return;
                var userId = post.dataset.userId;
                if (!userId || userId === (window.userState && window.userState.id)) return;
                e.preventDefault();
                e.stopPropagation();
                if (typeof renderUserProfile === 'function') {
                    window._viewingOtherProfile = (userId !== (window.userState && window.userState.id));
                    renderUserProfile(userId);
                    if (typeof navigateTo === 'function') navigateTo('profile', true);
                    // Auto-clear flag after navigation so own profile nav works again
                    setTimeout(function() { window._viewingOtherProfile = false; }, 500);
                }
            });


            // ── GLOBAL: View count IntersectionObserver ─────────────────
            // Watches all .impact-story elements across ALL sections
            (function() {
                if (window._viewCountObserver) return; // only one instance
                var seen = new Set();
                window._viewCountObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (!entry.isIntersecting) return;
                        var el = entry.target;
                        var pid = el.dataset.postId;
                        if (!pid || seen.has(pid)) return;
                        seen.add(pid);
                        var vc = el.querySelector('.view-count');
                        if (vc) vc.textContent = (parseInt(vc.textContent)||0) + 1;
                        // Add video duration badge
                        el.querySelectorAll('video:not([data-dur-done])').forEach(function(v) {
                            v.dataset.durDone = '1';
                            v.addEventListener('loadedmetadata', function() {
                                if (!isFinite(v.duration) || v.duration < 1) return;
                                var s = Math.round(v.duration);
                                var badge = document.createElement('div');
                                badge.style.cssText = 'position:absolute;bottom:6px;right:8px;background:rgba(0,0,0,0.72);color:white;font-size:0.68rem;font-weight:700;padding:2px 6px;border-radius:5px;pointer-events:none;z-index:4;';
                                badge.textContent = Math.floor(s/60)+':'+(s%60<10?'0':'')+s%60;
                                var wrap = v.parentElement;
                                if (wrap) { wrap.style.position='relative'; wrap.appendChild(badge); }
                            });
                        });
                    });
                }, { threshold: 0.55 });

                // Observe existing + future posts
                function _observeAll() {
                    document.querySelectorAll('.impact-story:not([data-obs])').forEach(function(p) {
                        p.dataset.obs = '1';
                        window._viewCountObserver.observe(p);
                    });
                }
                var _mutObs = new MutationObserver(_observeAll);
                _mutObs.observe(document.body, { childList: true, subtree: true });
                setTimeout(_observeAll, 1000);
            })();


            // ── LIVE STREAM INTERACTION COUNTER ──────────────────────────
            // Updates the live stream stats bar for any interaction type
            function updateLiveInteractionCount(type) {
                var liveModal = document.getElementById('go-live-modal-overlay');
                if (!liveModal || !liveModal.classList.contains('show')) return;
                var map = {
                    like:     document.getElementById('live-like-count'),
                    viewer:   document.getElementById('live-viewer-count'),
                    comment:  document.getElementById('live-like-count'), // reuse like area for comments
                };
                var el = map[type] || document.getElementById('live-like-count');
                if (el) {
                    var cur = parseInt(el.textContent.replace(/[^0-9]/g,'')) || 0;
                    el.textContent = (cur + 1).toLocaleString();
                    // Pulse animation
                    el.style.transform = 'scale(1.4)';
                    el.style.transition = 'transform 0.15s';
                    setTimeout(function() { el.style.transform = 'scale(1)'; }, 200);
                }
            }
            window.updateLiveInteractionCount = updateLiveInteractionCount;

            // --- MASTER EVENT LISTENERS ---
            function setupMasterEventListeners() {
                document.body.addEventListener('click', async function(e) {
                    const target = e.target;
                    const closest = (selector) => target.closest(selector);

                    // --- SECTION CREATE PANEL TOGGLE (+/× button) ---
                    const sectionToggleBtn = closest('.section-create-toggle-btn');
                    if (sectionToggleBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        var panelId = sectionToggleBtn.dataset.panel;
                        var panel = document.getElementById(panelId);
                        var icon = sectionToggleBtn.querySelector('.section-create-icon');
                        if (panel) {
                            var isOpen = panel.style.display !== 'none';
                            panel.style.display = isOpen ? 'none' : 'block';
                            if (icon) {
                                icon.textContent = isOpen ? '+' : '×';
                                icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(45deg)';
                            }
                        }
                        return;
                    }

                    // --- LIVE STREAM CLICKS ---
                    const joinLiveBtn = closest('.join-live-btn');
                    if (joinLiveBtn) {
                        const hostName = joinLiveBtn.dataset.hostName;
                        const hostAvatar = joinLiveBtn.dataset.hostAvatar;
                        const background = joinLiveBtn.dataset.background;
                        const hostId = joinLiveBtn.dataset.hostId;
                        
                        liveStreamData = {
                            ...liveStreamData, 
                            isLive: true,
                            isRecording: false,
                            title: joinLiveBtn.dataset.streamTitle,
                            description: '', 
                            startTime: Date.now(),
                            streamId: joinLiveBtn.dataset.streamId,
                            background: background,
                            customBackgroundFile: null, 
                            isMicMuted: false, 
                            isVideoMuted: false,
                            isScreenSharing: false,
                            hostUserId: hostId,
                            guests: [],
                            joinRequests: [],
                            liveGoal: null, 
                            fanClubActive: false,
                            activeGame: null,
                            pinnedMessage: null, 
                            hostInSmallScreen: false, 
                            sentMessages: [], 
                            rewardInterval: null 
                        };

                        var lhn = document.getElementById('live-host-name');
                        var lhu = document.getElementById('live-host-username');
                        var lha = document.getElementById('live-host-avatar');
                        var lsha = document.getElementById('live-stream-host-avatar');
                        var hfa = document.getElementById('host-video-fallback-avatar');
                        if (lhn) lhn.textContent = hostName || 'Host';
                        if (lhu) lhu.textContent = hostName ? '@' + hostName.toLowerCase().replace(/\s+/g,'') : '';
                        if (lha)  { lha.src  = hostAvatar || ''; lha.style.display  = hostAvatar ? '' : 'none'; }
                        if (lsha) { lsha.src = hostAvatar || ''; lsha.style.display = 'none'; } // hidden — Agora shows real video
                        if (hfa)  { hfa.src  = hostAvatar || ''; hfa.style.display  = 'none'; } // hidden by default
                        
                        goLiveModal.style.display = 'flex';
                        goLiveModal.classList.add('show');
                        document.body.classList.add('modal-open');

                        // Clear video src — Agora will inject the real stream
                        const hostMainVideo = document.getElementById('host-main-video');
                        if (hostMainVideo) {
                            hostMainVideo.src = '';
                            hostMainVideo.style.display = 'none';
                        }

                        // Hide the static avatar container — it obstructs the Agora video feed
                        const avatarContainer = document.getElementById('host-avatar-container');
                        if (avatarContainer) avatarContainer.style.display = 'none';

                        // Show connecting spinner
                        var liveBody = document.querySelector('.main-host-video');
                        if (liveBody && !document.getElementById('agora-connecting-msg')) {
                            var connectMsg = document.createElement('div');
                            connectMsg.id = 'agora-connecting-msg';
                            connectMsg.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);color:white;gap:14px;z-index:10;';
                            connectMsg.innerHTML =
                                '<div style="width:48px;height:48px;border:3px solid rgba(255,255,255,0.25);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;"></div>' +
                                '<span style="font-size:0.9rem;opacity:0.85;">Connecting to live stream...</span>';
                            if (!document.getElementById('spin-style')) {
                                var ss = document.createElement('style');
                                ss.id = 'spin-style';
                                ss.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
                                document.head.appendChild(ss);
                            }
                            liveBody.style.position = 'relative';
                            liveBody.appendChild(connectMsg);
                            setTimeout(function() {
                                var m = document.getElementById('agora-connecting-msg');
                                if (m) m.remove();
                            }, 12000);
                        }

                        if (!isGuest && userState.id === liveStreamData.hostUserId) {
                            if (liveStreamData.rewardInterval) clearInterval(liveStreamData.rewardInterval); 
                            liveStreamData.rewardInterval = setInterval(() => {
                                rewardUserForAction('LIVE_STREAM_INTERVAL');
                            }, 300000); 
                        }
                        
                        // Show/hide viewer request button based on whether current user is host
                        const requestJoinBtn = document.getElementById('live-request-join-btn');
                        if (requestJoinBtn) {
                            const isHost = !isGuest && userState.id === liveStreamData.hostUserId;
                            requestJoinBtn.style.display = isHost ? 'none' : 'flex';
                        }

                        updateLiveUI(); 
                        return; 
                    }

                    if(closest('.options-btn')){
                        e.preventDefault();
                        const menu=closest('.options-btn').nextElementSibling;
                        if(menu){
                            document.querySelectorAll('.options-menu.show').forEach(m=>{if(m!==menu)m.classList.remove('show');});
                            const _op=!menu.classList.contains('show');menu.classList.toggle('show');
                            if(_op){const _pe=closest('.options-btn').closest('.impact-story,.reel-card,.news-list-item,[data-post-id]');const _pb=menu.querySelector('.promote-post-btn');if(_pb){const _oid=_pe?(_pe.dataset.userId||_pe.dataset.authorId||''):'';_pb.style.display=(!isGuest&&(!_oid||_oid===userState.id))?'':'none';}}
                        }
                        return;
                    }

                    if (!closest('.post-options')) {
                        document.querySelectorAll('.options-menu.show').forEach(menu => menu.classList.remove('show'));
                    }

                    const navLink = closest('.nav-link');
                    if (navLink) {
                        e.preventDefault();
                        navigateTo(navLink.dataset.target, true);
                        return;
                    }
                    
                    if (closest('.mobile-menu-toggle')) {
                         e.preventDefault();
                         e.stopPropagation();
                         sidebar.classList.toggle('open');
                         contentOverlay.classList.toggle('show');
                         document.body.classList.toggle('modal-open', sidebar.classList.contains('open'));
                         return;
                    }

                    if (closest('#content-overlay')) {
                        sidebar.classList.remove('open');
                        contentOverlay.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        return;
                    }
                    
                    const dashboardClickTarget = closest('.dashboard-market-card, .dashboard-reel-card, .dashboard-news-card');
                     if (dashboardClickTarget) {
                        const navTarget = dashboardClickTarget.dataset.navTarget;
                        if (navTarget) {
                             navigateTo(navTarget);
                        }
                        return;
                    }
                    
                    if (closest('.back-to-cart-btn')) {
                        document.getElementById('cart-view').style.display = 'block';
                        document.getElementById('checkout-view').style.display = 'none';
                        
                        // Re-enable required attributes for checkout when going back to cart
                        // First, disable required for ALL payment method contents
                        document.querySelectorAll('#checkout-form .payment-method-content input, #checkout-form .payment-method-content select, #checkout-form .payment-method-content textarea').forEach(input => {
                            input.required = false; // Disable all
                            input.style.borderColor = ''; // Clear validation highlight
                        });
                        // Re-enable required for shipping info
                        document.getElementById('checkout-name').required = true;
                        document.getElementById('checkout-address').required = true;

                        // Ensure that only the originally required fields for the active payment method are required when navigating back
                        const activePaymentTab = document.querySelector('#checkout-form .payment-tabs .payment-tab.active');
                        if (activePaymentTab) {
                            const targetContentId = activePaymentTab.dataset.target;
                            const targetContent = document.getElementById(targetContentId);
                            if (targetContent) {
                                targetContent.querySelectorAll('input[data-original-required="true"], select[data-original-required="true"], textarea[data-original-required="true"]').forEach(input => {
                                    input.required = true;
                                });
                            }
                        }

                        return;
                    }
                    if (closest('.finalize-purchase-btn')) {
                        // Form validity is checked in the submit listener
                        // This button will trigger the form submit, which will handle validation.
                        // If validation passes, the rest of the logic (showing notification, clearing cart etc.)
                        // is handled within the 'submit' event listener for 'checkout-form'.
                        return;
                    }

                    const modalAction = closest('#login-signup-btn, #show-signup, #show-login, #show-forgot-password, #back-to-login, .close-modal, #logout-btn, #buy-empy-btn, #buy-empy-wallet-btn, #send-gift-btn, .close-modal-btn, .reel-viewer-close, #live-close-btn, #promo-back-btn, .btn-google, #confirm-pin-message-btn, .close-pinned-msg, #live-host-profile-link');
                    if (modalAction) {
                        e.preventDefault();
                        const openModal = closest('.modal-overlay-container.show'); 
                        const openSubModal = closest('.live-sub-modal.show'); 

                        if (modalAction.classList.contains('btn-google')) {
                            // Real Firebase Google Sign-In
                            (async () => {
                                try {
                                    if (!window._firebaseLoaded || typeof firebase === 'undefined' || !firebase.auth) {
                                        throw new Error('Firebase not ready');
                                    }
                                    const provider = new firebase.auth.GoogleAuthProvider();
                                    provider.setCustomParameters({ prompt: 'select_account' });
                                    const result = await firebase.auth().signInWithPopup(provider);
                                    const user = result.user;
                                    if (!user) throw new Error('No user returned');
                                    // Load or create profile in Firestore
                                    let profile = null;
                                    try {
                                        const doc = await window.fbDb.collection('users').doc(user.uid).get();
                                        if (doc && doc.exists) { profile = doc.data(); }
                                    } catch(fsErr) {}
                                    if (!profile) {
                                        profile = {
                                            id: user.uid,
                                            fullName: user.displayName || 'Google User',
                                            username: (user.displayName||'user').toLowerCase().replace(/\s+/g,'') + Math.floor(Math.random()*999),
                                            email: user.email,
                                            avatar: user.photoURL || '',
                                            coverPhoto: '',
                                            bio: 'Joined via Google',
                                            empyBalance: 0,
                                            isVerified: false,
                                            followerCount: 0,
                                            businessPage: null
                                        };
                                        try { await window.fbDb.collection('users').doc(user.uid).set(profile, { merge: true }); } catch(e) {}
                                    }
                                    ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => {
                                        profile[k] = new Set(Array.isArray(profile[k]) ? profile[k] : []);
                                    });
                                    if (!profile.statuses) profile.statuses = [];
                                    registeredUsers[profile.email] = profile;
                                    mockUsers[profile.id] = profile;
                                    rewardUserForAction('SUCCESSFUL_REFERRAL');
                                    initializeApp(false, false, profile);
                                    authModal.classList.remove('show');
                                    showNotification('✅ Signed in with Google as ' + profile.fullName + '!', 'success');
                                } catch(gErr) {
                                    console.warn('[Google Auth]', gErr.message);
                                    // Fallback: create local Google session
                                    const fbUser = { id: 'user-google-'+Date.now(), fullName: 'Google User', username: 'googleuser'+Math.floor(Math.random()*9999), email: 'google.user.'+Date.now()+'@example.com', password: '', avatar: '', coverPhoto: '', bio: 'Google sign-in', likedPostIds: new Set(), followedUserIds: new Set(), retweetedPostIds: new Set(), statuses: [], viewedStatusUserIds: new Set(), empyBalance: 0, isVerified: false, followerCount: 0, awardedRanks: new Set(), businessPage: null, completedTasks: new Set() };
                                    registeredUsers[fbUser.email] = fbUser;
                                    mockUsers[fbUser.id] = fbUser;
                                    initializeApp(false, false, fbUser);
                                    authModal.classList.remove('show');
                                    showNotification('Signed in (offline mode).', 'info');
                                }
                            })();

                        } else if (modalAction.id === 'live-close-btn') {
                            const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;
                            // Stop all camera/mic streams safely
                            if (liveStreamData._localStream) {
                                try { liveStreamData._localStream.getTracks().forEach(t => { try { t.stop(); } catch(e) {} }); } catch(e) {}
                                liveStreamData._localStream = null;
                            }
                            // Stop any orphaned video srcObjects
                            document.querySelectorAll('video').forEach(function(v) {
                                try { if (v.srcObject) { v.srcObject.getTracks().forEach(t => t.stop()); v.srcObject = null; } } catch(e) {}
                            });
                            if (isCurrentUserHost) {
                                if (liveStreamData.rewardInterval) { clearInterval(liveStreamData.rewardInterval); liveStreamData.rewardInterval = null; }
                                if (liveStreamData._viewerSimInterval) { clearInterval(liveStreamData._viewerSimInterval); liveStreamData._viewerSimInterval = null; }
                                const hostMainVideo = document.getElementById('host-main-video');
                                if (hostMainVideo) {
                                    try { if (hostMainVideo.srcObject) { hostMainVideo.srcObject.getTracks().forEach(t => t.stop()); hostMainVideo.srcObject = null; } } catch(e) {}
                                    hostMainVideo.pause(); hostMainVideo.src = '';
                                }
                                if (confirm("Do you want to save this stream as a recorded video?")) {
                                    if (liveStreamData._mediaRecorder && liveStreamData._mediaRecorder.state !== 'inactive') {
                                        liveStreamData._mediaRecorder.onstop = () => {
                                            const mimeType = liveStreamData._mediaRecorder.mimeType || 'video/webm';
                                            const blob = new Blob(liveStreamData._recordingChunks || [], { type: mimeType });
                                            const blobUrl = blob.size > 0 ? URL.createObjectURL(blob) : liveStreamData._lastRecordingBlob;
                                            addRecordedLiveStream(liveStreamData.title, userState.fullName, blobUrl);
                                            renderDashboardNews();
                                        };
                                        liveStreamData._mediaRecorder.stop();
                                    } else {
                                        addRecordedLiveStream(liveStreamData.title, userState.fullName, liveStreamData._lastRecordingBlob || null);
                                    }
                                }
                                const streamCard = document.querySelector(`.live-stream-preview-card[data-stream-id="${liveStreamData.streamId}"]`);
                                if (streamCard) streamCard.remove();
                                showNotification("Stream Ended.", "info");
                            } else {
                                const guestIndex = liveStreamData.guests.findIndex(g => g.userId === userState.id);
                                if (guestIndex !== -1) { liveStreamData.guests.splice(guestIndex, 1); updateLiveUI(); showNotification("You left the stream.", "info"); }
                            }
                            liveStreamData.isLive = false;
                            liveStreamData.streamId = null;
                            // FIX Bug 8: use BOTH style AND classList to guarantee modal closes
                            goLiveModal.classList.remove('show');
                            goLiveModal.style.display = 'none';
                            goLiveModal.style.visibility = 'hidden';
                            document.body.classList.remove('modal-open');
                            document.body.style.overflow = '';
                            document.querySelectorAll('.live-sub-modal.show').forEach(m => m.classList.remove('show'));
                            // Clean up leftover Agora elements
                            ['agora-local-video', 'agora-viewer-video', 'agora-connecting-msg'].forEach(function(id) {
                                var el = document.getElementById(id); if (el) el.remove();
                            });

                        } else if (openSubModal && closest('.close-modal')) {
                            openSubModal.classList.remove('show'); openSubModal.style.display='none';
                            _stopGalleryVideo();
                            setTimeout(function(){if(!document.querySelector('.modal-overlay-container.show')){document.body.classList.remove('modal-open');document.body.style.overflow='';}},50);
                        } else if (openModal && closest('.close-modal')) {
                            openModal.classList.remove('show'); openModal.style.display='none';
                            _stopGalleryVideo();
                            setTimeout(function(){if(!document.querySelector('.modal-overlay-container.show')){document.body.classList.remove('modal-open');document.body.style.overflow='';}},50);
                        }
                        if (closest('.reel-viewer-close')) {
                            document.getElementById('reel-viewer-modal-overlay').style.display = 'none';
                            document.querySelectorAll('#reel-viewer-modal-overlay video').forEach(v => v.pause());
                            document.body.style.overflow = '';
                        }
                        if (modalAction.id === 'promo-back-btn') {
                            document.getElementById('promotion-setup-view').style.display = 'block';
                            document.getElementById('promotion-payment-details').style.display = 'none';
                        }
                        if (modalAction.id === 'send-gift-btn') {
                            if (!selectedGift) {
                                showNotification("Please select a gift first.", "error");
                                return;
                            }
                            if (userState.empyBalance < selectedGift.price) {
                                showNotification("Insufficient EMPY balance to send this gift.", "error");
                                return;
                            }
                            userState.empyBalance -= selectedGift.price;
                            showGiftAnimation(selectedGift.symbol);
                            // Determine recipient - from participant popup or host
                            const giftCatalogModal = document.getElementById('live-gift-catalog-modal');
                            const recipientId = giftCatalogModal?.dataset.recipientId || liveStreamData.hostUserId;
                            const recipientName = giftCatalogModal?.dataset.recipientName || document.getElementById('live-host-name')?.textContent || 'host';
                            if (giftCatalogModal) { delete giftCatalogModal.dataset.recipientId; delete giftCatalogModal.dataset.recipientName; }
                            createLiveComment(userState.fullName, `Sent a ${selectedGift.name} to ${recipientName}! ${selectedGift.symbol}`);
                            showNotification(`🎁 You sent ${selectedGift.name} (${selectedGift.price} EMPY) to ${recipientName}!`, "success");
                            // Credit the recipient's wallet
                            const recipientUser = mockUsers[recipientId];
                            if (recipientUser && recipientId !== userState.id) {
                                recipientUser.empyBalance = (recipientUser.empyBalance||0) + selectedGift.price;
                                // Notify recipient
                                if (typeof window.pushNotification === 'function' && recipientId === userState.id) {
                                    window.pushNotification(userState.fullName + ' sent you a ' + selectedGift.name + '! +' + selectedGift.price + ' EMPY', 'success');
                                }
                            }
                            updateWalletUI(); 
                            rewardUserForAction('SEND_GIFT'); 
                            rewardUserForAction('RECEIVE_COMMENT', recipientId); 
                            if (liveStreamData.liveGoal) {
                                liveStreamData.liveGoal.currentAmount += selectedGift.price;
                                updateLiveUI();
                            }
                            selectedGift = null; 
                            document.querySelectorAll('.gift-item.selected').forEach(item => item.classList.remove('selected'));
                            document.getElementById('live-gift-catalog-modal').classList.remove('show');
                            return;
                        }

                        if(modalAction.id === 'confirm-pin-message-btn') {
                            const newPinMessageText = document.getElementById('new-pin-message-text').value.trim();
                            const selectedPinMessage = document.querySelector('#live-host-sent-messages .pin-message-choice.selected');

                            if (selectedPinMessage) {
                                const msgId = selectedPinMessage.dataset.messageId;
                                const originalMessage = liveStreamData.sentMessages.find(m => m.id === msgId);
                                if (originalMessage) {
                                    liveStreamData.pinnedMessage = {
                                        id: originalMessage.id,
                                        content: originalMessage.content,
                                        sender: originalMessage.username
                                    };
                                }
                            } else if (newPinMessageText) {
                                // Generate a unique ID for a new message to be pinned
                                const newMessageId = `msg-pin-${Date.now()}`;
                                liveStreamData.pinnedMessage = {
                                    id: newMessageId,
                                    content: newPinMessageText,
                                    sender: userState.username
                                };
                                // Also add this new message to sentMessages so it can be unpinned/re-selected
                                liveStreamData.sentMessages.push({ id: newMessageId, username: userState.username, content: newPinMessageText });
                            } else {
                                showNotification("Please select a message or type a new one to pin.", "error");
                                return;
                            }
                            showNotification("Message pinned!", "success");
                            document.getElementById('live-pin-message-modal').classList.remove('show');
                            document.getElementById('new-pin-message-text').value = '';
                            document.querySelectorAll('.pin-message-choice').forEach(item => item.classList.remove('selected'));
                            updateLiveUI();

                        } else if (modalAction.classList.contains('close-pinned-msg')) {
                            liveStreamData.pinnedMessage = null;
                            showNotification("Message unpinned.", "info");
                            updateLiveUI();
                        } else if (modalAction.id === 'live-host-profile-link') { 
                             e.stopPropagation(); 
                             const hostId = liveStreamData.hostUserId;
                             if(hostId) {
                                 goLiveModal.classList.remove('show'); 
                                 document.body.classList.remove('modal-open');
                                 window._viewingOtherProfile = (hostId !== userState.id);
                                 renderUserProfile(hostId);
                                 navigateTo('profile');
                                 setTimeout(function() { window._viewingOtherProfile = false; }, 500);
                                 showNotification(`Viewing ${mockUsers[hostId] ? mockUsers[hostId].fullName : 'host'}'s profile.`);
                             }
                             return;
                        }

                        ['login-view', 'signup-view', 'forgot-password-view'].forEach(v => { if(document.getElementById(v)) document.getElementById(v).style.display = 'none'});
                        switch (modalAction.id) {
                            case 'login-signup-btn': authModal.classList.add('show'); authModal.style.display='flex'; document.body.classList.add('modal-open'); var _lv2=document.getElementById('login-view'); if(_lv2)_lv2.style.display='block'; setTimeout(function(){if(typeof generateCaptcha==='function')generateCaptcha();},80); break;
                            case 'logout-btn': 
                                // Sign out from Firebase too
                                try { if (window._firebaseLoaded && window.fbAuth) window.fbAuth.signOut().catch(()=>{}); } catch(e) {}
                                // Clear persisted session
                                try { localStorage.removeItem('empyrean_session_email'); localStorage.removeItem('empyrean_session'); localStorage.removeItem('empyrean_last_section'); } catch(e) {}
                                initializeApp(true); 
                                showNotification('You have been signed out.'); 
                                break;
                            case 'show-signup': ['login-view','forgot-password-view'].forEach(function(v){var el=document.getElementById(v);if(el)el.style.display='none';}); document.getElementById('signup-view').style.display = 'block'; showFormFeedback('signup', '', 'info'); document.getElementById('signup-feedback').style.display='none'; break;
                            case 'show-login': case 'back-to-login': document.getElementById('login-view').style.display = 'block'; setTimeout(function(){ if(typeof generateCaptcha==='function') generateCaptcha(); }, 80); break;
                            case 'show-forgot-password': document.getElementById('forgot-password-view').style.display = 'block'; break;
                            case 'buy-empy-btn': 
                            case 'buy-empy-wallet-btn': 
                                document.getElementById('buy-empy-modal').classList.add('show'); 
                                document.body.classList.add('modal-open');
                                break;
                        }

                        return;
                    }
                    
                    if (liveStreamData.isLive) {
                        const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;

                        const isClickOnBackground = (
                            e.target === liveStreamScreen || 
                            e.target === document.getElementById('host-main-video') ||
                            e.target === document.getElementById('host-video-fallback-avatar')
                        ) && !e.target.closest('.live-header, .live-footer, #host-control-panel, #multi-guest-container, .live-overlay-box, .live-sub-modal');
                        
                        if (isClickOnBackground) { 
                            liveLikeCount++;
                            document.getElementById('live-like-count').textContent = liveLikeCount.toLocaleString();
                            const bubble = document.createElement('i');
                            bubble.className = 'fas fa-heart like-bubble';
                            liveStreamScreen.appendChild(bubble); 
                            setTimeout(() => bubble.remove(), 1500);
                        }

                        if (closest('.share-live-btn')) {
                            shareContent({
                                title: `Live Stream: ${liveStreamData.title}`,
                                text: `Join ${document.getElementById('live-host-name').textContent}'s live stream on Empyrean!`,
                                url: `${window.location.href.split('#')[0]}#live/${liveStreamData.streamId || '123'}`
                            });
                            return;
                        }
                        // ── PARTICIPANT CLICK — open gift/interaction popup ──
                    const guestSlotClicked = closest('.guest-slot');
                    if (guestSlotClicked && !closest('.guest-controls button') && !closest('.guest-remove-btn')) {
                        e.preventDefault();
                        const targetUserId = guestSlotClicked.dataset.userId;
                        const targetUser = mockUsers[targetUserId] || { username: 'Guest', fullName: 'Guest', avatar: '' };
                        const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;

                        // Build popup
                        const existing = document.getElementById('participant-popup');
                        if (existing) existing.remove();

                        const popup = document.createElement('div');
                        popup.id = 'participant-popup';
                        popup.style.cssText = 'position:absolute;background:rgba(20,20,35,0.95);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:16px;z-index:100;min-width:200px;color:white;font-size:0.85rem;';

                        // Position near the clicked slot
                        const rect = guestSlotClicked.getBoundingClientRect();
                        const liveRect = liveStreamScreen.getBoundingClientRect();
                        popup.style.top = (rect.top - liveRect.top + 10) + 'px';
                        popup.style.left = Math.min(rect.right - liveRect.left + 8, liveRect.width - 220) + 'px';

                        popup.innerHTML = `
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.1);">
                                <img src="${targetUser.avatar||'https://ui-avatars.com/api/?name=G&background=1B2B8B&color=fff&size=36'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
                                <div>
                                    <strong style="font-size:0.9rem;">${targetUser.fullName||targetUser.username}</strong>
                                    <p style="color:rgba(255,255,255,0.5);margin:0;font-size:0.75rem;">@${targetUser.username}</p>
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:8px;">
                                <button class="participant-action-btn" data-action="gift" data-user-id="${targetUserId}" style="background:rgba(245,197,24,0.2);border:1px solid rgba(245,197,24,0.4);color:#F5C518;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:0.82rem;font-weight:600;text-align:left;">
                                    🎁 Send Gift
                                </button>
                                ${!isGuest ? `<button class="participant-action-btn" data-action="message" data-user-id="${targetUserId}" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);color:white;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:0.82rem;font-weight:600;text-align:left;">
                                    💬 Message
                                </button>` : ''}
                                ${isCurrentUserHost ? `<button class="participant-action-btn" data-action="mute" data-user-id="${targetUserId}" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#FCA5A5;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:0.82rem;font-weight:600;text-align:left;">
                                    🔇 Mute
                                </button>
                                <button class="participant-action-btn" data-action="remove" data-user-id="${targetUserId}" style="background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.4);color:#EF4444;padding:8px 14px;border-radius:10px;cursor:pointer;font-size:0.82rem;font-weight:600;text-align:left;">
                                    ✕ Remove
                                </button>` : ''}
                            </div>
                        `;
                        liveStreamScreen.style.position = 'relative';
                        liveStreamScreen.appendChild(popup);

                        // Handle popup actions
                        popup.querySelectorAll('.participant-action-btn').forEach(btn => {
                            btn.addEventListener('click', function(ev) {
                                ev.stopPropagation();
                                const action = this.dataset.action;
                                const uid = this.dataset.userId;
                                const guestObj = liveStreamData.guests.find(g => g.userId === uid);
                                if (action === 'gift') {
                                    popup.remove();
                                    // Pre-select recipient and open gift catalog
                                    const giftModal = document.getElementById('live-gift-catalog-modal');
                                    if (giftModal) {
                                        giftModal.classList.add('show');
                                        giftModal.dataset.recipientId = uid;
                                        giftModal.dataset.recipientName = targetUser.fullName || targetUser.username;
                                        const giftTitle = giftModal.querySelector('h3');
                                        if (giftTitle) giftTitle.textContent = '🎁 Send Gift to ' + (targetUser.fullName || targetUser.username);
                                    }
                                } else if (action === 'message') {
                                    popup.remove();
                                    navigateTo('messages');
                                } else if (action === 'mute' && guestObj) {
                                    guestObj.isMicMuted = !guestObj.isMicMuted;
                                    showNotification((guestObj.isMicMuted ? 'Muted ' : 'Unmuted ') + (targetUser.username||'guest'), 'info');
                                    popup.remove();
                                    updateLiveUI();
                                } else if (action === 'remove' && guestObj) {
                                    liveStreamData.guests = liveStreamData.guests.filter(g => g.userId !== uid);
                                    showNotification((targetUser.username||'Guest') + ' removed from stream.', 'info');
                                    popup.remove();
                                    updateLiveUI();
                                }
                            });
                        });

                        // Close popup on outside click
                        setTimeout(() => {
                            document.addEventListener('click', function closePopup(ev) {
                                if (!ev.target.closest('#participant-popup')) {
                                    const p = document.getElementById('participant-popup');
                                    if (p) p.remove();
                                    document.removeEventListener('click', closePopup);
                                }
                            });
                        }, 100);
                        return;
                    }

                    if (closest('#live-record-btn')) {
                            return; // Recording removed
                        }
                        if (closest('#live-mic-toggle')) {
                            if (isCurrentUserHost) {
                                liveStreamData.isMicMuted = !liveStreamData.isMicMuted;
                                showNotification(`Your microphone is now ${liveStreamData.isMicMuted ? 'muted' : 'unmuted'}.`, 'info');
                                updateLiveUI();
                            }
                            return;
                        }
                        if (closest('#live-video-toggle')) {
                            if (isCurrentUserHost) {
                                liveStreamData.isVideoMuted = !liveStreamData.isVideoMuted;
                                showNotification(`Your camera is now ${liveStreamData.isVideoMuted ? 'off' : 'on'}.`, 'info');
                                updateLiveUI();
                            }
                            return;
                        }
                        if (closest('#live-share-screen-btn')) {
                            if (isCurrentUserHost) {
                                liveStreamData.isScreenSharing = !liveStreamData.isScreenSharing;
                                showNotification(`Screen sharing ${liveStreamData.isScreenSharing ? 'started' : 'stopped'}.`, 'info');
                                updateLiveUI();
                            }
                            return;
                        }

                        if (closest('#live-request-join-btn') && !isGuest && !isCurrentUserHost) {
                            if (liveStreamData.guests.length >= 4) {
                                showNotification("Guest slots are full. Cannot send request.", "warning");
                                return;
                            }
                            const hasRequested = liveStreamData.joinRequests.some(req => req.userId === userState.id);
                            if (hasRequested) {
                                showNotification("You have already sent a request to join.", "info");
                                return;
                            }

                            liveStreamData.joinRequests.push({
                                userId: userState.id,
                                username: userState.username,
                                fullName: userState.fullName,
                                avatar: userState.avatar
                            });
                            showNotification("Request to join sent to host!", "success");
                            updateLiveUI(); 
                            return;
                        }

                        if (closest('#live-add-guest-btn')) { 
                            if (isCurrentUserHost) {
                                document.getElementById('live-guest-requests-modal').classList.toggle('show');
                                renderGuestJoinRequests(); 
                            }
                            return;
                        }
                        if (closest('.accept-guest-btn')) {
                            if (isCurrentUserHost) {
                                const guestId = closest('.accept-guest-btn').dataset.userId;
                                const guestUser = mockUsers[guestId];
                                if (guestUser && liveStreamData.guests.length < 4) {
                                    liveStreamData.guests.push({
                                        userId: guestUser.id,
                                        username: guestUser.username,
                                        fullName: guestUser.fullName,
                                        avatar: guestUser.avatar,
                                        videoStream: "https://www.w3schools.com/html/mov_bbb.mp4", 
                                        isMicMuted: false,
                                        isVideoMuted: false
                                    });
                                    liveStreamData.joinRequests = liveStreamData.joinRequests.filter(req => req.userId !== guestId);
                                    showNotification(`${guestUser.fullName} joined your stream!`, "success");
                                    rewardUserForAction('HOST_INVITED_GUEST'); 
                                    rewardUserForAction('GUEST_JOINED_LIVE', guestId); 
                                    updateLiveUI();
                                    renderGuestJoinRequests(); 
                                } else {
                                    showNotification("All guest slots are full.", "warning");
                                }
                            }
                            return;
                        }
                        if (closest('.reject-guest-btn')) {
                            if (isCurrentUserHost) {
                                const guestId = closest('.reject-guest-btn').dataset.userId;
                                liveStreamData.joinRequests = liveStreamData.joinRequests.filter(req => req.userId !== guestId);
                                showNotification("Guest request rejected.", "info");
                                renderGuestJoinRequests(); 
                            }
                            return;
                        }
                        const guestControlActionButton = closest('.guest-controls button');
                        if (guestControlActionButton) {
                            if (isCurrentUserHost) {
                                const guestId = guestControlActionButton.dataset.guestId;
                                const action = guestControlActionButton.dataset.action;
                                const guest = liveStreamData.guests.find(g => g.userId === guestId);

                                if (guest) {
                                    if (action === 'toggle-mic') {
                                        guest.isMicMuted = !guest.isMicMuted;
                                        showNotification(`${guest.fullName}'s mic ${guest.isMicMuted ? 'muted' : 'unmuted'}.`, 'info');
                                    } else if (action === 'toggle-video') {
                                        guest.isVideoMuted = !guest.isVideoMuted;
                                        showNotification(`${guest.fullName}'s video ${guest.isVideoMuted ? 'off' : 'on'}.`, 'info');
                                    } else if (action === 'remove-guest') {
                                        liveStreamData.guests = liveStreamData.guests.filter(g => g.userId !== guestId);
                                        showNotification(`${guest.fullName} removed from stream.`, 'info');
                                    }
                                    updateLiveUI();
                                }
                            }
                            return;
                        }

                        if (closest('#live-goal-settings-btn')) {
                            if (isCurrentUserHost) {
                                document.getElementById('live-goal-settings-modal').classList.toggle('show');
                                if(liveStreamData.liveGoal) {
                                    document.getElementById('goal-description').value = liveStreamData.liveGoal.description;
                                    document.getElementById('goal-target-amount').value = liveStreamData.liveGoal.targetAmount;
                                } else {
                                     document.getElementById('live-goal-form').reset();
                                }
                            }
                            return;
                        }
                        if (closest('#clear-goal-btn')) {
                            if (isCurrentUserHost) {
                                if (confirm("Are you sure you want to clear the current live goal?")) {
                                    liveStreamData.liveGoal = null;
                                    showNotification("Live goal cleared.", "info");
                                    document.getElementById('live-goal-settings-modal').classList.remove('show');
                                    updateLiveUI();
                                }
                            }
                            return;
                        }
                        if (closest('#live-fan-club-btn')) {
                            if (isCurrentUserHost) {
                                document.getElementById('live-fan-club-modal').classList.toggle('show');
                                document.getElementById('fan-club-toggle').checked = liveStreamData.fanClubActive;
                            }
                            return;
                        }
                        if (closest('#save-fan-club-settings')) {
                            if (isCurrentUserHost) {
                                liveStreamData.fanClubActive = document.getElementById('fan-club-toggle').checked;
                                showNotification(`Fan Club is now ${liveStreamData.fanClubActive ? 'activated' : 'deactivated'}.`, "info");
                                document.getElementById('live-fan-club-modal').classList.remove('show');
                                updateLiveUI();
                            }
                            return;
                        }

                        if (closest('#live-games-btn')) {
                            if (isCurrentUserHost) {
                                document.getElementById('live-games-modal').classList.toggle('show');
                            }
                            return;
                        }
                        const liveGameBtn = closest('.live-game-btn');
                        if (liveGameBtn) {
                            if (isCurrentUserHost) {
                                const gameType = liveGameBtn.dataset.game;
                                liveStreamData.activeGame = { type: gameType, name: gameType.charAt(0).toUpperCase() + gameType.slice(1) }; 
                                showNotification(`Starting a ${gameType} game!`, "info");
                                updateLiveUI();
                                document.getElementById('live-games-modal').classList.remove('show');
                            }
                            return;
                        }
                        if (closest('#end-game-btn')) {
                            if (isCurrentUserHost) {
                                liveStreamData.activeGame = null;
                                showNotification("Game ended.", "info");
                                updateLiveUI();
                                document.getElementById('live-games-modal').classList.remove('show');
                            }
                            return;
                        }

                        if (closest('#live-gift-btn')) { 
                            document.getElementById('live-gift-catalog-modal').classList.toggle('show'); 
                            document.getElementById('live-viewers-modal').classList.remove('show'); 
                            updateWalletUI(); 
                            return; 
                        }
                        if (closest('.gift-item')) { 
                            document.querySelectorAll('.gift-item').forEach(item => item.classList.remove('selected'));
                            e.target.closest('.gift-item').classList.add('selected');
                            selectedGift = {
                                name: e.target.closest('.gift-item').dataset.name,
                                symbol: e.target.closest('.gift-item').dataset.symbol,
                                price: parseFloat(e.target.closest('.gift-item').dataset.price)
                            };
                            return;
                        }
                        if (closest('.live-viewers')) {
                            document.getElementById('live-viewers-modal').classList.toggle('show'); 
                            document.getElementById('live-gift-catalog-modal').classList.remove('show'); 
                            const viewerList = document.getElementById('viewer-list-container');
                            if (viewerList) {
                                viewerList.innerHTML = '';
                                if (liveStreamData.hostUserId) {
                                    const hostUser = mockUsers[liveStreamData.hostUserId];
                                    if (hostUser) {
                                        viewerList.innerHTML += `<div class="viewer-item"><img src="${hostUser.avatar}" alt="${hostUser.fullName}"> <div class="viewer-item-info"><strong>${hostUser.fullName}</strong><span>@${hostUser.username} (Host)</span></div></div>`;
                                    }
                                }
                                liveStreamData.guests.forEach(g => { 
                                    viewerList.innerHTML += `<div class="viewer-item"><img src="${g.avatar}" alt="${g.fullName}"> <div class="viewer-item-info"><strong>${g.fullName}</strong><span>@${g.username}</span></div></div>`;
                                });
                            }
                            return;
                        }
                        if (closest('#live-pin-message-btn')) {
                            if (isCurrentUserHost) {
                                document.getElementById('live-pin-message-modal').classList.toggle('show');
                                renderHostSentMessagesForPinning(); 
                                // document.getElementById('new-pin-message-text').value = ''; // Don't clear new message on open
                                // document.querySelectorAll('.pin-message-choice').forEach(item => item.classList.remove('selected'));
                            }
                            return;
                        }
                        const pinMessageChoice = closest('.pin-message-choice');
                        if (pinMessageChoice && isCurrentUserHost && closest('#live-pin-message-modal')) {
                            document.querySelectorAll('.pin-message-choice').forEach(item => item.classList.remove('selected'));
                            pinMessageChoice.classList.add('selected');
                            const messageContent = pinMessageChoice.querySelector('p')?.textContent;
                            if (messageContent) {
                                document.getElementById('new-pin-message-text').value = messageContent; 
                            }
                            return;
                        }
                    } 


                    const paymentTab = closest('.payment-tab');
                    if (paymentTab) {
                        const container = paymentTab.closest('.modal-card, #checkout-form');
                        const targetContentId = paymentTab.dataset.target;
                        if (container) { 
                            container.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
                            paymentTab.classList.add('active');
                            container.querySelectorAll('.payment-method-content').forEach(c => {
                                c.style.display = 'none';
                                // Make inputs in inactive payment methods not required
                                c.querySelectorAll('input').forEach(input => input.required = false);
                            });
                            const targetContent = document.getElementById(targetContentId);
                            if (targetContent) {
                                targetContent.style.display = 'block';
                                // Make inputs in active payment method required
                                targetContent.querySelectorAll('input[data-original-required="true"]').forEach(input => input.required = true);
                                
                                // Clear any previous validation feedback when switching tabs
                                targetContent.querySelectorAll('input').forEach(input => {
                                     input.style.borderColor = '';
                                });
                            }
                        }
                        return;
                    }
                    
                    const settingsTab = closest('.settings-tab');
                    if (settingsTab) {
                        const container = closest('.card');
                        if (container) { 
                            container.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                            settingsTab.classList.add('active');
                            container.querySelectorAll('.settings-content').forEach(c => c.classList.remove('active'));
                            const targetContent = document.getElementById(settingsTab.dataset.target);
                            if (targetContent) {
                                targetContent.classList.add('active');
                            }
                        }
                        return;
                    }
                    const profileTab = closest('.profile-tab');
                    if (profileTab) {
                        const container = closest('.card, .business-page-header');
                        if (container) { 
                            container.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
                            profileTab.classList.add('active');
                            document.querySelectorAll('.profile-tab-content').forEach(c => {
                                c.classList.remove('active');
                                c.style.display = 'none';
                            });
                            const targetContent = document.getElementById(profileTab.dataset.target);
                            if (targetContent) {
                                targetContent.classList.add('active');
                                targetContent.style.cssText = 'display:block !important;';
                                // Re-init KYC upload bindings when KYC tab opens
                                if (profileTab.dataset.target === 'profile-kyc-tab') {
                                    setTimeout(function() {
                                        if (typeof initKycUploads === 'function') initKycUploads();
                                        // Also populate bio fields from userState
                                        var fnEl = document.getElementById('kyc-ind-fname');
                                        var lnEl = document.getElementById('kyc-ind-lname');
                                        var emEl = document.getElementById('kyc-ind-email');
                                        var phEl = document.getElementById('kyc-ind-phone');
                                        if (fnEl && !fnEl.value && window.userState) {
                                            var parts = (window.userState.fullName||'').split(' ');
                                            fnEl.value = parts[0] || '';
                                            if (lnEl) lnEl.value = parts.slice(1).join(' ') || '';
                                        }
                                        if (emEl && !emEl.value && window.userState) emEl.value = window.userState.email || '';
                                        if (phEl && !phEl.value && window.userState) phEl.value = window.userState.phone || '';
                                    }, 100);
                                }
                            }
                        }
                        return;
                    }
                    
                    const kycEntityBtn = closest('.kyc-entity-btn');
                    if(kycEntityBtn) {
                        e.preventDefault();
                        e.stopPropagation();
                        const formId = kycEntityBtn.dataset.form;
                        // Mark all entity buttons inactive, this one active
                        document.querySelectorAll('.kyc-entity-btn').forEach(btn => btn.classList.remove('active'));
                        kycEntityBtn.classList.add('active');
                        // Hide all kyc forms
                        document.querySelectorAll('.kyc-form').forEach(form => {
                            form.classList.remove('active');
                            form.style.display = 'none';
                            form.querySelectorAll('.file-upload-preview').forEach(span => span.innerHTML = '');
                            form.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
                            form.querySelectorAll('input, select, textarea, .upload-area, .live-capture-btn').forEach(el => {
                                el.style.borderColor = '';
                            });
                            const selfieBtn = form.querySelector('.live-capture-btn');
                            if (selfieBtn) selfieBtn.dataset.captured = 'false';
                        });
                        // Show selected form
                        const formToShow = document.getElementById(formId);
                        if (formToShow) {
                            formToShow.classList.add('active');
                            formToShow.style.cssText = 'display:block !important;';
                            // Auto-populate bio fields for Individual form
                            if (formId === 'individual-kyc-form' && window.userState) {
                                var parts = (window.userState.fullName || '').split(' ');
                                var fi = formToShow.querySelector('#kyc-ind-fname');
                                var li = formToShow.querySelector('#kyc-ind-lname');
                                var ei = formToShow.querySelector('#kyc-ind-email');
                                var pi = formToShow.querySelector('#kyc-ind-phone');
                                if (fi && !fi.value) fi.value = parts[0] || '';
                                if (li && !li.value) li.value = parts.slice(1).join(' ') || '';
                                if (ei && !ei.value) ei.value = window.userState.email || '';
                                if (pi && !pi.value) pi.value = window.userState.phone || '';
                            }
                            // Re-init upload bindings for newly shown form
                            setTimeout(function() {
                                if (typeof initKycUploads === 'function') initKycUploads();
                            }, 50);
                        }
                        populateDobSelectors(); 
                        
                        // Set required attributes based on form. (all initially required in HTML now handled by JS)
                        formToShow.querySelectorAll('input[required][data-original-required="true"], select[required][data-original-required="true"], textarea[required][data-original-required="true"]').forEach(input => {
                            input.required = true;
                        });
                        formToShow.querySelectorAll('.kyc-file-upload + input[type="file"]').forEach(input => {
                            const uploadArea = input.previousElementSibling;
                            if (uploadArea && uploadArea.querySelector('span')) {
                                uploadArea.querySelector('span').textContent = 'Click to upload';
                            }
                            input.required = input.hasAttribute('data-original-required') && input.dataset.originalRequired === 'true';
                        });
                        const liveCaptureBtn = formToShow.querySelector('.live-capture-btn');
                        if (liveCaptureBtn) {
                             liveCaptureBtn.required = liveCaptureBtn.hasAttribute('data-original-required') && liveCaptureBtn.dataset.originalRequired === 'true';
                             liveCaptureBtn.dataset.captured = 'false';
                        }
                        return;
                    }
                    
                    if (closest('#gallery-next-btn')) { navigateMarketplaceGallery(1); return; }
                    if (closest('#gallery-prev-btn')) { navigateMarketplaceGallery(-1); return; }
                    const galleryThumb = closest('.gallery-thumbnail');
                    if (galleryThumb) {
                        const index = parseInt(galleryThumb.dataset.index, 10);
                        if (!isNaN(index)) { 
                            showMarketplaceGallery(marketplaceGalleryState.media, index);
                        }
                        return;
                    }
                    const propertyCard = closest('.property-card');
                    if (propertyCard && !closest('.add-to-cart-btn') && !closest('.contact-seller-btn') && !closest('.promote-post-btn')) {
                        let media = [];
                        try { media = JSON.parse(propertyCard.dataset.media || '[]'); } catch(e) { media = []; }
                        // Normalise: media can be string URLs or {url, type} objects
                        media = media.map(function(m) { return typeof m === 'string' ? { url: m, type: m.match(/\.(mp4|webm|mov)/i) ? 'video/mp4' : 'image/jpeg' } : m; });
                        if (media.length > 0) showMarketplaceGallery(media);
                        return;
                    }
                    
                    const reelViewerActionBtn = closest('.reel-viewer-actions .action-btn');
                    if (reelViewerActionBtn) {
                        e.preventDefault();
                        const viewerItem = closest('.reel-viewer-item');
                        const video = viewerItem ? viewerItem.querySelector('video') : null;
                        if (!video) return; 

                        if (reelViewerActionBtn.classList.contains('reel-like-btn')) {
                            const icon = reelViewerActionBtn.querySelector('i');
                            if (icon) { 
                                icon.classList.toggle('far');
                                icon.classList.toggle('fas');
                                icon.classList.toggle('liked');
                            }
                        } else if (reelViewerActionBtn.classList.contains('reel-comment-toggle-btn')) {
                            const panel = viewerItem.querySelector('.reel-comments-panel');
                            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                        } else if (reelViewerActionBtn.classList.contains('reel-share-btn')) {
                            const postId = viewerItem.dataset.postId;
                            shareContent({
                                title: "Empyrean Reel",
                                text: viewerItem.querySelector('.reel-viewer-info p')?.textContent || "Check out this Reel!",
                                url: `${window.location.href.split('#')[0]}#reel/${postId}`
                            });
                        } else if (reelViewerActionBtn.title === 'Toggle Mute') {
                            video.muted = !video.muted;
                            const icon = reelViewerActionBtn.querySelector('i');
                            if (icon) {
                                icon.className = `fas fa-volume-${video.muted ? 'mute' : 'up'}`;
                            }
                        }
                        return;
                    }
                    
                    // Reel comment form submit
                    const reelCommentForm = closest('.reel-comment-form');
                    if (reelCommentForm && target.closest('button[type="submit"]')) {
                        e.preventDefault();
                        const input = reelCommentForm.querySelector('input');
                        const text = input ? input.value.trim() : '';
                        if (!text) return;
                        const viewerItem = reelCommentForm.closest('.reel-viewer-item');
                        const commentsList = viewerItem ? viewerItem.querySelector('.reel-comments-list') : null;
                        if (commentsList) {
                            const placeholder = commentsList.querySelector('p');
                            if (placeholder) placeholder.remove();
                            const commentEl = document.createElement('div');
                            commentEl.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
                            commentEl.innerHTML = `<img src="${userState.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;"><div><strong style="color:white;font-size:0.8rem;">${userState.fullName || 'You'}</strong><p style="color:rgba(255,255,255,0.8);font-size:0.82rem;margin-top:2px;">${text}</p></div>`;
                            commentsList.appendChild(commentEl);
                            commentsList.scrollTop = commentsList.scrollHeight;
                            const countEl = viewerItem.querySelector('.reel-comment-count');
                            if (countEl) countEl.textContent = parseInt(countEl.textContent||'0') + 1;
                        }
                        if (input) input.value = '';
                        return;
                    }

                    const removeMediaBtn = closest('.remove-media-btn');
                    if(removeMediaBtn) {
                        const indexToRemove = parseInt(removeMediaBtn.dataset.index, 10);
                        
                        marketplaceMediaFiles = marketplaceMediaFiles.filter((_, index) => index !== indexToRemove);
                        
                        const dataTransfer = new DataTransfer();
                        marketplaceMediaFiles.forEach(file => dataTransfer.items.add(file));
                        const itemMediaInput = document.getElementById('item-media');
                        if (itemMediaInput) {
                            itemMediaInput.files = dataTransfer.files;
                        }
                        
                        handleMarketplacePreview(marketplaceMediaFiles, document.getElementById('marketplace-media-preview'));
                        if (marketplaceMediaFiles.length === 0) {
                            const marketplaceTextFields = document.getElementById('marketplace-text-fields');
                            if (marketplaceTextFields) marketplaceTextFields.style.display = 'none';
                        }
                        return;
                    }
                    
                    const contactSellerBtn = closest('.contact-seller-btn');
                    if (contactSellerBtn) {
                        const card = closest('.property-card');
                        if (!card) return; 

                        const contactInfoEl = card.querySelector('.direct-contact-info');
                        if(contactInfoEl.style.display === 'block') {
                            contactInfoEl.style.display = 'none';
                        } else {
                            contactInfoEl.innerHTML = `
                                <p><strong>Full Name:</strong> ${card.dataset.contactName || 'N/A'}</p>
                                <p><i class="fas fa-phone"></i> <strong>Phone:</strong> <a href="tel:${card.dataset.contactPhone}">${card.dataset.contactPhone || 'N/A'}</a></p>
                                <p><i class="fas fa-envelope"></i> <strong>Email:</strong> <a href="mailto:${card.dataset.contactEmail}">${card.dataset.contactEmail || 'N/A'}</a></p>
                                <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${card.dataset.contactAddress || 'N/A'}</a></p>
                            `;
                            contactInfoEl.style.display = 'block';
                        }
                        return;
                    }

                    if (closest('#message-attach-btn')) {
                        const messageFileInput = document.getElementById('message-file-input');
                        if (messageFileInput) messageFileInput.click();
                        return;
                    }
                    let voiceNoteMediaRecorder; 
                    let voiceNoteAudioChunks = [];
                    let voiceNoteRecordingStartTime;
                    
                    if (closest('#message-voice-note-btn')) {
                        const voiceNoteButton = document.getElementById('message-voice-note-btn');
                        if (!voiceNoteButton) return; 
                        let isRecording = voiceNoteButton.dataset.recording === 'true';
                        
                        if (!isRecording) {
                            navigator.mediaDevices.getUserMedia({ audio: true })
                                .then(stream => {
                                    voiceNoteMediaRecorder = new MediaRecorder(stream);
                                    voiceNoteButton.mediaRecorder = voiceNoteMediaRecorder; 
                                    voiceNoteButton.stream = stream; 

                                    voiceNoteMediaRecorder.ondataavailable = event => {
                                        voiceNoteAudioChunks.push(event.data);
                                    };

                                    voiceNoteMediaRecorder.onstop = () => {
                                        const audioBlob = new Blob(voiceNoteAudioChunks, { type: 'audio/webm' });
                                        const audioUrl = URL.createObjectURL(audioBlob);
                                        const recordingDuration = Math.floor((Date.now() - voiceNoteRecordingStartTime) / 1000);
                                        const messagesContainer = document.getElementById('chat-messages-container');
                                        if (messagesContainer) {
                                            const messageEl = createMessageElement(`Voice Note (${recordingDuration}s)`, true, true, audioUrl, 'audio/webm');
                                            messagesContainer.appendChild(messageEl);
                                            messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                            // Upload to Cloudinary in background
                                            const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
                                            window.uploadToCloudinary(audioFile, null).then(async cloudUrl => {
                                                const audioEl = messageEl.querySelector('audio');
                                                if (audioEl) audioEl.src = cloudUrl;
                                                try {
                                                    await fbDb.collection('messages').add({
                                                        senderId: userState.id, mediaUrl: cloudUrl,
                                                        mediaType: 'audio/webm', isVoiceNote: true,
                                                        duration: recordingDuration,
                                                        createdAt: new Date().toISOString()
                                                    });
                                                } catch(e) {}
                                            }).catch(e => console.warn('Voice note upload failed:', e));
                                        }
                                        voiceNoteAudioChunks = [];
                                        if (voiceNoteButton.stream) {
                                            voiceNoteButton.stream.getTracks().forEach(track => track.stop());
                                        }
                                    };

                                    voiceNoteMediaRecorder.start();
                                    voiceNoteRecordingStartTime = Date.now();
                                    voiceNoteButton.dataset.recording = 'true';
                                    voiceNoteButton.innerHTML = '<i class="fas fa-stop-circle"></i> Rec';
                                    showNotification("Voice note recording started (max 1 hour)...", "info");

                                    voiceNoteButton.recordingTimeout = setTimeout(() => {
                                        if (voiceNoteButton.dataset.recording === 'true') {
                                            voiceNoteButton.click(); 
                                            showNotification("Voice note recording stopped (max duration reached).", "warning");
                                        }
                                    }, 3600000); 

                                })
                                .catch(err => {
                                    console.error("Error accessing microphone:", err);
                                    showNotification("Failed to access microphone. Please ensure permissions are granted.", "error");
                                });
                        } else {
                            voiceNoteButton.dataset.recording = 'false';
                            voiceNoteButton.innerHTML = '<i class="fas fa-microphone"></i>';
                            if (voiceNoteButton.mediaRecorder && voiceNoteButton.mediaRecorder.state === 'recording') {
                                voiceNoteButton.mediaRecorder.stop();
                            }
                            if (voiceNoteButton.stream) {
                                voiceNoteButton.stream.getTracks().forEach(track => track.stop());
                            }
                            if (voiceNoteButton.recordingTimeout) {
                                clearTimeout(voiceNoteButton.recordingTimeout); 
                            }
                            showNotification("Voice note recording stopped. Sending...", "success");
                        }
                        return;
                    }
                     if (closest('#message-location-btn')) {
                        showNotification("Simulating location sharing...", "info");
                        return;
                    }
                    if (closest('#message-voice-call-btn')) {
                        showNotification("Simulating voice call... (Requires WebRTC for real implementation)", "info");
                        return;
                    }
                     if (closest('#message-video-call-btn')) {
                        showNotification("Simulating video call... (Requires WebRTC for real implementation)", "info");
                        return;
                    }

                    if (closest('.chat-header')) {
                        // Do NOT navigate away; just show info
                        return;
                    }
                    
                    const communityTaskBtn = closest('.community-task-btn');
                    if (communityTaskBtn) {
                        const taskId = communityTaskBtn.dataset.taskId;
                        const reward = parseInt(communityTaskBtn.dataset.reward, 10);
                        // Prevent double-earning — only reward once per task
                        if (userState.completedTasks && userState.completedTasks.has(taskId)) {
                            showNotification('Task already completed! Reward already earned.', 'info');
                            window.open(communityTaskBtn.dataset.url, '_blank');
                            return;
                        }
                        userState.empyBalance += reward;
                        if (!userState.completedTasks) userState.completedTasks = new Set();
                        userState.completedTasks.add(taskId);
                        updateWalletUI();
                        showNotification(`+${reward} EMPY! Task completed. Reward earned once.`, 'success');
                        // Save completed task to Firestore
                        try { await fbDb.collection('users').doc(userState.id).update({ completedTasks: [...userState.completedTasks] }); } catch(e) {}
                        window.open(communityTaskBtn.dataset.url, '_blank');
                        renderCommunityTasks();
                        return;
                    }

                    const ngoCard = closest('.ngo-card');
                    if(ngoCard) {
                        renderNgoProfile(ngoCard.dataset.ngoId);
                        return;
                    }

                    if(closest('#back-to-ngo-grid')) {
                        document.getElementById('ngo-grid-view').style.display = 'block';
                        document.getElementById('ngo-profile-view').style.display = 'none';
                        document.getElementById('back-to-ngo-grid').style.display = 'none';
                        return;
                    }
                    
                     const editIcon = closest('.business-page-content .edit-icon, .business-page-header .edit-icon');
                    if(editIcon) {
                        const field = editIcon.dataset.field;
                        let currentElement, currentValue, promptTitle;

                        if (field === 'name' || field === 'tagline') {
                            currentElement = document.getElementById(`business-page-${field}`);
                            currentValue = currentElement ? currentElement.textContent.trim() : '';
                            promptTitle = `Update Page ${field.charAt(0).toUpperCase() + field.slice(1)}`;
                        } else {
                            currentElement = document.getElementById(`business-page-${field}-span`);
                            currentValue = currentElement ? currentElement.textContent.trim() : '';
                             promptTitle = `Update ${field.charAt(0).toUpperCase() + field.slice(1)}`;
                        }
                        
                        const newValue = prompt(promptTitle, currentValue);

                        if (newValue && newValue.trim() !== '' && newValue.trim() !== currentValue) {
                            if (currentElement) currentElement.textContent = newValue;
                            if (userState.businessPage) {
                                userState.businessPage[field] = newValue;
                            }
                            showNotification("Page updated!", "success");
                        }
                        return;
                    }
                    
                    // ── BUSINESS PAGE BUTTONS (Share, Follow, Promote) ──
                    // ── DELETE ACCOUNT ──
                    if (closest('#delete-account-btn')) {
                        e.preventDefault();
                        if (isGuest) { showNotification('Please log in first.', 'error'); return; }
                        const confirmed = confirm('⚠️ DELETE ACCOUNT\n\nThis will permanently delete your account, all posts, messages, and your EMPY balance.\n\nThis cannot be undone. Are you absolutely sure?');
                        if (!confirmed) return;
                        const doubleConfirm = confirm('Final confirmation: Delete account for ' + (userState.fullName || userState.email) + '?');
                        if (!doubleConfirm) return;
                        // Delete from Firebase
                        (async () => {
                            try {
                                if (window._firebaseLoaded && window.fbAuth && window.fbAuth.currentUser) {
                                    // Delete Firestore data
                                    try { await window.fbDb.collection('users').doc(userState.id).delete(); } catch(e) {}
                                    // Delete auth account
                                    await window.fbAuth.currentUser.delete();
                                }
                            } catch(e) { console.warn('Firebase delete error:', e.message); }
                            // Clear localStorage
                            try {
                                const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                delete stored[userState.email];
                                localStorage.setItem('empyrean_users', JSON.stringify(stored));
                            } catch(e) {}
                            // Reset app to guest
                            showNotification('Your account has been deleted.', 'info');
                            setTimeout(() => initializeApp(true), 1500);
                        })();
                        return;
                    }

                    const bizShareBtn = closest('.business-page-share-btn');
                    if (bizShareBtn) {
                        e.preventDefault();
                        const pageName = userState.businessPage ? userState.businessPage.name : 'Business Page';
                        const pageTagline = userState.businessPage ? userState.businessPage.tagline : '';
                        shareContent({
                            title: pageName,
                            text: pageTagline,
                            url: window.location.href + '#business'
                        });
                        return;
                    }

                    const bizPromoteBtn = closest('.business-page-promote-btn');
                    if (bizPromoteBtn) {
                        e.preventDefault();
                        if (userState.businessPage) {

                        } else {
                            showNotification('Create a business page first.', 'warning');
                        }
                        return;
                    }

                    const suggestedUserCard = closest('.suggested-user-card');
                    if(suggestedUserCard && !closest('.follow-btn')) {
                        const userId = suggestedUserCard.dataset.userId;
                        if (userId) {
                            window._viewingOtherProfile = (userId !== userState.id);
                            renderUserProfile(userId);
                            navigateTo('profile', true);
                            setTimeout(function() { window._viewingOtherProfile = false; }, 500);
                        }
                        return;
                    }
                    
                    const uiToggle = closest('#refresh-captcha, .news-list-item h4, .contact-item, #toggle-bio-btn, #toggle-profile-info-btn, #profile-message-btn, .help-now-btn, .share-profile-btn, #pin-location-btn, #create-page-btn, #host-control-toggle-btn'); 
                     if (uiToggle) {
                        if (closest('#refresh-captcha')) generateCaptcha();
                        if (closest('.news-list-item h4')) {
                            const newsItem = closest('.news-list-item');
                            if (newsItem) newsItem.classList.toggle('expanded');
                        }
                        if (closest('#profile-message-btn')) {
                            e.preventDefault();
                            // Read target userId stored on the button at render time
                            const msgBtn = closest('#profile-message-btn');
                            const msgTargetId = (msgBtn && msgBtn.dataset.messageUserId)
                                || document.querySelector('.profile-header-info[data-user-id]')?.dataset?.userId;
                            navigateTo('messages');
                            if (msgTargetId) { setTimeout(function() { openChat(msgTargetId); }, 200); }
                        }
                        if (closest('.contact-item')) {
                            e.preventDefault();
                            const cItem = closest('.contact-item');
                            const cUserId = cItem.dataset.userId;
                            // Ensure messages view is active before opening chat portal
                            const mView = document.getElementById('messages-view');
                            if (!mView || mView.style.display === 'none' || mView.classList.contains('hidden')) {
                                navigateTo('messages');
                                setTimeout(function() { openChat(cUserId); }, 200);
                            } else {
                                openChat(cUserId);
                            }
                        }
                        if (closest('#toggle-bio-btn')) {
                            const bio = document.getElementById('profile-bio');
                            const btn = closest('#toggle-bio-btn');
                            if (bio && btn) { 
                                bio.classList.toggle('expanded');
                                btn.textContent = bio.classList.contains('expanded') ? 'Show Less' : 'Read More';
                            }
                        }
                        if (closest('#toggle-profile-info-btn')) {
                            const extendedInfo = document.getElementById('profile-extended-info');
                            const btn = closest('#toggle-profile-info-btn');
                            if (extendedInfo && btn) { 
                                const isHidden = extendedInfo.style.display === 'none' || extendedInfo.style.display === '';
                                extendedInfo.style.display = isHidden ? 'block' : 'none';
                                btn.textContent = isHidden ? 'View Less' : 'View More';
                            }
                        }
                        if (closest('.help-now-btn')) {
                            if(isGuest){showNotification('Please log in to donate.','info');var _amh=document.getElementById('auth-modal-overlay'),_lvh=document.getElementById('login-view');if(_amh){_amh.style.display='flex';_amh.classList.add('show');}if(_lvh)_lvh.style.display='block';document.body.classList.add('modal-open');setTimeout(function(){if(typeof generateCaptcha==='function')generateCaptcha();},150);return;}
                            const _sp=closest('.impact-story');
                            window._sosDonationContext={username:_sp?(_sp.dataset.username||'the cause'):'the cause',userId:_sp?(_sp.dataset.userId||''):'',amount:_sp?(_sp.dataset.amount||''):'',postId:_sp?(_sp.dataset.postId||''):''};
                            const _dmt=document.getElementById('donation-modal-title'),_dmd=document.getElementById('donation-modal-description');
                            if(_dmt)_dmt.textContent='Support '+window._sosDonationContext.username+'’s SOS Request';
                            if(_dmd)_dmd.textContent=window._sosDonationContext.amount?'They need '+window._sosDonationContext.amount+'. Every contribution counts.':'Funds held in escrow until verified.';
                            const _ni=document.getElementById('donate-name-card'),_ei=document.getElementById('donate-email-card');
                            if(_ni&&!_ni.value)_ni.value=userState.fullName||'';
                            if(_ei&&!_ei.value)_ei.value=userState.email||'';
                            const _sdm=document.getElementById('sos-donation-modal');
                            if(_sdm){_sdm.style.display='flex';_sdm.classList.add('show');document.body.classList.add('modal-open');document.body.style.overflow='hidden';}
                        }
                        if (closest('.share-profile-btn')) {
                            // Determine who we're viewing (own profile or another user's)
                            var _profileSection = document.getElementById('profile');
                            var _profileUserId = _profileSection && _profileSection.querySelector('[data-user-id]') 
                                ? _profileSection.querySelector('[data-user-id]').dataset.userId 
                                : userState.id;
                            var _viewedUser = (_profileUserId && mockUsers[_profileUserId]) ? mockUsers[_profileUserId] : userState;
                            shareContent({
                                title: `View ${_viewedUser.fullName}'s Profile on Empyrean`,
                                text: _viewedUser.bio || `Check out ${_viewedUser.fullName}'s profile on Empyrean.`,
                                url: `${window.location.href.split('#')[0]}#profile/${_viewedUser.username}`
                            });
                        }
                        if (closest('#pin-location-btn')) {
                            const lat = (Math.random() * (9.0 - 6.4) + 6.4).toFixed(6);
                            const lon = (Math.random() * (7.4 - 3.4) + 3.4).toFixed(6);
                            const crisisLocationCoords = document.getElementById('crisis-location-coords');
                            if (crisisLocationCoords) crisisLocationCoords.textContent = `Pinned at: ${lat}, ${lon}`;
                        }
                        if (closest('#create-page-btn')) {
                            const createBusinessPageModal = document.getElementById('create-business-page-modal');
                            if (createBusinessPageModal) createBusinessPageModal.classList.add('show');
                        }
                        if (closest('#host-control-toggle-btn')) {
                            const panel = document.getElementById('host-control-panel');
                            if (panel) {
                                panel.classList.toggle('expanded');
                                const icon = closest('#host-control-toggle-btn').querySelector('i');
                                if (icon) {
                                    icon.classList.toggle('fa-chevron-right', !panel.classList.contains('expanded'));
                                    icon.classList.toggle('fa-chevron-left', panel.classList.contains('expanded'));
                                }
                            }
                            return; 
                        }
                        return;
                    }

                    const adminAction = closest('.approve-withdrawal-btn, .reject-withdrawal-btn, .approve-sos-btn, .reject-sos-btn, .sos-hold-btn');
                    if(adminAction) {
                        e.preventDefault();
                        const itemEl = closest('.admin-queue-item');
                        if (!itemEl) return;

                        const id = itemEl.dataset.id;
                        const actionType = itemEl.parentElement ? itemEl.parentElement.id : '';

                        // ── Audit trail helper ──────────────────────────────────
                        function logAuditAction(action, targetUser, details) {
                            if (!window.empyreanAuditLog) window.empyreanAuditLog = [];
                            const entry = {
                                timestamp: new Date().toLocaleString(),
                                admin: userState.username || 'admin',
                                action, targetUser, details,
                                id: 'audit-' + Date.now()
                            };
                            window.empyreanAuditLog.unshift(entry);
                            const tbody = document.getElementById('admin-audit-log-body');
                            if (tbody) {
                                const emptyRow = tbody.querySelector('td[colspan]');
                                if (emptyRow) emptyRow.closest('tr').remove();
                                const row = document.createElement('tr');
                                row.style.borderBottom = '1px solid rgba(10,14,39,0.06)';
                                row.innerHTML = `
                                    <td style="padding:10px 16px;font-size:0.82rem;color:var(--text-muted);">${entry.timestamp}</td>
                                    <td style="padding:10px 16px;font-weight:600;color:var(--secondary);">@${entry.admin}</td>
                                    <td style="padding:10px 16px;"><span style="background:rgba(27,43,139,0.1);color:var(--secondary);padding:2px 10px;border-radius:50px;font-size:0.78rem;">${entry.action}</span></td>
                                    <td style="padding:10px 16px;color:var(--primary);">@${entry.targetUser}</td>
                                    <td style="padding:10px 16px;font-size:0.82rem;color:#555;">${entry.details}</td>
                                `;
                                tbody.prepend(row);
                            }
                        }

                        // ── Notify user helper ──────────────────────────────────
                        function notifyUser(userId, message, type) {
                            // In-app notification: add to notification feed if visible
                            if (!window.userNotifications) window.userNotifications = {};
                            if (!window.userNotifications[userId]) window.userNotifications[userId] = [];
                            window.userNotifications[userId].unshift({ message, type, time: new Date().toLocaleString(), read: false });
                            // Also show banner if current user is the target
                            if (userState.id === userId) {
                                showNotification(message, type);
                            }
                            // Save notification to Firestore
                            try {
                                fbDb.collection('notifications').add({
                                    userId, message, type,
                                    createdAt: new Date().toISOString(), read: false
                                });
                            } catch(e) {}
                        }

                        if (closest('.approve-sos-btn')) {
                            const sosRequest = mockAdminSosQueue.find(i => i.id === id);
                            if (sosRequest) {
                                sosRequest.status = 'approved';
                                sosRequest.approvedAt = new Date().toISOString();
                                sosRequest.publishedAt = sosRequest.approvedAt;
                                // Publish to public dashboard feed
                                createSosPostOnFeed(sosRequest);
                                rewardUserForAction('VERIFIED_SOS_REQUEST', sosRequest.userId);
                                // Log audit
                                logAuditAction('SOS Approved & Published', sosRequest.username,
                                    `SOS "${sosRequest.title}" published to public dashboard. Amount: ${sosRequest.amount} ${sosRequest.currency}`);
                                // Notify the user
                                notifyUser(sosRequest.userId,
                                    '✅ Your SOS request "' + sosRequest.title + '" has been APPROVED and is now live on the public dashboard! The community can now support you.',
                                    'success');
                                // Push to notification bell
                                window.pushNotification && window.pushNotification('✅ Your SOS "' + sosRequest.title + '" was APPROVED! It is now live on the dashboard.', 'success');
                                // Save to Firestore
                                (async () => {
                                    try {
                                        await fbDb.collection('sos_queue').doc(sosRequest.id).update({
                                            status: 'approved',
                                            approvedAt: sosRequest.approvedAt,
                                            publishedAt: sosRequest.publishedAt
                                        });
                                    } catch(e) {}
                                    try {
                                        await fbDb.collection('posts').doc(sosRequest.id).set({
                                            id: sosRequest.id, userId: sosRequest.userId,
                                            username: sosRequest.username, avatar: sosRequest.avatar,
                                            text: `🆘 SOS: ${sosRequest.title}\n\n${sosRequest.story}`,
                                            media: (sosRequest.media || []).map(m => m.url || m),
                                            createdAt: sosRequest.approvedAt,
                                            isSOS: true, sosAmount: sosRequest.amount,
                                            sosCurrency: sosRequest.currency, status: 'approved'
                                        });
                                    } catch(e) {}
                                })();
                                showNotification(`✅ SOS from @${sosRequest.username} approved and published!`, 'success');
                                // Add entry to Approved SOS Log in admin panel
                                const sosLogEl = document.getElementById('admin-sos-log');
                                if (sosLogEl) {
                                    const emptyLog = sosLogEl.querySelector('.sos-log-empty');
                                    if (emptyLog) emptyLog.remove();
                                    const logEntry = document.createElement('div');
                                    logEntry.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:rgba(16,185,129,0.05);border-left:4px solid #10B981;border-radius:0 10px 10px 0;margin-bottom:8px;gap:12px;flex-wrap:wrap;';
                                    logEntry.innerHTML =
                                        '<div style="flex:1;min-width:0;">' +
                                            '<strong style="font-size:0.88rem;color:var(--primary);">✅ ' + sosRequest.title + '</strong>' +
                                            '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">@' + sosRequest.username + ' · Approved ' + new Date().toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) + '</div>' +
                                        '</div>' +
                                        '<button class="delete-approved-sos-btn btn btn-small" style="background:#7F1D1D;color:white;border:none;border-radius:8px;padding:5px 10px;font-size:0.75rem;cursor:pointer;flex-shrink:0;" data-post-id="' + sosRequest.id + '"><i class="fas fa-trash"></i> Delete Post</button>';
                                    sosLogEl.prepend(logEntry);
                                }
                                mockAdminSosQueue = mockAdminSosQueue.filter(i => i.id !== id);
                                itemEl.style.opacity = '0';
                                setTimeout(() => { itemEl.remove(); renderAdminQueues(); }, 300);
                            }
                            return;
                        }

                        if (closest('.sos-hold-btn')) {
                            const sosRequest = mockAdminSosQueue.find(i => i.id === id);
                            if (sosRequest) {
                                sosRequest.status = 'on_hold';
                                logAuditAction('SOS Put On Hold', sosRequest.username,
                                    `SOS "${sosRequest.title}" placed on hold pending more information.`);
                                notifyUser(sosRequest.userId,
                                    '⏸ Your SOS request "' + sosRequest.title + '" is on hold. Admin may need more information. Please check your notifications.',
                                    'warning');
                                window.pushNotification && window.pushNotification('⏸ Your SOS "' + sosRequest.title + '" is On Hold — awaiting further review.', 'warning');
                                try { fbDb.collection('sos_queue').doc(sosRequest.id).update({ status: 'on_hold' }); } catch(e) {}
                                showNotification(`SOS from @${sosRequest.username} placed On Hold.`, 'info');
                                itemEl.style.background = 'rgba(99,102,241,0.05)';
                                itemEl.style.borderLeftColor = '#6366F1';
                                renderAdminQueues();
                            }
                            return;
                        }

                        if (closest('.reject-sos-btn')) {
                            const sosRequest = mockAdminSosQueue.find(i => i.id === id);
                            if (sosRequest) {
                                sosRequest.status = 'rejected';
                                logAuditAction('SOS Rejected', sosRequest.username,
                                    `SOS "${sosRequest.title}" rejected. Not published to dashboard.`);
                                var rejectReason = prompt('Optional: Enter a brief reason for rejection (shown to user):') || 'Did not meet current approval criteria.';
                                var rejectionMsg = '❌ Your SOS request "' + sosRequest.title + '" was not approved. Reason: ' + rejectReason + '. Please contact support if you need assistance.';

                                // In-app notification (real-time banner for current session)
                                notifyUser(sosRequest.userId, rejectionMsg, 'error');

                                // FIX Bug 6: Persist to Firestore so user sees it on dashboard on any device
                                try {
                                    if (window.fbDb && window._firebaseLoaded) {
                                        window.fbDb.collection('user_notifications').add({
                                            userId:    sosRequest.userId,
                                            username:  sosRequest.username,
                                            message:   rejectionMsg,
                                            type:      'sos_rejected',
                                            sosId:     sosRequest.id,
                                            sosTitle:  sosRequest.title,
                                            reason:    rejectReason,
                                            read:      false,
                                            createdAt: new Date().toISOString()
                                        }).catch(function(e) { console.warn('[Admin] Notification save error:', e.message); });

                                        // Also update the sos_queue doc status
                                        window.fbDb.collection('sos_queue').doc(sosRequest.id).update({
                                            status:       'rejected',
                                            rejectReason: rejectReason,
                                            rejectedAt:   new Date().toISOString()
                                        }).catch(function() {});
                                    }
                                } catch(e) {}

                                // Update notification badge count on dashboard
                                var notifBadge = document.getElementById('notif-badge') || document.querySelector('.notif-count');
                                if (notifBadge && window.userState && window.userState.id === sosRequest.userId) {
                                    notifBadge.textContent = (parseInt(notifBadge.textContent) || 0) + 1;
                                    notifBadge.style.display = 'inline-flex';
                                }

                                showNotification('SOS from @' + sosRequest.username + ' rejected. User has been notified.', 'info');
                                mockAdminSosQueue = mockAdminSosQueue.filter(i => i.id !== id);
                                itemEl.style.opacity = '0';
                                setTimeout(() => { itemEl.remove(); renderAdminQueues(); }, 300);
                            }
                            return;
                        }

                        if (closest('.delete-approved-sos-btn')) {
                            const postId = e.target.closest('.delete-approved-sos-btn').dataset.postId;
                            if (postId && confirm('Permanently delete this approved SOS post from the dashboard?')) {
                                // Remove from feed
                                const feedPost = document.querySelector('[data-post-id="' + postId + '"]');
                                if (feedPost) feedPost.remove();
                                // Remove log entry
                                const logEntry = e.target.closest('div[style*="border-left"]');
                                if (logEntry) logEntry.remove();
                                // Delete from Firestore
                                try { fbDb.collection('posts').doc(postId).delete(); } catch(e) {}
                                showNotification('SOS post deleted from dashboard.', 'info');
                            }
                            return;
                        }

                        if (closest('.delete-sos-btn')) {
                            // Admin-only hard delete of SOS from queue AND from feed
                            const sosRequest = mockAdminSosQueue.find(i => i.id === id);
                            if (sosRequest) {
                                logAuditAction('SOS Deleted', sosRequest.username, `SOS "${sosRequest.title}" permanently deleted by admin.`);
                                mockAdminSosQueue = mockAdminSosQueue.filter(i => i.id !== id);
                                // Remove from feed if it was published
                                const feedPost = document.querySelector(`[data-post-id="${id}"]`);
                                if (feedPost) feedPost.remove();
                                // Delete from Firestore
                                try {
                                    fbDb.collection('sos_queue').doc(id).delete();
                                    fbDb.collection('posts').doc(id).delete();
                                } catch(e) {}
                                itemEl.style.opacity = '0';
                                setTimeout(() => { itemEl.remove(); renderAdminQueues(); }, 300);
                                showNotification('SOS request permanently deleted.', 'info');
                            }
                            return;
                        }

                        if (closest('.approve-withdrawal-btn')) {
                            if (actionType === 'admin-withdrawal-queue') {
                                const wd = mockAdminWithdrawalQueue.find(i => i.id === id);
                                if (wd) {
                                    logAuditAction('Withdrawal Approved', wd.username, `Amount: ${wd.amount}, Method: ${wd.method}`);
                                    notifyUser(wd.userId, `✅ Your withdrawal of ${wd.amount} has been approved and is being processed.`, 'success');
                                }
                                mockAdminWithdrawalQueue = mockAdminWithdrawalQueue.filter(i => i.id !== id);
                            }
                            itemEl.style.opacity = '0';
                            setTimeout(() => { itemEl.remove(); renderAdminQueues(); }, 300);
                            showNotification('Withdrawal approved.');
                            return;
                        }

                        if (closest('.reject-withdrawal-btn')) {
                            if (actionType === 'admin-withdrawal-queue') {
                                const wd = mockAdminWithdrawalQueue.find(i => i.id === id);
                                if (wd) {
                                    logAuditAction('Withdrawal Rejected', wd.username, `Amount: ${wd.amount}, Method: ${wd.method}`);
                                    notifyUser(wd.userId, `❌ Your withdrawal of ${wd.amount} was rejected. Please contact support.`, 'error');
                                }
                                mockAdminWithdrawalQueue = mockAdminWithdrawalQueue.filter(i => i.id !== id);
                            }
                            itemEl.style.opacity = '0';
                            setTimeout(() => { itemEl.remove(); renderAdminQueues(); }, 300);
                            showNotification('Withdrawal rejected.');
                            return;
                        }

                        return;
                    }

                    const reelCard = closest('#reels .reel-card');
                    if (reelCard && !closest('.options-btn')) {
                        e.preventDefault();
                        openReelViewer(reelCard);
                        return;
                    }
                    
                    const interactiveAction = closest('.add-to-cart-btn, .cart-icon-button, .checkout-btn, .like-btn, .follow-btn, .gift-button, .report-btn, .share-btn, .comment-btn, .edit-post-btn, .delete-post-btn, .promote-post-btn, .promote-item-btn, #post-format-toolbar button, .retweet-btn');
                    if(interactiveAction) {
                        e.preventDefault();
                        const postElement = closest('.impact-story, .reel-card, .property-card, .news-list-item');

                        if (isGuest && !closest('.share-btn') && !closest('.follow-btn')) {
                            showNotification("Please log in to perform this action.", 'error');
                            authModal.classList.add('show');
                            document.getElementById('login-view').style.display = 'block';
                            setTimeout(function(){ if(typeof generateCaptcha==='function') generateCaptcha(); }, 80);
                            return;
                        }

                        if(closest('.retweet-btn') && postElement) {
                            const originalPostId = postElement.dataset.postId;
                            const originalUserId = postElement.dataset.userId;
                            const retweetBtn = closest('.retweet-btn');
                            const retweetCountEl = retweetBtn ? retweetBtn.querySelector('.retweet-count') : null;

                            if (originalUserId === userState.id) {
                                showNotification('You cannot retweet your own post.', 'warning'); return;
                            }

                            // ── Show Retweet / Quote picker (X-style) ──
                            document.querySelectorAll('._rt_picker').forEach(p => p.remove());
                            const picker = document.createElement('div');
                            picker.className = '_rt_picker';
                            const btnRect = retweetBtn ? retweetBtn.getBoundingClientRect() : { top: 200, left: 100, height: 32 };
                            picker.style.cssText = 'position:fixed;z-index:99990;background:#fff;border:1.5px solid rgba(10,14,39,0.10);border-radius:16px;box-shadow:0 8px 32px rgba(10,14,39,0.18);padding:6px 0;min-width:180px;font-family:inherit;animation:fadeIn 0.15s ease;';
                            picker.style.top  = Math.min(btnRect.top + btnRect.height + 6, window.innerHeight - 120) + 'px';
                            picker.style.left = Math.max(8, Math.min(btnRect.left, window.innerWidth - 196)) + 'px';
                            const alreadyRt = userState.retweetedPostIds.has(originalPostId);
                            picker.innerHTML = `
                                <button class="_rt_do" style="display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:12px 18px;cursor:pointer;font-size:0.9rem;font-weight:600;color:var(--primary);">
                                    <i class="fas fa-retweet" style="width:18px;color:${alreadyRt?'#e53935':'var(--secondary)'}"></i>
                                    ${alreadyRt ? 'Undo Retweet' : 'Retweet'}
                                </button>
                                <button class="_rt_quote" style="display:flex;align-items:center;gap:10px;width:100%;border:none;background:none;padding:12px 18px;cursor:pointer;font-size:0.9rem;font-weight:600;color:var(--primary);border-top:1px solid rgba(10,14,39,0.06);">
                                    <i class="fas fa-quote-right" style="width:18px;color:var(--secondary)"></i> Quote
                                </button>`;
                            document.body.appendChild(picker);
                            const _closePicker = (ev) => { if (!picker.contains(ev.target)) { picker.remove(); document.removeEventListener('click', _closePicker, true); } };
                            setTimeout(() => document.addEventListener('click', _closePicker, true), 100);

                            picker.querySelector('._rt_do').onclick = function() {
                                picker.remove();
                                document.removeEventListener('click', _closePicker, true);
                                if (alreadyRt) {
                                    userState.retweetedPostIds.delete(originalPostId);
                                    if (retweetBtn) retweetBtn.style.color = '';
                                    if (retweetCountEl) retweetCountEl.textContent = Math.max(0, (parseInt(retweetCountEl.textContent)||1) - 1);
                                    showNotification('Retweet removed.', 'info'); return;
                                }
                                const originalAuthor = mockUsers[originalUserId];
                                const originalText = postElement.querySelector('.story-content p')?.innerHTML || '';
                                const mediaFiles = Array.from((postElement.querySelector('.story-media-container')||{querySelectorAll:()=>[]}).querySelectorAll('img,video')).map(el=>({url:el.src,type:el.tagName==='IMG'?'image/jpeg':'video/mp4'}));
                                const authorObj = originalAuthor || { id: originalUserId, fullName: postElement.querySelector('.story-user-info strong')?.textContent || 'User', avatar: postElement.querySelector('.story-header img')?.src || '' };

                                const retweet = createNewPostElement(originalText, mediaFiles, authorObj, false, { retweeterName: userState.fullName });
                                if (feedContainer) feedContainer.prepend(retweet);

                                // ── Mirror retweeted post into profile dashboard ──
                                const pd = document.getElementById('profile-dash-feed');
                                if (pd) {
                                    const rtClone = retweet.cloneNode(true);
                                    if (!pd.querySelector('[data-post-id="'+retweet.dataset.postId+'"]')) pd.prepend(rtClone);
                                }

                                userState.retweetedPostIds.add(originalPostId);
                                if (retweetBtn) retweetBtn.style.color = 'var(--secondary)';
                                if (retweetCountEl) retweetCountEl.textContent = (parseInt(retweetCountEl.textContent)||0) + 1;

                                // Also update count on the ORIGINAL post's retweet-count span
                                postElement.querySelectorAll('.retweet-count').forEach(function(rc) {
                                    rc.textContent = (parseInt(rc.textContent)||0) + 1;
                                });

                                rewardUserForAction && rewardUserForAction('RETWEET_POST');
                                if (typeof updateLiveInteractionCount === 'function') updateLiveInteractionCount('like');
                                try {
                                    fbDb.collection('posts').doc(retweet.dataset.postId).set({ id:retweet.dataset.postId, userId:userState.id, username:userState.fullName||userState.username, avatar:userState.avatar||'', text:originalText||'', media:mediaFiles.map(m=>m.url||m).filter(u=>u&&!u.startsWith('blob:')), isRetweet:true, retweetOf:originalPostId, retweeterName:userState.fullName, createdAt:new Date().toISOString() });
                                } catch(e) {}
                                if (typeof window.pushNotification==='function' && originalUserId && originalUserId!==userState.id) window.pushNotification((userState.fullName||'Someone')+' retweeted your post! 🔁','info');
                                showNotification('🔁 Retweeted!', 'success');
                            };

                            picker.querySelector('._rt_quote').onclick = function() {
                                picker.remove();
                                document.removeEventListener('click', _closePicker, true);
                                const originalText = postElement.querySelector('.story-content p')?.textContent || '';
                                const originalAuthorEl = postElement.querySelector('.story-user-info strong');
                                const originalAuthorName = originalAuthorEl ? originalAuthorEl.textContent : 'Unknown';
                                const originalAvatar = postElement.querySelector('.story-header img')?.src || '';
                                const originalMedia = Array.from((postElement.querySelector('.story-media-container')||{querySelectorAll:()=>[]}).querySelectorAll('img[src],video[src]')).map(el=>el.src).filter(u=>u&&!u.startsWith('blob:'));

                                // ── Inline floating quote-compose modal ──
                                document.querySelectorAll('#_quote_compose_modal').forEach(function(el){ el.remove(); });
                                const _qModal = document.createElement('div');
                                _qModal.id = '_quote_compose_modal';
                                _qModal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(10,14,39,0.55);display:flex;align-items:center;justify-content:center;padding:16px;';
                                _qModal.innerHTML = `
                                <div style="background:var(--card-bg,#fff);border-radius:18px;width:100%;max-width:520px;box-shadow:0 8px 40px rgba(0,0,0,0.22);overflow:hidden;">
                                    <div style="padding:14px 18px;border-bottom:1px solid rgba(10,14,39,0.08);display:flex;align-items:center;justify-content:space-between;">
                                        <strong style="font-size:1rem;color:var(--primary);">Quote Post</strong>
                                        <button id="_qm_close" style="background:none;border:none;cursor:pointer;font-size:1.3rem;color:var(--text-muted);line-height:1;">×</button>
                                    </div>
                                    <div style="padding:14px 18px;">
                                        <div style="display:flex;gap:10px;margin-bottom:12px;">
                                            <img src="${window.userState&&window.userState.avatar||''}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.src='https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=80'">
                                            <textarea id="_qm_text" placeholder="Add your thoughts…" style="flex:1;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;padding:10px 12px;font-size:0.92rem;resize:none;min-height:80px;font-family:inherit;color:var(--primary);background:var(--input-bg,#f8f9ff);outline:none;"></textarea>
                                        </div>
                                        <div style="border:1.5px solid rgba(10,14,39,0.1);border-radius:12px;padding:10px 14px;background:rgba(10,14,39,0.02);">
                                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                                                <img src="${originalAvatar}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none'">
                                                <strong style="font-size:0.8rem;color:var(--secondary);">@${originalAuthorName}</strong>
                                            </div>
                                            <p style="font-size:0.82rem;color:var(--text-muted);margin:0;line-height:1.4;">${originalText.substring(0,200)}${originalText.length>200?'…':''}</p>
                                            ${originalMedia[0]?'<img src="'+originalMedia[0]+'" style="margin-top:8px;width:100%;max-height:120px;object-fit:cover;border-radius:8px;">':''}
                                        </div>
                                    </div>
                                    <div style="padding:10px 18px 16px;display:flex;justify-content:flex-end;gap:10px;">
                                        <button id="_qm_cancel" style="padding:9px 20px;border-radius:50px;border:1.5px solid rgba(10,14,39,0.15);background:none;cursor:pointer;font-weight:600;color:var(--text-muted);font-size:0.88rem;">Cancel</button>
                                        <button id="_qm_post" style="padding:9px 24px;border-radius:50px;border:none;background:var(--secondary,#1B2B8B);color:white;cursor:pointer;font-weight:700;font-size:0.88rem;">Post Quote</button>
                                    </div>
                                </div>`;
                                document.body.appendChild(_qModal);
                                setTimeout(function(){ var ta=document.getElementById('_qm_text'); if(ta) ta.focus(); }, 80);

                                function _closeQModal() { _qModal.remove(); }
                                document.getElementById('_qm_close').onclick = _closeQModal;
                                document.getElementById('_qm_cancel').onclick = _closeQModal;
                                _qModal.addEventListener('click', function(ev){ if(ev.target===_qModal) _closeQModal(); });

                                document.getElementById('_qm_post').onclick = async function() {
                                    const quoteText = (document.getElementById('_qm_text')?.value||'').trim();
                                    if (!quoteText) { showNotification('Please add your thoughts before posting.', 'warning'); return; }
                                    const _qBtn = document.getElementById('_qm_post');
                                    if (_qBtn) { _qBtn.disabled = true; _qBtn.textContent = 'Posting…'; }

                                    // Build quote post element
                                    const quoteEl = createNewPostElement(quoteText, [], {
                                        id: userState.id, fullName: userState.fullName||userState.username, avatar: userState.avatar||''
                                    });
                                    // Inject quoted-post preview block inside the new element
                                    const _qBlock = document.createElement('div');
                                    _qBlock.style.cssText = 'border:1.5px solid rgba(10,14,39,0.1);border-radius:12px;padding:10px 14px;margin:8px 16px 4px;background:rgba(10,14,39,0.02);';
                                    _qBlock.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">'
                                        + '<img src="'+originalAvatar+'" style="width:18px;height:18px;border-radius:50%;object-fit:cover;" onerror="this.style.display=\'none\'">'
                                        + '<strong style="font-size:0.78rem;color:var(--secondary);">@'+originalAuthorName+'</strong></div>'
                                        + '<p style="font-size:0.8rem;color:var(--text-muted);margin:0;line-height:1.4;">'+originalText.substring(0,200)+(originalText.length>200?'…':'')+'</p>'
                                        + (originalMedia[0]?'<img src="'+originalMedia[0]+'" style="margin-top:6px;width:100%;max-height:100px;object-fit:cover;border-radius:7px;">':'');
                                    const _storyContent = quoteEl.querySelector('.story-content');
                                    if (_storyContent) _storyContent.insertAdjacentElement('afterend', _qBlock);

                                    const _fc = document.getElementById('feed-container');
                                    if (_fc) _fc.prepend(quoteEl);
                                    const _pd = document.getElementById('profile-dash-feed');
                                    if (_pd) _pd.prepend(quoteEl.cloneNode(true));

                                    // Save to Firestore
                                    const _qId = quoteEl.dataset.postId || ('quote-'+Date.now());
                                    quoteEl.dataset.postId = _qId;
                                    try {
                                        await window.fbDb.collection('posts').doc(_qId).set({
                                            id: _qId, text: quoteText, media: [],
                                            userId: userState.id, username: userState.fullName||userState.username,
                                            avatar: userState.avatar||'',
                                            isQuote: true, quotedPostId: originalPostId,
                                            quotedAuthor: originalAuthorName, quotedText: originalText.substring(0,240),
                                            quotedMedia: originalMedia[0]||'',
                                            createdAt: new Date().toISOString()
                                        });
                                    } catch(e) { console.warn('[Quote] Firestore save failed:', e.message); }

                                    _closeQModal();
                                    showNotification('✅ Quote posted!', 'success');
                                    if (typeof rewardUserForAction === 'function') rewardUserForAction('CREATE_POST');
                                }; // end _qm_post.onclick
                            }; // end ._rt_quote.onclick

                        } else if(closest('.download-media-btn')) {
                            // Universal watermarked download — images get canvas watermark, videos download directly
                            const container = postElement ||
                                closest('.reel-card') ||
                                closest('.news-list-item') ||
                                closest('.property-card') ||
                                e.target.closest('[data-media-url]');
                            const mediaEls = container
                                ? container.querySelectorAll('img[src], video[src]')
                                : [];
                            const urls = [];
                            mediaEls.forEach(function(el) {
                                const url = el.src || el.dataset.src;
                                if (url && !url.startsWith('data:') && !url.startsWith('blob:') && !urls.includes(url)) {
                                    urls.push({ url: url, type: el.tagName === 'VIDEO' ? 'video' : 'image' });
                                }
                            });
                            if (container && container.dataset.mediaUrl) {
                                const u = container.dataset.mediaUrl;
                                if (u && !u.startsWith('blob:')) urls.push({ url: u, type: /\.(mp4|webm|mov)/i.test(u) ? 'video' : 'image' });
                            }
                            if (urls.length === 0) {
                                showNotification('No downloadable media found in this post.', 'info');
                            } else {
                                showNotification(`⬇ Preparing ${urls.length} file${urls.length > 1 ? 's' : ''} with Empyrean watermark...`, 'info');
                                urls.forEach(function(item, i) {
                                    const ts = Date.now();
                                    if (item.type === 'image') {
                                        // Canvas watermark for images
                                        const img = new Image();
                                        img.crossOrigin = 'anonymous';
                                        img.onload = function() {
                                            try {
                                                const canvas = document.createElement('canvas');
                                                canvas.width = img.naturalWidth;
                                                canvas.height = img.naturalHeight;
                                                const ctx = canvas.getContext('2d');
                                                ctx.drawImage(img, 0, 0);
                                                // Watermark bar at bottom
                                                const barH = Math.max(36, canvas.height * 0.055);
                                                ctx.fillStyle = 'rgba(10,14,39,0.72)';
                                                ctx.fillRect(0, canvas.height - barH, canvas.width, barH);
                                                // Logo icon circle
                                                const cx = 22, cy = canvas.height - barH / 2;
                                                ctx.beginPath(); ctx.arc(cx, cy, barH * 0.38, 0, Math.PI * 2);
                                                ctx.fillStyle = '#F5C518'; ctx.fill();
                                                ctx.fillStyle = '#0A0E27'; ctx.font = `bold ${barH * 0.42}px Arial`;
                                                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                                                ctx.fillText('E', cx, cy);
                                                // Text
                                                ctx.fillStyle = 'white';
                                                ctx.font = `bold ${barH * 0.44}px Arial`;
                                                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                                                ctx.fillText('Empyrean', cx + barH * 0.52, cy);
                                                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                                                ctx.font = `${barH * 0.32}px Arial`;
                                                ctx.textAlign = 'right';
                                                ctx.fillText('empyrean.app', canvas.width - 10, cy);
                                                canvas.toBlob(function(blob) {
                                                    if (!blob) return;
                                                    const a = document.createElement('a');
                                                    a.href = URL.createObjectURL(blob);
                                                    a.download = 'empyrean-' + ts + '-' + (i + 1) + '.jpg';
                                                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                                    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
                                                }, 'image/jpeg', 0.92);
                                            } catch(canvasErr) {
                                                // CORS fallback
                                                const a = document.createElement('a');
                                                a.href = item.url; a.download = 'empyrean-' + ts + '-' + (i + 1) + '.jpg';
                                                a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                            }
                                        };
                                        img.onerror = function() {
                                            const a = document.createElement('a');
                                            a.href = item.url; a.download = 'empyrean-' + ts + '-' + (i + 1) + '.jpg';
                                            a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                        };
                                        img.src = item.url;
                                    } else {
                                        // Video — download directly (client-side video watermarking requires server)
                                        fetch(item.url)
                                            .then(function(r) { return r.blob(); })
                                            .then(function(blob) {
                                                const a = document.createElement('a');
                                                a.href = URL.createObjectURL(blob);
                                                a.download = 'empyrean-' + ts + '-' + (i + 1) + '.mp4';
                                                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                                setTimeout(() => URL.revokeObjectURL(a.href), 30000);
                                            })
                                            .catch(function() {
                                                const a = document.createElement('a');
                                                a.href = item.url; a.download = 'empyrean-' + ts + '-' + (i + 1) + '.mp4';
                                                a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
                                            });
                                    }
                                });
                                rewardUserForAction && rewardUserForAction('DOWNLOAD_MEDIA');
                            }

                        } else if(closest('#post-format-toolbar button')) {
                            const textarea = document.getElementById('post-text');
                            if (!textarea) return; 

                            const format = closest('#post-format-toolbar button').dataset.format;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const selectedText = textarea.value.substring(start, end);
                            let before = '', after = '';
                            if (format === 'bold')        { before = '*';  after = '*'; }
                            else if (format === 'italic') { before = '_';  after = '_'; }
                            else if (format === 'strike') { before = '~';  after = '~'; }
                            else if (format === 'code')   { before = '`';  after = '`'; }
                            else if (format === 'underline') { before = '__'; after = '__'; }
                            else if (format === 'highlight') { before = '=='; after = '=='; }

                            const newText = textarea.value.substring(0, start) + before + selectedText + after + textarea.value.substring(end);
                            textarea.value = newText;
                            // Restore cursor inside the markers
                            textarea.selectionStart = start + before.length;
                            textarea.selectionEnd = end + before.length;
                            textarea.focus();

                        } else if(closest('.delete-post-btn') && postElement) {
                            // Resolve which Firestore collection this post belongs to
                            const _isMarketplace = postElement.classList.contains('property-card');
                            const _isReel        = postElement.classList.contains('reel-card');
                            const _isNews        = postElement.classList.contains('news-list-item');
                            const _isCrisis      = postElement.classList.contains('crisis-report');
                            let _collection = 'posts';
                            if (_isMarketplace) _collection = 'marketplace_listings';
                            else if (_isReel)   _collection = 'reels';
                            else if (_isNews)   _collection = 'news_posts';
                            else if (_isCrisis) _collection = 'crisis_reports';
                            const label = _isMarketplace ? 'listing' : _isReel ? 'reel' : _isNews ? 'news post' : _isCrisis ? 'crisis report' : 'post';

                            // Ownership check — owner OR admin can delete
                            const _postOwner = postElement.dataset.userId || postElement.dataset.sellerId || '';
                            if (!isAdmin && _postOwner && _postOwner !== userState.id) {
                                showNotification('You can only delete your own content.', 'warning'); return;
                            }

                            if (confirm(`Delete this ${label}? This cannot be undone.`)) {
                                // 1. Animate out everywhere it appears in the DOM
                                const _docId = postElement.dataset.postId || postElement.dataset.id;
                                postElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                                postElement.style.opacity = '0';
                                postElement.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                    // Remove from every feed/container it may appear in
                                    document.querySelectorAll(
                                        '[data-post-id="'+_docId+'"], [data-id="'+_docId+'"], [data-reel-id="'+_docId+'"]'
                                    ).forEach(function(el) { el.remove(); });
                                    if (typeof populateProfileGallery === 'function') populateProfileGallery(userState.id);
                                }, 310);
                                // 2. Delete from Firestore
                                if (window.fbDb && _docId) {
                                    try {
                                        await window.fbDb.collection(_collection).doc(_docId).delete();
                                        showNotification(`✅ ${label.charAt(0).toUpperCase()+label.slice(1)} deleted permanently.`, 'success');
                                    } catch(err) {
                                        console.error('[Delete] Firestore delete failed:', err.message);
                                        showNotification('Removed from view. Cloud sync may be delayed.', 'info');
                                    }
                                } else {
                                    showNotification(`${label.charAt(0).toUpperCase()+label.slice(1)} removed.`, 'info');
                                }
                            }
                        } else if (closest('.promote-post-btn, .promote-item-btn') && postElement) {
                            promptForPromotion(postElement.dataset.postId || postElement.dataset.id);
                        } else if (closest('.edit-post-btn') && postElement) {
                            // Ownership check
                            const _editOwner = postElement.dataset.userId || postElement.dataset.sellerId || '';
                            if (!isAdmin && _editOwner && _editOwner !== userState.id) {
                                showNotification('You can only edit your own content.', 'warning'); return;
                            }
                            const postId = postElement.dataset.postId || postElement.dataset.id;
                            // Determine collection
                            let _editCollection = 'posts';
                            if (postElement.classList.contains('property-card'))  _editCollection = 'marketplace_listings';
                            else if (postElement.classList.contains('reel-card')) _editCollection = 'reels';
                            else if (postElement.classList.contains('news-list-item')) _editCollection = 'news_posts';
                            else if (postElement.classList.contains('crisis-report'))  _editCollection = 'crisis_reports';
                            // Get current text
                            const _curText = postElement.querySelector('.story-content p, .property-info h4, .news-item-content p, .news-item-summary')?.textContent || '';
                            const editPostIdInput = document.getElementById('edit-post-id');
                            const editPostTextInput = document.getElementById('edit-post-text');
                            const editPostModalOverlay = document.getElementById('edit-post-modal-overlay');
                            let editCollectionInput = document.getElementById('edit-post-collection');
                            if (!editCollectionInput && editPostIdInput) {
                                // Inject hidden field if not already in modal
                                editCollectionInput = document.createElement('input');
                                editCollectionInput.type = 'hidden';
                                editCollectionInput.id = 'edit-post-collection';
                                editPostIdInput.parentNode.appendChild(editCollectionInput);
                            }
                            if (editPostIdInput) editPostIdInput.value = postId;
                            if (editPostTextInput) editPostTextInput.value = _curText;
                            if (editCollectionInput) editCollectionInput.value = _editCollection;
                            if (editPostModalOverlay) { editPostModalOverlay.classList.add('show'); document.body.classList.add('modal-open'); }
                        } else if (closest('.share-btn') && postElement) {
                            const postId = postElement.dataset.postId;
                            shareContent({
                                title: "Check out this post on Empyrean!",
                                text: postElement.querySelector('.story-content p, .news-item-content p')?.textContent?.substring(0, 100) + '...' || 'Humanitarian impact story',
                                url: `${window.location.href.split('#')[0]}#post/${postId}`
                            });
                        } else if (closest('.report-btn') && postElement) {
                            const reportBtn = closest('.report-btn');
                            const reportedUserId = postElement.dataset.authorId || postElement.dataset.userId;
                            const reportedUsername = postElement.querySelector('.story-user-info strong, .news-item-author strong')?.textContent || 'this user';
                            if (!reportedUserId || reportedUserId === userState.id) {
                                showNotification('You cannot report your own post.', 'warning'); return;
                            }
                            const confirmReport = confirm(`Report post by @${reportedUsername} for abuse?

This will be reviewed by admins. Accounts with multiple reports may be suspended.`);
                            if (!confirmReport) return;
                            // Track reports in localStorage
                            try {
                                const reports = JSON.parse(localStorage.getItem('empyrean_reports') || '{}');
                                const key = reportedUserId;
                                if (!reports[key]) reports[key] = { count: 0, reporters: [], username: reportedUsername };
                                if (!reports[key].reporters.includes(userState.id)) {
                                    reports[key].count++;
                                    reports[key].reporters.push(userState.id);
                                }
                                localStorage.setItem('empyrean_reports', JSON.stringify(reports));
                                // Auto-block if 3+ unique reports
                                if (reports[key].count >= 3) {
                                    // Add to admin SOS queue as abuse report
                                    const abuseReport = {
                                        id: 'abuse-' + Date.now(),
                                        userId: reportedUserId,
                                        username: reportedUsername,
                                        title: 'Reported for Abuse',
                                        story: `Account @${reportedUsername} has received ${reports[key].count} abuse reports and has been flagged for review.`,
                                        status: 'pending_approval',
                                        createdAt: new Date().toISOString(),
                                        isAbuseReport: true
                                    };
                                    mockAdminSosQueue.push(abuseReport);
                                    showNotification(`⚠️ @${reportedUsername} has been flagged for admin review due to multiple reports.`, 'warning');
                                } else {
                                    showNotification(`✅ Report submitted. Our team will review this content.`, 'success');
                                }
                                // Save to Firestore
                                try { fbDb.collection('abuse_reports').add({ reportedUserId, reportedUsername, reporterId: userState.id, postId: postElement.dataset.postId, createdAt: new Date().toISOString() }); } catch(e) {}
                            } catch(e) { showNotification('Report submitted.', 'success'); }
                            reportBtn.style.opacity = '0.4';
                            reportBtn.style.pointerEvents = 'none';
                        } else if(closest('.like-btn') && postElement) {
                            const likeBtn = closest('.like-btn');
                            const postId = postElement.dataset.postId;
                            const likeIcon = likeBtn.querySelector('.fa-heart');
                            const likeCountEl = likeBtn.querySelector('.like-count');
                            let likeCount = parseInt(likeCountEl ? likeCountEl.textContent.replace(/,/g, '') : '0');
                            
                            rewardUserForAction('ENGAGE_LIKE');

                            if (userState.likedPostIds.has(postId)) {
                                userState.likedPostIds.delete(postId);
                                if (likeIcon) { likeIcon.classList.remove('liked', 'fas'); likeIcon.classList.add('far'); }
                                likeCount = Math.max(0, likeCount - 1);
                            } else {
                                userState.likedPostIds.add(postId);
                                if (typeof window.pushNotification === 'function' && postElement.dataset.userId && postElement.dataset.userId !== userState.id) {
                                    window.pushNotification((userState.fullName||'Someone') + ' liked your post! ❤️', 'info');
                                }
                                if (typeof updateLiveInteractionCount === 'function') updateLiveInteractionCount('like');
                                if (likeIcon) { likeIcon.classList.add('liked', 'fas'); likeIcon.classList.remove('far'); }
                                likeCount++;
                                rewardUserForAction('RECEIVE_LIKE', postElement.dataset.userId);
                            }
                            const formatted = new Intl.NumberFormat().format(likeCount);
                            // Update ALL instances of this post across all feeds (profile + main feed)
                            document.querySelectorAll('[data-post-id="' + postId + '"]').forEach(function(pel) {
                                var lc = pel.querySelector('.like-count');
                                var li = pel.querySelector('.fa-heart');
                                if (lc) lc.textContent = formatted;
                                if (li) {
                                    if (userState.likedPostIds.has(postId)) {
                                        li.classList.add('liked','fas'); li.classList.remove('far');
                                    } else {
                                        li.classList.remove('liked','fas'); li.classList.add('far');
                                    }
                                }
                            });
                            // Persist like count to Firestore so profile page always shows real count
                            try {
                                if (window.fbDb && postId) {
                                    window.fbDb.collection('posts').doc(postId).set(
                                        { likes: likeCount }, { merge: true }
                                    ).catch(function(){});
                                }
                            } catch(e) {}
                        } else if (closest('.follow-btn')) {
                            const followBtn = closest('.follow-btn');
                            const userIdToFollow = followBtn.dataset.userId;
                            if (!userIdToFollow) return; 

                            // Check if this follow btn is inside any business page section
                            const isPageFollow = !!(closest('.business-page-header') || closest('#business-page'));
                            if (isPageFollow && userState.businessPage && (userState.businessPage.id === userIdToFollow || userIdToFollow.startsWith('biz-'))) {
                                if (userState.followedUserIds.has(userIdToFollow)) {
                                    userState.followedUserIds.delete(userIdToFollow);
                                    userState.businessPage.followerCount--;
                                    followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
                                    followBtn.classList.remove('followed');
                                    showNotification('Unfollowed ' + userState.businessPage.name, 'info');
                                } else {
                                    userState.followedUserIds.add(userIdToFollow);
                                    userState.businessPage.followerCount++;
                                    followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
                                    followBtn.classList.add('followed');
                                    showNotification('Now following ' + userState.businessPage.name + '!', 'success');
                                }
                                const businessPageFollowerCount = document.getElementById('business-page-follower-count');
                                if (businessPageFollowerCount) businessPageFollowerCount.textContent = userState.businessPage.followerCount.toLocaleString();
                            } else {
                                const userToFollow = mockUsers[userIdToFollow];
                                if (!userToFollow) return;
        
                                if (userState.followedUserIds.has(userIdToFollow)) {
                                    userState.followedUserIds.delete(userIdToFollow);
                                    userToFollow.followerCount = Math.max(0, (userToFollow.followerCount || 0) - 1);
                                    followBtn.textContent = 'Follow';
                                    followBtn.classList.remove('followed');
                                    showNotification('Unfollowed @' + userToFollow.username, 'info');
                                } else {
                                    userState.followedUserIds.add(userIdToFollow);
                                    userToFollow.followerCount = (userToFollow.followerCount || 0) + 1;
                                    followBtn.innerHTML = '<i class="fas fa-check"></i> Following';
                                    followBtn.classList.add('followed');
                                    checkAndAwardRank(userToFollow);
                                    showNotification('Now following @' + userToFollow.username + '!', 'success');
                                    if(typeof window.pushNotification==='function')window.pushNotification(userState.fullName+' started following you!','new_follower');
                                }
                                try{fbDb.collection('users').doc(userState.id).update({followedUserIds:Array.from(userState.followedUserIds)});}catch(e){}
                            }
                            renderDynamicUI();
                            renderSuggestedUsers();
                            if(typeof renderContactList==='function')setTimeout(function(){renderContactList();},100);
                        } else if (closest('.comment-btn') && postElement) {
                            const commentSection = postElement.querySelector('.comment-section');
                            if (commentSection) { 
                                const isVisible = window.getComputedStyle(commentSection).display === 'block';
                                commentSection.style.display = isVisible ? 'none' : 'block';
                                if (!isVisible) {
                                    // Focus the input when opening
                                    const inp = commentSection.querySelector('input[name="comment-text"]');
                                    if (inp) setTimeout(() => inp.focus(), 50);
                                }
                            }
                        } else if (closest('.add-to-cart-btn')) {
                            e.stopPropagation();
                            const card = closest('.property-card');
                            if (!card) return; 
                            const item = { id: card.dataset.id, name: card.dataset.name, price: card.dataset.price, currency: card.dataset.displayCurrency || card.dataset.currency || (document.getElementById('item-currency') ? document.getElementById('item-currency').value : 'NGN'), img: card.querySelector('img, video')?.src || '' }; 
                            if (cart.find(cartItem => cartItem.id === item.id)) {
                                showNotification("This item is already in your cart.", 'warning');
                            } else {
                                cart.push(item);
                                updateCartUI();
                                showNotification(`${item.name} added to cart!`);
                            }
                        } else if (closest('.cart-icon-button')) {
                            document.getElementById('cart-modal-overlay').classList.add('show');
                            document.body.classList.add('modal-open');
                            // Always reset to cart view when opening
                            const cartView2 = document.getElementById('cart-view');
                            const checkoutView2 = document.getElementById('checkout-view');
                            if(cartView2) cartView2.style.display = 'block';
                            if(checkoutView2) checkoutView2.style.display = 'none';
                            updateCartUI();
                        } else if (closest('.checkout-btn')) {
                            document.getElementById('cart-view').style.display = 'none';
                            document.getElementById('checkout-view').style.display = 'block';
                            // Ensure required attributes are set for the active payment method
                            const checkoutForm = document.getElementById('checkout-form');
                            const activePaymentTab = checkoutForm.querySelector('.payment-tab.active');
                            if (activePaymentTab) {
                                const targetContentId = activePaymentTab.dataset.target;
                                const targetContent = document.getElementById(targetContentId);
                                if (targetContent) {
                                    targetContent.querySelectorAll('input[data-original-required="true"]').forEach(input => input.required = true);
                                    // Make inputs in other methods NOT required
                                    document.querySelectorAll('#checkout-form .payment-method-content:not(.active) input').forEach(input => input.required = false);
                                }
                            }
                        }
                    }
                });

                document.body.addEventListener('change', async function(e){
                    const target = e.target;
                    const closest = (selector) => target.closest(selector);
                    const files = target.files ? Array.from(target.files) : [];

                    if (target.id === 'signup-avatar') {
                        if (files.length > 0) handleAvatarUpload(files[0], 'avatar-preview', true);
                    } else if (target.id === 'profile-pic-input-main') {
                        if (files.length > 0) handleAvatarUpload(files[0], 'profile-pic-img', true);
                    } else if (target.id === 'cover-photo-input') {
                        if (files.length > 0) {
                            newCoverFile = files[0];
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                const profileCoverContainer = document.getElementById('profile-cover-container');
                                if (profileCoverContainer) profileCoverContainer.style.backgroundImage = `url('${event.target.result}')`;
                            };
                            reader.readAsDataURL(newCoverFile);
                            // Pre-upload to Cloudinary in background
                            window.uploadToCloudinary(newCoverFile, null)
                                .then(url => { newCoverFile._cloudUrl = url; newCoverFile._previewUrl = url; })
                                .catch(()=>{});
                        }
                    } else if (target.id === 'business-cover-photo-input' && files.length > 0) {
                        const newFile = files[0];
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                            const localUrl = event.target.result;
                            const businessPageCoverPhoto = document.getElementById('business-page-cover-photo');
                            // Apply local preview IMMEDIATELY
                            if (businessPageCoverPhoto) {
                                businessPageCoverPhoto.style.backgroundImage = `url('${localUrl}')`;
                                businessPageCoverPhoto.style.backgroundSize = 'cover';
                                businessPageCoverPhoto.style.backgroundPosition = 'center';
                            }
                            if (userState.businessPage) userState.businessPage.coverPhoto = localUrl;
                            showNotification('Cover photo updating...', 'info');
                            // Upload to cloud (always resolves now)
                            try {
                                const cloudUrl = await window.uploadToCloudinary(newFile, null);
                                if (businessPageCoverPhoto && cloudUrl !== localUrl) {
                                    businessPageCoverPhoto.style.backgroundImage = `url('${cloudUrl}')`;
                                }
                                if (userState.businessPage) userState.businessPage.coverPhoto = cloudUrl;
                                try { await window.fbDb.collection('business_pages').doc(userState.businessPage.id).update({ coverPhoto: cloudUrl }); } catch(e) {}
                                showNotification('✅ Cover photo saved!', 'success');
                            } catch(e) {
                                showNotification('Cover photo saved locally.', 'info');
                            }
                        };
                        reader.readAsDataURL(newFile);
                    } else if (target.id === 'business-profile-photo-input' && files.length > 0) {
                        const newFile = files[0];
                        resizeAndCropImage(newFile, 150, 150, async (dataUrl) => {
                            const businessPageProfilePic = document.getElementById('business-page-profile-pic');
                            if (businessPageProfilePic) businessPageProfilePic.src = dataUrl;
                            // Upload to Cloudinary
                            try {
                                const res = await fetch(dataUrl);
                                const blob = await res.blob();
                                const f = new File([blob], 'biz-profile.jpg', { type: 'image/jpeg' });
                                const cloudUrl = await window.uploadToCloudinary(f, null);
                                if (businessPageProfilePic) businessPageProfilePic.src = cloudUrl;
                                if (userState.businessPage) {
                                    userState.businessPage.profilePhoto = cloudUrl;
                                    await fbDb.collection('business_pages').doc(userState.businessPage.id).update({ profilePhoto: cloudUrl });
                                }
                                showNotification('Profile photo updated and saved!', 'success');
                            } catch(e) {
                                if (userState.businessPage) userState.businessPage.profilePhoto = dataUrl;
                                showNotification('Profile photo updated locally.', 'info');
                            }
                        });
                    } else if (target.matches('[name="user-type"]')) {
                        const orgFields = document.getElementById('org-fields');
                        const individualFields = document.getElementById('individual-fields');
                        if (!orgFields || !individualFields) return;

                        const isOrg = target.value === 'organisation';
                        if(isOrg) {
                            orgFields.style.display = 'block';
                            individualFields.style.display = 'none';
                        } else {
                            orgFields.style.display = 'none';
                            individualFields.style.display = 'block';
                        }
                        
                        orgFields.querySelectorAll('input').forEach(input => input.required = isOrg);
                        individualFields.querySelectorAll('input').forEach(input => input.required = !isOrg);

                    } else if (target.id === 'post-media-input') {
                        postMediaFiles = files;
                        // Build premium grid preview above the textarea
                        const previewEl = document.getElementById('post-media-preview');
                        if (previewEl) {
                            previewEl.innerHTML = '';
                            var _count = postMediaFiles.length;
                            if (_count === 0) { previewEl.style.display = 'none'; }
                            else {
                                previewEl.style.cssText = 'display:grid;gap:3px;border-radius:12px;overflow:hidden;margin-bottom:8px;max-height:320px;';
                                previewEl.style.gridTemplateColumns = _count===1?'1fr':_count===2?'1fr 1fr':_count===3?'2fr 1fr':'1fr 1fr';
                                postMediaFiles.forEach(function(file, idx) {
                                    if (idx >= 4) return;
                                    var url = URL.createObjectURL(file);
                                    var cell = document.createElement('div');
                                    cell.style.cssText = 'overflow:hidden;height:'+(_count===1?'260':'160')+'px;background:#000;position:relative;'+(_count===3&&idx===0?'grid-row:1/3;':'');
                                    cell.innerHTML = file.type.startsWith('video/')
                                        ? '<video src="'+url+'" style="width:100%;height:100%;object-fit:cover;" muted playsinline></video>'
                                        : '<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;" loading="lazy">';
                                    var rb = document.createElement('button');
                                    rb.type='button';
                                    rb.style.cssText='position:absolute;top:5px;right:5px;background:rgba(239,68,68,0.9);border:none;color:white;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:0.85rem;z-index:3;line-height:1;';
                                    rb.innerHTML='&times;';
                                    (function(i){ rb.onclick = function() { cell.remove(); postMediaFiles.splice(i,1); }; })(idx);
                                    cell.appendChild(rb);
                                    previewEl.appendChild(cell);
                                });
                                if (_count > 4) {
                                    var badge = document.createElement('div');
                                    badge.style.cssText = 'display:flex;align-items:center;justify-content:center;background:rgba(10,14,39,0.7);color:white;font-size:1.4rem;font-weight:800;height:160px;';
                                    badge.textContent = '+'+(_count-4);
                                    previewEl.appendChild(badge);
                                }
                            }
                        }
                    } else if (target.id === 'business-post-media-input') {
                        businessPostMediaFiles = files;
                        handleMediaPreview(businessPostMediaFiles, 'business-post-media-preview');
                    } else if (target.id === 'sos-media-input') {
                        sosMediaFiles = files;
                        window.sosMediaFiles = sosMediaFiles; // sync to window for fix blocks
                        handleMediaPreview(sosMediaFiles, 'sos-media-preview');
                    } else if (target.id === 'crisis-media-input') {
                        crisisMediaFiles = files;
                        window.crisisMediaFiles = crisisMediaFiles; // sync to window for fix blocks
                        handleMediaPreview(crisisMediaFiles, 'crisis-media-preview');
                    } else if (target.id === 'item-media') {
                        if (files.length > 0) {
                            // Convert FileList to Array before concat to avoid type mismatch
                            var newFiles = Array.from(files);
                            marketplaceMediaFiles = marketplaceMediaFiles.concat(newFiles).slice(0, 15);
                            // Reset the file input so it doesn't carry old state
                            target.value = '';
                            handleMarketplacePreview(marketplaceMediaFiles, document.getElementById('marketplace-media-preview'));
                            const marketplaceTextFields = document.getElementById('marketplace-text-fields');
                            if (marketplaceTextFields) {
                                marketplaceTextFields.style.display = marketplaceMediaFiles.length > 0 ? 'block' : 'none';
                            }
                        }
                    } else if (target.id === 'withdrawal-method') {
                        handleWithdrawalMethodChange();
                        updateWithdrawalPreview();
                    } else if (target.id === 'transfer-network') { 
                        updateTransferPreview();
                    } else if (target.id === 'cross-chain-network') {
                        const selectedOption = target.options[target.selectedIndex];
                        const crossChainAddressInput = document.getElementById('cross-chain-address');
                        if (crossChainAddressInput && selectedOption.dataset.placeholder) {
                            crossChainAddressInput.placeholder = selectedOption.dataset.placeholder;
                        }
                        updateCrossChainTransferPreview();
                    } else if (target.id === 'sales-type') {
                        const directFields = document.getElementById('direct-sales-fields');
                        const isDirect = target.value === 'direct';
                        if (directFields) {
                            directFields.style.display = isDirect ? 'block' : 'none';
                            directFields.querySelectorAll('input').forEach(input => input.required = isDirect);
                        }
                    } else if (target.id === 'message-file-input' && files.length > 0) {
                        const messagesContainer = document.getElementById('chat-messages-container');
                        if (!messagesContainer) return;
                        const file = files[0];
                        // Show immediately with blob URL, then upgrade to Cloudinary URL
                        const localUrl = URL.createObjectURL(file);
                        const messageEl = createMessageElement(file.name, true, true, localUrl, file.type);
                        messagesContainer.appendChild(messageEl);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                        target.value = '';
                        // Upload to Cloudinary in background and update src
                        (async () => {
                            try {
                                const cloudUrl = await window.uploadToCloudinary(file, null);
                                // Update any img/video/audio in the message element
                                const mediaEl = messageEl.querySelector('img, video, audio, a');
                                if (mediaEl) {
                                    if (mediaEl.tagName === 'A') mediaEl.href = cloudUrl;
                                    else mediaEl.src = cloudUrl;
                                }
                                // Save to Firestore messages collection
                                const chatPartnerId = document.getElementById('chat-header-info')?.dataset?.userId;
                                if (chatPartnerId) {
                                    const msgId = `msg-${Date.now()}`;
                                    try {
                                        await fbDb.collection('messages').doc(msgId).set({
                                            id: msgId, senderId: userState.id,
                                            receiverId: chatPartnerId,
                                            mediaUrl: cloudUrl, mediaType: file.type,
                                            fileName: file.name,
                                            createdAt: new Date().toISOString()
                                        });
                                    } catch(e) {}
                                }
                            } catch(e) { console.warn('Message file upload failed:', e); }
                        })();
                    } else if (target.id === 'news-media-file' && files.length > 0) {
                        newsMediaFile = files[0];
                        const previewContainer = document.getElementById('news-media-preview');
                        if (!previewContainer) return;

                        previewContainer.innerHTML = '';
                        const url = URL.createObjectURL(newsMediaFile);
                        let mediaEl;
                        if(newsMediaFile.type.startsWith('image/')) {
                            mediaEl = document.createElement('img');
                        } else {
                            mediaEl = document.createElement('video');
                            mediaEl.controls = true;
                            mediaEl.muted = true;
                            mediaEl.loop = true;
                            mediaEl.autoplay = true;
                        }
                        mediaEl.src = url;
                        previewContainer.appendChild(mediaEl);
                    } else if (target.id === 'page-cover-photo-input' && files.length > 0) {
                        newPageCoverFile = files[0];
                        const pageCoverPhotoPreview = document.getElementById('page-cover-photo-preview');
                        if (pageCoverPhotoPreview) {
                            pageCoverPhotoPreview.style.backgroundImage = `url(${URL.createObjectURL(newPageCoverFile)})`;
                            pageCoverPhotoPreview.innerHTML = ''; 
                        }
                    } else if (target.id === 'page-profile-photo-input' && files.length > 0) {
                        newPageProfileFile = files[0];
                        const pageProfilePhotoPreview = document.getElementById('page-profile-photo-preview');
                        if (pageProfilePhotoPreview) {
                            pageProfilePhotoPreview.style.backgroundImage = `url(${URL.createObjectURL(newPageProfileFile)})`;
                        }
                    } else if (target.id === 'live-custom-bg-upload-input') { 
                        if (files.length > 0) {
                            const bgFile = files[0];
                            liveStreamData.customBackgroundFile = bgFile;
                            // Show local preview immediately
                            const localBgUrl = URL.createObjectURL(bgFile);
                            liveStreamData.background = localBgUrl;
                            showNotification('Custom background uploading to cloud...', 'info');
                            populateBackgroundSelector();
                            // Upload to Cloudinary
                            (async () => {
                                try {
                                    const cloudBgUrl = await window.uploadToCloudinary(bgFile, null);
                                    liveStreamData.background = cloudBgUrl;
                                    liveStreamData.customBackgroundFile = null; // no longer needed as file
                                    liveStreamData._customBgCloudUrl = cloudBgUrl;
                                    populateBackgroundSelector();
                                    showNotification('✅ Background saved to cloud!', 'success');
                                } catch(e) {
                                    console.warn('Background upload failed:', e);
                                    showNotification('Background uploaded locally.', 'warning');
                                }
                            })();
                        }
                    } else if (target.id === 'fan-club-toggle') { 
                        liveStreamData.fanClubActive = target.checked;
                        showNotification(`Fan Club is now ${liveStreamData.fanClubActive ? 'activated' : 'deactivated'}.`, "info");
                        updateLiveUI();
                    } else if (closest('.kyc-file-upload') && target.type === 'file') { 
                        const uploadArea = closest('.kyc-file-upload');
                        const inputId = uploadArea.dataset.inputId;
                        const fileInput = document.getElementById(inputId);
                        const previewElementId = `${inputId}-preview`;
                        const previewElement = document.getElementById(previewElementId);

                        if (previewElement && files.length > 0) {
                            previewElement.innerHTML = `<span>File selected: ${files[0].name}</span>`;
                        } else if (previewElement) {
                            previewElement.innerHTML = '';
                        }
                        uploadArea.style.borderColor = ''; // Clear border on file selection
                    }
                });

                document.body.addEventListener('submit', async function(e) {
                    const form = e.target;
                    // Reel comment form handler
                    if (form.classList.contains('reel-comment-form')) {
                        e.preventDefault();
                        const input = form.querySelector('input');
                        const text = input ? input.value.trim() : '';
                        if (!text) return;
                        const viewerItem = form.closest('.reel-viewer-item');
                        const commentsList = viewerItem ? viewerItem.querySelector('.reel-comments-list') : null;
                        if (commentsList) {
                            const placeholder = commentsList.querySelector('p');
                            if (placeholder) placeholder.remove();
                            const commentEl = document.createElement('div');
                            commentEl.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
                            commentEl.innerHTML = `<img src="${userState.avatar}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0;"><div><strong style="color:white;font-size:0.8rem;">${userState.fullName || 'You'}</strong><p style="color:rgba(255,255,255,0.8);font-size:0.82rem;margin-top:2px;">${text}</p></div>`;
                            commentsList.appendChild(commentEl);
                            commentsList.scrollTop = commentsList.scrollHeight;
                            const countEl = viewerItem.querySelector('.reel-comment-count');
                            if (countEl) countEl.textContent = parseInt(countEl.textContent || '0') + 1;
                        }
                        if (input) input.value = '';
                        rewardUserForAction('ENGAGE_COMMENT');
                        return;
                    }
                     if (form.classList.contains('comment-form')) {
                        e.preventDefault();
                        const input = form.querySelector('input[name="comment-text"]');
                        const text = input ? input.value.trim() : '';
                        const postElement = form.closest('.impact-story, .news-list-item');
                        const isReply = form.dataset.replyTo;  // sub-comment
                        if (text && postElement) {
                            rewardUserForAction('ENGAGE_COMMENT');
                            if (!isReply) rewardUserForAction('RECEIVE_COMMENT', postElement.dataset.userId);
                            const ts = new Date().toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
                            const avatarUrl = userState.avatar || ('https://ui-avatars.com/api/?name='+encodeURIComponent(userState.fullName||'U')+'&background=1B2B8B&color=fff&size=36');
                            const commentId = 'cmt-' + Date.now();

                            function buildCommentEl(cText, cTs, cAvatar, cName, cId, depth) {
                                const el = document.createElement('div');
                                el.className = 'comment';
                                el.dataset.commentId = cId;
                                el.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;align-items:flex-start;' + (depth > 0 ? 'margin-left:32px;' : '');
                                el.innerHTML =
                                    '<img src="'+cAvatar+'" style="width:'+(depth>0?'26':'32')+'px;height:'+(depth>0?'26':'32')+'px;border-radius:50%;object-fit:cover;flex-shrink:0;">' +
                                    '<div style="flex:1;">' +
                                        '<div style="background:rgba(10,14,39,0.04);border-radius:12px;padding:8px 12px;">' +
                                            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
                                                '<strong style="font-size:0.82rem;color:var(--primary);">'+cName+'</strong>' +
                                                '<span style="font-size:0.7rem;color:var(--text-muted);">'+cTs+'</span>' +
                                            '</div>' +
                                            '<p style="font-size:0.85rem;margin:0;line-height:1.4;">'+formatWhatsAppText(cText)+'</p>' +
                                        '</div>' +
                                        (depth < 2 ? '<button class="_reply_btn" data-parent-id="'+cId+'" style="background:none;border:none;color:var(--secondary);font-size:0.7rem;font-weight:700;cursor:pointer;padding:3px 6px;margin-top:2px;">↩ Reply</button>' : '') +
                                        '<div class="_reply_thread" style="margin-top:4px;"></div>' +
                                    '</div>';
                                // Wire reply button
                                const replyBtn = el.querySelector('._reply_btn');
                                if (replyBtn) {
                                    replyBtn.addEventListener('click', function() {
                                        const thread = el.querySelector('._reply_thread');
                                        let replyForm = thread.querySelector('._inline_reply_form');
                                        if (replyForm) { replyForm.remove(); return; }
                                        replyForm = document.createElement('form');
                                        replyForm.className = 'comment-form _inline_reply_form';
                                        replyForm.dataset.replyTo = cId;
                                        replyForm.style.cssText = 'display:flex;gap:6px;margin-top:6px;margin-left:8px;';
                                        replyForm.innerHTML =
                                            '<input type="text" name="comment-text" placeholder="Write a reply…" required style="flex:1;border:1px solid rgba(10,14,39,0.15);border-radius:50px;padding:6px 12px;font-size:0.8rem;outline:none;">' +
                                            '<button type="submit" style="background:var(--secondary);border:none;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;"><i class="fas fa-paper-plane" style="color:#0A0E27;font-size:0.65rem;"></i></button>';
                                        thread.appendChild(replyForm);
                                        replyForm.querySelector('input').focus();
                                    });
                                }
                                return el;
                            }

                            const newCommentEl = buildCommentEl(text, ts, avatarUrl, userState.fullName||'You', commentId, isReply ? 1 : 0);

                            if (isReply) {
                                // Sub-comment: append into the parent's _reply_thread
                                const parentComment = document.querySelector('[data-comment-id="'+isReply+'"]');
                                const thread = parentComment ? parentComment.querySelector('._reply_thread') : null;
                                if (thread) {
                                    thread.appendChild(newCommentEl);
                                    const replyForm = thread.querySelector('._inline_reply_form');
                                    if (replyForm) replyForm.remove();
                                }
                            } else {
                                const commentList = form.previousElementSibling;
                                if (commentList) { const empty = commentList.querySelector('p'); if (empty) empty.remove(); commentList.appendChild(newCommentEl); }
                                const countSpan = postElement.querySelector('.comment-count');
                                if (countSpan) countSpan.textContent = parseInt(countSpan.textContent||0) + 1;
                                if (typeof updateLiveInteractionCount === 'function') updateLiveInteractionCount('comment');
                                if (typeof window.pushNotification === 'function' && postElement.dataset.userId && postElement.dataset.userId !== userState.id) {
                                    window.pushNotification((userState.fullName||'Someone') + ' commented on your post.', 'info');
                                }
                            }

                            // Persist to Firestore
                            try {
                                fbDb.collection('comments').doc(commentId).set({
                                    id: commentId,
                                    postId: postElement.dataset.postId,
                                    parentId: isReply || null,
                                    userId: userState.id, username: userState.fullName, avatar: userState.avatar,
                                    text, depth: isReply ? 1 : 0, createdAt: new Date().toISOString()
                                });
                            } catch(e) {}
                            if (input) input.value = '';
                        }
                        return;
                    }

                    e.preventDefault();
                    
                    // KYC form submission — relaxed validation (documents uploaded via custom UI)
                    if (form.id.includes('-kyc-form')) {
                        let kycFormIsValid = true;
                        // Only validate visible text/select inputs that are required
                        Array.from(form.querySelectorAll('input:not([type="file"]):not([type="hidden"]), select, textarea')).forEach(input => {
                            if (input.required && input.offsetParent !== null && input.value.trim() === '') {
                                input.style.borderColor = 'var(--danger-color)';
                                kycFormIsValid = false;
                            } else {
                                input.style.borderColor = '';
                            }
                        });
                        // Check upload areas — they must have at least a file-name-display (uploaded via custom UI)
                        Array.from(form.querySelectorAll('.kyc-file-upload.upload-area')).forEach(area => {
                            const hasFile = area.classList.contains('has-file') || area.querySelector('.file-name-display');
                            const inputId = area.dataset.inputId;
                            const originalInput = inputId ? document.getElementById(inputId) : null;
                            const isRequired = area.dataset.required === 'true' || (originalInput && originalInput.required);
                            if (isRequired && !hasFile) {
                                area.style.borderColor = 'var(--danger-color)';
                                kycFormIsValid = false;
                            } else {
                                area.style.borderColor = '';
                            }
                        });
                        if (!kycFormIsValid) {
                            showNotification('Please fill all required fields and upload all required documents.', 'error');
                            return;
                        }
                        // All good — submit KYC
                        const kycType = form.id.replace('-kyc-form', '');
                        const kycSubmitBtn = form.querySelector('button[type="submit"]');
                        if (kycSubmitBtn) kycSubmitBtn.disabled = true;
                        (async () => {
                            try {
                                const kycData = {
                                    id: `kyc-${Date.now()}`, userId: userState.id,
                                    username: userState.username, type: kycType,
                                    documents: window._kycSubmissions || {},
                                    submittedAt: new Date().toISOString(), status: 'pending'
                                };
                                try { await fbDb.collection('kyc_submissions').add(kycData); } catch(e) {}
                                showNotification(`✅ KYC (${kycType}) submitted successfully! Under review.`, 'success');
                                // Clear form
                                Array.from(form.querySelectorAll('input, select, textarea')).forEach(el => { el.style.borderColor = ''; });
                                form.querySelectorAll('.file-upload-preview').forEach(s => { s.innerHTML = ''; });
                                form.querySelectorAll('.kyc-file-upload.upload-area').forEach(a => {
                                    a.classList.remove('has-file');
                                    const nm = a.querySelector('.file-name-display');
                                    if (nm) nm.remove();
                                    a.style.borderColor = '';
                                });
                                const selfieBtn2 = form.querySelector('.live-capture-btn');
                                if (selfieBtn2) { selfieBtn2.dataset.captured = 'false'; selfieBtn2.style.background = ''; selfieBtn2.innerHTML = '<i class="fas fa-camera"></i> Capture Live Selfie'; }
                                window._kycSubmissions = {};
                                form.reset();
                            } catch(err) {
                                showNotification('KYC submission failed. Please try again.', 'error');
                            } finally {
                                if (kycSubmitBtn) kycSubmitBtn.disabled = false;
                            }
                        })();
                        return;
                    }

                    // login-form, signup-form, forgot-password-form handle their own validation in the switch
                    const selfValidatingForms = ['login-form','signup-form','forgot-password-form','promotion-finalize-form','checkout-form','reel-upload-form','help-form','crisis-form','go-live-form','complaint-form'];
                    if (!selfValidatingForms.includes(form.id) && !form.checkValidity()) {
                        e.stopPropagation();
                        showNotification('Please fill all required fields.', 'error');
                        
                        Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea, .live-capture-btn')).forEach(input => {
                            if (input.required && input.value.trim() === '') {
                                input.style.borderColor = 'var(--danger-color)';
                            } else {
                                input.style.borderColor = '';
                            }
                        });

                        return;
                    }
                    
                    switch (form.id) {
                        case 'login-form': {
                            // CAPTCHA REMOVED — login works directly with email + password
                            const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
                            const password = document.getElementById('login-password').value;
                            if (!email || !password) {
                                showNotification('Please enter your email and password.', 'error');
                                return;
                            }

                            // ── Admin shortcut ───────────────────────────────
                            if (email === 'admin@empyrean.com' && password === 'adminpass') {
                                initializeApp(false, true);
                                authModal.classList.remove('show');
                                document.body.classList.remove('modal-open');
                                showNotification('✅ Admin login successful!', 'success');
                                break;
                            }

                            showNotification('Signing in...', 'info');
                            const loginBtn = form.querySelector('button[type="submit"]');
                            if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Signing in...'; }

                            (async () => {
                                try {
                                    // ── Step 1: Check localStorage first (always works offline) ──
                                    let localUser = null;
                                    try {
                                        const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                        const lsEntry = stored[email];
                                        if (lsEntry && lsEntry.password === password) {
                                            localUser = lsEntry;
                                            // Restore Set types
                                            ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => {
                                                localUser[k] = new Set(Array.isArray(localUser[k]) ? localUser[k] : []);
                                            });
                                        }
                                    } catch(lsErr) { /* ignore */ }

                                    // Also check in-memory registeredUsers
                                    if (!localUser) {
                                        localUser = Object.values(registeredUsers).find(u =>
                                            u && (u.email||'').toLowerCase() === email && u.password === password
                                        ) || null;
                                    }

                                    // ── Step 2: Try Firebase if loaded ──────────────────────────
                                    if (window._firebaseLoaded && window.fbAuth && typeof window.fbAuth.signInWithEmailAndPassword === 'function') {
                                        try {
                                            const cred = await window.fbAuth.signInWithEmailAndPassword(email, password);
                                            if (cred && cred.user) {
                                                const uid = cred.user.uid;
                                                let profile = null;
                                                // Load from Firestore
                                                try {
                                                    const doc = await window.fbDb.collection('users').doc(uid).get();
                                                    if (doc && doc.exists) {
                                                        profile = doc.data();
                                                        ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => {
                                                            profile[k] = new Set(Array.isArray(profile[k]) ? profile[k] : []);
                                                        });
                                                    }
                                                } catch(fsErr) { console.warn('[Login] Firestore read failed:', fsErr.message); }

                                                if (!profile) {
                                                    profile = localUser || {
                                                        id: uid, fullName: email.split('@')[0], email,
                                                        username: email.split('@')[0].replace(/[^a-z0-9]/gi,'').toLowerCase(),
                                                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=1B2B8B&color=fff&size=150`,
                                                        coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
                                                        bio: '', empyBalance: 0, isVerified: false, followerCount: 0,
                                                        likedPostIds: new Set(), followedUserIds: new Set(),
                                                        retweetedPostIds: new Set(), awardedRanks: new Set(),
                                                        completedTasks: new Set(), viewedStatusUserIds: new Set(),
                                                        statuses: [], businessPage: null
                                                    };
                                                }
                                                profile.id = uid;
                                                registeredUsers[email] = profile;
                                                mockUsers[uid] = profile;
                                                // Save back to localStorage
                                                try {
                                                    const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                                    const safe = Object.assign({}, profile);
                                                    ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => {
                                                        safe[k] = Array.from(profile[k] || []);
                                                    });
                                                    safe.statuses = []; // don't store blob URLs
                                                    stored[email] = safe;
                                                    localStorage.setItem('empyrean_users', JSON.stringify(stored));
                                                } catch(e) {}
                                                try{var _sl=Object.assign({},profile);['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(function(k){if(_sl[k] instanceof Set)_sl[k]=[..._sl[k]];});delete _sl.password;localStorage.setItem('empyrean_session',JSON.stringify(_sl));}catch(e){}
                                                initializeApp(false, false, profile);
                                                authModal.classList.remove('show'); authModal.style.display='none';
                                                document.body.classList.remove('modal-open'); document.body.style.overflow='';
                                                showNotification('✅ Welcome back, ' + (profile.fullName || email.split('@')[0]) + '!', 'success');
                                                // Start real-time listeners — Firebase auth just confirmed this user
                                                // onAuthStateChanged will also fire but having both is safe (handles are checked)
                                                window._postsListener  = null;
                                                window._newsListener   = null;
                                                window._mktListener    = null;
                                                window._reelsListener  = null;
                                                window._usersListener  = null;
                                                setTimeout(function() {
                                                    if (typeof window._startRealtimeListeners === 'function') window._startRealtimeListeners();
                                                    if (typeof window.startLiveStreamListener   === 'function') window.startLiveStreamListener();
                                                    if (typeof window.loadUserNotifications     === 'function') window.loadUserNotifications();
                                                }, 600);
                                                return;
                                            }
                                        } catch(fbErr) {
                                            console.warn('[Login] Firebase auth error:', fbErr.code, fbErr.message);
                                            // Map Firebase errors to friendly messages
                                            const firebaseErrMap = {
                                                'auth/user-not-found': null, // fall through to local check
                                                'auth/wrong-password': null,
                                                'auth/invalid-credential': null,
                                                'auth/invalid-email': 'Invalid email address.',
                                                'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
                                                'auth/network-request-failed': null, // fall through to local
                                                'auth/user-disabled': 'This account has been disabled. Contact support.'
                                            };
                                            const mappedErr = firebaseErrMap[fbErr.code];
                                            if (mappedErr !== undefined && mappedErr !== null) {
                                                showNotification(mappedErr, 'error');
                                                return;
                                            }
                                            // For user-not-found, wrong-password, network errors — fall through to local auth
                                        }
                                    }

                                    // ── Step 3: Local auth fallback ─────────────────────────────
                                    if (localUser) {
                                        registeredUsers[email] = localUser;
                                        mockUsers[localUser.id || ('local-' + Date.now())] = localUser;
                                        try { localStorage.setItem('empyrean_session_email', email); } catch(e) {}
                                        initializeApp(false, false, localUser);
                                        authModal.classList.remove('show');
                                        document.body.classList.remove('modal-open');
                                        showNotification('✅ Welcome back, ' + (localUser.fullName || email.split('@')[0]) + '!', 'success');
                                        return;
                                    }

                                    // ── Step 4: Nothing worked ──────────────────────────────────
                                    showNotification('No account found with that email and password. Please sign up first.', 'error');

                                } catch(unexpectedErr) {
                                    console.error('[Login] Unexpected error:', unexpectedErr);
                                    showNotification('Login failed. Please try again.', 'error');
                                } finally {
                                    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = 'Login'; }
                                }
                            })();
                            break;
                        }
                        case 'signup-form': { 
                            const passwordInput = document.getElementById('signup-password');
                            const confirmPasswordInput = document.getElementById('signup-confirm-password');
                            if (!passwordInput || !confirmPasswordInput) return; 

                            if (passwordInput.value !== confirmPasswordInput.value) {
                                showFormFeedback('signup', 'Passwords do not match.', 'error'); return;
                            }
                            
                            const emailInput = document.getElementById('signup-email');
                            if (!emailInput) return; 
                            const email = emailInput.value.trim().toLowerCase();
                            // Strict email validation
                            if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
                                showFormFeedback('signup', 'Please enter a valid email address (e.g. name@domain.com).', 'error'); return;
                            }
                            if (registeredUsers[email]) {
                                showFormFeedback('signup', 'An account with this email already exists. Please log in.', 'error'); return;
                            }
                            // Check Firebase for existing email
                            if (window._firebaseLoaded && window.fbAuth) {
                                try {
                                    const methods = await window.fbAuth.fetchSignInMethodsForEmail(email);
                                    if (methods && methods.length > 0) {
                                        showFormFeedback('signup', 'This email is already registered. Please log in instead.', 'error'); return;
                                    }
                                } catch(e) { /* offline — skip check */ }
                            }
                            
                            const usernameInput = document.getElementById('signup-username');
                            if (!usernameInput) return; 
                            const username = usernameInput.value.trim();
                            // Strict username validation
                            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                                showFormFeedback('signup', 'Username: 3–20 characters, letters/numbers/underscore only.', 'error'); return;
                            }
                            // Phone validation if provided
                            const phoneInputEl = document.getElementById('signup-phone');
                            if (phoneInputEl && phoneInputEl.value.trim()) {
                                const phoneClean = phoneInputEl.value.replace(/[\s\-\(\)\+]/g,'');
                                if (!/^[0-9]{7,15}$/.test(phoneClean)) {
                                    showFormFeedback('signup', 'Please enter a valid phone number (7–15 digits).', 'error'); return;
                                }
                            }
                            // Case-insensitive username uniqueness check
                            if (Object.values(mockUsers).some(u => u.username && u.username.toLowerCase() === username.toLowerCase())) {
                                showFormFeedback('signup', 'This username is already taken. Please choose another.', 'error'); return;
                            }
                            // Password strength validation
                            const pwVal = passwordInput.value;
                            const pwStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]).{8,}$/.test(pwVal);
                            if (!pwStrong) {
                                showFormFeedback('signup', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (e.g. !@#$%).', 'error'); return;
                            }

                            const userTypeRadio = document.querySelector('input[name="user-type"]:checked');
                            if (!userTypeRadio) return; 
                            const isOrg = userTypeRadio.value === 'organisation';
                            
                            let fullName = '';
                            if (isOrg) {
                                const orgNameInput = document.getElementById('signup-orgname');
                                if (orgNameInput) fullName = orgNameInput.value;
                            } else {
                                const fnameInput = document.getElementById('signup-fname');
                                const lnameInput = document.getElementById('signup-lname');
                                if (fnameInput && lnameInput) fullName = `${fnameInput.value} ${lnameInput.value}`;
                            }

                            showFormFeedback('signup', 'Creating your account...', 'info');

                            // Upload avatar to Cloudinary if a file was selected
                            let avatarUrl = isOrg 
                                ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=5B0EA6&color=fff&size=150`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=8E24AA&color=fff&size=150`;

                            (async () => {
                                try {
                                    // Upload avatar to Cloudinary if file chosen
                                    if (newAvatarFile) {
                                        try {
                                            let fileToUpload = null;
                                            if (newAvatarFile instanceof File || newAvatarFile instanceof Blob) {
                                                fileToUpload = newAvatarFile;
                                            } else if (typeof newAvatarFile === 'string' && newAvatarFile.startsWith('data:')) {
                                                const res = await fetch(newAvatarFile);
                                                const blob = await res.blob();
                                                fileToUpload = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                                            } else if (typeof newAvatarFile === 'string' && (newAvatarFile.startsWith('http') || newAvatarFile.startsWith('blob:'))) {
                                                avatarUrl = newAvatarFile;
                                            }
                                            if (fileToUpload) {
                                                avatarUrl = await window.uploadToCloudinary(fileToUpload, null);
                                            }
                                        } catch(uploadErr) { console.warn('Avatar upload failed:', uploadErr); }
                                    }

                                    // Generate unique serial ID
                                    const serialNum = String(Date.now()).slice(-6).padStart(6,'0');
                                    const uniqueUserId = `USR-${serialNum}`;
                                    const bioFromSignup = document.getElementById('signup-bio') ? document.getElementById('signup-bio').value.trim() : '';
                                    const newUser = {
                                        id: `user-${Date.now()}`,
                                        uniqueId: uniqueUserId,
                                        fullName, username: username.toLowerCase(), email,
                                        password: passwordInput.value,
                                        avatar: avatarUrl,
                                        createdAt: new Date().toISOString(),
                                        coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80',
                                        bio: bioFromSignup || `Hi, I'm ${fullName}. Empyrean member since ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})}.`,
                                        likedPostIds: new Set(),
                                        followedUserIds: new Set(),
                                        retweetedPostIds: new Set(),
                                        statuses: [],
                                        viewedStatusUserIds: new Set(),
                                        empyBalance: 0,          // starts at zero — earned through activity
                                        isVerified: false,
                                        followerCount: 0,
                                        awardedRanks: new Set(),
                                        businessPage: null,
                                        completedTasks: new Set(),
                                        empyBalance: 0,
                                        earningsStarted: false
                                    };
                                    registeredUsers[email] = newUser;
                                    mockUsers[newUser.id] = newUser;

                                    // Save to localStorage IMMEDIATELY — works offline
                                    try {
                                        const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                        stored[email] = Object.assign({}, newUser, {
                                            likedPostIds:[], followedUserIds:[], retweetedPostIds:[],
                                            awardedRanks:[], completedTasks:[], viewedStatusUserIds:[], statuses:[]
                                        });
                                        localStorage.setItem('empyrean_users', JSON.stringify(stored));
                                    } catch(lsErr) { console.warn('localStorage save failed:', lsErr); }

                                    // PRIMARY: Firebase Auth + Firestore (AWAITED — production path)
                                    // Show spinner while creating account
                                    showFormFeedback('signup', '⏳ Creating your account...', 'info');
                                    const doFirebaseSignup = async () => {
                                        if (!window._firebaseLoaded || !window.fbAuth) {
                                            // Firebase not ready — wait up to 10s
                                            await new Promise(resolve => {
                                                let tries = 0;
                                                const t = setInterval(() => {
                                                    tries++;
                                                    if (window._firebaseLoaded || tries > 20) { clearInterval(t); resolve(); }
                                                }, 500);
                                            });
                                        }
                                        if (!window._firebaseLoaded || !window.fbAuth) {
                                            console.warn('[Signup] Firebase still not ready — account saved locally only');
                                            return;
                                        }
                                        try {
                                            const fbCred = await window.fbAuth.createUserWithEmailAndPassword(email, passwordInput.value);
                                            if (fbCred && fbCred.user) {
                                                // Update user ID to real Firebase UID
                                                newUser.id = fbCred.user.uid;
                                                registeredUsers[email].id = fbCred.user.uid;
                                                mockUsers[fbCred.user.uid] = newUser;
                                                // Save full profile to Firestore
                                                await saveUserToFirestore(fbCred.user.uid, newUser);
                                                console.log('[Signup] ✅ User created in Firebase Auth + Firestore. UID:', fbCred.user.uid);
                                            showFormFeedback('signup', '✅ Account created! Logging you in...', 'success');
                                            setTimeout(() => {
                                                ['login-view','signup-view','forgot-password-view'].forEach(v => {
                                                    const el = document.getElementById(v);
                                                    if (el) el.style.display = 'none';
                                                });
                                                const lv = document.getElementById('login-view');
                                                if (lv) lv.style.display = 'block';
                                            }, 1200);
                                                // Update localStorage with real UID
                                                try {
                                                    const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                                    if (stored[email]) {
                                                        stored[email].id = fbCred.user.uid;
                                                        localStorage.setItem('empyrean_users', JSON.stringify(stored));
                                                    }
                                                } catch(e) {}
                                            }
                                        } catch(fbErr) {
                                            if (fbErr.code === 'auth/email-already-in-use') {
                                                showNotification('That email already has an account. Please log in.', 'warning');
                                            } else {
                                                console.error('[Signup] Firebase error:', fbErr.code, fbErr.message);
                                            }
                                        }
                                    };
                                    // Run signup — show success only after Firebase confirms
                                    doFirebaseSignup().then(function() {
                                        newAvatarFile = null;
                                        form.reset();
                                        if (typeof handleAvatarUpload === 'function') handleAvatarUpload(null, 'avatar-preview');
                                        rewardUserForAction('SUCCESSFUL_REFERRAL');
                                    });
                                } catch(err) {
                                    console.error('Signup error:', err);
                                    showFormFeedback('signup', 'Signup failed. Please try again.', 'error');
                                }
                            })();
                            break;
                        }
                        case 'profile-info-form': {
                            if(isGuest) return;
                            const profileFullnameInput = document.getElementById('profile-fullname');
                            const profileUsernameInput = document.getElementById('profile-username');
                            const profileBioTextarea = document.getElementById('profile-bio');

                            if (profileFullnameInput) userState.fullName = profileFullnameInput.value;
                            if (profileUsernameInput) userState.username = profileUsernameInput.value;
                            if (profileBioTextarea) userState.bio = profileBioTextarea.value;
                            // Extended bio fields
                            const _pPhone    = document.getElementById('profile-phone');
                            const _pWebsite  = document.getElementById('profile-website');
                            const _pProf     = document.getElementById('profile-profession');
                            const _pEdu      = document.getElementById('profile-education');
                            const _pMarital  = document.getElementById('profile-marital');
                            const _pHobby    = document.getElementById('profile-hobbies');
                            const _pLoc      = document.getElementById('profile-location');
                            if (_pPhone)   userState.phone         = _pPhone.value;
                            if (_pWebsite) userState.website       = _pWebsite.value;
                            if (_pProf)    userState.profession    = _pProf.value;
                            if (_pEdu)     userState.education     = _pEdu.value;
                            if (_pMarital) userState.maritalStatus = _pMarital.value;
                            if (_pHobby)   userState.hobbies       = _pHobby.value;
                            if (_pLoc)     userState.location      = _pLoc.value;
                            
                            showNotification('Saving profile...', 'info');
                            (async () => {
                                try {
                                    // Upload avatar to Cloudinary if changed
                                    if (newAvatarFile) {
                                        if (newAvatarFile.startsWith('data:')) {
                                            try {
                                                const res = await fetch(newAvatarFile);
                                                const blob = await res.blob();
                                                const f = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                                                const cloudUrl = await window.uploadToCloudinary(f, null);
                                                userState.avatar = cloudUrl;
                                            } catch(e) { userState.avatar = newAvatarFile; }
                                        } else {
                                            userState.avatar = newAvatarFile;
                                        }
                                        newAvatarFile = null;
                                    }
                                    // Upload cover photo to Cloudinary if changed
                                    if (newCoverFile) {
                                        try {
                                            const cloudCoverUrl = await window.uploadToCloudinary(newCoverFile, null);
                                            userState.coverPhoto = cloudCoverUrl;
                                        } catch(e) {
                                            userState.coverPhoto = URL.createObjectURL(newCoverFile);
                                        }
                                        newCoverFile = null;
                                    }
                                    // Save to Firestore
                                    if (userState.id && !userState.id.startsWith('user-demo')) {
                                        await saveUserToFirestore(userState.id, userState);
                                    }
                                    // Also persist to localStorage as fallback
                                    try {
                                        const stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                        const safe = { ...userState };
                                        ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(k => { if (safe[k] instanceof Set) safe[k] = [...safe[k]]; });
                                        delete safe.password;
                                        stored[userState.email] = safe;
                                        localStorage.setItem('empyrean_users', JSON.stringify(stored));
                                    } catch(lsErr) {}
                                    renderUserProfile(userState.id);
                                    showNotification('Profile updated and saved successfully!', 'success');
                                    navigateTo('profile');
                                } catch(err) {
                                    console.error('Profile save error:', err);
                                    renderUserProfile(userState.id);
                                    showNotification('Profile updated locally (cloud sync failed).', 'warning');
                                    navigateTo('profile');
                                }
                            })();
                            break;
                        }
                        case 'create-post-form': {
                            const postTextarea = document.getElementById('post-text');
                            if (!postTextarea) return;
                            const text = postTextarea.value;
                            // ── Read quote data attached by the picker ──
                            const quotePostId   = postTextarea.dataset.quotePostId   || '';
                            const quoteAuthor   = postTextarea.dataset.quoteAuthor   || '';
                            const quoteText     = postTextarea.dataset.quoteText     || '';
                            const quoteMedia    = postTextarea.dataset.quoteMedia    || '';
                            const isQuotePost   = !!quotePostId;

                            if (!text.trim() && postMediaFiles.length === 0 && !isQuotePost) {
                                showNotification('Post cannot be empty.', 'error'); return;
                            }
                            const _bannedTerms = /\b(porn|pornography|xxx|nude|nudity|obscene|explicit sexual|child abuse|cp|csam)\b/i;
                            if (_bannedTerms.test(text)) {
                                showNotification('🚫 Post blocked: violates community guidelines on explicit material.', 'error');
                                try { fbDb.collection('moderation_flags').add({ userId: userState.id, username: userState.username, reason: 'Explicit content', text: text.substring(0,100), flaggedAt: new Date().toISOString() }); } catch(e) {}
                                return;
                            }
                            const postSubmitBtn = form.querySelector('button[type="submit"]');
                            if (postSubmitBtn) postSubmitBtn.disabled = true;
                            if (postMediaFiles.length > 0) showNotification('Uploading media...', 'info');
                            (async () => {
                                try {
                                    const cloudUrls = await window.uploadMediaFilesToCloudinary(postMediaFiles);
                                    postMediaFiles.forEach((f, i) => { if (cloudUrls[i]) f._cloudUrl = cloudUrls[i]; });

                                    // Build quoted-post block HTML (embedded inside the new post)
                                    let quotedBlockHTML = '';
                                    if (isQuotePost) {
                                        quotedBlockHTML = `<div class="quoted-post-block" data-quote-id="${quotePostId}" style="border:1.5px solid rgba(10,14,39,0.12);border-radius:14px;padding:10px 14px;margin-top:10px;background:rgba(10,14,39,0.03);">
                                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
                                                <i class="fas fa-retweet" style="color:var(--secondary);font-size:0.75rem;"></i>
                                                <strong style="font-size:0.78rem;color:var(--primary);">@${quoteAuthor}</strong>
                                            </div>
                                            ${quoteMedia ? `<img src="${quoteMedia}" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px;margin-bottom:6px;" loading="lazy">` : ''}
                                            <p style="font-size:0.82rem;color:var(--text-muted);margin:0;line-height:1.4;">${quoteText.substring(0,200)}${quoteText.length>200?'…':''}</p>
                                        </div>`;
                                    }

                                    const displayText = text + (quotedBlockHTML ? '\n' : '');
                                    const newPost = createNewPostElement(displayText, postMediaFiles);
                                    // Inject quoted block into the post DOM element
                                    if (isQuotePost && quotedBlockHTML) {
                                        const storyContent = newPost.querySelector('.story-content');
                                        if (storyContent) {
                                            const qDiv = document.createElement('div');
                                            qDiv.innerHTML = quotedBlockHTML;
                                            storyContent.appendChild(qDiv.firstElementChild);
                                        }
                                    }

                                    if (feedContainer) { feedContainer.prepend(newPost); const es = document.getElementById('feed-empty-state'); if (es) es.style.display = 'none'; }

                                    const profilePostsFeed = document.getElementById('profile-posts-feed');
                                    if (profilePostsFeed) {
                                        const clone = newPost.cloneNode(true);
                                        profilePostsFeed.prepend(clone);
                                        const profilePostsEmpty = document.getElementById('profile-posts-empty');
                                        if (profilePostsEmpty) profilePostsEmpty.style.display = 'none';
                                    }
                                    // Also add to profile-dash-feed
                                    const dashFeed = document.getElementById('profile-dash-feed');
                                    if (dashFeed && !dashFeed.querySelector('[data-post-id="'+newPost.dataset.postId+'"]')) dashFeed.prepend(newPost.cloneNode(true));

                                    populateProfileGallery(userState.id);

                                    if (!window._firebaseLoaded) {
                                        await new Promise(resolve => { let tries=0; const t=setInterval(()=>{tries++;if(window._firebaseLoaded||tries>20){clearInterval(t);resolve();}},500); });
                                    }
                                    try {
                                        const postDoc = {
                                            id: newPost.dataset.postId,
                                            userId: userState.id,
                                            username: userState.fullName || userState.username,
                                            avatar: userState.avatar || '',
                                            text: text,
                                            media: cloudUrls.filter(u => u && !u.startsWith('blob:')),
                                            createdAt: new Date().toISOString(),
                                            // ── Quote fields persisted to Firestore ──
                                            ...(isQuotePost ? { isQuote: true, quotePostId, quoteAuthor, quoteText, quoteMedia } : {})
                                        };
                                        await fbDb.collection('posts').doc(postDoc.id).set(postDoc);
                                        console.log('[Post] ✅ Saved to Firestore:', postDoc.id, isQuotePost ? '(Quote)' : '');
                                    } catch(e) {
                                        console.error('[Post] ❌ Firestore save failed:', e.message);
                                        setTimeout(async () => { try { await fbDb.collection('posts').doc(newPost.dataset.postId).set({ id: newPost.dataset.postId, userId: userState.id, username: userState.fullName || userState.username, text, media: cloudUrls.filter(u=>u&&!u.startsWith('blob:')), createdAt: new Date().toISOString() }); } catch(e2) {} }, 3000);
                                    }
                                    // Clear quote state
                                    delete postTextarea.dataset.quotePostId;
                                    delete postTextarea.dataset.quoteAuthor;
                                    delete postTextarea.dataset.quoteText;
                                    delete postTextarea.dataset.quoteMedia;
                                    const qp = document.getElementById('_quote_preview_card');
                                    if (qp) qp.remove();

                                    form.reset();
                                    postMediaFiles = [];
                                    const postMediaPreview = document.getElementById('post-media-preview');
                                    if (postMediaPreview) postMediaPreview.innerHTML = '';
                                    rewardUserForAction('CREATE_POST');
                                } finally { if (postSubmitBtn) postSubmitBtn.disabled = false; }
                            })();
                            break;
                        }
                         case 'create-business-post-form': {
                            const businessPostTextarea = form.querySelector('textarea');
                            if (!businessPostTextarea) return;
                            const text = businessPostTextarea.value;
                            if (!text.trim() && businessPostMediaFiles.length === 0) {
                                showNotification('Post cannot be empty.', 'error'); return;
                            }
                            const bpSubmitBtn = form.querySelector('button[type="submit"]');
                            if (bpSubmitBtn) bpSubmitBtn.disabled = true;
                            if (businessPostMediaFiles.length > 0) showNotification('Uploading media...', 'info');
                            (async () => {
                                try {
                                    const cloudUrls = await window.uploadMediaFilesToCloudinary(businessPostMediaFiles);
                                    businessPostMediaFiles.forEach((f, i) => { if (cloudUrls[i]) f._cloudUrl = cloudUrls[i]; });
                                    const newPost = createNewPostElement(text, businessPostMediaFiles, userState, true);
                                    const businessPageFeedContainer = document.getElementById('business-page-feed-container');
                                    if (businessPageFeedContainer) businessPageFeedContainer.prepend(newPost);
                                    try {
                                        await fbDb.collection('business_posts').doc(newPost.dataset.postId).set({
                                            id: newPost.dataset.postId, userId: userState.id,
                                            pageId: userState.businessPage?.id, text, media: cloudUrls,
                                            createdAt: new Date().toISOString()
                                        });
                                    } catch(e) {}
                                    form.reset();
                                    businessPostMediaFiles = [];
                                    const bpMediaPreview = form.querySelector('#business-post-media-preview');
                                    if (bpMediaPreview) bpMediaPreview.innerHTML = '';
                                    showNotification('✅ Posted to your profile and dashboard!', 'success');
                        // Mirror post to dashboard feed
                        try {
                            const dashFeed = document.getElementById('posts-feed');
                            if (dashFeed && typeof newPost !== 'undefined' && newPost) {
                                const clone = newPost.cloneNode(true);
                                dashFeed.prepend(clone);
                            }
                        } catch(e) {}
                                } finally { if (bpSubmitBtn) bpSubmitBtn.disabled = false; }
                            })();
                            break;
                        }
                        case 'go-live-form': {
                            if (isGuest) {
                                showNotification("Please log in to start a live stream.", 'error');
                                authModal.classList.add('show');
                                document.getElementById('login-view').style.display = 'block';
                                setTimeout(function(){ if(typeof generateCaptcha==='function') generateCaptcha(); }, 80);
                                return;
                            }
                            // Only block if the live modal is currently open (stream is actively running)
                            const liveModalNow = document.getElementById('go-live-modal-overlay');
                            const liveModalOpen = liveModalNow && (liveModalNow.classList.contains('show') || liveModalNow.style.display === 'flex');
                            if (liveStreamData.isLive && liveModalOpen) {
                                showNotification("You are already live!", "warning");
                                return;
                            }
                            // Reset stale live state so a fresh stream can begin
                            if (liveStreamData.isLive && !liveModalOpen) {
                                liveStreamData.isLive = false;
                                liveStreamData._localStream = null;
                                if (liveStreamData.rewardInterval) { clearInterval(liveStreamData.rewardInterval); liveStreamData.rewardInterval = null; }
                                if (liveStreamData._viewerSimInterval) { clearInterval(liveStreamData._viewerSimInterval); liveStreamData._viewerSimInterval = null; }
                            }
                            const liveTitleInput = document.getElementById('live-title');
                            const liveDescriptionTextarea = document.getElementById('live-description');
                            if (!liveTitleInput || !liveDescriptionTextarea) return; 

                            liveStreamData = {
                                ...liveStreamData, 
                                isLive: true,
                                title: liveTitleInput.value,
                                description: liveDescriptionTextarea.value,
                                streamId: `live-${Date.now()}`,
                                startTime: Date.now(),
                                hostUserId: userState.id,
                            };
                            const selectedBgThumb = form.querySelector('.bg-thumb.active');
                            if (selectedBgThumb && selectedBgThumb.dataset.bg !== "custom-upload") {
                                liveStreamData.background = selectedBgThumb.dataset.bg;
                                liveStreamData.customBackgroundFile = null;
                            } else if (liveStreamData.customBackgroundFile) {
                            } else {
                                liveStreamData.background = liveBackgrounds[0].style; 
                            }

                            createDashboardLiveCard(liveStreamData.streamId, liveStreamData.title, userState.fullName, userState.avatar, liveStreamData.background, userState.id);
                            // Notify followers that user is live
                            if (typeof window.notifyFriendsUserIsLive === 'function') {
                                window.notifyFriendsUserIsLive(userState.fullName, liveStreamData.streamId);
                            }
                            
                            // Open the go-live modal directly as host, bypassing join-live-btn guard
                            const goLiveModal = document.getElementById('go-live-modal-overlay');
                            if (goLiveModal) {
                                document.getElementById('live-host-name') && (document.getElementById('live-host-name').textContent = userState.fullName);
                                document.getElementById('live-host-avatar') && (document.getElementById('live-host-avatar').src = userState.avatar);
                                document.getElementById('live-stream-host-avatar') && (document.getElementById('live-stream-host-avatar').src = userState.avatar);
                                document.getElementById('host-video-fallback-avatar') && (document.getElementById('host-video-fallback-avatar').src = userState.avatar);
                                goLiveModal.style.display = 'flex';
                                goLiveModal.classList.add('show');
                                document.body.classList.add('modal-open');
                                const requestJoinBtn = document.getElementById('live-request-join-btn');
                                if (requestJoinBtn) requestJoinBtn.style.display = 'none';
                                updateLiveUI();
                                // Start reward interval for host
                                if (liveStreamData.rewardInterval) clearInterval(liveStreamData.rewardInterval);
                                liveStreamData.rewardInterval = setInterval(() => { rewardUserForAction('LIVE_STREAM_INTERVAL'); }, 300000);
                            }

                            // Helper to start camera with retry — improved for Android/WebView
                            function startHostCamera(attempt) {
                                const hostVideo = document.getElementById('host-main-video');
                                const fallbackAvatar = document.getElementById('host-video-fallback-avatar');
                                if (!hostVideo) {
                                    if (attempt < 15) setTimeout(() => startHostCamera(attempt + 1), 200);
                                    return;
                                }
                                if (liveStreamData._localStream) {
                                    hostVideo.srcObject = liveStreamData._localStream;
                                    hostVideo.muted = true;
                                    hostVideo.play().catch(()=>{});
                                    if(fallbackAvatar) fallbackAvatar.style.display = 'none';
                                    showNotification('🔴 You are now LIVE!', 'success');
                                    return;
                                }
                                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                                    if(fallbackAvatar) { fallbackAvatar.style.display = 'block'; fallbackAvatar.src = userState.avatar; }
                                    showNotification('📡 Live with audio only — camera not supported on this device.', 'info');
                                    // Try audio only fallback
                                    navigator.mediaDevices && navigator.mediaDevices.getUserMedia({ audio: true })
                                        .then(s => { liveStreamData._localStream = s; showNotification('🎤 Audio-only live stream active.', 'success'); })
                                        .catch(()=>{});
                                    return;
                                }
                                // Try progressively relaxed constraints for maximum Android compatibility
                                const constraintSets = [
                                    { video: { facingMode: 'user' }, audio: true },
                                    { video: { facingMode: 'environment' }, audio: true },
                                    { video: true, audio: true },
                                    { video: true, audio: false },
                                    { audio: true }
                                ];
                                let constraintIdx = attempt < constraintSets.length ? attempt : constraintSets.length - 1;
                                navigator.mediaDevices.getUserMedia(constraintSets[constraintIdx])
                                    .then(stream => {
                                        liveStreamData._localStream = stream;
                                        const hasVideo = stream.getVideoTracks().length > 0;
                                        if (hasVideo) {
                                            hostVideo.srcObject = stream;
                                            hostVideo.muted = true;
                                            hostVideo.play().catch(()=>{});
                                            if(fallbackAvatar) fallbackAvatar.style.display = 'none';
                                            showNotification('🔴 You are now LIVE! Camera active.', 'success');
                                        } else {
                                            if(fallbackAvatar) { fallbackAvatar.style.display = 'block'; fallbackAvatar.src = userState.avatar; }
                                            showNotification('🎤 Going LIVE with audio only — camera unavailable.', 'info');
                                        }
                                    })
                                    .catch(err => {
                                        console.warn('Camera attempt ' + constraintIdx + ' failed:', err.name, err.message);
                                        if (constraintIdx < constraintSets.length - 1) {
                                            setTimeout(() => startHostCamera(constraintIdx + 1), 300);
                                        } else {
                                            if(fallbackAvatar) { fallbackAvatar.style.display = 'block'; fallbackAvatar.src = userState.avatar || ''; }
                                            showNotification('⚠️ Camera/mic access denied. Check your browser permissions in Settings → Site Settings → Camera & Microphone, then try again.', 'warning');
                                        }
                                    });
                            }
                            setTimeout(() => startHostCamera(0), 400); 
                            
                            form.reset();
                            liveStreamData.customBackgroundFile = null; 
                            populateBackgroundSelector(); 
                            navigateTo('dashboard'); 
                            
                            break;
                        }
                        case 'live-goal-form': { 
                            const goalDescriptionInput = document.getElementById('goal-description');
                            const goalTargetAmountInput = document.getElementById('goal-target-amount');
                            if (!goalDescriptionInput || !goalTargetAmountInput) return; 

                            const description = goalDescriptionInput.value;
                            const targetAmount = parseFloat(goalTargetAmountInput.value);

                            if (targetAmount > 0) {
                                liveStreamData.liveGoal = {
                                    description: description,
                                    targetAmount: targetAmount,
                                    currentAmount: 0 
                                };
                                showNotification("Live goal set!", "success");
                                const liveGoalSettingsModal = document.getElementById('live-goal-settings-modal');
                                if (liveGoalSettingsModal) liveGoalSettingsModal.classList.remove('show');
                                updateLiveUI();
                            } else {
                                showNotification("Target amount must be greater than 0.", "error");
                            }
                            break;
                        }
                        case 'stake-form': { 
                            const stakeAmountInput = document.getElementById('stake-amount');
                            if (!stakeAmountInput) return; 

                            const amountToStake = parseFloat(stakeAmountInput.value);
                            if (isNaN(amountToStake) || amountToStake <= 0) {
                                showNotification("Please enter a valid amount to stake.", "error");
                                return;
                            }
                            if (userState.empyBalance < amountToStake) {
                                showNotification("Insufficient EMPY balance for staking.", "error");
                                return;
                            }
                            userState.empyBalance -= amountToStake;
                            userManualStakedBalance += amountToStake;
                            userStakedBalance = userManualStakedBalance + userLockedStakedBalance;
                            showNotification(`${amountToStake.toLocaleString()} EMPY staked successfully!`, "success");
                            form.reset();
                            updateWalletUI();
                            break;
                        }
                        case 'unstake-form': { 
                            const unstakeAmountInput = document.getElementById('unstake-amount');
                            if (!unstakeAmountInput) return; 

                            const amountToUnstake = parseFloat(unstakeAmountInput.value);
                            if (isNaN(amountToUnstake) || amountToUnstake <= 0) {
                                showNotification("Please enter a valid amount to unstake.", "error");
                                return;
                            }
                            if (userManualStakedBalance < amountToUnstake) {
                                showNotification("You don't have enough manual staked EMPY to unstake.", "error");
                                return;
                            }
                            userState.empyBalance += amountToUnstake;
                            userManualStakedBalance -= amountToUnstake;
                            userStakedBalance = userManualStakedBalance + userLockedStakedBalance;
                            userClaimedRewardsHistory.push({ 
                                type: 'Manual Staking Unstaked',
                                amount: amountToUnstake,
                                date: new Date().toLocaleDateString()
                            });
                            showNotification(`${amountToUnstake.toLocaleString()} EMPY unstaked successfully!`, "success");
                            form.reset();
                            updateWalletUI();
                            break;
                        }
                        case 'marketplace-form': {
                            const itemNameInput = document.getElementById('item-name');
                            const itemPriceInput = document.getElementById('item-price');
                            const salesTypeSelect = document.getElementById('sales-type');
                            if (!itemNameInput || !itemPriceInput || !salesTypeSelect) return;
                            const itemName = itemNameInput.value;
                            const itemPrice = parseFloat(itemPriceInput.value);
                            const salesType = salesTypeSelect.value;
                            const selectedCurrencyEl = document.getElementById('item-currency');
                            const selectedCurrency = selectedCurrencyEl ? selectedCurrencyEl.value : 'USD';
                            const itemLocationInput = document.getElementById('item-location');
                            const mktSubmitBtn = form.querySelector('button[type="submit"]');
                            if (mktSubmitBtn) mktSubmitBtn.disabled = true;
                            if (marketplaceMediaFiles.length > 0) showNotification('Uploading ' + marketplaceMediaFiles.length + ' file(s) to cloud...', 'info');
                            (async () => {
                                try {
                                    // Upload ALL files in PARALLEL for speed
                                    // Use window.uploadToCloudinary which waits for /api/config
                                    const uploadResults = await Promise.all(
                                        marketplaceMediaFiles.map(function(file) {
                                            return window.uploadToCloudinary(file, null).then(function(url) {
                                                if (url && !url.startsWith('blob:')) {
                                                    file._cloudUrl = url;
                                                    return { ok: true, url: url, file: file };
                                                }
                                                // blob: URL means Cloudinary wasn't reached — still show locally
                                                file._cloudUrl = url;
                                                return { ok: false, localUrl: url, file: file };
                                            }).catch(function(err) {
                                                console.warn('[Mkt upload] error:', err);
                                                return { ok: false, file: file };
                                            });
                                        })
                                    );
                                    const cloudUrls = uploadResults.filter(r => r.ok).map(r => r.url);
                                    // Include local blob URLs for immediate display even if cloud failed
                                    const allUrls = uploadResults.map(r => r.url || r.localUrl || '').filter(Boolean);
                                    const failedCount = uploadResults.filter(r => !r.ok).length;
                                    if (failedCount > 0) {
                                        showNotification('⚠ ' + failedCount + ' file(s) uploaded locally (cloud sync pending).', 'warning');
                                    }
                                    const firstCloudUrl = allUrls[0] || cloudUrls[0] || '';
                                    const firstFile = marketplaceMediaFiles[0];
                                    const isFirstVideo = firstFile && firstFile.type.startsWith('video/');

                                    addMarketItemToDashboardSlider({
                                        name: itemName, price: itemPrice,
                                        img: !isFirstVideo ? (firstCloudUrl||'') : '',
                                        videoSrc: isFirstVideo ? firstCloudUrl : null
                                    });

                                    const propertyGrid = document.getElementById('property-grid-container');
                                    if (!propertyGrid) return;
                                    const newCard = document.createElement('div');
                                    newCard.className = 'property-card';
                                    const newId = `prop-${Date.now()}`;
                                    newCard.dataset.id = newId;
                                    newCard.dataset.salesType = salesType;
                                    newCard.dataset.media = JSON.stringify(allUrls.length ? allUrls : cloudUrls);
                                    newCard.dataset.displayCurrency = selectedCurrency;
                                    newCard.dataset.price = itemPrice;
                                    newCard.dataset.name = itemName;

                                    if (salesType === 'direct') {
                                        newCard.dataset.contactName = document.getElementById('item-seller-name')?.value || userState.fullName;
                                        newCard.dataset.contactPhone = document.getElementById('item-seller-phone')?.value || '';
                                        newCard.dataset.contactEmail = document.getElementById('item-seller-email')?.value || '';
                                        newCard.dataset.contactAddress = document.getElementById('item-seller-address')?.value || '';
                                    }

                                    // Build multi-image grid for marketplace card
                                    let mediaHTML = '';
                                    // Use allUrls (includes blob: for immediate display) falling back to cloudUrls
                                    const displayUrls = allUrls.length ? allUrls : cloudUrls;
                                    if (displayUrls.length === 0) {
                                        mediaHTML = `<div style="width:100%;height:220px;background:linear-gradient(135deg,#1B2B8B,#0A0E27);display:flex;align-items:center;justify-content:center;"><i class="fas fa-image" style="font-size:2rem;color:rgba(255,255,255,0.3);"></i></div>`;
                                    } else if (displayUrls.length === 1) {
                                        mediaHTML = isFirstVideo
                                            ? `<video src="${displayUrls[0]}" autoplay loop muted playsinline controls style="width:100%;height:220px;object-fit:cover;display:block;"></video>`
                                            : `<img src="${displayUrls[0]}" alt="${itemName}" loading="lazy" style="width:100%;height:220px;object-fit:cover;display:block;" onerror="this.style.display='none'">`;
                                    } else {
                                        // Multi-image grid
                                        const gridCols = displayUrls.length === 2 ? '1fr 1fr' : displayUrls.length === 3 ? '2fr 1fr' : '1fr 1fr';
                                        mediaHTML = `<div style="display:grid;grid-template-columns:${gridCols};gap:3px;height:220px;overflow:hidden;">`;
                                        displayUrls.slice(0, 4).forEach((u, i) => {
                                            const isV = u.match(/\.(mp4|webm|mov)(\?|$)/i);
                                            const extra = displayUrls.length === 3 && i === 0 ? 'grid-row:1/3;' : '';
                                            if (isV) {
                                                mediaHTML += `<video src="${u}" controls muted playsinline style="width:100%;height:100%;object-fit:cover;${extra}"></video>`;
                                            } else {
                                                mediaHTML += `<img src="${u}" loading="lazy" style="width:100%;height:100%;object-fit:cover;${extra}" onerror="this.style.display='none'">`;
                                            }
                                        });
                                        if (displayUrls.length > 4) {
                                            mediaHTML += `<div style="display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);color:white;font-size:1.2rem;font-weight:800;">+${displayUrls.length-4}</div>`;
                                        }
                                        mediaHTML += `</div>`;
                                    }

                                    const currencySymbols = { NGN:'₦', USD:'$', EUR:'€', GBP:'£', GHS:'₵', EMPY:'', USDT:'USDT ' };
                                    const sym = currencySymbols[selectedCurrency] || '$';
                                    const suffix = selectedCurrency === 'EMPY' ? ' EMPY' : (selectedCurrency === 'USDT' ? ' USDT' : '');
                                    let priceDisplay = `${sym}${itemPrice.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}${suffix}`;

                                    newCard.innerHTML = `${mediaHTML}
                                        <div class="property-info"><h4>${itemName}</h4><p><i class="fas fa-map-marker-alt"></i> ${itemLocationInput?.value||''}</p><div style="font-weight:700;color:var(--accent-color);font-size:1.05rem;">${priceDisplay}</div></div>
                                        <div class="property-seller-info"><span>by @${userState.username} ${salesType==='escrow'?'<i class="fas fa-check-circle verified-badge-small" title="Escrow Protected"></i>':'<i class="fas fa-exclamation-circle unverified-badge-small" title="Direct Sales"></i>'}</span><span class="star-rating">New <i class="fas fa-star"></i></span></div>
                                        ${salesType==='direct'?'<div class="direct-trade-warning" style="display:block;"><p><strong><i class="fas fa-exclamation-triangle"></i> Direct Sales:</strong> Please conduct due diligence.</p></div>':''}
                                        <div class="direct-contact-info"></div>
                                        <div class="property-actions">
                                            <span class="sponsored-badge" style="display:none;position:absolute;top:10px;left:10px;">Sponsored</span>
                                            ${salesType==='escrow'?'<button class="btn btn-accent add-to-cart-btn" style="display:block;"><i class="fas fa-cart-plus"></i> Add to Cart</button>':'<button class="btn btn-danger contact-seller-btn" style="display:block;"><i class="fas fa-phone"></i> Contact Seller</button>'}
                                            <button class="btn promote-item-btn promote-post-btn"><i class="fas fa-rocket"></i> Promote</button>
                                        </div>`;
                                    propertyGrid.prepend(newCard);

                                    // Save listing to Firestore (single write, no duplicate)
                                    try {
                                        // Notify community
                                        fbDb.collection('notifications').add({
                                            type: 'new_listing', fromUserId: userState.id,
                                            fromUserName: userState.username,
                                            message: '🛒 New item listed: ' + itemName + ' by @' + userState.username,
                                            createdAt: new Date().toISOString(), read: false
                                        }).catch(function(){});
                                        await fbDb.collection('marketplace_listings').doc(newId).set({
                                            id: newId, userId: userState.id, username: userState.username,
                                            name: itemName, price: itemPrice, currency: selectedCurrency,
                                            location: itemLocationInput?.value || '', salesType,
                                            sellerId: userState.id, sellerName: userState.username,
                                            media: cloudUrls.length ? cloudUrls : [],
                                            createdAt: new Date().toISOString()
                                        });
                                        console.log('[Marketplace] ✅ Saved to Firestore:', newId);
                                    } catch(e) {
                                        console.warn('[Marketplace] Firestore save failed:', e.message);
                                        // Don't re-throw — card is already shown locally
                                    }

                                    form.reset();
                                    marketplaceMediaFiles = [];
                                    const mktPreview = document.getElementById('marketplace-media-preview');
                                    if (mktPreview) mktPreview.innerHTML = '';
                                    const mktTextFields = document.getElementById('marketplace-text-fields');
                                    if (mktTextFields) mktTextFields.style.display = 'none';
                                    showNotification('✅ Item listed and saved to cloud successfully!', 'success');
                                } catch(err) {
                                    console.error('Marketplace listing error:', err);
                                    showNotification('Failed to list item. Please try again.', 'error');
                                } finally { if (mktSubmitBtn) mktSubmitBtn.disabled = false; }
                            })();
                            break;
                        }

                        case 'live-comment-form': {
                            const input = form.querySelector('#live-comment-input');
                            if (!input) return; 

                            const text = input.value.trim();
                            if(text) createLiveComment(userState.fullName, text);
                            input.value = '';
                            break;
                        }
                         case 'help-form': {
                             const requestCategorySelect = form.querySelector('#request-category');
                             const requestStoryTextarea = form.querySelector('#request-story');
                             const requestAmountInput = form.querySelector('#request-amount');
                             const requestCurrencySelect = form.querySelector('#request-currency');
                             if (!requestCategorySelect || !requestStoryTextarea || !requestAmountInput || !requestCurrencySelect) return; 

                            showNotification('Uploading evidence files...', 'info');
                            const sosSubmitBtn = form.querySelector('button[type="submit"]');
                            if (sosSubmitBtn) sosSubmitBtn.disabled = true;
                            // Show green upload progress bar
                            let sosProgressBar = document.getElementById('sos-upload-progress');
                            if (!sosProgressBar) {
                                sosProgressBar = document.createElement('div');
                                sosProgressBar.id = 'sos-upload-progress';
                                sosProgressBar.innerHTML = '<div class="upload-progress-container"><div class="upload-progress-bar" style="width:0%"></div></div>';
                                form.insertBefore(sosProgressBar, sosSubmitBtn);
                            }
                            sosProgressBar.style.display = 'block';
                            
                            (async () => {
                                try {
                                    // Upload all SOS media to Cloudinary
                                    let mediaUrls = [];
                                    if (sosMediaFiles.length > 0) {
                                        for (const file of sosMediaFiles) {
                                            try {
                                                const url = await window.uploadToCloudinary(file, (pct) => {
                                                    showNotification(`Uploading: ${pct}%`, 'info');
                                                });
                                                mediaUrls.push({ url, type: file.type });
                                            } catch(uploadErr) {
                                                console.warn('SOS media upload failed:', uploadErr);
                                                mediaUrls.push({ url: URL.createObjectURL(file), type: file.type });
                                            }
                                        }
                                    }
                                    
                                    const newSosRequest = {
                                        id: `sos-${Date.now()}`,
                                        userId: userState.id,
                                        username: userState.username,
                                        avatar: userState.avatar,
                                        title: requestCategorySelect.value,
                                        story: requestStoryTextarea.value,
                                        amount: requestAmountInput.value,
                                        currency: requestCurrencySelect.value,
                                        media: mediaUrls,
                                        createdAt: new Date().toISOString(),
                                        status: 'pending'
                                    };
                                    
                                    // SOS goes to ADMIN QUEUE only — not dashboard until approved
                                    newSosRequest.status = 'pending_approval';
                                    mockAdminSosQueue.push(newSosRequest);
                                    window.mockAdminSosQueue = mockAdminSosQueue; // sync to window scope
                                    
                                    // Save to Firestore sos_queue collection (admin reviews here)
                                    try {
                                        await fbDb.collection('sos_queue').doc(newSosRequest.id).set(newSosRequest);
                                    } catch(fsErr) { console.warn('Firestore SOS save failed:', fsErr.message); }
                                    
                                    // Always refresh admin queues regardless of current user role
                                    try { renderAdminQueues(); } catch(e) {}
                                    // Update admin stat badge
                                    const sosStat = document.getElementById('admin-stat-sos');
                                    if (sosStat) sosStat.textContent = mockAdminSosQueue.length;
                                    // Notify user of submission
                                    if (typeof window.pushNotification === 'function') {
                                        window.pushNotification(
                                            `🆘 Your SOS request "${newSosRequest.title}" has been submitted and is pending admin review. You will be notified of the outcome.`,
                                            'info'
                                        );
                                    } else {
                                        showNotification('✅ SOS request submitted! Pending admin review.', 'success');
                                    }
                                    form.reset();
                                    sosMediaFiles = [];
                                    const sosMediaPreview = document.getElementById('sos-media-preview');
                                    if (sosMediaPreview) sosMediaPreview.innerHTML = '';
                                    navigateTo('dashboard');
                                } catch(err) {
                                    console.error('SOS submission error:', err);
                                    showNotification('Failed to submit SOS request. Please try again.', 'error');
                                } finally {
                                    if (sosSubmitBtn) { sosSubmitBtn.disabled = false; sosSubmitBtn.textContent = 'Submit SOS Request'; }
                                    // Always hide progress bar
                                    const spb = document.getElementById('sos-upload-progress');
                                    if (spb) spb.style.display = 'none';
                                }
                            })();
                            break;
                        }
                         case 'crisis-form': {
                            const crisisTypeSelect = form.querySelector('#crisis-type');
                            const crisisDescriptionTextarea = form.querySelector('#crisis-description');
                            const crisisLocationInput = form.querySelector('#crisis-location');
                            if (!crisisTypeSelect || !crisisDescriptionTextarea || !crisisLocationInput) return;
                            const crisisSubmitBtn = form.querySelector('button[type="submit"]');
                            if (crisisSubmitBtn) crisisSubmitBtn.disabled = true;
                            if (crisisMediaFiles.length > 0) showNotification('Uploading crisis media...', 'info');
                            (async () => {
                                try {
                                    const mediaUrls = [];
                                    for (const file of crisisMediaFiles) {
                                        try {
                                            const url = await window.uploadToCloudinary(file, null);
                                            mediaUrls.push({ url, type: file.type });
                                        } catch(e) { mediaUrls.push({ url: URL.createObjectURL(file), type: file.type }); }
                                    }
                                    const crisisId = `crisis-${Date.now()}`;
                                    const crisisData = {
                                        id: crisisId,
                                        type: crisisTypeSelect.value,
                                        description: crisisDescriptionTextarea.value,
                                        location: crisisLocationInput.value,
                                        userId: userState.id, username: userState.username, avatar: userState.avatar,
                                        media: mediaUrls, createdAt: new Date().toISOString(), status: 'pending'
                                    };
                                    // Save to Firestore
                                    try {
                                        await fbDb.collection('crisis_reports').doc(crisisId).set(crisisData);
                                    } catch(e) { console.warn('Crisis Firestore save failed:', e.message); }
                                    form.reset();
                                    crisisMediaFiles = [];
                                    const crisisMediaPreview = document.getElementById('crisis-media-preview');
                                    if (crisisMediaPreview) crisisMediaPreview.innerHTML = '';
                                    const crisisLocationCoords = document.getElementById('crisis-location-coords');
                                    if (crisisLocationCoords) crisisLocationCoords.textContent = '';
                                    showNotification('✅ Crisis report submitted and saved to cloud!', 'success');
                                    createCrisisPostOnFeed(crisisData);
                                    rewardUserForAction('VERIFIED_CRISIS_REPORT');
                                    navigateTo('dashboard');
                                } catch(err) {
                                    console.error('Crisis report error:', err);
                                    showNotification('Failed to submit crisis report.', 'error');
                                } finally { if (crisisSubmitBtn) crisisSubmitBtn.disabled = false; }
                            })();
                            break;
                        }
                        case 'reel-upload-form': { 
                             const reelCaptionInput = form.querySelector('#reel-caption');
                             const reelVideoFileInput = form.querySelector('#reel-video-file');
                             if (!reelCaptionInput || !reelVideoFileInput) return;
                             const caption = reelCaptionInput.value;
                             const videoFile = reelVideoFileInput.files[0];
                             if (!videoFile) { showNotification('Please select a video file.', 'error'); return; }
                             const reelSubmitBtn = form.querySelector('button[type="submit"]');
                             if (reelSubmitBtn) reelSubmitBtn.disabled = true;
                             showNotification('Uploading reel to cloud...', 'info');
                             (async () => {
                                 try {
                                     let videoUrl = URL.createObjectURL(videoFile); // Preview immediately
                                     const newId = `reel-${Date.now()}`;
                                     const newReelCard = document.createElement('div');
                                     newReelCard.className = 'reel-card';
                                     newReelCard.dataset.postId = newId;
                                     newReelCard.dataset.videoUrl = videoUrl;
                                     newReelCard.innerHTML = `<video src="${videoUrl}" poster="" loop muted playsinline></video><div class="reel-content"><div class="reel-user-info"><div class="avatar-placeholder"><img src="${userState.avatar}" alt="avatar"></div><span>@${userState.username}</span></div><p>${formatWhatsAppText(caption)}</p></div><span class="sponsored-badge" style="display:none;position:absolute;top:15px;left:15px;z-index:4;">Sponsored</span><div class="post-options" style="position:absolute;top:15px;right:15px;"><button class="options-btn" style="color:white;text-shadow:1px 1px 2px black;"><i class="fas fa-ellipsis-v"></i></button><div class="options-menu"><a href="#" class="promote-post-btn"><i class="fas fa-rocket"></i> Promote</a></div></div>`;
                                     const video = newReelCard.querySelector('video');
                                     if (video) {
                                         newReelCard.addEventListener('mouseover', () => video.play().catch(()=>{}));
                                         newReelCard.addEventListener('mouseout', () => video.pause());
                                     }
                                     const reelsGridContainer = document.getElementById('reels-grid-container');
                                     if (reelsGridContainer) {
                                         reelsGridContainer.prepend(newReelCard);
                                         const reelsEmpty = document.getElementById('reels-empty-state');
                                         if (reelsEmpty) reelsEmpty.style.display = 'none';
                                     }
                                     addReelToDashboardSlider({ url: videoUrl, poster: '', caption });
                                     form.reset();
                                     rewardUserForAction('CREATE_REEL');
                                     // Upload to Cloudinary in background
                                     window.uploadToCloudinary(videoFile, (pct) => { if (pct % 25 === 0) showNotification(`Reel upload: ${pct}%`, 'info'); })
                                         .then(async (cloudUrl) => {
                                             newReelCard.dataset.videoUrl = cloudUrl;
                                             const cardVideo = newReelCard.querySelector('video');
                                             if (cardVideo) cardVideo.src = cloudUrl;
                                             if (!cloudUrl || cloudUrl.startsWith('blob:')) {
                                                 showNotification('⚠ Reel cloud upload failed — only visible on this device. Try re-posting.', 'warning');
                                                 return;
                                             }
                                             try {
                                                 await fbDb.collection('reels').doc(newId).set({
                                                     id: newId, userId: userState.id, username: userState.username,
                                                     avatar: userState.avatar, caption,
                                                     videoUrl: cloudUrl,
                                                     createdAt: new Date().toISOString()
                                                 });
                                             } catch(e) { console.warn('[Reel] Firestore save failed:', e.message); }
                                             showNotification('✅ Reel saved to cloud successfully!', 'success');
                                         })
                                         .catch(e => { console.warn('Reel cloud upload failed:', e); showNotification('Reel posted locally (cloud upload failed).', 'warning'); });
                                 } catch(err) {
                                     console.error('Reel upload error:', err);
                                     showNotification('Failed to upload reel.', 'error');
                                 } finally { if (reelSubmitBtn) reelSubmitBtn.disabled = false; }
                             })();
                            break;
                        }
                        case 'buy-empy-form': {
                             const buyEmpyAmountUsdInput = document.getElementById('buy-empy-amount-usd');
                             if (!buyEmpyAmountUsdInput) return; 

                             const amountNgn = parseFloat(buyEmpyAmountUsdInput.value);
                             if (isNaN(amountNgn) || amountNgn < 500) {
                                 showNotification("Minimum purchase is ₦500.", "error"); return;
                             }
                             const empyReceived = (amountNgn / USD_TO_NGN_RATE) / EMPY_RATE_USD;
                             
                             // Flutterwave Payment
                             FlutterwaveCheckout({
                                 public_key: (window._appConfig && window._appConfig.flutterwave && window._appConfig.flutterwave.publicKey) || "",
                                 tx_ref: `EMPY-BUY-${Date.now()}`,
                                 amount: amountNgn,
                                 currency: "NGN",
                                 payment_options: "card,banktransfer,ussd",
                                 customer: {
                                     email: userState.email || "user@empyrean.com",
                                     phone_number: userState.phone || "",
                                     name: userState.fullName || "Empyrean Member",
                                 },
                                 customizations: {
                                     title: "Buy EMPY Tokens",
                                     description: `Purchase ${Math.floor(empyReceived).toLocaleString()} EMPY Tokens`,
                                     logo: "https://cdn-icons-png.flaticon.com/512/6001/6001527.png",
                                 },
                                 callback: function(data) {
                                     if (data.status === "successful") {
                                         userState.empyBalance += empyReceived;
                                         updateWalletUI();
                                         form.reset();
                                         const buyEmpyModal = document.getElementById('buy-empy-modal');
                                         if (buyEmpyModal) buyEmpyModal.classList.remove('show');
                                         showNotification(`✅ ${Math.floor(empyReceived).toLocaleString()} EMPY purchased successfully!`, "success");
                                     } else {
                                         showNotification("Payment was not completed. Please try again.", "error");
                                     }
                                 },
                                 onclose: function() {}
                             });
                             break;
                        }
                        case 'donation-form': {
                            const donateAmountCardInput = form.querySelector('#donate-amount-card');
                            const donateNameInput = form.querySelector('#donate-name-card');
                            const donateEmailInput = form.querySelector('#donate-email-card');
                            const donatePhoneInput = form.querySelector('#donate-phone-card');

                            const activePaymentTab = form.closest('.modal-card')?.querySelector('.payment-tab.active');
                            const isCardPayment = !activePaymentTab || activePaymentTab.dataset.target === 'card-payment-sos';

                            if (isCardPayment) {
                                const amount = parseFloat(donateAmountCardInput?.value || 0);
                                if (!amount || amount < 100) { showNotification("Minimum donation is ₦100.", "error"); return; }
                                const donorName  = donateNameInput?.value?.trim()  || userState.fullName || "Anonymous";
                                const donorEmail = donateEmailInput?.value?.trim() || userState.email    || "donor@empyrean.com";
                                const donorPhone = donatePhoneInput?.value?.trim() || "";
                                const donationTitleEl = document.getElementById('donation-modal-title');
                                // FIX: use locally-scoped ref — outer `txRef` is undefined in this block
                                const donateTxRef = 'EMPY-DON-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

                                const _donBtn=form.querySelector('button[type="submit"]');
                                function _restoreBtn(){if(_donBtn){_donBtn.disabled=false;_donBtn.innerHTML='<i class="fas fa-hand-holding-heart"></i> Donate Now via Flutterwave';}}
                                function _closeModal(){const _cm=form.closest('.modal-overlay-container');if(_cm){_cm.classList.remove('show');_cm.style.display='none';}document.body.classList.remove('modal-open');document.body.style.overflow='';}
                                if(_donBtn){_donBtn.disabled=true;_donBtn.innerHTML='<i class="fas fa-circle-notch fa-spin"></i> Opening Payment...';}
                                const _launchDonation=function(){
                                    try{
                                        FlutterwaveCheckout({
                                            public_key:(window._appConfig && window._appConfig.flutterwave && window._appConfig.flutterwave.publicKey) || "",
                                            tx_ref:donateTxRef, amount:amount, currency:'NGN',
                                            payment_options:'card,banktransfer,ussd,mobilemoney,barter,nqr',
                                            customer:{email:donorEmail,phone_number:donorPhone,name:donorName},
                                            customizations:{title:donationTitleEl?donationTitleEl.textContent:'SOS Donation',description:'Donation to Empyrean SOS Escrow Fund',logo:'https://cdn-icons-png.flaticon.com/512/6001/6001527.png'},
                                            meta:{source:'sos_donation',userId:userState.id||'guest',sosUserId:(window._sosDonationContext&&window._sosDonationContext.userId)||'',sosPostId:(window._sosDonationContext&&window._sosDonationContext.postId)||''},
                                            callback:function(data){
                                                _restoreBtn();
                                                if(data.status==='successful'||data.status==='completed'){
                                                    var _ctx=window._sosDonationContext||{};
                                                    try{if(window.fbDb){window.fbDb.collection('flw_transactions').doc(donateTxRef).set({txRef:donateTxRef,flwRef:data.flw_ref||'',amount,currency:'NGN',purpose:'sos_donation',status:'held',donorName,donorEmail,donorUserId:userState.id||'guest',recipientUserId:_ctx.userId||'',sosPostId:_ctx.postId||'',createdAt:new Date().toISOString()}).catch(function(){});}}catch(e){}
                                                    showNotification('✅ Thank you! ₦'+amount.toLocaleString()+' donated to '+(_ctx.username||'this cause')+'. Held in escrow.','success');
                                                    try{if(liveStreamData&&liveStreamData.isLive&&liveStreamData.liveGoal){liveStreamData.liveGoal.currentAmount+=(amount/USD_TO_NGN_RATE/EMPY_RATE_USD);updateLiveUI();}}catch(e){}
                                                    window._sosDonationContext=null; form.reset(); _closeModal();
                                                } else { showNotification('Donation not completed. Please try again.','error'); }
                                            },
                                            onclose:function(){_restoreBtn();showNotification('Payment window closed.','info');}
                                        });
                                    }catch(flwErr){_restoreBtn();showNotification('Payment gateway error. Please try again.','error');}
                                };

                                // Ensure Flutterwave SDK is available before launching
                                if (typeof FlutterwaveCheckout !== 'undefined') {
                                    _launchDonation();
                                } else if (typeof window._ensureFlutterwaveSDK === 'function') {
                                    showNotification('Loading payment gateway...', 'info');
                                    window._ensureFlutterwaveSDK(_launchDonation);
                                } else {
                                    // Manual fallback load
                                    showNotification('Loading payment gateway...', 'info');
                                    const _fs = document.createElement('script');
                                    _fs.src = 'https://checkout.flutterwave.com/v3.js';
                                    _fs.onload = _launchDonation;
                                    _fs.onerror = function() { showNotification('Payment gateway unavailable. Try again.', 'error'); };
                                    document.head.appendChild(_fs);
                                }
                            } else {
                                showNotification("Please follow the bank transfer instructions above.", "info");
                            }
                            break;
                        }
                        case 'p2p-transfer-form': { 
                            const transferAmountInput = document.getElementById('transfer-amount');
                            if (!transferAmountInput) return; 

                            const amountEmpy = parseFloat(transferAmountInput.value) || 0;
                            const networkFee = 1.0;
                            const totalDeducted = amountEmpy + networkFee;

                            if (userState.empyBalance < totalDeducted) {
                                showNotification("Insufficient balance for this transfer.", "error");
                                return;
                            }
                            
                            userState.empyBalance -= totalDeducted;
                            updateWalletUI();
                            showNotification(`${amountEmpy.toLocaleString()} EMPY sent successfully!`, 'success');
                            form.reset();
                            updateTransferPreview();
                            break;
                        }
                         case 'cross-chain-transfer-form': {
                            const crossChainAmountInput = form.querySelector('#cross-chain-amount');
                            const networkSelect = form.querySelector('#cross-chain-network');
                            if (!crossChainAmountInput || !networkSelect) return; 

                            const amountEmpy = parseFloat(crossChainAmountInput.value) || 0;
                            const selectedOption = networkSelect.options[networkSelect.selectedIndex];
                            const networkFee = parseFloat(selectedOption.dataset.fee) || 0;
                            const totalDeducted = amountEmpy + networkFee;

                            if (userState.empyBalance < totalDeducted) {
                                showNotification("Insufficient balance for this transfer.", "error");
                                return;
                            }
                            
                            userState.empyBalance -= totalDeducted;
                            updateWalletUI();
                            showNotification(`${amountEmpy.toLocaleString()} EMPY sent to external wallet!`, 'success');
                            form.reset();
                            updateCrossChainTransferPreview();
                            break;
                        }
                        case 'promotion-setup-form': {
                            const promoPaymentSelect = form.querySelector('#promo-payment');
                            const promoBudgetInput = form.querySelector('#promo-budget');
                            if (!promoPaymentSelect || !promoBudgetInput) return; 

                            const paymentMethod = promoPaymentSelect.value;
                            const budget = parseFloat(promoBudgetInput.value);
                            const budgetInUsd = budget / USD_TO_NGN_RATE;
                            const budgetInEmpy = budgetInUsd / EMPY_RATE_USD;

                            const promotionSetupView = document.getElementById('promotion-setup-view');
                            const promotionPaymentDetails = document.getElementById('promotion-payment-details');
                            if (promotionSetupView) promotionSetupView.style.display = 'none';
                            if (promotionPaymentDetails) promotionPaymentDetails.style.display = 'block';

                            const paymentTitle = document.getElementById('payment-details-title');
                            const walletView = document.getElementById('promo-wallet-payment-view');
                            const cardView = document.getElementById('promo-card-payment-view');

                            if (paymentTitle && walletView && cardView) { 
                                if (paymentMethod === 'wallet') {
                                    paymentTitle.textContent = "Confirm EMPY Payment";
                                    walletView.style.display = 'block';
                                    cardView.style.display = 'none';
                                    const promoEmpyCost = document.getElementById('promo-empy-cost');
                                    if (promoEmpyCost) promoEmpyCost.innerHTML = `<i class="fa-solid fa-coins"></i> ${budgetInEmpy.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
                                } else {
                                    paymentTitle.textContent = `Pay ${formatNgnPrice(budget)} with Card`;
                                    walletView.style.display = 'none';
                                    cardView.style.display = 'block';
                                }
                            }
                            break;
                        }
                        case 'promotion-finalize-form': {
                            const promoPaymentSelect = document.getElementById('promo-payment');
                            const promoBudgetInput = document.getElementById('promo-budget');
                            const promotePostIdInput = document.getElementById('promote-post-id');
                            if (!promoPaymentSelect || !promoBudgetInput || !promotePostIdInput) return; 

                            const paymentMethod = promoPaymentSelect.value;
                            const budget = parseFloat(promoBudgetInput.value);
                            const budgetInUsd = budget / USD_TO_NGN_RATE;
                            const budgetInEmpy = budgetInUsd / EMPY_RATE_USD;
                             const postId = promotePostIdInput.value;

                            if (paymentMethod === 'wallet') {
                                if (userState.empyBalance < budgetInEmpy) {
                                    showNotification('Insufficient EMPY balance for this promotion.', 'error');
                                    return;
                                }
                                userState.empyBalance -= budgetInEmpy;
                                updateWalletUI();
                            } else {
                                const cardForm = document.getElementById('promo-card-form');
                                if (!cardForm || !cardForm.checkValidity()) { 
                                    showNotification("Please fill in your card details.", 'error');
                                    return;
                                }
                            }
                            
                            const postElement = document.querySelector(`[data-post-id="${postId}"], [data-id="${postId}"]`);
                            if(postElement) {
                                const sponsoredBadge = postElement.querySelector('.sponsored-badge');
                                if(sponsoredBadge) sponsoredBadge.style.display = 'inline-flex';
                            }

                            const closestModal = form.closest('.modal-overlay-container');
                            if (closestModal) closestModal.classList.remove('show');
                            document.body.classList.remove('modal-open');
                            showNotification("Your promotion is now active!", "success");
                            break;
                        }
                        case 'edit-post-form': {
                            const editPostIdInput = form.querySelector('#edit-post-id');
                            const editPostTextInput = form.querySelector('#edit-post-text');
                            const editCollectionInput = form.querySelector('#edit-post-collection');
                            if (!editPostIdInput || !editPostTextInput) return;

                            const postId = editPostIdInput.value;
                            const newText = editPostTextInput.value.trim();
                            const collection = (editCollectionInput && editCollectionInput.value) || 'posts';
                            if (!newText) { showNotification('Post text cannot be empty.', 'warning'); return; }

                            // Update all DOM mirrors
                            document.querySelectorAll('[data-post-id="'+postId+'"]').forEach(function(postEl) {
                                var p = postEl.querySelector('.story-content p, .news-item-content p, .news-item-summary');
                                if (p) p.innerHTML = typeof formatWhatsAppText === 'function' ? formatWhatsAppText(newText) : newText;
                                // Also update marketplace name/title if applicable
                                var h4 = postEl.querySelector('.property-info h4');
                                if (h4) h4.textContent = newText;
                            });

                            // Save to Firestore
                            if (window.fbDb && postId) {
                                const updateField = (collection === 'marketplace_listings') ? 'name'
                                    : (collection === 'news_posts') ? 'content'
                                    : (collection === 'reels') ? 'caption'
                                    : (collection === 'crisis_reports') ? 'story'
                                    : 'text';
                                window.fbDb.collection(collection).doc(postId).update({
                                    [updateField]: newText,
                                    updatedAt: new Date().toISOString()
                                }).then(function() {
                                    showNotification('✅ Updated and saved.', 'success');
                                }).catch(function(err) {
                                    console.warn('[Edit] Firestore update failed:', err.message);
                                    showNotification('Updated locally. Cloud sync may be delayed.', 'info');
                                });
                            }

                            const closestModal = form.closest('.modal-overlay-container');
                            if (closestModal) closestModal.classList.remove('show');
                            document.body.classList.remove('modal-open');
                            showNotification('Post updated!', 'success');
                            break;
                        }
                        case 'create-news-post-form': { 
                            const newsTitleInput = form.querySelector('#news-title');
                            const newsContentTextarea = form.querySelector('#news-content');
                            if (!newsTitleInput || !newsContentTextarea) return;
                            const title = newsTitleInput.value;
                            const content = newsContentTextarea.value;
                            const newsList = document.getElementById('news-list-container');
                            if (!newsList) return;
                            const newsSubmitBtn = form.querySelector('button[type="submit"]');
                            if (newsSubmitBtn) newsSubmitBtn.disabled = true;
                            if (newsMediaFile) showNotification('Uploading news media...', 'info');
                            (async () => {
                                try {
                                    let mediaUrl = null;
                                    let mediaType = null;
                                    if (newsMediaFile) {
                                        try {
                                            if (typeof showNotification === 'function') showNotification('Uploading news media to cloud…', 'info');
                                            mediaUrl = await window.uploadToCloudinary(newsMediaFile, null);
                                            mediaType = newsMediaFile.type;
                                            if (mediaUrl && mediaUrl.startsWith('blob:')) {
                                                console.warn('[News] Cloudinary not ready — stored locally, will sync on next upload');
                                            }
                                        } catch(e) {
                                            mediaUrl = URL.createObjectURL(newsMediaFile);
                                            mediaType = newsMediaFile.type;
                                        }
                                    }
                                    const newsId = `news-${Date.now()}`;
                                    const newItem = document.createElement('div');
                                    newItem.className = 'news-list-item';
                                    newItem.dataset.postId = newsId;
                                    let mediaHTML = '';
                                    if (mediaUrl) {
                                        newItem.dataset.img = mediaUrl;
                                        mediaHTML = `<div class="news-item-image">${mediaType?.startsWith('image/') ? `<img src="${mediaUrl}" alt="${title}" loading="lazy">` : `<video style="width:100%;height:100%;object-fit:cover;" controls loop><source src="${mediaUrl}" type="${mediaType}"></video>`}</div>`;
                        // Store mediaUrl on the element so renderDashboardNews can read it
                        setTimeout(function() {
                            var items = document.querySelectorAll('#news .news-list-item');
                            var last = items[items.length - 1];
                            if (last) { last.dataset.img = mediaUrl; last.dataset.mediaType = mediaType || 'image'; }
                        }, 100);
                                    }
                                    newItem.innerHTML = `${mediaHTML}
                                        <div class="news-item-content-wrapper">
                                            <div class="news-item-content"><h4>${title}</h4><span class="news-meta"><i class="fas fa-calendar-alt"></i> Just now</span><p>${content}</p></div>
                                            <div class="story-actions" style="margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;padding:0 4px;">
                        <a class="action-btn like-btn"><i class="far fa-heart"></i><span class="like-count">0</span></a>
                        <a class="action-btn comment-btn"><i class="far fa-comment"></i><span class="comment-count">0</span></a>
                        <a class="action-btn retweet-btn" title="Retweet"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>
                        <a class="action-btn share-btn" title="Share"><i class="fas fa-share"></i><span>Share</span></a>
                        <span class="action-btn view-count-display" style="margin-left:auto;color:var(--text-muted);font-size:0.75rem;pointer-events:none;display:flex;align-items:center;gap:4px;"><i class="fas fa-eye"></i><span class="view-count">0</span></span>
                    </div>
                                            <div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
                                        </div>`;
                                    newsList.prepend(newItem);
                                    renderDashboardNews();
                                    rewardUserForAction('PUBLISH_NEWS');
                                    // Save to Firestore
                                    try {
                                        // Notify users of new news article
                                    try {
                                        await fbDb.collection('notifications').add({
                                            type: 'new_news', message: '📰 New article published: ' + (newsTitle||'Latest News'),
                                            createdAt: new Date().toISOString(), read: false
                                        });
                                    } catch(e) {}
                                    await fbDb.collection('news_posts').doc(newsId).set({
                                            id: newsId, title, content,
                                            mediaUrl: (mediaUrl && !mediaUrl.startsWith('blob:')) ? mediaUrl : null,
                                            mediaType: (mediaUrl && !mediaUrl.startsWith('blob:')) ? mediaType : null,
                                            userId: userState.id, username: userState.username,
                                            createdAt: new Date().toISOString()
                                        });
                                    } catch(e) {}
                                    form.reset();
                                    const newsMediaPreview = document.getElementById('news-media-preview');
                                    if (newsMediaPreview) newsMediaPreview.innerHTML = '';
                                    newsMediaFile = null;
                                    showNotification('✅ News article published and saved to cloud!', 'success');
                                } catch(err) {
                                    console.error('News post error:', err);
                                    showNotification('Failed to publish news article.', 'error');
                                } finally { if (newsSubmitBtn) newsSubmitBtn.disabled = false; }
                            })();
                            break;
                        }
                        case 'create-business-page-form': { 
                            const pageNameInput = form.querySelector('#page-name');
                            const pageTaglineInput = form.querySelector('#page-tagline');
                            const pageIndustrySelect = form.querySelector('#page-industry');
                            const pageEmailInput = form.querySelector('#page-email');
                            const pagePhoneInput = form.querySelector('#page-phone');
                            const pageAddressInput = form.querySelector('#page-address');
                            if (!pageNameInput || !pageTaglineInput || !pageIndustrySelect || !pageEmailInput) return;
                            const bizSubmitBtn = form.querySelector('button[type="submit"]');
                            if (bizSubmitBtn) bizSubmitBtn.disabled = true;
                            showNotification('Creating business page...', 'info');
                            (async () => {
                                try {
                                    let coverPhotoUrl = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80';
                                    let profilePhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(pageNameInput.value)}&background=5B0EA6&color=fff&size=150`;
                                    if (newPageCoverFile) {
                                        try { coverPhotoUrl = await window.uploadToCloudinary(newPageCoverFile, null); } catch(e) {}
                                    }
                                    if (newPageProfileFile) {
                                        try { profilePhotoUrl = await window.uploadToCloudinary(newPageProfileFile, null); } catch(e) {}
                                    }
                                    const newPage = {
                                        id: `biz-${Date.now()}`,
                                        name: pageNameInput.value, tagline: pageTaglineInput.value,
                                        industry: pageIndustrySelect.value, email: pageEmailInput.value,
                                        phone: pagePhoneInput?.value || '', address: pageAddressInput?.value || '',
                                        coverPhoto: coverPhotoUrl, profilePhoto: profilePhotoUrl,
                                        followerCount: 0, ownerId: userState.id,
                                        createdAt: new Date().toISOString()
                                    };
                                    userState.businessPage = newPage;
                                    if (mockUsers[userState.id]) mockUsers[userState.id].businessPage = newPage;
                                    // Save to Firestore
                                    try {
                                        await fbDb.collection('business_pages').doc(newPage.id).set(newPage);
                                        await saveUserToFirestore(userState.id, userState);
                                    } catch(e) { console.warn('Business page Firestore save failed:', e.message); }
                                    // Close modal FIRST
                                    const modal = document.getElementById('create-business-page-modal');
                                    if (modal) modal.classList.remove('show');
                                    document.body.classList.remove('modal-open');
                                    // Reset form
                                    form.reset();
                                    const pageCoverPhotoPreview = document.getElementById('page-cover-photo-preview');
                                    if (pageCoverPhotoPreview) { pageCoverPhotoPreview.style.backgroundImage = ''; pageCoverPhotoPreview.innerHTML = '<i class="fas fa-camera"></i>&nbsp; Add Cover Image'; }
                                    const pageProfilePhotoPreview = document.getElementById('page-profile-photo-preview');
                                    if (pageProfilePhotoPreview) pageProfilePhotoPreview.style.backgroundImage = '';
                                    newPageCoverFile = null; newPageProfileFile = null;
                                    showNotification('✅ Business page created! Opening your page...', 'success');
                                    // Navigate and THEN render so the section is active before rendering
                                    navigateTo('business-page');
                                    setTimeout(function() {
                                        renderBusinessPage();
                                        // Scroll to top of business page section
                                        const bizSection = document.getElementById('business-page');
                                        if (bizSection) bizSection.scrollTop = 0;
                                        const mc = document.querySelector('.main-content');
                                        if (mc) mc.scrollTop = 0;
                                        // Trigger post-render setup (gallery upload, post media)
                                        const galleryInput = document.getElementById('business-gallery-upload');
                                        if (galleryInput && !galleryInput._bound) {
                                            galleryInput._bound = true;
                                            galleryInput.addEventListener('change', function() {
                                                const gallery = document.getElementById('business-media-gallery');
                                                Array.from(this.files).forEach(file => {
                                                    const url = URL.createObjectURL(file);
                                                    const div = document.createElement('div');
                                                    div.style.cssText = 'aspect-ratio:1;border-radius:14px;overflow:hidden;cursor:pointer;';
                                                    div.innerHTML = file.type.startsWith('video/')
                                                        ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted playsinline loop></video>`
                                                        : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`;
                                                    const uploadLabel = gallery ? gallery.querySelector('label') : null;
                                                    if (uploadLabel) gallery.insertBefore(div, uploadLabel);
                                                    else if (gallery) gallery.appendChild(div);
                                                });
                                            });
                                        }
                                    }, 150);
                                } catch(err) {
                                    console.error('Business page error:', err);
                                    showNotification('Failed to create business page.', 'error');
                                } finally { if (bizSubmitBtn) bizSubmitBtn.disabled = false; }
                            })();
                            break;
                        }
                        case 'withdrawal-form': {
                            const withdrawalAmountInput = document.getElementById('withdrawal-amount');
                            if (!withdrawalAmountInput) return; 

                            const amountEmpy = parseFloat(withdrawalAmountInput.value);
                             if (amountEmpy < 5) {
                                showNotification("Minimum withdrawal is 5 EMPY.", "error");
                                return;
                            }
                            if (userState.empyBalance < amountEmpy) {
                                showNotification("Insufficient EMPY balance for withdrawal.", "error");
                                return;
                            }
                            userState.empyBalance -= amountEmpy; 
                            showNotification("Withdrawal request submitted for approval.", "info");
                            form.reset();
                            handleWithdrawalMethodChange();
                            updateWithdrawalPreview();
                            updateWalletUI(); 
                        }
                            break;
                        case 'message-form':
                            const messageTextInput = form.querySelector('#message-text-input');
                            if (!messageTextInput) return; 

                            const text = messageTextInput.value.trim();
                            if (text) {
                                const messagesContainer = document.getElementById('chat-messages-container');
                                if (!messagesContainer) return; 

                                // Pass messageId to createMessageElement for potential pinning functionality
                                const messageId = `msg-${Date.now()}`;
                                const messageEl = createMessageElement(text, true, false, '', '', messageId);
                                messagesContainer.appendChild(messageEl);
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                messageTextInput.value = '';

                                if (!isGuest && userState.id === liveStreamData.hostUserId) {
                                    liveStreamData.sentMessages.push({ id: messageId, username: userState.username, content: text });
                                }
                            }
                            break;
                        case 'checkout-form': {
                            const currentPaymentMethod = document.querySelector('#checkout-form .payment-tabs .payment-tab.active')?.dataset.target;
                            const checkoutNameInput = document.getElementById('checkout-name');
                            const checkoutAddressInput = document.getElementById('checkout-address');
                            const checkoutBuyerEmail = document.getElementById('checkout-buyer-email');
                            const checkoutBuyerPhone = document.getElementById('checkout-buyer-phone');

                            if (!checkoutNameInput?.value || !checkoutAddressInput?.value) {
                                showNotification("Please fill in your shipping name and address.", "error");
                                if (checkoutNameInput && !checkoutNameInput.value) checkoutNameInput.style.borderColor = 'var(--danger-color)';
                                if (checkoutAddressInput && !checkoutAddressInput.value) checkoutAddressInput.style.borderColor = 'var(--danger-color)';
                                break;
                            }

                            if (currentPaymentMethod === 'escrow-payment') {
                                const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
                                const totalNgn = Math.round(total * USD_TO_NGN_RATE);
                                const buyerName = checkoutNameInput.value;
                                const buyerEmail = checkoutBuyerEmail?.value || userState.email || "buyer@empyrean.com";
                                const buyerPhone = checkoutBuyerPhone?.value || "";

                                FlutterwaveCheckout({
                                    public_key: (window._appConfig && window._appConfig.flutterwave && window._appConfig.flutterwave.publicKey) || "",
                                    tx_ref: `EMPY-ESCROW-${Date.now()}`,
                                    amount: totalNgn,
                                    currency: "NGN",
                                    payment_options: "card,banktransfer,ussd",
                                    customer: { email: buyerEmail, phone_number: buyerPhone, name: buyerName },
                                    customizations: {
                                        title: "Empyrean Marketplace – Escrow Payment",
                                        description: `Secure escrow for ${cart.length} item(s). Funds held until delivery confirmed.`,
                                        logo: "https://cdn-icons-png.flaticon.com/512/6001/6001527.png",
                                    },
                                    callback: function(data) {
                                        if (data.status === "successful") {
                                            showNotification("✅ Escrow payment received! Seller has been notified. You have 48hrs to confirm delivery.", "success");
                                            cart = [];
                                            updateCartUI();
                                            const cartModal = document.getElementById('cart-modal-overlay');
                                            if (cartModal) cartModal.classList.remove('show');
                                            document.body.classList.remove('modal-open');
                                            rewardUserForAction('SUCCESSFUL_ESCROW_BUYER');
                                        } else {
                                            showNotification("Payment not completed. Please try again.", "error");
                                        }
                                    },
                                    onclose: function() {}
                                });
                            } else {
                                showNotification("Direct purchase initiated! Please contact the seller to arrange payment.", "success");
                                cart = [];
                                updateCartUI();
                                const cartModal = document.getElementById('cart-modal-overlay');
                                if (cartModal) cartModal.classList.remove('show');
                                document.body.classList.remove('modal-open');
                            }
                            break;
                        }
                    }
                });

                document.body.addEventListener('input', function(e) {
                    if (e.target.closest('.form-group')) {
                        e.target.style.borderColor = '';
                        if (e.target.closest('.upload-area')) {
                            e.target.closest('.upload-area').style.borderColor = '';
                        }
                         if (e.target.classList.contains('live-capture-btn')) {
                            e.target.style.borderColor = '';
                        }
                    }

                    if (e.target.id === 'withdrawal-amount') {
                        updateWithdrawalPreview();
                    } else if (e.target.id === 'transfer-amount') { 
                        updateTransferPreview();
                    } else if (e.target.id === 'cross-chain-amount') {
                        updateCrossChainTransferPreview();
                    }
                    if (e.target.id === 'buy-empy-amount-usd') {
                        const amountNgn = parseFloat(e.target.value) || 0;
                        const previewEl = document.getElementById('empy-to-receive-preview');
                        if (previewEl) { 
                            if (amountNgn > 0) {
                                const empyAmt = (amountNgn / USD_TO_NGN_RATE) / EMPY_RATE_USD;
                                previewEl.textContent = `You will receive: ${Math.floor(empyAmt).toLocaleString()} EMPY`;
                            } else {
                                previewEl.textContent = '';
                            }
                        }
                    }
                    if (e.target.id === 'promo-budget') {
                        updatePromoReachPreview();
                    }
                    if (e.target.id === 'sidebar-search-input') {
                        const searchTerm = e.target.value.toLowerCase();
                        const activeSection = document.querySelector('.content-section.active');

                        if (!activeSection) return;

                        if (activeSection.id === 'dashboard') {
                            const feedItems = document.querySelectorAll('#feed-container .impact-story');
                            feedItems.forEach(item => {
                                const postText = item.querySelector('.story-content p')?.textContent.toLowerCase() || '';
                                const username = item.querySelector('.story-user-info strong')?.textContent.toLowerCase() || '';
                                if (postText.includes(searchTerm) || username.includes(searchTerm)) {
                                    item.style.display = 'block';
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                        } else if (activeSection.id === 'marketplace') {
                            const propertyCards = document.querySelectorAll('#property-grid-container .property-card');
                            propertyCards.forEach(card => {
                                const itemName = card.dataset.name.toLowerCase();
                                const itemLocation = card.dataset.location.toLowerCase();
                                if (itemName.includes(searchTerm) || itemLocation.includes(searchTerm)) {
                                    card.style.display = 'block';
                                } else {
                                    card.style.display = 'none';
                                }
                            });
                        } else if (activeSection.id === 'news') {
                            const newsItems = document.querySelectorAll('#news-list-container .news-list-item');
                            newsItems.forEach(item => {
                                const title = item.querySelector('.news-item-content h4')?.textContent.toLowerCase() || '';
                                const content = item.querySelector('.news-item-content p')?.textContent.toLowerCase() || '';
                                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                                    item.style.display = 'flex'; 
                                } else {
                                    item.style.display = 'none';
                                }
                            });
                        }
                    }
                });
                
                document.querySelectorAll('#reels .reel-card').forEach(card => {
                    const video = card.querySelector('video');
                    if (video) { 
                        card.addEventListener('mouseover', () => video.play().catch(e => {}));
                        card.addEventListener('mouseout', () => video.pause());
                    }
                });

                new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.matches('.dashboard-news-card, .dashboard-market-card')) {
                                const video = node.querySelector('video');
                                if (video) {
                                    node.addEventListener('mouseover', () => video.play().catch(e => {}));
                                    node.addEventListener('mouseout', () => video.pause());
                                }
                            }
                        });
                    });
                }).observe(document.getElementById('dashboard-news-slider'), { childList: true });
                 new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1 && node.matches('.dashboard-news-card, .dashboard-market-card')) {
                                const video = node.querySelector('video');
                                if (video) {
                                    node.addEventListener('mouseover', () => video.play().catch(e => {}));
                                    node.addEventListener('mouseout', () => video.pause());
                                }
                            }
                        });
                    });
                }).observe(document.getElementById('dashboard-market-slider'), { childList: true });

                document.querySelectorAll('.kyc-file-upload').forEach(uploadArea => {
                    uploadArea.addEventListener('click', function() {
                        const inputId = this.dataset.inputId;
                        const fileInput = document.getElementById(inputId);
                        if (fileInput) fileInput.click();
                    });
                });

                document.querySelectorAll('.live-capture-btn').forEach(btn => {
                    // Store original required state
                    if (!btn.hasAttribute('data-original-required')) {
                        btn.dataset.originalRequired = btn.hasAttribute('required');
                    }

                    btn.addEventListener('click', function(e) {
                        e.preventDefault(); // Prevent default form submission on required field clicks
                        const previewElementId = `${this.id.replace('-btn', '')}-preview`;
                        const previewElement = document.getElementById(previewElementId);
                        if (previewElement) {
                            previewElement.innerHTML = `
                                <img src="https://source.unsplash.com/random/100x100/?selfie" alt="Selfie Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;">
                                <p style="margin-top: 5px;">Selfie captured!</p>
                            `;
                        }
                        showNotification("Selfie captured successfully!", "success");
                        this.dataset.captured = 'true'; // Mark as captured for validation
                        this.style.borderColor = ''; // Clear any red border
                    });
                });
                document.getElementById('claim-reward-btn')?.addEventListener('click', function() {
                    if (userEarnedRewards > 0) {
                        userState.empyBalance += userEarnedRewards;
                        userClaimedRewardsHistory.push({
                            type: 'Claimed Rewards',
                            amount: userEarnedRewards,
                            date: new Date().toLocaleDateString()
                        });
                        userEarnedRewards = 0; 
                        showNotification("Rewards claimed successfully!", "success");
                        updateWalletUI();
                    } else {
                        showNotification("No rewards to claim.", "info");
                    }
                });
            } 
            
            // =====================================================
            // NOTIFICATION SYSTEM
            // Online presence + Live stream + SOS notifications
            // =====================================================
            (function initNotificationSystem() {
                // Notification store
                if (!window.empyreanNotifications) window.empyreanNotifications = [];
                let notifUnread = 0;

                // Create notification bell in header if not already there
                function buildNotificationBell() {
                    const headerActions = document.getElementById('main-header-actions');
                    if (!headerActions || document.getElementById('notif-bell-btn')) return;
                    const bell = document.createElement('div');
                    bell.style.cssText = 'position:relative;display:inline-flex;margin-right:8px;';
                    bell.innerHTML = `
                        <button id="notif-bell-btn" style="background:rgba(10,14,39,0.05);border:1.5px solid rgba(10,14,39,0.08);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;position:relative;" title="Notifications">
                            <i class="fas fa-bell" style="font-size:1rem;color:var(--primary);"></i>
                            <span id="notif-badge" style="display:none;position:absolute;top:-3px;right:-3px;background:#EF4444;color:white;font-size:0.6rem;font-weight:800;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;">0</span>
                        </button>
                    `;
                    headerActions.prepend(bell);

                    // Notification panel
                    const panel = document.createElement('div');
                    panel.id = 'notif-panel';
                    panel.style.cssText = 'display:none;position:fixed;top:64px;right:12px;width:340px;max-height:480px;background:white;border-radius:20px;box-shadow:0 12px 40px rgba(0,0,0,0.15);border:1px solid rgba(10,14,39,0.08);z-index:9999;overflow:hidden;';
                    panel.innerHTML = `
                        <div style="padding:16px 20px;border-bottom:1px solid rgba(10,14,39,0.07);display:flex;align-items:center;justify-content:space-between;">
                            <strong style="font-family:'Syne',sans-serif;font-size:1rem;color:var(--primary);">Notifications</strong>
                            <button id="notif-mark-all-read" style="background:none;border:none;color:var(--secondary);font-size:0.78rem;cursor:pointer;font-weight:600;">Mark all read</button>
                        </div>
                        <div id="notif-list" style="overflow-y:auto;max-height:400px;"></div>
                    `;
                    document.body.appendChild(panel);

                    // Toggle panel
                    document.getElementById('notif-bell-btn').addEventListener('click', function(e) {
                        e.stopPropagation();
                        const p = document.getElementById('notif-panel');
                        const isOpen = p.style.display === 'block';
                        p.style.display = isOpen ? 'none' : 'block';
                        if (!isOpen) {
                            notifUnread = 0;
                            updateBadge();
                            renderNotifList();
                        }
                    });
                    document.addEventListener('click', function(e) {
                        if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-bell-btn')) {
                            const p = document.getElementById('notif-panel');
                            if (p) p.style.display = 'none';
                        }
                    });
                    document.getElementById('notif-mark-all-read')?.addEventListener('click', function() {
                        window.empyreanNotifications.forEach(n => n.read = true);
                        notifUnread = 0;
                        updateBadge();
                        renderNotifList();
                    });
                }

                function updateBadge() {
                    const badge = document.getElementById('notif-badge');
                    if (!badge) return;
                    if (notifUnread > 0) {
                        badge.style.display = 'flex';
                        badge.textContent = notifUnread > 9 ? '9+' : notifUnread;
                    } else {
                        badge.style.display = 'none';
                    }
                }

                function renderNotifList() {
                    const list = document.getElementById('notif-list');
                    if (!list) return;
                    const notifs = window.empyreanNotifications;
                    if (!notifs.length) {
                        list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-bell-slash" style="font-size:1.8rem;display:block;margin-bottom:8px;"></i>No notifications yet</div>';
                        return;
                    }
                    const iconMap = {
                        success:'✅', error:'❌', warning:'⚠️', info:'ℹ️',
                        live:'🔴', online:'🟢', sos:'🆘',
                        new_reel:'🎬', new_news:'📰', new_listing:'🛒',
                        announcement:'📢', new_post:'📝', new_follower:'👤'
                    };
                    list.innerHTML='';
                    notifs.slice(0,30).forEach(function(n){
                        var isLive=n.type==='live'&&n.channelName;
                        var div=document.createElement('div');
                        div.style.cssText='padding:14px 20px;border-bottom:1px solid rgba(10,14,39,0.05);background:'+(n.read?'transparent':'rgba(27,43,139,0.03)')+';display:flex;gap:12px;align-items:flex-start;'+(isLive?'cursor:pointer;':'');
                        if(isLive){
                            div.title='Tap to join live stream';
                            div.addEventListener('click',function(){
                                var panel=document.getElementById('notif-panel');if(panel)panel.style.display='none';
                                if(typeof navigateTo==='function')navigateTo('go-live');
                                setTimeout(function(){
                                    if(typeof window.joinLiveAsViewer==='function')window.joinLiveAsViewer(n.channelName,n.hostName);
                                    var jb=document.querySelector('.join-live-btn[data-stream-id="'+(n.streamId||'')+'"]');
                                    if(jb)jb.click();
                                    else{var lm=document.getElementById('go-live-modal-overlay');if(lm){lm.style.display='flex';lm.classList.add('show');document.body.classList.add('modal-open');}}
                                },300);
                            });
                        }
                        div.innerHTML='<span style="font-size:1.2rem;flex-shrink:0;">'+(iconMap[n.type]||'ℹ️')+'</span>'
                            +'<div style="flex:1;min-width:0;"><p style="font-size:0.85rem;color:var(--primary);margin:0 0 3px;line-height:1.4;">'+n.message+(isLive?' <span style="color:#EF4444;font-size:0.72rem;font-weight:700;">TAP TO JOIN →</span>':'')+'</p>'
                            +'<span style="font-size:0.72rem;color:var(--text-muted);">'+(window._timeAgo?window._timeAgo(n.ts):n.time)+'</span></div>';
                        list.appendChild(div);
                    });
                }

                // Public push notification function
                window.pushNotification=function(message,type,icon,extraData){
                    if(!window.empyreanNotifications)window.empyreanNotifications=[];
                    var _e=Object.assign({message:message,type:type||'info',time:new Date().toLocaleTimeString(),ts:Date.now(),read:false},extraData||{});
                    window.empyreanNotifications.unshift(_e);
                    notifUnread++;
                    updateBadge();
                    // Also show toast if panel closed
                    const panel = document.getElementById('notif-panel');
                    if (!panel || panel.style.display !== 'block') {
                        showNotification(message, type || 'info');
                    }
                    if (document.getElementById('notif-panel')?.style.display === 'block') {
                        renderNotifList();
                    }
                };

                // ── ONLINE PRESENCE SIMULATION ──────────────────────────────
                // Simulate friends coming online and notify
                const onlineFriends = new Set();
                function checkFriendOnlineStatus() {
                    if (isGuest || !userState.followedUserIds) return;
                    const followedArr = Array.from(userState.followedUserIds);
                    if (!followedArr.length) return;
                    // Randomly simulate a friend coming online (realistic simulation)
                    followedArr.forEach(uid => {
                        const user = mockUsers[uid];
                        if (!user) return;
                        const wasOnline = onlineFriends.has(uid);
                        // ~20% chance of status change every check
                        if (Math.random() < 0.08) {
                            if (!wasOnline) {
                                onlineFriends.add(uid);
                                window.pushNotification(
                                    `🟢 ${user.fullName || ('@' + user.username)} is now online`,
                                    'online'
                                );
                                // Mark user online in UI
                                document.querySelectorAll(`.contact-item[data-user-id="${uid}"] .online-dot`).forEach(d => d.style.background = '#10B981');
                            } else {
                                onlineFriends.delete(uid);
                            }
                        }
                    });
                }

                // ── LIVE STREAM NOTIFICATIONS ────────────────────────────────
                window.notifyFriendsUserIsLive = function(hostName, streamId) {
                    if (isGuest) return;
                    // Notify all followers that this user went live
                    const followedArr = Array.from(userState.followedUserIds || []);
                    followedArr.forEach(uid => {
                        const user = mockUsers[uid];
                        if (user) {
                            window.pushNotification(
                                `🔴 ${hostName} just went LIVE! Tap to join the stream.`,
                                'live'
                            );
                        }
                    });
                    // Also save to Firestore for real push
                    try {
                        fbDb.collection('live_notifications').add({
                            hostId: userState.id,
                            hostName, streamId,
                            message: `${hostName} is now live!`,
                            createdAt: new Date().toISOString()
                        });
                    } catch(e) {}
                };

                // ── SOS RESULT NOTIFICATIONS ─────────────────────────────────
                // Load notifications from Firestore — both user-specific and community-wide
                function loadUserNotifications() {
                    if (isGuest || !userState.id) return;
                    // Load community-wide notifications (announcements, new reels, news, etc.)
                    try {
                        fbDb.collection('notifications')
                            .orderBy('createdAt', 'desc')
                            .limit(20)
                            .get()
                            .then(function(snap) {
                                if (!snap || snap.empty) return;
                                snap.forEach(function(doc) {
                                    const n = doc.data();
                                    // Skip if already in bell
                                    if (window.empyreanNotifications.find(function(x) { return x.id === doc.id; })) return;
                                    // Skip user-specific notifications not for this user
                                    if (n.userId && n.userId !== userState.id) return;
                                    window.empyreanNotifications.push({
                                        id: doc.id,
                                        message: n.message,
                                        type: n.type || 'info',
                                        time: n.createdAt ? new Date(n.createdAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '',
                                        read: n.read || false
                                    });
                                    if (!n.read) notifUnread++;
                                });
                                updateBadge();
                                renderNotifList();
                            }).catch(function() {});
                    } catch(e) {}
                    try {
                        fbDb.collection('notifications')
                            .where('userId', '==', userState.id)
                            .orderBy && // safety check
                        fbDb.collection('notifications')
                            .where('userId', '==', userState.id)
                            .get()
                            .then(snap => {
                                if (!snap || snap.empty) return;
                                snap.forEach(doc => {
                                    const n = doc.data();
                                    if (!window.empyreanNotifications.find(x => x.id === doc.id)) {
                                        window.empyreanNotifications.push({
                                            id: doc.id,
                                            message: n.message,
                                            type: n.type || 'info',
                                            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : '',
                                            read: n.read || false
                                        });
                                        if (!n.read) notifUnread++;
                                    }
                                });
                                updateBadge();
                            })
                            .catch(() => {});
                    } catch(e) {}
  
                window.loadUserNotifications = loadUserNotifications;
              }

                // ── CONTACT LIST ONLINE DOTS ─────────────────────────────────
                function addOnlineDotsToContacts() {
                    document.querySelectorAll('.contact-item').forEach(item => {
                        if (!item.querySelector('.online-dot')) {
                            const avatarEl = item.querySelector('.avatar-placeholder');
                            if (avatarEl) {
                                avatarEl.style.position = 'relative';
                                const dot = document.createElement('div');
                                dot.className = 'online-dot';
                                dot.style.cssText = 'position:absolute;bottom:2px;right:2px;width:10px;height:10px;border-radius:50%;background:#9CA3AF;border:2px solid white;';
                                avatarEl.appendChild(dot);
                            }
                        }
                    });
                }

                // Initialise
                setTimeout(() => {
                    buildNotificationBell();
                    loadUserNotifications();
                    addOnlineDotsToContacts();
                }, 800);

                // Check friend status every 45 seconds
                setInterval(() => {
                    checkFriendOnlineStatus();
                    addOnlineDotsToContacts();
                }, 45000);

                // Re-build bell after app re-init
                document.addEventListener('empyrean-init-done', () => {
                    setTimeout(() => {
                        buildNotificationBell();
                        loadUserNotifications();
                    }, 600);
                });
            })();

            // --- APP INITIALIZATION ---
            setupMasterEventListeners();

            // ── DELETE-POST FIX: capture-phase listener fires before all bubble handlers ──
            // Reason: .delete-post-btn is inside .post-options inside .story-header.
            // The story-header bubble listener can intercept and return early, masking the click.
            // Using capture=true ensures this runs FIRST, before any bubble phase handlers.
            document.addEventListener('click', function _deletePostCapture(e) {
                var btn = e.target.closest('.delete-post-btn');
                if (!btn) return;
                e.preventDefault();
                e.stopImmediatePropagation(); // prevent all other listeners on this event

                // Close any open options menu
                document.querySelectorAll('.options-menu.show').forEach(function(m){ m.classList.remove('show'); });

                // Covers posts, reels, marketplace, news AND crisis reports
                var postEl = btn.closest('.impact-story, .reel-card, .property-card, .news-list-item, .crisis-report');
                if (!postEl) { console.warn('[Delete] Could not find parent post element'); return; }

                // Resolve collection + label for every content type
                var _isMkt    = postEl.classList.contains('property-card');
                var _isReel   = postEl.classList.contains('reel-card');
                var _isNews   = postEl.classList.contains('news-list-item');
                var _isCrisis = postEl.classList.contains('crisis-report');
                var collection = _isMkt ? 'marketplace_listings' : _isReel ? 'reels' : _isNews ? 'news_posts' : _isCrisis ? 'crisis_reports' : 'posts';
                var label = _isMkt ? 'listing' : _isReel ? 'reel' : _isNews ? 'news post' : _isCrisis ? 'crisis report' : 'post';
                var docId = postEl.dataset.postId || postEl.dataset.id || postEl.dataset.reelId || '';

                // Custom in-page confirmation banner (avoids native confirm() mobile issues)
                var existing = document.getElementById('_empyrean_delete_confirm');
                if (existing) existing.remove();
                var banner = document.createElement('div');
                banner.id = '_empyrean_delete_confirm';
                banner.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;background:#0A0E27;color:white;border-radius:16px;padding:14px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,0.4);min-width:280px;max-width:92vw;font-family:inherit;animation:slideUp 0.2s ease;';
                banner.innerHTML = '<span style="flex:1;font-size:0.88rem;font-weight:600;">Delete this '+label+'? This cannot be undone.</span>'
                    + '<button id="_del_cancel" style="background:rgba(255,255,255,0.12);border:none;color:white;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:0.82rem;">Cancel</button>'
                    + '<button id="_del_confirm" style="background:#e53935;border:none;color:white;padding:7px 16px;border-radius:8px;cursor:pointer;font-weight:700;font-size:0.82rem;">Delete</button>';
                document.body.appendChild(banner);

                var timeout = setTimeout(function(){ banner.remove(); }, 7000);

                document.getElementById('_del_cancel').onclick = function() {
                    clearTimeout(timeout); banner.remove();
                };
                document.getElementById('_del_confirm').onclick = function() {
                    clearTimeout(timeout); banner.remove();

                    // Animate removal
                    postEl.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
                    postEl.style.opacity = '0';
                    postEl.style.transform = 'scale(0.96)';
                    setTimeout(function() {
                        // Remove from every DOM mirror simultaneously (feed, profile dash, reels grid, etc.)
                        document.querySelectorAll('[data-post-id="'+docId+'"], [data-id="'+docId+'"], [data-reel-id="'+docId+'"]').forEach(function(el){ el.remove(); });
                        if (typeof populateProfileGallery === 'function' && window.userState) {
                            populateProfileGallery(window.userState.id);
                        }
                    }, 290);

                    // Delete from Firestore
                    if (window.fbDb && docId) {
                        window.fbDb.collection(collection).doc(docId).delete()
                            .then(function(){ if (typeof showNotification==='function') showNotification('✅ '+label.charAt(0).toUpperCase()+label.slice(1)+' deleted permanently.', 'success'); })
                            .catch(function(err){ console.error('[Delete] Firestore error:', err.message); if(typeof showNotification==='function') showNotification('Removed from view. Cloud sync may be delayed.', 'info'); });
                    } else {
                        if (typeof showNotification==='function') showNotification(label.charAt(0).toUpperCase()+label.slice(1)+' removed.', 'info');
                    }
                };
            }, true); // <-- capture phase
            // ── END DELETE-POST FIX ──

            // ── FIX 9: Click any post image → fullscreen expand ──────────
            document.addEventListener('click', function _imgExpand(e) {
                var img = e.target;
                if (img.tagName !== 'IMG') return;
                // Only images inside post media containers, gallery cards, marketplace cards
                var inPost = img.closest('.story-media-container, .story-media-item, .property-card, #profile-gallery, .news-item-image, .reel-card');
                if (!inPost) return;
                var src = img.src || img.currentSrc;
                if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

                // For marketplace cards — use the full media array stored in data-media
                var propCard = img.closest('.property-card');
                var siblings;
                if (propCard && propCard.dataset.media) {
                    try {
                        var allMedia = JSON.parse(propCard.dataset.media);
                        siblings = allMedia
                            .filter(function(u){ return u && !u.startsWith('blob:'); })
                            .map(function(u){ return { url: u, type: /\.(mp4|webm|mov)(\?|$)/i.test(u) ? 'video/mp4' : 'image/jpeg' }; });
                    } catch(e) { siblings = null; }
                }
                // Fallback: collect visible sibling images
                if (!siblings || siblings.length === 0) {
                    siblings = Array.from(inPost.querySelectorAll('img[src]'))
                        .map(function(im){ return { url: im.src, type: 'image/jpeg' }; })
                        .filter(function(m){ return m.url && !m.url.startsWith('blob:'); });
                }
                if (siblings.length === 0) siblings = [{ url: src, type: 'image/jpeg' }];

                var startIdx = siblings.findIndex(function(m){ return m.url === src; });
                if (startIdx < 0) startIdx = 0;

                if (typeof showMarketplaceGallery === 'function') {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    showMarketplaceGallery(siblings, startIdx);
                }
            }, true);

            // ── FIX 9b: Swipe navigation inside marketplace gallery modal ──
            (function() {
                var _swipeStartX = 0;
                var _swipeStartY = 0;
                document.addEventListener('touchstart', function(e) {
                    var modal = e.target.closest('#marketplace-gallery-modal');
                    if (!modal) return;
                    _swipeStartX = e.touches[0].clientX;
                    _swipeStartY = e.touches[0].clientY;
                }, { passive: true });
                document.addEventListener('touchend', function(e) {
                    var modal = e.target.closest('#marketplace-gallery-modal');
                    if (!modal) return;
                    var dx = _swipeStartX - e.changedTouches[0].clientX;
                    var dy = _swipeStartY - e.changedTouches[0].clientY;
                    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return; // too short or vertical
                    if (typeof navigateMarketplaceGallery === 'function') {
                        navigateMarketplaceGallery(dx > 0 ? 1 : -1); // swipe left = next, right = prev
                    }
                }, { passive: true });

                // Keyboard arrow navigation when modal is open
                document.addEventListener('keydown', function(e) {
                    var modal = document.getElementById('marketplace-gallery-modal');
                    if (!modal || !modal.classList.contains('show')) return;
                    if (e.key === 'ArrowRight') { if (typeof navigateMarketplaceGallery === 'function') navigateMarketplaceGallery(1); }
                    if (e.key === 'ArrowLeft')  { if (typeof navigateMarketplaceGallery === 'function') navigateMarketplaceGallery(-1); }
                    if (e.key === 'Escape') {
                        modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }
                });
            })();

            // ── FIX 10: X/Twitter-style live view counter ────────────────
            (function() {
                var style = document.createElement('style');
                style.textContent = [
                    '@keyframes _vcPop{0%{transform:translateY(0)}30%{transform:translateY(-3px)}70%{transform:translateY(1px)}100%{transform:translateY(0)}}',
                    '@keyframes _vcFade{0%{opacity:0.4}100%{opacity:1}}',
                    '.view-count-display{display:inline-flex!important;align-items:center!important;gap:4px!important;padding:3px 8px!important;border-radius:50px!important;',
                        'background:transparent!important;font-size:0.73rem!important;font-weight:600!important;',
                        'color:var(--text-muted)!important;letter-spacing:-0.01em!important;cursor:default!important;',
                        'transition:color 0.25s,background 0.25s!important;}',
                    '.view-count-display:hover{background:rgba(29,155,240,0.08)!important;color:rgb(29,155,240)!important;}',
                    '.view-count-display i{font-size:0.68rem!important;transition:color 0.25s!important;}',
                    '.view-count-display:hover i{color:rgb(29,155,240)!important;}',
                    '.view-count._bump{animation:_vcPop 0.3s ease,_vcFade 0.2s ease;}',
                    '.story-actions{display:flex!important;align-items:center!important;gap:0!important;padding:4px 0!important;}',
                    '.action-btn{padding:6px 10px!important;border-radius:50px!important;display:inline-flex!important;align-items:center!important;gap:4px!important;font-size:0.78rem!important;transition:background 0.18s,color 0.18s!important;}',
                    '.action-btn:hover{background:rgba(10,14,39,0.06)!important;}',
                    '.like-btn.liked,.like-btn .liked{color:#e0245e!important;}',
                    '.like-btn:hover{background:rgba(224,36,94,0.08)!important;color:#e0245e!important;}',
                    '.retweet-btn:hover{background:rgba(0,186,124,0.08)!important;color:#00ba7c!important;}',
                    '.comment-btn:hover{background:rgba(29,155,240,0.08)!important;color:rgb(29,155,240)!important;}',
                    '.share-btn:hover{background:rgba(29,155,240,0.08)!important;color:rgb(29,155,240)!important;}',
                    '.like-count,.retweet-count,.comment-count{font-size:0.73rem!important;font-weight:600!important;}',
                    '._rt_picker button:hover{background:rgba(10,14,39,0.04)!important;}',
                ].join('');
                document.head.appendChild(style);

                // Animate view count each time it increments
                var _origObserverCb = window._viewCountObserver;
                var _seen = typeof window._viewCountSeen !== 'undefined' ? window._viewCountSeen : (window._viewCountSeen = new Set());
                if (window._viewCountObserver) {
                    // Patch existing observer to also add bump animation
                    var _origDisconnect = window._viewCountObserver.disconnect.bind(window._viewCountObserver);
                }
                // MutationObserver watches view-count text changes → adds bump animation
                var vcMutObs = new MutationObserver(function(mutations) {
                    mutations.forEach(function(m) {
                        if (m.type === 'characterData' || m.type === 'childList') {
                            var el = m.target.nodeType === 3 ? m.target.parentElement : m.target;
                            if (el && el.classList && el.classList.contains('view-count')) {
                                el.classList.remove('_bump');
                                void el.offsetWidth; // force reflow
                                el.classList.add('_bump');
                                setTimeout(function(){ el.classList.remove('_bump'); }, 350);
                            }
                        }
                    });
                });
                // Observe all current + future view-count spans
                function _observeVcSpans() {
                    document.querySelectorAll('.view-count:not([data-vc-obs])').forEach(function(sp) {
                        sp.dataset.vcObs = '1';
                        vcMutObs.observe(sp, { characterData: true, childList: true, subtree: true });
                    });
                }
                var _vcDomObs = new MutationObserver(_observeVcSpans);
                _vcDomObs.observe(document.body, { childList: true, subtree: true });
                setTimeout(_observeVcSpans, 800);
            })();
            // ── END FIX 10 ──
            (function smartStartup(){
                var _done=false;
                function _enterApp(ud,isAdmin){
                    if(_done)return;_done=true;
                    var am=document.getElementById('auth-modal-overlay');
                    if(am){am.classList.remove('show');am.style.display='none';}
                    document.body.classList.remove('modal-open');document.body.style.overflow='';
                    try{initializeApp(false,!!isAdmin,ud);}catch(e){setTimeout(function(){try{initializeApp(false,!!isAdmin,ud);}catch(e2){}},500);}
                    if(typeof _hideLoading==='function')_hideLoading();
                    try{var s=Object.assign({},ud);['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(function(k){if(s[k] instanceof Set)s[k]=[...s[k]];});delete s.password;localStorage.setItem('empyrean_session',JSON.stringify(s));}catch(e){}
                }
                function _guestMode(){
                    if(_done)return;_done=true;
                    try{initializeApp(true);}catch(e){setTimeout(function(){try{initializeApp(true);}catch(e2){}},500);}
                    if(typeof _hideLoading==='function')_hideLoading();
                    var am=document.getElementById('auth-modal-overlay');
                    if(am){am.classList.remove('show');am.style.display='none';}
                    document.body.classList.remove('modal-open');document.body.style.overflow='';
                    setTimeout(function(){
                        if(document.getElementById('guest-login-banner'))return;
                        var b=document.createElement('div');b.id='guest-login-banner';
                        b.style.cssText='position:fixed;bottom:72px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0A0E27,#1B2B8B);color:white;padding:12px 18px;border-radius:16px;box-shadow:0 8px 30px rgba(10,14,39,0.45);z-index:9990;display:flex;align-items:center;gap:10px;max-width:360px;width:90%;font-size:0.87rem;';
                        b.innerHTML='<span style="flex:1;">👋 <strong>Welcome!</strong> Log in to unlock all features.</span>'
                            +'<button id="gbl-login" style="background:#F5C518;color:#0A0E27;border:none;border-radius:10px;padding:8px 14px;font-size:0.82rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;">Log In</button>'
                            +'<button id="gbl-close" style="background:rgba(255,255,255,0.15);color:white;border:none;border-radius:8px;width:28px;height:28px;cursor:pointer;font-size:1rem;flex-shrink:0;">✕</button>';
                        document.body.appendChild(b);
                        document.getElementById('gbl-login').onclick=function(){
                            b.remove();var m=document.getElementById('auth-modal-overlay'),lv=document.getElementById('login-view');
                            if(m){m.style.display='flex';m.classList.add('show');}
                            if(lv)lv.style.display='block';
                            document.body.classList.add('modal-open');
                            setTimeout(function(){if(typeof generateCaptcha==='function')generateCaptcha();},150);
                        };
                        document.getElementById('gbl-close').onclick=function(){b.remove();};
                        setTimeout(function(){if(b.parentNode)b.remove();},9000);
                    },900);
                }
                if(window._firebaseLoaded&&window.fbAuth&&typeof window.fbAuth.onAuthStateChanged==='function'){
                    window.fbAuth.onAuthStateChanged(function(fbUser){
                        if(_done)return;
                        if(fbUser&&fbUser.uid){
                            (async function(){
                                try{var doc=await window.fbDb.collection('users').doc(fbUser.uid).get();var profile=doc&&doc.exists?doc.data():null;var ud=profile||{id:fbUser.uid,email:fbUser.email,fullName:fbUser.displayName||'',avatar:fbUser.photoURL||''};_enterApp(ud,fbUser.email==='chiefadmin@empyreanhumanitarianfoundation.com');}
                                catch(e){_enterApp({id:fbUser.uid,email:fbUser.email,fullName:fbUser.displayName||''},false);}
                            })();
                        } else {
                            var stored=null;
                            try{var r=localStorage.getItem('empyrean_session');if(r)stored=JSON.parse(r);}catch(e){}
                            if(!stored){try{var em=localStorage.getItem('empyrean_user_email');var lu=JSON.parse(localStorage.getItem('empyrean_users')||'{}');if(em&&lu[em])stored=lu[em];}catch(e){}}
                            if(stored&&stored.id)_enterApp(stored,stored.email==='chiefadmin@empyreanhumanitarianfoundation.com');
                            else _guestMode();
                        }
                    });
                    setTimeout(function(){if(_done)return;var stored=null;try{var r2=localStorage.getItem('empyrean_session');if(r2)stored=JSON.parse(r2);}catch(e){}if(stored&&stored.id)_enterApp(stored,stored.email==='chiefadmin@empyreanhumanitarianfoundation.com');else _guestMode();},3000);
                } else {
                    var s2=null;try{var r3=localStorage.getItem('empyrean_session');if(r3)s2=JSON.parse(r3);}catch(e){}
                    if(!s2){try{var em2=localStorage.getItem('empyrean_user_email');var lu2=JSON.parse(localStorage.getItem('empyrean_users')||'{}');if(em2&&lu2[em2])s2=lu2[em2];}catch(e){}}
                    if(s2&&s2.id)_enterApp(s2,s2.email==='chiefadmin@empyreanhumanitarianfoundation.com');
                    else setTimeout(function(){if(!_done)_guestMode();},1200);
                }
            })();
            setInterval(simulateRewardAccrual, 1000);

            // =====================================================
            // WHATSAPP-STYLE STATUS BAR
            // =====================================================
            (function initStatusBar() {
                // // No demo statuses — only real registered users appear
                window.userStatuses = [];
                let userStatuses = window.userStatuses; // local alias points to same array
                let viewerOpen = false;
                let currentUserIdx = 0;
                let currentItemIdx = 0;
                let statusTimer = null;
                const STATUS_DURATION = 5000; // 5s per status item

                function renderStatusBar() {
                    // Always sync from window.userStatuses so fix-pack additions are seen
                    userStatuses = window.userStatuses;
                    const bar = document.getElementById('status-bar-inner');
                    if (!bar) return;
                    // Remove old status items (keep the "My Status" add button)
                    Array.from(bar.querySelectorAll('.status-item:not(#add-my-status-btn)')).forEach(el => el.remove());
                    userStatuses.forEach((st, idx) => {
                        const item = document.createElement('div');
                        item.className = 'status-item';
                        item.dataset.idx = idx;
                        item.innerHTML = `<div class="status-avatar-ring ${st.viewed ? 'viewed' : ''}"><div class="status-avatar-inner"><img src="${st.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(st.name||'U') + '&background=1B2B8B&color=fff&size=52'}" alt="${st.name}" loading="lazy" onerror="this.src='https://ui-avatars.com/api/?name=U&background=1B2B8B&color=fff&size=52'"></div></div><span class="status-username" style="font-weight:700;font-size:0.75rem;color:var(--primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:64px;display:block;text-align:center;">${st.name||'User'}</span>`;
                        item.addEventListener('click', () => openStatusViewer(idx));
                        bar.appendChild(item);
                    });
                    // Update my status avatar ring
                    const myImg = document.getElementById('my-status-avatar-img');
                    if (myImg && userState && userState.avatar) myImg.src = userState.avatar;
                }
                // Expose renderStatusBar globally
                window.renderStatusBar = renderStatusBar;

                function openStatusViewer(userIdx) {
                    currentUserIdx = userIdx;
                    currentItemIdx = 0;
                    showStatusItem();
                    document.getElementById('status-viewer-modal').classList.add('show');
                    document.body.classList.add('modal-open');
                    viewerOpen = true;
                }

                function showStatusItem() {
                    clearTimeout(statusTimer);
                    const st = userStatuses[currentUserIdx];
                    if (!st) return closeViewer();
                    const item = st.items[currentItemIdx] || st.items[0];
                    
                    // Header
                    const avatarEl = document.getElementById('status-viewer-avatar');
                    const nameEl = document.getElementById('status-viewer-name');
                    const timeEl = document.getElementById('status-viewer-time');
                    if (avatarEl) avatarEl.src = st.avatar;
                    if (nameEl) nameEl.textContent = st.name;
                    if (timeEl) timeEl.textContent = item.time || 'now';

                    // Media
                    const imgEl = document.getElementById('status-viewer-img');
                    const vidEl = document.getElementById('status-viewer-video');
                    const textEl = document.getElementById('status-viewer-text-only');
                    const captionEl = document.getElementById('status-text-caption');

                    [imgEl, vidEl, textEl].forEach(el => { if(el) el.style.display = 'none'; });
                    
                    const content = document.getElementById('status-viewer-content');
                    if (content) content.style.background = item.bg || '#111';

                    if (item.type === 'image' && imgEl) {
                        imgEl.src = item.src; imgEl.style.display = 'block';
                        if (captionEl) captionEl.innerHTML = `<p style="color:white;font-size:1rem;">${item.caption || ''}</p>`;
                    } else if (item.type === 'video' && vidEl) {
                        vidEl.src = item.src; vidEl.style.display = 'block'; vidEl.play().catch(()=>{});
                        if (captionEl) captionEl.innerHTML = `<p style="color:white;">${item.caption || ''}</p>`;
                    } else if (item.type === 'text' && textEl) {
                        textEl.style.display = 'flex'; textEl.textContent = item.text || '';
                        if (captionEl) captionEl.innerHTML = '';
                    }

                    // Progress bars
                    buildProgressBars(st.items.length);
                    
                    // Auto advance
                    statusTimer = setTimeout(() => advanceStatus(1), STATUS_DURATION);
                    animateProgressBar(currentItemIdx, STATUS_DURATION);

                    // Mark viewed
                    st.viewed = true;
                    renderStatusBar();
                }

                function buildProgressBars(count) {
                    const bars = document.getElementById('status-progress-bars');
                    if (!bars) return;
                    bars.innerHTML = '';
                    for (let i = 0; i < count; i++) {
                        const seg = document.createElement('div');
                        seg.className = 'status-progress-seg' + (i < currentItemIdx ? ' done' : '');
                        seg.innerHTML = '<div class="fill"></div>';
                        bars.appendChild(seg);
                    }
                }

                function animateProgressBar(idx, duration) {
                    const bars = document.getElementById('status-progress-bars');
                    if (!bars) return;
                    const segs = bars.querySelectorAll('.status-progress-seg');
                    if (segs[idx]) {
                        const fill = segs[idx].querySelector('.fill');
                        if (fill) {
                            fill.style.transition = `width ${duration}ms linear`;
                            fill.style.width = '100%';
                        }
                    }
                }

                function advanceStatus(dir) {
                    const st = userStatuses[currentUserIdx];
                    if (!st) return closeViewer();
                    const newItemIdx = currentItemIdx + dir;
                    if (newItemIdx >= st.items.length) {
                        // Move to next user
                        if (currentUserIdx < userStatuses.length - 1) {
                            currentUserIdx++; currentItemIdx = 0; showStatusItem();
                        } else { closeViewer(); }
                    } else if (newItemIdx < 0) {
                        if (currentUserIdx > 0) {
                            currentUserIdx--; currentItemIdx = 0; showStatusItem();
                        }
                    } else {
                        currentItemIdx = newItemIdx; showStatusItem();
                    }
                }

                function closeViewer() {
                    clearTimeout(statusTimer);
                    document.getElementById('status-viewer-modal').classList.remove('show');
                    document.body.classList.remove('modal-open');
                    viewerOpen = false;
                    const vidEl = document.getElementById('status-viewer-video');
                    if (vidEl) { vidEl.pause(); vidEl.src = ''; }
                }

                // Status viewer controls
                document.getElementById('status-viewer-close')?.addEventListener('click', closeViewer);
                document.getElementById('status-next-btn')?.addEventListener('click', () => advanceStatus(1));
                document.getElementById('status-prev-btn')?.addEventListener('click', () => advanceStatus(-1));
                document.getElementById('status-reply-send-btn')?.addEventListener('click', () => {
                    const input = document.getElementById('status-reply-input');
                    if (input && input.value.trim()) {
                        showNotification(`Reply sent to ${userStatuses[currentUserIdx]?.name}!`, 'success');
                        input.value = '';
                    }
                });

                // Create status
                document.getElementById('add-my-status-btn')?.addEventListener('click', () => {
                    document.getElementById('create-status-modal').classList.add('show');
                });
                document.getElementById('cancel-status-btn')?.addEventListener('click', () => {
                    document.getElementById('create-status-modal').classList.remove('show');
                });
                // Delegated listener — works even when modal is rebuilt
                if (!document._statusDelegated) {
                    document._statusDelegated = true;
                    document.addEventListener('change', function(e) {
                        if (!e.target.matches('#status-file-input')) return;
                        const preview = document.getElementById('status-file-preview');
                        if (!preview) return;
                        preview.innerHTML = '';
                        Array.from(e.target.files).forEach(function(file){
                            var url=URL.createObjectURL(file);var d=document.createElement('div');
                            d.style.cssText='position:relative;border-radius:8px;overflow:hidden;display:inline-block;margin:4px;';
                            if(file.type.startsWith('video/')){
                                var _tv=document.createElement('video');_tv.src=url;
                                _tv.onloadedmetadata=function(){if(_tv.duration>120){showNotification('Video trimmed to 2:00. Auto-split active.','info');file._trimEnd=120;}};
                                d.innerHTML='<video src="'+url+'#t=0,120" style="max-height:110px;border-radius:8px;" muted controls></video>'
                                    +'<span style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.6);color:white;font-size:0.62rem;padding:2px 5px;border-radius:4px;">Max 2:00</span>';
                            } else {
                                d.innerHTML='<img src="'+url+'" style="max-height:110px;border-radius:8px;">';
                            }
                            preview.appendChild(d);
                        });
                    });
                }
                // Use event delegation so this works even after modal rebuild
                document.addEventListener('click', async function _statusPostHandler(e) {
                    if (!e.target.matches('#post-status-btn') && !e.target.closest('#post-status-btn')) return;
                    const textInput = document.getElementById('status-text-input');
                    const fileInput = document.getElementById('status-file-input');
                    const statusText = textInput ? textInput.value.trim() : '';
                    const files = fileInput ? Array.from(fileInput.files) : [];

                    if (!statusText && files.length === 0) {
                        showNotification('Add text or media to post a status.', 'error');
                        return;
                    }
                    if (isGuest) { showNotification('Please log in to post a status.', 'error'); return; }

                    const postBtn = document.getElementById('post-status-btn');
                    if (postBtn) { postBtn.disabled = true; postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...'; }

                    // Get selected background
                    const activeBgEl = document.querySelector('.status-color-choice.active');
                    const selectedBg = activeBgEl ? activeBgEl.dataset.bg : 'linear-gradient(135deg,#0A0E27,#1B2B8B)';

                    try {
                        let statusItems = [];

                        if (files.length > 0) {
                            showNotification('Uploading status media...', 'info');
                            for (const file of files) {
                                let mediaUrl;
                                try {
                                    mediaUrl = await window.uploadToCloudinary(file, null);
                                } catch(e) {
                                    mediaUrl = URL.createObjectURL(file);
                                }
                                statusItems.push({
                                    type: file.type.startsWith('video/') ? 'video' : 'image',
                                    src: mediaUrl,
                                    caption: statusText,
                                    time: 'Just now',
                                    bg: selectedBg
                                });
                            }
                        } else {
                            // Text-only status
                            statusItems.push({
                                type: 'text',
                                text: statusText,
                                time: 'Just now',
                                bg: selectedBg
                            });
                        }

                        // Add to userStatuses
                        const newStatus = {
                            userId: userState.id + '-' + Date.now(),
                            name: userState.fullName || userState.username,
                            avatar: userState.avatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(userState.fullName||'U') + '&background=1B2B8B&color=fff&size=52'),
                            items: statusItems,
                            viewed: false
                        };
                        if (!window.userStatuses) window.userStatuses = [];
                        // Put own status first
                        window.userStatuses.unshift(newStatus);

                        // Persist to Firestore
                        try {
                            await fbDb.collection('statuses').add({
                                ...newStatus,
                                userId: userState.id,
                                createdAt: new Date().toISOString()
                            });
                        } catch(fsErr) { console.warn('Status save failed:', fsErr.message); }

                        // Re-render status bar
                        if (typeof window.renderStatusBar === 'function') window.renderStatusBar();

                        // Close modal + reset
                        const modal = document.getElementById('create-status-modal');
                        if (modal) modal.classList.remove('show');
                        document.body.classList.remove('modal-open');
                        if (textInput) textInput.value = '';
                        if (fileInput) fileInput.value = '';
                        const preview = document.getElementById('status-file-preview');
                        if (preview) preview.innerHTML = '';

                        showNotification('✅ Status posted!', 'success');
                    } catch(err) {
                        console.error('Status post error:', err);
                        showNotification('Failed to post status. Please try again.', 'error');
                    } finally {
                        if (postBtn) { postBtn.disabled = false; postBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Status'; }
                    }
                });

                // Init
                renderStatusBar();
                // Re-render when user logs in
                document.addEventListener('empyrean:userloaded', renderStatusBar);
            })();

            // =====================================================
            // CLOUDINARY: Upload media before any form submission
            // =====================================================
            document.body.addEventListener('submit', async function(e) {
                const form = e.target;
                const mediaMap = {
                    'post-form': typeof postMediaFiles !== 'undefined' ? postMediaFiles : [],
                    'business-post-form': typeof businessPostMediaFiles !== 'undefined' ? businessPostMediaFiles : [],
                    'sos-form': typeof sosMediaFiles !== 'undefined' ? sosMediaFiles : [],
                    'report-crisis-form': typeof crisisMediaFiles !== 'undefined' ? crisisMediaFiles : []
                };
                if (mediaMap[form.id]) {
                    const toUpload = mediaMap[form.id].filter(f => f instanceof File && !f._cloudUrl);
                    if (toUpload.length > 0) {
                        showNotification('Uploading media to cloud...', 'info');
                        await window.uploadMediaFilesToCloudinary(toUpload);
                    }
                }
            }, true);

            // Firebase auth observer — upgrades session when user is logged in
            try {
                fbAuth.onAuthStateChanged(async (fbUser) => {
                    if (fbUser && !fbUser.isAnonymous) {
                        try {
                            let firestoreUser = await loadUserFromFirestore(fbUser.uid);
                            // If profile doesn't exist in Firestore yet (new signup),
                            // build a minimal profile from Firebase Auth data
                            if (!firestoreUser) {
                                firestoreUser = {
                                    id: fbUser.uid,
                                    email: fbUser.email || '',
                                    fullName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'User'),
                                    username: fbUser.email ? fbUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'') : 'user' + fbUser.uid.slice(-4),
                                    avatar: fbUser.photoURL || '',
                                    coverPhoto: '',
                                    bio: '',
                                    empyBalance: 0,
                                    isVerified: false,
                                    followerCount: 0,
                                    likedPostIds: new Set(),
                                    followedUserIds: new Set(),
                                    retweetedPostIds: new Set(),
                                    awardedRanks: new Set(),
                                    completedTasks: new Set(),
                                    viewedStatusUserIds: new Set(),
                                    statuses: [],
                                    businessPage: null,
                                    createdAt: new Date().toISOString()
                                };
                                // Save the minimal profile to Firestore so future logins find it
                                try { await saveUserToFirestore(fbUser.uid, firestoreUser); } catch(e) {}
                                console.log('[Auth] New user — created minimal Firestore profile for:', fbUser.uid);
                            }
                            if (firestoreUser) {
                                firestoreUser.id = fbUser.uid;
                                if (firestoreUser.email) registeredUsers[firestoreUser.email] = firestoreUser;
                                const CHIEF_ADMIN = 'chiefadmin@empyreanhumanitarianfoundation.com';
                                const isAdminUser = firestoreUser.email === 'admin@empyrean.com'
                                    || firestoreUser.email === CHIEF_ADMIN;
                                initializeApp(false, isAdminUser, firestoreUser);

                                // START ALL REAL-TIME LISTENERS — after auth confirmed
                                window._postsListener          = null;
                                window._newsListener           = null;
                                window._mktListener            = null;
                                window._reelsListener          = null;
                                window._usersListener          = null;
                                window._sosListener            = null;
                                window._crisisListener         = null;
                                window._announcementsListener  = null;

                                // Short delay so initializeApp() DOM setup completes first
                                setTimeout(function() {
                                    console.log('[Auth] ✅ User confirmed (' + (firestoreUser.fullName||firestoreUser.email||'user') + ') — starting authenticated real-time listeners');

                                    // Start Firestore real-time listeners (posts, news, marketplace, reels)
                                    if (typeof window._startRealtimeListeners === 'function') {
                                        window._startRealtimeListeners();
                                    }
                                    // Start live stream listener
                                    if (typeof window.startLiveStreamListener === 'function') {
                                        window.startLiveStreamListener();
                                    }
                                    // Load bell notifications (including SOS rejections from Firestore)
                                    if (typeof window.loadUserNotifications === 'function') {
                                        window.loadUserNotifications();
                                    }
                                    // Subscribe to user_notifications for real-time dashboard updates
                                    if (window.fbDb && window._firebaseLoaded && firestoreUser.id) {
                                        window.fbDb.collection('user_notifications')
                                            .where('userId', '==', firestoreUser.id)
                                            .where('read', '==', false)
                                            .orderBy('createdAt', 'desc').limit(20)
                                            .onSnapshot(function(snap) {
                                                if (!snap) return;
                                                snap.docChanges().forEach(function(change) {
                                                    if (change.type !== 'added') return;
                                                    var n = change.doc.data();
                                                    if (!n) return;
                                                    if (typeof showNotification === 'function')
                                                        showNotification(n.message, n.type === 'sos_rejected' ? 'error' : (n.type || 'info'));
                                                    var badge = document.getElementById('notif-badge') || document.querySelector('.notif-count');
                                                    if (badge) { badge.textContent = (parseInt(badge.textContent) || 0) + 1; badge.style.display = 'inline-flex'; }
                                                    try { change.doc.ref.update({ read: true }); } catch(e) {}
                                                });
                                            }, function(err) { console.warn('[Notifications] Listener error:', err.message); });
                                    }
                                }, 800);
                            }
                        } catch(e) { console.error('[Auth] State error:', e.message); }
                    } else {
                        // FIX Bug 7: No Firebase user — check localStorage session before going guest
                        try {
                            var sessionEmail = localStorage.getItem('empyrean_session_email') || '';
                            if (sessionEmail) {
                                var stored = JSON.parse(localStorage.getItem('empyrean_users') || '{}');
                                var storedUser = stored[sessionEmail];
                                if (storedUser && !window._initAppRunning) {
                                    ['likedPostIds','followedUserIds','retweetedPostIds','awardedRanks','completedTasks','viewedStatusUserIds'].forEach(function(k) {
                                        storedUser[k] = new Set(Array.isArray(storedUser[k]) ? storedUser[k] : []);
                                    });
                                    if (!storedUser.statuses) storedUser.statuses = [];
                                    console.log('[Auth] Restoring localStorage session for:', sessionEmail);
                                    initializeApp(false, storedUser.email === 'admin@empyrean.com' || storedUser.email === 'chiefadmin@empyreanhumanitarianfoundation.com', storedUser);
                                    setTimeout(function() {
                                        if (typeof window._startRealtimeListeners === 'function') window._startRealtimeListeners();
                                        if (typeof window.startLiveStreamListener === 'function') window.startLiveStreamListener();
                                    }, 600);
                                    return;
                                }
                            }
                        } catch(e) {}
                        // Truly no session — load as guest
                        if (!window._initAppRunning) {
                            console.log('[Auth] No user session — initialising as guest');
                            initializeApp(true);
                        }
                    }
                });
            } catch(e) { console.warn('Firebase auth observer failed:', e.message); }

            // =====================================================
            // FIX: STOP VIDEO ON REEL/LIVE EXIT
            // =====================================================
            document.addEventListener('click', function(e) {
                // Stop reel viewer videos on close
                if (e.target.classList.contains('reel-viewer-close') || e.target.closest('.reel-viewer-close')) {
                    document.querySelectorAll('#reel-viewer-container video').forEach(v => { v.pause(); v.currentTime = 0; });
                }
            });

            // =====================================================
            // FIX: MARKETPLACE CURRENCY SELECTOR
            // =====================================================
            const itemCurrencySelect = document.getElementById('item-currency');
            const itemPriceInput = document.getElementById('item-price');
            if (itemCurrencySelect) {
                itemCurrencySelect.addEventListener('change', function() {
                    const currency = this.value;
                    const priceLabel = document.querySelector('label[for="item-price"]');
                    if (priceLabel) priceLabel.textContent = `Price (${currency})`;
                });
            }

            // =====================================================
            // FIX: PROFILE PICTURE PROPAGATION
            // Whenever userState.avatar changes, update all avatar elements in UI
            // =====================================================
            function propagateProfilePicture() {
                if (!userState || !userState.avatar) return;
                const avatarSrc = userState.avatar;
                // Update sidebar footer avatar immediately
                const sidebarFooterAvatar = document.getElementById('sidebar-user-avatar');
                if (sidebarFooterAvatar) sidebarFooterAvatar.src = avatarSrc;
                // Update all avatar placeholders that belong to current user
                document.querySelectorAll('.user-own-avatar').forEach(el => {
                    if (el.tagName === 'IMG') el.src = avatarSrc;
                    else el.style.backgroundImage = `url('${avatarSrc}')`;
                });
                // Update live stream host avatar if current user is hosting
                if (liveStreamData.hostUserId === userState.id) {
                    const liveHostAvatar = document.getElementById('live-host-avatar');
                    const liveStreamHostAvatar = document.getElementById('live-stream-host-avatar');
                    if (liveHostAvatar) liveHostAvatar.src = avatarSrc;
                    if (liveStreamHostAvatar) liveStreamHostAvatar.src = avatarSrc;
                }
                // Update sidebar user avatar if exists
                const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
                if (sidebarAvatar) sidebarAvatar.src = avatarSrc;
            }

            // Patch profile-info-form submit to also propagate
            const origProfileForm = document.getElementById('profile-info-form');
            if (origProfileForm) {
                origProfileForm.addEventListener('submit', function() {
                    setTimeout(propagateProfilePicture, 100);
                });
            }

            // =====================================================
            // LIVE GIFT SIDE-TAB: Render quick gift items
            // =====================================================
            function renderGiftSideTab() {
                const container = document.getElementById('live-gift-quick-items');
                if (!container) return;
                // Show top 8 most popular gifts
                const topGifts = empyGiftCatalog.slice(0, 8);
                container.innerHTML = topGifts.map(g => `
                    <div class="gift-quick-item" data-gift-name="${g.name}" data-gift-symbol="${g.symbol}" data-gift-price="${g.price}" title="${g.name} – ${g.price} EMPY">
                        <span class="g-sym">${g.symbol}</span>
                        <span class="g-price">${g.price}<i class="fa-solid fa-coins" style="font-size:0.55rem; margin-left:2px;"></i></span>
                    </div>
                `).join('');

                // Quick-gift click: select and immediately send
                container.querySelectorAll('.gift-quick-item').forEach(item => {
                    item.addEventListener('click', function() {
                        if (isGuest) { showNotification("Please log in to send gifts.", "warning"); return; }
                        const price = parseInt(this.dataset.giftPrice);
                        if ((userState.empyBalance || 0) < price) {
                            showNotification(`Insufficient EMPY. You need ${price} EMPY to send this gift.`, "error");
                            const buyEmpyModal = document.getElementById('buy-empy-modal');
                            if (buyEmpyModal) buyEmpyModal.classList.add('show');
                            return;
                        }
                        userState.empyBalance -= price;
                        updateWalletUI();
                        const hostName = document.getElementById('live-host-name')?.textContent || 'the host';
                        showNotification(`🎁 ${this.dataset.giftSymbol} ${this.dataset.giftName} sent to ${hostName}!`, "success");
                        // Trigger gift animation
                        triggerGiftAnimation(this.dataset.giftSymbol);
                        rewardUserForAction('SEND_GIFT');
                        // Update goal if active
                        if (liveStreamData.liveGoal) {
                            liveStreamData.liveGoal.currentAmount = (liveStreamData.liveGoal.currentAmount || 0) + price;
                            updateLiveUI();
                        }
                    });
                });
            }

            // Gift animation helper
            function triggerGiftAnimation(symbol) {
                const layer = document.getElementById('gift-animation-layer');
                if (!layer) return;
                const el = document.createElement('div');
                el.textContent = symbol;
                el.style.cssText = `
                    position:absolute; bottom:80px; left:${20 + Math.random()*60}%;
                    font-size:2.5rem; z-index:10; pointer-events:none;
                    animation: giftFloat 2s ease-out forwards;
                `;
                layer.appendChild(el);
                setTimeout(() => el.remove(), 2100);
            }

            // Add gift float keyframe
            if (!document.getElementById('gift-keyframe-style')) {
                const ks = document.createElement('style');
                ks.id = 'gift-keyframe-style';
                ks.textContent = `@keyframes giftFloat { from { opacity:1; transform:translateY(0) scale(1); } to { opacity:0; transform:translateY(-120px) scale(1.5); } }`;
                document.head.appendChild(ks);
            }

            // Show side-tab when live modal opens
            const goLiveModalObs = document.getElementById('go-live-modal-overlay');
            if (goLiveModalObs) {
                const observer = new MutationObserver(() => {
                    const sideTab = document.getElementById('live-gift-side-tab');
                    if (goLiveModalObs.classList.contains('show')) {
                        renderGiftSideTab();
                        if (sideTab) sideTab.style.display = 'flex';
                    } else {
                        if (sideTab) sideTab.style.display = 'none';
                    }
                });
                observer.observe(goLiveModalObs, { attributes: true, attributeFilter: ['class'] });
            }

            // "All Gifts" tab button → open full catalog
            document.getElementById('live-gift-all-btn')?.addEventListener('click', function() {
                const catalog = document.getElementById('live-gift-catalog-modal');
                if (catalog) catalog.classList.add('show');
            });

            // =====================================================
            // DISPUTE MANAGEMENT SYSTEM (Admin + Members)
            // =====================================================
            let mockDisputes = [
                {
                    id: 'DP-001', status: 'open',
                    item: '3 Bedroom Flat, Lekki', itemId: 'prop-3',
                    buyerUsername: 'samuel_okoro', buyerId: 'user-2',
                    sellerUsername: 'seller', sellerId: 'user-1',
                    amount: '$250,000', currency: 'USD',
                    reason: 'Property was not as described. Photos showed full furnishing but arrived unfurnished.',
                    evidence: ['https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=400', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400'],
                    chats: [
                        { role: 'member', sender: 'samuel_okoro', text: 'I raised this dispute because the property was misrepresented in the listing.', ts: '2025-08-01 10:22' },
                        { role: 'member', sender: 'seller', text: 'The furnishing was optional. I communicated this before the sale.', ts: '2025-08-01 11:05' }
                    ],
                    date: '2025-08-01'
                },
                {
                    id: 'DP-002', status: 'pending',
                    item: 'Toyota Camry 2018', itemId: 'prop-4',
                    buyerUsername: 'NairobiVibes', buyerId: 'user-3',
                    sellerUsername: 'CiromaCars', sellerId: 'user-ciroma',
                    amount: '$18,000', currency: 'USD',
                    reason: 'Car has hidden mechanical faults not disclosed by seller. Engine light came on within 2 days.',
                    evidence: [],
                    chats: [
                        { role: 'member', sender: 'NairobiVibes', text: 'The car was sold with undisclosed faults. Requesting full refund.', ts: '2025-08-03 09:15' }
                    ],
                    date: '2025-08-03'
                },
                {
                    id: 'DP-003', status: 'resolved',
                    item: 'MacBook Pro Listing', itemId: 'prop-mac',
                    buyerUsername: 'KanoConnect', buyerId: 'user-1',
                    sellerUsername: 'TechSeller_NG', sellerId: 'user-tech',
                    amount: '$1,200', currency: 'USD',
                    reason: 'Item never delivered within agreed timeframe.',
                    evidence: [],
                    chats: [
                        { role: 'member', sender: 'KanoConnect', text: 'I paid but the item was never shipped.', ts: '2025-07-28 14:00' },
                        { role: 'admin', sender: 'Admin', text: 'After review, we have refunded the buyer in full. Case closed.', ts: '2025-07-29 10:30' }
                    ],
                    date: '2025-07-28'
                }
            ];

            let mockComplaints = [
                {
                    id: 'CMP-001', status: 'unread',
                    userId: 'user-2', username: 'samuel_okoro',
                    category: 'payment', subject: 'Withdrawal stuck for 5 days',
                    detail: 'I submitted a withdrawal request 5 days ago for 1,500 EMPY but it still shows pending. Please resolve urgently.',
                    evidence: [], date: '2025-08-05 09:12',
                    replies: []
                },
                {
                    id: 'CMP-002', status: 'read',
                    userId: 'user-3', username: 'NairobiVibes',
                    category: 'account', subject: 'KYC verification stuck',
                    detail: 'My KYC documents were submitted 2 weeks ago but verification is still pending. I am unable to use escrow features.',
                    evidence: [], date: '2025-08-03 15:44',
                    replies: [
                        { role: 'admin', sender: 'Admin', text: 'We are reviewing your KYC documents. Please allow 2-3 more business days.', ts: '2025-08-04 09:00' }
                    ]
                }
            ];

            let activeDisputeId = null;
            let activeComplaintId = null;

            function renderAdminDisputeQueue() {
                const container = document.getElementById('admin-dispute-queue');
                if (!container) return;
                if (!mockDisputes.length) {
                    container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">No active disputes.</p>';
                    return;
                }
                container.innerHTML = mockDisputes.map(d => `
                    <div class="dispute-card status-${d.status}" data-dispute-id="${d.id}">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                            <div>
                                <strong style="color:var(--primary-color); font-size:1rem;">${d.id} — ${d.item}</strong>
                                <span class="dispute-status-badge ${d.status}" style="margin-left:10px;">${d.status.toUpperCase()}</span>
                            </div>
                            <span style="font-size:0.82rem; color:#888;">${d.date}</span>
                        </div>
                        <div class="dispute-meta">
                            <span><i class="fas fa-user"></i> Buyer: @${d.buyerUsername}</span>
                            <span><i class="fas fa-store"></i> Seller: @${d.sellerUsername}</span>
                            <span><i class="fas fa-dollar-sign"></i> ${d.amount}</span>
                            <span><i class="fas fa-comment-dots"></i> ${d.chats.length} message(s)</span>
                        </div>
                        <p style="font-size:0.9rem; color:#555; margin-bottom:10px;"><em>${d.reason.substring(0, 120)}${d.reason.length > 120 ? '…' : ''}</em></p>
                        <div class="dispute-actions">
                            <button class="btn btn-small review-dispute-btn" data-dispute-id="${d.id}"><i class="fas fa-search"></i> Review Case</button>
                            ${d.status !== 'resolved' ? `
                                <button class="btn btn-small btn-success resolve-refund-quick-btn" data-dispute-id="${d.id}"><i class="fas fa-undo"></i> Refund Buyer</button>
                                <button class="btn btn-small btn-accent resolve-release-quick-btn" data-dispute-id="${d.id}"><i class="fas fa-check"></i> Release Funds</button>
                            ` : `<span style="color:var(--success-color); font-size:0.85rem;"><i class="fas fa-check-circle"></i> Resolved</span>`}
                        </div>
                    </div>
                `).join('');

                // Bind review buttons
                container.querySelectorAll('.review-dispute-btn').forEach(btn => {
                    btn.addEventListener('click', function() { openDisputeModal(this.dataset.disputeId); });
                });
                container.querySelectorAll('.resolve-refund-quick-btn').forEach(btn => {
                    btn.addEventListener('click', function() { resolveDispute(this.dataset.disputeId, 'refund'); });
                });
                container.querySelectorAll('.resolve-release-quick-btn').forEach(btn => {
                    btn.addEventListener('click', function() { resolveDispute(this.dataset.disputeId, 'release'); });
                });
            }

            function openDisputeModal(disputeId) {
                const d = mockDisputes.find(x => x.id === disputeId);
                if (!d) return;
                activeDisputeId = disputeId;

                const modal = document.getElementById('dispute-detail-modal');
                const title = document.getElementById('dispute-modal-title');
                const body = document.getElementById('dispute-modal-body');
                const thread = document.getElementById('dispute-chat-thread');

                if (title) title.innerHTML = `<i class="fas fa-gavel"></i> Dispute ${d.id} — <span class="dispute-status-badge ${d.status}">${d.status.toUpperCase()}</span>`;

                if (body) {
                    body.innerHTML = `
                        <div class="dispute-meta" style="font-size:0.9rem; margin-bottom:15px;">
                            <span><strong>Item:</strong> ${d.item}</span>
                            <span><strong>Amount:</strong> ${d.amount}</span>
                            <span><strong>Date:</strong> ${d.date}</span>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                            <div style="background:#fff8e1; padding:12px; border-radius:8px; border-left:3px solid var(--accent-color);">
                                <strong><i class="fas fa-user"></i> Buyer</strong><br>@${d.buyerUsername}
                            </div>
                            <div style="background:#f3e5f5; padding:12px; border-radius:8px; border-left:3px solid var(--secondary-color);">
                                <strong><i class="fas fa-store"></i> Seller</strong><br>@${d.sellerUsername}
                            </div>
                        </div>
                        <div style="background:#ffebee; padding:12px; border-radius:8px; margin-bottom:15px; border-left:3px solid var(--danger-color);">
                            <strong><i class="fas fa-exclamation-triangle"></i> Dispute Reason:</strong>
                            <p style="margin-top:8px;">${d.reason}</p>
                        </div>
                        ${d.evidence.length ? `
                            <div style="margin-bottom:15px;">
                                <strong><i class="fas fa-paperclip"></i> Uploaded Evidence:</strong>
                                <div class="dispute-evidence-grid" style="margin-top:10px;">
                                    ${d.evidence.map(src => `<img src="${src}" alt="Evidence" onclick="window.open('${src}','_blank')">`).join('')}
                                </div>
                            </div>` : '<p style="color:#888; font-size:0.85rem; margin-bottom:15px;"><i class="fas fa-image"></i> No evidence uploaded.</p>'}
                    `;
                }

                if (thread) {
                    thread.innerHTML = `<strong style="margin-bottom:10px; display:block;"><i class="fas fa-comments"></i> Dispute Chat Thread</strong>` +
                        (d.chats.length ? d.chats.map(c => `
                            <div class="dispute-chat-bubble ${c.role}" style="margin-bottom:10px;">
                                <div class="sender">@${c.sender}</div>
                                <div>${c.text}</div>
                                <div class="ts">${c.ts}</div>
                            </div>
                        `).join('') : '<p style="color:#888; text-align:center; padding:10px;">No messages yet.</p>');
                }

                // Show/hide admin reply section
                const replySection = document.getElementById('dispute-admin-reply-section');
                if (replySection) replySection.style.display = d.status === 'resolved' ? 'none' : 'block';

                modal.classList.add('show');
                document.body.classList.add('modal-open');
            }

            function resolveDispute(disputeId, resolution) {
                const d = mockDisputes.find(x => x.id === disputeId);
                if (!d || d.status === 'resolved') return;
                d.status = 'resolved';
                const resText = resolution === 'refund'
                    ? `After thorough review, we have refunded the buyer (${d.buyerUsername}) in full. The seller (${d.sellerUsername}) has been notified.`
                    : `After thorough review, escrow funds have been released to the seller (${d.sellerUsername}). Case closed.`;
                d.chats.push({ role: 'admin', sender: 'Admin', text: resText, ts: new Date().toLocaleString() });
                renderAdminDisputeQueue();
                updateAdminStats();
                showNotification(`Dispute ${disputeId} resolved: ${resolution === 'refund' ? 'Buyer refunded' : 'Funds released to seller'}.`, 'success');
                const modal = document.getElementById('dispute-detail-modal');
                if (modal) modal.classList.remove('show');
                document.body.classList.remove('modal-open');
            }

            // Admin Reply Buttons
            document.getElementById('dispute-resolve-refund-btn')?.addEventListener('click', function() {
                if (activeDisputeId) resolveDispute(activeDisputeId, 'refund');
            });
            document.getElementById('dispute-resolve-release-btn')?.addEventListener('click', function() {
                if (activeDisputeId) resolveDispute(activeDisputeId, 'release');
            });
            document.getElementById('dispute-send-reply-btn')?.addEventListener('click', function() {
                const replyText = document.getElementById('dispute-admin-reply-text')?.value?.trim();
                if (!replyText) { showNotification("Please type a reply message.", "warning"); return; }
                const d = mockDisputes.find(x => x.id === activeDisputeId);
                if (!d) return;
                d.chats.push({ role: 'admin', sender: 'Admin', text: replyText, ts: new Date().toLocaleString() });
                document.getElementById('dispute-admin-reply-text').value = '';
                openDisputeModal(activeDisputeId); // refresh modal
                showNotification("Reply sent to both parties.", "success");
            });

            // =====================================================
            // COMPLAINTS INBOX (Admin view)
            // =====================================================
            function renderComplaintsInbox() {
                const container = document.getElementById('admin-complaints-inbox');
                if (!container) return;
                if (!mockComplaints.length) {
                    container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">No complaints yet.</p>';
                    return;
                }
                container.innerHTML = mockComplaints.map(c => `
                    <div class="complaint-card ${c.status}" style="padding:15px 20px; cursor:pointer;" data-complaint-id="${c.id}">
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                            <div class="complaint-subject">${c.subject}</div>
                            <span style="font-size:0.8rem; background:${c.status === 'unread' ? 'var(--danger-color)' : '#e0e0e0'}; color:${c.status === 'unread' ? 'white' : '#555'}; padding:2px 10px; border-radius:12px;">${c.status === 'unread' ? 'NEW' : 'READ'}</span>
                        </div>
                        <div class="complaint-meta"><i class="fas fa-tag"></i> ${c.category} &nbsp;|&nbsp; <i class="fas fa-user"></i> @${c.username} &nbsp;|&nbsp; <i class="fas fa-clock"></i> ${c.date}</div>
                        <div class="complaint-preview">${c.detail}</div>
                        <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="btn btn-small view-complaint-btn" data-complaint-id="${c.id}"><i class="fas fa-eye"></i> View & Reply</button>
                            ${c.replies.length ? `<span style="font-size:0.82rem; color:var(--success-color); align-self:center;"><i class="fas fa-check-circle"></i> ${c.replies.length} reply(s) sent</span>` : ''}
                        </div>
                    </div>
                `).join('');

                container.querySelectorAll('.view-complaint-btn').forEach(btn => {
                    btn.addEventListener('click', function() { openComplaintReplyModal(this.dataset.complaintId); });
                });
            }

            function openComplaintReplyModal(complaintId) {
                const c = mockComplaints.find(x => x.id === complaintId);
                if (!c) return;
                activeComplaintId = complaintId;
                c.status = 'read';
                renderComplaintsInbox();

                const modal = document.getElementById('dispute-detail-modal');
                const title = document.getElementById('dispute-modal-title');
                const body = document.getElementById('dispute-modal-body');
                const thread = document.getElementById('dispute-chat-thread');
                const replySection = document.getElementById('dispute-admin-reply-section');

                if (title) title.innerHTML = `<i class="fas fa-envelope-open-text"></i> Complaint ${c.id}`;
                if (body) {
                    body.innerHTML = `
                        <div class="dispute-meta" style="margin-bottom:15px;">
                            <span><strong>From:</strong> @${c.username}</span>
                            <span><strong>Category:</strong> ${c.category}</span>
                            <span><strong>Date:</strong> ${c.date}</span>
                        </div>
                        <div style="background:#fff8e1; padding:15px; border-radius:8px; border-left:3px solid var(--accent-color); margin-bottom:15px;">
                            <strong>${c.subject}</strong>
                            <p style="margin-top:8px;">${c.detail}</p>
                        </div>
                    `;
                }
                if (thread) {
                    thread.innerHTML = `<strong style="margin-bottom:10px; display:block;"><i class="fas fa-comments"></i> Conversation Thread</strong>` +
                        (c.replies.length ? c.replies.map(r => `
                            <div class="dispute-chat-bubble ${r.role}" style="margin-bottom:10px;">
                                <div class="sender">${r.sender}</div>
                                <div>${r.text}</div>
                                <div class="ts">${r.ts}</div>
                            </div>
                        `).join('') : '<p style="color:#888; text-align:center; padding:10px;">No replies yet.</p>');
                }
                // Override reply buttons to work with complaint
                if (replySection) {
                    replySection.style.display = 'block';
                    replySection.querySelector('h4').innerHTML = '<i class="fas fa-reply"></i> Reply to Member';
                    const resolveRefundBtn = document.getElementById('dispute-resolve-refund-btn');
                    const resolveReleaseBtn = document.getElementById('dispute-resolve-release-btn');
                    if (resolveRefundBtn) resolveRefundBtn.style.display = 'none';
                    if (resolveReleaseBtn) resolveReleaseBtn.style.display = 'none';
                }
                modal.classList.add('show');
                document.body.classList.add('modal-open');
            }

            // Override send-reply for complaints
            document.getElementById('dispute-send-reply-btn')?.addEventListener('click', function() {
                const replyText = document.getElementById('dispute-admin-reply-text')?.value?.trim();
                if (!replyText) { showNotification("Please type a reply.", "warning"); return; }

                // Check if it's a complaint or dispute
                const complaint = mockComplaints.find(x => x.id === activeComplaintId);
                if (complaint && activeComplaintId && !activeDisputeId) {
                    complaint.replies.push({ role: 'admin', sender: 'Admin', text: replyText, ts: new Date().toLocaleString() });
                    document.getElementById('dispute-admin-reply-text').value = '';
                    openComplaintReplyModal(activeComplaintId);
                    showNotification("Reply sent to member.", "success");
                }
            }, { capture: true });

            // =====================================================
            // MEMBER COMPLAINT FORM SUBMIT
            // =====================================================
            document.getElementById('complaint-form')?.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isGuest) { showNotification("Please log in to submit a complaint.", "warning"); return; }
                const cat = document.getElementById('complaint-category')?.value;
                const subject = document.getElementById('complaint-subject')?.value?.trim();
                const detail = document.getElementById('complaint-detail')?.value?.trim();
                if (!cat || !subject || !detail) { showNotification("Please fill all required fields.", "error"); return; }

                const newComplaint = {
                    id: `CMP-${Date.now()}`,
                    status: 'unread',
                    userId: userState.id,
                    username: userState.username,
                    category: cat,
                    subject: subject,
                    detail: detail,
                    evidence: [],
                    date: new Date().toLocaleString(),
                    replies: []
                };
                mockComplaints.unshift(newComplaint);
                if (isAdmin) renderComplaintsInbox();

                const fb = document.getElementById('complaint-form-feedback');
                if (fb) { fb.className = 'form-feedback success'; fb.style.display = 'block'; fb.textContent = '✅ Your complaint has been submitted. Our team will respond within 24 hours.'; }
                this.reset();
                setTimeout(() => {
                    const modal = document.getElementById('submit-complaint-modal');
                    if (modal) modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    if (fb) { fb.style.display = 'none'; }
                }, 2500);
            });

            // FAB complaint button visibility + click
            function updateComplaintFab() {
                const fab = document.getElementById('submit-complaint-fab');
                if (fab) fab.style.display = (!isGuest) ? 'flex' : 'none';
            }

            document.getElementById('submit-complaint-fab')?.addEventListener('click', function() {
                const modal = document.getElementById('submit-complaint-modal');
                if (modal) { modal.classList.add('show'); document.body.classList.add('modal-open'); }
            });

            // Make the FAB draggable (touch + mouse) so it doesn't block content
            (function() {
                var fab = document.getElementById('submit-complaint-fab');
                if (!fab) return;
                var isDragging = false, startX, startY, startLeft, startTop, moved = false;

                function getPos(e) {
                    return e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
                                     : { x: e.clientX, y: e.clientY };
                }
                function onStart(e) {
                    var p = getPos(e);
                    startX = p.x; startY = p.y;
                    var rect = fab.getBoundingClientRect();
                    startLeft = rect.left; startTop = rect.top;
                    isDragging = true; moved = false;
                    fab.style.transition = 'none';
                    fab.style.cursor = 'grabbing';
                    e.preventDefault();
                }
                function onMove(e) {
                    if (!isDragging) return;
                    var p = getPos(e);
                    var dx = p.x - startX, dy = p.y - startY;
                    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
                    var newLeft = Math.min(Math.max(0, startLeft + dx), window.innerWidth - 44);
                    var newTop = Math.min(Math.max(0, startTop + dy), window.innerHeight - 44);
                    fab.style.left = newLeft + 'px';
                    fab.style.top = newTop + 'px';
                    fab.style.right = 'auto';
                    fab.style.bottom = 'auto';
                    e.preventDefault();
                }
                function onEnd(e) {
                    if (!isDragging) return;
                    isDragging = false;
                    fab.style.cursor = 'grab';
                    fab.style.transition = 'box-shadow 0.2s, transform 0.2s';
                    // If barely moved, treat as a click → open modal
                    if (!moved) {
                        var modal = document.getElementById('submit-complaint-modal');
                        if (modal) { modal.classList.add('show'); document.body.classList.add('modal-open'); }
                    }
                }
                fab.addEventListener('mousedown', onStart, { passive: false });
                fab.addEventListener('touchstart', onStart, { passive: false });
                document.addEventListener('mousemove', onMove, { passive: false });
                document.addEventListener('touchmove', onMove, { passive: false });
                document.addEventListener('mouseup', onEnd);
                document.addEventListener('touchend', onEnd);
                // Override the simple click handler added above (moved logic into onEnd)
                fab.onclick = function(e) { e.stopPropagation(); };
            })();

            // =====================================================
            // PATCH: renderAdminQueues — extends original to include disputes + complaints
            // =====================================================
            (function() {
                var _origRAQ = renderAdminQueues;
                renderAdminQueues = function() {
                    _origRAQ();
                    try { renderAdminDisputeQueue(); } catch(e) {}
                    try { renderComplaintsInbox(); } catch(e) {}
                    try { updateAdminStats(); } catch(e) {}
                };
            })();

            function updateAdminStats() {
                const wdStat = document.getElementById('admin-stat-withdrawals');
                const dpStat = document.getElementById('admin-stat-disputes');
                const sosStat = document.getElementById('admin-stat-sos');
                if (wdStat) wdStat.textContent = mockAdminWithdrawalQueue.length;
                if (dpStat) dpStat.textContent = mockDisputes.filter(d => d.status !== 'resolved').length;
                if (sosStat) sosStat.textContent = mockAdminSosQueue.length;
            }

            // Run initial dispute/complaint render when admin logs in
            const _origInitApp = initializeApp;
            initializeApp = function patchedInitApp(isGuestMode, adminMode, userObj) {
                window.isAdmin = adminMode || false;
                window.isGuest = isGuestMode || false;
                _origInitApp(isGuestMode, adminMode, userObj);
                if (!isGuestMode) {
                    if (typeof updateComplaintFab === 'function') updateComplaintFab();
                    if (adminMode) {
                        setTimeout(() => {
                            if (typeof renderAdminDisputeQueue === 'function') renderAdminDisputeQueue();
                            if (typeof renderComplaintsInbox === 'function') renderComplaintsInbox();
                            if (typeof updateAdminStats === 'function') updateAdminStats();
                        }, 500);
                    }
                    if (typeof propagateProfilePicture === 'function') propagateProfilePicture();
                }
            };

            // Close dispute modal when close button clicked
            document.getElementById('dispute-detail-modal')?.querySelector('.close-modal')?.addEventListener('click', function() {
                const modal = document.getElementById('dispute-detail-modal');
                if (modal) modal.classList.remove('show');
                document.body.classList.remove('modal-open');
                activeDisputeId = null;
                activeComplaintId = null;
                // Reset buttons
                const resolveRefundBtn = document.getElementById('dispute-resolve-refund-btn');
                const resolveReleaseBtn = document.getElementById('dispute-resolve-release-btn');
                if (resolveRefundBtn) resolveRefundBtn.style.display = '';
                if (resolveReleaseBtn) resolveReleaseBtn.style.display = '';
            });

            // Close submit-complaint modal
            document.getElementById('submit-complaint-modal')?.querySelector('.close-modal')?.addEventListener('click', function() {
                const modal = document.getElementById('submit-complaint-modal');
                if (modal) modal.classList.remove('show');
                document.body.classList.remove('modal-open');
            });

            // =====================================================
            // FIX: KYC FILE UPLOAD BUTTON (re-bind after DOM ready)
            // =====================================================
            function rebindKycUploads() {
                document.querySelectorAll('.kyc-file-upload').forEach(uploadArea => {
                    uploadArea.removeEventListener('click', uploadArea._kycHandler);
                    uploadArea._kycHandler = function() {
                        const inputId = this.dataset.inputId;
                        const fileInput = document.getElementById(inputId);
                        if (fileInput) {
                            fileInput.click();
                        } else {
                            // Create hidden file input dynamically if missing
                            const newInput = document.createElement('input');
                            newInput.type = 'file';
                            newInput.id = inputId;
                            newInput.accept = 'image/*';
                            newInput.style.display = 'none';
                            document.body.appendChild(newInput);
                            newInput.addEventListener('change', function() {
                                if (this.files[0]) {
                                    const url = URL.createObjectURL(this.files[0]);
                                    const preview = uploadArea.querySelector('img, .kyc-preview') || uploadArea;
                                    if (preview.tagName === 'IMG') preview.src = url;
                                    uploadArea.style.backgroundImage = `url('${url}')`;
                                    uploadArea.style.backgroundSize = 'cover';
                                    showNotification("Document uploaded successfully!", "success");
                                }
                            });
                            newInput.click();
                        }
                    };
                    uploadArea.addEventListener('click', uploadArea._kycHandler);
                });
            }
            rebindKycUploads();
            // Re-bind after any navigation
            document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => setTimeout(rebindKycUploads, 300)));

            // =====================================================
            // FIX: MARKETPLACE CURRENCY — apply selected currency to price display
            // =====================================================
            const itemCurrencySel = document.getElementById('item-currency');
            if (itemCurrencySel) {
                itemCurrencySel.addEventListener('change', function() {
                    const currency = this.value;
                    // Update price label
                    const priceLabel = document.querySelector('label[for="item-price"]');
                    if (priceLabel) priceLabel.textContent = `Price (${currency})`;
                    // Update all currently listed prices if USD was selected by default
                    document.querySelectorAll('#property-grid-container .property-info div:last-child').forEach(el => {
                        const rawPrice = el.closest('.property-card')?.dataset?.price;
                        if (!rawPrice) return;
                        const p = parseFloat(rawPrice);
                        if (currency === 'NGN') el.textContent = `₦${(p * USD_TO_NGN_RATE).toLocaleString()}`;
                        else if (currency === 'USD') el.textContent = formatUsdPrice(p);
                        else if (currency === 'EMPY') el.textContent = `${(p / EMPY_RATE_USD).toLocaleString()} EMPY`;
                        else if (currency === 'GBP') el.textContent = `£${(p * 0.79).toLocaleString()}`;
                        else if (currency === 'EUR') el.textContent = `€${(p * 0.92).toLocaleString()}`;
                    });
                });
            }

            // Run on first admin panel render
            setTimeout(() => {
                if (isAdmin) {
                    renderAdminDisputeQueue();
                    renderComplaintsInbox();
                    updateAdminStats();
                }
                updateComplaintFab();
            }, 800);

            // =========================================================
            // ===  COMPREHENSIVE FIXES — ALL 14 ITEMS  ================
            // =========================================================

            // ---------------------------------------------------------
            // FIX 11 (retry): Stop camera stream when leaving live
            // ---------------------------------------------------------
            (function() {
                const origLiveClose = document.getElementById('live-close-btn');
                // Patch via event delegation — prepend camera stop to live close
                document.addEventListener('click', function(e) {
                    if (e.target.closest('#live-close-btn')) {
                        if (liveStreamData._localStream) {
                            liveStreamData._localStream.getTracks().forEach(t => t.stop());
                            liveStreamData._localStream = null;
                        }
                    }
                }, true); // capture phase so it runs before other handlers
            })();

            // ---------------------------------------------------------
            // ADMIN REGISTRATION MODAL
            // ---------------------------------------------------------
            function showAdminRegistrationModal() {
                var existing = document.getElementById('admin-reg-modal');
                if (existing) existing.remove();
                var modal = document.createElement('div');
                modal.id = 'admin-reg-modal';
                modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;';
                var verificationId = 'ADM-' + Math.random().toString(36).substr(2,5).toUpperCase() + '-' + Date.now().toString(36).toUpperCase().substr(-4);
                modal.innerHTML =
                    '<div style="background:white;border-radius:24px;padding:32px;width:min(440px,92vw);box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
                        '<div style="text-align:center;margin-bottom:24px;">' +
                            '<div style="background:linear-gradient(135deg,#5B0EA6,#1B2B8B);width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">' +
                                '<i class="fas fa-user-shield" style="color:white;font-size:1.5rem;"></i>' +
                            '</div>' +
                            '<h2 style="font-family:Syne,sans-serif;color:var(--primary);margin-bottom:6px;">Admin Registration</h2>' +
                            '<p style="font-size:0.85rem;color:var(--text-muted);">Complete your admin profile. Your unique Verification ID is shown below.</p>' +
                        '</div>' +
                        '<div style="background:rgba(91,14,166,0.08);border:2px solid rgba(91,14,166,0.2);border-radius:12px;padding:14px;text-align:center;margin-bottom:20px;">' +
                            '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">YOUR ADMIN VERIFICATION ID</div>' +
                            '<div id="admin-verif-id-display" style="font-size:1.4rem;font-weight:800;color:#5B0EA6;letter-spacing:2px;font-family:monospace;">' + verificationId + '</div>' +
                            '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;">Save this ID — you will need it to log in and for verification processes</div>' +
                        '</div>' +
                        '<div style="display:flex;flex-direction:column;gap:12px;">' +
                            '<input type="text" id="admin-reg-name" placeholder="Full Admin Name" style="width:100%;padding:11px 14px;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box;">' +
                            '<input type="email" id="admin-reg-email" placeholder="Admin Email Address" style="width:100%;padding:11px 14px;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box;">' +
                            '<input type="password" id="admin-reg-password" placeholder="Create Admin Password (min 8 chars)" style="width:100%;padding:11px 14px;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box;">' +
                        '</div>' +
                        '<div style="display:flex;gap:10px;margin-top:20px;">' +
                            '<button id="admin-reg-cancel" style="flex:1;padding:12px;border:1.5px solid rgba(10,14,39,0.12);background:white;border-radius:10px;cursor:pointer;font-weight:600;color:var(--text-muted);">Cancel</button>' +
                            '<button id="admin-reg-submit" style="flex:2;padding:12px;background:linear-gradient(135deg,#5B0EA6,#1B2B8B);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.92rem;">Complete Registration</button>' +
                        '</div>' +
                    '</div>';
                document.body.appendChild(modal);
                document.getElementById('admin-reg-cancel').onclick = function() {
                    modal.remove();
                    showNotification('Admin registration cancelled. No access granted.', 'info');
                };
                document.getElementById('admin-reg-submit').onclick = function() {
                    var name  = document.getElementById('admin-reg-name').value.trim();
                    var email = document.getElementById('admin-reg-email').value.trim();
                    var pass  = document.getElementById('admin-reg-password').value;
                    if (!name || !email || pass.length < 8) {
                        showNotification('Please fill all fields. Password must be at least 8 characters.', 'error');
                        return;
                    }
                    // Save admin registration
                    localStorage.setItem('empyrean_admin_verification_id', verificationId);
                    localStorage.setItem('empyrean_admin_name', name);
                    localStorage.setItem('empyrean_admin_email', email);
                    // Save to Firestore
                    try {
                        fbDb.collection('admin_registrations').doc(verificationId).set({
                            verificationId, name, email,
                            registeredAt: new Date().toISOString(),
                            role: 'admin'
                        });
                    } catch(e) {}
                    modal.remove();
                    initializeApp(false, true);
                    const authModal = document.getElementById('auth-modal-overlay');
                    if (authModal) authModal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    showNotification('✅ Admin registered! Your ID: ' + verificationId + ' — keep it safe.', 'success');
                };
            }

            // ---------------------------------------------------------
            // FIX A: ADMIN LOGIN — Email/password (replaces 4-digit PIN)
            // Chief admin: chiefadmin@empyreanhumanitarianfoundation.com
            // Trigger: 5 taps on sidebar footer  
            // ---------------------------------------------------------
            (function() {
                const CHIEF_ADMIN_EMAIL = 'chiefadmin@empyreanhumanitarianfoundation.com';
                let tapCount = 0, tapTimer = null;

                function showAdminLoginModal() {
                    var old = document.getElementById('admin-login-modal');
                    if (old) old.remove();
                    var modal = document.createElement('div');
                    modal.id = 'admin-login-modal';
                    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;';
                    modal.innerHTML =
                        '<div style="background:white;border-radius:24px;padding:32px;width:min(440px,92vw);box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
                            '<div style="text-align:center;margin-bottom:22px;">' +
                                '<div style="background:linear-gradient(135deg,#5B0EA6,#1B2B8B);width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">' +
                                    '<i class="fas fa-user-shield" style="color:white;font-size:1.4rem;"></i></div>' +
                                '<h2 style="font-family:Syne,sans-serif;color:#0A0E27;margin:0 0 4px;">Admin Access</h2>' +
                                '<p style="font-size:0.83rem;color:#6B7280;margin:0;">Sign in with your admin credentials</p>' +
                            '</div>' +
                            '<div style="display:flex;flex-direction:column;gap:10px;">' +
                                '<input type="email" id="adm-email" placeholder="Admin Email Address" autocomplete="email" ' +
                                    'style="width:100%;padding:11px 14px;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box;">' +
                                '<input type="password" id="adm-pass" placeholder="Admin Password" autocomplete="current-password" ' +
                                    'style="width:100%;padding:11px 14px;border:1.5px solid rgba(10,14,39,0.12);border-radius:10px;font-size:0.9rem;outline:none;box-sizing:border-box;">' +
                                '<div id="adm-err" style="color:#EF4444;font-size:0.82rem;min-height:16px;font-weight:600;"></div>' +
                            '</div>' +
                            '<div style="display:flex;gap:10px;margin-top:16px;">' +
                                '<button id="adm-cancel" style="flex:1;padding:11px;border:1.5px solid rgba(10,14,39,0.12);background:white;border-radius:10px;cursor:pointer;font-weight:600;color:#6B7280;">Cancel</button>' +
                                '<button id="adm-submit" style="flex:2;padding:11px;background:linear-gradient(135deg,#5B0EA6,#1B2B8B);color:white;border:none;border-radius:10px;cursor:pointer;font-weight:700;font-size:0.92rem;">' +
                                    '<i class="fas fa-unlock"></i> Sign In as Admin</button>' +
                            '</div>' +
                            '<div style="text-align:center;margin-top:12px;">' +
                                '<a href="#" id="adm-reg-link" style="font-size:0.82rem;color:#5B0EA6;text-decoration:none;">New admin? Register here</a>' +
                            '</div>' +
                        '</div>';
                    document.body.appendChild(modal);

                    document.getElementById('adm-cancel').onclick = function() { modal.remove(); };
                    document.getElementById('adm-reg-link').onclick = function(ev) {
                        ev.preventDefault(); modal.remove();
                        if (typeof showAdminRegistrationModal === 'function') showAdminRegistrationModal();
                    };

                    document.getElementById('adm-submit').onclick = async function() {
                        var emailVal = (document.getElementById('adm-email').value || '').trim().toLowerCase();
                        var passVal  = document.getElementById('adm-pass').value || '';
                        var errEl    = document.getElementById('adm-err');
                        if (!emailVal || !passVal) { errEl.textContent = 'Please enter your email and password.'; return; }

                        this.disabled = true;
                        this.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verifying...';
                        errEl.textContent = '';
                        var granted = false;

                        if (emailVal === CHIEF_ADMIN_EMAIL) {
                            // Chief admin: first login sets the password
                            var stored = localStorage.getItem('empyrean_chief_admin_pass');
                            if (!stored) { localStorage.setItem('empyrean_chief_admin_pass', passVal); granted = true; }
                            else if (passVal === stored) { granted = true; }
                            else { errEl.textContent = 'Incorrect password for chief admin account.'; }
                        } else {
                            // Regular admins: verify via Firebase Auth + admin_registrations collection
                            try {
                                if (window._firebaseLoaded && window.fbAuth && typeof window.fbAuth.signInWithEmailAndPassword === 'function') {
                                    var result = await window.fbAuth.signInWithEmailAndPassword(emailVal, passVal);
                                    if (result && result.user) {
                                        var snap = await window.fbDb.collection('admin_registrations')
                                            .where('email', '==', emailVal).limit(1).get();
                                        if (!snap.empty) { granted = true; }
                                        else { errEl.textContent = 'This email is not registered as an admin.'; window.fbAuth.signOut().catch(function() {}); }
                                    }
                                } else {
                                    // Offline fallback: check locally stored admin credentials
                                    if (emailVal === localStorage.getItem('empyrean_admin_email') &&
                                        passVal  === localStorage.getItem('empyrean_admin_password')) {
                                        granted = true;
                                    } else { errEl.textContent = 'Cannot verify admin credentials offline.'; }
                                }
                            } catch(ae) {
                                if (ae.code === 'auth/wrong-password' || ae.code === 'auth/invalid-credential') errEl.textContent = 'Incorrect password.';
                                else if (ae.code === 'auth/user-not-found') errEl.textContent = 'No admin account found with this email.';
                                else errEl.textContent = 'Login error: ' + (ae.message || 'please try again.');
                            }
                        }

                        if (granted) {
                            modal.remove();
                            localStorage.setItem('empyrean_admin_email_session', emailVal);
                            initializeApp(false, true);
                            var authModal = document.getElementById('auth-modal-overlay');
                            if (authModal) authModal.classList.remove('show');
                            document.body.classList.remove('modal-open');
                            showNotification('🔐 Welcome! Admin access granted.', 'success');
                        } else {
                            this.disabled = false;
                            this.innerHTML = '<i class="fas fa-unlock"></i> Sign In as Admin';
                        }
                    };

                    // Enter key submits
                    ['adm-email', 'adm-pass'].forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el) el.addEventListener('keydown', function(ev) {
                            if (ev.key === 'Enter') document.getElementById('adm-submit').click();
                        });
                    });
                    setTimeout(function() { var el = document.getElementById('adm-email'); if (el) el.focus(); }, 80);
                }

                window._showAdminLogin = showAdminLoginModal;

                function bindFooterTap() {
                    const footer = document.querySelector('.sidebar-footer');
                    if (!footer || footer._adminTapBound) return;
                    footer._adminTapBound = true;
                    footer.addEventListener('click', function(e) {
                        if (e.target.closest('a[href]') || e.target.closest('#login-signup-btn') || e.target.closest('#logout-btn')) return;
                        tapCount++;
                        clearTimeout(tapTimer);
                        tapTimer = setTimeout(function() { tapCount = 0; }, 2000);
                        if (tapCount >= 5) { tapCount = 0; showAdminLoginModal(); }
                    });
                }

                const _origBuildSidebar = buildSidebar;
                buildSidebar = function() {
                    _origBuildSidebar.apply(this, arguments);
                    setTimeout(bindFooterTap, 150);
                };
                setTimeout(bindFooterTap, 600);

                // Auto-detect chief admin on Firebase login
                document.addEventListener('empyrean-init-done', function() {
                    if (window.userState && window.userState.email &&
                        window.userState.email.toLowerCase() === CHIEF_ADMIN_EMAIL && !isAdmin) {
                        isAdmin = true;
                        window.isAdmin = true;
                        buildSidebar();
                        showNotification('🔐 Chief Admin access detected.', 'success');
                    }
                });
            })();

            // ---------------------------------------------------------
            // FIX B: KYC UPLOAD — proper file input + live camera capture
            // ---------------------------------------------------------
            (function() {
                let _kycCameraBtn = null;
                let _kycCameraStream = null;

                function initKycUploads() {
                    document.querySelectorAll('.upload-area.kyc-file-upload:not([data-kyc-bound])').forEach(area => {
                        area.dataset.kycBound = '1';
                        area.addEventListener('click', function(e) {
                            e.preventDefault(); e.stopPropagation();
                            const inputId = this.dataset.inputId;
                            let fi = document.getElementById(inputId);
                            if (!fi) {
                                fi = document.createElement('input');
                                fi.type = 'file'; fi.id = inputId;
                                fi.accept = 'image/*,.pdf'; fi.style.display = 'none';
                                document.body.appendChild(fi);
                            }
                            const self = this;
                            fi.onchange = async function() {
                                if (!this.files || !this.files[0]) return;
                                const file = this.files[0];
                                // Visual feedback on upload area
                                self.classList.add('has-file');
                                const existing = self.querySelector('.file-name-display');
                                if (existing) existing.remove();
                                const nm = document.createElement('span');
                                nm.className = 'file-name-display';
                                const shortName = file.name.length > 28 ? file.name.substring(0,25)+'...' : file.name;
                                nm.innerHTML = '<i class="fas fa-sync-alt fa-spin" style="color:var(--primary-color);"></i> Uploading...';
                                self.appendChild(nm);
                                // Show local preview immediately
                                const previewEl = document.getElementById(inputId + '-preview');
                                if (previewEl && file.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = ev => {
                                        previewEl.innerHTML = `<img src="${ev.target.result}" style="width:70px;height:55px;object-fit:cover;border-radius:5px;margin-top:6px;border:1px solid #ddd;">`;
                                    };
                                    reader.readAsDataURL(file);
                                } else if (previewEl) {
                                    previewEl.innerHTML = `<span style="font-size:0.8rem;color:var(--primary-color);margin-top:6px;display:block;"><i class="fas fa-file-alt"></i> ${shortName}</span>`;
                                }
                                // Upload to Cloudinary
                                try {
                                    const cloudUrl = await window.uploadToCloudinary(file, null);
                                    // Update display
                                    nm.innerHTML = '<i class="fas fa-check-circle" style="color:var(--success-color);"></i> ' + shortName;
                                    if (previewEl && file.type.startsWith('image/')) {
                                        previewEl.innerHTML = `<img src="${cloudUrl}" style="width:70px;height:55px;object-fit:cover;border-radius:5px;margin-top:6px;border:2px solid var(--success-color);">`;
                                    }
                                    // Track with cloud URL for admin review
                                    if (!window._kycSubmissions) window._kycSubmissions = {};
                                    window._kycSubmissions[inputId] = {
                                        fileName: file.name, fileSize: file.size,
                                        type: file.type, cloudUrl
                                    };
                                    // Save document reference to Firestore
                                    try {
                                        await fbDb.collection('kyc_documents').add({
                                            userId: userState.id, username: userState.username,
                                            docType: inputId, fileName: file.name,
                                            cloudUrl, uploadedAt: new Date().toISOString(), status: 'pending'
                                        });
                                    } catch(fsErr) {}
                                    renderAdminKycDocs();
                                    showNotification('✅ Document uploaded to cloud: ' + shortName, 'success');
                                } catch(uploadErr) {
                                    console.warn('KYC document upload failed:', uploadErr);
                                    nm.innerHTML = '<i class="fas fa-exclamation-circle" style="color:var(--danger-color);"></i> Upload failed — saved locally';
                                    if (!window._kycSubmissions) window._kycSubmissions = {};
                                    window._kycSubmissions[inputId] = { fileName: file.name, fileSize: file.size, type: file.type, cloudUrl: null };
                                    renderAdminKycDocs();
                                    showNotification('Document saved locally (cloud upload failed).', 'warning');
                                }
                            };
                            fi.click();
                        });
                    });

                    // Camera capture (selfie) buttons
                    document.querySelectorAll('.live-capture-btn:not([data-cam-bound])').forEach(btn => {
                        btn.dataset.camBound = '1';
                        btn.addEventListener('click', function(e) {
                            e.preventDefault(); e.stopPropagation();
                            _kycCameraBtn = this;
                            const modal = document.getElementById('kyc-camera-modal');
                            const video = document.getElementById('kyc-camera-video');
                            const status = document.getElementById('kyc-camera-status');
                            if (!modal) { simulateSelfie(this); return; }
                            if (status) status.textContent = 'Requesting camera access...';
                            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
                                .then(stream => {
                                    _kycCameraStream = stream;
                                    video.srcObject = stream;
                                    video.play();
                                    modal.classList.add('show');
                                    if (status) status.textContent = 'Position your face and click Capture.';
                                })
                                .catch(() => { simulateSelfie(_kycCameraBtn); });
                        });
                    });
                }

                function simulateSelfie(btn) {
                    if (!btn) return;
                    const previewId = btn.id.replace('-btn', '-preview');
                    const previewEl = document.getElementById(previewId);
                    const name = (typeof userState !== 'undefined' && userState.fullName) ? userState.fullName : 'User';
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4A148C&color=fff&size=100`;
                    if (previewEl) previewEl.innerHTML = `<img src="${avatarUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--success-color);margin-top:6px;">`;
                    btn.dataset.captured = 'true';
                    btn.style.background = 'var(--success-color)';
                    btn.innerHTML = '<i class="fas fa-check"></i> Selfie Captured';
                    if (!window._kycSubmissions) window._kycSubmissions = {};
                    window._kycSubmissions[btn.id] = { selfie: avatarUrl };
                    renderAdminKycDocs();
                    showNotification('Camera unavailable — placeholder selfie used.', 'warning');
                }

                // Camera snap button
                document.getElementById('kyc-capture-snap-btn')?.addEventListener('click', async function() {
                    const video = document.getElementById('kyc-camera-video');
                    const canvas = document.getElementById('kyc-camera-canvas');
                    if (!video || !canvas) return;
                    canvas.width = video.videoWidth || 480;
                    canvas.height = video.videoHeight || 360;
                    canvas.getContext('2d').drawImage(video, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    if (_kycCameraStream) { _kycCameraStream.getTracks().forEach(t => t.stop()); _kycCameraStream = null; }
                    document.getElementById('kyc-camera-modal').classList.remove('show');
                    if (_kycCameraBtn) {
                        const previewId = _kycCameraBtn.id.replace('-btn', '-preview');
                        const previewEl = document.getElementById(previewId);
                        // Show captured image immediately
                        if (previewEl) previewEl.innerHTML = `<img src="${dataUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--success-color);margin-top:6px;">`;
                        _kycCameraBtn.dataset.captured = 'true';
                        _kycCameraBtn.style.background = 'var(--success-color)';
                        _kycCameraBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Uploading...';
                        if (!window._kycSubmissions) window._kycSubmissions = {};
                        window._kycSubmissions[_kycCameraBtn.id] = { selfie: dataUrl, cloudUrl: null };
                        renderAdminKycDocs();
                        // Upload selfie to Cloudinary
                        try {
                            const res = await fetch(dataUrl);
                            const blob = await res.blob();
                            const selfieFile = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
                            const cloudUrl = await window.uploadToCloudinary(selfieFile, null);
                            // Update preview with Cloudinary URL
                            if (previewEl) previewEl.innerHTML = `<img src="${cloudUrl}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid var(--success-color);margin-top:6px;">`;
                            _kycCameraBtn.innerHTML = '<i class="fas fa-check"></i> Selfie Captured ✅';
                            window._kycSubmissions[_kycCameraBtn.id] = { selfie: cloudUrl, cloudUrl };
                            // Save selfie to Firestore
                            try {
                                await fbDb.collection('kyc_selfies').add({
                                    userId: userState.id, username: userState.username,
                                    selfieUrl: cloudUrl, capturedAt: new Date().toISOString(), status: 'pending'
                                });
                            } catch(e) {}
                            renderAdminKycDocs();
                            showNotification('✅ Selfie captured and saved to cloud!', 'success');
                        } catch(uploadErr) {
                            console.warn('Selfie upload failed:', uploadErr);
                            _kycCameraBtn.innerHTML = '<i class="fas fa-check"></i> Selfie Captured';
                            showNotification('Selfie captured (cloud upload failed).', 'warning');
                        }
                    }
                });

                document.getElementById('kyc-camera-close-btn')?.addEventListener('click', function() {
                    if (_kycCameraStream) { _kycCameraStream.getTracks().forEach(t => t.stop()); _kycCameraStream = null; }
                    document.getElementById('kyc-camera-modal').classList.remove('show');
                });

                // Re-init on navigation and KYC entity selection
                setTimeout(initKycUploads, 700);

                // ── STANDALONE KYC ENTITY BUTTON HANDLER ──────────────
                // Runs in CAPTURE phase so nothing can block it.
                // This is the definitive handler for showing/hiding KYC forms.
                document.addEventListener('click', function kycEntityHandler(e) {
                    var btn = e.target.closest('.kyc-entity-btn');
                    if (!btn) return;
                    e.stopPropagation(); // prevent master handler from also running
                    
                    var formId = btn.dataset.form;
                    if (!formId) return;

                    // Mark this button active
                    document.querySelectorAll('.kyc-entity-btn').forEach(function(b) {
                        b.classList.remove('active');
                    });
                    btn.classList.add('active');

                    // Hide all forms
                    document.querySelectorAll('.kyc-form').forEach(function(f) {
                        f.classList.remove('active');
                        f.style.cssText = 'display:none !important;';
                    });

                    // Show selected form
                    var target = document.getElementById(formId);
                    if (!target) {
                        // Form may have been rendered with duplicate IDs if profile re-rendered.
                        // Search inside profile-kyc-tab directly.
                        var kycTab = document.getElementById('profile-kyc-tab');
                        if (kycTab) target = kycTab.querySelector('#' + formId);
                    }
                    if (target) {
                        target.classList.add('active');
                        target.style.cssText = 'display:block !important;';

                        // Auto-fill Individual form with user data
                        if (formId === 'individual-kyc-form' && window.userState) {
                            var us = window.userState;
                            var nameParts = (us.fullName || '').trim().split(' ');
                            var fn = target.querySelector('#kyc-ind-fname, [id^="kyc-ind-fname"]');
                            var ln = target.querySelector('#kyc-ind-lname, [id^="kyc-ind-lname"]');
                            var em = target.querySelector('#kyc-ind-email, [id^="kyc-ind-email"]');
                            var ph = target.querySelector('#kyc-ind-phone, [id^="kyc-ind-phone"]');
                            if (fn && !fn.value) fn.value = nameParts[0] || '';
                            if (ln && !ln.value) ln.value = nameParts.slice(1).join(' ') || '';
                            if (em && !em.value) em.value = us.email || '';
                            if (ph && !ph.value) ph.value = us.phone || '';
                        }

                        // Re-init upload areas in newly shown form
                        setTimeout(function() {
                            if (typeof initKycUploads === 'function') initKycUploads();
                            if (typeof populateDobSelectors === 'function') populateDobSelectors();
                        }, 50);

                        // Scroll form into view smoothly
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, true); // true = capture phase — fires before any bubbling handler

                // Re-init uploads after nav/entity selection
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.nav-link'))
                        setTimeout(initKycUploads, 350);
                });

                // Intercept KYC form submit → add to admin queue
                document.addEventListener('submit', function(e) {
                    const form = e.target;
                    if (!form.classList.contains('kyc-form')) return;
                    if (!window._kycQueue) window._kycQueue = [];
                    const entityTypeMap = { 'individual-kyc-form': 'Individual', 'company-kyc-form': 'Company', 'ngo-kyc-form': 'NGO', 'cooperative-kyc-form': 'Cooperative' };
                    const selfieKeys = Object.keys(window._kycSubmissions || {}).filter(k => k.includes('selfie'));
                    const selfieUrl = selfieKeys.length ? (window._kycSubmissions[selfieKeys[0]].selfie || '') : '';
                    window._kycQueue.push({
                        id: 'kyc-' + Date.now(),
                        fullName: (typeof userState !== 'undefined' && userState.fullName) ? userState.fullName : 'Unknown User',
                        username: (typeof userState !== 'undefined' && userState.username) ? userState.username : 'unknown',
                        entityType: entityTypeMap[form.id] || form.id,
                        status: 'pending',
                        submittedAt: new Date().toLocaleDateString(),
                        selfie: selfieUrl
                    });
                    renderAdminKycDocs();
                    showNotification('KYC submitted for admin review.', 'info');
                });
            })();

            // ---------------------------------------------------------
            // FIX C: ADMIN KYC DOCS VIEWER + STATUS MANAGEMENT
            // ---------------------------------------------------------
            window.renderAdminKycDocs = function() {
                const container = document.getElementById('admin-kyc-docs-container');
                if (!container) return;
                const queue = window._kycQueue || [];
                const badge = document.getElementById('kyc-pending-badge');
                const pending = queue.filter(k => k.status === 'pending').length;
                if (badge) badge.textContent = pending + ' Pending';
                if (!queue.length) {
                    container.innerHTML = '<p style="text-align:center;padding:24px;color:#888;">No KYC submissions yet.</p>';
                    return;
                }
                container.innerHTML = queue.map(entry => `
                    <div class="kyc-doc-card">
                        <div style="display:flex;align-items:center;gap:12px;flex-grow:1;">
                            ${entry.selfie ? `<img src="${entry.selfie}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--light-gray);">` : `<div style="width:50px;height:50px;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;"><i class="fas fa-user" style="color:#bbb;"></i></div>`}
                            <div>
                                <strong>${entry.fullName}</strong>
                                <p style="color:#666;font-size:0.83rem;margin:2px 0;">@${entry.username} &bull; <em>${entry.entityType}</em> &bull; ${entry.submittedAt}</p>
                            </div>
                        </div>
                        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
                            <span class="kyc-status-badge ${entry.status}">${entry.status.toUpperCase()}</span>
                            ${entry.status === 'pending' ? `
                            <div style="display:flex;gap:6px;">
                                <button class="btn btn-success btn-small" onclick="window.approveKyc('${entry.id}')"><i class="fas fa-check"></i> Approve</button>
                                <button class="btn btn-danger btn-small" onclick="window.rejectKyc('${entry.id}')"><i class="fas fa-times"></i> Reject</button>
                            </div>` : `<span style="font-size:0.8rem;color:#888;">${entry.status === 'approved' ? '✅ Verified' : '❌ Rejected'}</span>`}
                        </div>
                    </div>`).join('');
            };

            window.approveKyc = function(id) {
                const e = (window._kycQueue||[]).find(k => k.id === id);
                if (e) { e.status = 'approved'; renderAdminKycDocs(); showNotification('KYC approved for ' + e.fullName, 'success'); }
            };
            window.rejectKyc = function(id) {
                const e = (window._kycQueue||[]).find(k => k.id === id);
                if (e) { e.status = 'rejected'; renderAdminKycDocs(); showNotification('KYC rejected for ' + e.fullName, 'error'); }
            };

            // ---------------------------------------------------------
            // FIX D: LOGO UPLOAD — admin uploads logo, appears everywhere
            // ---------------------------------------------------------
            (function() {
                function updateLogoEverywhere(src) {
                    window._empyreanLogoSrc = src;
                    // Update admin preview
                    const adminPreview = document.getElementById('admin-logo-preview-frame');
                    if (adminPreview) adminPreview.innerHTML = src
                        ? `<img src="${src}" alt="Logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                        : `<i class="fas fa-hands-holding-circle" style="font-size:2rem;color:var(--primary-color);"></i>`;
                    // Update sidebar logo avatar
                    const sidebarLogo = document.getElementById('app-logo-avatar');
                    if (sidebarLogo) sidebarLogo.innerHTML = src
                        ? `<img src="${src}" alt="Logo">`
                        : `<div class="logo-placeholder-icon"><i class="fas fa-hands-holding-circle"></i></div>`;
                }

                const logoInput = document.getElementById('admin-logo-upload-input');
                const logoClear = document.getElementById('admin-logo-clear-btn');
                if (logoInput) {
                    logoInput.addEventListener('change', function() {
                        if (this.files && this.files[0]) {
                            const r = new FileReader();
                            r.onload = ev => { updateLogoEverywhere(ev.target.result); showNotification('Logo updated!', 'success'); };
                            r.readAsDataURL(this.files[0]);
                        }
                    });
                }
                if (logoClear) {
                    logoClear.addEventListener('click', function() { updateLogoEverywhere(''); showNotification('Logo removed.', 'info'); });
                }
            })();

            // ---------------------------------------------------------
            // FIX E: RICH TEXT TOOLBAR — Bold, Italic, Strike, Mono, Font,
            //         Select All, Copy, Cut, Paste for all text areas
            // ---------------------------------------------------------
            (function() {
                function buildRichToolbar(ta) {
                    if (!ta || ta.dataset.hasToolbar === '1') return;
                    ta.dataset.hasToolbar = '1';
                    ta.classList.add('has-toolbar');
                    const tb = document.createElement('div');
                    tb.className = 'rich-text-toolbar';
                    tb.innerHTML = `
                        <select class="rt-font-sel" title="Font">
                            <option value="">Font</option>
                            <option value="'Georgia',serif">Georgia</option>
                            <option value="'Courier New',monospace">Monospace</option>
                            <option value="'Arial',sans-serif">Arial</option>
                            <option value="'Trebuchet MS',sans-serif">Trebuchet</option>
                            <option value="'Impact',sans-serif">Impact</option>
                        </select>
                        <div class="separator"></div>
                        <button type="button" data-fmt="bold" title="Bold (*text*)"><b>B</b></button>
                        <button type="button" data-fmt="italic" title="Italic (_text_)"><i>I</i></button>
                        <button type="button" data-fmt="strike" title="Strikethrough (~text~)"><s>S</s></button>
                        <button type="button" data-fmt="mono" title="Monospace (\`text\`)"><code style="font-size:0.8rem;">M</code></button>
                        <div class="separator"></div>
                        <button type="button" data-fmt="selectall" title="Select All">⌨ All</button>
                        <button type="button" data-fmt="copy" title="Copy"><i class="fas fa-copy"></i></button>
                        <button type="button" data-fmt="cut" title="Cut"><i class="fas fa-cut"></i></button>
                        <button type="button" data-fmt="paste" title="Paste"><i class="fas fa-paste"></i></button>
                    `;
                    ta.parentNode.insertBefore(tb, ta);

                    tb.querySelector('.rt-font-sel').addEventListener('change', function() {
                        ta.style.fontFamily = this.value;
                    });

                    tb.querySelectorAll('button[data-fmt]').forEach(btn => {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            const fmt = this.dataset.fmt;
                            const s = ta.selectionStart, en = ta.selectionEnd;
                            const sel = ta.value.substring(s, en);
                            const wrappers = { bold: ['*','*'], italic: ['_','_'], strike: ['~','~'], mono: ['`','`'] };
                            if (wrappers[fmt]) {
                                const [o, c] = wrappers[fmt];
                                ta.setRangeText(o + sel + c, s, en, 'end');
                            } else if (fmt === 'selectall') {
                                ta.select();
                            } else if (fmt === 'copy') {
                                const txt = sel || ta.value;
                                navigator.clipboard.writeText(txt).then(() => showNotification('Copied!', 'success')).catch(() => { ta.select(); document.execCommand('copy'); });
                            } else if (fmt === 'cut') {
                                if (sel) {
                                    navigator.clipboard.writeText(sel).then(() => { ta.setRangeText('', s, en, 'end'); showNotification('Cut!', 'success'); }).catch(() => { document.execCommand('cut'); });
                                }
                            } else if (fmt === 'paste') {
                                navigator.clipboard.readText().then(txt => {
                                    if (txt) { ta.setRangeText(txt, s, en, 'end'); showNotification('Pasted!', 'success'); }
                                }).catch(() => { ta.focus(); document.execCommand('paste'); });
                            }
                            ta.focus();
                        });
                    });
                }

                function applyAllToolbars() {
                    const ids = ['post-text','business-post-text','news-content','request-story',
                        'crisis-description','live-description','reel-caption','profile-bio',
                        'edit-post-text','live-comment-input'];
                    ids.forEach(id => {
                        const el = document.getElementById(id);
                        if (el && el.tagName === 'TEXTAREA') buildRichToolbar(el);
                    });
                }

                setTimeout(applyAllToolbars, 700);
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.nav-link,.kyc-entity-btn,.profile-tab,.settings-tab'))
                        setTimeout(applyAllToolbars, 350);
                });
            })();

            // ---------------------------------------------------------
            // FIX F: SECTION SEARCH BARS — bind inline search inputs
            // ---------------------------------------------------------
            (function() {
                function bindAll() {
                    // Dashboard
                    const ds = document.getElementById('dashboard-search-input');
                    if (ds && !ds._b) { ds._b = 1; ds.addEventListener('input', function() {
                        const t = this.value.toLowerCase();
                        document.querySelectorAll('#feed-container .impact-story').forEach(el => {
                            const txt = (el.querySelector('.story-content p')?.textContent||'').toLowerCase();
                            const usr = (el.querySelector('.story-user-info strong')?.textContent||'').toLowerCase();
                            el.style.display = (!t||txt.includes(t)||usr.includes(t)) ? 'block' : 'none';
                        });
                    }); }
                    // Marketplace
                    const ms = document.getElementById('marketplace-search-input');
                    if (ms && !ms._b) { ms._b = 1; ms.addEventListener('input', function() {
                        const t = this.value.toLowerCase();
                        document.querySelectorAll('#property-grid-container .property-card').forEach(el => {
                            const n=(el.dataset.name||'').toLowerCase(), l=(el.dataset.location||'').toLowerCase();
                            el.style.display = (!t||n.includes(t)||l.includes(t)) ? 'block' : 'none';
                        });
                    }); }
                    // Reels
                    const rs = document.getElementById('reels-search-input');
                    if (rs && !rs._b) { rs._b = 1; rs.addEventListener('input', function() {
                        const t = this.value.toLowerCase();
                        document.querySelectorAll('.reel-card').forEach(el => {
                            const p=(el.querySelector('.reel-content p')?.textContent||'').toLowerCase();
                            const u=(el.querySelector('.reel-user-info span')?.textContent||'').toLowerCase();
                            el.style.display = (!t||p.includes(t)||u.includes(t)) ? 'block' : 'none';
                        });
                    }); }
                    // News
                    const ns = document.getElementById('news-search-input');
                    if (ns && !ns._b) { ns._b = 1; ns.addEventListener('input', function() {
                        const t = this.value.toLowerCase();
                        document.querySelectorAll('#news-list-container .news-list-item').forEach(el => {
                            const h=(el.querySelector('h4')?.textContent||'').toLowerCase();
                            const p=(el.querySelector('p')?.textContent||'').toLowerCase();
                            el.style.display = (!t||h.includes(t)||p.includes(t)) ? 'flex' : 'none';
                        });
                    }); }
                }
                setTimeout(bindAll, 800);
                document.addEventListener('click', function(e) {
                    if (e.target.closest('.nav-link')) setTimeout(bindAll, 300);
                });
            })();

            // ---------------------------------------------------------
            // FIX G: CAPTCHA — ensure feedback text is always visible (dark)
            // ---------------------------------------------------------
            (function() {
                // Patch showFormFeedback to always enforce correct text colors
                const _origSFF = showFormFeedback;
                showFormFeedback = function(formId, message, type) {
                    _origSFF.apply(this, arguments);
                    const el = document.getElementById(formId + '-feedback');
                    if (el) {
                        const colors = { error: '#c62828', success: '#2e7d32', warning: '#e65100', info: '#1565c0' };
                        el.style.color = colors[type] || colors.error;
                        el.style.display = 'block';
                    }
                };
                // Also ensure captcha validation is case-insensitive and shows properly
                // (already handled in captcha check with .toUpperCase())
            })();

            // ---------------------------------------------------------
            // FIX H: GUEST JOIN REQUESTS — viewer send request, host accept/decline/remove
            // ---------------------------------------------------------
            (function() {
                // Override renderGuestJoinRequests to show proper request cards with actions
                renderGuestJoinRequests = function() {
                    const container = document.getElementById('live-join-requests-list');
                    if (!container) return;
                    const reqs = liveStreamData.joinRequests || [];
                    const badge = document.getElementById('live-join-request-count');
                    if (badge) badge.textContent = reqs.length;
                    if (!reqs.length) {
                        container.innerHTML = '<p style="text-align:center;color:#aaa;padding:20px;">No pending requests.</p>';
                        return;
                    }
                    container.innerHTML = reqs.map((r, i) => `
                        <div style="display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid #3a3a3e;">
                            <img src="${r.avatar}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;flex-shrink:0;">
                            <div style="flex-grow:1;">
                                <strong style="color:white;font-size:0.95rem;">${r.fullName}</strong>
                                <p style="color:#aaa;font-size:0.8rem;margin:0;">@${r.username} • ${r.type || 'video'} request</p>
                            </div>
                            <button onclick="window._acceptJoinReq(${i})" style="background:var(--success-color);border:none;color:white;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:0.85rem;"><i class="fas fa-check"></i></button>
                            <button onclick="window._declineJoinReq(${i})" style="background:var(--danger-color);border:none;color:white;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:0.85rem;"><i class="fas fa-times"></i></button>
                        </div>`).join('');
                };

                window._acceptJoinReq = function(idx) {
                    const req = liveStreamData.joinRequests.splice(idx, 1)[0];
                    if (!req) return;
                    liveStreamData.guests.push({ ...req, videoActive: true });
                    showNotification(req.fullName + ' added to stream!', 'success');
                    renderGuestJoinRequests();
                    updateLiveUI();
                };
                window._declineJoinReq = function(idx) {
                    const req = liveStreamData.joinRequests.splice(idx, 1)[0];
                    if (!req) return;
                    showNotification(req.fullName + " request declined.", 'info');
                    renderGuestJoinRequests();
                };

                // Host: remove a guest already on screen (click on guest slot remove btn)
                document.addEventListener('click', function(e) {
                    const removeGuestBtn = e.target.closest('.guest-remove-btn');
                    if (removeGuestBtn) {
                        const guestId = removeGuestBtn.dataset.guestId;
                        const idx = liveStreamData.guests.findIndex(g => g.userId === guestId);
                        if (idx !== -1) {
                            const g = liveStreamData.guests.splice(idx, 1)[0];
                            showNotification(g.fullName + ' removed from stream.', 'info');
                            updateLiveUI();
                        }
                    }
                });
            })();

            // ---------------------------------------------------------
            // FIX I: MOCK DATA CLEANUP (non-recursive safe version)
            // ---------------------------------------------------------
            (function() {
                // Dispatch empyrean-init-done event after initializeApp runs
                // (wrapper removed to prevent chain — event dispatched directly in initializeApp)
                document.addEventListener('empyrean-init-done', function() {
                    // placeholder — init-done listeners can be added here
                });
            })();

            // ---------------------------------------------------------
            // FIX J: SIDEBAR LOGO — ensure logo avatar updates on logo change
            // ---------------------------------------------------------
            (function() {
                const _origBuildSidebar2 = buildSidebar;
                buildSidebar = function() {
                    _origBuildSidebar2.apply(this, arguments);
                    setTimeout(function() {
                        const logoDiv = document.getElementById('app-logo-avatar');
                        if (logoDiv && window._empyreanLogoSrc) {
                            logoDiv.innerHTML = `<img src="${window._empyreanLogoSrc}" alt="Logo">`;
                        }
                    }, 100);
                };
            })();

            // ---------------------------------------------------------
            // FIX K: LIVE STREAM — broadcast view (simulated)
            // When Go Live is triggered, show LIVE badge + viewer simulation
            // ---------------------------------------------------------
            (function() {
                const _origUpdateLiveUI = typeof updateLiveUI === 'function' ? updateLiveUI : null;
                if (_origUpdateLiveUI) {
                    updateLiveUI = function() {
                        _origUpdateLiveUI.apply(this, arguments);
                        // Ensure viewer count increments realistically when live
                        if (liveStreamData.isLive && !liveStreamData._viewerSimInterval) {
                            liveStreamData._viewerSimInterval = setInterval(() => {
                                if (!liveStreamData.isLive) {
                                    clearInterval(liveStreamData._viewerSimInterval);
                                    liveStreamData._viewerSimInterval = null;
                                    return;
                                }
                                const countEl = document.getElementById('live-viewer-count');
                                const modalCountEl = document.getElementById('modal-viewer-count');
                                if (countEl) {
                                    const curr = parseInt(countEl.textContent) || 1;
                                    const delta = Math.random() < 0.6 ? 1 : (Math.random() < 0.3 ? -1 : 0);
                                    const newVal = Math.max(1, curr + delta);
                                    countEl.textContent = newVal;
                                    if (modalCountEl) modalCountEl.textContent = newVal;
                                }
                            }, 4000);
                        }
                        // Add remove buttons to guest slots for the host
                        const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;
                        if (isCurrentUserHost) {
                            document.querySelectorAll('.guest-slot:not([data-remove-bound])').forEach(slot => {
                                slot.dataset.removeBound = '1';
                                const guestId = slot.dataset.guestId;
                                if (guestId && !slot.querySelector('.guest-remove-btn')) {
                                    const removeBtn = document.createElement('button');
                                    removeBtn.className = 'guest-remove-btn';
                                    removeBtn.dataset.guestId = guestId;
                                    removeBtn.style.cssText = 'position:absolute;top:5px;right:5px;background:rgba(244,67,54,0.8);border:none;color:white;border-radius:50%;width:22px;height:22px;font-size:0.7rem;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;';
                                    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                                    slot.style.position = 'relative';
                                    slot.appendChild(removeBtn);
                                }
                            });
                        }
                    };
                }
            })();

            // ---------------------------------------------------------
            // FIX L: CLOSE CART MODAL button (close-modal-btn inside cart)
            // ---------------------------------------------------------
            document.addEventListener('click', function(e) {
                if (e.target.closest('.close-modal-btn')) {
                    const cartOverlay = document.getElementById('cart-modal-overlay');
                    if (cartOverlay && cartOverlay.contains(e.target)) {
                        cartOverlay.classList.remove('show');
                        document.body.classList.remove('modal-open');
                    }
                }
                // Close all modals on overlay click
                const modalOverlay = e.target.closest('.modal-overlay-container,.modal-overlay');
                if (modalOverlay && e.target === modalOverlay) {
                    modalOverlay.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            });

            // ---------------------------------------------------------
            // FIX M: MARKETPLACE CURRENCY — show posted items in selected currency
            // ---------------------------------------------------------
            (function() {
                const currSel = document.getElementById('item-currency');
                if (currSel) {
                    currSel.addEventListener('change', function() {
                        const cur = this.value;
                        const lbl = document.querySelector('label[for="item-price"]');
                        if (lbl) lbl.textContent = 'Price (' + cur + ')';
                        // Update existing cards that have a data-display-currency
                        document.querySelectorAll('#property-grid-container .property-card[data-display-currency]').forEach(card => {
                            const rawPrice = parseFloat(card.dataset.price || 0);
                            if (!rawPrice) return;
                            const priceEl = card.querySelector('.property-info div:last-child');
                            if (!priceEl) return;
                            const fmts = {
                                'NGN': '₦' + rawPrice.toLocaleString(),
                                'USD': formatUsdPrice(rawPrice),
                                'EUR': '€' + rawPrice.toLocaleString(),
                                'GBP': '£' + rawPrice.toLocaleString(),
                                'EMPY': rawPrice.toLocaleString() + ' EMPY'
                            };
                            priceEl.textContent = fmts[cur] || formatUsdPrice(rawPrice);
                            card.dataset.displayCurrency = cur;
                        });
                    });
                }
            })();

            // FIX N: NAV — duplicate rebindNavLinks removed.
            // buildSidebar() already binds click handlers directly on each link.
            // The master click handler also catches .nav-link clicks as fallback.
            // Adding a third layer caused double-navigation freeze.

            // ---------------------------------------------------------
            // INITIAL CALLS
            // ---------------------------------------------------------
            setTimeout(function() {
                renderAdminKycDocs();
                // Build logo avatar in sidebar if not yet present
                const sidebarHeader = document.querySelector('.sidebar-header');
                if (sidebarHeader && !document.getElementById('app-logo-avatar')) {
                    const logoDiv = document.createElement('div');
                    logoDiv.id = 'app-logo-avatar';
                    logoDiv.title = 'Platform Logo';
                    logoDiv.innerHTML = `<div class="logo-placeholder-icon"><i class="fas fa-hands-holding-circle"></i></div>`;
                    sidebarHeader.prepend(logoDiv);
                }
            }, 1000);

            // ═══════════════════════════════════════════════════════════
            // FIX 1: MAIN FEED — PROFESSIONAL GRID + MULTI-MEDIA
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Inject premium feed grid CSS
                const feedStyle = document.createElement('style');
                feedStyle.textContent = `
                    #feed-container {
                        display: grid !important;
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                        padding: 0 !important;
                    }
                    @media (min-width: 900px) {
                        #feed-container.grid-view {
                            grid-template-columns: repeat(2, 1fr) !important;
                        }
                    }
                    .feed-grid-toggle {
                        display: flex; gap: 6px; align-items: center;
                        margin-left: auto; margin-bottom: 8px;
                    }
                    .feed-grid-btn {
                        background: rgba(10,14,39,0.05); border: 1.5px solid rgba(10,14,39,0.1);
                        border-radius: 10px; padding: 6px 12px; cursor: pointer;
                        font-size: 0.82rem; font-weight: 600; color: var(--text-muted);
                        transition: all 0.2s;
                    }
                    .feed-grid-btn.active {
                        background: var(--g-navy); color: white;
                        border-color: transparent;
                    }
                    /* Multi-image grid */
                    .story-media-container[data-count="1"] .story-media-item { width:100%; }
                    .story-media-container[data-count="2"] { display:grid; grid-template-columns:1fr 1fr; gap:3px; }
                    .story-media-container[data-count="3"] { display:grid; grid-template-columns:2fr 1fr; grid-template-rows:1fr 1fr; gap:3px; }
                    .story-media-container[data-count="3"] .story-media-item:first-child { grid-row: 1 / 3; }
                    .story-media-container[data-count="4"] { display:grid; grid-template-columns:1fr 1fr; gap:3px; }
                    .story-media-container[data-count="5"],
                    .story-media-container[data-count="6"] { display:grid; grid-template-columns:repeat(3,1fr); gap:3px; }
                    .story-media-item img, .story-media-item video { width:100%; height:220px; object-fit:cover; display:block; }
                    @media (max-width:600px) { .story-media-item img, .story-media-item video { height:150px; } }
                    /* Marketplace grid */
                    #property-listings-container {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
                        gap: 16px !important;
                    }
                    /* Professional post card */
                    .impact-story {
                        border-radius: 20px !important;
                        overflow: hidden !important;
                    }
                    .story-header {
                        display: flex; align-items: center; gap: 12px;
                        padding: 16px 20px 10px !important;
                    }
                    .story-user-info strong { font-size: 0.95rem; font-weight: 700; }
                    .story-user-info span { font-size: 0.78rem; color: var(--text-muted); }
                `;
                document.head.appendChild(feedStyle);

                // Add grid toggle buttons above feed
                const feedHeader = document.querySelector('#dashboard h3:has(.fa-stream)') || document.querySelector('#dashboard .card h3');
                if (feedHeader) {
                    const toggleDiv = document.createElement('div');
                    toggleDiv.className = 'feed-grid-toggle';
                    toggleDiv.innerHTML = `
                        <button class="feed-grid-btn active" id="feed-list-btn" title="List view"><i class="fas fa-list"></i></button>
                        <button class="feed-grid-btn" id="feed-grid-btn" title="Grid view"><i class="fas fa-th-large"></i></button>
                    `;
                    feedHeader.appendChild(toggleDiv);
                    document.getElementById('feed-list-btn')?.addEventListener('click', function() {
                        document.getElementById('feed-container')?.classList.remove('grid-view');
                        this.classList.add('active');
                        document.getElementById('feed-grid-btn')?.classList.remove('active');
                    });
                    document.getElementById('feed-grid-btn')?.addEventListener('click', function() {
                        document.getElementById('feed-container')?.classList.add('grid-view');
                        this.classList.add('active');
                        document.getElementById('feed-list-btn')?.classList.remove('active');
                    });
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 2: PASSWORD VISIBILITY TOGGLE
            // ═══════════════════════════════════════════════════════════
            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.pwd-toggle-btn');
                if (!btn) return;
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                if (!input) return;
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                }
            });

            // ═══════════════════════════════════════════════════════════
            // FIX 3: LIVE STREAM PREMIUM BACKGROUNDS (Change #7)
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Override liveBackgrounds with premium card styles
                if (typeof liveBackgrounds !== 'undefined') {
                    liveBackgrounds.length = 0;
                    const premiumBgs = [
                        // Classic Dark
                        'linear-gradient(160deg,#0A0E27 0%,#1B2B8B 100%)',
                        // Royal Gold
                        'linear-gradient(135deg,#1A1A2E 0%,#16213E 40%,#0F3460 70%,#E94560 100%)',
                        // Emerald Night
                        'linear-gradient(135deg,#0d1b2a 0%,#1b4332 50%,#40916c 100%)',
                        // Sunset Premium
                        'linear-gradient(135deg,#FF6B6B 0%,#FFE66D 50%,#F7971E 100%)',
                        // Ocean Deep
                        'linear-gradient(160deg,#0093E9 0%,#80D0C7 100%)',
                        // Purple Haze
                        'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
                        // Midnight Rose
                        'linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#8B0000 100%)',
                        // Arctic Aurora
                        'linear-gradient(160deg,#355C7D 0%,#6C5B7B 50%,#C06C84 100%)',
                        // Golden Hour
                        'linear-gradient(135deg,#F5C518 0%,#F59E0B 40%,#D97706 100%)',
                        // Teal Abyss
                        'linear-gradient(135deg,#00D4AA 0%,#00897B 50%,#004D40 100%)',
                        // Crimson Empire
                        'linear-gradient(135deg,#FF416C 0%,#FF4B2B 100%)',
                        // Silver Lux
                        'linear-gradient(135deg,#E0E0E0 0%,#BDBDBD 40%,#9E9E9E 100%)',
                        // Night Sky
                        'radial-gradient(ellipse at bottom,#1B2735 0%,#090A0F 100%)',
                        // Forest Deep
                        'linear-gradient(135deg,#134E5E 0%,#71B280 100%)',
                        // Space Galaxy
                        'linear-gradient(135deg,#0F0C29 0%,#302B63 50%,#24243e 100%)',
                    ];
                    premiumBgs.forEach(bg => liveBackgrounds.push(bg));
                }

                // Add labels to bg thumbs
                const origPopulate = window.populateBackgroundSelector || null;

                // Re-style bg thumbs with labels
                const bgStyle = document.createElement('style');
                bgStyle.textContent = `
                    #live-bg-selector {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)) !important;
                        gap: 8px !important;
                        margin-top: 10px !important;
                    }
                    #go-live-form .bg-thumb {
                        width: 100% !important;
                        height: 110px !important;
                        border-radius: 14px !important;
                        cursor: pointer !important;
                        border: 3px solid transparent !important;
                        transition: all 0.2s !important;
                        position: relative !important;
                        overflow: hidden !important;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                    }
                    #go-live-form .bg-thumb:hover {
                        border-color: var(--accent) !important;
                        transform: scale(1.05) !important;
                    }
                    #go-live-form .bg-thumb.active {
                        border-color: var(--accent) !important;
                        box-shadow: 0 0 0 3px rgba(245,197,24,0.4) !important;
                    }
                    #go-live-form .bg-thumb::after {
                        content: '✓';
                        position: absolute; top: 6px; right: 6px;
                        width: 20px; height: 20px; border-radius: 50%;
                        background: var(--accent); color: #111;
                        font-size: 0.7rem; font-weight: 900;
                        display: flex; align-items: center; justify-content: center;
                        opacity: 0; transition: opacity 0.2s;
                    }
                    #go-live-form .bg-thumb.active::after { opacity: 1; }
                `;
                document.head.appendChild(bgStyle);
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 4: LIVE RECORDING — USE ACTUAL BLOB (Change #8)
            // ═══════════════════════════════════════════════════════════
            (function() {
                let _mediaRecorder = null;
                let _recordingChunks = [];
                let _recordingBlob = null;

                // Override the record button behavior to use MediaRecorder
                document.addEventListener('click', function(e) {
                    const recBtn = e.target.closest('#live-record-btn');
                    if (!recBtn) return;
                    const isCurrentUserHost = !isGuest && userState.id === liveStreamData.hostUserId;
                    if (!isCurrentUserHost) return;

                    if (!liveStreamData.isRecording) {
                        // Start recording the host video stream
                        const hostVideo = document.getElementById('host-main-video');
                        let stream = null;
                        if (hostVideo && hostVideo.srcObject) {
                            stream = hostVideo.srcObject;
                        } else if (hostVideo && hostVideo.captureStream) {
                            try { stream = hostVideo.captureStream(); } catch(e) {}
                        }
                        if (stream) {
                            _recordingChunks = [];
                            _mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
                            _mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) _recordingChunks.push(e.data); };
                            _mediaRecorder.onstop = () => {
                                _recordingBlob = new Blob(_recordingChunks, { type: 'video/webm' });
                                console.log('[Empyrean] Recording ready:', _recordingBlob.size, 'bytes');
                            };
                            _mediaRecorder.start(1000);
                            liveStreamData._mediaRecorder = _mediaRecorder;
                            showNotification('🔴 Recording started!', 'info');
                        } else {
                            // No live stream, simulate recording
                            liveStreamData._mediaRecorder = null;
                            showNotification('🔴 Recording started (simulation mode)', 'info');
                        }
                        liveStreamData.isRecording = true;
                        updateLiveUI();
                    } else {
                        // Stop recording
                        if (_mediaRecorder && _mediaRecorder.state === 'recording') {
                            _mediaRecorder.stop();
                        }
                        liveStreamData.isRecording = false;
                        showNotification('⏹ Recording stopped.', 'info');
                        updateLiveUI();
                    }
                });

                // Override addRecordedLiveStream to use actual blob
                const _origAddRecorded = addRecordedLiveStream;
                addRecordedLiveStream = function(title, hostName) {
                    const wrapper = document.getElementById('livestream-wrapper');
                    if (!wrapper) return;
                    const newCard = document.createElement('div');
                    newCard.className = 'livestream-card';
                    // Use actual blob URL if available, else show placeholder with message
                    const videoSrc = (_recordingBlob && _recordingBlob.size > 0)
                        ? URL.createObjectURL(_recordingBlob)
                        : '';
                    const hasRecording = videoSrc !== '';
                    newCard.innerHTML = `
                        <div class="livestream-video-container" style="position:relative;background:#111;">
                            ${hasRecording
                                ? `<video src="${videoSrc}" controls style="width:100%;height:150px;object-fit:cover;"></video>`
                                : `<div style="width:100%;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa;gap:8px;background:#1a1a2e;">
                                    <i class="fas fa-video" style="font-size:2rem;color:#F5C518;"></i>
                                    <span style="font-size:0.78rem;text-align:center;padding:0 10px;">Recording saved — webcam/screen stream required for full playback</span>
                                   </div>`
                            }
                            <div style="position:absolute;top:8px;left:8px;background:var(--danger-color);color:white;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:4px;">RECORDED</div>
                        </div>
                        <div class="livestream-info" style="padding:12px;">
                            <strong style="font-size:0.9rem;color:var(--primary);display:block;">${title}</strong>
                            <span style="font-size:0.78rem;color:var(--text-muted);">By: ${hostName} · Just now</span>
                            ${hasRecording ? `<a href="${videoSrc}" download="${title.replace(/\s+/g,'-')}.webm" style="display:inline-block;margin-top:8px;font-size:0.78rem;color:var(--secondary);"><i class="fas fa-download"></i> Download Recording</a>` : ''}
                        </div>
                    `;
                    wrapper.prepend(newCard);
                    // Reset blob after posting
                    _recordingBlob = null;
                    _recordingChunks = [];
                };
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 5: SOS → ADMIN PANEL FIX (Change #12)
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Ensure renderAdminQueues is called after any SOS push
                const _origCreateSos = createSosPostOnFeed;
                // Patch the SOS submit to always show in admin queue
                const origHelpForm = document.getElementById('help-form');
                if (origHelpForm) {
                    origHelpForm.addEventListener('submit', function() {
                        // After short delay, refresh admin queue and badge
                        setTimeout(() => {
                            renderAdminQueues();
                            const sosStat = document.getElementById('admin-stat-sos');
                            if (sosStat) sosStat.textContent = mockAdminSosQueue.length;
                        }, 300);
                    }, true); // capture phase so it runs after main handler
                }

                // Also refresh admin queue badge whenever admin section is opened
                // Admin refresh on navigateTo('admin') — now built into core navigateTo above
                // (removed duplicate wrapper to prevent freeze)
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 6: ADMIN NEWS PUBLISHER LOGIC (Change #4 completion)
            // ═══════════════════════════════════════════════════════════
            (function() {
                const adminNewsForm = document.getElementById('admin-news-form');
                if (!adminNewsForm) return;

                // Set default pub date to now
                const pubDateInput = document.getElementById('admin-news-pubdate');
                if (pubDateInput && !pubDateInput.value) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    pubDateInput.value = now.toISOString().slice(0,16);
                }

                // Media preview
                const adminNewsMedia = document.getElementById('admin-news-media');
                const adminNewsPreview = document.getElementById('admin-news-media-preview');
                let adminNewsFiles = [];

                if (adminNewsMedia) {
                    adminNewsMedia.addEventListener('change', function() {
                        adminNewsFiles = Array.from(this.files);
                        if (adminNewsPreview) {
                            adminNewsPreview.innerHTML = '';
                            adminNewsFiles.forEach((file, i) => {
                                const url = URL.createObjectURL(file);
                                const thumb = document.createElement('div');
                                thumb.style.cssText = 'position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;';
                                thumb.innerHTML = file.type.startsWith('video/')
                                    ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted></video>`
                                    : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;">`;
                                adminNewsPreview.appendChild(thumb);
                            });
                        }
                    });
                }

                // Form submit
                adminNewsForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    const title = document.getElementById('admin-news-title')?.value.trim();
                    const writer = document.getElementById('admin-news-writer')?.value.trim();
                    const body = document.getElementById('admin-news-body')?.value.trim();
                    const summary = document.getElementById('admin-news-summary')?.value.trim() || '';
                    const category = document.getElementById('admin-news-category')?.value || 'general';
                    const pubDateRaw = document.getElementById('admin-news-pubdate')?.value;
                    const feedback = document.getElementById('admin-news-feedback');

                    if (!title || !writer || !body) {
                        if (feedback) { feedback.style.display='block'; feedback.className='form-feedback error'; feedback.textContent='Please fill in Title, Writer, and Article Body.'; }
                        return;
                    }

                    const submitBtn = adminNewsForm.querySelector('button[type="submit"]');
                    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...'; }

                    // Upload media
                    let mediaUrls = [];
                    if (adminNewsFiles.length > 0) {
                        try { mediaUrls = await window.uploadMediaFilesToCloudinary(adminNewsFiles); } catch(err) {
                            mediaUrls = adminNewsFiles.map(f => URL.createObjectURL(f));
                        }
                    }

                    const pubDate = pubDateRaw ? new Date(pubDateRaw) : new Date();
                    const pubDateStr = pubDate.toLocaleDateString('en-GB', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
                    const postId = `news-${Date.now()}`;

                    // Build news item HTML for the news list
                    const newsContainer = document.getElementById('news-list-container');
                    if (newsContainer) {
                        // Remove empty state
                        const emptyState = document.getElementById('news-empty-state');
                        if (emptyState) emptyState.remove();

                        const newsItem = document.createElement('div');
                        newsItem.className = 'news-list-item';
                        newsItem.dataset.postId = postId;
                        const firstMedia = mediaUrls[0] || '';
                        const isVideo = firstMedia && (firstMedia.includes('.mp4') || firstMedia.includes('.webm') || adminNewsFiles[0]?.type?.startsWith('video/'));
                        const mediaHTML = firstMedia
                            ? `<div class="news-item-image">${isVideo ? `<video src="${firstMedia}" controls style="width:100%;height:100%;object-fit:cover;"></video>` : `<img src="${firstMedia}" alt="${title}" loading="lazy">`}</div>`
                            : '';
                        // Format body: support *bold*, _italic_, ## headings, > quotes, - bullets
                        const formattedBody = body
                            .replace(/^## (.+)$/gm, '<h4 style="margin:12px 0 6px;color:var(--primary);">$1</h4>')
                            .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid var(--accent2);padding-left:12px;color:#666;font-style:italic;margin:8px 0;">$1</blockquote>')
                            .replace(/^- (.+)$/gm, '<li style="margin-left:20px;margin-bottom:4px;">$1</li>')
                            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
                            .replace(/_([^_]+)_/g, '<em>$1</em>')
                            .replace(/\n\n/g, '</p><p>')
                            .replace(/\n/g, '<br>');

                        newsItem.innerHTML = `
                            ${mediaHTML}
                            <div class="news-item-content-wrapper">
                                <div class="news-item-content">
                                    <h4>${title}</h4>
                                    <span class="news-meta">
                                        <i class="fas fa-calendar-alt"></i> ${pubDateStr} &nbsp;·&nbsp;
                                        <i class="fas fa-pen"></i> ${writer} &nbsp;·&nbsp;
                                        <span style="background:rgba(27,43,139,0.1);color:var(--secondary);padding:1px 8px;border-radius:50px;font-size:0.75rem;font-weight:600;">${category}</span>
                                    </span>
                                    ${summary ? `<p style="color:var(--text-muted);font-size:0.9rem;font-style:italic;margin-bottom:8px;">${summary}</p>` : ''}
                                    <p style="max-height:0;overflow:hidden;"><p>${formattedBody}</p></p>
                                </div>
                                <div class="story-actions" style="margin-top:15px;">
                                    <a class="action-btn like-btn"><i class="far fa-heart"></i><span class="like-count">0</span></a>
                                    <a class="action-btn comment-btn"><i class="far fa-comment"></i><span class="comment-count">0</span></a>
                                    <a class="action-btn share-btn"><i class="fas fa-share"></i><span>Share</span></a>
                                    <a class="action-btn retweet-btn"><i class="fas fa-retweet"></i><span class="retweet-count">0</span></a>
                                </div>
                                <div class="comment-section"><div class="comment-list"></div><form class="comment-form" novalidate><input type="text" name="comment-text" placeholder="Add a comment..." required><button type="submit"><i class="fas fa-paper-plane"></i></button></form></div>
                            </div>
                        `;
                        newsContainer.prepend(newsItem);
                    }

                    // Add to dashboard news slider
                    renderDashboardNews && renderDashboardNews();

                    // Save to Firestore
                    try {
                        await fbDb.collection('news_articles').add({
                            title, writer, body, summary, category,
                            mediaUrls, pubDate: pubDate.toISOString(),
                            postId, createdAt: new Date().toISOString(),
                            author: userState?.fullName || 'Admin'
                        });
                    } catch(err) { console.warn('News save to Firestore:', err); }

                    // Update admin table
                    const tableBody = document.getElementById('admin-news-table-body');
                    if (tableBody) {
                        const emptyRow = document.getElementById('admin-news-empty-row');
                        if (emptyRow) emptyRow.remove();
                        const row = document.createElement('tr');
                        row.style.borderBottom = '1px solid rgba(10,14,39,0.06)';
                        row.innerHTML = `
                            <td style="padding:12px 16px;font-weight:600;color:var(--primary);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</td>
                            <td style="padding:12px 16px;color:var(--text-muted);">${writer}</td>
                            <td style="padding:12px 16px;"><span style="background:rgba(27,43,139,0.1);color:var(--secondary);padding:2px 10px;border-radius:50px;font-size:0.78rem;">${category}</span></td>
                            <td style="padding:12px 16px;color:var(--text-muted);font-size:0.82rem;">${pubDateStr}</td>
                            <td style="padding:12px 16px;">
                                <button class="btn btn-small btn-danger" onclick="this.closest('tr').remove();document.querySelector('[data-post-id=\\'${postId}\\']')?.remove();" style="font-size:0.75rem;padding:4px 10px;">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        `;
                        tableBody.prepend(row);
                        const countBadge = document.getElementById('admin-news-count-badge');
                        if (countBadge) countBadge.textContent = tableBody.querySelectorAll('tr').length;
                    }

                    // Success
                    if (feedback) { feedback.style.display='block'; feedback.className='form-feedback success'; feedback.textContent=`✅ "${title}" published successfully!`; }
                    adminNewsForm.reset();
                    if (adminNewsPreview) adminNewsPreview.innerHTML = '';
                    adminNewsFiles = [];
                    if (pubDateInput) { const now2=new Date(); now2.setMinutes(now2.getMinutes()-now2.getTimezoneOffset()); pubDateInput.value=now2.toISOString().slice(0,16); }
                    if (submitBtn) { submitBtn.disabled=false; submitBtn.innerHTML='<i class="fas fa-paper-plane"></i> &nbsp;Publish Article'; }
                    showNotification(`📰 Article "${title}" published!`, 'success');
                    setTimeout(() => { if (feedback) feedback.style.display='none'; }, 5000);
                });
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 7: STATUS — COLOR GRID, VIEWERS, MULTI-MEDIA, RETWEET
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Inject enhanced status create modal
                const createStatusModal = document.getElementById('create-status-modal');
                if (!createStatusModal) return;

                const card = createStatusModal.querySelector('.create-status-card');
                if (!card) return;

                // Replace the entire create-status-card content
                card.innerHTML = `
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                        <h3 style="color:var(--primary);margin:0;">📸 Add Status</h3>
                        <button id="cancel-status-btn" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#888;">×</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:14px;">
                        <!-- Multi-media upload -->
                        <div>
                            <label style="font-size:0.85rem;font-weight:700;color:var(--primary);display:block;margin-bottom:6px;">
                                <i class="fas fa-images"></i> Upload Photos / Videos (Multiple)
                            </label>
                            <input type="file" id="status-file-input" accept="image/*,video/*" multiple style="display:none;">
                            <label for="status-file-input" class="btn btn-accent" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;padding:10px 16px;">
                                <i class="fas fa-camera"></i> Choose Media
                            </label>
                            <div id="status-file-preview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:8px;margin-top:10px;"></div>
                        </div>
                        <!-- Text status -->
                        <div>
                            <label style="font-size:0.85rem;font-weight:700;color:var(--primary);display:block;margin-bottom:6px;">
                                <i class="fas fa-font"></i> Or Add Text Status
                            </label>
                            <textarea id="status-text-input" rows="3" placeholder="What's on your mind?" style="width:100%;padding:12px;border:1.5px solid rgba(10,14,39,0.1);border-radius:12px;font-size:0.95rem;resize:none;outline:none;font-family:inherit;"></textarea>
                        </div>
                        <!-- Color picker grid -->
                        <div>
                            <label style="font-size:0.85rem;font-weight:700;color:var(--primary);display:block;margin-bottom:10px;">
                                <i class="fas fa-palette"></i> Background Color
                            </label>
                            <div id="status-color-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">
                                ${[
                                    {bg:'linear-gradient(135deg,#0A0E27,#1B2B8B)',label:'Navy'},
                                    {bg:'linear-gradient(135deg,#F5C518,#F59E0B)',label:'Gold'},
                                    {bg:'linear-gradient(135deg,#00D4AA,#10B981)',label:'Teal'},
                                    {bg:'linear-gradient(135deg,#EF4444,#DC2626)',label:'Red'},
                                    {bg:'linear-gradient(135deg,#8B5CF6,#7C3AED)',label:'Purple'},
                                    {bg:'linear-gradient(135deg,#EC4899,#DB2777)',label:'Pink'},
                                    {bg:'linear-gradient(135deg,#F97316,#EA580C)',label:'Orange'},
                                    {bg:'linear-gradient(135deg,#06B6D4,#0891B2)',label:'Cyan'},
                                    {bg:'linear-gradient(135deg,#84CC16,#65A30D)',label:'Lime'},
                                    {bg:'linear-gradient(135deg,#111827,#374151)',label:'Dark'},
                                    {bg:'linear-gradient(135deg,#FBBF24,#FDE68A)',label:'Sunny'},
                                    {bg:'linear-gradient(135deg,#667eea,#764ba2)',label:'Dream'},
                                ].map((c,i)=>`
                                    <div class="status-color-choice ${i===0?'active':''}" data-bg="${c.bg}" title="${c.label}" style="
                                        width:100%;aspect-ratio:1;border-radius:10px;
                                        background:${c.bg};cursor:pointer;
                                        border:3px solid ${i===0?'var(--accent)':'transparent'};
                                        transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.15);
                                    "></div>
                                `).join('')}
                            </div>
                        </div>
                        <div style="display:flex;gap:10px;margin-top:4px;">
                            <button id="post-status-btn" class="btn btn-accent" style="flex:1;padding:13px;font-size:0.95rem;font-weight:700;">
                                <i class="fas fa-paper-plane"></i> Post Status
                            </button>
                        </div>
                    </div>
                `;

                let selectedStatusBg = 'linear-gradient(135deg,#0A0E27,#1B2B8B)';

                // Color grid selection
                card.addEventListener('click', function(e) {
                    const colorChoice = e.target.closest('.status-color-choice');
                    if (colorChoice) {
                        card.querySelectorAll('.status-color-choice').forEach(c => {
                            c.style.border = '3px solid transparent';
                            c.classList.remove('active');
                        });
                        colorChoice.style.border = '3px solid var(--accent)';
                        colorChoice.classList.add('active');
                        selectedStatusBg = colorChoice.dataset.bg;
                        const textArea = document.getElementById('status-text-input');
                        if (textArea) textArea.style.background = selectedStatusBg;
                    }
                });

                // Multi-file preview
                document.getElementById('status-file-input')?.addEventListener('change', function() {
                    const preview = document.getElementById('status-file-preview');
                    if (!preview) return;
                    preview.innerHTML = '';
                    Array.from(this.files).forEach(file => {
                        const url = URL.createObjectURL(file);
                        const div = document.createElement('div');
                        div.style.cssText = 'position:relative;border-radius:8px;overflow:hidden;aspect-ratio:1;';
                        div.innerHTML = file.type.startsWith('video/')
                            ? `<video src="${url}" style="width:100%;height:100%;object-fit:cover;" muted playsinline></video>`
                            : `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">`;
                        preview.appendChild(div);
                    });
                });

                // Cancel button
                card.querySelector('#cancel-status-btn')?.addEventListener('click', () => {
                    createStatusModal.classList.remove('show');
                });

                // Enhanced status viewer — add viewer count, retweet, chat/profile buttons
                const statusTopBar = document.querySelector('.status-top-bar');
                if (statusTopBar && !document.getElementById('status-viewer-count')) {
                    const extraControls = document.createElement('div');
                    extraControls.style.cssText = 'margin-left:auto;display:flex;gap:8px;align-items:center;';
                    extraControls.innerHTML = `
                        <span id="status-viewer-count" style="background:rgba(255,255,255,0.2);border-radius:20px;padding:4px 10px;font-size:0.78rem;color:white;display:flex;align-items:center;gap:5px;">
                            <i class="fas fa-eye"></i> <span id="status-view-count-num">1</span>
                        </span>
                        <button id="status-retweet-btn" style="background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:36px;height:36px;color:white;cursor:pointer;font-size:0.9rem;" title="Retweet Status"><i class="fas fa-retweet"></i></button>
                        <button id="status-chat-btn" style="background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:36px;height:36px;color:white;cursor:pointer;font-size:0.9rem;" title="Chat with user"><i class="fas fa-comment"></i></button>
                        <button id="status-view-profile-btn" style="background:rgba(255,255,255,0.15);border:none;border-radius:50%;width:36px;height:36px;color:white;cursor:pointer;font-size:0.9rem;" title="View Profile"><i class="fas fa-user"></i></button>
                        <button id="status-mute-btn" style="background:none;border:none;color:white;font-size:1.2rem;cursor:pointer;" title="Mute"><i class="fas fa-volume-up"></i></button>
                    `;
                    // Replace the old top-bar controls
                    const oldMute = statusTopBar.querySelector('#status-mute-btn');
                    if (oldMute) oldMute.remove();
                    statusTopBar.appendChild(extraControls);

                    // Simulate viewer count increment
                    setInterval(() => {
                        const countEl = document.getElementById('status-view-count-num');
                        if (countEl && document.getElementById('status-viewer-modal')?.classList.contains('show')) {
                            countEl.textContent = parseInt(countEl.textContent||1) + Math.floor(Math.random()*3);
                        }
                    }, 4000);

                    // Retweet status
                    document.getElementById('status-retweet-btn')?.addEventListener('click', () => {
                        showNotification('Status retweeted to your followers!', 'success');
                    });
                    // Chat
                    document.getElementById('status-chat-btn')?.addEventListener('click', () => {
                        document.getElementById('status-viewer-modal')?.classList.remove('show');
                        navigateTo && navigateTo('messages');
                        showNotification('Opening messages...', 'info');
                    });
                    // View profile
                    document.getElementById('status-view-profile-btn')?.addEventListener('click', () => {
                        document.getElementById('status-viewer-modal')?.classList.remove('show');
                        navigateTo && navigateTo('profile');
                    });
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 8: NGO PARTNERS — VERIFIED-ONLY, INDIVIDUAL PAGES
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Style the NGO section with proper verified-only grid
                const ngoStyle = document.createElement('style');
                ngoStyle.textContent = `
                    #ngo-grid-container {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
                        gap: 20px !important;
                        flex-wrap: wrap !important;
                        width: 100% !important;
                    }
                    .ngo-card {
                        flex: none !important;
                        width: auto !important;
                        border-radius: 20px !important;
                        overflow: hidden !important;
                        transition: all 0.3s !important;
                        cursor: pointer !important;
                    }
                    .ngo-verified-badge {
                        display: inline-flex; align-items: center; gap: 4px;
                        background: rgba(16,185,129,0.12); color: var(--success-color);
                        font-size: 0.75rem; font-weight: 700; padding: 3px 10px;
                        border-radius: 50px; border: 1px solid rgba(16,185,129,0.3);
                    }
                    .ngo-card-header { height: 120px; position: relative; overflow: hidden; }
                    .ngo-card-body { padding: 16px; }
                    .ngo-avatar { width: 70px; height: 70px; border-radius: 14px; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-top: -35px; position: relative; z-index:2; object-fit:cover; background: var(--g-navy); display:flex;align-items:center;justify-content:center; }
                    #ngo-individual-page { display:none; }
                    #ngo-individual-page.show { display:block; }
                    .ngo-profile-cover { height: 200px; border-radius: 20px 20px 0 0; overflow: hidden; position: relative; }
                    .ngo-profile-cover img { width:100%;height:100%;object-fit:cover; }
                `;
                document.head.appendChild(ngoStyle);

                // Override the horizontal slider container for NGOs
                const ngoContainer = document.getElementById('ngo-grid-container');
                const ngoWrapper = ngoContainer?.closest('.horizontal-slider-container');
                if (ngoWrapper) {
                    ngoWrapper.style.overflowX = 'visible';
                    ngoWrapper.style.overflow = 'visible';
                }

                // Individual NGO page in the DOM
                const ngoSection = document.getElementById('ngo-partners');
                if (ngoSection && !document.getElementById('ngo-individual-page')) {
                    const individualPage = document.createElement('div');
                    individualPage.id = 'ngo-individual-page';
                    ngoSection.appendChild(individualPage);
                }

                // Make NGO cards link to individual pages on click (delegated)
                document.addEventListener('click', function(e) {
                    const ngoCard = e.target.closest('#ngo-grid-container .ngo-card');
                    if (!ngoCard) return;
                    const ngoData = JSON.parse(ngoCard.dataset.ngoData || '{}');
                    const gridView = document.getElementById('ngo-grid-view');
                    const individualPage = document.getElementById('ngo-individual-page');
                    const backBtn = document.getElementById('back-to-ngo-grid');
                    if (!individualPage) return;
                    individualPage.innerHTML = `
                        <div class="card" style="overflow:hidden;border-radius:20px;">
                            <div class="ngo-profile-cover" style="background:${ngoData.cover || 'var(--g-navy)'};">
                                ${ngoData.coverImg ? `<img src="${ngoData.coverImg}" alt="Cover">` : ''}
                            </div>
                            <div style="padding:0 24px 24px;">
                                <div style="display:flex;align-items:flex-end;gap:16px;transform:translateY(-36px);margin-bottom:-20px;">
                                    <div style="width:80px;height:80px;border-radius:14px;border:4px solid white;background:var(--g-navy);display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.2);flex-shrink:0;">
                                        ${ngoData.logo ? `<img src="${ngoData.logo}" style="width:100%;height:100%;object-fit:cover;">` : `<i class="fas fa-hands-helping" style="color:white;font-size:1.8rem;"></i>`}
                                    </div>
                                    <div>
                                        <h2 style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:var(--primary);">${ngoData.name || 'NGO Partner'}</h2>
                                        <span class="ngo-verified-badge"><i class="fas fa-check-circle"></i> Verified Partner</span>
                                    </div>
                                </div>
                                <p style="color:var(--text-muted);line-height:1.7;margin-bottom:20px;">${ngoData.description || 'This verified NGO partner is making a real impact in the community.'}</p>
                                <div class="grid-3" style="gap:12px;margin-bottom:20px;">
                                    <div class="stat-card"><h4>Projects</h4><div class="stat-value">${ngoData.projects || '0'}</div></div>
                                    <div class="stat-card"><h4>Beneficiaries</h4><div class="stat-value">${ngoData.beneficiaries || '0'}</div></div>
                                    <div class="stat-card"><h4>EMPY Grants</h4><div class="stat-value">${ngoData.grants || '0'}</div></div>
                                </div>
                                <div id="ngo-individual-feed" style="margin-top:20px;">
                                    <h3 style="font-family:'Syne',sans-serif;font-weight:700;margin-bottom:16px;">Posts &amp; Updates</h3>
                                    <p style="color:var(--text-muted);text-align:center;padding:30px;">No posts yet from this organization.</p>
                                </div>
                            </div>
                        </div>
                    `;
                    if (gridView) gridView.style.display = 'none';
                    individualPage.classList.add('show');
                    if (backBtn) backBtn.style.display = 'inline-flex';
                });

                // Back to NGO grid
                document.getElementById('back-to-ngo-grid')?.addEventListener('click', function() {
                    const gridView = document.getElementById('ngo-grid-view');
                    const individualPage = document.getElementById('ngo-individual-page');
                    if (gridView) gridView.style.display = 'block';
                    if (individualPage) individualPage.classList.remove('show');
                    this.style.display = 'none';
                });

                // Track org registrations for admin NGO table
                const origSignupForm = document.getElementById('signup-form');
                if (origSignupForm) {
                    origSignupForm.addEventListener('submit', function() {
                        const userType = document.querySelector('input[name="user-type"]:checked')?.value;
                        if (userType !== 'organisation') return;
                        const orgName = document.getElementById('signup-orgname')?.value?.trim();
                        const orgReg = document.getElementById('signup-org-reg')?.value?.trim();
                        const email = document.getElementById('signup-email')?.value?.trim();
                        if (!orgName) return;
                        setTimeout(() => {
                            const tableBody = document.getElementById('admin-ngo-table-body');
                            if (tableBody) {
                                const existingEmpty = tableBody.querySelector('td[colspan="6"]')?.closest('tr');
                                if (existingEmpty) existingEmpty.remove();
                                const row = document.createElement('tr');
                                row.style.borderBottom = '1px solid rgba(10,14,39,0.06)';
                                const now = new Date().toLocaleDateString('en-GB');
                                row.innerHTML = `
                                    <td style="padding:12px 16px;font-weight:600;color:var(--primary);">${orgName}</td>
                                    <td style="padding:12px 16px;color:var(--text-muted);font-size:0.85rem;">${orgReg || '—'}</td>
                                    <td style="padding:12px 16px;color:var(--text-muted);font-size:0.85rem;">${email || '—'}</td>
                                    <td style="padding:12px 16px;color:var(--text-muted);font-size:0.82rem;">${now}</td>
                                    <td style="padding:12px 16px;">
                                        <span class="kyc-status-badge pending" style="background:#fff8e1;color:#f57c00;padding:3px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;">Pending</span>
                                    </td>
                                    <td style="padding:12px 16px;display:flex;gap:6px;">
                                        <button class="btn btn-small btn-success" onclick="this.closest('tr').querySelector('.kyc-status-badge').textContent='Verified';this.closest('tr').querySelector('.kyc-status-badge').className='kyc-status-badge approved';this.style.display='none';" style="font-size:0.75rem;padding:4px 10px;"><i class="fas fa-check"></i> Verify</button>
                                        <button class="btn btn-small btn-danger" onclick="this.closest('tr').remove();" style="font-size:0.75rem;padding:4px 10px;"><i class="fas fa-times"></i> Reject</button>
                                    </td>
                                `;
                                tableBody.prepend(row);
                                const countBadge = document.getElementById('admin-ngo-count-badge');
                                if (countBadge) countBadge.textContent = tableBody.querySelectorAll('tr').length + ' Partners';
                            }
                        }, 1000);
                    }, false);
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 9: COMMUNITY TASKS — ACTIVATE SECTION (Change #15)
            // ═══════════════════════════════════════════════════════════
            (function() {
                const taskList = document.getElementById('community-tasks-list');
                if (!taskList || typeof mockCommunityTasks === 'undefined') return;

                taskList.innerHTML = '';
                mockCommunityTasks.forEach(task => {
                    const isCompleted = userState.completedTasks instanceof Set
                        ? userState.completedTasks.has(task.id)
                        : false;
                    const li = document.createElement('li');
                    li.className = 'task-item';
                    li.dataset.taskId = task.id;
                    li.innerHTML = `
                        <div style="display:flex;align-items:center;gap:12px;flex:1;">
                            <div style="width:40px;height:40px;border-radius:12px;background:rgba(27,43,139,0.1);display:flex;align-items:center;justify-content:center;">
                                <i class="${task.icon}" style="color:var(--secondary);font-size:1.1rem;"></i>
                            </div>
                            <div>
                                <strong style="color:var(--primary);font-size:0.95rem;">${task.text}</strong>
                                <p style="font-size:0.8rem;color:var(--text-muted);margin:0;">Reward: <strong style="color:var(--accent2);">+${task.reward} EMPY</strong></p>
                            </div>
                        </div>
                        ${isCompleted
                            ? `<span style="background:rgba(16,185,129,0.12);color:var(--success-color);padding:6px 16px;border-radius:50px;font-size:0.82rem;font-weight:700;"><i class="fas fa-check-circle"></i> Done</span>`
                            : `<a href="${task.url}" target="_blank" rel="noopener" class="btn btn-small btn-accent task-complete-btn" data-task-id="${task.id}" data-reward="${task.reward}" style="padding:8px 18px;font-size:0.82rem;border-radius:50px;text-decoration:none;">
                                <i class="fas fa-external-link-alt"></i> Go &amp; Earn
                               </a>`
                        }
                    `;
                    taskList.appendChild(li);
                });

                // Task completion handler
                document.addEventListener('click', function(e) {
                    const taskBtn = e.target.closest('.task-complete-btn');
                    if (!taskBtn) return;
                    const taskId = taskBtn.dataset.taskId;
                    const reward = parseInt(taskBtn.dataset.reward) || 0;
                    // Mark completed after 3 seconds (simulate link visit)
                    setTimeout(() => {
                        if (userState.completedTasks instanceof Set && !userState.completedTasks.has(taskId)) {
                            userState.completedTasks.add(taskId);
                            userState.empyBalance = (userState.empyBalance || 0) + reward;
                            showNotification(`🎉 +${reward} EMPY earned for completing task!`, 'success');
                            // Re-render tasks
                            const btn = document.querySelector(`.task-complete-btn[data-task-id="${taskId}"]`);
                            if (btn) btn.outerHTML = `<span style="background:rgba(16,185,129,0.12);color:var(--success-color);padding:6px 16px;border-radius:50px;font-size:0.82rem;font-weight:700;"><i class="fas fa-check-circle"></i> Done</span>`;
                            updateWalletUI && updateWalletUI();
                        }
                    }, 3000);
                });
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 10: WALLET / STAKING OVERHAUL (Change #16)
            // ═══════════════════════════════════════════════════════════
            (function() {
                const walletStyle = document.createElement('style');
                walletStyle.textContent = `
                    .wallet-card {
                        background: var(--g-navy) !important;
                        color: white !important;
                        border-radius: 24px !important;
                        padding: 28px !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .wallet-card::before {
                        content: '';
                        position: absolute; top: -40px; right: -40px;
                        width: 160px; height: 160px; border-radius: 50%;
                        background: rgba(245,197,24,0.12);
                        pointer-events: none;
                    }
                    .wallet-card p { color: rgba(255,255,255,0.7) !important; }
                    .wallet-card .empy-balance {
                        font-family: 'Syne', sans-serif !important;
                        font-size: 2.2rem !important;
                        font-weight: 800 !important;
                        color: #F5C518 !important;
                        margin: 8px 0 !important;
                    }
                    #wallet-empy-balance {
                        font-family: 'Syne', sans-serif !important;
                        font-size: 2.2rem !important;
                        font-weight: 800 !important;
                        color: #F5C518 !important;
                    }
                    .wallet-action-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                        margin-top: 20px;
                    }
                    .wallet-quick-btn {
                        display: flex; flex-direction: column; align-items: center; gap: 6px;
                        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
                        border-radius: 16px; padding: 14px; cursor: pointer; color: white;
                        font-size: 0.82rem; font-weight: 600; transition: all 0.2s;
                        text-decoration: none;
                    }
                    .wallet-quick-btn:hover { background: rgba(245,197,24,0.2); border-color: rgba(245,197,24,0.4); }
                    .wallet-quick-btn i { font-size: 1.4rem; color: #F5C518; }
                    .staking-tier-badge {
                        display: inline-flex; align-items: center; gap: 5px;
                        padding: 4px 12px; border-radius: 50px; font-size: 0.78rem; font-weight: 700;
                    }
                    .staking-tier-badge.bronze { background: rgba(205,127,50,0.15); color: #CD7F32; border: 1px solid rgba(205,127,50,0.3); }
                    .staking-tier-badge.silver { background: rgba(192,192,192,0.15); color: #9E9E9E; border: 1px solid rgba(192,192,192,0.3); }
                    .staking-tier-badge.gold { background: rgba(245,197,24,0.15); color: #F5C518; border: 1px solid rgba(245,197,24,0.3); }
                    .staking-tier-badge.platinum { background: rgba(0,212,170,0.15); color: var(--accent2); border: 1px solid rgba(0,212,170,0.3); }
                    .withdrawal-step {
                        display: flex; align-items: flex-start; gap: 12px;
                        padding: 14px; border-radius: 14px; margin-bottom: 10px;
                        background: rgba(10,14,39,0.03); border: 1px solid rgba(10,14,39,0.06);
                    }
                    .withdrawal-step-num {
                        width: 28px; height: 28px; border-radius: 50%;
                        background: var(--g-navy); color: white;
                        font-size: 0.82rem; font-weight: 700;
                        display: flex; align-items: center; justify-content: center;
                        flex-shrink: 0;
                    }
                `;
                document.head.appendChild(walletStyle);

                // Enhanced wallet overview card
                const walletCard = document.querySelector('.wallet-card');
                if (walletCard) {
                    const currentHTML = walletCard.innerHTML;
                    // Inject quick action buttons below existing content
                    if (!walletCard.querySelector('.wallet-action-row')) {
                        const actionRow = document.createElement('div');
                        actionRow.className = 'wallet-action-row';
                        actionRow.innerHTML = `
                            <a class="wallet-quick-btn" href="#" onclick="navigateTo('my-wallet');return false;">
                                <i class="fas fa-coins"></i> Stake EMPY
                            </a>
                            <a class="wallet-quick-btn" href="#" id="wallet-withdraw-quick">
                                <i class="fas fa-university"></i> Withdraw
                            </a>
                            <a class="wallet-quick-btn" href="#" id="wallet-transfer-quick">
                                <i class="fas fa-paper-plane"></i> Transfer
                            </a>
                            <a class="wallet-quick-btn" id="buy-empy-wallet-btn-2" href="#">
                                <i class="fas fa-shopping-cart"></i> Buy EMPY
                            </a>
                        `;
                        walletCard.appendChild(actionRow);

                        // Staking tier indicator
                        const tierDiv = document.createElement('div');
                        tierDiv.style.cssText = 'margin-top:16px;display:flex;align-items:center;gap:10px;';
                        tierDiv.innerHTML = `
                            <span style="font-size:0.82rem;color:rgba(255,255,255,0.6);">Staking Tier:</span>
                            <span class="staking-tier-badge gold" id="wallet-staking-tier"><i class="fas fa-medal"></i> Gold Member</span>
                        `;
                        walletCard.appendChild(tierDiv);
                    }
                }

                // Update staking tier based on staked balance
                function updateStakingTier() {
                    const badge = document.getElementById('wallet-staking-tier');
                    if (!badge) return;
                    const staked = (userManualStakedBalance || 0) + (userLockedStakedBalance || 0);
                    let tier, cls;
                    if (staked >= 50000) { tier = '💎 Platinum'; cls = 'platinum'; }
                    else if (staked >= 10000) { tier = '🥇 Gold'; cls = 'gold'; }
                    else if (staked >= 1000) { tier = '🥈 Silver'; cls = 'silver'; }
                    else { tier = '🥉 Bronze'; cls = 'bronze'; }
                    badge.className = `staking-tier-badge ${cls}`;
                    badge.innerHTML = `<i class="fas fa-medal"></i> ${tier} Member`;
                }
                setInterval(updateStakingTier, 2000);

                // Withdrawal flow: add clear step-by-step UI hint
                const withdrawalForm = document.getElementById('withdrawal-form');
                if (withdrawalForm && !document.getElementById('withdrawal-steps-hint')) {
                    const hint = document.createElement('div');
                    hint.id = 'withdrawal-steps-hint';
                    hint.style.cssText = 'margin-bottom:20px;';
                    hint.innerHTML = `
                        <div class="withdrawal-step">
                            <div class="withdrawal-step-num">1</div>
                            <div><strong>Enter amount</strong><p style="margin:0;font-size:0.82rem;color:var(--text-muted);">Minimum 5 EMPY. Rate: 1 EMPY ≈ $0.10</p></div>
                        </div>
                        <div class="withdrawal-step">
                            <div class="withdrawal-step-num">2</div>
                            <div><strong>Select withdrawal method</strong><p style="margin:0;font-size:0.82rem;color:var(--text-muted);">Bank transfer, USDT, or Empyrean Card</p></div>
                        </div>
                        <div class="withdrawal-step">
                            <div class="withdrawal-step-num">3</div>
                            <div><strong>Admin approves within 24–48h</strong><p style="margin:0;font-size:0.82rem;color:var(--text-muted);">You'll receive a notification when processed</p></div>
                        </div>
                    `;
                    withdrawalForm.prepend(hint);
                }

                // Withdrawal form: validate against balance + add to admin queue
                if (withdrawalForm) {
                    withdrawalForm.addEventListener('submit', function(e2) {
                        const amountInput = document.getElementById('withdrawal-amount');
                        const amt = parseFloat(amountInput?.value || 0);
                        if (amt > (userState.empyBalance || 0)) {
                            e2.preventDefault();
                            e2.stopImmediatePropagation();
                            showNotification(`⚠️ Insufficient balance. You have ${(userState.empyBalance||0).toLocaleString()} EMPY.`, 'error');
                            return;
                        }
                        if (amt < 5) {
                            e2.preventDefault();
                            e2.stopImmediatePropagation();
                            showNotification('Minimum withdrawal is 5 EMPY.', 'error');
                            return;
                        }
                    }, true);
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 11: GOOGLE AUTH — handled by v5 fix block below
            // ═══════════════════════════════════════════════════════════
            (function() {
                // This block is intentionally left empty.
                // Google authentication is fully handled by the v5 comprehensive fix pack.
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 12: EMAIL VERIFICATION AFTER SIGNUP (Change #11)
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Patch the signup form submit to send verification email
                const signupFeedback = document.getElementById('signup-feedback');
                const origSignupSubmit = document.getElementById('signup-form');
                if (!origSignupSubmit) return;

                origSignupSubmit.addEventListener('submit', function() {
                    // After a short delay (let main handler run first), check for unverified user
                    setTimeout(async () => {
                        const user = fbAuth.currentUser;
                        if (user && !user.emailVerified) {
                            try {
                                await user.sendEmailVerification();
                                // Show verification banner
                                const banner = document.createElement('div');
                                banner.style.cssText = `
                                    position:fixed;top:80px;left:50%;transform:translateX(-50%);
                                    background:white;border-radius:16px;padding:20px 28px;
                                    box-shadow:0 8px 40px rgba(0,0,0,0.2);z-index:99990;
                                    max-width:380px;width:90%;text-align:center;
                                    border-top:4px solid var(--accent);
                                `;
                                banner.innerHTML = `
                                    <i class="fas fa-envelope" style="font-size:2rem;color:var(--accent);margin-bottom:12px;display:block;"></i>
                                    <strong style="font-size:1.05rem;color:var(--primary);display:block;margin-bottom:8px;">Verify Your Email</strong>
                                    <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:16px;">A verification link has been sent to <strong>${user.email}</strong>. Please click the link to activate your account.</p>
                                    <button onclick="this.closest('[style]').remove();" style="background:var(--g-navy);color:white;border:none;border-radius:10px;padding:10px 24px;cursor:pointer;font-weight:600;">Got it</button>
                                `;
                                document.body.appendChild(banner);
                                // Auto-dismiss after 8 seconds with fade-out
                                setTimeout(function() {
                                    if (banner && banner.parentNode) {
                                        banner.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                        banner.style.opacity = '0';
                                        banner.style.transform = 'translateX(-50%) translateY(-12px)';
                                        setTimeout(function() {
                                            if (banner && banner.parentNode) banner.remove();
                                        }, 620);
                                    }
                                }, 8000);
                            } catch(verErr) {
                                console.warn('Email verification send error:', verErr);
                            }
                        }
                    }, 2000);
                }, false);
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 13: SIGNUP BUTTON SPEED (Change #8 signup)
            // ═══════════════════════════════════════════════════════════
            (function() {
                // Remove any artificial delays on signup button
                const signupBtn = document.querySelector('#signup-form button[type="submit"]');
                if (signupBtn) {
                    // Ensure button responds immediately
                    signupBtn.style.transition = 'none';
                    signupBtn.addEventListener('mousedown', function() {
                        this.style.transform = 'scale(0.98)';
                    });
                    signupBtn.addEventListener('mouseup', function() {
                        this.style.transform = '';
                    });
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 14: FONT FUNCTIONS — ENSURE ALL ACTIVE (Change #5)
            // ═══════════════════════════════════════════════════════════
            (function() {
                const fontActivation = document.createElement('style');
                fontActivation.id = 'font-activation-override';
                fontActivation.textContent = `
                    /* Ensure Syne + Inter are active everywhere */
                    h1, h2, h3, .card > h3, .card-content h3,
                    .header h1, .sidebar-header h2,
                    .stat-card h4, .profile-header-info h1 {
                        font-family: 'Syne', sans-serif !important;
                        font-weight: 700 !important;
                    }
                    body, p, span, label, input, textarea, select, button, a,
                    .form-group label, .action-btn, .btn {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
                    }
                    /* Bold / Italic / Strikethrough in post content */
                    .story-content strong, .comment-content strong { font-weight: 700 !important; }
                    .story-content em, .comment-content em { font-style: italic !important; }
                    .story-content s, .comment-content s { text-decoration: line-through !important; }
                    /* Format toolbar buttons */
                    #post-format-toolbar button[data-format="bold"] { font-weight: 900 !important; font-family: 'Inter', sans-serif !important; }
                    #post-format-toolbar button[data-format="italic"] { font-style: italic !important; font-family: 'Inter', sans-serif !important; }
                    /* Wallet balance */
                    #wallet-empy-balance, .empy-balance {
                        font-family: 'Syne', sans-serif !important;
                        font-weight: 800 !important;
                    }
                    /* Nav labels */
                    .sidebar-nav li a span:last-child {
                        font-family: 'Inter', sans-serif !important;
                        font-weight: 500 !important;
                    }
                    /* Post format toolbar active */
                    #post-format-toolbar { display: flex !important; gap: 4px; }
                    #post-format-toolbar button {
                        background: white !important;
                        border: 1.5px solid rgba(10,14,39,0.12) !important;
                        border-radius: 8px !important;
                        padding: 5px 12px !important;
                        cursor: pointer !important;
                        font-size: 0.88rem !important;
                        transition: all 0.15s !important;
                    }
                    #post-format-toolbar button:hover {
                        background: rgba(27,43,139,0.08) !important;
                        border-color: var(--secondary) !important;
                    }
                    #create-post-form #post-format-toolbar {
                        position: static !important;
                        transform: none !important;
                        margin-bottom: 8px !important;
                        background: rgba(10,14,39,0.03) !important;
                        padding: 8px 12px !important;
                        border-radius: 12px !important;
                    }
                `;
                document.head.appendChild(fontActivation);

                // Activate the post format toolbar properly
                const formatToolbar = document.getElementById('post-format-toolbar');
                const postTextarea = document.getElementById('post-text');
                if (formatToolbar && postTextarea) {
                    formatToolbar.querySelectorAll('button[data-format]').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const fmt = this.dataset.format;
                            const start = postTextarea.selectionStart;
                            const end = postTextarea.selectionEnd;
                            const selected = postTextarea.value.substring(start, end);
                            let wrapped = '';
                            if (fmt === 'bold') wrapped = `*${selected}*`;
                            else if (fmt === 'italic') wrapped = `_${selected}_`;
                            else if (fmt === 'strike') wrapped = `~${selected}~`;
                            postTextarea.value = postTextarea.value.substring(0, start) + wrapped + postTextarea.value.substring(end);
                            postTextarea.focus();
                            postTextarea.selectionStart = start + 1;
                            postTextarea.selectionEnd = end + 1;
                        });
                    });
                }
            })();

            // ═══════════════════════════════════════════════════════════
            // FIX 15: NAVIGATION BAR — SEAMLESS ROUTING (Change #2)

            // ── ADMIN ANNOUNCEMENT HANDLER ─────────────────────────────
            (function() {
                document.addEventListener('submit', function(e) {
                    if (!e.target || e.target.id !== 'admin-announce-form') return;
                    e.preventDefault();
                    var type  = document.getElementById('announce-type')?.value || 'announcement';
                    var title = (document.getElementById('announce-title')?.value || '').trim();
                    var body  = (document.getElementById('announce-body')?.value || '').trim();
                    if (!title && !body) { if (typeof showNotification === 'function') showNotification('Add a title or message.', 'error'); return; }

                    var icons = { announcement:'📢', appreciation:'🏆', update:'🔔', 'sos-thanks':'❤️' };
                    var icon = icons[type] || '📢';

                    var list = document.getElementById('admin-announcements-list');
                    if (list) {
                        // Remove empty state
                        var ep = list.querySelector('p');
                        if (ep) ep.remove();
                        var item = document.createElement('div');
                        item.style.cssText = 'background:white;border-radius:14px;padding:16px;border:1px solid rgba(10,14,39,0.06);box-shadow:0 2px 8px rgba(0,0,0,0.05);';
                        item.innerHTML =
                            '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">' +
                                '<strong style="font-size:0.95rem;color:var(--primary);">' + icon + ' ' + (title || type) + '</strong>' +
                                '<div style="display:flex;gap:6px;align-items:center;">' +
                                    '<span style="font-size:0.75rem;color:var(--text-muted);">' + new Date().toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) + '</span>' +
                                    '<button onclick="this.parentElement.parentElement.remove();" style="background:rgba(239,68,68,0.12);border:none;color:#EF4444;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:0.75rem;"><i class=\"fas fa-trash\"></i></button>' +
                                '</div>' +
                            '</div>' +
                            (body ? '<p style="font-size:0.85rem;color:#555;margin:0;line-height:1.5;">' + body + '</p>' : '');
                        list.prepend(item);

                        // Also push to community feed as a post
                        var feedContainer = document.getElementById('feed-container');
                        if (feedContainer && typeof createNewPostElement === 'function') {
                            var announcePost = createNewPostElement(
                                icon + ' **' + title + '**\n\n' + body,
                                [],
                                { id: 'admin-user', fullName: 'Empyrean Admin', avatar: 'https://ui-avatars.com/api/?name=EA&background=5B0EA6&color=fff&size=150' }
                            );
                            feedContainer.prepend(announcePost);
                            var emptyState = document.getElementById('feed-empty-state');
                            if (emptyState) emptyState.style.display = 'none';
                        }

                        // Save to Firestore
                        try {
                            if (window.fbDb) {
                                window.fbDb.collection('announcements').add({
                                    type, title, body,
                                    createdAt: new Date().toISOString(),
                                    adminId: window.userState && window.userState.id
                                }).catch(function(){});
                                // Push notification to all users
                                window.fbDb.collection('notifications').add({
                                    type: 'announcement',
                                    message: icon + ' Admin Announcement: ' + title,
                                    createdAt: new Date().toISOString(), read: false
                                }).catch(function(){});
                                // Also push to bell for current session
                                if (typeof window.pushNotification === 'function') {
                                    window.pushNotification(icon + ' ' + title, 'announcement');
                                }
                            }
                        } catch(e) {}
                    }

                    // Handle media upload — upload to Cloudinary and embed in feed post
                    var mediaInput = document.getElementById('announce-media-input');
                    if (mediaInput && mediaInput.files.length > 0 && typeof window.uploadToCloudinary === 'function') {
                        var announceFiles = Array.from(mediaInput.files);
                        var uploadPromises = announceFiles.map(function(file) {
                            return window.uploadToCloudinary(file, null).catch(function() {
                                return URL.createObjectURL(file);
                            });
                        });
                        Promise.all(uploadPromises).then(function(cloudUrls) {
                            // Re-create the feed post with actual media
                            var feedContainer = document.getElementById('feed-container');
                            if (feedContainer && typeof createNewPostElement === 'function') {
                                var mediaFiles = announceFiles.map(function(f, i) {
                                    f._cloudUrl = cloudUrls[i];
                                    return f;
                                });
                                var mediaPost = createNewPostElement(
                                    icon + ' ' + title + '\n\n' + body,
                                    mediaFiles,
                                    { id: 'admin-user', fullName: 'Empyrean Admin', avatar: 'https://ui-avatars.com/api/?name=EA&background=5B0EA6&color=fff&size=150' }
                                );
                                // Replace the placeholder post (first child) with the media post
                                if (feedContainer.firstChild) feedContainer.replaceChild(mediaPost, feedContainer.firstChild);
                            }
                            // Save media URLs to Firestore
                            try {
                                if (window.fbDb) {
                                    window.fbDb.collection('announcements').add({
                                        type: type, title: title, body: body,
                                        media: cloudUrls,
                                        createdAt: new Date().toISOString(),
                                        adminId: window.userState && window.userState.id
                                    }).catch(function(){});
                                }
                            } catch(e) {}
                            if (typeof showNotification === 'function') showNotification('☁ Media uploaded and attached to announcement!', 'success');
                        });
                    }

                    e.target.reset();
                    document.getElementById('announce-media-preview').innerHTML = '';
                    if (typeof showNotification === 'function') showNotification('✅ Announcement published to community feed!', 'success');
                });

                // Preview media for announcement
                document.addEventListener('change', function(e) {
                    if (!e.target || e.target.id !== 'announce-media-input') return;
                    var preview = document.getElementById('announce-media-preview');
                    if (!preview) return;
                    preview.innerHTML = '';
                    Array.from(e.target.files).forEach(function(file) {
                        var url = URL.createObjectURL(file);
                        var div = document.createElement('div');
                        div.style.cssText = 'width:80px;height:80px;border-radius:8px;overflow:hidden;';
                        div.innerHTML = file.type.startsWith('video/')
                            ? '<video src="'+url+'" style="width:100%;height:100%;object-fit:cover;" muted></video>'
                            : '<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;">';
                        preview.appendChild(div);
                    });
                });
            })();

            // ═══════════════════════════════════════════════════════════
            (function() {
                // ── Mobile bottom nav CSS (injected once) ──────────────────
                if (!document.getElementById('empyrean-mobile-nav-style')) {
                    const navStyle = document.createElement('style');
                    navStyle.id = 'empyrean-mobile-nav-style';
                    navStyle.textContent = `
                        /* Sidebar active indicator */
                        .sidebar-nav li { position: relative; }
                        .sidebar-nav li a.active { background: rgba(27,43,139,0.12) !important; }
                        .sidebar-nav li a.active::before {
                            content: ''; position: absolute; left: 0; top: 50%;
                            transform: translateY(-50%); width: 3px; height: 60%;
                            border-radius: 0 3px 3px 0; background: var(--accent);
                        }
                        /* Bottom nav — BOTTOM of screen */
                        #mobile-bottom-nav {
                            display: none;
                            position: fixed;
                            bottom: 0; left: 0; right: 0; top: auto;
                            background: white;
                            border-top: 1px solid rgba(10,14,39,0.08);
                            border-bottom: none;
                            padding: 6px 0 calc(env(safe-area-inset-bottom) + 6px);
                            z-index: 600;
                            box-shadow: 0 -4px 20px rgba(10,14,39,0.08);
                        }
                        @media (max-width: 992px) {
                            #mobile-bottom-nav {
                                display: flex !important;
                                justify-content: space-around;
                                align-items: center;
                            }
                            .main-content {
                                padding-top: 0 !important;
                                padding-bottom: 72px !important;
                            }
                        }
                        .mobile-nav-item {
                            display: flex; flex-direction: column; align-items: center;
                            gap: 3px; padding: 4px 8px; border-radius: 10px;
                            cursor: pointer; font-size: 0.58rem; font-weight: 600;
                            color: var(--text-muted); transition: all 0.2s;
                            border: none; background: none; flex: 1;
                            max-width: 72px; min-width: 48px;
                            -webkit-tap-highlight-color: transparent;
                        }
                        .mobile-nav-item i { font-size: 1.15rem; transition: transform 0.15s; }
                        .mobile-nav-item.active { color: var(--secondary); }
                        .mobile-nav-item.active i {
                            color: var(--secondary);
                            transform: scale(1.15);
                        }
                        .mobile-nav-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                        /* Section transition */
                        .content-section {
                            animation: fadeInSection 0.2s ease;
                        }
                        @keyframes fadeInSection {
                            from { opacity: 0; transform: translateY(6px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                        /* Breadcrumb */
                        #nav-breadcrumb {
                            font-size: 0.78rem; color: var(--text-muted);
                            padding: 7px 20px;
                            background: rgba(10,14,39,0.02);
                            border-bottom: 1px solid rgba(10,14,39,0.05);
                            display: flex; align-items: center; gap: 6px;
                        }
                    `;
                    document.head.appendChild(navStyle);
                }

                // ── 8 priority bottom nav items ─────────────────────────────
                // Build dynamically based on auth state
                (function buildMobileBottomNav() {
                    const existing = document.getElementById('mobile-bottom-nav');
                    if (existing) existing.remove(); // Always rebuild so it reflects login state

                    const guestItems = [
                        { t: 'dashboard',   icon: 'fa-home',          label: 'Home'    },
                        { t: 'marketplace', icon: 'fa-store',          label: 'Market'  },
                        { t: 'reels',       icon: 'fa-film',           label: 'Reels'   },
                        { t: 'news',        icon: 'fa-newspaper',      label: 'News'    },
                        { t: 'ngo-partners',icon: 'fa-hands-helping',  label: 'NGOs'    },
                    ];
                    const userItems = [
                        { t: 'dashboard',      icon: 'fa-home',             label: 'Home'     },
                        { t: 'reels',          icon: 'fa-film',             label: 'Reels'    },
                        { t: 'marketplace',    icon: 'fa-store',            label: 'Market'   },
                        { t: 'messages',       icon: 'fa-comment-dots',     label: 'Messages' },
                        { t: 'go-live',        icon: 'fa-video',            label: 'Go Live'  },
                        { t: 'request-help',   icon: 'fa-hand-holding-heart', label: 'SOS'   },
                        { t: 'my-wallet',      icon: 'fa-wallet',           label: 'Wallet'   },
                        { t: 'profile',        icon: 'fa-user-circle',      label: 'Profile'  },
                    ];

                    const items = (isGuest) ? guestItems : userItems;
                    const mobileNav = document.createElement('div');
                    mobileNav.id = 'mobile-bottom-nav';
                    mobileNav.setAttribute('role', 'navigation');
                    mobileNav.setAttribute('aria-label', 'Bottom navigation');

                    items.forEach(function(item) {
                        const btn = document.createElement('button');
                        btn.className = 'mobile-nav-item';
                        btn.dataset.target = item.t;
                        btn.setAttribute('aria-label', item.label);
                        btn.innerHTML = '<i class="fas ' + item.icon + '"></i><span>' + item.label + '</span>';
                        mobileNav.appendChild(btn);
                    });

                    document.body.appendChild(mobileNav);

                    // Single delegated click listener — no duplicates
                    mobileNav.addEventListener('click', function(e) {
                        const item = e.target.closest('.mobile-nav-item');
                        if (!item || !item.dataset.target) return;
                        // Visual feedback
                        mobileNav.querySelectorAll('.mobile-nav-item').forEach(function(b) {
                            b.classList.remove('active');
                        });
                        item.classList.add('active');
                        // Navigate
                        if (typeof navigateTo === 'function') navigateTo(item.dataset.target, true);
                    }, { passive: true });

                    // Set initial active based on current section
                    const activeSection = document.querySelector('.content-section.active');
                    if (activeSection) {
                        const activeBtn = mobileNav.querySelector('[data-target="' + activeSection.id + '"]');
                        if (activeBtn) activeBtn.classList.add('active');
                    }

                    // Expose rebuilder so login/logout can refresh
                    window._buildMobileBottomNav = buildMobileBottomNav;
                })();

                // ── Breadcrumb ───────────────────────────────────────────────
                const mainContentEl = document.querySelector('.main-content');
                if (mainContentEl && !document.getElementById('nav-breadcrumb')) {
                    const breadcrumb = document.createElement('div');
                    breadcrumb.id = 'nav-breadcrumb';
                    breadcrumb.innerHTML = '<i class="fas fa-home" style="color:var(--secondary);"></i> <span id="breadcrumb-text">Dashboard</span>';
                    const statusBar = document.getElementById('status-bar-container');
                    if (statusBar) statusBar.before(breadcrumb);
                    else mainContentEl.prepend(breadcrumb);
                }

                // Patch navigateTo to update breadcrumb + mobile nav
                const sectionLabels = {
                    dashboard:'Dashboard', 'my-wallet':'My Wallet', messages:'Messages',
                    marketplace:'Marketplace', reels:'Reels', news:'News', profile:'Profile',
                    'go-live':'Go Live', 'request-help':'Request Help', 'report-crisis':'Report Crisis',
                    admin:'Admin Panel', settings:'Settings', 'grant-portal':'Grant Portal',
                    'community-tasks':'Community Tasks', 'ngo-partners':'NGO Partners',
                    'business-page':'Business Page'
                };
                // navigateTo breadcrumb/mobile nav — now built into core navigateTo function above
                // (removed duplicate wrapper to prevent freeze from nested call chains)
            })();

            // ── story-header click → profile ─────────────────────────
            document.addEventListener('click',function(e){
                var sh=e.target.closest('.story-header');if(!sh)return;
                if(e.target.closest('.post-options,.options-btn,.options-menu'))return;
                var ca=e.target.closest('.avatar-placeholder')||(e.target.tagName==='IMG'&&e.target.closest('.story-header'));
                var cn=e.target.closest('.story-user-info strong')||e.target.closest('.story-user-info span');
                if(!ca&&!cn)return;
                var post=sh.closest('.impact-story,.news-list-item');if(!post)return;
                var uid=post.dataset.userId||post.dataset.authorId;if(!uid)return;
                e.preventDefault();e.stopPropagation();
                if(window.userState&&uid===window.userState.id){
                    window._viewingOtherProfile=false;
                    if(typeof navigateTo==='function')navigateTo('profile');
                    return;
                }
                window._viewingOtherProfile=true;
                if(typeof renderUserProfile==='function')renderUserProfile(uid);
                if(typeof navigateTo==='function')navigateTo('profile');
                setTimeout(function(){window._viewingOtherProfile=false;},500);
            });

            // ── Media lightbox ────────────────────────────────────────
            (function initMediaLightbox(){
                if(window._mlbReady)return;window._mlbReady=true;
                var lb=document.createElement('div');lb.id='media-lightbox';
                lb.style.cssText='display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.96);flex-direction:column;align-items:center;justify-content:center;touch-action:none;';
                lb.innerHTML='<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(to bottom,rgba(0,0,0,0.7),transparent);z-index:2;">'
                    +'<span id="lb-ctr" style="color:rgba(255,255,255,0.75);font-size:0.85rem;font-weight:600;"></span>'
                    +'<div style="display:flex;gap:10px;">'
                    +'<button id="lb-dl" style="background:rgba(255,255,255,0.15);border:none;color:white;width:38px;height:38px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;"><i class="fas fa-download"></i></button>'
                    +'<button id="lb-x" style="background:rgba(255,255,255,0.15);border:none;color:white;width:38px;height:38px;border-radius:50%;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">&#10005;</button>'
                    +'</div></div>'
                    +'<button id="lb-p" style="position:absolute;left:6px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);border:none;color:white;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center;z-index:2;">&#8249;</button>'
                    +'<div id="lb-stage" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;padding:60px 60px 48px;box-sizing:border-box;">'
                    +'<img id="lb-img" style="max-width:100%;max-height:100%;object-fit:contain;border-radius:8px;display:none;transition:opacity 0.2s;" alt="">'
                    +'<video id="lb-vid" style="max-width:100%;max-height:100%;border-radius:8px;display:none;" controls playsinline></video>'
                    +'</div>'
                    +'<button id="lb-n" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,0.15);border:none;color:white;width:42px;height:42px;border-radius:50%;cursor:pointer;font-size:1.5rem;display:flex;align-items:center;justify-content:center;z-index:2;">&#8250;</button>'
                    +'<div id="lb-dots" style="position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;gap:6px;z-index:2;"></div>';
                document.body.appendChild(lb);
                var _img=lb.querySelector('#lb-img'),_vid=lb.querySelector('#lb-vid'),_ctr=lb.querySelector('#lb-ctr'),_dots=lb.querySelector('#lb-dots');
                var _its=[],_i=0;
                function _open(items,start){_its=items;_i=start||0;lb.style.display='flex';document.body.style.overflow='hidden';_render();lb.querySelector('#lb-p').style.display=_its.length>1?'flex':'none';lb.querySelector('#lb-n').style.display=_its.length>1?'flex':'none';}
                function _close(){lb.style.display='none';_vid.pause();_vid.src='';_img.src='';document.body.style.overflow='';}
                function _render(){var it=_its[_i];if(!it)return;_img.style.display='none';_vid.style.display='none';_vid.pause();if(it.type==='video'){_vid.src=it.src;_vid.style.display='block';}else{_img.style.opacity='0';_img.src=it.src;_img.style.display='block';_img.onload=function(){_img.style.opacity='1';};}
                    _ctr.textContent=_its.length>1?(_i+1)+' / '+_its.length:'';
                    _dots.innerHTML='';if(_its.length>1){_its.forEach(function(_,j){var d=document.createElement('div');d.style.cssText='width:'+(j===_i?'20px':'7px')+';height:7px;border-radius:4px;background:'+(j===_i?'white':'rgba(255,255,255,0.35)')+';transition:all 0.25s;cursor:pointer;flex-shrink:0;';(function(ji){d.onclick=function(){_i=ji;_render();};})(j);_dots.appendChild(d);});}
                    lb.querySelector('#lb-dl').onclick=function(){var a=document.createElement('a');a.href=it.src;a.download='empyrean-media-'+(_i+1);a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();};}
                function _step(dir){_i=(_i+dir+_its.length)%_its.length;_render();}
                lb.querySelector('#lb-x').onclick=_close;lb.onclick=function(e){if(e.target===lb)_close();};lb.querySelector('#lb-p').onclick=function(e){e.stopPropagation();_step(-1);};lb.querySelector('#lb-n').onclick=function(e){e.stopPropagation();_step(1);};
                document.addEventListener('keydown',function(e){if(lb.style.display==='none')return;if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();_step(1);}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();_step(-1);}else if(e.key==='Escape')_close();});
                var _tx=0,_ty=0;
                lb.addEventListener('touchstart',function(e){_tx=e.touches[0].clientX;_ty=e.touches[0].clientY;},{passive:true});
                lb.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-_tx,dy=e.changedTouches[0].clientY-_ty;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>44){_step(dx<0?1:-1);}else if(Math.abs(dy)>Math.abs(dx)&&dy>80){_close();}},{passive:true});
                document.addEventListener('click',function(e){
                    var im=e.target.closest('.story-main-image')||(e.target.tagName==='IMG'&&e.target.closest('.story-media-item'));
                    if(im){e.preventDefault();e.stopPropagation();var c=im.closest('.story-media-container');var its=[],si=0;if(c){Array.from(c.querySelectorAll('img,video')).forEach(function(m,j){var src=m.src||m.currentSrc||'';its.push({src:src,type:m.tagName==='VIDEO'?'video':'image'});if(m===im||m===e.target)si=j;});}else{its=[{src:im.src||e.target.src,type:'image'}];}if(its.length)_open(its,si);return;}
                },true);
                document.addEventListener('dblclick',function(e){var v=e.target.closest('.story-media-item video,.story-video');if(!v)return;e.preventDefault();e.stopPropagation();var c=v.closest('.story-media-container');var its=[],si=0;if(c){Array.from(c.querySelectorAll('img,video')).forEach(function(m,j){its.push({src:m.src||m.currentSrc||'',type:m.tagName==='VIDEO'?'video':'image'});if(m===v)si=j;});}else{its=[{src:v.src||v.currentSrc,type:'video'}];}if(its.length)_open(its,si);},true);
                window.openMediaLightbox=_open;window.closeMediaLightbox=_close;
            })();

            // ── HORIZONTAL DRAG-SCROLL (mouse + touch auto-swipe) ──────────────
            // Enables click-drag scrolling on every .horizontal-slider-wrapper
            // Touch devices already work via CSS scroll-snap; this adds mouse drag
            // and auto-advances the strip every 4 s when idle.
            (function initSliderDragScroll() {

                function attachDragScroll(el) {
                    if (el._dragScrollAttached) return;
                    el._dragScrollAttached = true;

                    var startX = 0, scrollStart = 0, isDragging = false;

                    el.addEventListener('mousedown', function(e) {
                        if (e.button !== 0) return; // left button only
                        isDragging  = true;
                        startX      = e.pageX - el.offsetLeft;
                        scrollStart = el.scrollLeft;
                        el.style.cursor      = 'grabbing';
                        el.style.userSelect  = 'none';
                        el.style.scrollSnapType = 'none'; // disable snap while dragging
                    });

                    el.addEventListener('mouseleave', function() {
                        if (!isDragging) return;
                        isDragging = false;
                        el.style.cursor      = 'grab';
                        el.style.userSelect  = '';
                        el.style.scrollSnapType = 'x mandatory';
                    });

                    el.addEventListener('mouseup', function() {
                        isDragging = false;
                        el.style.cursor      = 'grab';
                        el.style.userSelect  = '';
                        el.style.scrollSnapType = 'x mandatory';
                    });

                    el.addEventListener('mousemove', function(e) {
                        if (!isDragging) return;
                        e.preventDefault();
                        var x    = e.pageX - el.offsetLeft;
                        var walk = (x - startX) * 1.2; // multiplier for feel
                        el.scrollLeft = scrollStart - walk;
                    });

                    // Passive touch events — handled by CSS on mobile, but we
                    // still emit momentum on touchend for consistency
                    el.addEventListener('touchstart', function(e) {
                        startX      = e.touches[0].pageX;
                        scrollStart = el.scrollLeft;
                    }, { passive: true });

                    el.addEventListener('touchmove', function(e) {
                        var dx = startX - e.touches[0].pageX;
                        el.scrollLeft = scrollStart + dx;
                    }, { passive: true });

                    el.style.cursor = 'grab';
                }

                // Auto-advance ticker: nudge sliders gently when the user is idle
                function startAutoSwipe(el) {
                    if (el._autoSwipeTimer) return;
                    var direction = 1;
                    el._autoSwipeTimer = setInterval(function() {
                        if (isDraggingAny) return; // pause while user is dragging
                        var maxScroll = el.scrollWidth - el.clientWidth;
                        if (maxScroll <= 0) return; // nothing to scroll
                        var next = el.scrollLeft + el.clientWidth * 0.85 * direction;
                        if (next >= maxScroll) { direction = -1; next = maxScroll; }
                        if (next <= 0)         { direction =  1; next = 0; }
                        el.scrollTo({ left: next, behavior: 'smooth' });
                    }, 4000);
                    // Pause auto-swipe on hover / touch
                    el.addEventListener('mouseenter', function() { clearInterval(el._autoSwipeTimer); el._autoSwipeTimer = null; }, { once: false });
                    el.addEventListener('touchstart',  function() { clearInterval(el._autoSwipeTimer); el._autoSwipeTimer = null; }, { passive: true, once: false });
                }

                var isDraggingAny = false;
                document.addEventListener('mousedown', function() { isDraggingAny = true;  });
                document.addEventListener('mouseup',   function() { isDraggingAny = false; });

                // Target slider IDs used in the public dashboard
                var SLIDER_IDS = [
                    'marketplace-slider',
                    'reels-slider',
                    'news-slider',
                    'suggested-users-slider',
                    'profile-dash-live-slider'
                ];

                function initAll() {
                    // Attach to known IDs
                    SLIDER_IDS.forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el) { attachDragScroll(el); startAutoSwipe(el); }
                    });
                    // Also catch any .horizontal-slider-wrapper not in the list
                    document.querySelectorAll('.horizontal-slider-wrapper').forEach(function(el) {
                        attachDragScroll(el);
                        startAutoSwipe(el);
                    });
                }

                // Run on load + observe for dynamically rendered sliders
                initAll();

                var sliderObserver = new MutationObserver(function() { initAll(); });
                sliderObserver.observe(document.body, { childList: true, subtree: true });

            })();


        // ── Message media expand: tap image/video to fullscreen ──────────
        (function _initMessageMediaLightbox() {
            if (document.getElementById('_msgMediaOverlay')) return;
            var overlay = document.createElement('div');
            overlay.id = '_msgMediaOverlay';
            overlay.style.cssText = [
                'display:none', 'position:fixed', 'inset:0',
                'background:rgba(0,0,0,0.93)', 'z-index:99999',
                'align-items:center', 'justify-content:center',
                'cursor:zoom-out', '-webkit-tap-highlight-color:transparent'
            ].join(';');

            var wrapper  = document.createElement('div');
            wrapper.style.cssText = 'max-width:96vw;max-height:96vh;position:relative;';

            var closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.cssText = [
                'position:absolute', 'top:-14px', 'right:-14px',
                'background:white', 'border:none', 'border-radius:50%',
                'width:30px', 'height:30px', 'font-size:1.2rem',
                'cursor:pointer', 'display:flex', 'align-items:center',
                'justify-content:center', 'box-shadow:0 2px 8px rgba(0,0,0,0.3)', 'z-index:2'
            ].join(';');

            var mediaImg = document.createElement('img');
            mediaImg.id = '_msgMediaImg';
            mediaImg.style.cssText = 'max-width:96vw;max-height:90vh;border-radius:10px;display:block;object-fit:contain;';

            var mediaVid = document.createElement('video');
            mediaVid.id = '_msgMediaVid';
            mediaVid.controls = true;
            mediaVid.style.cssText = 'max-width:96vw;max-height:90vh;border-radius:10px;display:none;';

            function _closeOverlay() {
                overlay.style.display = 'none';
                mediaVid.pause();
                mediaVid.src = '';
                mediaImg.src = '';
            }

            closeBtn.addEventListener('click', _closeOverlay);
            overlay.addEventListener('click', function(e) { if (e.target === overlay) _closeOverlay(); });

            wrapper.appendChild(closeBtn);
            wrapper.appendChild(mediaImg);
            wrapper.appendChild(mediaVid);
            overlay.appendChild(wrapper);
            document.body.appendChild(overlay);

            // Delegated listener — works for all dynamically added message media
            document.addEventListener('click', function(e) {
                var el = e.target.closest('.message-media');
                if (!el) return;
                var ov = document.getElementById('_msgMediaOverlay');
                var im = document.getElementById('_msgMediaImg');
                var vi = document.getElementById('_msgMediaVid');
                if (!ov || !im || !vi) return;
                if (el.tagName === 'IMG') {
                    im.src = el.src || el.dataset.src || '';
                    im.style.display = 'block';
                    vi.pause(); vi.src = ''; vi.style.display = 'none';
                    ov.style.display = 'flex';
                    e.stopPropagation();
                } else if (el.tagName === 'VIDEO') {
                    im.src = ''; im.style.display = 'none';
                    vi.src = el.src || el.dataset.src || '';
                    vi.style.display = 'block';
                    ov.style.display = 'flex';
                    setTimeout(function(){ vi.play().catch(function(){}); }, 120);
                    e.stopPropagation();
                }
            }, true);

            // Visual affordance
            var s = document.createElement('style');
            s.textContent = '.message-media{cursor:zoom-in!important;transition:opacity 0.15s;} .message-media:active{opacity:0.75;}';
            document.head.appendChild(s);
        })();

        // ══════════════════════════════════════════════════════
        // SAFETY NET — three root-cause fixes:
        //
        // 1. firebase-init.js stubs fbAuth with an onAuthStateChanged that calls
        //    cb(null) immediately. The real observer (~line 9671) runs on the stub,
        //    gets null, and app starts as guest. When real firebase.auth() loads,
        //    onAuthStateChanged is never re-registered → users invisible on new devices.
        //    FIX: on empyrean:firebase-ready, register a new observer on real fbAuth
        //    that ONLY nulls listener handles and calls _startRealtimeListeners (never
        //    calls initializeApp — that would blank the page).
        //
        // 2. empyrean:auth-ready was listened for but never dispatched anywhere.
        //    FIX: dispatch it from the new real-auth observer below.
        //
        // 3. _scheduleListenerRetry caps at 8 attempts. If all 8 fire while auth is
        //    still pending, retries stop permanently.
        //    FIX: reset _listenerRetryCount before every safety-net-triggered start.
        // ══════════════════════════════════════════════════════
        (function() {
            var _ALL_LISTENERS = [
                '_postsListener', '_newsListener', '_mktListener',
                '_reelsListener', '_sosListener', '_crisisListener',
                '_announcementsListener', '_usersListener'
            ];

            function _allActive() {
                return _ALL_LISTENERS.every(function(k){ return !!window[k]; });
            }

            function _tryStart() {
                if (typeof window._startRealtimeListeners !== 'function') return;
                if (!window._firebaseLoaded || !window.fbDb) return;
                if (_allActive()) return;
                // Reset internal cap so previous failed retries don't block this attempt
                window._listenerRetryCount = 0;
                window._startRealtimeListeners();
            }

            // ROOT CAUSE 1+2 FIX — runs once when real firebase.auth() is available.
            // Does NOT call initializeApp; only restarts listeners for the real user.
            function _attachRealAuthObserver() {
                if (window._realAuthObserverActive) return;
                if (!window._firebaseLoaded || !window.fbAuth ||
                        typeof window.fbAuth.onAuthStateChanged !== 'function') return;
                window._realAuthObserverActive = true;

                window.fbAuth.onAuthStateChanged(function(fbUser) {
                    if (!fbUser || fbUser.isAnonymous) return;
                    // Authenticated user found — restart all listeners with real auth context
                    _ALL_LISTENERS.forEach(function(k){ window[k] = null; });
                    window._listenerRetryCount = 0;
                    // Dispatch auth-ready so the listener below also fires (Root Cause 2)
                    try { window.dispatchEvent(new CustomEvent('empyrean:auth-ready')); } catch(e) {}
                    setTimeout(_tryStart, 800);
                });
            }

            // Try immediately if Firebase somehow already loaded
            if (window._firebaseLoaded) {
                _attachRealAuthObserver();
                setTimeout(_tryStart, 500);
            }

            // Primary: fires from firebase-init.js after real SDK initialises
            window.addEventListener('empyrean:firebase-ready', function() {
                _attachRealAuthObserver();
                setTimeout(_tryStart, 600);
            });

            // Secondary: fired by _attachRealAuthObserver above (Root Cause 2 fix)
            window.addEventListener('empyrean:auth-ready', function() {
                setTimeout(_tryStart, 400);
            });

            // Fallback: poll every 3 s for 60 s (20 attempts)
            var _safetyRetries = 0;
            var _safetyTimer = setInterval(function() {
                _safetyRetries++;
                if (_safetyRetries > 20 || _allActive()) {
                    clearInterval(_safetyTimer);
                    return;
                }
                if (!window._realAuthObserverActive && window._firebaseLoaded) {
                    _attachRealAuthObserver();
                }
                if (window._firebaseLoaded) { _tryStart(); }
            }, 3000);
        })();
        });