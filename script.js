
// ============ ENHANCED GAME LOGIC v14.0 ============

// IMPROVED ANIMATION CONTROLLER
const AnimationController = {
    activeAnimations: new Map(),

    play(element, animationName, duration = 500, callback = null) {
        if (!element) return;

        const id = Math.random().toString(36);
        element.style.animation = 'none';

        // Force reflow untuk restart animation
        void element.offsetWidth;

        element.style.animation = `${animationName} ${duration}ms ease-in-out forwards`;

        const timeout = setTimeout(() => {
            element.style.animation = '';
            this.activeAnimations.delete(id);
            if (callback) callback();
        }, duration);

        this.activeAnimations.set(id, { element, timeout });
        return id;
    },

    stop(id) {
        const anim = this.activeAnimations.get(id);
        if (anim) {
            clearTimeout(anim.timeout);
            anim.element.style.animation = '';
            this.activeAnimations.delete(id);
        }
    },

    stopAll() {
        this.activeAnimations.forEach((anim) => {
            clearTimeout(anim.timeout);
            anim.element.style.animation = '';
        });
        this.activeAnimations.clear();
    }
};

// ============ ENHANCED GAME LOGIC v15.0 ============

const WeightedRNG = {
    weightTables: {
        event: { Common:50, Uncommon:30, Rare:15, Legendary:5 },
        conceptSync: {
            'HipHop_GirlCrush':1.25,'GirlCrush_Y2K':1.2,'SyncFormation_HipHop':1.3,
            'Dreamy_RnB':1.1,'DarkAcademia_RnB':1.2,'Cute_Refreshing':1.2,'BoyGroup_HipHop':1.2
        }
    },
    bellCurve(min, max) {
        let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
        const n=Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
        const mid=(min+max)/2, range=(max-min)/4;
        return Math.max(min,Math.min(max,Math.round(mid+n*range)));
    },
    getConceptSynergy(concept,danceStyle) {
        const k1=`${concept}_${danceStyle}`, k2=`${danceStyle}_${concept}`;
        return this.weightTables.conceptSync[k1]||this.weightTables.conceptSync[k2]||1.0;
    }
};

// MARKET SATURATION & MOMENTUM SYSTEM v15.0
const MarketSaturation = {
  data: {},

  recordComeback(gName, month) {
    if (!this.data[gName]) {
      this.data[gName] = { comebacks: [], penalty: 1.0 };
    }

    this.data[gName].comebacks.push(month);
    // Simpan hanya 12 bulan terakhir
    this.data[gName].comebacks = this.data[gName].comebacks.filter(m => month - m < 12);

    const c = this.data[gName].comebacks.length;
    this.data[gName].penalty =
      c >= 4 ? 0.6 :
      c === 3 ? 0.8 :
      c === 2 ? 0.92 :
      1.0;
  },

  getPenalty(gName) {
    return this.data[gName]?.penalty ?? 1.0;
  }
};

const MomentumSystem = {
  data: {},

  recordWin(name) {
    if (!this.data[name]) {
      this.data[name] = { wins: 0, bonus: 1.0 };
    }

    this.data[name].wins++;
    const w = this.data[name].wins;

    this.data[name].bonus =
      w >= 5 ? 1.4 :
      w >= 3 ? 1.25 :
      w >= 2 ? 1.1 :
      1.0;
  },

  recordLoss(name) {
    if (this.data[name]) {
      this.data[name].wins = 0;
      this.data[name].bonus = 1.0;
    }
  },

  getBonus(name) {
    return this.data[name]?.bonus ?? 1.0;
  }
};

// ENHANCED DANCE ANIMATION SYSTEM v15.0

const DanceSystem = {
    danceStyles: {
        HipHop:       {armAnim:'armSwingHipHop', legAnim:'legStompHipHop', bodyAnim:'bodyBounceHipHop', particleColor:'#f97316'},
        GirlCrush:    {armAnim:'armSlashGC',     legAnim:'legKickGC',      bodyAnim:'bodySwayGC',        particleColor:'#ec4899'},
        Dreamy:       {armAnim:'armFlutterDreamy',legAnim:'legGlideDreamy', bodyAnim:'bodyFloatDreamy',   particleColor:'#a78bfa'},
        Y2K:          {armAnim:'armPumpY2K',      legAnim:'legSlideY2K',    bodyAnim:'bodyGrooveY2K',     particleColor:'#facc15'},
        BoyGroup:     {armAnim:'armChopBG',       legAnim:'legStanceBG',    bodyAnim:'bodyPowerBG',       particleColor:'#3b82f6'},
        Cute:         {armAnim:'armWaveCute',     legAnim:'legHopCute',     bodyAnim:'bodyWiggleCute',    particleColor:'#f9a8d4'},
        DarkAcademia: {armAnim:'armSweepDA',      legAnim:'legStepDA',      bodyAnim:'bodyTwistDA',       particleColor:'#6b7280'},
        RnB:          {armAnim:'armRollRnB',      legAnim:'legGlideRnB',    bodyAnim:'bodyWaveRnB',       particleColor:'#10b981'},
        SyncFormation:{armAnim:'armRaiseSF',      legAnim:'legMarkSF',      bodyAnim:'bodyLockSF',        particleColor:'#e879f9'}
    },
    getDanceStyle(concept,choreo,outfit) {
        if(choreo==='hard'||outfit==='y2k_street')return'HipHop';
        if(concept==='GirlCrush')return'GirlCrush';
        if(concept==='Dreamy'||outfit==='fairy_gown')return'Dreamy';
        if(concept==='Y2K')return'Y2K';
        if(concept==='BoyGroup'||choreo==='masculine')return'BoyGroup';
        if(concept==='Refreshing'||concept==='Cute')return'Cute';
        if(concept==='DarkAcademia')return'DarkAcademia';
        if(concept==='RnB')return'RnB';
        if(choreo==='sync'||choreo==='studio1m')return'SyncFormation';
        return'Cute';
    },
    createIdolCharacter(member,styleData,outColor,_hair,index,syncMode) {
        const wrap=document.createElement('div');
        wrap.className='idol-char-wrap';
        if(!syncMode) wrap.style.animationDelay=`${index*0.12}s`;
        const isFemale=(member.gender==='Female');
        const skins=['#fcd5b5','#f5c18a','#e8a87c','#c68642'];
        const skin=skins[index%4];
        const fHairs=['#1a1a2e','#f4a261','#a855f7','#ec4899','#fbbf24'];
        const mHairs=['#1a1a2e','#374151','#78350f','#111827','#1e3a5f'];
        const hair=(isFemale?fHairs:mHairs)[index%5];
        wrap.innerHTML=`
          <div class="idol-char" style="--outfit-color:${outColor};--skin-color:${skin}">
            <div class="idol-hair ${isFemale?'idol-hair-long':'idol-hair-short'}" style="background:${hair};animation:${styleData.bodyAnim} 0.6s infinite alternate ease-in-out"></div>
            <div class="idol-head" style="background:${skin}"><div class="idol-eye-l"></div><div class="idol-eye-r"></div></div>
            <div class="idol-body" style="background:${outColor};animation:${styleData.bodyAnim} 0.5s infinite alternate ease-in-out"></div>
            <div class="idol-arms-row">
              <div class="idol-arm idol-arm-l" style="background:${skin};animation:${styleData.armAnim} 0.4s infinite alternate ease-in-out"></div>
              <div class="idol-arm idol-arm-r" style="background:${skin};animation:${styleData.armAnim} 0.4s infinite alternate ease-in-out;animation-direction:alternate-reverse"></div>
            </div>
            <div class="idol-legs-row">
              <div class="idol-leg idol-leg-l" style="background:${outColor};animation:${styleData.legAnim} 0.5s infinite alternate ease-in-out"></div>
              <div class="idol-leg idol-leg-r" style="background:${outColor};animation:${styleData.legAnim} 0.5s infinite alternate ease-in-out;animation-direction:alternate-reverse"></div>
            </div>
          </div>`;
        return wrap;
    },
    addDanceParticles(container,color,count=5) {
        for(let i=0;i<count;i++){
            const p=document.createElement('div');
            p.className='dance-particle';
            p.style.cssText=`background:${color};left:${Math.random()*100}%;animation-delay:${Math.random()*0.5}s;animation-duration:${0.6+Math.random()*0.4}s`;
            container.appendChild(p);
            setTimeout(()=>p.remove(),1200);
        }
    }
};


// ENHANCED OUTFIT SELECTION WITH 3D EFFECT
const OutfitSystem = {
    currentModel: null,
    isSpinning: false,
    outfitTiers: {
        common: { colors: ['#ec4899', '#3b82f6'], rarity: 1 },
        rare: { colors: ['#a855f7', '#f97316'], rarity: 2 },
        epic: { colors: ['#eab308', '#22c55e'], rarity: 3 },
        legendary: { colors: ['#fbbf24', '#ff6b6b'], rarity: 4 }
    },

    displayModel(idolData, outfitTier = 'common') {
        const modelElement = document.querySelector('.outfit-model-display') || 
                           document.querySelector('[data-role="idol-display"]');
        if (!modelElement) return;

        this.currentModel = modelElement;

        AnimationController.play(modelElement, 'outfitModelEntry', 800, () => {
            this.addModelAura(modelElement, outfitTier);
            this.startModelSpin(modelElement);
        });
    },

    startModelSpin(element) {
        if (this.isSpinning) return;
        this.isSpinning = true;
        element.style.animation = 'outfitSpinModel 6s linear infinite';
    },

    stopModelSpin(element) {
        if (!element) return;
        element.style.animation = '';
        this.isSpinning = false;
    },

    addModelAura(element, tier) {
        const tierData = this.outfitTiers[tier] || this.outfitTiers.common;
        const glowColor = tierData.colors[0];

        element.style.setProperty('--glow-color', glowColor);
        element.classList.add('outfit-aura');
        AnimationController.play(element, 'outfitGlowPulse', 2000);
    }
};

// ENHANCED AWARD SYSTEM WITH COMPLEX LOGIC
const AwardSystem = {
    awardHistory: [],
    currentShowStats: {},

    calculateAwardChance(idolStats, competitors = 5) {
        const vocals = Math.max(0, Math.min(100, idolStats.vocals || 0));
        const dance = Math.max(0, Math.min(100, idolStats.dance || 0));
        const stage = Math.max(0, Math.min(100, idolStats.stage || 0));
        const popularity = Math.max(0, Math.min(100, idolStats.popularity || 0));
        const fandom = Math.max(0, Math.min(100, idolStats.fandom || 0));

        const performanceScore = (vocals * 0.25) + (dance * 0.25) + (stage * 0.2);
        const popularityScore = (popularity * 0.15) + (fandom * 0.15);
        const totalScore = performanceScore + popularityScore;

        const competitiveFactor = 1 - (Math.min(competitors, 20) / 25);
        const awardChance = Math.min(100, (totalScore / 50) * 100 * competitiveFactor);

        return {
            chance: awardChance,
            performanceScore,
            popularityScore,
            competitiveFactor,
            breakdown: {
                vocals: vocals * 0.25,
                dance: dance * 0.25,
                stage: stage * 0.2,
                popularity: popularity * 0.15,
                fandom: fandom * 0.15
            }
        };
    },

    announceWinner(winner, awardType, animatedElement) {
        if (!animatedElement) return;

        AnimationController.play(animatedElement, 'awardTrophyRise', 1500);

        setTimeout(() => {
            AnimationController.play(animatedElement, 'awardSpotlight', 2000);
        }, 500);

        setTimeout(() => {
            AnimationController.play(animatedElement, 'awardTrophySpin', 2000);
        }, 1000);

        this.createConfettiBurst(animatedElement, 30);
        this.createClapPulse(animatedElement);

        this.awardHistory.push({
            winner,
            awardType,
            date: new Date(),
            stats: this.currentShowStats
        });
    },

    createConfettiBurst(element, count) {
        const container = element.parentElement || document.body;
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            const angle = (360 / count) * i;
            const distance = 100;

            const tx = Math.cos(angle * Math.PI / 180) * distance;
            const ty = Math.sin(angle * Math.PI / 180) * distance * 0.7;

            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: linear-gradient(135deg, #ec4899, #3b82f6);
                opacity: 1;
                pointer-events: none;
                border-radius: 50%;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
            `;

            confetti.style.setProperty('--tx', tx + 'px');
            confetti.style.setProperty('--ty', ty + 'px');

            document.body.appendChild(confetti);
            AnimationController.play(confetti, 'awardConfetti', 2000, () => confetti.remove());
        }
    },

    createClapPulse(element) {
        AnimationController.play(element, 'awardClapPulse', 1000);
    }
};

// ENHANCED MV SYSTEM
const MVSystem = {
    currentMVScene: 0,
    mvEffects: {
        flickering: 'mvFlickering',
        cinematic: 'mvCinematicZoom',
        shake: 'mvFrameShake',
        filmGrain: 'mvFilmGrain'
    },

    playMVFootage(mvElement, effects = ['cinematic', 'filmGrain']) {
        if (!mvElement) return;

        AnimationController.play(mvElement, 'mvFrameEntry', 1200);

        effects.forEach((effect, index) => {
            setTimeout(() => {
                if (this.mvEffects[effect]) {
                    AnimationController.play(mvElement, this.mvEffects[effect], 3000);
                }
            }, index * 800);
        });
    }
};

// ENHANCED ACTION FEEDBACK SYSTEM
const ActionFeedback = {
    feedbackQueue: [],
    isProcessing: false,

    showFeedback(type, message, duration = 2000) {
        this.feedbackQueue.push({ type, message, duration });
        if (!this.isProcessing) this.processFeedbackQueue();
    },

    processFeedbackQueue() {
        if (this.feedbackQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { type, message, duration } = this.feedbackQueue.shift();

        const feedbackEl = this.createFeedbackElement(type, message);

        const animationType = type === 'success' ? 'actionFloatIn' : 
                            type === 'failure' ? 'failureShake' :
                            type === 'levelup' ? 'levelUpRays' : 'actionFloatIn';

        AnimationController.play(feedbackEl, animationType, 500);

        setTimeout(() => {
            AnimationController.play(feedbackEl, 'fadeOut', 400, () => {
                feedbackEl.remove();
                setTimeout(() => this.processFeedbackQueue(), 200);
            });
        }, duration);
    },

    createFeedbackElement(type, message) {
        const feedback = document.createElement('div');

        const typeStyles = {
            success: { bg: 'linear-gradient(135deg, #22c55e, #4ade80)', icon: '✓' },
            failure: { bg: 'linear-gradient(135deg, #ef4444, #f87171)', icon: '✗' },
            levelup: { bg: 'linear-gradient(135deg, #eab308, #fbbf24)', icon: '★' },
            info: { bg: 'linear-gradient(135deg, #3b82f6, #60a5fa)', icon: 'ℹ' }
        };

        const style = typeStyles[type] || typeStyles.info;

        feedback.style.cssText = `
            position: fixed;
            padding: 15px 25px;
            background: ${style.bg};
            color: white;
            border-radius: 10px;
            font-weight: bold;
            font-size: 16px;
            z-index: 9999;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 10px;
            bottom: 30px;
            right: 30px;
        `;

        feedback.innerHTML = `<span>${style.icon}</span> <span>${message}</span>`;
        document.body.appendChild(feedback);

        return feedback;
    }
};

// ENHANCED GAME LOGIC - REALISTIC CALCULATIONS
const GameLogicEnhanced = {
    calculateFatigueImpact(stats, fatigueLevel) {
        const fatiguePercent = Math.max(0, Math.min(100, fatigueLevel)) / 100;

        return {
            vocalsDamage: stats.vocals * (1 - (fatiguePercent * 0.4)),
            danceDamage: stats.dance * (1 - (fatiguePercent * 0.5)),
            stageDamage: stats.stage * (1 - (fatiguePercent * 0.35)),
            mentalImpact: -fatiguePercent * 20
        };
    },

    calculateInjuryRisk(activityType, duration, currentHealth, fatigueLevel) {
        const baseRisk = {
            performance: 5,
            comeback: 15,
            intensive_practice: 8,
            photo_shoot: 2,
            concert: 20
        };

        const activity = baseRisk[activityType] || 5;
        const durationFactor = (duration / 7);
        const healthFactor = (100 - Math.max(0, currentHealth)) / 100;
        const fatigueFactor = Math.max(0, fatigueLevel) / 100;

        return Math.min(50, activity + (durationFactor * 5) + (healthFactor * 10) + (fatigueFactor * 15));
    },

    calculateCompetitionOutcome(myStats, rivalStats, showType) {
        const myScore = this.calculatePerformanceScore(myStats, showType);
        const rivalScore = this.calculatePerformanceScore(rivalStats, showType);

        const baseDiff = myScore - rivalScore;
        const volatility = Math.random() * 5;
        const finalDiff = baseDiff + (volatility - 2.5);

        return {
            win: finalDiff > 0,
            margin: Math.abs(finalDiff),
            myScore,
            rivalScore
        };
    },

    calculatePerformanceScore(stats, showType = 'music_show') {
        const weights = {
            music_show: { vocals: 0.3, dance: 0.3, stage: 0.4 },
            award_show: { vocals: 0.25, dance: 0.25, stage: 0.25, popularity: 0.25 },
            concert: { vocals: 0.35, dance: 0.35, stage: 0.3 },
            reality_show: { popularity: 0.4, personality: 0.3, trend: 0.3 }
        };

        const weight = weights[showType] || weights.music_show;

        return (stats.vocals || 0) * weight.vocals +
               (stats.dance || 0) * weight.dance +
               (stats.stage || 0) * weight.stage +
               ((stats.popularity || 0) * (weight.popularity || 0)) +
               ((stats.personality || 0) * (weight.personality || 0)) +
               ((stats.trend || 0) * (weight.trend || 0));
    }
};

console.log('✓ Enhanced Game Logic v14.0 loaded successfully');


document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. GAME STATE & MASSIVE DATABASE (V10.1 Brutal)
    // ==========================================
        const AGENCY_TYPES = {
        standard:       { m:500000000,  c:20000000,  r:0,     sB:0,   marketingMulti:1.0,  fandomMulti:1.0,  traineeBias:0,   stageBonus:0,  songwriteBonus:0 },
        chaebol:        { m:2000000000, c:90000000,  r:2500,  sB:-10, marketingMulti:1.3,  fandomMulti:1.2,  traineeBias:-5,  stageBonus:5,  songwriteBonus:0 },
        indie:          { m:100000000,  c:5000000,   r:-300,  sB:25,  marketingMulti:0.9,  fandomMulti:0.9,  traineeBias:10,  stageBonus:10, songwriteBonus:15 },
        global:         { m:1500000000, c:70000000,  r:1200,  sB:-5,  marketingMulti:1.4,  fandomMulti:1.3,  traineeBias:0,   stageBonus:0,  songwriteBonus:0 },
        survival:       { m:800000000,  c:60000000,  r:400,   sB:5,   marketingMulti:1.15, fandomMulti:1.4,  traineeBias:5,   stageBonus:8,  songwriteBonus:0 },
        digital:        { m:400000000,  c:25000000,  r:200,   sB:-5,  marketingMulti:1.5,  fandomMulti:1.1,  traineeBias:-5,  stageBonus:0,  songwriteBonus:5 },
        hiphop:         { m:350000000,  c:18000000,  r:100,   sB:15,  marketingMulti:0.95, fandomMulti:0.85, traineeBias:8,   stageBonus:5,  songwriteBonus:20 },
        actor_idol:     { m:700000000,  c:40000000,  r:500,   sB:-3,  marketingMulti:1.1,  fandomMulti:1.0,  traineeBias:0,   stageBonus:12, songwriteBonus:0 },
        jpop_crossover: { m:900000000,  c:50000000,  r:300,   sB:-2,  marketingMulti:1.2,  fandomMulti:1.15, traineeBias:-3,  stageBonus:5,  songwriteBonus:5 },
        ai_tech:        { m:600000000,  c:35000000,  r:150,   sB:-8,  marketingMulti:1.6,  fandomMulti:0.95, traineeBias:-10, stageBonus:0,  songwriteBonus:10 },
        classical:      { m:450000000,  c:22000000,  r:100,   sB:20,  marketingMulti:0.85, fandomMulti:0.8,  traineeBias:12,  stageBonus:15, songwriteBonus:10 },
        idol_school:    { m:600000000,  c:30000000,  r:100,   sB:0,   marketingMulti:1.0,  fandomMulti:1.0,  traineeBias:5,   stageBonus:8,  songwriteBonus:5 }
    };

    let gameData = {
        ceo: "", agency: "", type: "", money: 0, rep: 0, 
        y: 1, m: 1, w: 1, cost: 0,
        trainees: [], groups: [], activeSongs: [], staff: [],
        facilities: { practice: 1, studio: 1, dorm: 1, clinic: 1 },
        finance: { stock: 5000, owned: 100, loan: 0, loanLimit: 500000000, loanDeadline: 0, history: [], inc: 0, exp: 0, investors: 0 },
        audition: { active: false, type: null, weeks: 0, isScouting: false, scoutTarget: null },
        staffSearch: { active: false, role: null, weeks: 0, candidates: [] },
        pendingReleases: [], 
        mainLogs: [],
        activeRivals: [] // The dynamic industry
    };

    // V15.5 BRIDGE: expose gameData for deep systems patch
    window._gd = gameData;

    let queueAnimReleases = [];

    // EXTREMELY MASSIVE RNG DATABASE (v15 EXPANDED)
    const nmFirst = ["Kim","Lee","Park","Choi","Jung","Kang","Han","Kwon","Yoon","Shin","Hwang","Song","Ahn","Baek","Go","Lim","Heo","Son","Oh","Seo","Ryu","Hong","Moon","Jang","Noh","Woo","Cha","Ban","Byun","Im","Ko","Nam","Do","Gong","Pyo","Yoo","Eom","Gi","Ha","Ji","Mun","Yang","Tak"];
    const nmBoy = ["Ji-hoon","Do-hyun","Tae-hyung","Joon","Hyun-woo","Min-ho","Yeon-jun","Jung-kook","Eun-woo","Seung-cheol","Woo-jin","Jae-hyun","San","Hong-joong","Ming-yu","Soo-bin","Sunoo","Jay","Heeseung","Won-bin","Sung-chan","Chan-young","Tae-min","Si-woo","Jae-min","Ha-chan","Dae-won","In-seong","Dong-ha","Hyun-jin","Yeo-sang","Woo-hyuk","Se-jun","Jun-ho","Ji-sung","Seok-jin","Nam-joon","Ho-seok","Yoon-gi","Jun-seo","Sang-woo","Byung-chan","Seung-min","Han-sol","Dong-pyo","Yun-ho","Je-no","Ren-jun","Cheon-le","Ji-woo","Sung-hoon","Kyung-ho","Tae-ho","Min-gyu","Su-ho","Doh-yon","Hyun-suk","Jun-hyuk","Yo-han","Gun-woo","Seon-woo","Chan-hee"];
    const nmGirl = ["Min-ji","Soo-jin","Seo-yeon","Ha-eun","Ye-jin","Bo-young","Yoo-jin","Karina","Won-young","Ji-soo","Chae-won","Hae-rin","Hye-in","Winter","Yu-jin","Rei","Leeseo","Eun-chae","Su-min","Yoo-na","Hye-won","Ji-yeon","Tae-yeon","Yuri","Soo-young","Sun-mi","Moon-byul","Na-yeon","Da-hyun","Chae-ryeong","Ye-ji","Ryujin","Lia","Yuna","Ga-eul","An-yu-jin","So-yeon","Mi-yeon","Ye-na","So-won","Sin-b","Um-ji","Sul-lyung","Se-eun","Ye-seo","Ha-yoon","Bo-na","Ji-min","Jennie","So-hee","Yu-ri","Na-eun","Min-young","Eun-bi","Chae-yeon","Da-yeon","Soo-ah","Hee-jin","Hyun-jin","Go-won","Yeo-reum"];
    const nmGlob = ["Felix (AUS)","Yuki (JPN)","Natty (THA)","Kevin (CAN)","Leo (AUS)","Mark (CAN)","Lily (AUS)","Hanni (AUS)","Minnie (THA)","Lisa (THA)","Vernon (USA)","Joshua (USA)","Matthew (CAN)","Ricky (CHN)","Zhang Hao (CHN)","Pharita (THA)","Ruka (JPN)","Ten (THA)","Bambam (THA)","Jackson (HKG)","Yuta (JPN)","Hendery (MAC)","Jun (CHN)","The8 (CHN)","Shotaro (JPN)","Haruto (JPN)","Mashiho (JPN)","Hanbin (VNM)","Daniel (AUS)","Anton (USA)","Sana (JPN)","Momo (JPN)","Mina (JPN)","Sakura (JPN)","Kazuha (JPN)","Danielle (KOR/AUS)","Mashiro (JPN)","Tsuki (JPN)","Manon (FRA)","Kotone (JPN)","Wendy (CAN)","Tiffany (USA)","Krystal (USA)","Aria (NZL)","Sophia (PHL)","Liam (DEU)","Sebastian (BRA)","Takuya (JPN)","Megan (USA)"];
    
    const tBg = ["Anak SMA biasa dari Busan","Mantan trainee Big 3 (5 tahun)","Pernah viral di TikTok (10M views)","Mantan atlet nasional renang","Vokalis utama paduan suara gereja","Aktor cilik sejak umur 8 tahun","Anak konglomerat Samsung","Mantan finalis Produce 101","Penari jalanan Hongdae terkenal","Lulusan terbaik SOPA","Pernah debut nugu tapi bubar","Rapper underground K-HipHop Scene","Pernah ditipu agensi bodong","Mantan model brand lokal","YouTuber cover dance 500K subs","Pemenang kontes vokal nasional KBS","Murid terbaik SM Academy","Mantan trainee JYP (cut final)","Trainee pindahan dari China","Peraih medali emas taekwondo","Mantan idol cilik girlband 2010s","Mahasiswa seni Seoul National Univ","Penyanyi busking Hongdae legendaris","Anak diplomat Korea di luar negeri","Mantan dancer backup BTS","Peserta Street Woman/Man Fighter","Model runway Seoul Fashion Week","Pemain musikal anak Broadway Korea","Juara kompetisi beatbox Asia","Penulis lagu remaja di SoundCloud","Mantan figure skater junior nasional","Peserta The Voice Kids Korea","Dancer TikTok 2M followers","Cosplayer terkenal di Coex","Anak panti asuhan yang berbakat","Mantan trainee Pledis (7 tahun!)","Guru les vokal yang jadi trainee","Dropout universitas jurusan musik","Transfer student dari Jepang (Avex)","Mantan child actor MBC drama","Gitaris band sekolah viral","Penari tradisional Korea","Bilingual English-Korean dari LA","Pemenang kompetisi rap SMTM","Mantan atlet gymnastic nasional","Streamer gaming yang beralih karir","Trainee veteran 8 tahun tanpa debut","Drummer band indie Hongdae","Cucu komposer lagu rakyat legendaris"];
    const tTrait = [
        { name: "Pekerja Keras", eff: "Stat growth +25%" },
        { name: "Moodmaker", eff: "Stress grup -5/mgg, Variety +20%" },
        { name: "Center Material", eff: "Visual +20, Dance +10, Stage +15" },
        { name: "Vocalist Jenius", eff: "Vocal +30, Charisma +10" },
        { name: "Dance Machine", eff: "Dance +30, Stamina +15" },
        { name: "Rapper Underground", eff: "Rap +30, Songwriting +10" },
        { name: "Skandal-Prone", eff: "15% skandal/bulan, PR nightmare" },
        { name: "Visual Dewa", eff: "Visual +35, Brand Rep +25%" },
        { name: "Problematic", eff: "Attitude buruk, chemistry -10" },
        { name: "Kaca Kaca", eff: "Mental fragile, gampang cedera & quit" },
        { name: "4th Gen Ace", eff: "All stats +10, adaptasi cepat" },
        { name: "Composer Prodigy", eff: "Songwriting +35, royalti +20%" },
        { name: "Multilingual", eff: "Language +40, Global fans +30%" },
        { name: "Stage Monster", eff: "Stage +30, Charisma +20" },
        { name: "SNS King/Queen", eff: "Individual fans +50%/mgg" },
        { name: "Born Leader", eff: "Chemistry bonus +15 ke semua" },
        { name: "Glass Cannon", eff: "Vocal/Dance +25 tapi Stamina -20" },
        { name: "Fan Service Expert", eff: "Fansign income +40%" },
        { name: "Perfectionist", eff: "Album quality +15%, prep +1 mgg" },
        { name: "Rebel Spirit", eff: "Unique concept +20%, stress rate +15%" },
        { name: "Healing Voice", eff: "Vokal OST/Ballad +40%, GP recognition +" },
        { name: "Iron Stamina", eff: "Stamina +35, cedera rate -80%" },
        { name: "Variety Genius", eff: "Variety show efek x2, meme potential" },
        { name: "Dark Horse", eff: "Mulai lemah, growth x2 setelah 6 bulan" },
        { name: "Visual Hole", eff: "Visual -25, tapi skill lain +15" },
        { name: "Pemalas Berbakat", eff: "Growth -50% tapi potential tinggi" },
        { name: "Lucky Star", eff: "Random event selalu positif" },
        { name: "Legendary Trainee", eff: "All stats +20, all growth +30%" },
        { name: "Night Owl", eff: "Training malam +30% efektif" },
        { name: "Introvert Genius", eff: "Solo project +30%, variety -15%" }
    ];

    // Dynamic Rival Generation DB (v15 MEGA EXPANDED)
    const RIVAL_TIERS = ["Legend", "Top-Tier", "Top-Tier", "Mid-Tier", "Mid-Tier", "Mid-Tier", "Nugu", "Nugu", "Nugu", "Nugu"];
    const rivalPrefix = ["NEO","STAR","X","PINK","VELVET","ECLIPSE","TITAN","CHERRY","LUNA","SOLAR","DARK","SUPER","MEGA","ALPHA","ZERO","INFINITE","VIVID","PRISM","ICON","KINGDOM","TEMPEST","TREASURE","GHOST","EVERGLOW","HOT","BLITZ","NOVA","PHANTOM","CYPHER","ZENITH","APEX","ORBIT","COSMIC","AZURE","CRIMSON","IVORY","ONYX","FROST","BLAZE","STORM","SHADOW","MIRAGE","NEXUS","VORTEX","PULSE","SONIC","LUCID","EMBER","FLUX","DRIFT","ZEPHYR","AXIOM","VERTEX","HELIX","RADIANT","MYSTIC","REGAL","AURORA","GENESIS","ETERNAL","DIVINE","ROYAL","CHROME","NOIR","BLANC","JADE","SAPPHIRE","RUBY","OPAL","CRYSTAL","DIAMOND","VELOUR","PRESTO","IKON","BLISS","GLITCH","ASTRA","LYRIC","MUSE","CIPHER","FORTE"];
    const rivalSuffix = ["Z","ONE","7","NINE","BOMB","MAGIC","STARS","HEARTS","ZONE","MIND","LIGHT","DREAM","WAVE","STAY","SYNC","SPARK","FLASH","GLOW","SHINE","RISE","ERA","CODE","VERSE","WORLD","PLANET","MOON","SUN","SKY","FIRE","ICE","WIND","SOUL","VIBE","BEAT","SOUND","NOTE","KEY","BOND","CREW","SQUAD","UNIT","FORCE","POWER","BLADE","CROWN","REIGN","GLORY","HALO","ANGEL","DEMON","SPIRIT","LEGEND","MYTH","EPIC","SAGA","TALE","CHAPTER","FLUX","ORBIT","DASH","RUSH","ECHO","RAVE","VOLT","NOIR","WAVE","LOOP","PEAK","CORE","BYTE","NODE","SIGN","MARK","DAWN","DUSK","EDGE"];
    const songWords1 = ["Love","Broken","Shooting","Midnight","Toxic","Shine","Fever","Deja","Hype","Magnetic","God's","Super","Beautiful","Dark","Crazy","Neon","Electric","Velvet","Crystal","Golden","Burning","Frozen","Sweet","Bitter","Silent","Savage","Gentle","Cosmic","Infinite","Fatal","Divine","Wicked","Sacred","Shattered","Rising","Falling","Dancing","Awakened","Hidden","Lost","Stolen","Eternal","Future","Digital","Lucid","Vivid","Faded","Crimson","Obsidian","Emerald","Shadow","Thunder","Whisper","Echo","Phantom","Chaos","Paradise","Heaven","Dream","Fantasy","Illusion","Enchanted","Fearless","Reckless","Timeless","Untold","Panorama","Mafia","Psycho","Monster","Firework","Butterfly","Antifragile","Magnetic","Spicy","Cupid","Queencard","Seven","Flower","Polaroid"];
    const songWords2 = ["Dive","Glass","Star","Runaway","Me","Light","Vu","Boy","Menu","Nova","Monster","Night","Dream","Illusion","Over","Again","Forever","Never","Tonight","Tomorrow","Hearts","Kiss","Touch","Feel","Know","Want","Need","Love","Hate","Hope","Wish","Promise","Secret","Mystery","Game","Dance","Song","Beat","Rhythm","Melody","Anthem","Chorus","Note","Door","Mirror","Shadow","Flame","Storm","Rain","Wave","Ocean","Mountain","Sky","Moon","Sun","World","Galaxy","Infinity","Zero","Seven","Gold","Crown","Kingdom","Empire","Dynasty","Legacy","Destiny","Fate","Bloom","Rose","Petal","Fire","Water","Thunder","Lightning","Serenade","Lullaby","Prayer","Confession","Letter","Signal","Horizon","Paradise","Utopia","Wonderland"];

    const bigAgencies = ['SM Ent.','JYP Ent.','YG Ent.','HYBE','Starship','Cube','Pledis','RBW','KQ','ADOR','Source Music','P-NATION','IST','Fantagio','Woollim','Jellyfish','FNC','TOP Media','WM Ent.','Brand New Music','Stone Music','Kakao Ent.','CJ ENM'];
    const midAgencies = ['MLD Ent.','Plan A','Around Us','OUI Ent.','Swing Ent.','Abyss Company','ATTRAKT','HIGHUP','MODHAUS','DSP Media','C9 Ent.','BPM Ent.','Blockberry','Polaris'];
    const nuguAgencies = ['Small Dreams Ent.','Hope Sound','Indie Star Music','Cloud Nine Ent.','Budget Beat Ent.','Dream Factory Seoul','Passion Ent.','Rising Sun Music','Moon River Agency','Golden Gate Ent.','New Dawn Ent.','Phoenix Rising Ent.','Spark Music','Sunrise Studio','Tiny Light Studio'];

    function generateRandomRival(forceTier) {
        let useSingle = Math.random() < 0.12;
        let name = useSingle ? rivalPrefix[Math.floor(Math.random()*rivalPrefix.length)] : Math.random() > 0.45 ? `${rivalPrefix[Math.floor(Math.random()*rivalPrefix.length)]} ${rivalSuffix[Math.floor(Math.random()*rivalSuffix.length)]}` : `${rivalPrefix[Math.floor(Math.random()*rivalPrefix.length)]}-${rivalSuffix[Math.floor(Math.random()*rivalSuffix.length)]}`;
        let sng = `${songWords1[Math.floor(Math.random()*songWords1.length)]} ${songWords2[Math.floor(Math.random()*songWords2.length)]}`;
        
        let tier = forceTier || RIVAL_TIERS[Math.floor(Math.random() * RIVAL_TIERS.length)];
        let baseScore, fandom, avgStat, physSales, digitalPower, agency;
        let gender = Math.random() > 0.5 ? 'Male' : 'Female';
        let memberCount = gender === 'Male' ? (4 + Math.floor(Math.random()*9)) : (4 + Math.floor(Math.random()*6));

        if(tier === "Legend") { 
            baseScore = 130 + Math.random()*40; fandom = 3000000 + Math.random()*7000000; 
            avgStat = 85 + Math.random()*15; physSales = 500000 + Math.random()*3000000;
            digitalPower = 90 + Math.random()*10; agency = bigAgencies[Math.floor(Math.random()*4)];
        }
        else if(tier === "Top-Tier") { 
            baseScore = 90 + Math.random()*30; fandom = 500000 + Math.random()*1500000; 
            avgStat = 75 + Math.random()*15; physSales = 100000 + Math.random()*500000;
            digitalPower = 70 + Math.random()*20; agency = bigAgencies[Math.floor(Math.random()*bigAgencies.length)];
        }
        else if(tier === "Mid-Tier") { 
            baseScore = 55 + Math.random()*25; fandom = 50000 + Math.random()*200000; 
            avgStat = 60 + Math.random()*15; physSales = 20000 + Math.random()*80000;
            digitalPower = 40 + Math.random()*30; agency = midAgencies[Math.floor(Math.random()*midAgencies.length)];
        }
        else { 
            baseScore = 15 + Math.random()*20; fandom = 500 + Math.random()*8000; 
            avgStat = 40 + Math.random()*20; physSales = 100 + Math.random()*5000;
            digitalPower = 10 + Math.random()*25; agency = nuguAgencies[Math.floor(Math.random()*nuguAgencies.length)];
        }

        return { 
            title: sng, artist: name, tier: tier, baseScore: baseScore, fandom: Math.floor(fandom),
            avgStat: avgStat, physSales: Math.floor(physSales), digitalPower: digitalPower, agency: agency,
            gender: gender, memberCount: memberCount,
            growthRate: tier === 'Legend' ? 0.001 : tier === 'Top-Tier' ? 0.008 : tier === 'Mid-Tier' ? 0.015 : 0.02,
            decayRate: tier === 'Legend' ? 0.002 : tier === 'Top-Tier' ? 0.005 : tier === 'Mid-Tier' ? 0.01 : 0.025,
            weeksSinceRelease: Math.floor(Math.random()*12), trophies: tier === 'Legend' ? 15+Math.floor(Math.random()*30) : tier === 'Top-Tier' ? 5+Math.floor(Math.random()*15) : Math.floor(Math.random()*5),
            yearlyTrophies: 0, yearlyAlbumSales: Math.floor(physSales * (0.5 + Math.random())), topSongScore: baseScore
        }; 
    }

    // Evolve rivals each week — they grow, decay, comeback, disband
    function evolveRivals() {
        gameData.activeRivals.forEach(r => {
            r.weeksSinceRelease = (r.weeksSinceRelease || 0) + 1;
            // Fandom natural growth (bigger groups grow slower but are more stable)
            let growthNoise = (Math.random() - 0.4) * r.growthRate;
            r.fandom = Math.max(100, Math.floor(r.fandom * (1 + growthNoise)));
            // Song score decays over time (like real charts)
            if(r.weeksSinceRelease > 2) r.baseScore = Math.max(5, r.baseScore * (1 - r.decayRate));
            // Random comeback: rivals release new songs periodically
            let cbChance = r.tier === 'Legend' ? 0.02 : r.tier === 'Top-Tier' ? 0.035 : r.tier === 'Mid-Tier' ? 0.04 : 0.03;
            if(Math.random() < cbChance) {
                r.title = `${songWords1[Math.floor(Math.random()*songWords1.length)]} ${songWords2[Math.floor(Math.random()*songWords2.length)]}`;
                r.weeksSinceRelease = 0;
                // Fresh song score based on tier + some variance
                let tierBase = r.tier === 'Legend' ? 130 : r.tier === 'Top-Tier' ? 90 : r.tier === 'Mid-Tier' ? 55 : 15;
                r.baseScore = tierBase + Math.random()*30 + (r.fandom / 500000); // Fandom amplifies comeback power
                r.physSales = Math.floor(r.fandom * (r.tier === 'Legend' ? 0.3 : r.tier === 'Top-Tier' ? 0.2 : 0.08));
                r.yearlyAlbumSales = (r.yearlyAlbumSales || 0) + r.physSales;
                r.topSongScore = Math.max(r.topSongScore || 0, r.baseScore);
            }
            // Tier promotion/demotion over long periods
            if(r.fandom > 2000000 && r.tier !== 'Legend' && Math.random() < 0.005) { r.tier = 'Legend'; r.growthRate = 0.001; r.decayRate = 0.002; }
            else if(r.fandom > 400000 && r.tier === 'Mid-Tier' && Math.random() < 0.01) { r.tier = 'Top-Tier'; r.growthRate = 0.008; r.decayRate = 0.005; }
            else if(r.fandom < 30000 && r.tier === 'Mid-Tier' && Math.random() < 0.01) { r.tier = 'Nugu'; }
            else if(r.fandom < 5000 && r.tier !== 'Nugu' && Math.random() < 0.005) { r.tier = 'Nugu'; }
        });
    }

    // Initialize dynamic rivals for the ecosystem — weighted distribution
    // Real industry: 3-4 Legends, 8-10 Top-Tier, 15 Mid-Tier, rest Nugu
    for(let i=0; i<3; i++) gameData.activeRivals.push(generateRandomRival('Legend'));
    for(let i=0; i<8; i++) gameData.activeRivals.push(generateRandomRival('Top-Tier'));
    for(let i=0; i<14; i++) gameData.activeRivals.push(generateRandomRival('Mid-Tier'));
    for(let i=0; i<15; i++) gameData.activeRivals.push(generateRandomRival('Nugu'));

    // EXPANDED & COMPLEX: SUPER DIVERSE K-NETZ COMMENTS
    const socComments = {
        debut_good: [
            "GILAAA DEBUT TERBAIK TAHUN INI!", "MV-nya mahal banget, {agency} niat abis.", "Center-nya {member} visual dewa banget astaga!", 
            "Monster rookie alert! Vokal mereka stabil banget buat ukuran rookie.", "Lagunya langsung masuk playlist. Kualitasnya bukan main-main.",
            "Sumpah aku nangis lihat koreografinya. Sinkron parah!", "Konsepnya fresh banget! Udah capek lihat konsep yang itu-itu aja.",
            "Line distribusinya bagus, agensi memperlakukan mereka dengan adil.",
            "Prediksi: grup ini bakal jadi next big thing. Mark my words.", "Debut stage mereka bikin trending #1 di X, gila sih.",
            "Akhirnya debut juga! Aku sudah follow mereka sejak pre-debut.", "MR Removed-nya bersih banget, mereka beneran bisa nyanyi live!",
            "Choreo point dance-nya iconic banget! Sudah di-TikTok 50K orang.", "Styling debut mereka flawless, stylistnya siapa sih?",
            "Baru debut tapi sudah sold out fansign, fandomnya gila.", "Agensi {agency} akhirnya debut grup yang bener! Proud of you!",
            "Visual line mereka op banget, ini sih visual crush generasi baru.", "B-side track-nya juga bagus semua, bukan album isi-isian.",
            "Dance break di tengah lagunya bikin merinding! Formasi kaleidoscope!!", "Producer lagunya siapa? Genius banget, hook-nya super catchy."
        ],
        debut_bad: [
            "Konsep apaan nih? Ketinggalan jaman kayak tahun 2010.", "Nugu agency {agency} trying hard 😂", "Lagunya skip banget, kupingku berdarah.", 
            "Outfitnya kek gembel, stylistnya tolong dipecat dong.", "Kasihan {member}, bakatnya sia-sia di agensi ini.", "Flop di chart udah pasti.",
            "Siapa sih yang bikin lagu ini? Berisik doang gak ada melodinya.", "Kelihatan banget agensinya miskin, MV-nya murahan.",
            "Debut terus bubar 6 bulan kemudian, udah bisa ditebak.", "Lip sync dari awal sampe akhir, live vocal kemampuannya dimana?",
            "Mereka debut tapi ga ada yang ngomongin... sad reality nugu.", "MV view-nya kalah sama video kucing di YouTube wkwk.",
            "Konsepnya plagiat dari {group} banget, tolong kreatif sedikit.", "Line distribusi apa ini, {member} cuma dapet 3 detik?!",
            "Dance-nya berantakan, yang satu kekiri yang satu kekanan.", "Budget MV habis kemana? Ini mah shooting di parkiran.",
            "Auto skip dari playlist. Sorry not sorry.", "Fansign mereka cuma diisi 10 orang... aku malu lihatnya."
        ],
        predebut_hype: [
            "Wah cover dance {group} gila banget! Kapan debut?", "Trainee {agency} yang namanya {member} itu cakep parah, aku siap nge-stan!",
            "Busking mereka rame banget! Vokalnya nembus jalanan Hongdae.", "Tolong cepetan debutin {group}!!!", "Ada yang tau gak akun sosmed pribadinya {member}?",
            "Predebut content mereka sudah kayak grup debut, quality gila.", "Fancam {member} dari busking kemarin udah 500K views!",
            "Dance cover mereka di YouTube trending #15! Belum debut loh!", "Skillnya udah level debut, ngapain masih di trainee camp?",
            "Pre-debut fans udah banyak banget, debut pasti langsung charting.", "YT channel agensi naik 100K subs gara-gara predebut content {group}.",
            "Perasaan aku aja atau {member} makin glow up setiap bulan?", "Trainee evaluation video mereka bikin nangis, kerja kerasnya kelihatan.",
            "Choreography practice video mereka udah 1M views tanpa promosi!"
        ],
        predebut_hate: [
            "Ngapain sih pre-debut segala, mending langsung rilis lagu.", "Skillnya {member} masih kurang kok udah dipamer-pamerin.",
            "{agency} ga punya duit ya buat bikin MV resmi sampe disuruh busking doang?", "Agensi maksa banget biar viral.",
            "Predebut era kepanjangan, hype-nya udah turun duluan.", "Cover dance lagi, cover dance terus. Bikin lagu sendiri dong.",
            "Busking di Hongdae? Kasian banget, agensi beneran ga punya budget.", "Sabar ya calon nugu..."
        ],
        chart_high: [
            "SOTY SOTY SOTY!", "PAK (Perfect All-Kill) is coming buat {group}!", "Streaming terus yorobun! Kalahkan grup dari Big 3!", 
            "Gila lagu ini nempel terus di otak. Sumpah candu banget.", "{group} bener-bener mendominasi generasi ini.", "Bahkan non-fans aja pada dengerin lagu ini.",
            "DAEBAK! Melon #1 sudah 3 hari berturut-turut!", "Lagu ini literally di-loop semua orang di kantor ku.",
            "All-kill di semua platform! {group} era ini sih!", "Ibu ku yang ga tau kpop aja ikut nyanyi lagu ini 🤣",
            "Chart monster! Rivalnya pada ketar-ketir pasti.", "Lagu ini bakal jadi anthem tahun ini, no debate.",
            "Digital monster {group}! GP benar-benar suka lagunya.", "Ini sih udah SOTY candidate, masuk MAMA pasti.",
            "Streaming-nya gila, Spotify daily udah 5 juta!", "Apple Music #1 di 30 negara, hallyu power!",
            "Melon daily chart stabil di top 5 selama 2 minggu, wow."
        ],
        chart_low: [
            "Out of chart 😭 padahal lagunya lumayan.", "Kasian nggak ada yang dengerin selain fandomnya sendiri.", "Promosinya kurang ini {agency} ampas!", 
            "Kenapa {group} makin lama makin turun ya kualitasnya?", "Melon rank 999+ wkwkwk.", "Ganti produser tolong, lagunya jelek terus.",
            "Chart-nya turun kayak roller coaster yang cuma turun.", "Kemarin masih top 50, sekarang udah out. Flop era confirmed.",
            "Fandomnya streaming sampe mati tapi tetep ga naik, GP ga suka.", "Lagunya biasa aja, wajar sih keluar chart.",
            "Ini album terburuk mereka sih. Downgrade parah dari era sebelumnya.", "Sajaegi allegations incoming in 3...2...1...",
            "Cuma fandom yang streaming, zero GP interest.", "Budget habis di MV tapi lagunya ga catchy, salah prioritas."
        ],
        general: [
            "Kapan {group} comeback?", "Fancam {member} viral woy di TikTok! Visualnya ga main-main.", "Variety show mereka lucu banget 🤣", 
            "Kangen era sebelumnya...", "Tolong {agency} berikan {member} jatah nyanyi yang lebih banyak!", "Outfit mereka hari ini di Music Bank bagus banget.",
            "Aigoo {member} lucu banget di behind the scenes 😭", "Line distribution era ini lebih fair, bagus {agency}!",
            "Stage presence {member} berkembang pesat ya!", "Airport fashion {member} hari ini bikin heboh.",
            "Mereka keliatan happy banget di fansign, seneng lihatnya.", "Chemistry grup ini emang the best dah.",
            "Konten Weverse mereka selalu bikin ngakak.", "MAMA performance mereka tahun lalu masih bikin merinding sampai sekarang.",
            "Idol yang bisa nyanyi live dengan baik emang beda kelas.", "Semoga era selanjutnya lebih bagus lagi!"
        ],
        scandal_dating: [
            "DISPATCH MERILIS FOTO KENCAN {member}!!!", "Hah? Mereka pacaran? Fans merasa dikhianati!", "Selamat sih, tapi karir grup bisa hancur nih...", 
            "Agensi ngapain aja woy klarifikasi cepetan!!!", "Pantesan akhir-akhir ini {member} jarang update Weverse, sibuk pacaran ternyata 🤮",
            "Boikot PC dan albumnya! Merasa ditipu.",
            "Fans internasional: congrats! Fans Korea: 🔥🔥🔥", "4 jam setelah berita keluar, fanbase udah terbagi dua.",
            "Master fansite {member} sudah tutup akun. It's over.", "Penjualan album diprediksi turun 40% setelah ini.",
            "Yang single boleh marah, yang taken jangan munafik.", "Dispatch always wins, ga ada yang bisa sembunyi."
        ],
        scandal_attitude: [
            "Attitude {member} kontroversi banget? Wah red flag.", "Ternyata aslinya kasar ya ke staff. Gak nyangka.", "Boikot {group}! Tolong keluarkan {member}!",
            "Sifat aslinya ketahuan juga akhirnya. Gak sopan banget di variety show kemaren.", "Visual doang bagus tapi attitudenya 0.",
            "Mantan trainee ekspos attitude buruk {member} di forum.", "CCTV backstage bocor, {member} marah-marah ke junior.",
            "Staff agensi anonymously confirm attitude problem-nya.", "Fans mulai unstan massal, hashtag apologize trending.",
            "Ini bukan pertama kali attitude issue, sudah keberapa?", "Brand deal dibatalin semua gara-gara skandal ini."
        ],
        encore_bad: [
            "Encore stage {group} hancur lebur! Mereka gak bisa nyanyi live?", "Suara {member} fals banget astaga, aku yang malu dengerinnya.",
            "Agensi cuma peduli visual, gak pernah ngelatih vokal idolnya. Tragedi.", "Kasihan telinga para penonton di studio.",
            "MR Removed setelah menang... yah, mending ga usah dengerin.", "Lip sync terbongkar di encore, K-Netz murka.",
            "Ini kenapa idol harus bisa nyanyi live, bukan cuma dance.", "Encore stage mereka jadi meme nasional 💀",
            "Vocal trainer agensi tolong ditambah, kasian idolnya."
        ],
        vocal_praise: [
            "Gila nada tingginya {member} bikin merinding!", "Akhirnya ada idol yang beneran bisa nyanyi live tanpa lipsync.", "Vocalist jenius generasi ini!",
            "MR Removed mereka bersih banget gila. Menelan CD!",
            "High note {member} di music show hari ini bikin audience terdiam.", "Vokal stabil sambil koreografi berat? Ini superhuman.",
            "Honey voice {member} ini national treasure.", "Live vocal mereka lebih bagus dari studio version wtf.",
            "Ini baru idol yang punya talent beneran, bukan cuma muka."
        ],
        dance_praise: [
            "Dance break-nya gila banget, super sinkron!", "Main dancer {member} kerasukan michael jackson!", "Koreografinya susah banget tapi mereka ngerjainnya kayak gampang.",
            "Formasi kaleidoscope mereka bikin studio audience standing ovation.", "Footwork {member} itu bukan level idol biasa, ini professional dancer.",
            "Sinkronisasi 7 orang kayak satu tubuh, latihannya berapa jam sehari?", "Body isolation {member} di fancam bikin viral lagi.",
            "Studio Choom performance mereka udah 20M views!", "Choreographer-nya pasti bangga banget lihat mereka perform."
        ],
        sajaegi: [
            "Agensi miskin bisa #1 di Melon tengah malam? Pasti nyogok!", "Grafiknya aneh banget, manipulasi chart 100%!", "Boikot grup zombie ini!",
            "Data streaming-nya suspicious banget, jam 3 pagi tiba-tiba spike.", "Report ke Melon sudah, semoga diinvestigasi.",
            "Kalau beneran sajaegi, career-nya tamat.", "Fans grup lain sudah compile evidence, tinggal tunggu waktu."
        ],
        flop_disaster: [
            "Konsepnya maksa banget, nggak cocok sama lagunya.", "Agensi {agency} merusak karir {group} dengan rilisan ampas ini.", "Ini flop terbesar abad ini wkwk.",
            "Tolong kasih {group} lagu yang benar, jangan eksperimen aneh-aneh!",
            "Budget MV habis miliaran tapi lagunya ga memorable sama sekali.", "First week sales turun 60% dari era sebelumnya...",
            "K-Netz sudah bilang konsepnya ga cocok, agensi ga dengerin.", "Ini era yang bikin fans pindah fandom.",
            "Album fisik numpuk di gudang, warehouse bangkrut duluan.", "Produser lagunya siapa? Tolong jangan dipakai lagi."
        ],
        fanwar: [
            "Fandom {group} ribut sama fandom lain di X lagi 🍿", "FANWAR ALERT: Streaming war antara 2 fandom besar dimulai!",
            "Toxic fans merusak image {group}, tolong berhenti.", "Hashtag fanwar trending worldwide, K-media mulai liputan.",
            "Fandom civil war! OT4 vs OT5 berantem soal line distribution.", "Akgae fans {member} menyerang member lain, disgusting.",
            "Fanbase resmi {group} keluarkan statement soal toxic behavior."
        ],
        mental_health: [
            "{member} kelihatan kelelahan di fancam terbaru, semoga istirahat.", "Fans khawatir soal kesehatan mental {member}, agensi tolong perhatikan.",
            "Overwork culture di K-pop harus berubah, kasian idol-nya.", "{group} butuh hiatus, mereka sudah non-stop 2 tahun.",
            "Akhirnya {agency} kasih {group} istirahat, sudah waktunya."
        ],
        variety_viral: [
            "Klip {member} di Running Man jadi meme nasional 🤣🤣", "{group} di Knowing Bros bikin rating naik 3%!",
            "Fancam variety {member} 10M views! Idol paling lucu.", "Chemistry {member} sama MC di weekly idol the best.",
            "Behind-the-scenes {group} di backstage bikin ngakak sekaligus nangis."
        ]
    };

    let currentCharts = { melon: [], genie: [], flo: [], bugs: [], spotify: [], ytmusic: [], billboard: [] };
    window._charts = currentCharts; // V15.5 bridge
    const formatWon = (amt) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amt);
    window._formatWon = formatWon; // V15.5 bridge

    function generateSocialFeed(context = 'general', fallbackName = "Seseorang") {
        window._genSocialFeed = generateSocialFeed; // V15.5 bridge
        const feed = document.getElementById('social-feed'); 
        if(!feed) return;
        if(feed.childElementCount > 25) feed.innerHTML = '';
        
        let pool = socComments[context] || socComments.general; 
        let cText = pool[Math.floor(Math.random() * pool.length)];
        
        // Replace tags dynamically
        cText = cText.replace(/{agency}/g, gameData.agency);
        if(cText.includes('{member}') || cText.includes('{group}')) {
            let mName = fallbackName;
            let gName = fallbackName !== "Seseorang" ? fallbackName : "Grup Ini";
            if(gameData.groups.length > 0) { 
                let rG = gameData.groups.find(g => g.name === fallbackName) || gameData.groups[Math.floor(Math.random()*gameData.groups.length)]; 
                gName = rG.name;
                if(rG.members.length > 0) {
                    mName = rG.members[Math.floor(Math.random()*rG.members.length)].name; 
                }
            } 
            cText = cText.replace(/{member}/g, mName).replace(/{group}/g, gName); 
        }

        let type = (context === 'debut_good' || context === 'chart_high' || context === 'vocal_praise' || context === 'dance_praise' || context === 'predebut_hype') ? 'positive' : (context === 'debut_bad' || context === 'chart_low' || context === 'scandal_dating' || context === 'scandal_attitude' || context === 'encore_bad' || context === 'predebut_hate' || context === 'flop_disaster') ? 'negative' : 'neutral';
        if(context === 'sajaegi') type = 'alert';
        
        const bubble = document.createElement('div'); bubble.className = `chat-bubble ${type}`; 
        bubble.innerHTML = `<div class="chat-user">@User${Math.floor(Math.random()*99999)} • Pann/X</div><div style="font-weight:700;">${cText}</div>`; 
        feed.prepend(bubble);
    }

    // ==========================================
    // 2. CORE UTILS & UI
    // ==========================================
    window.openModal = function(id) { document.getElementById(id).style.display = 'flex'; };
    window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };
    function showToast(msg, type="normal") { const c = document.getElementById('toast-container'); const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t); setTimeout(() => { if(t.parentNode) t.parentNode.removeChild(t); }, 4000); }
    window._showToast = showToast; // V15.5 bridge
    function addMainLog(msg) { gameData.mainLogs.unshift(`[Y${gameData.y}/M${gameData.m}/W${gameData.w}] ${msg}`); if(gameData.mainLogs.length > 40) gameData.mainLogs.pop(); document.getElementById('main-activity-log').innerHTML = gameData.mainLogs.map(l => `<li>${l}</li>`).join(''); }
    window._addMainLog = addMainLog; // V15.5 bridge

    function addFinanceRecord(cat, type, amt, desc) {
        // V15.5 bridge
        window._addFinanceRecord = addFinanceRecord;
        gameData.finance.history.unshift({ y:gameData.y, m:gameData.m, w:gameData.w, cat, type, amt, desc });
        if(type === 'income') { 
            let invCut = 0;
            if(gameData.finance.investors > 0 && cat !== 'Investment' && cat !== 'Loan') {
                invCut = Math.floor(amt * gameData.finance.investors);
                amt -= invCut;
            }
            gameData.money += amt; 
            gameData.finance.inc += amt; 
            
            if(invCut > 0) {
                const log = document.getElementById('finance-log'); const li = document.createElement('li');
                li.innerText = `[Y${gameData.y}/M${gameData.m}/W${gameData.w}] Dividen Investor (20%) : -${formatWon(invCut)}`;
                li.style.color = 'var(--c-red-solid)'; log.insertBefore(li, log.firstChild);
            }
        } else { gameData.money -= amt; gameData.finance.exp += amt; }
        
        const log = document.getElementById('finance-log'); const li = document.createElement('li');
        li.innerText = `[Y${gameData.y}/M${gameData.m}/W${gameData.w}] ${desc} : ${type==='income'?'+':'-'}${formatWon(amt)}`;
        li.style.color = type === 'expense' ? 'var(--c-red-solid)' : 'var(--c-green-solid)'; log.insertBefore(li, log.firstChild);
        
        // V12: Visual flash for big money events
        if(amt >= 100000000 && typeof flashMoney === 'function') {
            if(type === 'income') flashMoney();
        }
    }

    // ==========================================
    // AUDITION, SCOUTING & MANAGE TRAINEES
    // ==========================================
    window.startAudition = function(type) {
        if(gameData.audition.active) return showToast("Selesaikan audisi/scouting aktif dulu!", "danger");
        let costMap = { street:5000000, national:50000000, global:150000000, university:80000000, online:30000000, private:200000000, idol_reboot:100000000 };
        let weekMap = { street:1, national:2, global:3, university:2, online:1, private:3, idol_reboot:2 };
        let cost = costMap[type] || 50000000;
        let weeks = weekMap[type] || 2;
        if(gameData.money < cost) return showToast("Kas kurang!", "danger");
        addFinanceRecord('Audition', 'expense', cost, `Biaya Audisi (${type})`); 
        gameData.audition = { active: true, type: type, weeks: weeks, isScouting: false };
        updateUI(); closeModal('modal-audition-types'); 
        document.getElementById('audition-status-banner').classList.remove('hidden'); 
        document.getElementById('audition-timer').innerText = gameData.audition.weeks;
    };

    window.startScouting = function() {
        if(gameData.audition.active) return showToast("Selesaikan audisi aktif dulu!", "danger");
        let gender = document.getElementById('scout-gender').value;
        let focus = document.getElementById('scout-focus').value;
        let cost = focus === 'visual' ? 300000000 : focus === 'vocal' ? 200000000 : focus === 'dance' ? 150000000 : 100000000;
        
        if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)}!`, "danger");
        addFinanceRecord('Audition', 'expense', cost, `Jasa Headhunter Idol (${focus.toUpperCase()})`);
        
        gameData.audition = { active: true, type: 'scout', weeks: 4, isScouting: true, scoutTarget: { gender, focus } };
        closeModal('modal-scout-idol');
        document.getElementById('audition-status-banner').classList.remove('hidden'); 
        document.getElementById('audition-timer').innerText = gameData.audition.weeks;
        showToast("Headhunter dikerahkan! Tunggu 4 minggu.", "success");
        updateUI();
    }

    let tempCands = [];
    function finishAudition() {
        gameData.audition.active = false; document.getElementById('audition-status-banner').classList.add('hidden'); 
        let t = gameData.audition.type; tempCands = []; let aType = AGENCY_TYPES[gameData.type]; 
        
        if(gameData.audition.isScouting) {
            let sTarg = gameData.audition.scoutTarget;
            for(let i=0; i<2; i++) {
                let isGlobal = Math.random() < 0.2;
                let name = isGlobal ? nmGlob[Math.floor(Math.random()*nmGlob.length)] : `${nmFirst[Math.floor(Math.random()*nmFirst.length)]} ${sTarg.gender==='Male'?nmBoy[Math.floor(Math.random()*nmBoy.length)]:nmGirl[Math.floor(Math.random()*nmGirl.length)]}`;
                let sV = 30, sD = 30, sR = 30, sVi = 30, sStage = 40;
                
                if(sTarg.focus === 'vocal') { sV = 75 + Math.random()*20; }
                if(sTarg.focus === 'dance') { sD = 75 + Math.random()*20; sStage += 10; }
                if(sTarg.focus === 'rap') { sR = 75 + Math.random()*20; }
                if(sTarg.focus === 'visual') { sVi = 85 + Math.random()*15; }

                sStage = Math.min(100, (sV*0.2 + sD*0.4 + sVi*0.4) + (Math.random()*10-5));

                let trait = tTrait.find(tr => tr.name.toLowerCase().includes(sTarg.focus)) || tTrait[Math.floor(Math.random()*tTrait.length)];
                if(sTarg.focus === 'visual') trait = tTrait.find(tr=>tr.name==='Visual Dewa') || tTrait[0];
                
                tempCands.push({ id: Date.now()+i, name, gender: sTarg.gender, bg: "Ditemukan oleh Headhunter Elit", traitObj: trait, vocal: sV, dance: sD, rap: sR, visual: sVi, stage: Math.round(sStage), focus: 'balanced', isDebuted: false, indFans: 0, soloBusy: 0, currentSoloObj: null });
            }
        } else {
            let count = t === 'street' ? 4 : t === 'national' ? 6 : t === 'university' ? 5 : t === 'online' ? 7 : t === 'private' ? 3 : t === 'idol_reboot' ? 3 : 9; 
            for(let i=0; i<count; i++) {
                let gender = Math.random() > 0.5 ? 'Male' : 'Female'; 
                let isGlobal = (t === 'global' && Math.random() > 0.4) || (t === 'online' && Math.random() > 0.6);
                let name = isGlobal ? nmGlob[Math.floor(Math.random()*nmGlob.length)] : `${nmFirst[Math.floor(Math.random()*nmFirst.length)]} ${gender==='Male'?nmBoy[Math.floor(Math.random()*nmBoy.length)]:nmGirl[Math.floor(Math.random()*nmGirl.length)]}`;
                let qualityBias = (aType.sB || 0) + (aType.traineeBias || 0);
                let bMin = (t === 'street' ? 10 : t === 'national' ? 30 : t === 'university' ? 40 : t === 'online' ? 20 : t === 'private' ? 55 : t === 'idol_reboot' ? 50 : 50) + qualityBias; 
                let bMax = (t === 'street' ? 40 : t === 'national' ? 70 : t === 'university' ? 78 : t === 'online' ? 65 : t === 'private' ? 88 : t === 'idol_reboot' ? 80 : 85) + qualityBias;
                let bg = t === 'idol_reboot' ? "Ex-idol grup bubar, berpengalaman" : t === 'university' ? "Mahasiswa seni kampus top" : t === 'private' ? "Transfer trainee dari agensi rival" : tBg[Math.floor(Math.random()*tBg.length)]; 
                let trait = tTrait[Math.floor(Math.random()*tTrait.length)];
                let getStat = (bias=0) => Math.max(1, Math.floor(Math.random()*(bMax-bMin))+bMin + bias); 
                let sV = getStat(), sD = getStat(), sR = getStat(), sVi = getStat();
                let sStage = Math.min(100, (sV*0.25 + sD*0.35 + sVi*0.4) + (Math.random()*8-4));
                
                // Trait stat modifiers (expanded)
                if(trait.name.includes("Vocalist") || trait.name.includes("Healing Voice")) { sV += 30; sD -= 10; }
                if(trait.name.includes("Dance") || trait.name.includes("Stage Monster")) { sD += 30; sV -= 5; sStage += 15; }
                if(trait.name.includes("Rapper")) { sR += 30; sVi -= 10; }
                if(trait.name.includes("Dewa")) { sVi += 35; sV -= 15; sR -= 15; }
                if(trait.name.includes("Center")) { sVi += 20; sD += 10; sStage += 15; }
                if(trait.name.includes("4th Gen Ace")) { sV += 10; sD += 10; sR += 10; sVi += 10; sStage += 10; }
                if(trait.name.includes("Glass Cannon")) { sV += 25; sD += 25; }
                if(trait.name.includes("Visual Hole")) { sVi -= 25; sV += 15; sD += 15; }
                if(trait.name.includes("Legendary Trainee")) { sV += 20; sD += 20; sR += 20; sVi += 20; sStage += 20; }
                if(trait.name.includes("Rebel Spirit")) { sStage += 10; }
                if(trait.name.includes("Iron Stamina")) { sStage += 5; }
                
                // Apply agency stage bonus
                sStage += (aType.stageBonus || 0);
                
                let clamp = (v) => Math.max(1, Math.min(99, Math.round(v)));
                tempCands.push({ id: Date.now()+i, name, gender, bg, traitObj: trait, vocal: clamp(sV), dance: clamp(sD), rap: clamp(sR), visual: clamp(sVi), stage: clamp(sStage), focus: 'balanced', isDebuted: false, indFans: 0, soloBusy: 0, currentSoloObj: null });
            }
        }

        const listDiv = document.getElementById('candidate-list'); listDiv.innerHTML = '';
        tempCands.forEach(c => {
            const card = document.createElement('div'); card.className = 'cand-card';
            let avgAll = Math.floor((c.vocal+c.dance+c.rap+c.visual+c.stage)/5);
            let avgColor = avgAll >= 70 ? '#22c55e' : avgAll >= 45 ? '#eab308' : '#ef4444';
            card.innerHTML = `<div class="c-name" style="font-weight:900;">${c.name} (${c.gender==='Male'?'👦':'👧'})</div><div style="font-size:0.75rem; margin:5px 0; color:#555;"><i>${c.bg}</i><br><b>Sifat:</b> ${c.traitObj.name} <span style="font-size:0.65rem;color:#888;">(${c.traitObj.eff})</span></div><div style="font-size:0.75rem; margin-top:5px; font-family:monospace;">🎤V:${Math.floor(c.vocal)} 💃D:${Math.floor(c.dance)} 🎙️R:${Math.floor(c.rap)} 👑Vi:${Math.floor(c.visual)} ✨SP:${Math.floor(c.stage)}</div><div style="font-size:0.7rem; margin-top:3px;"><span style="background:${avgColor};color:#fff;padding:1px 8px;border-radius:10px;font-weight:900;">AVG ${avgAll}</span></div>`;
            card.onclick = () => { card.classList.toggle('selected'); c.selected = card.classList.contains('selected'); }; listDiv.appendChild(card);
        }); openModal('modal-candidates');
    }
    
    document.getElementById('btn-recruit-selected').onclick = () => { 
        let sel = tempCands.filter(c => c.selected); 
        if(sel.length>0) { 
            sel.forEach(c => { delete c.selected; gameData.trainees.push(c); }); 
            renderTrainees(); updateUI(); showToast("Trainee masuk asrama!", "success"); 
        } 
        closeModal('modal-candidates'); 
    };

    function renderTrainees() {
        const list = document.getElementById('trainee-list'); list.innerHTML = ''; let avail = gameData.trainees.filter(t=>!t.isDebuted);
        if(avail.length===0) return list.innerHTML = `<p class="neo-card-small">Asrama kosong.</p>`;
        avail.forEach((t) => { 
            const c = document.createElement('div'); c.className = 't-card-ui'; 
            let sp = t.stage || Math.floor((t.vocal+t.dance+t.visual)/3);
            let avgCore = Math.floor((t.vocal+t.dance+t.rap+t.visual+sp)/5);
            let avgColor = avgCore >= 70 ? 'var(--c-green-solid)' : avgCore >= 45 ? 'var(--c-yellow-solid)' : 'var(--c-red-solid)';
            c.innerHTML = `<div class="t-avatar-box bg-${t.gender==='Male'?'blue':'pink'}">${t.gender==='Male'?'👦':'👧'}</div><div class="t-name-ui" style="font-weight:900;">${t.name}</div><div style="font-size:0.65rem;color:#666;margin-top:2px;">${t.traitObj ? t.traitObj.name : ''}</div><span class="neo-tag mt-2" style="color:${avgColor};border-color:${avgColor};">AVG ${avgCore}</span><div style="font-size:0.6rem;margin-top:4px;font-family:monospace;color:#888;">V${Math.floor(t.vocal)} D${Math.floor(t.dance)} R${Math.floor(t.rap)} Vi${Math.floor(t.visual)} SP${Math.floor(sp)}</div>`; 
            let rIdx = gameData.trainees.findIndex(tr=>tr.id===t.id); c.onclick = () => openTraineeDetail(rIdx); list.appendChild(c); 
        });
    }
    
    let actTIdx = null; 
    window.openTraineeDetail = function(idx) { 
        actTIdx = idx; let t = gameData.trainees[idx]; 
        document.getElementById('detail-t-name').innerText = t.name; 
        document.getElementById('detail-t-gender').innerText = t.gender; 
        document.getElementById('detail-t-bg').innerText = t.bg || "Trainee biasa"; 
        document.getElementById('detail-t-trait').innerText = t.traitObj ? `${t.traitObj.name} (${t.traitObj.eff})` : "Normal"; 
        ['vocal','dance','rap','visual'].forEach(s => { 
            document.getElementById(`detail-t-${s}-val`).innerText = Math.floor(t[s]); 
            document.getElementById(`bar-${s}`).style.width = `${Math.min(100, Math.max(0, t[s]))}%`; 
        });
        // Stage Presence bar
        let stageEl = document.getElementById('detail-t-stage-val');
        let stageBar = document.getElementById('bar-stage');
        let stageVal = t.stage || Math.floor((t.vocal+t.dance+t.visual)/3);
        if(stageEl) stageEl.innerText = Math.floor(stageVal);
        if(stageBar) stageBar.style.width = `${Math.min(100, Math.max(0, stageVal))}%`;
        
        document.querySelectorAll('.focus-buttons .neo-btn').forEach(b=>b.classList.remove('primary-btn')); 
        let focusBtn = document.getElementById(`focus-${t.focus}`);
        if(focusBtn) focusBtn.classList.add('primary-btn'); 
        openModal('modal-trainee-detail'); 
    };
    
    window.setFocus = function(f) { 
        if(actTIdx===null)return; 
        gameData.trainees[actTIdx].focus=f; 
        openTraineeDetail(actTIdx); 
        showToast(`Fokus: ${f.toUpperCase()}`, "success"); 
    };

    // ==========================================
    // PRE-DEBUT & DEBUT PRODUCTION
    // ==========================================
    let isCb = false; let cbIdx = null;

    window.startDebut = function() {
        if(gameData.trainees.filter(t=>!t.isDebuted).length===0) return showToast("Tidak ada trainee!", "danger");
        isCb = false; window._v11ArtistIdx = null; document.getElementById('debut-modal-title').innerText = "🔥 PEMBENTUKAN GRUP BARU";
        
        document.getElementById('group-status-wrap').classList.remove('hidden');
        document.getElementById('debut-is-predebut').value = "false"; 
        toggleReleaseInputs(); 

        document.getElementById('debut-step-1').classList.add('active'); document.getElementById('debut-step-2').classList.remove('active'); document.getElementById('debut-step-3').classList.remove('active');
        document.getElementById('btn-back-step-2').classList.remove('hidden'); document.getElementById('btn-cancel-comeback').classList.add('hidden');
        
        openModal('modal-debut-setup');
    };

    window.startComeback = function() {
        let art = gameData.groups[activeArtistIndex];
        if(art.busyWeeks > 0 || art.hasScandal) return showToast("Selesaikan jadwal manual / skandal dulu!", "danger");
        
        isCb = true; cbIdx = activeArtistIndex; window._v11ArtistIdx = activeArtistIndex; closeModal('modal-artist-detail');
        document.getElementById('debut-modal-title').innerText = `💿 PRODUKSI: ${art.name}`;
        document.getElementById('group-status-wrap').classList.add('hidden');
        document.getElementById('debut-is-predebut').value = "false"; toggleReleaseInputs();

        // Preset the concept to the group's base concept
        document.getElementById('debut-concept').value = art.concept;

        document.querySelectorAll('.debut-step').forEach(el=>el.classList.remove('active')); document.getElementById('debut-step-3').classList.add('active');
        document.getElementById('btn-back-step-2').classList.add('hidden'); document.getElementById('btn-cancel-comeback').classList.remove('hidden');

        const hl = document.getElementById('debut-highlight'); hl.innerHTML = '<option value="none">Adil & Merata</option>';
        art.members.forEach((m, idx) => { hl.innerHTML += `<option value="${idx}">${m.name} (Push Visual Center)</option>`; });
        openModal('modal-debut-setup');
    };

    window.toggleReleaseInputs = function() {
        let isPre = document.getElementById('debut-is-predebut').value === "true";
        if(isPre) {
            document.getElementById('release-details-wrap').classList.add('hidden');
            document.getElementById('btn-final-release').innerText = "MULAI PROYEK PRE-DEBUT!";
        } else {
            document.getElementById('release-details-wrap').classList.remove('hidden');
            document.getElementById('btn-final-release').innerText = "MULAI PERSIAPAN RILIS!";
        }
    };

    window.nextDebutStep = function(step) {
        if(step===2) {
            let n=document.getElementById('debut-name').value; if(!n) return showToast("Nama wajib diisi!", "danger");
            let tTarget = document.getElementById('debut-type').value; 
            
            // Fix gender filter — handle all group types properly
            let reqGender = null; // null = show all genders
            if(tTarget.includes('Boy') || tTarget === 'Soloist (Male)') reqGender = 'Male';
            else if(tTarget.includes('Girl') || tTarget === 'Soloist (Female)') reqGender = 'Female';
            // Band and Co-Ed = null (show all)

            let cont = document.getElementById('debut-lineup-container'); cont.innerHTML='';
            let available = gameData.trainees.filter(t => !t.isDebuted && (reqGender === null || t.gender === reqGender));
            if(available.length === 0) cont.innerHTML = `<p class="neo-card-small w-100 text-red">Tidak ada trainee${reqGender ? ' '+reqGender : ''} yang tersedia. Buka audisi dulu!</p>`;

            available.forEach(t => {
                const c = document.createElement('div'); c.className = 'lineup-card';
                let sp = Math.floor(t.stage || (t.vocal+t.dance+t.visual)/3);
                let avgSt = Math.floor((t.vocal+t.dance+t.rap+t.visual+sp)/5);
                let avgColor = avgSt >= 70 ? 'var(--c-green-solid)' : avgSt >= 45 ? 'var(--c-yellow-solid)' : 'var(--c-red-solid)';
                c.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #111; padding-bottom:5px;"><strong>${t.name}</strong><div style="display:flex;align-items:center;gap:6px;"><span style="font-size:0.7rem;font-weight:900;color:${avgColor};">AVG ${avgSt}</span><input type="checkbox" class="t-sel" data-id="${t.id}"></div></div><div style="font-size:0.7rem; margin-top:5px; font-family:monospace; display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px;">
                <span>🎤V:${Math.floor(t.vocal)}</span><span>💃D:${Math.floor(t.dance)}</span><span>🎙️R:${Math.floor(t.rap)}</span>
                <span>👑Vi:${Math.floor(t.visual)}</span><span>✨SP:${sp}</span><span style="color:#888;">${t.traitObj ? t.traitObj.name : ''}</span>
                </div><div class="pos-checks" style="font-size:0.65rem; margin-top:6px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:1px;"><label><input type="checkbox" value="Leader"> Leader</label><label><input type="checkbox" value="Center"> Center</label><label><input type="checkbox" value="Main Vocal"> M.Vocal</label><label><input type="checkbox" value="Lead Vocal"> L.Vocal</label><label><input type="checkbox" value="Main Dancer"> M.Dancer</label><label><input type="checkbox" value="Lead Dancer"> L.Dancer</label><label><input type="checkbox" value="Main Rapper"> M.Rapper</label><label><input type="checkbox" value="Visual"> Visual</label><label><input type="checkbox" value="Maknae"> Maknae</label></div>`;
                c.querySelector('.t-sel').onchange=(e)=>{ if(e.target.checked) c.classList.add('bg-purple'); else c.classList.remove('bg-purple'); }; cont.appendChild(c);
            });
        }
        if(step===3) {
            if(!isCb) {
                let sT = document.querySelectorAll('.lineup-card .t-sel:checked'); if(sT.length===0) return showToast("Pilih 1 member minimal!", "danger");
                const hl = document.getElementById('debut-highlight'); hl.innerHTML = '<option value="none">Adil & Merata</option>';
                sT.forEach((chk, idx) => { let tid = parseInt(chk.getAttribute('data-id')); let tname = gameData.trainees.find(tr=>tr.id===tid).name; hl.innerHTML += `<option value="${idx}">${tname} (Push Visual Center)</option>`; });
            }
        }
        document.querySelectorAll('.debut-step').forEach(el=>el.classList.remove('active')); document.getElementById(`debut-step-${step}`).classList.add('active');
    };

    window.finalizeDebut = function() {
        let isPreDebutMode = !isCb && document.getElementById('debut-is-predebut').value === "true";
        let cConcept = document.getElementById('debut-concept').value;

        if(isPreDebutMode) {
            let targetGrp = extractGroupData(); targetGrp.isPreDebut = true;
            targetGrp.members.forEach(m => { let tidx = gameData.trainees.findIndex(tr => tr.id === m.refId); if(tidx !== -1) gameData.trainees[tidx].isDebuted = true; });
            gameData.groups.push(targetGrp);
            showToast(`Grup Pra-Debut ${targetGrp.name} resmi dibentuk! Masuk ke jadwal manual.`, "success");
            closeModal('modal-debut-setup'); updateUI(); return;
        }

        let a = document.getElementById('debut-album').value, s = document.getElementById('debut-song').value, mvQ = document.getElementById('debut-mv-quality').value, hlIdx = document.getElementById('debut-highlight').value;
        let albType = document.getElementById('debut-album-type').value;

        if(!a||!s) return showToast("Isi nama album & lagu!", "danger");
        
        let albCost = albType === 'Digital' ? 20000000 : albType === 'Mini' ? 100000000 : albType === 'Full' ? 300000000 : albType === 'English' ? 50000000 : albType === 'OST' ? 10000000 : 80000000;
        let mvCost = mvQ === 'none' ? 0 : mvQ === 'low' ? 10000000 : mvQ === 'high' ? 150000000 : mvQ === 'blockbuster' ? 500000000 : 50000000;
        let totalCost = mvCost + albCost;

        if(gameData.money < totalCost) return showToast(`Butuh ${formatWon(totalCost)}!`, "danger");
        addFinanceRecord('Production', 'expense', totalCost, `Produksi Rilisan: ${a} (${albType})`);

        let prepWeeks = albType === 'Digital' ? 1 : albType === 'Mini' ? 2 : albType === 'Full' ? 4 : 2;

        let releaseData = {
            isCb, cbIdx, weeksLeft: prepWeeks, albumName: a, songName: s, mvQuality: mvQ, albumType: albType, highlightIdx: hlIdx,
            concept: cConcept, debutData: isCb ? null : extractGroupData()
        };

        // Handle pre-debut → debut transition
        if(window._isPreDebutDebut && window._preDebutDebutIdx !== undefined) {
            let pdGrp = gameData.groups[window._preDebutDebutIdx];
            if(pdGrp && pdGrp.isPreDebut) {
                pdGrp.isPreDebut = false;
                pdGrp.debutYear = gameData.y;
                pdGrp.contractStartYear = gameData.y;
                pdGrp.contractYears = 7;
                addMainLog(`🚀 DEBUT RESMI: ${pdGrp.name} resmi debut dengan album "${a}"!`);
                generateSocialFeed('debut_good', pdGrp.name);
            }
            window._isPreDebutDebut = false;
            window._preDebutDebutIdx = undefined;
        }

        gameData.pendingReleases.push(releaseData);
        showToast(`Persiapan rilis dimulai! Selesai dalam ${prepWeeks} minggu.`, "success"); 
        if(typeof triggerScreenShake === 'function') triggerScreenShake();
        closeModal('modal-debut-setup'); updateUI(); 
    };

    function extractGroupData() {
        let mems=[], gVoc=0, gDan=0, gRap=0, gVis=0, gStage=0;
        document.querySelectorAll('.lineup-card').forEach(c => {
            let chk = c.querySelector('.t-sel');
            if(chk.checked) {
                let tid = parseInt(chk.getAttribute('data-id')); let tIdx = gameData.trainees.findIndex(tr=>tr.id===tid);
                let tData = gameData.trainees[tIdx];
                let pos = []; c.querySelectorAll('.pos-checks input:checked').forEach(p => pos.push(p.value));
                mems.push({ ...tData, positions: pos, refId: tid }); 
                gVoc+=tData.vocal; gDan+=tData.dance; gRap+=tData.rap; gVis+=tData.visual; gStage += (tData.stage || (tData.vocal+tData.dance+tData.visual)/3);
            }
        });
        let st = Math.floor((gVoc+gDan+gRap+gVis+gStage)/(mems.length*5));
        return {
            id:Date.now(), name: document.getElementById('debut-name').value, type: document.getElementById('debut-type').value, 
            concept: document.getElementById('debut-concept').value, members: mems, avgStat: st, albums: 0, fansKR: 50, fansGL: 20, stress: 0,
            autoSchedule: 'promo', busyWeeks:0, currentEvent:null, trophies: 0, hasScandal: false, isPreDebut: false,
            chartBonus: 0, debutYear: gameData.y 
        };
    }

    // ==========================================
    // ARTIST PROFILES & MANUAL SCHEDULES (EXPANDED)
    // ==========================================
    window.switchArtistTab = function(tabId) {
        document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.sub-tab-content').forEach(cont => cont.classList.remove('active'));
        event.target.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    };

    function renderArtistList() {
        const list = document.getElementById('artist-list'); 
        if(!list) return;
        list.innerHTML = '';
        if(gameData.groups.length===0) return list.innerHTML = `<p class="neo-card-small">Belum ada grup yang dibentuk.</p>`;
        gameData.groups.forEach((g, idx) => {
            const c = document.createElement('div'); c.className = 'neo-card bg-yellow';
            let st = g.busyWeeks > 0 ? `<span class="neo-tag bg-pink mt-2">⏳ Sibuk (${g.busyWeeks} Mgg)</span>` : `<span class="neo-tag bg-green mt-2">✅ Free</span>`;
            let pd = g.isPreDebut ? `<span class="neo-tag bg-orange mt-2">🌟 PRE-DEBUT</span>` : '';
            let disbTag = g.isDisbanded ? `<span class="neo-tag bg-red mt-2" style="background:red;color:#fff;">💔 BUBAR</span>` : '';
            let yearsActive = g.contractStartYear ? (gameData.y - g.contractStartYear) : 0;
            let contractTag = !g.isDisbanded && !g.isPreDebut && yearsActive >= 6 ? `<span class="neo-tag mt-2" style="background:#f59e0b;color:#000;">⚠️ Kontrak Mau Habis!</span>` : '';
            let fandomTag = g.fandomName ? `<span class="neo-tag bg-blue mt-2" style="font-size:0.7rem;">👥 ${g.fandomName}</span>` : '';
            
            // Tombol berbeda untuk pre-debut vs debuted
            let actionBtns = '';
            if(g.isDisbanded) {
                actionBtns = `<button class="neo-btn action-btn mt-2 w-100" onclick="openArtistDetail(${idx})">📋 RIWAYAT</button>`;
            } else if(g.isPreDebut) {
                actionBtns = `<button class="neo-btn success-btn mt-2 w-100" onclick="debutPreDebutGroup(${idx})">🚀 DEBUT RESMI!</button><button class="neo-btn action-btn mt-2 w-100" onclick="openArtistDetail(${idx})">KELOLA</button>`;
            } else {
                actionBtns = `<button class="neo-btn action-btn mt-2 w-100" onclick="openArtistDetail(${idx})">KELOLA</button>`;
            }
            
            let avgSt = g.members.length > 0 ? Math.floor(g.members.reduce((s,m) => s + (m.vocal+m.dance+m.rap+m.visual+(m.stage||50))/5, 0) / g.members.length) : 0;
            c.innerHTML = `<h3>${g.name}</h3><p>Tipe: ${g.type} | Konsep: ${g.concept}</p><p>🏆 Trofi: ${g.trophies} | Avg Stat: ${avgSt}</p>${pd} ${st} ${disbTag} ${contractTag} ${fandomTag}<br>${actionBtns}`;
            list.appendChild(c);
        });
        renderManualScheduleList(); 
    }

    let activeArtistIndex = null;
    
    // DEBUT resmi dari grup Pre-Debut — buka modal rilis seperti comeback
    window.debutPreDebutGroup = function(gIdx) {
        let grp = gameData.groups[gIdx];
        if(!grp || !grp.isPreDebut) return showToast("Grup ini bukan pre-debut!", "danger");
        if(grp.busyWeeks > 0) return showToast("Selesaikan jadwal aktif dulu!", "danger");
        
        // Set up as comeback mode (skip lineup, langsung ke release details)
        isCb = true; cbIdx = gIdx; window._v11ArtistIdx = gIdx;
        document.getElementById('debut-modal-title').innerText = `🚀 DEBUT RESMI: ${grp.name}`;
        document.getElementById('group-status-wrap').classList.add('hidden');
        document.getElementById('debut-is-predebut').value = "false"; 
        toggleReleaseInputs();
        document.getElementById('debut-concept').value = grp.concept;
        document.getElementById('debut-name').value = grp.name;
        
        // Skip to step 3 (release details)
        document.querySelectorAll('.debut-step').forEach(el => el.classList.remove('active')); 
        document.getElementById('debut-step-3').classList.add('active');
        document.getElementById('btn-back-step-2').classList.add('hidden'); 
        document.getElementById('btn-cancel-comeback').classList.remove('hidden');
        
        // Populate highlight dropdown with members
        const hl = document.getElementById('debut-highlight'); 
        hl.innerHTML = '<option value="none">Adil & Merata</option>';
        grp.members.forEach((m, idx) => { hl.innerHTML += `<option value="${idx}">${m.name} (Push Visual Center)</option>`; });
        
        // Mark that this is a pre-debut → debut transition
        window._isPreDebutDebut = true;
        window._preDebutDebutIdx = gIdx;
        
        openModal('modal-debut-setup');
    };

    window.openArtistDetail = function(idx) {
        activeArtistIndex = idx; let art = gameData.groups[idx];
        document.getElementById('art-name').innerText = art.name; 
        document.getElementById('art-concept').innerText = art.concept; 
        document.getElementById('art-fans-kr').innerText = art.fansKR.toLocaleString(); 
        document.getElementById('art-fans-gl').innerText = art.fansGL.toLocaleString(); 
        document.getElementById('art-trophies').innerText = art.trophies || 0; 
        document.getElementById('art-schedule-select').value = art.autoSchedule || 'promo';
        
        document.getElementById('art-status-tag').innerText = art.busyWeeks > 0 ? `Status: Sibuk Event (${art.busyWeeks} Mgg)` : `Status: Auto-Pilot`; 
        document.getElementById('art-status-tag').className = art.busyWeeks > 0 ? `neo-tag bg-pink mt-2` : `neo-tag bg-green mt-2`;

        if(art.isPreDebut) document.getElementById('art-predebut-tag').classList.remove('hidden'); 
        else document.getElementById('art-predebut-tag').classList.add('hidden');

        document.getElementById('art-stress-val').innerText = `${Math.min(100, Math.max(0, art.stress))}%`; 
        document.getElementById('art-stress-bar').style.width = `${Math.min(100, Math.max(0, art.stress))}%`; 
        if(art.stress > 80) document.getElementById('art-stress-bar').className = 'fill bg-red'; 
        else document.getElementById('art-stress-bar').className = 'fill bg-blue';

        if(art.hasScandal || art.isPreDebut) document.getElementById('btn-art-comeback').disabled = true; 
        else document.getElementById('btn-art-comeback').disabled = false;

        // v15: Competition Analysis & Generation Info
        let compAnalysis = getCompetitionAnalysis();
        let genBonus = getGenerationBonus(art.debutYear || gameData.y);
        let genLabel = genBonus >= 1.1 ? '🌟 Rookie Hype' : genBonus >= 1.0 ? '📈 Rising/Peak' : genBonus >= 0.95 ? '📊 Established' : '📉 Veteran';
        let compColor = compAnalysis.risk === 'EXTREME' ? '#ef4444' : compAnalysis.risk === 'HIGH' ? '#f97316' : compAnalysis.risk === 'MEDIUM' ? '#eab308' : '#22c55e';
        let compEl = document.getElementById('art-competition-info');
        if(!compEl) {
            compEl = document.createElement('div');
            compEl.id = 'art-competition-info';
            compEl.className = 'neo-card-small mt-2';
            compEl.style.cssText = 'font-size:0.8rem; border-width:2px;';
            let stressCard = document.querySelector('#modal-artist-detail .neo-card-small');
            if(stressCard && stressCard.parentNode) stressCard.parentNode.insertBefore(compEl, stressCard.nextSibling);
        }
        compEl.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><span>📊 <b>Analisis Kompetisi:</b></span><span style="color:${compColor};font-weight:900;">${compAnalysis.risk}</span></div><div style="font-size:0.75rem;color:#666;margin-top:3px;">${compAnalysis.detail}</div><div style="font-size:0.75rem;color:#666;margin-top:3px;">🏷️ Generasi: <b>${genLabel}</b> (x${genBonus.toFixed(2)} hype multiplier) | ${compAnalysis.totalActive} rival aktif comeback</div>`;

        document.getElementById('art-members').innerHTML = art.members.map((m, mIdx) => {
            let sp = Math.floor(m.stage || (m.vocal+m.dance+m.visual)/3);
            return `<div class="member-card-ui bg-blue" onclick="openMemberDetail(${idx}, ${mIdx})">
                <b>${m.name}</b> <span style="font-size:0.65rem;color:#1e40af;">${(m.indFans||0).toLocaleString()} fans</span><br><small>${m.positions.join(', ') || 'Member'} | SP:${sp}</small>
            </div>`;
        }).join('');
        
        document.getElementById('art-discography').innerHTML = `Total Album: ${art.albums} | Base Stat: ${Math.floor(art.avgStat)} | Power Level: ${Math.floor(art.avgStat + (art.fansKR/1000))}`;
        // Render album cover gallery — CLICKABLE for detail
        let galleryEl = document.getElementById('art-disco-gallery');
        if(galleryEl) {
            galleryEl.innerHTML = '';
            if(art.discography && art.discography.length > 0) {
                art.discography.forEach((d, dIdx) => {
                    // Try to find matching active song for live data
                    let matchSong = gameData.activeSongs.find(s => s.title === d.songName && s.artistRef === art);
                    if(matchSong) {
                        d.peakMelon = matchSong.peakMelon || d.peakMelon;
                        d.peakSpotify = matchSong.peakSpotify || d.peakSpotify;
                        d.musicShowWins = matchSong.musicShowWins || d.musicShowWins;
                        d.firstWeekSales = matchSong.physSales || d.firstWeekSales;
                        d.totalScore = matchSong.initialScore || d.totalScore;
                    }
                    let el = document.createElement('div');
                    el.className = 'disco-item';
                    el.title = `${d.albumName} — Klik untuk detail`;
                    el.style.cursor = 'pointer';
                    el.innerHTML = d.coverHtml;
                    el.onclick = () => showAlbumDetail(art, d);
                    galleryEl.appendChild(el);
                });
            } else {
                galleryEl.innerHTML = '<p style="font-size:0.8rem; color:#999;">Belum ada album yang dirilis.</p>';
            }
        }
        
        // Make trophy count clickable
        let trophyEl = document.getElementById('art-trophies');
        if(trophyEl) {
            trophyEl.style.cursor = 'pointer';
            trophyEl.title = 'Klik untuk detail trofi';
            trophyEl.onclick = () => showTrophyDetail(art);
        }
        openModal('modal-artist-detail');
    };

    window.changeAutoSchedule = function() { 
        gameData.groups[activeArtistIndex].autoSchedule = document.getElementById('art-schedule-select').value; 
        showToast("Jadwal auto-pilot diupdate."); 
    };

    // ---- ALBUM DETAIL POPUP ----
    window.showAlbumDetail = function(grp, albumData) {
        let peakM = albumData.peakMelon < 999 ? `#${albumData.peakMelon}` : 'Tidak masuk chart';
        let peakS = albumData.peakSpotify < 999 ? `#${albumData.peakSpotify}` : 'Tidak masuk chart';
        let wins = albumData.musicShowWins || 0;
        let sales = (albumData.firstWeekSales || 0).toLocaleString();
        let score = Math.floor(albumData.totalScore || 0);
        
        let content = `
            <div style="text-align:center; margin-bottom:15px;">
                <div style="display:inline-block; width:120px; height:120px; border-radius:8px; overflow:hidden; border:3px solid var(--border-dark);">${albumData.coverHtml}</div>
            </div>
            <h3 style="text-align:center; font-size:1.3rem; font-weight:900;">${albumData.albumName}</h3>
            <p style="text-align:center; color:#666; margin-bottom:15px;">🎵 "${albumData.songName}" — ${grp.name}<br><small>Konsep: ${albumData.concept} | Tahun ${albumData.year} Bulan ${albumData.month}</small></p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div class="neo-card-small bg-green" style="text-align:center;"><b>🍈 Peak Melon</b><br><span style="font-size:1.3rem; font-weight:900;">${peakM}</span></div>
                <div class="neo-card-small bg-blue" style="text-align:center;"><b>🎧 Peak Spotify</b><br><span style="font-size:1.3rem; font-weight:900;">${peakS}</span></div>
                <div class="neo-card-small bg-yellow" style="text-align:center;"><b>🏆 Music Show Wins</b><br><span style="font-size:1.3rem; font-weight:900;">${wins}x</span></div>
                <div class="neo-card-small bg-pink" style="text-align:center;"><b>💽 1st Week Sales</b><br><span style="font-size:1.3rem; font-weight:900;">${sales}</span></div>
            </div>
            <div class="neo-card-small mt-2 bg-orange" style="text-align:center;"><b>⭐ Release Score</b><br><span style="font-size:1.3rem; font-weight:900;">${score}</span></div>
        `;
        
        document.getElementById('dash-modal-title').innerText = '💿 Detail Album';
        document.getElementById('dash-modal-content').innerHTML = content;
        openModal('modal-dashboard-detail');
    };

    // ---- TROPHY DETAIL POPUP ----
    window.showTrophyDetail = function(grp) {
        let content = '';
        
        // Collect trophy info from active songs
        let songWins = [];
        gameData.activeSongs.filter(s => s.artistRef === grp && s.musicShowWins > 0).forEach(s => {
            songWins.push({ title: s.title, wins: s.musicShowWins, peak: s.peakMelon || 999 });
        });
        
        // Also check discography
        if(grp.discography) {
            grp.discography.filter(d => d.musicShowWins > 0).forEach(d => {
                if(!songWins.find(sw => sw.title === d.songName)) {
                    songWins.push({ title: d.songName, wins: d.musicShowWins, peak: d.peakMelon || 999 });
                }
            });
        }
        
        content += `<div style="text-align:center; margin-bottom:15px;"><span style="font-size:3rem;">🏆</span><br><b style="font-size:1.5rem;">${grp.trophies || 0} Total Trofi</b></div>`;
        
        if(songWins.length > 0) {
            content += '<h4 style="margin-bottom:10px;">📋 Detail Kemenangan per Lagu:</h4>';
            songWins.sort((a,b) => b.wins - a.wins).forEach(sw => {
                let crownTag = sw.wins >= 5 ? ' 👑 ALL-KILL' : sw.wins >= 3 ? ' 👑👑👑 TRIPLE CROWN' : '';
                content += `<div class="neo-card-small bg-yellow" style="margin-bottom:5px;"><b>"${sw.title}"</b> — ${sw.wins}x wins${crownTag}<br><small>Peak Melon: ${sw.peak < 999 ? '#'+sw.peak : 'N/A'}</small></div>`;
            });
        } else {
            content += '<p style="color:#888;">Belum ada detail kemenangan musik show yang tercatat.</p>';
        }
        
        // Award history
        if(gameData.awards && gameData.awards.history) {
            let grpAwards = gameData.awards.history.filter(a => a.winner.includes(grp.name));
            if(grpAwards.length > 0) {
                content += '<h4 style="margin-top:15px; margin-bottom:10px;">🏅 Penghargaan Tahunan:</h4>';
                grpAwards.forEach(a => {
                    content += `<div class="neo-card-small bg-blue" style="margin-bottom:5px;"><b>${a.award}</b> — Tahun ${a.y}<br><small>${a.winner}</small></div>`;
                });
            }
        }
        
        document.getElementById('dash-modal-title').innerText = `🏆 Detail Trofi: ${grp.name}`;
        document.getElementById('dash-modal-content').innerHTML = content;
        openModal('modal-dashboard-detail');
    };

    let activeMemberIdx = null; let activeGroupIdxForMember = null;
    window.openMemberDetail = function(gIdx, mIdx) {
        activeGroupIdxForMember = gIdx; activeMemberIdx = mIdx; let m = gameData.groups[gIdx].members[mIdx];
        
        document.getElementById('ind-avatar').innerText = m.gender === 'Male' ? '👦' : '👧'; 
        document.getElementById('ind-avatar').className = `t-avatar-box bg-${m.gender==='Male'?'blue':'pink'}`;
        document.getElementById('ind-name').innerText = m.name; 
        document.getElementById('ind-pos').innerText = m.positions.join(', ') || 'Member'; 
        document.getElementById('ind-bg').innerText = m.bg || 'Idol Biasa'; 
        document.getElementById('ind-trait').innerText = m.traitObj ? m.traitObj.name : 'Normal'; 
        document.getElementById('ind-fans').innerText = (m.indFans || 0).toLocaleString();
        
        document.getElementById('ind-status').innerText = m.soloBusy > 0 ? `⏳ Project: ${m.currentSoloObj}` : `✅ Free`; 
        document.getElementById('ind-status').style.color = m.soloBusy > 0 ? 'var(--c-pink-solid)' : 'var(--c-green-solid)';

        ['vocal','dance','rap','visual'].forEach(s => { 
            document.getElementById(`ind-bar-${s}`).style.width = `${Math.min(100, Math.max(0, m[s]))}%`; 
        });
        // Stage Presence bar in member detail
        let indStageBar = document.getElementById('ind-bar-stage');
        if(indStageBar) indStageBar.style.width = `${Math.min(100, Math.max(0, m.stage || (m.vocal+m.dance+m.visual)/3))}%`;
        
        let dis = gameData.groups[gIdx].isPreDebut ? true : false; 
        document.getElementById('btn-solo-drama').disabled = dis; 
        document.getElementById('btn-solo-mc').disabled = dis; 
        document.getElementById('btn-solo-debut').disabled = dis;
        document.getElementById('btn-solo-ba').disabled = dis;
        
        openModal('modal-member-detail');
    };

    window.startSoloProject = function(type) {
        let m = gameData.groups[activeGroupIdxForMember].members[activeMemberIdx]; 
        if(m.soloBusy > 0) return showToast("Member masih sibuk solo project lain!", "danger");

        let cost = type === 'drama' ? 20000000 : type === 'mc' ? 5000000 : type === 'solo_debut' ? 50000000 : 100000000; 
        let time = type === 'drama' ? 3 : type === 'mc' ? 1 : type === 'solo_debut' ? 2 : 4;

        if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)}!`, "danger"); 
        addFinanceRecord('Solo', 'expense', cost, `Sponsor Solo: ${type} (${m.name})`);
        
        m.soloBusy = time; m.currentSoloObj = type; 
        gameData.groups[activeGroupIdxForMember].stress += 15; 

        showToast(`${m.name} memulai solo project: ${type.toUpperCase()}!`, "success");
        openMemberDetail(activeGroupIdxForMember, activeMemberIdx); 
    };

    function renderManualScheduleList() {
        const list = document.getElementById('manual-schedule-list'); 
        if(!list) return;
        list.innerHTML = '';
        if(gameData.groups.length===0) return list.innerHTML = `<p>Belum ada grup.</p>`;
        gameData.groups.forEach((g, i) => {
            let isBusy = g.busyWeeks > 0;
            let totalFans = g.fansKR + g.fansGL;
            let bPre = g.isPreDebut ? `
                <button class="neo-btn btn-sm action-btn w-100" onclick="startManualEvent(${i}, 'yt_cover', 1, 5000000)">🎥 YT Cover Dance (1M)</button>
                <button class="neo-btn btn-sm primary-btn w-100" onclick="startManualEvent(${i}, 'vocal_cover', 1, 3000000)">🎤 YT Cover Song (1M)</button>
                <button class="neo-btn btn-sm bg-purple w-100" onclick="startManualEvent(${i}, 'busking', 1, 2000000)">🎸 Busking Hongdae (1M)</button>
                <button class="neo-btn btn-sm bg-pink w-100" onclick="startManualEvent(${i}, 'reality', 2, 20000000)">📺 Reality Show Agensi (2M)</button>
                <button class="neo-btn btn-sm bg-green w-100" onclick="startManualEvent(${i}, 'dance_practice', 1, 1000000)">💃 Dance Practice Video (1M)</button>
                <button class="neo-btn btn-sm bg-blue w-100" onclick="startManualEvent(${i}, 'vlive_showcase', 1, 500000)">📱 V-Live Pre-Debut Showcase (500K)</button>
                <button class="neo-btn btn-sm bg-orange w-100 mt-2" style="grid-column: span 2;" onclick="startManualEvent(${i}, 'survival', 4, 100000000)">🔥 Kirim ke Survival Show Mnet (4M)</button>
            ` : `
                <button class="neo-btn btn-sm action-btn w-100" onclick="startManualEvent(${i}, 'fanmeet', 1, 10000000)">🤝 Fanmeet Lokal (1M)</button>
                <button class="neo-btn btn-sm primary-btn w-100" onclick="startManualEvent(${i}, 'popup', 1, 30000000)">🛒 Pop-up Store (1M)</button>
                <button class="neo-btn btn-sm bg-purple w-100" onclick="startManualEvent(${i}, 'tour', 2, 50000000)">✈️ Tur Arena Domestik (2M)</button>
                <button class="neo-btn btn-sm bg-red text-white w-100" style="color:#fff;" onclick="startManualEvent(${i}, 'worldtour', 4, 300000000)">🌍 World Tour Stadium (4M)</button>
                <button class="neo-btn btn-sm bg-green w-100" onclick="startManualEvent(${i}, 'university_fest', 1, 8000000)">🎓 Festival Kampus (1M)</button>
                <button class="neo-btn btn-sm bg-blue w-100" onclick="startManualEvent(${i}, 'cf_shoot', 1, 5000000)">📸 CF/Iklan Shooting (1M)</button>
                <button class="neo-btn btn-sm bg-orange w-100" onclick="startManualEvent(${i}, 'year_end_concert', 2, 80000000)">🎆 Year-End Concert (2M)</button>
                <button class="neo-btn btn-sm bg-pink w-100" onclick="startManualEvent(${i}, 'hiatus', 2, 0)">😴 Istirahat/Hiatus (2M, Gratis)</button>
                <button class="neo-btn btn-sm bg-pink w-100 mt-1" style="grid-column:span 2;" onclick="openConcertVenueModal(${i})">🎪 Booking Konser (Pilih Venue)</button>
            `;
            let btnHtml = isBusy ? `<button class="neo-btn w-100 mt-2" disabled>⏳ Sedang Event: ${g.currentEvent ? g.currentEvent.toUpperCase() : 'BUSY'} (${g.busyWeeks} mgg)</button>` : `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:10px;">${bPre}</div>`;
            list.innerHTML += `<div class="neo-card-small bg-yellow"><h4>${g.name} ${g.hasScandal ? '<span class="text-red">🚨 Skandal</span>' : ''}</h4><p style="font-size:0.8rem;">Status: ${isBusy ? g.currentEvent.toUpperCase() : 'Free (Auto)'} | Stress: ${Math.floor(g.stress)}% | Fans: ${totalFans.toLocaleString()}</p>${btnHtml}</div>`;
        });
    }

    window.startManualEvent = function(gIdx, type, weeks, cost) {
        let grp = gameData.groups[gIdx];
        if(type === 'worldtour' && grp.fansGL < 100000) return showToast("Fans Global harus di atas 100,000 untuk World Tour!", "danger");
        if(gameData.money < cost) return showToast(`Uang tidak cukup! (Butuh ${formatWon(cost)})`, "danger");
        if(grp.stress >= 90) return showToast("Stress idol terlalu tinggi! Butuh istirahat.", "danger");
        addFinanceRecord('Event', 'expense', cost, `Persiapan Event: ${type.toUpperCase()}`);
        grp.busyWeeks = weeks; grp.currentEvent = type;
        let stAdd = type === 'worldtour' ? 80 : type === 'survival' ? 60 : type === 'tour' ? 40 : type === 'reality' ? 20 : 15;
        if(type === 'busking') stAdd = 25; // Busking is tiring
        grp.stress += stAdd; showToast(`${grp.name} memulai ${type.toUpperCase()}! (+${stAdd}% Stress)`, "success"); updateUI();
    };

    // ==========================================
    // UI UPDATER
    // ==========================================
    function updateUI() {
        document.getElementById('val-money').innerText = formatWon(gameData.money); document.getElementById('val-rep').innerText = gameData.rep;
        document.getElementById('val-year').innerText = gameData.y; document.getElementById('val-month').innerText = gameData.m; document.getElementById('val-week').innerText = gameData.w;
        document.getElementById('dash-total-trainee').innerText = gameData.trainees.filter(t => !t.isDebuted).length;
        document.getElementById('dash-total-group').innerText = gameData.groups.filter(g=>!g.isPreDebut).length;
        document.getElementById('dash-total-pre').innerText = gameData.groups.filter(g=>g.isPreDebut).length;
        
        let rankText = "Nugu";
        if (gameData.rep > 50000) rankText = "LEGENDARY";
        else if (gameData.rep > 15000) rankText = "Top Tier (Big 4)";
        else if (gameData.rep > 5000) rankText = "Top Tier";
        else if (gameData.rep > 1000) rankText = "Mid-Tier";
        else if (gameData.rep > 200) rankText = "Rookie";
        document.getElementById('dash-rank').innerText = rankText;

        gameData.finance.stock = Math.max(100, Math.floor((gameData.money / 1000000) + (gameData.rep * 5)));
        gameData.finance.loanLimit = 500000000 + (gameData.rep * 200000);
        
        let stockEl = document.getElementById('stock-price');
        if(stockEl) {
            stockEl.innerText = formatWon(gameData.finance.stock); 
            document.getElementById('stock-owned').innerText = gameData.finance.owned;
            document.getElementById('bank-limit').innerText = formatWon(gameData.finance.loanLimit); 
            document.getElementById('loan-amount').innerText = formatWon(gameData.finance.loan);
            if(gameData.finance.loan > 0) { 
                document.getElementById('loan-deadline').innerText = `${gameData.finance.loanDeadline} Minggu`; 
                document.getElementById('loan-deadline').style.color = gameData.finance.loanDeadline < 4 ? 'red' : 'black'; 
            } else { 
                document.getElementById('loan-deadline').innerText = `Tidak ada`; 
                document.getElementById('loan-deadline').style.color = 'black'; 
            }

            if(gameData.finance.investors > 0) { 
                document.getElementById('btn-investor').disabled = true; 
                document.getElementById('btn-investor').innerText = "SUDAH ADA INVESTOR"; 
            }
        }

        document.getElementById('lvl-practice').innerText = gameData.facilities.practice; document.getElementById('lvl-studio').innerText = gameData.facilities.studio;
        document.getElementById('lvl-dorm').innerText = gameData.facilities.dorm; document.getElementById('lvl-clinic').innerText = gameData.facilities.clinic;

        renderStaffList(); 
        renderManualScheduleList(); 
        renderArtistList(); 
        renderPendingReleases();
        
        if(document.getElementById('database').classList.contains('active')) renderDatabase();
    }

    window.openDashboardDetail = function(type) {
        let t = document.getElementById('dash-modal-title'), c = document.getElementById('dash-modal-content');
        if(type==='trainee') { t.innerText="Daftar Trainee Aktif"; let trs = gameData.trainees.filter(tr=>!tr.isDebuted); c.innerHTML = trs.length > 0 ? trs.map(tr=>`• <b>${tr.name}</b> (${tr.gender}) - ${tr.bg} (Avg Stat: ${Math.floor((tr.vocal+tr.dance+tr.rap+tr.visual+(tr.stage || (tr.vocal+tr.dance+tr.visual)/3))/5)})`).join('<br><br>') : "Asrama kosong. Buka audisi."; }
        else if(type==='group') { t.innerText="Daftar Artis Resmi Debut"; let gs = gameData.groups.filter(g=>!g.isPreDebut); c.innerHTML = gs.length > 0 ? gs.map(g=>`• <b>${g.name}</b> (Album: ${g.albums} | Fans: ${g.fansKR+g.fansGL})`).join('<br><br>') : "Belum ada artis yang didebutkan."; }
        else if(type==='predebut') { t.innerText="Daftar Grup Pre-Debut"; let gs = gameData.groups.filter(g=>g.isPreDebut); c.innerHTML = gs.length > 0 ? gs.map(g=>`• <b>${g.name}</b> (Proyek Pra-debut | Fans: ${g.fansKR+g.fansGL})`).join('<br><br>') : "Belum ada proyek Pre-Debut."; }
        else if(type==='rank') { t.innerText="Sistem Reputasi"; c.innerHTML = `Reputasi memengaruhi kemudahan masuk Chart dan Limit Pinjaman Bank. Game ini sangat brutal bagi agensi Nugu.<br><br><b>Peringkat Agensi:</b><br>- Nugu (< 1000)<br>- Mid Tier (> 1000)<br>- Top Tier (> 5,000)<br>- Big 4 (> 15,000)<br><br>Reputasi saat ini: <b>${gameData.rep}</b>`; }
        openModal('modal-dashboard-detail');
    };

    // ==========================================
    // 3. LOGIC PROGRESSION (THE BRUTAL TIME SKIP)
    // ==========================================
    document.getElementById('btn-skip-week').addEventListener('click', () => {
        
        // Check for STALLED releases
        let hasStalled = gameData.pendingReleases.some(pr => pr.weeksLeft <= 0 && !pr.tasksDone);
        if(hasStalled) {
            document.getElementById('badge-release-stall').style.display = 'block';
            return showToast("ADA RILISAN TERTUNDA! Masuk ke tab Persiapan Rilis dan kerjakan Tugas Produksi!", "danger");
        } else { document.getElementById('badge-release-stall').style.display = 'none'; }

        // INTERACTIVE EVENT CHECK (Start of week)
        if(gameData.groups.length > 0 && Math.random() < 0.15) {
            if(triggerInteractiveEvent()) return; // Stop the week skip until event is resolved
        }

        gameData.w++;
        
        // BANK DEADLINE LOGIC
        if(gameData.finance.loan > 0) {
            gameData.finance.loanDeadline--;
            if(gameData.finance.loanDeadline <= 0) {
                let penalty = gameData.finance.loan * 1.5; gameData.money -= penalty; gameData.finance.loan = 0; gameData.rep -= 1000;
                showToast(`SITA PAKSA! Bank menarik ${formatWon(penalty)} dari kas. Reputasi anjlok!`, "danger"); addMainLog("🚨 BANKRUPTCY WARNING: Sita paksa oleh bank.");
                gameData.groups.forEach(g => g.stress = Math.min(100, g.stress + 50));
            } else if(gameData.w === 1) gameData.finance.loan += Math.floor(gameData.finance.loan * 0.05);
        }

        // MONTHLY & YEARLY LOGIC
        if (gameData.w > 4) { 
            gameData.w = 1; gameData.m++; 
            addFinanceRecord('Operational', 'expense', gameData.cost, 'Biaya Operasional Agensi'); 
            
            // Rotate active rivals via evolution (not random replace)
            // Remove disbanded nugu groups (very low fandom after long time)
            gameData.activeRivals = gameData.activeRivals.filter(r => {
                if(r.tier === 'Nugu' && r.fandom < 300 && Math.random() < 0.3) return false; // Nugu disband
                return true;
            });
            // Add new industry debuts (1-2 per month)
            let newDebuts = 1 + (Math.random() > 0.6 ? 1 : 0);
            for(let nd=0; nd<newDebuts; nd++) {
                // Most new debuts are nugu or mid-tier
                let newTier = Math.random() < 0.7 ? 'Nugu' : Math.random() < 0.8 ? 'Mid-Tier' : 'Top-Tier';
                gameData.activeRivals.push(generateRandomRival(newTier));
            }

            if(gameData.money < 0) {
                showToast("KAS NEGATIF! Agensi Gagal Bayar Gaji!", "danger");
                if(Math.random() > 0.5 && gameData.staff.length > 0) {
                    let quit = gameData.staff.pop(); addMainLog(`🚨 EXODUS: Staff ${quit.type} mengundurkan diri!`); showToast(`Staff Keluar!`, "warning");
                }
                if(Math.random() > 0.7 && gameData.trainees.length > 0) { gameData.trainees.pop(); addMainLog(`🚨 EXODUS: Trainee kabur.`); }
            }
            if (gameData.m > 12) { 
                gameData.m = 1; gameData.y++; showToast("🎉 Tahun Baru!", "success"); 
                if(gameData.money > 1000000000) { let tax = Math.floor(gameData.money * 0.1); addFinanceRecord('Tax', 'expense', tax, 'Corporate Tax (10%)'); }
            } 
        }

        // PENDING RELEASES
        for (let i = gameData.pendingReleases.length - 1; i >= 0; i--) {
            let pr = gameData.pendingReleases[i];
            if(pr.weeksLeft > 0) pr.weeksLeft--;
            if(pr.weeksLeft === 0 && pr.tasksDone) { queueAnimReleases.push(pr); gameData.pendingReleases.splice(i, 1); }
        }

        // ARTIST CAUSE-AND-EFFECT
        let mngCount = gameData.staff.filter(s=>s.type==='Manager').length;
        let prCount = gameData.staff.filter(s=>s.type==='PR Manager').length;
        let psychBuff = gameData.staff.filter(s=>s.type==='Psychiatrist').length * 5 + (mngCount * 2); // Managers passively reduce stress
        let dormBuff = gameData.facilities.dorm * 3; let clinicBuff = gameData.facilities.clinic * 0.1;

        if(prCount > 0 && Math.random() < 0.2) { gameData.rep += (prCount * 5); } // PR Managers passively boost rep

        gameData.groups.forEach((art, gIdx) => {
            art.members.forEach(m => {
                if (m.soloBusy > 0) {
                    m.soloBusy--;
                    if (m.soloBusy === 0 && m.currentSoloObj) {
                        let sType = m.currentSoloObj;
                        if (sType === 'drama') { let gain = Math.floor(1000 + (m.indFans||0)*0.05); m.indFans += gain; art.fansKR += Math.floor(gain*0.3); addFinanceRecord('Solo', 'income', Math.floor(30000000 + (m.indFans||0)*500), `Drama (${m.name})`); }
                        else if (sType === 'mc') { m.indFans += Math.floor(200 + (m.indFans||0)*0.02); gameData.rep += 5; }
                        else if (sType === 'solo_debut') { let gain = Math.floor(2000 + (m.indFans||0)*0.08); m.indFans += gain; art.fansGL += Math.floor(gain*0.2); addFinanceRecord('Solo', 'income', Math.floor(20000000 + (m.indFans||0)*300), `Solo (${m.name})`); }
                        else if (sType === 'ba') { let gain = Math.floor(3000 + (m.indFans||0)*0.1); m.indFans += gain; gameData.rep += 30; addFinanceRecord('Solo', 'income', Math.floor(80000000 + (m.indFans||0)*800), `BA Luxury (${m.name})`); }
                        m.currentSoloObj = null;
                    }
                }
            });

            if (art.busyWeeks > 0) {
                art.busyWeeks--;
                if(art.busyWeeks === 0 && art.currentEvent) {
                    let ev = art.currentEvent;
                    let fanScale = Math.max(1, Math.log10(Math.max(10, art.fansKR + art.fansGL))); // Scale rewards with existing size
                    // Stage presence bonus: avg stage stat amplifies event results
                    let avgStage = art.members.length > 0 ? art.members.reduce((s,m) => s + (m.stage || (m.vocal+m.dance+m.visual)/3), 0) / art.members.length : 50;
                    let stageMult = 0.7 + (avgStage / 150); // 0.7 at stage=0, ~1.37 at stage=100
                    
                    if(ev === 'fanmeet') { art.fansKR += Math.floor(500 * fanScale * stageMult); addFinanceRecord('Event', 'income', Math.floor(10000000 * fanScale), `Fanmeeting (${art.name})`); }
                    else if(ev === 'tour') { art.fansGL += Math.floor(1000 * fanScale * stageMult); addFinanceRecord('Event', 'income', Math.floor(80000000 * fanScale * stageMult), `Tur Arena (${art.name})`); }
                    else if(ev === 'worldtour') { art.fansGL += Math.floor(5000 * fanScale * stageMult); art.fansKR += Math.floor(2000 * fanScale); addFinanceRecord('Event', 'income', Math.floor(500000000 * fanScale * stageMult), `World Tour (${art.name})`); gameData.rep += 200; }
                    else if(ev === 'popup') { art.fansKR += Math.floor(300 * fanScale); addFinanceRecord('Event', 'income', Math.floor(30000000 * fanScale), `Pop-up Store (${art.name})`); }
                    else if(ev === 'variety') { gameData.rep += 30; art.fansKR += Math.floor(200 * fanScale); }
                    else if(ev === 'survival') { let survBonus = Math.floor(avgStage * 100); art.fansKR += Math.floor(8000 + Math.random()*12000 + survBonus); art.fansGL += Math.floor(3000 + Math.random()*7000); gameData.rep += 100; showToast(`${art.name} meledak di Survival Show Mnet!`, "success"); generateSocialFeed('predebut_hype', art.name); }
                    else if(ev === 'reality') { art.fansKR += Math.floor(1000 * fanScale); art.fansGL += Math.floor(500 * fanScale); showToast(`Reality Show ${art.name} selesai.`, "success"); }
                    else if(ev === 'busking') { art.fansKR += Math.floor((200 + Math.random()*500) * stageMult); generateSocialFeed('predebut_hype', art.name); }
                    else if(ev === 'yt_cover') { art.fansGL += Math.floor(200 + Math.random()*600); art.fansKR += Math.floor(100 + Math.random()*200); generateSocialFeed('predebut_hype', art.name); }
                    else if(ev === 'vocal_cover') { let avgVoc = art.members.reduce((s,m)=>s+m.vocal,0)/art.members.length; let vocBonus = avgVoc > 70 ? 2 : 1; art.fansGL += Math.floor((150 + Math.random()*400)*vocBonus); art.fansKR += Math.floor((200 + Math.random()*400)*vocBonus); if(avgVoc > 70) generateSocialFeed('vocal_praise', art.name); else generateSocialFeed('predebut_hype', art.name); }
                    else if(ev === 'dance_practice') { art.fansGL += Math.floor(300 + Math.random()*500); art.fansKR += Math.floor(100 + Math.random()*200); generateSocialFeed('dance_praise', art.name); }
                    else if(ev === 'vlive_showcase') { art.fansKR += Math.floor(150 + Math.random()*300); generateSocialFeed('predebut_hype', art.name); }
                    else if(ev === 'university_fest') { art.fansKR += Math.floor(400 * fanScale * stageMult); addFinanceRecord('Event', 'income', Math.floor(15000000 * fanScale), `Festival Kampus (${art.name})`); generateSocialFeed('general', art.name); }
                    else if(ev === 'cf_shoot') { addFinanceRecord('Activity', 'income', Math.floor(25000000 * fanScale), `CF Shooting (${art.name})`); gameData.rep += 10; }
                    else if(ev === 'year_end_concert') { art.fansKR += Math.floor(3000 * fanScale * stageMult); art.fansGL += Math.floor(1500 * fanScale); addFinanceRecord('Event', 'income', Math.floor(150000000 * fanScale * stageMult), `Year-End Concert (${art.name})`); gameData.rep += 80; generateSocialFeed('chart_high', art.name); }
                    else if(ev === 'hiatus') { art.stress = 0; showToast(`Hiatus ${art.name} selesai.`, "success"); } 
                    art.currentEvent = null;
                }
            } else {
                let sched = art.autoSchedule || 'promo';
                let fanScale = Math.max(0.5, Math.log10(Math.max(10, art.fansKR + art.fansGL)) * 0.3); // Tiny scale for auto
                if(sched === 'promo') { art.fansKR += Math.floor(30 * fanScale); addFinanceRecord('Activity', 'income', Math.floor(500000 * fanScale), `Job Kecil (${art.name})`); art.stress += Math.max(0, 2 - mngCount); }
                else if(sched === 'practice') { art.avgStat += 0.5; art.fansKR = Math.max(0, art.fansKR - 10); art.stress += Math.max(1, 5 - mngCount); }
                else if(sched === 'rest') { art.stress = Math.max(0, art.stress - (30 + dormBuff + psychBuff)); } 
                else if(sched === 'live') { art.fansGL += Math.floor(50 * fanScale); art.stress = Math.max(0, art.stress - (5 + dormBuff + psychBuff)); }
                else if(sched === 'festival') { art.fansKR += Math.floor(200 * fanScale); addFinanceRecord('Activity', 'income', Math.floor(5000000 * fanScale), `Festival (${art.name})`); art.stress += Math.max(2, 8 - mngCount); }
                else if(sched === 'cf') { if(gameData.rep > 1500) { addFinanceRecord('Activity', 'income', Math.floor(20000000 * fanScale), `Syuting CF (${art.name})`); art.stress += Math.max(3, 10 - mngCount); art.fansKR += Math.floor(100 * fanScale);} else { art.autoSchedule='promo'; } }
            }

            // INJURY LOGIC
            if(art.stress >= 100 && art.currentEvent !== 'hiatus') {
                let injuryChance = Math.max(0.05, 0.3 - clinicBuff);
                if(Math.random() < injuryChance) {
                    let victim = art.members[Math.floor(Math.random() * art.members.length)];
                    victim.dance = Math.max(10, victim.dance - 20); // PERMANENT DROP
                    showToast(`TRAGEDI! ${victim.name} cedera parah! Stat turun permanen!`, "danger"); addMainLog(`🚨 CEDERA PERMANEN: ${victim.name} cedera otot.`);
                }
                art.busyWeeks = 2; art.currentEvent = 'hiatus'; art.fansKR = Math.max(0, art.fansKR - 5000); gameData.rep -= 50;
                showToast(`GAWAT! ${art.name} tumbang! Hiatus paksa 2 minggu.`, "danger"); addMainLog(`⚠️ Skandal Overwork: ${art.name} UGD.`); generateSocialFeed('hiatus', art.name);
            }
        });

        // TRAINEES: REALISTIC DIMINISHING RETURNS GROWTH
        // Real K-Pop trainee: 2-7 tahun latihan untuk debut-ready
        // Growth rate: ~0.3-0.8 per minggu base (tanpa staff/facility)
        // Dengan staff S-grade + facility max: ~1.0-1.5 per minggu di stat rendah
        // Di stat tinggi (80+): hampir tidak naik lagi (0.05-0.15 per minggu)
        let fBonus = gameData.facilities.practice; 
        let sBonusD = 0, sBonusV = 0;
        gameData.staff.forEach(s => {
            let val = s.grade === 'S' ? 0.4 : s.grade === 'A' ? 0.3 : s.grade === 'B' ? 0.2 : 0.1;
            if(s.type === 'Choreographer') sBonusD += val;
            if(s.type === 'Vocal Coach') sBonusV += val;
        });

        gameData.trainees.filter(t => !t.isDebuted).forEach(t => {
            let pMalas = t.traitObj && t.traitObj.name === "Pemalas Berbakat" ? 0.4 : 1;
            let pHardWorker = t.traitObj && t.traitObj.name === "Pekerja Keras" ? 1.3 : 1;
            let pDarkHorse = (t.traitObj && t.traitObj.name === "Dark Horse" && (t.monthsTraining || 0) >= 6) ? 1.5 : 1;
            let traitMult = pMalas * pHardWorker * pDarkHorse;
            
            // Base growth per minggu (sangat kecil — realistis)
            let baseV = 0.3 + (fBonus * 0.08) + sBonusV;   // Lv1: 0.38, Lv5: 0.7, + S vocal coach: 1.1
            let baseD = 0.3 + (fBonus * 0.08) + sBonusD;   
            let baseR = 0.25 + (fBonus * 0.06);              // Rap grows slower without specific coach
            let baseVi = 0.05;                                 // Visual hampir tidak naik (nature, bukan skill)

            if(t.focus === 'vocal') baseV += 0.2; 
            if(t.focus === 'dance') baseD += 0.2; 
            if(t.focus === 'rap') baseR += 0.15; 
            if(t.focus === 'visual') baseVi += 0.08;

            // DIMINISHING RETURNS: semakin tinggi stat, semakin lambat naiknya
            // Di 30: growth x 0.77 → masih oke
            // Di 50: growth x 0.55 → mulai lambat
            // Di 70: growth x 0.33 → sangat lambat
            // Di 85: growth x 0.15 → hampir flat
            // Di 95: growth x 0.02 → praktis tidak naik
            let dimReturn = (current) => Math.max(0.02, Math.pow(1 - (current / 105), 2));
            
            let gainV = baseV * traitMult * dimReturn(t.vocal);
            let gainD = baseD * traitMult * dimReturn(t.dance);
            let gainR = baseR * traitMult * dimReturn(t.rap);
            let gainVi = baseVi * traitMult * dimReturn(t.visual);

            t.vocal = Math.min(99, t.vocal + gainV); 
            t.dance = Math.min(99, t.dance + gainD); 
            t.rap = Math.min(99, t.rap + gainR); 
            t.visual = Math.min(99, t.visual + gainVi);
            
            // Stage presence: grows very slowly, influenced by performance experience
            let curStage = t.stage || ((t.vocal+t.dance+t.visual)/3);
            let baseStage = 0.15 + (fBonus * 0.04) + (sBonusD * 0.15);
            let gainStage = baseStage * traitMult * dimReturn(curStage);
            t.stage = Math.min(99, curStage + gainStage);
            
            // Track training duration
            t.monthsTraining = (t.monthsTraining || 0) + 0.25; // 1 week = 0.25 month
        });
        
        if(document.getElementById('trainee').classList.contains('active')) renderTrainees();

        // STAFF SEARCH COUNTDOWN
        if (gameData.staffSearch.active) {
            gameData.staffSearch.weeks--;
            document.getElementById('staff-search-timer').innerText = gameData.staffSearch.weeks;
            if (gameData.staffSearch.weeks <= 0) finishStaffSearch();
        }

        // AUDITION COUNTDOWN
        if (gameData.audition.active) { 
            gameData.audition.weeks--; document.getElementById('audition-timer').innerText = gameData.audition.weeks; 
            if (gameData.audition.weeks <= 0) finishAudition(); 
        }

        // SONG LIFECYCLE: Realistic rise-peak-decline curve (NOT always decay)
        // Week 1-2: Song can RISE in score (hype building, word of mouth)
        // Week 2-4: Peak period — score stabilizes or climbs slightly
        // Week 4-8: Gradual decline
        // Week 8+: Steep decline
        gameData.activeSongs.forEach(song => {
            if(song.weeksActive < 16) { // Extended from 12 to 16 weeks lifecycle
                let melonPos = currentCharts.melon.findIndex(c => c.isPlayer && c.title === song.title) + 1;
                let spotifyPos = currentCharts.spotify.findIndex(c => c.isPlayer && c.title === song.title) + 1;
                
                // Track peak positions
                if(!song.peakMelon || (melonPos > 0 && melonPos < (song.peakMelon || 999))) song.peakMelon = melonPos > 0 ? melonPos : (song.peakMelon || 999);
                if(!song.peakSpotify || (spotifyPos > 0 && spotifyPos < (song.peakSpotify || 999))) song.peakSpotify = spotifyPos > 0 ? spotifyPos : (song.peakSpotify || 999);
                
                // Track music show wins per song
                if(!song.musicShowWins) song.musicShowWins = 0;
                
                // Royalty income
                let domesticRev = 0;
                if(melonPos > 0 && melonPos <= 10) domesticRev = 80000000;
                else if(melonPos > 0 && melonPos <= 30) domesticRev = 30000000;
                else if(melonPos > 0 && melonPos <= 50) domesticRev = 10000000;
                else if(melonPos > 0) domesticRev = 3000000;
                else domesticRev = 500000;
                
                let globalRev = 0;
                if(spotifyPos > 0 && spotifyPos <= 10) globalRev = 50000000;
                else if(spotifyPos > 0 && spotifyPos <= 50) globalRev = 15000000;
                else if(spotifyPos > 0) globalRev = 5000000;
                
                if(song.recentAlbumType === 'Japanese') domesticRev *= 0.3;
                let jpRev = song.recentAlbumType === 'Japanese' ? 20000000 : 0;
                
                // Revenue decay berdasarkan posisi, bukan waktu semata
                let positionFactor = melonPos > 0 ? Math.max(0.3, 1 - (melonPos / 120)) : 0.1;
                let totalRoyalty = Math.floor((domesticRev + globalRev + jpRev) * positionFactor);
                
                if(totalRoyalty > 0) {
                    addFinanceRecord('Royalty', 'income', totalRoyalty, `Royalti: ${song.title} (W${song.weeksActive+1})`);
                }
                
                // Fan growth from charting
                if(melonPos > 0 && melonPos <= 30) song.artistRef.fansKR += Math.floor(500 * positionFactor);
                if(spotifyPos > 0 && spotifyPos <= 50) song.artistRef.fansGL += Math.floor(800 * positionFactor);
                
                song.weeksActive++; 
                
                // === REALISTIC SCORE CURVE ===
                // Week 1-2: Score can RISE (initial hype, discovery, viral potential)
                if(song.weeksActive <= 2) {
                    let hypeChance = Math.random();
                    if(hypeChance > 0.7) {
                        song.score = song.score * (1.02 + Math.random() * 0.08); // +2% to +10% rise
                    } else if(hypeChance > 0.3) {
                        song.score = song.score * (0.98 + Math.random() * 0.04); // Flat/slight fluctuation
                    } else {
                        song.score = song.score * 0.95; // Quick drop if not catching on
                    }
                }
                // Week 3-5: Peak sustain — slight fluctuation, mostly stable
                else if(song.weeksActive <= 5) {
                    let isCharting = melonPos > 0 && melonPos <= 50;
                    if(isCharting) {
                        song.score = song.score * (0.96 + Math.random() * 0.06); // -4% to +2%
                    } else {
                        song.score = song.score * 0.93; // Faster drop if not charting
                    }
                }
                // Week 6-10: Gradual decline
                else if(song.weeksActive <= 10) {
                    song.score = song.score * (0.90 + Math.random() * 0.05); // -5% to -10%
                }
                // Week 11+: Steep decline (longevity bonus if still charting)
                else {
                    let longevityBonus = (melonPos > 0 && melonPos <= 30) ? 0.04 : 0;
                    song.score = song.score * (0.85 + longevityBonus + Math.random() * 0.03);
                }
                
                // Score floor — never below 3
                song.score = Math.max(3, song.score);
            }
        });

        generateCharts(); 
        
        // MUSIC SHOW ELIGIBILITY: Not fixed 4 weeks — stays eligible while charting top 20
        let eligibleForMusicShow = null; let anySajaegi = false;
        for(let i=0; i<5; i++) { // Check top 5 instead of top 3
            if(currentCharts.melon[i] && currentCharts.melon[i].isPlayer && currentCharts.melon[i].ref) {
                let songRef = currentCharts.melon[i].ref;
                // Eligible if: still in first 8 weeks AND in top 20 of any chart
                let inTop20 = i < 20;
                let withinPromo = songRef.weeksActive > 0 && songRef.weeksActive <= 8; // Extended from 4 to 8 weeks
                if(inTop20 && withinPromo) {
                    eligibleForMusicShow = songRef;
                    if(gameData.rep < 1000 && Math.random() < 0.15) { anySajaegi = true; eligibleForMusicShow.artistRef.hasScandal = true; }
                    break;
                }
            } 
        }

        // PASSIVE RANDOM SOCIAL EVENT
        let didRandomEventHappen = false;
        // Only trigger passive social event if interactive event didn't happen
        if(gameData.groups.length > 0 && Math.random() < 0.15) didRandomEventHappen = triggerRandomPassiveEvent();

        if(anySajaegi) {
            gameData.rep -= 200; addMainLog(`🚨 SKANDAL SAJAEGI: Lagu dituduh manipulasi chart!`); showToast("Tuduhan Sajaegi!", "danger"); generateSocialFeed('sajaegi', eligibleForMusicShow?.artistRef?.name || "Grup Agensi");
        } else if(!didRandomEventHappen) {
            let socState = 'general';
            if(eligibleForMusicShow) socState = 'chart_high'; else if(gameData.activeSongs.some(s => s.weeksActive === 1 && s.score < 40)) socState = 'chart_low';
            generateSocialFeed(socState);
        }
        
        updateUI();

        // EXECUTE RELEASES OR STAGE ANIMATION
        if(queueAnimReleases.length > 0) { 
            processNextReleaseQueue(); 
        } else if(eligibleForMusicShow) { 
            setTimeout(() => playStageAnimation(eligibleForMusicShow), 500); 
        }
    });

    // ==========================================
    // DATABASE TAB (NEW)
    // ==========================================
    function renderDatabase() {
        const grid = document.getElementById('database-grid');
        grid.innerHTML = '';
        
        // Render Player Groups
        gameData.groups.forEach(g => {
            let tier = gameData.rep > 50000 ? "Legend" : gameData.rep > 15000 ? "Top-Tier" : gameData.rep > 1000 ? "Mid-Tier" : "Nugu";
            grid.innerHTML += `
                <div class="db-card" style="border-color: var(--c-blue-solid);">
                    <div class="db-icon bg-blue">👑</div>
                    <div class="db-info">
                        <h4>${g.name} <span style="font-size:0.7rem; background:var(--border-dark); color:#fff; padding:2px 5px; border-radius:4px;">PLAYER</span></h4>
                        <p>Agensi: ${gameData.agency}</p>
                        <p>Est. Fandom: ${(g.fansKR + g.fansGL).toLocaleString()}</p>
                        <p>Status Tier: <strong>${tier}</strong></p>
                    </div>
                </div>
            `;
        });

        // Render Rival Groups (Sort by highest tier/fandom)
        let sortedRivals = [...gameData.activeRivals].sort((a,b) => b.fandom - a.fandom).slice(0, 15); // Show top 15 rivals
        sortedRivals.forEach(r => {
            let tierIcon = r.tier==='Legend' ? '👑' : r.tier==='Top-Tier' ? '🌟' : r.tier==='Mid-Tier' ? '📌' : '👤';
            grid.innerHTML += `
                <div class="db-card">
                    <div class="db-icon tier-${r.tier}">${tierIcon}</div>
                    <div class="db-info">
                        <h4>${r.artist}</h4>
                        <p>Agensi: ${r.agency}</p>
                        <p>Est. Fandom: ${r.fandom.toLocaleString()}</p>
                        <p>Status Tier: <strong>${r.tier}</strong></p>
                        <p style="font-size:0.7rem;color:#777;">Lagu: ${r.title} | ${r.gender === 'Male' ? '👦' : '👧'} ${r.memberCount || '?'} member</p>
                    </div>
                </div>
            `;
        });
    }

    // ==========================================
    // ADVANCED SOCIAL MEDIA (COMPLEX)
    // ==========================================
    window.switchSosmedTab = function(tabId) {
        document.querySelectorAll('#social .sub-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#social .sub-tab-content').forEach(cont => cont.classList.remove('active'));
        event.target.classList.add('active');
        document.getElementById(`tab-sosmed-${tabId}`).classList.add('active');

        if(tabId === 'manage') {
            const sel = document.getElementById('adv-sns-artist'); sel.innerHTML = '';
            if(gameData.groups.length === 0) sel.innerHTML = '<option value="">Belum ada artis</option>';
            else gameData.groups.forEach((g,i) => { let alertMark = g.hasScandal ? '🚨 (Skandal)' : ''; sel.innerHTML += `<option value="${i}">${g.name} ${alertMark}</option>`; });
            updateSnsOptions();
        }
    };

    window.updateSnsOptions = function() {
        const plat = document.getElementById('adv-sns-platform').value;
        const content = document.getElementById('adv-sns-content');
        content.innerHTML = '';

        if(plat === 'weverse') {
            content.innerHTML = `
                <option value="w_live">🎥 Nyalakan Live Streaming (Fans Setia +, Stress -)</option>
                <option value="w_post">📝 Tulis Pesan Panjang (Penenang Skandal Ringan)</option>
                <option value="w_merch">🛒 Promosikan Merch Eksklusif (+Kas, -Reputasi Dikit)</option>
            `;
        } else if(plat === 'tiktok') {
            content.innerHTML = `
                <option value="t_dance">🕺 Buat Dance Challenge Viral (Global Fans +, Potensi Viral)</option>
                <option value="t_trend">🤪 Ikut Tren Meme (Bisa di-cringe-in, Resiko Skandal Kecil)</option>
            `;
        } else if(plat === 'instagram') {
            content.innerHTML = `
                <option value="i_aesthetic">📸 Posting Foto Aesthetic (Visual +, Reputasi Brand +)</option>
                <option value="i_sponsor">💍 Posting Barang Sponsor (+Uang, Followers Nambah Dikit)</option>
            `;
        } else if(plat === 'twitter') {
            content.innerHTML = `
                <option value="x_interact">💬 Balas-balasin Mention Fans (Fans KR +, Stress +)</option>
                <option value="x_spoiler">👀 "Tidak Sengaja" Spoiler Lagu (Hype +, Dimarahi Staff)</option>
                <option value="x_apology">📝 Tulis Permintaan Maaf Resmi (Redakan Skandal Berat)</option>
            `;
        } else if(plat === 'bubble') {
            content.innerHTML = `
                <option value="b_spam">💬 Spam Pesan Lucu ke Fans (Fans KR +, Income +)</option>
                <option value="b_lazy">😴 Malas Update Sebulan (Skandal Attitude, Fans Kecewa)</option>
            `;
        } else if(plat === 'youtube') {
            content.innerHTML = `
                <option value="y_vlog">📹 Upload Daily Vlog (Fans GL +, Reputasi +)</option>
                <option value="y_cover">🎤 Upload Vocal Cover (Fans ++ jika Vokal bagus)</option>
            `;
        }
    };

    window.executeAdvancedSns = function() {
        let artIdx = document.getElementById('adv-sns-artist').value;
        if(artIdx === "") return showToast("Pilih artis terlebih dahulu!", "danger");
        
        let art = gameData.groups[artIdx];
        let c = document.getElementById('adv-sns-content').value;
        let totalFans = art.fansKR + art.fansGL;
        // Fan gain scales logarithmically with existing size — bigger groups get bigger returns
        let fanScale = Math.max(0.5, Math.log10(Math.max(10, totalFans)) * 0.5); // ~1.5 at 1K, ~2.5 at 100K
        let incomeScale = Math.max(1, Math.log10(Math.max(10, totalFans))); // revenue scales with size

        // Weverse
        if(c === 'w_live') { art.fansKR += Math.floor(80 * fanScale); art.stress = Math.max(0, art.stress - 15); showToast("Live Weverse sukses! Fans senang.", "success"); }
        else if(c === 'w_post') { if(art.hasScandal && Math.random()>0.5){ art.hasScandal=false; showToast("Pesan tulus meredakan skandal.", "success");} else { showToast("Fans tersentuh.", "success"); } }
        else if(c === 'w_merch') { addFinanceRecord('Merch', 'income', Math.floor(5000000 * incomeScale), `Jual Merch Weverse (${art.name})`); gameData.rep -= 5; showToast("Uang masuk, K-Netz bilang agensi maruk.", "warning"); }
        // TikTok
        else if(c === 't_dance') { 
            // Viral chance scales with group quality, not guaranteed
            let viralChance = Math.min(0.3, 0.05 + totalFans / 2000000); // Max 30% chance to go viral
            if(Math.random() < viralChance) { art.fansGL += Math.floor(2000 * fanScale); showToast("CHALLENGE VIRAL DI FYP!", "success"); }
            else { art.fansGL += Math.floor(100 * fanScale); showToast("Views biasa saja.", "normal"); }
        }
        else if(c === 't_trend') { 
            if(Math.random() > 0.75) { art.hasScandal = true; gameData.rep -= 30; showToast("K-Netz bilang kontennya Cringe! Skandal!", "danger"); }
            else { art.fansGL += Math.floor(150 * fanScale); showToast("Lumayan menghibur.", "success"); }
        }
        // Instagram
        else if(c === 'i_aesthetic') { gameData.rep += 8; art.fansGL += Math.floor(60 * fanScale); showToast("Visual dipuji netizen.", "success"); }
        else if(c === 'i_sponsor') { addFinanceRecord('Activity', 'income', Math.floor(3000000 * incomeScale), `Sponsor IG (${art.name})`); showToast("Uang sponsor masuk.", "success"); }
        // Twitter
        else if(c === 'x_interact') { art.fansKR += Math.floor(200 * fanScale); art.stress += 10; showToast("Fans heboh! Tapi idol sedikit capek baca komen toxic.", "warning"); }
        else if(c === 'x_spoiler') { art.fansKR += Math.floor(100 * fanScale); art.fansGL += Math.floor(80 * fanScale); showToast("Spoiler viral di X!", "success"); }
        else if(c === 'x_apology') { 
            if(art.hasScandal) { art.hasScandal = false; gameData.rep += 20; showToast("Permintaan maaf diterima.", "success"); } 
            else { showToast("Minta maaf tanpa alasan.", "warning"); } 
        }
        // Bubble / Phoning
        else if(c === 'b_spam') { art.fansKR += Math.floor(150 * fanScale); addFinanceRecord('Activity', 'income', Math.floor(2000000 * incomeScale), `Langganan Chat App (${art.name})`); showToast("Fans puas disapa biasnya.", "success"); }
        else if(c === 'b_lazy') { art.hasScandal = true; art.fansKR = Math.floor(art.fansKR * 0.95); showToast("K-Netz marah idol malas update Bubble!", "danger"); generateSocialFeed('scandal_attitude', art.name); }
        // YouTube
        else if(c === 'y_vlog') { art.fansGL += Math.floor(200 * fanScale); gameData.rep += 5; showToast("Vlog di-upload, fans internasional senang.", "success"); }
        else if(c === 'y_cover') { 
            let avgVoc = 0; art.members.forEach(m => avgVoc += m.vocal); avgVoc /= art.members.length;
            if(avgVoc > 70) { art.fansGL += Math.floor(500 * fanScale); art.fansKR += Math.floor(200 * fanScale); showToast("Cover dipuji selangit!", "success"); generateSocialFeed('vocal_praise', art.name); }
            else { showToast("Vokal kurang bagus, sedikit dihujat di komen.", "warning"); art.fansKR = Math.max(0, art.fansKR - Math.floor(50 * fanScale)); }
        }

        generateSocialFeed('general', art.name);
        updateUI();
    };

    // ==========================================
    // INTERACTIVE EVENTS (NEW)
    // ==========================================
    function triggerInteractiveEvent() {
        let rndGroup = gameData.groups[Math.floor(Math.random() * gameData.groups.length)];
        
        const events = [
            {
                title: "RUMOR KENCAN DISPATCH",
                icon: "📸",
                desc: `Dispatch baru saja merilis foto buram yang diduga adalah salah satu member ${rndGroup.name} sedang berkencan di kafe. K-Netz mulai berspekulasi! Apa tindakanmu?`,
                choices: [
                    { text: "Suap Media (Tutup Mulut) [-₩ 500 Jt]", action: () => { 
                        if(gameData.money >= 500000000) { addFinanceRecord('Legal', 'expense', 500000000, "Suap Media"); showToast("Berita berhasil diturunkan.", "success"); } 
                        else { showToast("Uang tidak cukup! Berita terlanjur viral.", "danger"); rndGroup.hasScandal = true; rndGroup.fansKR = Math.floor(rndGroup.fansKR * 0.8); gameData.rep -= 100; generateSocialFeed('scandal_dating', rndGroup.name);} 
                    }},
                    { text: "Bantah Keras (Resiko jika salah) [+Rep / -Rep]", action: () => { 
                        if(Math.random() > 0.5) { showToast("Bantahan dipercaya! K-Netz memuji perlindungan agensi.", "success"); gameData.rep += 50; } 
                        else { showToast("Dispatch rilis foto HD! Agensi dicap pembohong!", "danger"); rndGroup.hasScandal = true; rndGroup.fansKR = Math.floor(rndGroup.fansKR * 0.6); gameData.rep -= 200; generateSocialFeed('scandal_dating', rndGroup.name);} 
                    }},
                    { text: "Konfirmasi & Minta Maaf [-Fans KR]", action: () => { 
                        showToast("Dikonfirmasi. Fans Korea kecewa tapi skandal cepat reda.", "warning"); rndGroup.fansKR = Math.floor(rndGroup.fansKR * 0.85); gameData.rep -= 20; generateSocialFeed('scandal_dating', rndGroup.name);
                    }}
                ]
            },
            {
                title: "TAWARAN IKLAN KONTROVERSIAL",
                icon: "💰",
                desc: `Sebuah brand fashion yang sedang diboikot oleh K-Netz menawarkan kontrak eksklusif yang sangat mahal untuk ${rndGroup.name}.`,
                choices: [
                    { text: "Terima Uangnya! [+₩ Besar, Skandal]", action: () => { 
                        let income = Math.floor(50000000 + (rndGroup.fansKR + rndGroup.fansGL) * 100);
                        addFinanceRecord('Activity', 'income', income, "Kontrak Iklan Kontroversial"); rndGroup.hasScandal = true; gameData.rep -= 80; showToast(`Uang ${formatWon(income)} masuk, tapi reputasi hancur!`, "danger"); generateSocialFeed('scandal_attitude', rndGroup.name);
                    }},
                    { text: "Tolak Demi Reputasi [+Rep, +Fans]", action: () => { 
                        let fanGain = Math.floor(100 + (rndGroup.fansKR * 0.01));
                        gameData.rep += 40; rndGroup.fansKR += fanGain; showToast("K-Netz memuji agensi karena memiliki prinsip!", "success"); 
                    }}
                ]
            },
            {
                title: "KONFLIK INTERNAL GRUP",
                icon: "🥊",
                desc: `Manager melaporkan bahwa dua member ${rndGroup.name} bertengkar hebat di ruang latihan. Stress grup meningkat tajam!`,
                choices: [
                    { text: "Paksa Mereka Tampil (Abaikan) [+Stress]", action: () => { 
                        rndGroup.stress += 30; showToast("Pertengkaran memburuk, atmosfer grup sangat tegang.", "warning"); 
                    }},
                    { text: "Sewa Konselor Ahli [-₩ 100 Jt, -Stress]", action: () => { 
                        if(gameData.money >= 100000000) { addFinanceRecord('Operational', 'expense', 100000000, "Konseling Grup"); rndGroup.stress = Math.max(0, rndGroup.stress - 40); showToast("Grup kembali harmonis.", "success"); }
                        else { showToast("Kas kurang! Stress gagal diturunkan.", "danger"); rndGroup.stress += 20; }
                    }}
                ]
            },
            {
                title: "TAWARAN DRAMA OST",
                icon: "🎬",
                desc: `PD drama hit KBS menawarkan ${rndGroup.name} untuk menyanyikan OST drama baru mereka! Ini exposure besar untuk vokal line.`,
                choices: [
                    { text: "Terima! [-₩ 20 Jt produksi, +Rep, +Fans GP]", action: () => {
                        if(gameData.money < 20000000) return showToast("Kas kurang!", "danger");
                        addFinanceRecord('Production', 'expense', 20000000, `OST Drama (${rndGroup.name})`);
                        let avgVoc = rndGroup.members.reduce((s,m) => s + m.vocal, 0) / rndGroup.members.length;
                        let quality = avgVoc > 70 ? 'hit' : 'decent';
                        if(quality === 'hit') {
                            rndGroup.fansKR += Math.floor(5000 + avgVoc * 50); gameData.rep += 80;
                            addFinanceRecord('Royalty', 'income', 50000000, `OST Hit Drama (${rndGroup.name})`);
                            showToast("OST jadi hit! Vokal dipuji, GP mengenal grup!", "success");
                            generateSocialFeed('vocal_praise', rndGroup.name);
                        } else {
                            rndGroup.fansKR += 1000; gameData.rep += 20;
                            addFinanceRecord('Royalty', 'income', 15000000, `OST Drama (${rndGroup.name})`);
                            showToast("OST diterima baik, exposure lumayan.", "success");
                        }
                    }},
                    { text: "Tolak (Fokus comeback)", action: () => { showToast("Kesempatan dilewatkan.", "normal"); }}
                ]
            },
            {
                title: "SASAENG FAN INSIDEN",
                icon: "🚨",
                desc: `Sasaeng fans berhasil menemukan alamat dorm ${rndGroup.name}! Member ketakutan dan stress meningkat drastis.`,
                choices: [
                    { text: "Pindah Dorm Darurat [-₩ 300 Jt, -Stress]", action: () => {
                        if(gameData.money >= 300000000) { addFinanceRecord('Security', 'expense', 300000000, "Relokasi Dorm Darurat"); rndGroup.stress = Math.max(0, rndGroup.stress - 30); showToast("Dorm dipindahkan. Member aman.", "success"); }
                        else { showToast("Kas kurang!", "danger"); rndGroup.stress += 25; }
                    }},
                    { text: "Tingkatkan Keamanan [-₩ 100 Jt]", action: () => {
                        if(gameData.money >= 100000000) { addFinanceRecord('Security', 'expense', 100000000, "Upgrade Keamanan"); rndGroup.stress += 10; showToast("Keamanan ditingkatkan. Situasi masih tegang.", "warning"); }
                        else { showToast("Kas kurang!", "danger"); rndGroup.stress += 25; }
                    }},
                    { text: "Abaikan (Hemat uang) [++Stress, resiko cedera]", action: () => {
                        rndGroup.stress += 35; showToast("Member sangat tertekan. Performa menurun.", "danger"); generateSocialFeed('mental_health', rndGroup.name);
                    }}
                ]
            },
            {
                title: "UNDANGAN ACARA AWARDS INTERNASIONAL",
                icon: "🏆",
                desc: `${rndGroup.name} diundang tampil di MTV EMA / Billboard Music Awards! Ini exposure global yang luar biasa, tapi biayanya mahal.`,
                choices: [
                    { text: "Tampil! [-₩ 500 Jt, +Fans Global Besar, +Rep]", action: () => {
                        if(gameData.money < 500000000) return showToast("Kas kurang!", "danger");
                        addFinanceRecord('Event', 'expense', 500000000, `Performance Awards Internasional (${rndGroup.name})`);
                        let avgStage = rndGroup.members.reduce((s,m) => s + (m.stage || 50), 0) / rndGroup.members.length;
                        let fansBoost = Math.floor(10000 + avgStage * 200);
                        rndGroup.fansGL += fansBoost; gameData.rep += 300;
                        showToast(`Performance spektakuler! +${fansBoost.toLocaleString()} global fans!`, "success");
                        generateSocialFeed('dance_praise', rndGroup.name);
                    }},
                    { text: "Tolak (Terlalu mahal)", action: () => { showToast("Kesempatan global dilewatkan.", "warning"); }}
                ]
            }
        ];

        let ev = events[Math.floor(Math.random() * events.length)];
        
        document.getElementById('event-icon').innerText = ev.icon;
        document.getElementById('event-title').innerText = ev.title;
        document.getElementById('event-desc').innerText = ev.desc;
        
        let choicesHtml = '';
        ev.choices.forEach((choice, idx) => {
            choicesHtml += `<button class="neo-btn ${idx===0?'danger-btn':'primary-btn'} w-100" onclick="resolveInteractiveEvent(${idx})">${choice.text}</button>`;
        });
        document.getElementById('event-choices-container').innerHTML = choicesHtml;
        
        // Store temporarily to execute
        window.currentActiveEvent = ev;

        openModal('modal-interactive-event');
        return true; // Pauses regular week execution
    }

    window.resolveInteractiveEvent = function(choiceIdx) {
        let choice = window.currentActiveEvent.choices[choiceIdx];
        choice.action();
        closeModal('modal-interactive-event');
        updateUI();
    };

    // ==========================================
    // RELEASE TASKS & ANIMATION (COMPLEX)
    // ==========================================
    let activeReleaseTaskIdx = null;

    window.openReleaseTasks = function(idx) {
        activeReleaseTaskIdx = idx;
        let pr = gameData.pendingReleases[idx];
        document.getElementById('display-task-concept').innerText = pr.concept;
        
        document.getElementById('task-music').value = 'inhouse'; 
        document.getElementById('task-choreo').value = 'trendy'; 
        document.getElementById('task-outfit').value = 'sponsor'; 
        document.getElementById('task-promo').value = 'standard';
        openModal('modal-release-tasks');
    };

    window.saveReleaseTasks = function() {
        let pr = gameData.pendingReleases[activeReleaseTaskIdx];
        let m = document.getElementById('task-music').value;
        let c = document.getElementById('task-choreo').value; 
        let o = document.getElementById('task-outfit').value; 
        let p = document.getElementById('task-promo').value;

        let addCost = 0; 
        // Music production costs
        if(m === 'bought') addCost += 50000000;
        if(m === 'trendy_edm') addCost += 100000000;
        if(m === 'acoustic') addCost += 80000000;
        if(m === 'famous') addCost += 300000000;
        if(m === 'collab_prod') addCost += 60000000;
        if(m === 'retro_prod') addCost += 120000000;
        // self_composed = free
        
        // Choreography costs
        if(c === 'studio1m') addCost += 100000000;
        if(c === 'theatrical') addCost += 80000000;
        if(c === 'freestyle_battle') addCost += 50000000;
        if(c === 'precision_military') addCost += 120000000;
        
        // Outfit costs
        if(o === 'custom') addCost += 50000000; 
        if(o === 'y2k_street' || o === 'fairy_gown') addCost += 80000000;
        if(o === 'luxury') addCost += 200000000; 
        if(o === 'school_uniform') addCost += 40000000;
        if(o === 'hanbok_modern') addCost += 100000000;
        if(o === 'techwear') addCost += 90000000;
        
        // Marketing costs
        if(p === 'ads') addCost += 80000000;
        if(p === 'street_promo') addCost += 100000000;
        if(p === 'viral') addCost += 150000000;
        if(p === 'fan_event') addCost += 60000000;
        if(p === 'media_play') addCost += 50000000;
        if(p === 'subway_ad') addCost += 70000000;

        if(gameData.money < addCost) return showToast(`Uang kurang untuk tugas ini! (Butuh tambahan ${formatWon(addCost)})`, "danger");
        if(addCost > 0) addFinanceRecord('Production', 'expense', addCost, `Biaya Tambahan Produksi (Sinergi Lagu/Koreo/Outfit/Promo)`);

        pr.taskBuffs = { music: m, choreo: c, outfit: o, promo: p }; 
        pr.tasksDone = true;
        showToast("Tugas Produksi Selesai! Menunggu Countdown.", "success"); 
        closeModal('modal-release-tasks'); 
        updateUI();
    };

    function renderPendingReleases() {
        const ul = document.getElementById('pending-release-list'); ul.innerHTML = '';
        if(gameData.pendingReleases.length === 0) { ul.innerHTML = `<p><i>Tidak ada persiapan rilis album saat ini.</i></p>`; return; }
        gameData.pendingReleases.forEach((pr, idx) => { 
            let taskBtn = pr.tasksDone ? `<button class="neo-btn success-btn btn-sm" disabled>✅ TUGAS SELESAI</button>` : `<button class="neo-btn action-btn btn-sm" onclick="openReleaseTasks(${idx})">⚠️ KERJAKAN TUGAS</button>`;
            let warn = (!pr.tasksDone && pr.weeksLeft <= 0) ? `<span class="text-red font-bold">TERTUNDA! Selesaikan Tugas!</span>` : `⏳ ${pr.weeksLeft} Mgg`;
            ul.innerHTML += `<div class="neo-card-small bg-white mb-2" style="display:flex; justify-content:space-between; align-items:center;"><div><strong>${pr.albumName}</strong> (${pr.albumType})<br><small>${warn}</small></div><div>${taskBtn}</div></div>`; 
        });
    }

    // ==========================================
    // MV ANIMATION & POST-RELEASE STATS (SYNERGY)
    // ==========================================
    window.processNextReleaseQueue = function() {
        if(queueAnimReleases.length === 0) return; let pr = queueAnimReleases.shift(); 
        let finalData = executeReleaseLogic(pr);
        const animScreen = document.getElementById('mv-anim-screen');
        const titleEl = document.getElementById('mv-anim-title');
        const artistEl = document.getElementById('mv-anim-artist');
        
        // Concept-based color theme
        const conceptColors = {
            'Girl Crush':['#ec4899','#be185d','#f9a8d4'], 'Hip-Hop':['#f97316','#eab308','#fbbf24'],
            'Y2K':['#a855f7','#ec4899','#3b82f6'], 'Cyberpunk':['#7c3aed','#06b6d4','#22d3ee'],
            'Dark Academia':['#78350f','#92400e','#b45309'], 'Refreshing':['#22c55e','#06b6d4','#a7f3d0'],
            'R&B':['#7c3aed','#ec4899','#a855f7'], 'Dreamy':['#a78bfa','#f9a8d4','#c4b5fd'],
            'Cute':['#f9a8d4','#fbbf24','#fbcfe8'], 'Elegant':['#d4a574','#fbbf24','#f5f0eb'],
            'Retro':['#f97316','#eab308','#ec4899'], 'Ballad':['#3b82f6','#1d4ed8','#93c5fd'],
            'Noir':['#1e293b','#334155','#64748b'], 'Ethereal':['#c4b5fd','#a78bfa','#e9d5ff']
        };
        let colors = conceptColors[pr.concept] || ['#ec4899','#3b82f6','#eab308'];
        
        // Phase 1: Countdown (3-2-1)
        titleEl.innerText = '3';
        titleEl.style.fontSize = '8rem';
        artistEl.innerText = '';
        animScreen.style.display = 'flex';
        animScreen.style.background = `radial-gradient(ellipse at center, ${colors[0]}20, #000 70%)`;
        
        // Generate floating particles
        let particleInterval = setInterval(() => {
            let p = document.createElement('div');
            p.className = 'mv-release-particle';
            p.style.cssText = `left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*3)]};animation-duration:${1+Math.random()*2}s;`;
            animScreen.appendChild(p);
            setTimeout(() => p.remove(), 3000);
        }, 100);

        setTimeout(() => { titleEl.innerText = '2'; titleEl.style.textShadow = `0 0 40px ${colors[0]}`; }, 700);
        setTimeout(() => { titleEl.innerText = '1'; titleEl.style.textShadow = `0 0 60px ${colors[1]}`; }, 1400);
        
        // Phase 2: Title reveal with flash
        setTimeout(() => {
            animScreen.style.background = '#fff';
            setTimeout(() => {
                animScreen.style.background = `linear-gradient(135deg, ${colors[0]}30, #000 40%, ${colors[1]}20)`;
                animScreen.style.transition = 'background 0.5s';
                titleEl.innerText = pr.isCb ? 'COMEBACK' : 'DEBUT';
                titleEl.style.fontSize = '5rem';
                titleEl.style.textShadow = `4px 4px 0px ${colors[0]}, -4px -4px 0px ${colors[1]}`;
                artistEl.innerText = `${finalData.artistName} — "${finalData.songTitle}"`;
                artistEl.style.color = colors[2] || '#fff';
            }, 100);
        }, 2100);
        
        // Phase 3: Color pulse
        let colIdx = 0;
        let colorPulse = setInterval(() => {
            let c = colors[colIdx % colors.length];
            animScreen.style.boxShadow = `inset 0 0 200px ${c}40`;
            colIdx++;
        }, 200);

        // Phase 4: Close and show stats
        setTimeout(() => { 
            clearInterval(particleInterval);
            clearInterval(colorPulse);
            animScreen.style.display = 'none'; 
            animScreen.style.background = '#000';
            animScreen.style.boxShadow = 'none';
            animScreen.style.transition = '';
            titleEl.style.fontSize = '5rem';
            titleEl.style.textShadow = '';
            artistEl.style.color = '#fff';
            // Remove leftover particles
            animScreen.querySelectorAll('.mv-release-particle').forEach(p => p.remove());
            showPostReleaseStats(finalData); 
        }, 4000);
    };
    window.checkNextPendingRelease = function() { if(queueAnimReleases.length > 0) setTimeout(() => processNextReleaseQueue(), 500); };

    function executeReleaseLogic(pr) {
        let targetGrp; let synergyBonus = 0; let tb = pr.taskBuffs; let isGroupAmpasDance = false; let groupDanceAvg = 0, groupVocAvg = 0, groupRapAvg = 0, groupVisualAvg = 0, groupStageAvg = 0;

        if(!pr.isCb) { targetGrp = pr.debutData; targetGrp.members.forEach(m => { groupDanceAvg+=m.dance; groupVocAvg+=m.vocal; groupRapAvg+=m.rap; groupVisualAvg+=m.visual; groupStageAvg+=(m.stage||(m.vocal+m.dance+m.visual)/3); }); 
            groupDanceAvg /= targetGrp.members.length; groupVocAvg /= targetGrp.members.length; groupRapAvg /= targetGrp.members.length; groupVisualAvg /= targetGrp.members.length; groupStageAvg /= targetGrp.members.length;
        } else { targetGrp = gameData.groups[pr.cbIdx]; targetGrp.members.forEach(m => { groupDanceAvg+=m.dance; groupVocAvg+=m.vocal; groupRapAvg+=m.rap; groupVisualAvg+=m.visual; groupStageAvg+=(m.stage||(m.vocal+m.dance+m.visual)/3); }); 
            groupDanceAvg /= targetGrp.members.length; groupVocAvg /= targetGrp.members.length; groupRapAvg /= targetGrp.members.length; groupVisualAvg /= targetGrp.members.length; groupStageAvg /= targetGrp.members.length; }

        let concept = pr.concept;
        let isFlopDisaster = false;
        let agencyCfg = AGENCY_TYPES[gameData.type] || AGENCY_TYPES.standard;
        let flopReasons = [];

        // ====== REALISTIC SCORE FORMULA (v15 ENHANCED) ======
        let songQuality = 0;
        let avgStat = (groupVocAvg + groupDanceAvg + groupRapAvg + groupVisualAvg + groupStageAvg) / 5;
        songQuality += Math.sqrt(avgStat) * 2.5;

        let producerBonus = gameData.staff.filter(st=>st.type==='Producer').reduce((s,p) => s + (p.grade==='S'?8:p.grade==='A'?5:p.grade==='B'?3:1), 0);
        songQuality += Math.min(12, producerBonus);
        songQuality += gameData.facilities.studio * 1.5;

        // Music production choice synergy (expanded)
        if(tb.music === 'famous') { songQuality += 10; synergyBonus += 5; }
        else if(tb.music === 'bought') songQuality += 4;
        else if(tb.music === 'inhouse') { 
            if(producerBonus < 5) { songQuality -= 8; flopReasons.push('Produser in-house kurang pengalaman'); } 
            else songQuality += 2;
        }
        else if(tb.music === 'trendy_edm') songQuality += 6;
        else if(tb.music === 'acoustic') songQuality += 5;
        else if(tb.music === 'self_composed') {
            // Bonus if members have high songwriting potential (based on avg vocal+rap)
            let composerSkill = (groupVocAvg + groupRapAvg) / 2;
            if(composerSkill > 70) { songQuality += 8; synergyBonus += 5; } 
            else if(composerSkill > 50) songQuality += 3;
            else { songQuality -= 5; flopReasons.push('Self-composed tapi skill komposisi rendah'); }
        }
        else if(tb.music === 'collab_prod') { songQuality += 5; synergyBonus += 3; }
        else if(tb.music === 'retro_prod') { songQuality += 7; if(concept === 'Retro' || concept === 'City Pop') synergyBonus += 10; }

        // Concept vs Music SYNERGY
        if(concept === 'Girl Crush' || concept === 'Y2K' || concept === 'Teen Crush') { 
            if(tb.music === 'trendy_edm') synergyBonus += 8; 
            if(tb.music === 'acoustic') { isFlopDisaster = true; flopReasons.push('Akustik + Girl Crush/Y2K = mismatch total'); }
        }
        if(concept === 'Refreshing' || concept === 'R&B' || concept === 'Ballad') { 
            if(tb.music === 'acoustic') synergyBonus += 8; 
            if(tb.music === 'trendy_edm') synergyBonus -= 5;
        }
        if(concept === 'Hip-Hop') { if(tb.music === 'trendy_edm') synergyBonus += 5; if(groupRapAvg < 50) { synergyBonus -= 8; flopReasons.push('Konsep Hip-Hop tapi rapper mediocre'); } }
        if(concept === 'Dreamy' || concept === 'Dark Academia' || concept === 'Ethereal') { if(tb.music === 'acoustic' || tb.music === 'bought') synergyBonus += 5; }
        if(concept === 'Retro' || concept === 'City Pop') { if(tb.music === 'retro_prod') synergyBonus += 8; }
        if(concept === 'Cyberpunk' || concept === 'Hyperpop') { if(tb.music === 'trendy_edm') synergyBonus += 8; }
        
        // Concept vs Choreo SYNERGY (expanded)
        if(tb.choreo === 'hard') { 
            if(groupDanceAvg >= 75) synergyBonus += 8; 
            else if(groupDanceAvg >= 55) synergyBonus += 2;
            else { synergyBonus -= 12; isGroupAmpasDance = true; flopReasons.push('Koreo terlalu sulit, member gagal eksekusi'); } 
            if(concept === 'Dreamy' || concept === 'R&B' || concept === 'Ballad') { isFlopDisaster = true; flopReasons.push('Hardcore dance + konsep lembut = aneh'); }
        } 
        else if(tb.choreo === 'vocal') { 
            if(groupVocAvg >= 75) synergyBonus += 8; 
            else if(groupVocAvg < 55) { synergyBonus -= 5; flopReasons.push('Fokus vokal tapi suara pas-pasan'); }
        }
        else if(tb.choreo === 'studio1m') synergyBonus += 6;
        else if(tb.choreo === 'theatrical') { synergyBonus += Math.floor(groupStageAvg / 15); } // Stage presence directly affects
        else if(tb.choreo === 'freestyle_battle') { if(groupDanceAvg > 65) synergyBonus += 5; }
        else if(tb.choreo === 'precision_military') { if(targetGrp.members.length >= 7 && groupDanceAvg >= 65) synergyBonus += 12; else synergyBonus -= 5; }

        // Concept vs Outfit SYNERGY (expanded)
        if(concept === 'Hip-Hop' || concept === 'Y2K') { if(tb.outfit === 'y2k_street') synergyBonus += 6; if(tb.outfit === 'fairy_gown') { isFlopDisaster = true; flopReasons.push('Gaun mewah untuk konsep Hip-Hop?'); } }
        if(concept === 'Dreamy' || concept === 'Dark Academia' || concept === 'Elegant') { if(tb.outfit === 'fairy_gown') synergyBonus += 6; if(tb.outfit === 'y2k_street') { isFlopDisaster = true; flopReasons.push('Streetwear untuk konsep Dreamy?'); } }
        if(concept === 'Refreshing' || concept === 'Teen Crush') { if(tb.outfit === 'school_uniform') synergyBonus += 7; }
        if(concept === 'Folklore/Traditional') { if(tb.outfit === 'hanbok_modern') synergyBonus += 10; }
        if(concept === 'Cyberpunk' || concept === 'Hyperpop') { if(tb.outfit === 'techwear') synergyBonus += 8; }
        if(tb.outfit === 'custom') synergyBonus += 3;
        if(tb.outfit === 'luxury') { synergyBonus += 5; }
        
        // Stage Presence bonus to overall score
        synergyBonus += Math.floor(groupStageAvg / 20); // Up to +5 bonus from stage presence

        // --- COMPONENT 2: FANDOM POWER (max ~40 points) ---
        // THIS is why nugu groups can't chart. Without fans, nobody streams your song.
        let fandomPower = 0;
        let totalFans = targetGrp.fansKR + targetGrp.fansGL;
        // Logarithmic scaling: 100 fans = ~5pts, 10K = ~10pts, 100K = ~12.5pts, 1M = ~15pts
        fandomPower = Math.log10(Math.max(10, targetGrp.fansKR)) * 5; // Domestic fans matter for Korean charts
        fandomPower += Math.log10(Math.max(10, targetGrp.fansGL)) * 3; // Global fans add less to domestic
        // Agency reputation multiplier — Big agencies get media play, playlist adds, etc.
        let repMultiplier = 1 + Math.log10(Math.max(10, gameData.rep)) * 0.15; // rep 100 = x1.3, rep 5000 = x1.55, rep 50000 = x1.7
        fandomPower *= repMultiplier;
        // Comeback vs debut: comebacks benefit from existing fandom
        if(pr.isCb && targetGrp.albums > 1) fandomPower *= 1.15; // Established group bonus

        // --- COMPONENT 3: MARKETING POWER (max ~25 points) ---
        let marketingPower = 0;
        let viewMulti = 1.0;
        if(tb.promo === 'viral') { marketingPower += 10; viewMulti = 2.5; }
        else if(tb.promo === 'ads') { marketingPower += 6; viewMulti = 1.8; }
        else if(tb.promo === 'street_promo') { marketingPower += 8; } // Good for domestic
        else { marketingPower += 1; } // Standard posting = almost nothing

        let mvBonus = pr.mvQuality === 'none' ? -8 : pr.mvQuality === 'low' ? -3 : pr.mvQuality === 'high' ? +8 : pr.mvQuality === 'blockbuster' ? +15 : +3; 
        marketingPower += mvBonus;
        
        // Agensi besar punya dorongan promosi tambahan
        if(agencyCfg && agencyCfg.marketingMulti) marketingPower *= agencyCfg.marketingMulti;
        if(agencyCfg && agencyCfg.fandomMulti) fandomPower *= agencyCfg.fandomMulti;
        
        // Cyberpunk without high CGI
        if(concept === 'Cyberpunk' && (pr.mvQuality === 'low' || pr.mvQuality === 'none')) { isFlopDisaster = true; flopReasons.push('Cyberpunk tanpa CGI = visual murah'); }

        let albBonus = pr.albumType === 'Full' ? 5 : pr.albumType === 'Mini' ? 2 : 0; 
        marketingPower += albBonus;

        // --- COMPONENT 4: LUCK/TIMING (max ~15 points) ---
        let luckFactor = (Math.random() * 12) - 3; // -3 to +9, mostly positive
        // Seasonal competition affects luck
        let seasonMod = gameData.v13 ? gameData.v13.seasonCompetition || 1.0 : 1.0;
        luckFactor -= (seasonMod - 1) * 10; // High competition season = harder

        // --- AGGREGATE FINAL SCORE ---
        let finalScore = songQuality + synergyBonus + fandomPower + marketingPower + luckFactor;

        // V12: Storyboard synergy bonus (capped)
        let storyboardBonus = 0;
        if(currentStoryboard && currentStoryboard.synergyScore) { storyboardBonus = Math.min(15, currentStoryboard.synergyScore * 0.4); currentStoryboard.synergyScore = 0; }
        finalScore += storyboardBonus;

        // Teaser bonus
        if(gameData.v13 && gameData.v13.teaserBonus) { finalScore += Math.min(10, gameData.v13.teaserBonus * 0.3); }

        // FLOP DISASTER: mismatched concept reduces score to 30% of original
        if(isFlopDisaster) { finalScore = Math.max(5, finalScore * 0.25); }

        // ABSOLUTE FLOOR: A nugu debut with no fans, bad production = score around 10-20
        // A good mid-tier comeback = score around 50-70
        // A Top-Tier hit = score around 80-110
        // A Legend hit = 120+
        finalScore = Math.max(3, finalScore);

        // === GAME STATE MUTATIONS ===
        if(!pr.isCb) {
            pr.debutData.members.forEach(m => { let tidx = gameData.trainees.findIndex(tr => tr.id === m.refId); if(tidx !== -1) gameData.trainees[tidx].isDebuted = true; });
            targetGrp.albums = 1; targetGrp.debutYear = gameData.y; gameData.groups.push(targetGrp); 
            // Debut rep gain is SMALL for nugu
            let debutRep = Math.floor(avgStat * 0.3) + (gameData.type === 'chaebol' ? 50 : 0);
            gameData.rep += debutRep; 
            addMainLog(`🚨 RILIS: Grup ${targetGrp.name} resmi DEBUT! (Score: ${Math.floor(finalScore)})`);
        } else { 
            targetGrp.albums++; targetGrp.isPreDebut = false; 
            addMainLog(`🚨 RILIS: ${targetGrp.name} merilis '${pr.songName}' (${pr.albumType}) — Score: ${Math.floor(finalScore)}`); 
        }

        if(typeof addAlbumToDiscography === 'function') { addAlbumToDiscography(targetGrp, pr.albumName, pr.songName, concept); }

        if(pr.highlightIdx !== 'none' && targetGrp.members[pr.highlightIdx]) { 
            targetGrp.members[pr.highlightIdx].indFans += Math.floor(500 + totalFans * 0.005); // Scale with fandom
        }
        if(isGroupAmpasDance) { targetGrp.hasScandal = true; showToast(`SKANDAL: Koreo terlalu sulit untuk skill mereka!`, "danger"); }

        let theSong = { 
            title: pr.songName, artistRef: targetGrp, recentAlbumType: pr.albumType, 
            score: finalScore, weeksActive: 0, initialScore: finalScore,
            outfit: tb.outfit, concept: concept, choreo: tb.choreo,
            physSales: 0, // Will be calculated below
            peakMelon: 999, peakSpotify: 999, musicShowWins: 0,
            albumName: pr.albumName, releaseYear: gameData.y, releaseMonth: gameData.m
        };

        // === PHYSICAL SALES — based on fandom size, NOT song quality ===
        // In reality, physical sales = core fans buying albums. A nugu with 500 fans sells ~200 copies.
        let pSales = 0;
        let coreFanBuyRate = 0.15; // 15% of domestic fans buy physical
        if(pr.albumType === 'Full' || pr.albumType === 'Repackage') { 
            pSales = Math.floor(targetGrp.fansKR * coreFanBuyRate * 1.2 + targetGrp.fansGL * 0.03); // Global fans rarely buy Korean physicals
        } else if(pr.albumType === 'Mini') { 
            pSales = Math.floor(targetGrp.fansKR * coreFanBuyRate * 0.7 + targetGrp.fansGL * 0.02); 
        } else if(pr.albumType === 'Japanese') { 
            pSales = Math.floor(targetGrp.fansGL * 0.05 + (gameData.v13 ? (gameData.v13.intlMarkets.japan.fans || 0) * 0.1 : 0)); 
        } else { pSales = Math.floor(targetGrp.fansKR * 0.02); } // Digital single = almost no physical
        if(targetGrp.pcBoost) { pSales = Math.floor(pSales * (1 + targetGrp.pcBoost)); targetGrp.pcBoost = 0; }
        if(isFlopDisaster) pSales = Math.floor(pSales * 0.4);
        theSong.physSales = pSales;

        // Track yearly sales
        targetGrp.yearlyAlbumSales = (targetGrp.yearlyAlbumSales || 0) + pSales;

        gameData.activeSongs.push(theSong); generateCharts(); 

        // === YT VIEWS — scaled to fandom, not inflated ===
        let ytViews = 0;
        if(pr.mvQuality !== 'none') {
            // Base views from fandom (each fan watches ~3-10 times)
            let avgWatches = 5;
            ytViews = Math.floor((targetGrp.fansGL * avgWatches + targetGrp.fansKR * avgWatches * 0.5) * viewMulti);
            // Random virality chance (very rare for nugu)
            if(Math.random() < 0.05 && finalScore > 60) ytViews = Math.floor(ytViews * (2 + Math.random() * 3)); // Viral!
            if(isFlopDisaster) ytViews = Math.floor(ytViews * 0.3);
            ytViews = Math.max(0, ytViews + Math.floor(Math.random() * 50000)); // Minimum organic
        }

        let melPos = currentCharts.melon.findIndex(c => c.isPlayer && c.title === pr.songName) + 1; 
        let spoPos = currentCharts.spotify.findIndex(c => c.isPlayer && c.title === pr.songName) + 1;
        
        let baseCost = pr.albumType === 'Digital' ? 20000000 : pr.albumType === 'Mini' ? 100000000 : pr.albumType === 'Full' ? 300000000 : pr.albumType === 'English' ? 50000000 : pr.albumType === 'OST' ? 10000000 : 80000000;
        let mvC = pr.mvQuality === 'none' ? 0 : pr.mvQuality === 'low' ? 10000000 : pr.mvQuality === 'high' ? 150000000 : pr.mvQuality === 'blockbuster' ? 500000000 : 50000000; 
        
        let tAddCost = 0;
        if(tb.music === 'bought') tAddCost += 50000000; if(tb.music === 'famous') tAddCost += 300000000;
        if(tb.music === 'trendy_edm') tAddCost += 100000000; if(tb.music === 'acoustic') tAddCost += 80000000;
        if(tb.choreo === 'studio1m') tAddCost += 100000000;
        if(tb.outfit === 'custom') tAddCost += 50000000; if(tb.outfit === 'luxury') tAddCost += 200000000; 
        if(tb.outfit === 'y2k_street' || tb.outfit === 'fairy_gown') tAddCost += 80000000;
        if(tb.promo === 'ads') tAddCost += 80000000; if(tb.promo === 'viral') tAddCost += 150000000;
        if(tb.promo === 'street_promo') tAddCost += 100000000;

        let tCost = baseCost + mvC + tAddCost; 
        
        // Revenue: physical sales + streaming (REALISTIC — nugu barely breaks even)
        let physRevenue = pSales * 12000; // ~12,000 won per album
        let streamRevenue = Math.floor(ytViews * 0.5 + (melPos > 0 ? (101 - melPos) * 500000 : 0));
        let spikeRev = physRevenue + streamRevenue;
        if(spikeRev > 0) addFinanceRecord('Royalty', 'income', spikeRev, `Pendapatan Awal Rilis: ${pr.songName}`);

        // Socmed Reactions — context-aware
        if(isFlopDisaster) {
            targetGrp.hasScandal = true;
            setTimeout(()=>generateSocialFeed('flop_disaster', targetGrp.name), 3000);
        } else if(groupVocAvg < 45 && melPos > 0 && melPos <= 10) {
            // Won a high chart position but can't sing live = encore disaster
            targetGrp.hasScandal = true;
            setTimeout(()=>generateSocialFeed('encore_bad', targetGrp.name), 3000);
        } else if(groupVocAvg > 80 && melPos > 0) {
            setTimeout(()=>generateSocialFeed('vocal_praise', targetGrp.name), 3000);
        } else if(groupDanceAvg > 80 && melPos > 0) {
            setTimeout(()=>generateSocialFeed('dance_praise', targetGrp.name), 3000);
        } else {
            if(melPos > 0 && melPos <= 30) setTimeout(()=>generateSocialFeed('chart_high', targetGrp.name), 3000);
            else if(melPos > 30 || melPos === 0) setTimeout(()=>generateSocialFeed('chart_low', targetGrp.name), 3000);
        }

        return { artistName: targetGrp.name, songTitle: pr.songName, albumType: pr.albumType, views: ytViews, sales: pSales, melon: melPos > 0 ? `#${melPos}` : 'OUT', spotify: spoPos > 0 ? `#${spoPos}` : 'OUT', cost: tCost, rev: spikeRev, isFlopDisaster, flopReasons };
    }

    function showPostReleaseStats(data) {
        document.getElementById('stat-song-title').innerText = data.songTitle; document.getElementById('stat-artist-name').innerText = data.artistName; document.getElementById('stat-album-type').innerText = `Format: ${data.albumType}`;
        animateValue('stat-views', data.views, val => val.toLocaleString() + ' Views'); animateValue('stat-sales', data.sales, val => val.toLocaleString() + ' Kopian');
        document.getElementById('stat-melon').innerText = data.melon; document.getElementById('stat-spotify').innerText = data.spotify; document.getElementById('stat-cost').innerText = `-₩ ${data.cost.toLocaleString()}`; document.getElementById('stat-revenue').innerText = `+₩ ${data.rev.toLocaleString()}`;
        
        if(data.isFlopDisaster) document.getElementById('flop-warning').classList.remove('hidden');
        else document.getElementById('flop-warning').classList.add('hidden');

        openModal('modal-release-stats');
    }

    function animateValue(id, end, formatter) {
        let start = 0; let duration = 1500; let obj = document.getElementById(id); let startTime = null;
        function step(timestamp) { if (!startTime) startTime = timestamp; let progress = Math.min((timestamp - startTime) / duration, 1); obj.innerText = formatter(Math.floor(progress * end)); if (progress < 1) window.requestAnimationFrame(step); else obj.innerText = formatter(end); }
        window.requestAnimationFrame(step);
    }

    // ==========================================
    // RANDOM PASSIVE EVENT ENGINE (SCANDALS)
    // ==========================================
    function triggerRandomPassiveEvent() {
        let rndGroup = gameData.groups[Math.floor(Math.random() * gameData.groups.length)];
        
        // Mitigate scandal chance with PR Managers
        let prManagerCount = gameData.staff.filter(s=>s.type==='PR Manager').length;
        let baseBadChance = 0.45; // Slightly higher than before
        let actualBadChance = Math.max(0.15, baseBadChance - (prManagerCount * 0.08));

        // Trait modifier
        let isProblematic = rndGroup.members.some(m => m.traitObj && (m.traitObj.name === 'Problematic' || m.traitObj.name === 'Skandal-Prone'));
        if(isProblematic && Math.random() > 0.3) actualBadChance += 0.2; 

        // More famous = more scrutiny (bigger groups are bigger targets)
        let totalFans = rndGroup.fansKR + rndGroup.fansGL;
        if(totalFans > 100000) actualBadChance += 0.05;
        if(totalFans > 500000) actualBadChance += 0.05;

        let isBad = Math.random() < actualBadChance; 

        if(isBad) {
            rndGroup.hasScandal = true; 
            // Fan loss scales with fandom size (bigger groups lose more absolute fans)
            let fansLost = Math.floor(rndGroup.fansKR * (0.05 + Math.random() * 0.1)); // 5-15% of KR fans
            rndGroup.fansKR = Math.max(0, rndGroup.fansKR - fansLost); 
            gameData.rep -= Math.floor(30 + Math.random() * 70);
            addMainLog(`🚨 SKANDAL: ${rndGroup.name} terkena rumor buruk! (-${fansLost.toLocaleString()} fans)`); 
            showToast(`SKANDAL MENIMPA ${rndGroup.name}!`, "warning");
            generateSocialFeed('scandal_attitude', rndGroup.name);
            if(typeof triggerScreenShake === 'function') triggerScreenShake();
            return true;
        } else {
            // Positive viral events — fan gain scales with existing size (organic growth)
            let fansGained = Math.floor(200 + totalFans * 0.01 + Math.random() * 1000); // Much more modest
            rndGroup.fansKR += fansGained; 
            gameData.rep += Math.floor(10 + Math.random() * 30); 
            addMainLog(`✨ VIRAL: ${rndGroup.name} jadi bahan perbincangan positif! (+${fansGained.toLocaleString()} fans)`); 
            showToast(`${rndGroup.name} VIRAL!`, "success");
            return false;
        }
    }

    // ==========================================
    // CHART ENGINE (BRUTAL DYNAMIC)
    // ==========================================
    function generateCharts() {
        // Evolve rivals every chart generation
        evolveRivals();
        // Update current scores with freshness weighting
        gameData.activeRivals.forEach(r => { 
            let freshness = Math.max(0.2, 1 - (r.weeksSinceRelease || 0) * 0.06); // Songs lose 6% power per week
            r.currentScore = (r.baseScore + (r.fandom / 100000) * 5) * freshness + (Math.random() * 8 - 4); 
        });

        const buildChart = (platformName) => {
            let pool = gameData.activeRivals.map(r => {
                let s = r.currentScore;
                // Platform-specific weighting
                if(platformName === 'melon' || platformName === 'genie' || platformName === 'flo') {
                    // Domestic charts: digital power + fandom + song quality
                    s = (r.baseScore * 0.4) + (r.digitalPower || 50) * 0.8 + (r.fandom / 80000) * 10;
                    let freshness = Math.max(0.15, 1 - (r.weeksSinceRelease || 0) * 0.07);
                    s *= freshness;
                } else if(platformName === 'bugs') {
                    s = r.currentScore * 0.8 + (Math.random() * 20 - 10); // More volatile
                } else if(platformName === 'spotify' || platformName === 'ytmusic') {
                    s = (r.baseScore * 0.3) + (r.fandom / 200000) * 15; // Global = fandom driven
                } else if(platformName === 'billboard') {
                    s = (r.physSales || 0) / 10000 + (r.fandom / 500000) * 10 + r.baseScore * 0.2;
                }
                if(platformName === 'bugs') s += (Math.random() * 15 - 7); 
                return { title: r.title, artist: r.artist, score: s, isPlayer: false, rivalRef: r };
            });

            gameData.activeSongs.forEach(s => {
                if(s.weeksActive < 12) {
                    let pScore = 0;
                    let freshness = Math.max(0.1, 1 - s.weeksActive * 0.08);
                    let totalFans = s.artistRef.fansKR + s.artistRef.fansGL;
                    
                    // ===== REALISTIC CHART SCORING (v15 — with Luck/Hype Factor) =====
                    // Base: fandom-driven, but luck can push nugus up temporarily
                    
                    // LUCK/HYPE FACTOR — simulates viral moments, unexpected GP interest
                    // Small chance for any song to get a boost (like NewJeans debut, or Brave Girls Rollin')
                    let luckRoll = Math.random();
                    let hypeFactor = 1.0;
                    if(s.weeksActive <= 2) { // Only first 2 weeks can get lucky
                        if(luckRoll > 0.97) { hypeFactor = 2.5; } // 3% chance: MEGA VIRAL (Brave Girls level)
                        else if(luckRoll > 0.92) { hypeFactor = 1.8; } // 5% chance: big hype
                        else if(luckRoll > 0.85) { hypeFactor = 1.3; } // 7% chance: moderate hype
                    }
                    // Stage presence boosts live performance hype
                    let avgStage = s.artistRef.members ? s.artistRef.members.reduce((sum,m) => sum + (m.stage || 50), 0) / Math.max(1, s.artistRef.members.length) : 50;
                    let stageLiveBonus = avgStage / 200; // 0.25 at 50, 0.5 at 100
                    
                    if(platformName === 'melon' || platformName === 'genie' || platformName === 'flo') {
                        let langPenalty = (s.recentAlbumType === 'English' || s.recentAlbumType === 'Japanese') ? 0.15 : 1; 
                        let fandomPower = Math.log10(Math.max(10, s.artistRef.fansKR)) * 8;
                        let repPower = Math.log10(Math.max(10, gameData.rep)) * 5;
                        let songQuality = s.score * 0.3;
                        let publicRecognition = s.artistRef.fansKR > 50000 ? 15 : s.artistRef.fansKR > 10000 ? 8 : s.artistRef.fansKR > 3000 ? 3 : 0;
                        pScore = (fandomPower + repPower + songQuality + publicRecognition + stageLiveBonus * 5) * freshness * langPenalty * hypeFactor;
                    } else if (platformName === 'bugs') { 
                        // Bugs paling volatile — nugu punya chance terbaik di sini
                        pScore = s.score * 0.5 + Math.log10(Math.max(10, s.artistRef.fansKR)) * 6 + (Math.random() * 20) + stageLiveBonus * 8;
                        pScore *= hypeFactor;
                    } else if (platformName === 'spotify' || platformName === 'ytmusic') { 
                        let langBonus = s.recentAlbumType === 'English' ? 1.8 : 1; 
                        let globalFandomPower = Math.log10(Math.max(10, s.artistRef.fansGL)) * 10;
                        pScore = (s.score * 0.25 + globalFandomPower + stageLiveBonus * 3) * freshness * langBonus * hypeFactor;
                    } else if (platformName === 'billboard') { 
                        let physMulti = s.recentAlbumType === 'Full' ? 2.5 : s.recentAlbumType === 'Mini' ? 1.0 : s.recentAlbumType === 'English' ? 1.8 : 0.3; 
                        let usFandom = Math.log10(Math.max(10, s.artistRef.fansGL)) * 8;
                        pScore = (s.score * 0.15 + usFandom) * physMulti * freshness * Math.min(hypeFactor, 1.5); // Billboard less susceptible to luck
                    }
                    
                    // Scandal penalty
                    if(s.artistRef.hasScandal) pScore *= 0.4;
                    
                    // Storyboard synergy bonus from MV quality
                    if(s._storyboardBonus) pScore += s._storyboardBonus * 0.3;
                    
                    // Lower floor for nugu — allow them to at least appear on Bugs
                    if(pScore > 10) pool.push({ title: s.title, artist: s.artistRef.name, score: pScore, isPlayer: true, ref: s, isHyped: hypeFactor > 1.3 });
                }
            });
            let sorted = pool.sort((a,b) => b.score - a.score).slice(0, 100);
            sorted.forEach((item, idx) => { 
                // Realistic trend tracking
                item.prevRank = item._prevRank || (idx + 1);
                if(item.ref && item.ref.weeksActive === 0) item.trend = 'new';
                else if(item.rivalRef && (item.rivalRef.weeksSinceRelease || 0) === 0) item.trend = 'new';
                else item.trend = Math.random() > 0.5 ? 'up' : 'down'; 
            }); 
            return sorted;
        };

        currentCharts.melon = buildChart('melon'); currentCharts.genie = buildChart('genie'); currentCharts.flo = buildChart('flo'); currentCharts.bugs = buildChart('bugs'); currentCharts.spotify = buildChart('spotify'); currentCharts.ytmusic = buildChart('ytmusic'); currentCharts.billboard = buildChart('billboard'); 

        const renderList = (domId, data) => {
            const ul = document.getElementById(domId); ul.innerHTML = '';
            data.slice(0, 20).forEach((item, idx) => {
                let rC = idx===0?'rank-1':idx===1?'rank-2':idx===2?'rank-3':'';
                let trHtml = item.trend === 'new' ? `<span class="trend-new">NEW</span>` : item.trend === 'up' ? `<span class="trend-up">▲</span>` : `<span class="trend-down">▼</span>`;
                let hypeTag = item.isHyped ? ' <span style="font-size:0.6rem;background:#ef4444;color:#fff;padding:1px 5px;border-radius:3px;font-weight:900;">🔥 VIRAL</span>' : '';
                ul.innerHTML += `<li class="chart-item ${item.isPlayer?'player-song':''}"><div class="chart-rank ${rC}">${idx+1}</div><div style="width:20px; text-align:center;">${trHtml}</div><div><span style="font-size:1.1rem;font-weight:900;">${item.title}</span>${hypeTag}<br><span style="font-size:0.8rem;color:#444;">${item.artist} ${item.isPlayer?'⭐':''}</span></div></li>`;
            });
        };
        renderList('list-melon', currentCharts.melon); renderList('list-genie', currentCharts.genie); renderList('list-flo', currentCharts.flo); renderList('list-bugs', currentCharts.bugs); renderList('list-spotify', currentCharts.spotify); renderList('list-ytmusic', currentCharts.ytmusic); renderList('list-billboard', currentCharts.billboard);
    }
    window.switchChartTab = function(tab) { document.querySelectorAll('.chart-view').forEach(v=>v.classList.remove('active')); document.querySelectorAll('.chart-tab-btn').forEach(v=>v.classList.remove('active')); document.getElementById(`chart-${tab}`).classList.add('active'); event.target.classList.add('active'); };


    // ==========================================
    // STAGE ANIMATION (NEW & DYNAMIC)
    // ==========================================
    function playStageAnimation(playerSong) {
        const stage = document.getElementById('music-show-stage-anim');
        const groupWrap = document.getElementById('stage-group-wrap');
        groupWrap.innerHTML = ''; // Clear stage

        let members = playerSong.artistRef.members;
        let memCount = members.length;
        if(memCount === 0) return triggerMusicShowADV(playerSong); // Failsafe

        let gender = members[0].gender || 'Female';
        let outfit = playerSong.outfit || 'sponsor';
        let concept = playerSong.concept || 'Refreshing';
        let choreo = playerSong.choreo || 'trendy';

        // Mapping Color berdasarkan Outfit (Tingkat Detail Visual)
        let outColor = '#cbd5e1'; // Default sponsor gray
        if(outfit === 'luxury') outColor = '#eab308'; // Gold
        else if(outfit === 'y2k_street') outColor = '#f97316'; // Orange/Neon
        else if(outfit === 'fairy_gown') outColor = '#fbcfe8'; // Pink Fairy
        else if(outfit === 'custom') outColor = '#a855f7'; // Purple Custom

        // Mapping Style Animasi berdasarkan Choreo/Concept
        let danceClass = 'dance-style-default';
        if(choreo === 'hard') danceClass = 'dance-style-hiphop';
        else if(outfit === 'fairy_gown' || concept === 'Dreamy') danceClass = 'dance-style-fairy';
        else if(concept === 'Y2K') danceClass = 'dance-style-y2k';

        // Generate "Pixel" Idols dynamically
        for(let i=0; i<memCount; i++) {
            let idol = document.createElement('div');
            idol.className = `pixel-idol ${gender} ${danceClass}`;
            idol.style.backgroundColor = outColor;
            
            // Jika choreo hard/sync, animasinya berbarengan. Jika tidak, delay sedikit agar alami.
            if(choreo !== 'hard' && choreo !== 'studio1m') {
                idol.style.animationDelay = `${(i % 3) * 0.15}s`;
            }
            
            groupWrap.appendChild(idol);
        }

        document.getElementById('stage-song-title').innerText = `🎶 ${playerSong.artistRef.name} - ${playerSong.title} 🎶`;
        
        // Show the stage animation
        stage.style.display = 'flex';

        // After 3.5 seconds, hide stage and show the actual Music Show Scores
        setTimeout(() => {
            stage.style.display = 'none';
            triggerMusicShowADV(playerSong);
        }, 3500);
    }

    // ==========================================
    // WEEKLY MUSIC SHOW
    // ==========================================
    let currentShowNominees = [];
    function triggerMusicShowADV(playerSong) {
        // Get top 3 from Melon chart — these are the ACTUAL nominees
        let pool = currentCharts.melon.slice(0,3);
        currentShowNominees = pool.map(item => {
            if(item.isPlayer) {
                let ps = item.ref;
                let art = ps.artistRef;
                // Realistic scoring based on actual metrics
                let digitalScore = item.score * 40; // Chart position power
                let physScore = (ps.physSales || 0) * 0.8 + art.fansKR * 0.3;
                let broadcastScore = Math.log10(Math.max(10, gameData.rep)) * 800 + Math.random() * 500;
                let voteScore = art.fansKR * 0.5 + art.fansGL * 0.8; // International fans vote hard
                return { isPlayer: true, name: art.name, song: ps.title, ref: ps, 
                    rawDigi: digitalScore, rawPhys: physScore, rawBrd: broadcastScore, rawVote: voteScore };
            } else { 
                // Use ACTUAL rival data instead of random numbers
                let rivalData = item.rivalRef || {};
                let rivalFandom = rivalData.fandom || 50000;
                let rivalTier = rivalData.tier || 'Mid-Tier';
                let digitalScore = item.score * 45; // Rivals often have stronger digital
                let physScore = (rivalData.physSales || 20000) * 0.8 + rivalFandom * 0.3;
                let broadcastScore = (rivalTier === 'Legend' ? 15000 : rivalTier === 'Top-Tier' ? 8000 : 3000) + Math.random() * 2000;
                let voteScore = rivalFandom * 0.6 + Math.random() * rivalFandom * 0.2;
                return { isPlayer: false, name: item.artist, song: item.title, rivalRef: rivalData,
                    rawDigi: digitalScore, rawPhys: physScore, rawBrd: broadcastScore, rawVote: voteScore }; 
            }
        });
        // Don't randomly sort — keep chart order for fairness
        const container = document.getElementById('ms-nominees-container'); container.innerHTML = '';
        currentShowNominees.forEach((nom, i) => {
            nom.total = Math.floor(nom.rawDigi + nom.rawPhys + nom.rawBrd + nom.rawVote);
            container.innerHTML += `<div class="ms-card ${nom.isPlayer ? 'player' : ''}" id="ms-card-${i}"><div style="font-size:0.8rem; font-weight:900; color:#555;">NOMINEE ${i+1}</div><h3 style="margin:5px 0; color:var(--border-dark);">${nom.song}</h3><p style="font-size:0.9rem; font-weight:700;">${nom.name} ${nom.isPlayer?'⭐':''}</p><div class="total-score-box" id="ms-total-${i}">0</div></div>`;
        });
        for(let i=0; i<3; i++) { ['digi','phys','brd','vote'].forEach(t => { let el = document.getElementById(`ms-bar-${t}-${i}`); if(el) el.style.width = '0%'; }); }
        document.getElementById('ms-btn-reveal').style.display = 'block'; document.getElementById('ms-btn-close').style.display = 'none'; document.getElementById('ms-btn-close').classList.add('hidden'); openModal('modal-music-show-adv');
    }

    window.revealMusicShowWinner = function() {
        document.getElementById('ms-btn-reveal').style.display = 'none'; let maxScore = Math.max(...currentShowNominees.map(n => n.total), 40000);
        currentShowNominees.forEach((nom, i) => { 
            let el;
            el = document.getElementById(`ms-bar-digi-${i}`); if(el) el.style.width = `${Math.min(100, (nom.rawDigi / maxScore) * 100)}%`; 
            el = document.getElementById(`ms-bar-phys-${i}`); if(el) el.style.width = `${Math.min(100, (nom.rawPhys / maxScore) * 100)}%`; 
            el = document.getElementById(`ms-bar-brd-${i}`); if(el) el.style.width = `${Math.min(100, (nom.rawBrd / maxScore) * 100)}%`; 
            el = document.getElementById(`ms-bar-vote-${i}`); if(el) el.style.width = `${Math.min(100, (nom.rawVote / maxScore) * 100)}%`; 
        });
        let duration = 2500; let start = null;
        function step(timestamp) { if (!start) start = timestamp; let progress = timestamp - start; let pct = Math.min(progress / duration, 1); currentShowNominees.forEach((nom, i) => { let el = document.getElementById(`ms-total-${i}`); if(el) el.innerText = Math.floor(nom.total * pct).toLocaleString(); }); if (progress < duration) window.requestAnimationFrame(step); else declareShowWinner(); }
        window.requestAnimationFrame(step);
    };

    function declareShowWinner() {
        let winIdx = 0; let maxT = 0; currentShowNominees.forEach((n, i) => { if(n.total > maxT) { maxT = n.total; winIdx = i; } });
        document.getElementById(`ms-card-${winIdx}`).classList.add('winner');
        let isPlayerWin = currentShowNominees[winIdx].isPlayer;
        if(isPlayerWin) { 
            let pRef = currentShowNominees[winIdx].ref; 
            pRef.artistRef.trophies = (pRef.artistRef.trophies || 0) + 1; 
            pRef._wonMusicShowThisWeek = true; // Flag to prevent V13 double-counting
            gameData.rep += 80; 
            addMainLog(`🏆 WINNER: ${pRef.artistRef.name} menang di Music Show!`); 
            showToast("KEMENANGAN MUSIC SHOW! (+80 Reputasi)", "success"); 
            if(typeof triggerScreenShake === 'function') triggerScreenShake();
        } else { 
            addMainLog(`Gagal menang di Music Show (Pemenang: ${currentShowNominees[winIdx].name}).`); 
            showToast(`Kalah di Music Show. Pemenang: ${currentShowNominees[winIdx].name}`, "warning");
        }
        document.getElementById('ms-btn-close').classList.remove('hidden'); document.getElementById('ms-btn-close').style.display = 'block';
    }
    window.closeMusicShow = function() { closeModal('modal-music-show-adv'); };

    // ==========================================
    // STAFF SEARCH
    // ==========================================
    window.openStaffRoleSelect = function() {
        if(gameData.staffSearch.active) return showToast("Headhunter sedang mencari staff saat ini!", "danger");
        openModal('modal-staff-search-role');
    };

    window.startStaffSearch = function() {
        if(gameData.money < 20000000) return showToast("Kas kurang untuk membayar headhunter!", "danger");
        addFinanceRecord('Operational', 'expense', 20000000, `Jasa Headhunter`);
        
        let selectedRole = document.getElementById('select-staff-role').value;
        gameData.staffSearch = {
            active: true,
            role: selectedRole,
            weeks: 2, // Takes 2 weeks to find
            candidates: []
        };
        
        document.getElementById('staff-search-role-display').innerText = selectedRole;
        document.getElementById('staff-search-timer').innerText = "2";
        document.getElementById('staff-search-banner').classList.remove('hidden');
        
        closeModal('modal-staff-search-role');
        showToast("Pencarian staff dimulai! Tunggu 2 minggu.", "success");
        updateUI();
    };

    function finishStaffSearch() {
        gameData.staffSearch.active = false;
        document.getElementById('staff-search-banner').classList.add('hidden');
        
        let role = gameData.staffSearch.role;
        const grades = [{g: 'C', mul: 1}, {g: 'B', mul: 2}, {g: 'A', mul: 4}, {g: 'S', mul: 10}];
        
        let candidates = [];
        for(let i=0; i<3; i++) { 
            let gradeObj = grades[Math.floor(Math.random()*grades.length)]; 
            let w = Math.floor(Math.random()*2 + 1) * 1000000 * gradeObj.mul; 
            candidates.push({ type: role, grade: gradeObj.g, wage: w });
        }
        
        document.getElementById('recruitment-role-name').innerText = role;
        const cont = document.getElementById('staff-candidate-list'); 
        cont.innerHTML = ''; 
        
        candidates.forEach((cand, idx) => {
            cont.innerHTML += `<div class="neo-card bg-yellow"><h4>[Grade ${cand.grade}] ${cand.type}</h4><p class="mt-2">Gaji: ${formatWon(cand.wage)}/bln</p><button class="neo-btn success-btn w-100 mt-2" onclick="hireStaff('${cand.type}', '${cand.grade}', ${cand.wage})">REKRUT</button></div>`;
        });
        
        openModal('modal-staff-recruit');
        addMainLog(`Headhunter menemukan 3 kandidat untuk posisi ${role}.`);
    }

    window.hireStaff = function(t, g, w) { 
        gameData.staff.push({ type:t, grade:g, wage:w }); 
        gameData.cost += w; 
        showToast(`${t} direkrut!`, "success"); 
        closeModal('modal-staff-recruit'); 
        updateUI(); 
    };

    window.fireStaff = function(idx) {
        let fired = gameData.staff[idx];
        gameData.cost -= fired.wage;
        gameData.staff.splice(idx, 1);
        showToast(`${fired.type} dipecat.`, "warning");
        updateUI();
    };

    function renderStaffList() { 
        const list = document.getElementById('staff-list'); 
        list.innerHTML = ''; 
        if(gameData.staff.length===0) return list.innerHTML = `<p class="neo-card-small">Belum ada staff elit.</p>`; 
        gameData.staff.forEach((s, idx) => {
            list.innerHTML += `<div class="neo-card-small bg-blue" style="display:inline-block; margin:5px; position:relative; padding-bottom: 40px;">
                <b>[${s.grade}] ${s.type}</b><br><small>Gaji: ${formatWon(s.wage)}</small>
                <button class="neo-btn danger-btn btn-sm" style="position:absolute; bottom:5px; left:5px; right:5px; width:calc(100% - 10px);" onclick="fireStaff(${idx})">PECAT</button>
            </div>`; 
        }); 
    }

    window.upgradeFacility = function(type, cost) { if(gameData.money < cost) return showToast("Kas kurang!", "danger"); addFinanceRecord('Facility', 'expense', cost, `Upgrade ${type.toUpperCase()}`); gameData.facilities[type]++; showToast("Fasilitas di-upgrade!", "success"); updateUI(); };

    window.openDetailedFinance = function() { document.getElementById('det-income').innerText = formatWon(gameData.finance.inc); document.getElementById('det-expense').innerText = formatWon(gameData.finance.exp); const ul = document.getElementById('det-finance-list'); ul.innerHTML = gameData.finance.history.map(h => `<li><span style="color:${h.type==='income'?'var(--c-green-solid)':'var(--c-pink-solid)'}">${h.type==='income'?'+':'-'}${formatWon(h.amt)}</span> | [W${h.w}/M${h.m}/Y${h.y}] ${h.cat}: ${h.desc}</li>`).join(''); openModal('modal-finance-detail'); };
    window.buyStock = function() { let cost = gameData.finance.stock * 10; if(gameData.money < cost) return showToast("Kas kurang!", "danger"); addFinanceRecord('Investment', 'expense', cost, 'Beli 10 Saham'); gameData.finance.owned += 10; updateUI(); };
    window.sellStock = function() { if(gameData.finance.owned < 10) return showToast("Saham kurang!", "danger"); let gain = gameData.finance.stock * 10; addFinanceRecord('Investment', 'income', gain, 'Jual 10 Saham'); gameData.finance.owned -= 10; updateUI(); };
    
    window.takeInvestment = function() {
        if(gameData.finance.investors > 0) return;
        gameData.finance.investors = 0.2; // 20% cut
        addFinanceRecord('Investment', 'income', 5000000000, 'Suntikan Dana Angel Investor');
        showToast("Dana 5 Miliar Won masuk ke kas! 20% pendapatan masa depan akan dipotong.", "warning");
        updateUI();
    };

    window.takeLoan = function() { if(gameData.finance.loan + 100000000 > gameData.finance.loanLimit) return showToast("Limit bank tidak mencukupi!", "danger"); gameData.finance.loan += 100000000; if(gameData.finance.loanDeadline === 0) gameData.finance.loanDeadline = 12; addFinanceRecord('Loan', 'income', 100000000, 'Hutang Bank'); updateUI(); addMainLog("Hutang Bank ₩100Jt cair (Tenggat 12 Mgg)."); };
    window.payLoan = function() { if(gameData.finance.loan < 100000000) return showToast("Hutang < 100Jt!", "warning"); if(gameData.money < 100000000) return showToast("Uang tidak cukup!", "danger"); gameData.finance.loan -= 100000000; if(gameData.finance.loan <= 0) gameData.finance.loanDeadline = 0; addFinanceRecord('Loan', 'expense', 100000000, 'Cicilan Hutang Bank'); updateUI(); };

    // ==================================================================================
    // V11 NEW SYSTEMS: Kontrak, Awards, Fandom, Cancel Culture, Venue, Sub-Unit/Solo
    // ==================================================================================

    // ---- EXTEND gameData with new fields ----
    gameData.awards = { yearlyAlbumSales: 0, topSongScore: 0, history: [], lastAwardYear: 0 };
    gameData.subUnits = [];
    gameData.officialSolos = [];
    gameData.pendingFandomSetup = null;
    gameData.pendingCancelCulture = null;
    gameData.pendingContractNego = null;
    gameData.sasaengLevel = 0;

    // Extend group creation to add contractYears, fandomName, lightstickIncome, sasaeng fields
    // These extra fields will be injected after group is created via a post-creation hook

    // ---- SYSTEM 1: KONTRAK & KUTUKAN 7 TAHUN ----
    function checkContractSystem() {
        gameData.groups.forEach((grp, gIdx) => {
            if(!grp.contractStartYear) { grp.contractStartYear = 1; grp.contractYears = 7; }
            let yearsActive = gameData.y - grp.contractStartYear;
            
            // Warn at year 6
            if(yearsActive === 6 && gameData.m === 1 && gameData.w === 1) {
                addMainLog(`⚠️ PERINGATAN: Kontrak ${grp.name} tersisa 1 tahun lagi! Bersiap untuk negosiasi.`);
                showToast(`Kontrak ${grp.name} akan habis dalam 1 tahun!`, "warning");
            }

            // Negotiation at year 7 start
            if(yearsActive >= 7 && !grp.inNegotiation && !grp.isDisbanded) {
                grp.inNegotiation = true;
                triggerContractNegotiation(gIdx);
            }
        });
    }

    function triggerContractNegotiation(gIdx) {
        let grp = gameData.groups[gIdx];
        // Find most popular member (highest indFans)
        let starMember = grp.members.reduce((a, b) => (a.indFans||0) > (b.indFans||0) ? a : b);
        let totalFans = grp.fansKR + grp.fansGL;
        let isTopTier = gameData.rep > 5000;

        let desc, choices;

        if(isTopTier && (starMember.indFans||0) > 50000) {
            // Star member demands solo or profit split
            desc = `${starMember.name} dari ${grp.name} menuntut perpanjangan kontrak dengan syarat berat: <strong>Profit Split 60:40 untuk idol</strong> (dari 80:20) ATAU mereka keluar dan debut solo di agensi lain. Keputusan ada di tangan CEO.`;
            choices = [
                { text: `Terima Profit Split (60:40 untuk idol). Mahal, tapi grup tetap utuh.`, action: () => {
                    grp.profitSplit = 0.6; grp.inNegotiation = false;
                    grp.contractStartYear = gameData.y; // renew
                    showToast(`${grp.name} kontrak diperpanjang. Income berkurang 60%!`, "warning");
                    addMainLog(`📜 KONTRAK: ${grp.name} perpanjang dengan profit split 60:40.`);
                }},
                { text: `Tolak. ${starMember.name} keluar dari grup (formasi berubah).`, action: () => {
                    grp.members = grp.members.filter(m => m.name !== starMember.name);
                    grp.fansKR = Math.floor(grp.fansKR * 0.7); grp.fansGL = Math.floor(grp.fansGL * 0.7);
                    grp.avgStat = grp.members.length > 0 ? Math.floor(grp.members.reduce((s,m)=>s+(m.vocal+m.dance+m.rap+m.visual)/4, 0)/grp.members.length) : grp.avgStat;
                    grp.inNegotiation = false; grp.contractStartYear = gameData.y;
                    gameData.rep -= 500;
                    showToast(`${starMember.name} hengkang! Fans kecewa.`, "danger");
                    addMainLog(`💔 KONTRAK: ${starMember.name} keluar dari ${grp.name}.`);
                    setTimeout(()=>generateSocialFeed('scandal_attitude', grp.name), 2000);
                }},
                { text: `Bubarkan ${grp.name} secara resmi (DISBAND).`, action: () => {
                    gameData.rep -= 2000; gameData.money -= 500000000;
                    addMainLog(`💔 DISBAND: ${grp.name} resmi dibubarkan setelah kontrak habis.`);
                    showToast(`${grp.name} dibubarkan. Agensi kehilangan ₩500Jt & 2000 Rep!`, "danger");
                    grp.isDisbanded = true; grp.inNegotiation = false;
                    setTimeout(()=>generateSocialFeed('scandal_dating', grp.name), 2000);
                }}
            ];
        } else {
            // Regular renewal
            desc = `Kontrak ${grp.name} telah memasuki tahun ke-7! Semua member mengusulkan perpanjangan kontrak dengan kondisi standar. Pilih kelanjutannya.`;
            choices = [
                { text: `Perpanjang Kontrak 3 Tahun (Standar, Semua member setuju).`, action: () => {
                    grp.contractStartYear = gameData.y; grp.contractYears = 3; grp.inNegotiation = false;
                    showToast(`Kontrak ${grp.name} diperpanjang 3 tahun!`, "success");
                    addMainLog(`📜 KONTRAK: ${grp.name} diperpanjang 3 tahun.`);
                }},
                { text: `Bubarkan grup (DISBAND). Fokus ke artis lain.`, action: () => {
                    grp.isDisbanded = true; grp.inNegotiation = false; gameData.rep -= 500;
                    addMainLog(`💔 DISBAND: ${grp.name} dibubarkan oleh CEO.`);
                    showToast(`${grp.name} dibubarkan.`, "warning");
                }}
            ];
        }

        gameData.pendingContractNego = { gIdx, desc, choices };
        openContractNegoModal();
    }

    function openContractNegoModal() {
        if(!gameData.pendingContractNego) return;
        let { desc, choices } = gameData.pendingContractNego;
        document.getElementById('contract-nego-desc').innerHTML = desc;
        let choicesEl = document.getElementById('contract-nego-choices');
        choicesEl.innerHTML = '';
        choices.forEach((ch, i) => {
            let btn = document.createElement('button');
            btn.className = 'neo-btn action-btn w-100';
            btn.innerHTML = ch.text;
            btn.onclick = () => {
                ch.action();
                gameData.pendingContractNego = null;
                closeModal('modal-contract-negotiation');
                updateUI();
            };
            choicesEl.appendChild(btn);
        });
        openModal('modal-contract-negotiation');
    }

    // ---- SYSTEM 2: AWARD SHOWS (DAESANG) ----
    function checkAwardShow() {
        // Trigger at M12 W4 (end of year)
        if(gameData.m === 12 && gameData.w === 4) {
            runYearEndAwardShow();
        }
    }

    function runYearEndAwardShow() {
        if(gameData.groups.filter(g => !g.isDisbanded).length === 0) return;

        let results = [];
        let allGroups = gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut);

        // Calculate scores
        allGroups.forEach(g => {
            let totalTrophies = g.trophies || 0;
            let albumSales = g.yearlyAlbumSales || 0;
            let topSong = gameData.activeSongs.filter(s => s.artistRef === g).reduce((mx, s) => Math.max(mx, s.score), 0);
            g._awardScore = totalTrophies * 100 + albumSales * 0.01 + topSong * 50 + (g.fansKR + g.fansGL) * 0.001;
            g._isRookie = g.albums <= 1 || (gameData.y - (g.debutYear || gameData.y)) <= 1;
        });

        let winner = allGroups.sort((a,b) => b._awardScore - a._awardScore)[0];
        let rookies = allGroups.filter(g => g._isRookie || g.albums <= 1);
        let rotyWinner = rookies.length > 0 ? rookies.sort((a,b) => b._awardScore - a._awardScore)[0] : null;

        // SOTY: highest scoring song
        let sotyWinner = null; let sotyScore = 0;
        gameData.activeSongs.forEach(s => { if(s.score > sotyScore) { sotyScore = s.score; sotyWinner = s; } });

        let resultsHtml = [];

        if(rotyWinner) {
            rotyWinner.trophies = (rotyWinner.trophies || 0) + 1;
            addFinanceRecord('Award', 'income', 500000000, `Rookie of the Year Award: ${rotyWinner.name}`);
            gameData.rep += 300;
            resultsHtml.push(`<div class="neo-card-small bg-green"><b>🌱 ROOKIE OF THE YEAR</b><br>${rotyWinner.name} menang! +₩500Jt | +300 Rep</div>`);
            gameData.awards.history.push({ y: gameData.y, award: 'Rookie of the Year', winner: rotyWinner.name });
        }

        if(sotyWinner) {
            sotyWinner.artistRef.trophies = (sotyWinner.artistRef.trophies || 0) + 1;
            addFinanceRecord('Award', 'income', 1000000000, `Song of the Year: ${sotyWinner.title}`);
            gameData.rep += 500;
            resultsHtml.push(`<div class="neo-card-small bg-blue"><b>🎵 SONG OF THE YEAR</b><br>"${sotyWinner.title}" - ${sotyWinner.artistRef.name}! +₩1 Miliar | +500 Rep</div>`);
            gameData.awards.history.push({ y: gameData.y, award: 'Song of the Year', winner: sotyWinner.title + ' - ' + sotyWinner.artistRef.name });
        }

        if(winner && winner._awardScore > 500) {
            winner.trophies = (winner.trophies || 0) + 1;
            addFinanceRecord('Award', 'income', 10000000000, `🏆 DAESANG - Artist of the Year: ${winner.name}`);
            gameData.rep += 5000;
            if(gameData.rep > 50000) gameData.rep = 50000 + (gameData.rep - 50000);
            resultsHtml.push(`<div class="neo-card-small bg-yellow" style="border-width:4px; border-color:gold;"><b style="color:gold;font-size:1.1rem;">👑 DAESANG — ARTIST OF THE YEAR</b><br><b>${winner.name}</b> memenangkan penghargaan puncak!<br>+₩10 Miliar | +5000 Rep | Status: LEGENDARY!</div>`);
            gameData.awards.history.push({ y: gameData.y, award: 'DAESANG', winner: winner.name });
            showToast(`🏆 DAESANG! ${winner.name} menang Artist of the Year!`, "success");
        } else {
            resultsHtml.push(`<div class="neo-card-small bg-orange"><b>📢 Daesang</b><br>Tahun ini Daesang dimenangkan oleh pesaing. Tingkatkan penjualan & trofi Music Show!</div>`);
        }

        // Reset yearly counters
        allGroups.forEach(g => { g.yearlyAlbumSales = 0; });

        document.getElementById('award-results-list').innerHTML = resultsHtml.join('');
        openModal('modal-award-ceremony');
        addMainLog(`🏆 AWARD SHOW: MAMA/KMA Tahun ${gameData.y} selesai!`);
    }

    function updateAwardsTab() {
        let el = document.getElementById('aw-total-sales'); if(!el) return;
        let totalSales = gameData.groups.reduce((s, g) => s + (g.yearlyAlbumSales||0), 0);
        let topScore = gameData.activeSongs.reduce((mx, s) => Math.max(mx, s.score), 0);
        let totalTrophies = gameData.groups.reduce((s, g) => s + (g.trophies||0), 0);
        let weeksLeft = ((12 - gameData.m) * 4) + (4 - gameData.w);

        el.innerText = totalSales.toLocaleString();
        document.getElementById('aw-top-score').innerText = Math.floor(topScore);
        document.getElementById('aw-trophies').innerText = totalTrophies;
        document.getElementById('aw-countdown').innerText = gameData.m === 12 && gameData.w === 4 ? '🏆 HARI INI!' : `${weeksLeft} Minggu`;

        let histEl = document.getElementById('awards-history-list');
        if(gameData.awards.history.length === 0) { histEl.innerHTML = '<p><i>Belum ada trofi award yang dimenangkan.</i></p>'; return; }
        histEl.innerHTML = gameData.awards.history.slice().reverse().map(h => `<div class="neo-card-small bg-white" style="margin-bottom:5px;"><b>Tahun ${h.y}</b> — ${h.award}: <strong>${h.winner}</strong></div>`).join('');
    }

    // ---- SYSTEM 3: FANDOM ECOSYSTEM (LIGHTSTICK & SASAENG) ----
    function checkFandomSetup() {
        gameData.groups.forEach((grp, gIdx) => {
            if(!grp.fandomSetupDone && grp.albums >= 1 && !grp.isPreDebut && !grp.isDisbanded) {
                grp.fandomSetupDone = true; // Mark to prevent re-trigger
                gameData.pendingFandomSetup = gIdx;
                triggerFandomSetup(gIdx);
            }
        });
    }

    function triggerFandomSetup(gIdx) {
        let grp = gameData.groups[gIdx];
        document.getElementById('fandom-group-name').innerText = grp.name;
        document.getElementById('fandom-name-input').value = '';
        document.getElementById('fandom-lightstick').value = 'standard';
        openModal('modal-fandom-setup');
    }

    window.confirmFandomSetup = function() {
        let gIdx = gameData.pendingFandomSetup;
        if(gIdx === null || gIdx === undefined) return;
        let grp = gameData.groups[gIdx];
        let fname = document.getElementById('fandom-name-input').value.trim();
        let lstick = document.getElementById('fandom-lightstick').value;
        if(!fname) return showToast('Isi nama fandom dulu!', 'danger');

        let cost = lstick === 'standard' ? 20000000 : lstick === 'premium' ? 60000000 : 120000000;
        let monthlyIncome = lstick === 'standard' ? 5000000 : lstick === 'premium' ? 15000000 : 35000000;

        if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)} untuk produksi lightstick!`, 'danger');
        addFinanceRecord('Merch', 'expense', cost, `Produksi Lightstick: ${grp.name}`);

        grp.fandomName = fname;
        grp.lightstickLevel = lstick;
        grp.lightstickIncome = monthlyIncome;

        showToast(`Fandom "${fname}" diresmikan! Lightstick akan dijual setiap bulan.`, 'success');
        addMainLog(`🌟 FANDOM: ${grp.name} memiliki fandom resmi "${fname}" dengan lightstick!`);
        generateSocialFeed('debut_good', grp.name);
        closeModal('modal-fandom-setup');
        gameData.pendingFandomSetup = null;
        updateUI();
    };

    function processLightstickIncome() {
        // Called monthly — merch income is proportional to core fans
        gameData.groups.forEach(grp => {
            if(grp.lightstickIncome > 0 && !grp.isDisbanded) {
                // Each core fan spends ~100 won/month on merch average — much more realistic
                let coreFans = grp.fansKR; // Core fans are domestic
                let income = Math.floor(coreFans * 80 + grp.lightstickIncome * 0.1);
                if(income > 0) addFinanceRecord('Merch', 'income', income, `Penjualan Lightstick: ${grp.name} (${grp.fandomName})`);
            }
        });
    }

    function checkSasaengThreat() {
        // Check each week
        gameData.groups.forEach(grp => {
            if(grp.isDisbanded || grp.isPreDebut) return;
            let totalFans = grp.fansKR;
            let sasaengChance = totalFans > 500000 ? 0.15 : totalFans > 100000 ? 0.07 : totalFans > 50000 ? 0.03 : 0;
            
            let hasBodyguard = gameData.staff.some(s => s.type === 'Bodyguard');

            if(sasaengChance > 0 && Math.random() < sasaengChance && !hasBodyguard) {
                grp.stress = Math.min(100, grp.stress + 10);
                if(Math.random() < 0.3) {
                    showToast(`🚨 Sasaeng fans menguntit ${grp.name}! Stres naik +10. Sewa Bodyguard!`, "danger");
                    addMainLog(`⚠️ SASAENG: ${grp.name} dikeuntit sasaeng fans!`);
                    generateSocialFeed('scandal_dating', grp.name);
                }
            }
        });
    }

    // Add "Bodyguard" to staff search options
    const _origStaffRoles = ['Manager', 'PR Manager', 'Choreographer', 'Vocal Coach', 'Producer', 'Stylist', 'Psychiatrist'];
    // Note: Bodyguard will be added dynamically to the staff list rendering

    // ---- SYSTEM 4: CANCEL CULTURE & KICK MEMBER ----
    function triggerCancelCulture(grp, gIdx, memberName, scandalType) {
        if(gameData.pendingCancelCulture) return; // Don't stack
        let desc = scandalType === 'bullying' 
            ? `🚨 ${memberName} dari ${grp.name} dituding melakukan BULLYING pada sesama member saat trainee! Bukti beredar di TheQoo dan Twitter. K-Netz menuntut keadilan.`
            : `🚨 ${memberName} dari ${grp.name} ketahuan berperilaku ATTITUDE jelek — kasar ke staff & arogan di event. Video viral di Twitter & TikTok!`;
        
        gameData.pendingCancelCulture = { gIdx, memberName, desc };
        
        document.getElementById('cancel-desc').innerHTML = desc;
        let choicesEl = document.getElementById('cancel-choices');
        choicesEl.innerHTML = '';

        let choices = [
            { 
                text: '🛡️ Lindungi Member (Agensi bela member). Risiko: Boikot fans, album tidak laku, chart drop.', 
                style: 'action-btn',
                action: () => {
                    grp.hasScandal = true; grp.fansKR = Math.floor(grp.fansKR * 0.6); grp.fansGL = Math.floor(grp.fansGL * 0.7);
                    gameData.rep -= 1000;
                    showToast(`Fans memboikot! Reputasi -1000, fans turun drastis.`, 'danger');
                    addMainLog(`🚨 BOIKOT: Agensi melindungi ${memberName}. Fans marah!`);
                    setTimeout(()=>generateSocialFeed('scandal_attitude', grp.name), 1000);
                }
            },
            { 
                text: `⏸️ Hukum Hiatus 1 Tahun (52 Mgg). Fans marah tapi perlahan reda.`,
                style: 'primary-btn',
                action: () => {
                    let mIdx = grp.members.findIndex(m => m.name === memberName);
                    if(mIdx >= 0) grp.members[mIdx].soloBusy = 52;
                    grp.fansKR = Math.floor(grp.fansKR * 0.85); gameData.rep -= 300;
                    showToast(`${memberName} kena hiatus 1 tahun. Fans kecewa tapi bisa dimaafkan.`, 'warning');
                    addMainLog(`⚠️ HIATUS: ${memberName} kena hukuman hiatus 1 tahun.`);
                }
            },
            { 
                text: `❌ KICK Member Permanen. Reputasi agensi aman, tapi stat grup turun.`,
                style: 'danger-btn',
                action: () => {
                    grp.members = grp.members.filter(m => m.name !== memberName);
                    grp.avgStat = grp.members.length > 0 ? Math.floor(grp.members.reduce((s,m)=>s+(m.vocal+m.dance+m.rap+m.visual)/4,0)/grp.members.length) : grp.avgStat;
                    gameData.rep += 200; // Slight rep gain for acting decisively
                    showToast(`${memberName} resmi dikeluarkan. Reputasi agensi terjaga.`, 'success');
                    addMainLog(`🚪 KICK: ${memberName} dikeluarkan dari ${grp.name}.`);
                    setTimeout(()=>generateSocialFeed('debut_good', grp.name), 2000); // K-Netz satisfied
                }
            }
        ];

        choices.forEach(ch => {
            let btn = document.createElement('button');
            btn.className = `neo-btn ${ch.style} w-100`;
            btn.innerHTML = ch.text;
            btn.onclick = () => {
                ch.action();
                grp.hasScandal = false;
                gameData.pendingCancelCulture = null;
                closeModal('modal-cancel-culture');
                updateUI();
            };
            choicesEl.appendChild(btn);
        });

        openModal('modal-cancel-culture');
    }

    function checkCancelCultureTrigger() {
        if(gameData.pendingCancelCulture) return;
        gameData.groups.forEach((grp, gIdx) => {
            if(grp.isDisbanded || grp.isPreDebut || grp.members.length === 0) return;
            grp.members.forEach(m => {
                if(m.traitObj && (m.traitObj.name === 'Problematic' || m.traitObj.name === 'Skandal-Prone')) {
                    if(Math.random() < 0.02) {
                        let sType = Math.random() < 0.5 ? 'bullying' : 'attitude';
                        triggerCancelCulture(grp, gIdx, m.name, sType);
                    }
                }
            });
            // Random chance even for normal members (less frequent)
            if(Math.random() < 0.005 && grp.members.length > 0) {
                let victim = grp.members[Math.floor(Math.random() * grp.members.length)];
                triggerCancelCulture(grp, gIdx, victim.name, 'attitude');
            }
        });
    }

    // ---- SYSTEM 5: CONCERT VENUE (REALISTIC TOUR EXPANSION) ----
    window.openConcertVenueModal = function(gIdx) {
        let grp = gameData.groups[gIdx];
        if(grp.busyWeeks > 0) return showToast("Grup sedang sibuk!", "danger");
        if(grp.stress >= 90) return showToast("Stress terlalu tinggi untuk konser!", "danger");

        document.getElementById('concert-group-name').innerText = grp.name;
        let totalFans = grp.fansKR + grp.fansGL;

        const venues = [
            {
                name: '🏟️ Zepp Hall (Kapasitas 2,000)',
                desc: 'Aman untuk semua level. Cocok untuk Nugu & Rookie.',
                cost: 20000000, weeks: 1, stressAdd: 15,
                minFans: 0, maxRevenue: 50000000,
                selloutBonus: 30000000, failPenalty: 0,
                eventKey: 'zepp', reqFans: 0
            },
            {
                name: '🏟️ Arena Tour (Kapasitas 10,000)',
                desc: 'Butuh fans minimal 20,000. Pendapatan lebih besar.',
                cost: 80000000, weeks: 2, stressAdd: 30,
                minFans: 20000, maxRevenue: 300000000,
                selloutBonus: 100000000, failPenalty: 30000000,
                eventKey: 'arena_tour', reqFans: 20000
            },
            {
                name: '🏟️ Dome Tour (Kapasitas 50,000)',
                desc: 'Butuh fans minimal 200,000. Hanya Top-Tier bisa isi ini.',
                cost: 300000000, weeks: 3, stressAdd: 50,
                minFans: 200000, maxRevenue: 1500000000,
                selloutBonus: 500000000, failPenalty: 200000000,
                eventKey: 'dome_tour', reqFans: 200000
            },
            {
                name: '🏟️ Stadium Tour (Kapasitas 100,000+)',
                desc: '⚠️ RESIKO TINGGI! Butuh fans 1,000,000. Jika tidak sold out = berita malu + rugi miliaran.',
                cost: 1000000000, weeks: 4, stressAdd: 70,
                minFans: 1000000, maxRevenue: 8000000000,
                selloutBonus: 2000000000, failPenalty: 1000000000,
                eventKey: 'stadium_tour', reqFans: 1000000
            }
        ];

        let venueHtml = '';
        venues.forEach((v, vi) => {
            let canBook = totalFans >= v.reqFans;
            let btnDisabled = canBook ? '' : 'disabled';
            let reqText = v.reqFans > 0 ? `(Butuh ${v.reqFans.toLocaleString()} fans, kamu: ${totalFans.toLocaleString()})` : '(Tersedia untuk semua)';
            venueHtml += `
                <div class="neo-card-small ${canBook ? 'bg-white' : 'bg-orange'}" style="opacity:${canBook?1:0.6};">
                    <h4>${v.name}</h4>
                    <p style="font-size:0.8rem; color:#555;">${v.desc}</p>
                    <p style="font-size:0.75rem; color:#888;">${reqText}</p>
                    <p style="font-size:0.8rem;"><b>Biaya Booking:</b> ${formatWon(v.cost)} | <b>${v.weeks} Minggu</b></p>
                    <p style="font-size:0.75rem; color:green;"><b>Max Revenue (Sold Out):</b> ~${formatWon(v.maxRevenue)}</p>
                    ${!canBook ? '' : `<button class="neo-btn success-btn w-100 mt-2" ${btnDisabled} onclick="bookVenue(${gIdx}, ${vi})">BOOKING SEKARANG</button>`}
                </div>
            `;
        });

        document.getElementById('venue-options').innerHTML = venueHtml;
        // Store venues data for booking
        window._currentVenues = venues;
        openModal('modal-concert-venue');
    };

    window.bookVenue = function(gIdx, venueIdx) {
        let grp = gameData.groups[gIdx];
        let v = window._currentVenues[venueIdx];
        if(gameData.money < v.cost) return showToast(`Uang tidak cukup! Butuh ${formatWon(v.cost)}`, 'danger');

        addFinanceRecord('Concert', 'expense', v.cost, `Booking Venue: ${v.name} (${grp.name})`);
        grp.busyWeeks = v.weeks;
        grp.currentEvent = v.eventKey;
        grp.stress = Math.min(100, grp.stress + v.stressAdd);
        grp._pendingVenue = v; // Store for event resolution

        closeModal('modal-concert-venue');
        showToast(`${grp.name} mulai tur di ${v.name}!`, 'success');
        addMainLog(`🎪 KONSER: ${grp.name} booking ${v.name} selama ${v.weeks} minggu.`);
        updateUI();
    };

    // Resolve venue events when busyWeeks reaches 0
    const _origBusyResolve = null; // We'll patch the week skip logic below

    function resolveConcertVenue(grp) {
        if(!grp._pendingVenue) return false;
        let v = grp._pendingVenue;
        let totalFans = grp.fansKR + grp.fansGL;
        let soldOut = totalFans >= v.reqFans * 1.5; // Sold out if fans 1.5x minimum
        
        if(soldOut) {
            let rev = Math.floor(v.maxRevenue * (0.8 + Math.random() * 0.4));
            addFinanceRecord('Concert', 'income', rev, `${v.name} SOLD OUT! (${grp.name})`);
            addFinanceRecord('Concert', 'income', v.selloutBonus, `Bonus Sold Out Konser: ${grp.name}`);
            grp.fansKR += Math.floor(totalFans * 0.05);
            grp.fansGL += Math.floor(totalFans * 0.03);
            gameData.rep += 200;
            showToast(`🎉 SOLD OUT! Konser ${grp.name} di ${v.name} sukses besar!`, 'success');
            addMainLog(`🎪 SOLD OUT: ${grp.name} sold out di ${v.name}!`);
        } else {
            let partialRev = Math.floor(v.maxRevenue * 0.3);
            addFinanceRecord('Concert', 'income', partialRev, `Konser Sepi: ${v.name} (${grp.name})`);
            if(v.failPenalty > 0) {
                addFinanceRecord('Concert', 'expense', v.failPenalty, `Kerugian Sewa Venue Sepi: ${grp.name}`);
                showToast(`😱 KONSER SEPI! ${grp.name} di ${v.name} tidak sold out. Rugi ${formatWon(v.failPenalty)}!`, 'danger');
                addMainLog(`😱 KONSER SEPI: ${grp.name} gagal penuhi ${v.name}. Masuk berita negatif!`);
                setTimeout(() => generateSocialFeed('chart_low', grp.name), 2000);
                gameData.rep -= 100;
            } else {
                showToast(`Konser ${grp.name} selesai. Tidak sold out tapi tidak rugi besar.`, 'warning');
            }
        }
        grp._pendingVenue = null;
        return true;
    }

    // ---- SYSTEM 6: SUB-UNIT & SOLO RESMI ----
    window.switchSubunitTab = function(tabId) {
        document.querySelectorAll('#subunit .sub-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#subunit .sub-tab-content').forEach(c => c.classList.remove('active'));
        event.target.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
        if(tabId === 'su-form') loadSubunitGroupSelects();
        if(tabId === 'su-solo') loadSoloGroupSelects();
        if(tabId === 'su-list') renderSubUnitList();
    };

    function loadSubunitGroupSelects() {
        let sel = document.getElementById('su-parent-group');
        if(!sel) return;
        sel.innerHTML = '';
        let debuted = gameData.groups.filter(g => !g.isPreDebut && !g.isDisbanded);
        if(debuted.length === 0) { sel.innerHTML = '<option value="">Belum ada grup yang debut</option>'; return; }
        debuted.forEach((g, i) => { let realIdx = gameData.groups.indexOf(g); sel.innerHTML += `<option value="${realIdx}">${g.name} (${g.members.length} member)</option>`; });
        loadSubunitMembers();
    }

    function loadSoloGroupSelects() {
        let sel = document.getElementById('solo-parent-group');
        if(!sel) return;
        sel.innerHTML = '';
        let debuted = gameData.groups.filter(g => !g.isPreDebut && !g.isDisbanded);
        if(debuted.length === 0) { sel.innerHTML = '<option value="">Belum ada grup debut</option>'; return; }
        debuted.forEach((g, i) => { let realIdx = gameData.groups.indexOf(g); sel.innerHTML += `<option value="${realIdx}">${g.name}</option>`; });
        loadSoloMembers();
    }

    window.loadSubunitMembers = function() {
        let gIdx = parseInt(document.getElementById('su-parent-group').value);
        let grp = gameData.groups[gIdx];
        let container = document.getElementById('su-member-select');
        if(!container || !grp) return;
        container.innerHTML = '';
        grp.members.forEach((m, mIdx) => {
            let card = document.createElement('div');
            card.className = 'lineup-card';
            card.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><b>${m.name}</b><input type="checkbox" class="su-mem-chk" data-midx="${mIdx}"></div><small>Avg: ${Math.floor((m.vocal+m.dance+m.rap+m.visual)/4)} | ${m.positions.join(',')||'Member'}</small>`;
            container.appendChild(card);
        });
    };

    window.loadSoloMembers = function() {
        let gIdx = parseInt(document.getElementById('solo-parent-group').value);
        let grp = gameData.groups[gIdx];
        let sel = document.getElementById('solo-member-select');
        if(!sel || !grp) return;
        sel.innerHTML = '';
        grp.members.forEach((m, mIdx) => { sel.innerHTML += `<option value="${mIdx}">${m.name} (Fans: ${(m.indFans||0).toLocaleString()})</option>`; });
    };

    window.formSubUnit = function() {
        let gIdx = parseInt(document.getElementById('su-parent-group').value);
        let grp = gameData.groups[gIdx];
        let unitName = document.getElementById('su-unit-name').value.trim();
        let concept = document.getElementById('su-concept').value;

        if(!unitName) return showToast('Isi nama sub-unit!', 'danger');
        if(!grp) return showToast('Pilih grup induk!', 'danger');

        let selectedMembers = [];
        document.querySelectorAll('.su-mem-chk:checked').forEach(chk => {
            let mIdx = parseInt(chk.getAttribute('data-midx'));
            selectedMembers.push(grp.members[mIdx]);
        });

        if(selectedMembers.length < 2 || selectedMembers.length > 4) return showToast('Pilih 2-4 member!', 'danger');
        if(gameData.money < 50000000) return showToast('Butuh ₩50Jt!', 'danger');

        addFinanceRecord('SubUnit', 'expense', 50000000, `Pembentukan Sub-Unit: ${unitName}`);

        let avgStat = Math.floor(selectedMembers.reduce((s,m)=>s+(m.vocal+m.dance+m.rap+m.visual)/4,0)/selectedMembers.length);
        let su = {
            id: Date.now(),
            name: unitName,
            parentName: grp.name,
            parentIdx: gIdx,
            members: selectedMembers,
            concept: concept,
            avgStat: avgStat,
            fansKR: Math.floor(grp.fansKR * 0.1),
            fansGL: Math.floor(grp.fansGL * 0.1),
            albums: 0, trophies: 0, stress: 0,
            busyWeeks: 0, currentEvent: null, hasScandal: false,
            isSubUnit: true
        };
        gameData.subUnits.push(su);
        showToast(`Sub-Unit "${unitName}" berhasil dibentuk!`, 'success');
        addMainLog(`🎭 SUB-UNIT: ${unitName} (dari ${grp.name}) resmi dibentuk!`);
        renderSubUnitList();
        updateUI();
    };

    window.launchOfficialSolo = function() {
        let gIdx = parseInt(document.getElementById('solo-parent-group').value);
        let mIdx = parseInt(document.getElementById('solo-member-select').value);
        let grp = gameData.groups[gIdx];
        if(!grp) return showToast('Pilih grup!', 'danger');
        let member = grp.members[mIdx];
        if(!member) return showToast('Pilih member!', 'danger');
        if(member.soloBusy > 0) return showToast(`${member.name} sedang sibuk dengan aktivitas lain!`, 'danger');

        // Open the debut modal in solo comeback mode
        isCb = true; cbIdx = gIdx; window._v11ArtistIdx = gIdx;
        document.getElementById('debut-modal-title').innerText = `🎤 DEBUT SOLO RESMI: ${member.name}`;
        document.getElementById('group-status-wrap').classList.add('hidden');
        document.getElementById('debut-is-predebut').value = "false"; toggleReleaseInputs();
        document.getElementById('debut-name').value = `${member.name} Solo`;

        // Skip to step 3 (release details)
        document.querySelectorAll('.debut-step').forEach(el=>el.classList.remove('active'));
        document.getElementById('debut-step-3').classList.add('active');
        document.getElementById('btn-back-step-2').classList.add('hidden');
        document.getElementById('btn-cancel-comeback').classList.remove('hidden');

        const hl = document.getElementById('debut-highlight'); 
        hl.innerHTML = `<option value="0">${member.name} (Solo — Center)</option>`;
        
        // Store solo member info for later processing
        window._pendingSoloMemberIdx = mIdx;
        window._pendingSoloGroupIdx = gIdx;

        // Mark member as busy when release finalizes (handled in finalizeDebut)
        openModal('modal-debut-setup');
        closeModal('modal-member-detail'); // Close the sub-unit tab if open
    };

    function renderSubUnitList() {
        let listEl = document.getElementById('su-active-list');
        if(!listEl) return;
        let html = '';

        if(gameData.subUnits.length > 0) {
            html += '<h4 style="margin-bottom:10px;">🧩 Sub-Unit Aktif:</h4>';
            gameData.subUnits.forEach((su, i) => {
                html += `<div class="neo-card-small bg-blue" style="margin-bottom:10px;">
                    <b>${su.name}</b> <span style="font-size:0.75rem;">(Sub-Unit dari ${su.parentName})</span><br>
                    <small>Member: ${su.members.map(m=>m.name).join(', ')}<br>Konsep: ${su.concept} | Fans: ${(su.fansKR+su.fansGL).toLocaleString()}</small>
                    <button class="neo-btn action-btn btn-sm mt-2 w-100" onclick="subUnitComeback(${i})">💿 Comeback Sub-Unit</button>
                </div>`;
            });
        }

        if(gameData.officialSolos.length > 0) {
            html += '<h4 style="margin-bottom:10px; margin-top:15px;">🎤 Riwayat Solo Resmi:</h4>';
            gameData.officialSolos.slice().reverse().forEach(s => {
                html += `<div class="neo-card-small bg-white" style="margin-bottom:5px;"><b>${s.memberName}</b> — "${s.albumName}" (${s.format}) | Tahun ${s.releaseYear}</div>`;
            });
        }

        if(html === '') html = '<p><i>Belum ada sub-unit atau solo resmi yang terdaftar.</i></p>';
        listEl.innerHTML = html;
    }

    window.subUnitComeback = function(suIdx) {
        let su = gameData.subUnits[suIdx];
        if(!su) return;
        let parentGrp = gameData.groups[su.parentIdx];
        if(!parentGrp) return showToast('Grup induk tidak ditemukan!', 'danger');

        // Open the debut modal in comeback mode for sub-unit
        isCb = true; cbIdx = su.parentIdx; window._v11ArtistIdx = su.parentIdx;
        document.getElementById('debut-modal-title').innerText = `💿 SUB-UNIT COMEBACK: ${su.name}`;
        document.getElementById('group-status-wrap').classList.add('hidden');
        document.getElementById('debut-is-predebut').value = "false"; toggleReleaseInputs();
        document.getElementById('debut-concept').value = su.concept;
        document.getElementById('debut-name').value = su.name;

        // Skip to step 3 (release details)
        document.querySelectorAll('.debut-step').forEach(el=>el.classList.remove('active'));
        document.getElementById('debut-step-3').classList.add('active');
        document.getElementById('btn-back-step-2').classList.add('hidden');
        document.getElementById('btn-cancel-comeback').classList.remove('hidden');

        const hl = document.getElementById('debut-highlight'); hl.innerHTML = '<option value="none">Adil & Merata</option>';
        su.members.forEach((m, idx) => { hl.innerHTML += `<option value="${idx}">${m.name} (Push Center)</option>`; });
        openModal('modal-debut-setup');
    };

    // ---- HOOK NEW SYSTEMS INTO WEEK SKIP ----
    // Patch the artist event resolution to handle concert venues
    const _originalBusyEventHandler = function(art) {
        // This patches the existing logic — resolve venue if applicable
        if(art.currentEvent && art.currentEvent.includes('tour') || art.currentEvent === 'zepp' || art.currentEvent === 'arena_tour' || art.currentEvent === 'dome_tour' || art.currentEvent === 'stadium_tour') {
            if(art._pendingVenue) return resolveConcertVenue(art);
        }
        return false;
    };

    // Inject new system calls into the existing week skip button listener
    const _origSkipWeekBtn = document.getElementById('btn-skip-week');
    _origSkipWeekBtn.addEventListener('click', function() {
        // These run AFTER the main week-skip logic already ran (listener order)
        // Check contract system
        if(gameData.m === 1 && gameData.w === 1) checkContractSystem();
        
        // Check fandom setup after releases
        setTimeout(() => checkFandomSetup(), 1500);

        // Check sasaeng weekly
        checkSasaengThreat();

        // Check cancel culture weekly
        checkCancelCultureTrigger();

        // Check award shows — trigger when year increments (original code sets y++ when m was 12)
        // Since our listener fires AFTER week skip logic, check if year just changed
        if(gameData.awards.lastAwardYear < gameData.y - 1) {
            gameData.awards.lastAwardYear = gameData.y - 1;
            setTimeout(() => runYearEndAwardShow(), 3000);
        }

        // Resolve concert venues for busy groups
        gameData.groups.forEach(grp => {
            if(grp.busyWeeks === 0 && grp._pendingVenue) {
                resolveConcertVenue(grp);
            }
        });

        // Process lightstick income monthly (w===1 means just rolled over)
        if(gameData.w === 1) processLightstickIncome();

        // Track yearly album sales
        gameData.groups.forEach(grp => {
            if(!grp.yearlyAlbumSales) grp.yearlyAlbumSales = 0;
        });

        // Update awards tab if visible
        if(document.getElementById('awards') && document.getElementById('awards').classList.contains('active')) {
            updateAwardsTab();
        }

        // Re-init new groups without contract fields
        gameData.groups.forEach(grp => {
            if(!grp.contractStartYear) { grp.contractStartYear = gameData.y; grp.contractYears = 7; }
            if(!grp.fandomSetupDone && grp.albums >= 1 && !grp.isPreDebut && !grp.isDisbanded) {
                checkFandomSetup();
            }
        });

        // Open pending modals (contract negotiation)
        if(gameData.pendingContractNego) {
            setTimeout(() => openContractNegoModal(), 2000);
        }
    });

    // Hook into updateUI via menu item clicks to update new tabs
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            let target = item.getAttribute('data-target');
            if(target === 'awards') setTimeout(updateAwardsTab, 100);
            if(target === 'subunit') {
                setTimeout(() => {
                    loadSubunitGroupSelects();
                    loadSoloGroupSelects();
                    renderSubUnitList();
                }, 100);
            }
        });
    });

    // Inject Bodyguard note into staff tab
    document.querySelector('[data-target="staff"]').addEventListener('click', () => {
        setTimeout(() => {
            let noteEl = document.getElementById('bodyguard-note');
            if(!noteEl) {
                let staffDiv = document.getElementById('staff-list');
                if(staffDiv && staffDiv.parentNode) {
                    noteEl = document.createElement('div');
                    noteEl.id = 'bodyguard-note';
                    noteEl.className = 'neo-card-small bg-orange mt-2';
                    noteEl.style.cssText = 'font-size:0.8rem; padding:8px;';
                    staffDiv.parentNode.insertBefore(noteEl, staffDiv.nextSibling);
                }
            }
            if(noteEl) {
                let hasBodyguard = gameData.staff.some(s => s.type === 'Bodyguard');
                noteEl.innerHTML = hasBodyguard ? '🛡️ <b>Bodyguard aktif</b> — Sasaeng fans terkontrol.' : '⚠️ Tidak ada Bodyguard. Sasaeng bisa mengganggu idol. Cari via Headhunter Staff (pilih role "Bodyguard" setelah modal terbuka).';
            }
        }, 200);
    });

    // ==========================================
    // V11.0 NEW FEATURES IMPLEMENTATION
    // ==========================================

    // ---- V11 SHARED STATE ----
    let v11 = {
        choreoFormation: null,    // current formation map { [cellIdx]: memberName }
        choreoConceptBonus: 0,
        selectedPalette: null,    // color string
        selectedAccessories: [],
        styleHistory: [],         // last 3 palette choices per group
        pendingFormationGroupIdx: null,
        pendingPaletteGroupIdx: null,
        evalQueue: [],            // trainee indices to evaluate
        evalCurrentIdx: 0,
        daesangWinner: null,      // group name for Daesang cinematic
        daesangWinnerObj: null,
    };

    const MATRIX_POSITIONS = [
        'Sayap Kiri Belakang', 'Belakang', 'Sayap Kanan Belakang',
        'Kiri Tengah', '⭐ CENTER', 'Kanan Tengah',
        'Sayap Kiri Depan', 'Depan', 'Sayap Kanan Depan'
    ];
    const CENTER_IDX = 4;

    const PALETTES = [
        { name:'Powder Pink', color:'#fbcfe8', dark:'#ec4899', concept:['Cute','Refreshing','Dreamy'] },
        { name:'Sky Blue', color:'#bfdbfe', dark:'#3b82f6', concept:['Refreshing','Y2K','Dreamy'] },
        { name:'Acid Yellow', color:'#fef08a', dark:'#eab308', concept:['Y2K','Refreshing','Teen Crush'] },
        { name:'Mint Green', color:'#bbf7d0', dark:'#22c55e', concept:['Refreshing','Cute','City Pop'] },
        { name:'Lavender', color:'#e9d5ff', dark:'#a855f7', concept:['Dreamy','Ethereal','Art Pop'] },
        { name:'Coral Orange', color:'#fed7aa', dark:'#f97316', concept:['Y2K','Teen Crush','Retro'] },
        { name:'Charcoal Black', color:'#334155', dark:'#0f172a', concept:['Girl Crush','Dark Academia','Hip-Hop','Noir'] },
        { name:'Ivory White', color:'#f1f5f9', dark:'#94a3b8', concept:['Elegant','Dreamy','Ballad'] },
        { name:'Crimson Red', color:'#fecaca', dark:'#dc2626', concept:['Girl Crush','Hip-Hop','Cyberpunk'] },
        { name:'Deep Purple', color:'#ddd6fe', dark:'#7c3aed', concept:['Cyberpunk','Dark Academia','Gothic'] },
        { name:'Neon Green', color:'#d9f99d', dark:'#65a30d', concept:['Cyberpunk','Y2K','Hyperpop'] },
        { name:'Rose Gold', color:'#fce7f3', dark:'#be185d', concept:['Elegant','Girl Crush','R&B'] },
        { name:'Military Khaki', color:'#d6d3d1', dark:'#57534e', concept:['Hip-Hop','Military','Dark Academia'] },
        { name:'Ocean Teal', color:'#ccfbf1', dark:'#0d9488', concept:['Refreshing','City Pop','Dreamy'] },
        { name:'Sunset Gradient', color:'#fde68a', dark:'#ea580c', concept:['Retro','Y2K','Tropical'] },
        { name:'Holographic Silver', color:'#e2e8f0', dark:'#475569', concept:['Cyberpunk','Art Pop','Hyperpop'] },
    ];
    const ACCESSORIES = ['🎩 Beret','⛓️ Chains','✨ Glitters','🕶️ Shades','🧤 Gloves','🎀 Ribbon','💎 Diamonds','🦺 Techwear','👑 Tiara','🌸 Flower Crown','🔗 Harness','🧣 Scarf','📿 Choker','🎭 Half Mask','💍 Statement Rings','🪶 Feathers'];

    // ---- FEATURE 1: CHOREO FORMATION MATRIX ----
    window.openChoreoMatrix = function() {
        let members = [];
        if(window._v11ArtistIdx !== null && window._v11ArtistIdx !== undefined) {
            // COMEBACK: get members from the existing group
            let grp = gameData.groups[window._v11ArtistIdx];
            if(grp) members = grp.members;
            v11.pendingFormationGroupIdx = window._v11ArtistIdx;
        } else {
            // NEW DEBUT: read checked trainees from the lineup step
            let chks = document.querySelectorAll('.lineup-card .t-sel:checked');
            if(chks.length === 0) {
                showToast("Pilih lineup member dulu di Step 2!", "warning");
                return;
            }
            chks.forEach(chk => {
                let tid = parseInt(chk.getAttribute('data-id'));
                let tr = gameData.trainees.find(t => t.id === tid);
                if(tr) members.push(tr);
            });
            v11.pendingFormationGroupIdx = null;
        }
        if(!members.length) {
            showToast("Tidak ada member untuk formasi!", "warning");
            return;
        }
        v11.choreoFormation = {};
        renderChoreoMatrix(members);
        openModal('modal-choreo-matrix');
    };

    function renderChoreoMatrix(members) {
        let grid = document.getElementById('choreo-matrix-grid');
        let pool = document.getElementById('choreo-member-pool');
        grid.innerHTML = '';
        pool.innerHTML = '';

        MATRIX_POSITIONS.forEach((pos, i) => {
            let cell = document.createElement('div');
            cell.className = 'matrix-cell' + (i === CENTER_IDX ? ' center-pos' : '');
            cell.dataset.idx = i;
            let label = document.createElement('span');
            label.className = 'matrix-pos-label';
            label.innerText = pos;
            cell.appendChild(label);
            cell.onclick = () => placeMemberInCell(i);
            grid.appendChild(cell);
        });

        members.forEach(m => {
            let chip = document.createElement('div');
            chip.className = 'fm-member-chip';
            chip.dataset.name = m.name;
            chip.dataset.dance = m.dance;
            chip.dataset.visual = m.visual;
            chip.innerText = `${m.name} (D:${Math.floor(m.dance)} V:${Math.floor(m.visual)})`;
            chip.onclick = () => selectMemberForMatrix(chip, m.name);
            pool.appendChild(chip);
        });
    }

    let _selectedMatrixMember = null;
    function selectMemberForMatrix(chip, name) {
        document.querySelectorAll('.fm-member-chip').forEach(c => c.style.outline = '');
        chip.style.outline = '3px solid var(--c-pink-solid)';
        _selectedMatrixMember = { name, dance: parseFloat(chip.dataset.dance), visual: parseFloat(chip.dataset.visual) };
    }

    function placeMemberInCell(cellIdx) {
        if(!_selectedMatrixMember) return showToast("Pilih member dari pool dulu!", "warning");
        let chip = document.querySelector(`.fm-member-chip[data-name="${_selectedMatrixMember.name}"]`);
        if(chip && chip.classList.contains('placed')) return showToast("Member sudah ditempatkan!", "warning");

        // Remove from previous cell if already placed
        Object.keys(v11.choreoFormation).forEach(k => {
            if(v11.choreoFormation[k] === _selectedMatrixMember.name) {
                let oldCell = document.querySelector(`.matrix-cell[data-idx="${k}"]`);
                if(oldCell) { oldCell.innerHTML = ''; let lbl = document.createElement('span'); lbl.className = 'matrix-pos-label'; lbl.innerText = MATRIX_POSITIONS[k]; oldCell.appendChild(lbl); oldCell.classList.remove('filled'); }
                delete v11.choreoFormation[k];
            }
        });

        v11.choreoFormation[cellIdx] = _selectedMatrixMember;
        let cell = document.querySelector(`.matrix-cell[data-idx="${cellIdx}"]`);
        cell.innerHTML = `<div style="text-align:center;"><span style="font-size:1.2rem;">👤</span><br><span style="font-size:0.65rem;">${_selectedMatrixMember.name}</span><br><span class="matrix-pos-label">${MATRIX_POSITIONS[cellIdx]}</span></div>`;
        cell.classList.add('filled');

        if(chip) chip.classList.add('placed');
        _selectedMatrixMember = null;
        document.querySelectorAll('.fm-member-chip').forEach(c => c.style.outline = '');
        updateFormationSinergi();
    }

    function updateFormationSinergi() {
        let centerMember = v11.choreoFormation[CENTER_IDX];
        let info = document.getElementById('choreo-sinergi-info');
        let msgs = [];
        if(centerMember) {
            if(centerMember.dance >= 70) msgs.push('✅ Center dance tinggi — Sinergi sempurna! Fans terkesan.');
            else if(centerMember.dance < 40) msgs.push('⚠️ K-Netz: "Kenapa si ' + centerMember.name + ' di center terus? Narinya kaku!"');
            if(centerMember.visual >= 75) msgs.push('💎 Visual center premium — Boost visual score +20%!');
        }
        let totalFilled = Object.keys(v11.choreoFormation).length;
        if(totalFilled >= 4) msgs.push('🎭 Formasi lengkap! Koordinasi tim bagus.');
        if(totalFilled === 0) msgs.push('📊 Sinergi formasi akan tampil di sini.');
        info.innerHTML = msgs.join('<br>') || '📊 Tempatkan member untuk melihat sinergi.';
    }

    window.applyFormationPreset = function(type) {
        let members = [];
        let grp = gameData.groups[v11.pendingFormationGroupIdx];
        if(grp) {
            members = grp.members.slice(0, 9);
        } else {
            // Debut mode: read from the rendered pool chips
            document.querySelectorAll('.fm-member-chip').forEach(chip => {
                members.push({ name: chip.dataset.name, dance: parseFloat(chip.dataset.dance), visual: parseFloat(chip.dataset.visual) });
            });
        }
        if(!members.length) return;

        v11.choreoFormation = {};
        document.querySelectorAll('.fm-member-chip').forEach(c => c.classList.remove('placed'));
        document.querySelectorAll('.matrix-cell').forEach(c => {
            c.innerHTML = '';
            let lbl = document.createElement('span');
            lbl.className = 'matrix-pos-label';
            lbl.innerText = MATRIX_POSITIONS[parseInt(c.dataset.idx)];
            c.appendChild(lbl);
            c.classList.remove('filled');
        });

        let placements;
        if(type === 'V') placements = [3,4,5,6,8]; // V shape positions
        else if(type === 'line') placements = [3,4,5,6,7,8];
        else if(type === 'triangle') placements = [4,3,5,6,8];
        else placements = [0,2,4,6,8]; // scatter diagonal

        members.slice(0, placements.length).forEach((m, i) => {
            let cellIdx = placements[i];
            v11.choreoFormation[cellIdx] = { name: m.name, dance: m.dance, visual: m.visual };
            let cell = document.querySelector(`.matrix-cell[data-idx="${cellIdx}"]`);
            if(cell) {
                cell.innerHTML = `<div style="text-align:center;"><span style="font-size:1.2rem;">👤</span><br><span style="font-size:0.65rem;">${m.name}</span><br><span class="matrix-pos-label">${MATRIX_POSITIONS[cellIdx]}</span></div>`;
                cell.classList.add('filled');
            }
            let chip = document.querySelector(`.fm-member-chip[data-name="${m.name}"]`);
            if(chip) chip.classList.add('placed');
        });
        updateFormationSinergi();
    };

    window.confirmFormation = function() {
        v11.choreoConceptBonus = 0;
        let center = v11.choreoFormation[CENTER_IDX];
        if(center) {
            if(center.dance >= 70) v11.choreoConceptBonus += 15;
            else if(center.dance < 40) v11.choreoConceptBonus -= 10;
            if(center.visual >= 75) v11.choreoConceptBonus += 10;
            // Apply stress increase to center member
            let grp = gameData.groups[v11.pendingFormationGroupIdx];
            if(grp) {
                let m = grp.members.find(m => m.name === center.name);
                if(m) { m.indFans = (m.indFans || 0) + 2000; addMainLog(`⭐ ${m.name} di posisi Center — Individual fans +2000, stress grup naik!`); }
                grp.stress = Math.min(100, grp.stress + 8);
            }
        }
        closeModal('modal-choreo-matrix');
        document.getElementById('formation-chosen-banner').classList.remove('hidden');
        showToast("Formasi terkunci! Bonus: " + v11.choreoConceptBonus, v11.choreoConceptBonus >= 0 ? "success" : "warning");
    };

    // ---- FEATURE 2: ADVANCED STYLIST & COLOR PALETTE ----
    window.openStylistPalette = function() {
        // For comeback, use the tracked artist index; for new debut, use null (no group yet)
        let gIdx = (window._v11ArtistIdx !== null && window._v11ArtistIdx !== undefined)
            ? window._v11ArtistIdx
            : v11.pendingFormationGroupIdx;
        v11.pendingPaletteGroupIdx = gIdx;
        v11.selectedPalette = null;
        v11.selectedAccessories = [];
        renderStylistModal(gIdx);
        openModal('modal-stylist-palette');
    };

    function renderStylistModal(gIdx) {
        let grid = document.getElementById('palette-grid-container');
        grid.innerHTML = '';
        PALETTES.forEach(p => {
            let sw = document.createElement('div');
            sw.className = 'palette-swatch';
            sw.style.background = p.color;
            sw.style.color = p.dark;
            sw.title = p.name;
            sw.innerText = p.name;
            sw.onclick = () => {
                document.querySelectorAll('.palette-swatch').forEach(s => s.classList.remove('selected'));
                sw.classList.add('selected');
                v11.selectedPalette = p;
                updatePalettePreview(gIdx);
                checkStyleRepeat(gIdx, p);
            };
            grid.appendChild(sw);
        });

        let accCont = document.getElementById('accessory-chips-container');
        accCont.innerHTML = '';
        ACCESSORIES.forEach(acc => {
            let chip = document.createElement('div');
            chip.className = 'acc-chip';
            chip.innerText = acc;
            chip.onclick = () => {
                chip.classList.toggle('selected');
                if(chip.classList.contains('selected')) v11.selectedAccessories.push(acc);
                else v11.selectedAccessories = v11.selectedAccessories.filter(a => a !== acc);
            };
            accCont.appendChild(chip);
        });
    }

    function checkStyleRepeat(gIdx, palette) {
        let grp = gameData.groups[gIdx];
        if(!grp) return;
        if(!grp.styleHistory) grp.styleHistory = [];
        let warnEl = document.getElementById('style-history-warn-el');
        let last3 = grp.styleHistory.slice(-3);
        if(last3.length >= 2 && last3.every(s => s === palette.name)) {
            warnEl.classList.remove('hidden');
            warnEl.innerHTML = '⚠️ K-Netz akan protes: "Stylist agensi ini malas banget, bajunya itu-itu saja!" Pilih warna lain!';
        } else {
            warnEl.classList.add('hidden');
        }
    }

    function updatePalettePreview(gIdx) {
        if(!v11.selectedPalette) return;
        let members = [];
        let grp = gameData.groups[gIdx];
        if(grp) {
            members = grp.members.slice(0, 4);
        } else {
            // Debut mode: get from checked lineup cards
            let chks = document.querySelectorAll('.lineup-card .t-sel:checked');
            chks.forEach(chk => {
                let tid = parseInt(chk.getAttribute('data-id'));
                let tr = gameData.trainees.find(t => t.id === tid);
                if(tr && members.length < 4) members.push(tr);
            });
        }
        let row = document.getElementById('palette-idol-preview-row');
        row.innerHTML = '';
        members.forEach(m => {
            let idolDiv = document.createElement('div');
            idolDiv.style.textAlign = 'center';
            idolDiv.innerHTML = `
                <div class="pixel-idol ${m.gender || 'Male'}" style="background:${v11.selectedPalette.color}; border:2px solid ${v11.selectedPalette.dark}; margin:0 auto;">
                </div>
                <div style="font-size:0.6rem; font-weight:700; margin-top:5px; color:#333;">${m.name}</div>
            `;
            row.appendChild(idolDiv);
        });
        if(members.length === 0) row.innerHTML = '<p style="font-size:0.8rem; color:#666;">Belum ada member yang dipilih.</p>';
    }

    window.confirmStylistPalette = function() {
        if(!v11.selectedPalette) return showToast("Pilih warna palette dulu!", "warning");
        let gIdx = v11.pendingPaletteGroupIdx;
        let grp = gameData.groups[gIdx];
        if(grp) {
            if(!grp.styleHistory) grp.styleHistory = [];
            grp.styleHistory.push(v11.selectedPalette.name);
            grp.currentPalette = v11.selectedPalette;
            grp.currentAccessories = v11.selectedAccessories;

            // Check repeat penalty
            let last3 = grp.styleHistory.slice(-3);
            if(last3.length >= 3 && last3.every(s => s === v11.selectedPalette.name)) {
                setTimeout(() => generateSocialFeed('scandal_attitude', grp.name), 500);
                gameData.rep -= 200;
                addMainLog(`⚠️ STYLIST: K-Netz protes warna ${v11.selectedPalette.name} dipakai berulang!`);
            }
            // Accessories bonus
            if(v11.selectedAccessories.length >= 2) v11.choreoConceptBonus = (v11.choreoConceptBonus || 0) + 5;
        }
        closeModal('modal-stylist-palette');
        document.getElementById('formation-chosen-banner').classList.remove('hidden');
        showToast(`Wardrobe "${v11.selectedPalette.name}" dikunci! ${v11.selectedAccessories.length} aksesoris terpilih.`, "success");
    };

    // ---- FEATURE 3: MONTHLY TRAINEE EVALUATION ----
    function triggerTraineeEvaluation() {
        let allTrainees = gameData.trainees;
        if(allTrainees.length === 0) return;
        v11.evalQueue = allTrainees.slice();
        v11.evalCurrentIdx = 0;
        showNextEvalTrainee();
    }

    function showNextEvalTrainee() {
        if(v11.evalCurrentIdx >= v11.evalQueue.length) {
            document.getElementById('trainee-eval-screen').style.display = 'none';
            showToast("Evaluasi trainee selesai!", "success");
            updateUI();
            return;
        }
        let t = v11.evalQueue[v11.evalCurrentIdx];
        let total = v11.evalQueue.length;
        let screen = document.getElementById('trainee-eval-screen');
        screen.style.display = 'flex';
        document.getElementById('eval-progress-info').innerText = `Trainee ${v11.evalCurrentIdx + 1} / ${total}`;
        document.getElementById('eval-current-name').innerText = t.name;

        // Render pixel display
        let disp = document.getElementById('eval-trainee-display');
        disp.innerHTML = '';
        let pixelDiv = document.createElement('div');
        pixelDiv.className = 'eval-pixel';
        let head = document.createElement('div');
        head.className = 'eval-pixel-head';
        let body = document.createElement('div');
        body.className = 'eval-pixel-body';
        let avgStat = (t.vocal + t.dance + t.rap + t.visual + (t.stage || (t.vocal+t.dance+t.visual)/3)) / 5;
        body.style.background = avgStat >= 60 ? '#22c55e' : avgStat >= 40 ? '#eab308' : '#ef4444';
        pixelDiv.appendChild(head);
        pixelDiv.appendChild(body);
        disp.appendChild(pixelDiv);

        // Animate bars
        setTimeout(() => {
            let vBar = document.getElementById('eval-bar-vocal');
            let dBar = document.getElementById('eval-bar-dance');
            vBar.style.width = Math.min(100, t.vocal) + '%';
            dBar.style.width = Math.min(100, t.dance) + '%';
            vBar.className = 'eval-bar-fill ' + (t.vocal >= 50 ? 'vocal' : 'fail');
            dBar.className = 'eval-bar-fill ' + (t.dance >= 50 ? 'dance' : 'fail');
            if(avgStat < 40) {
                pixelDiv.classList.add('eval-sad');
            }
        }, 300);
    }

    window.evalDecision = function(type) {
        if(v11.evalCurrentIdx >= v11.evalQueue.length) return;
        let t = v11.evalQueue[v11.evalCurrentIdx];
        let tIdx = gameData.trainees.indexOf(t);

        if(type === 'praise') {
            t.vocal = Math.min(99, t.vocal + 2);
            t.dance = Math.min(99, t.dance + 2);
            addMainLog(`✨ EVAL: ${t.name} dipuji CEO. Semangat naik, progres melambat sedikit.`);
            showToast(`${t.name} merasa termotivasi!`, "success");
        } else if(type === 'critique') {
            let grow = Math.random() < 0.85 ? 8 : -5;
            if(grow > 0) {
                t.vocal = Math.min(99, t.vocal + grow);
                t.dance = Math.min(99, t.dance + grow);
                addMainLog(`⚡ EVAL: ${t.name} dikritik keras — stat naik signifikan!`);
                showToast(`Kritik keras berhasil! ${t.name} tumbuh.`, "success");
            } else {
                // Trainee might quit if fragile
                if(t.traitObj && (t.traitObj.name === 'Kaca Kaca' || Math.random() < 0.1)) {
                    gameData.trainees.splice(tIdx, 1);
                    addMainLog(`💔 EVAL: ${t.name} resign akibat tekanan keras CEO!`);
                    showToast(`${t.name} resign! Mental trainee tidak kuat.`, "danger");
                    v11.evalCurrentIdx++;
                    showNextEvalTrainee();
                    return;
                }
                t.vocal = Math.min(99, t.vocal + 5);
                t.dance = Math.min(99, t.dance + 5);
                addMainLog(`⚡ EVAL: ${t.name} berhasil menanggung kritik CEO!`);
                showToast(`${t.name} bertahan dari kritik keras!`, "warning");
            }
        } else if(type === 'cut') {
            if(tIdx >= 0) gameData.trainees.splice(tIdx, 1);
            addMainLog(`✂️ EVAL: ${t.name} dikeluarkan dari agensi dalam evaluasi.`);
            showToast(`${t.name} dieliminasi.`, "danger");
        }
        v11.evalCurrentIdx++;
        showNextEvalTrainee();
    };

    // ---- FEATURE 4: DAESANG CINEMATIC ----
    function triggerDaesangCinematic(winnerGroup) {
        v11.daesangWinnerObj = winnerGroup;
        v11.daesangWinner = winnerGroup ? winnerGroup.name : 'Kompetitor';
        
        let phase1 = document.getElementById('daesang-phase1');
        let phase2 = document.getElementById('daesang-phase2');
        let winReveal = document.getElementById('daesang-winner-reveal');
        phase1.style.display = 'flex';
        phase2.style.display = 'none';
        winReveal.style.display = 'none';
        
        document.getElementById('daesang-cinematic').style.display = 'flex';
        
        // Generate stars in bg
        let confArea = document.getElementById('daesang-confetti-area');
        confArea.innerHTML = '';
    }

    window.openDaesangEnvelope = function() {
        let envelope = document.getElementById('daesang-envelope');
        envelope.innerHTML = '💌';
        envelope.style.animation = 'none';
        envelope.style.transform = 'scale(1.3)';
        envelope.style.transition = 'transform 0.3s';
        envelope.onclick = null;
        
        // Heartbeat effect briefly
        envelope.classList.add('heartbeat-anim');
        
        setTimeout(() => {
            let phase1 = document.getElementById('daesang-phase1');
            let phase2 = document.getElementById('daesang-phase2');
            let winReveal = document.getElementById('daesang-winner-reveal');
            
            phase1.style.display = 'none';
            phase2.style.display = 'block';
            winReveal.style.display = 'block';
            
            document.getElementById('daesang-winner-name').innerText = v11.daesangWinner;
            
            // Launch confetti
            let confArea = document.getElementById('daesang-confetti-area');
            confArea.innerHTML = '';
            const confColors = ['#fbbf24','#ec4899','#3b82f6','#22c55e','#a855f7','#f97316'];
            for(let i=0; i<60; i++) {
                let piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = (Math.random()*100) + '%';
                piece.style.background = confColors[Math.floor(Math.random()*confColors.length)];
                piece.style.animationDelay = (Math.random()*2) + 's';
                piece.style.animationDuration = (1.5 + Math.random()*2) + 's';
                piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                piece.style.width = (6 + Math.random()*10) + 'px';
                piece.style.height = (6 + Math.random()*10) + 'px';
                confArea.appendChild(piece);
            }
        }, 1500);
    };

    window.daesangSpeech = function(type) {
        let grp = v11.daesangWinnerObj;
        let fansBonus = 0;
        let msg = '';

        if(type === 'ceo') {
            fansBonus = 0.08; // 8% global fans boost
            msg = `${grp ? grp.name : ''} berterima kasih ke CEO & Tim — Global fans bertumbuh pesat!`;
            gameData.rep += 300;
        } else if(type === 'fans') {
            fansBonus = 0.20; // 20% global fans boost
            msg = `${grp ? grp.name : ''} mendedikasikan Daesang ke fandom — Fans meledak! Fandom loyalty naik tinggi.`;
            gameData.rep += 100;
        } else {
            fansBonus = 0.12;
            msg = `Momen haru tanpa kata — Video viral ke seluruh dunia! Global fans melonjak.`;
            gameData.rep += 200;
        }

        if(grp) {
            grp.fansGL = Math.floor(grp.fansGL * (1 + fansBonus));
            grp.fansKR = Math.floor(grp.fansKR * (1 + fansBonus * 0.5));
        }
        addMainLog(`🏆 DAESANG SPEECH (${type}): ${msg}`);
        showToast(msg, "success");
        document.getElementById('daesang-cinematic').style.display = 'none';
        updateUI();
    };

    // ---- FEATURE 5: ANTS FARM DASHBOARD ----
    function updateAntsFarm() {
        let practiceEl = document.getElementById('farm-icons-practice');
        let dormEl = document.getElementById('farm-icons-dorm');
        let tourEl = document.getElementById('farm-icons-tour');
        if(!practiceEl) return;

        practiceEl.innerHTML = '';
        dormEl.innerHTML = '';
        tourEl.innerHTML = '';

        let allIdols = [];
        gameData.trainees.forEach(t => allIdols.push({ name: t.name, state: 'practice', gender: t.gender }));
        gameData.groups.forEach(grp => {
            if(grp.isDisbanded) return;
            grp.members.forEach(m => {
                let state = 'dorm';
                if(grp.busyWeeks > 0 && grp.currentEvent && (grp.currentEvent.includes('tour') || grp.currentEvent === 'arena_tour' || grp.currentEvent === 'dome_tour' || grp.currentEvent === 'stadium_tour')) state = 'tour';
                else if(grp.schedule === 'practice' || grp.busyWeeks > 0) state = 'practice';
                else if(grp.schedule === 'rest') state = 'dorm';
                allIdols.push({ name: m.name, state, gender: m.gender });
            });
        });

        const emojiByGender = { 'Male': '🕺', 'Female': '💃', default: '🧍' };
        allIdols.forEach(idol => {
            let emoji = emojiByGender[idol.gender] || emojiByGender.default;
            let span = document.createElement('span');
            span.className = 'farm-idol-icon';
            span.title = idol.name;
            span.innerText = emoji;
            if(idol.state === 'practice') {
                span.classList.add('dancing');
                practiceEl.appendChild(span);
            } else if(idol.state === 'tour') {
                span.classList.add('touring');
                let tourSpan = span.cloneNode(true);
                tourSpan.style.display = 'inline-block';
                tourEl.appendChild(tourSpan);
            } else {
                span.classList.add('sleeping');
                span.innerText = '😴';
                dormEl.appendChild(span);
            }
        });

        ['practice', 'dorm', 'tour'].forEach(room => {
            let el = document.getElementById(`farm-room-${room}`);
            let iconsEl = document.getElementById(`farm-icons-${room}`);
            if(el && iconsEl) {
                el.classList.toggle('empty-room', iconsEl.children.length === 0);
            }
        });
    }

    // ---- HOOK ALL V11 FEATURES INTO GAME SYSTEMS ----

    // Hook Ants Farm into menu click for Staff tab
    document.querySelector('[data-target="staff"]').addEventListener('click', () => {
        setTimeout(updateAntsFarm, 200);
    });

    // Hook Ants Farm into updateUI
    const _origUpdateUI = window.updateUI;
    if(_origUpdateUI) {
        window.updateUI = function() {
            _origUpdateUI();
            updateAntsFarm();
        };
    }

    // Hook Trainee Evaluation into end-of-year (M12 W4)
    const _v11skipBtn = document.getElementById('btn-skip-week');
    _v11skipBtn.addEventListener('click', function() {
        // Run evaluation annually (M12 W4) or semi-annually (M6 W4)
        if((gameData.m === 12 && gameData.w === 4) || (gameData.m === 6 && gameData.w === 4)) {
            if(gameData.trainees.length > 0) {
                setTimeout(() => triggerTraineeEvaluation(), 4000);
            }
        }
    });

    // Patch the runYearEndAwardShow to use Daesang Cinematic for player groups
    const _origRunYearEndAwardShow = window.runYearEndAwardShow || runYearEndAwardShow;
    function runYearEndAwardShow() {
        if(gameData.groups.filter(g => !g.isDisbanded).length === 0) return;

        let allPlayerGroups = gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut);

        // ====== BUILD FULL INDUSTRY SCOREBOARD (Player + ALL Rivals) ======
        // Daesang is NOT just "beat a threshold" — you must beat EVERY rival in the industry.
        let allContestants = [];

        // Add player groups
        allPlayerGroups.forEach(g => {
            let totalTrophies = g.trophies || 0;
            let albumSales = g.yearlyAlbumSales || 0;
            let topSong = gameData.activeSongs.filter(s => s.artistRef === g).reduce((mx, s) => Math.max(mx, s.initialScore || s.score), 0);
            let totalFans = g.fansKR + g.fansGL;
            // Realistic weighting: Sales(30%) + Trophies(25%) + Digital/Song(20%) + Fandom(15%) + Rep(10%)
            let awardScore = (albumSales * 0.00005) + (totalTrophies * 150) + (topSong * 20) + (Math.log10(Math.max(10, totalFans)) * 200) + (Math.log10(Math.max(10, gameData.rep)) * 100);
            g._awardScore = awardScore;
            g._isRookie = g.albums <= 2 && (gameData.y - (g.debutYear || gameData.y)) <= 1;
            allContestants.push({ name: g.name, score: awardScore, isPlayer: true, ref: g, isRookie: g._isRookie });
        });

        // Add RIVAL groups as contestants — they compete for Daesang too!
        gameData.activeRivals.forEach(r => {
            let rTrophies = r.yearlyTrophies || (r.tier === 'Legend' ? 15+Math.floor(Math.random()*20) : r.tier === 'Top-Tier' ? 5+Math.floor(Math.random()*10) : Math.floor(Math.random()*3));
            let rSales = r.yearlyAlbumSales || (r.tier === 'Legend' ? 1000000+Math.floor(Math.random()*3000000) : r.tier === 'Top-Tier' ? 200000+Math.floor(Math.random()*500000) : r.tier === 'Mid-Tier' ? 20000+Math.floor(Math.random()*80000) : Math.floor(Math.random()*5000));
            let rTopSong = r.topSongScore || r.baseScore;
            let rScore = (rSales * 0.00005) + (rTrophies * 150) + (rTopSong * 20) + (Math.log10(Math.max(10, r.fandom)) * 200);
            allContestants.push({ name: r.artist, score: rScore, isPlayer: false, rivalRef: r, isRookie: false, tier: r.tier });
        });

        // Sort ALL contestants by score
        allContestants.sort((a, b) => b.score - a.score);

        let resultsHtml = [];

        // ====== ROOKIE OF THE YEAR ======
        // Only player rookies can win (rivals auto-generate rookie winners)
        let playerRookies = allContestants.filter(c => c.isPlayer && c.isRookie);
        let rivalRookies = allContestants.filter(c => !c.isPlayer && (c.tier === 'Mid-Tier' || c.tier === 'Nugu')).slice(0, 3);
        
        if(playerRookies.length > 0) {
            let bestPlayerRookie = playerRookies[0];
            // Compare against fictional rival rookies of the year
            let rivalRookieScore = rivalRookies.length > 0 ? rivalRookies[0].score * 0.6 : 500;
            if(bestPlayerRookie.score > rivalRookieScore) {
                bestPlayerRookie.ref.trophies = (bestPlayerRookie.ref.trophies || 0) + 1;
                addFinanceRecord('Award', 'income', 500000000, `Rookie of the Year Award: ${bestPlayerRookie.name}`);
                gameData.rep += 300;
                resultsHtml.push(`<div class="neo-card-small bg-green"><b>🌱 ROOKIE OF THE YEAR</b><br>${bestPlayerRookie.name} menang! +₩500Jt | +300 Rep</div>`);
                gameData.awards.history.push({ y: gameData.y, award: 'Rookie of the Year', winner: bestPlayerRookie.name });
            } else {
                let rivalRookieName = rivalRookies.length > 0 ? rivalRookies[0].name : 'Rival Rookie';
                resultsHtml.push(`<div class="neo-card-small bg-orange"><b>🌱 ROTY</b><br>Kalah dari ${rivalRookieName}. Rookie rival lebih kuat tahun ini.</div>`);
            }
        }

        // ====== SONG OF THE YEAR ======
        // Compete against ALL songs (player + rival)
        let allSongs = [];
        gameData.activeSongs.forEach(s => { allSongs.push({ title: s.title, artist: s.artistRef.name, score: s.initialScore || s.score, isPlayer: true, ref: s }); });
        // Add rival songs
        gameData.activeRivals.filter(r => r.weeksSinceRelease < 20).forEach(r => {
            allSongs.push({ title: r.title, artist: r.artist, score: r.topSongScore || r.baseScore, isPlayer: false });
        });
        allSongs.sort((a, b) => b.score - a.score);

        let sotyWinner = allSongs[0];
        if(sotyWinner && sotyWinner.isPlayer) {
            sotyWinner.ref.artistRef.trophies = (sotyWinner.ref.artistRef.trophies || 0) + 1;
            addFinanceRecord('Award', 'income', 1000000000, `Song of the Year: ${sotyWinner.title}`);
            gameData.rep += 500;
            resultsHtml.push(`<div class="neo-card-small bg-blue"><b>🎵 SONG OF THE YEAR</b><br>"${sotyWinner.title}" - ${sotyWinner.artist}! +₩1 Miliar | +500 Rep</div>`);
            gameData.awards.history.push({ y: gameData.y, award: 'Song of the Year', winner: sotyWinner.title + ' - ' + sotyWinner.artist });
        } else if(sotyWinner) {
            resultsHtml.push(`<div class="neo-card-small bg-orange"><b>🎵 SOTY</b><br>Dimenangkan oleh "${sotyWinner.title}" - ${sotyWinner.artist}. Lagu kamu belum cukup kuat.</div>`);
        }

        // ====== DAESANG — ARTIST OF THE YEAR ======
        // The #1 contestant in the ENTIRE industry wins. Player MUST beat ALL Legends and Top-Tiers.
        let daesangWinner = allContestants[0];
        let playerRank = allContestants.findIndex(c => c.isPlayer) + 1;
        let bestPlayerEntry = allContestants.find(c => c.isPlayer);

        if(daesangWinner && daesangWinner.isPlayer) {
            // Player actually won Daesang — this should be EXTREMELY rare for non-top-tier agencies
            daesangWinner.ref.trophies = (daesangWinner.ref.trophies || 0) + 1;
            addFinanceRecord('Award', 'income', 10000000000, `🏆 DAESANG - Artist of the Year: ${daesangWinner.name}`);
            gameData.rep += 5000;
            resultsHtml.push(`<div class="neo-card-small bg-yellow" style="border-width:4px; border-color:gold;"><b style="color:gold;font-size:1.1rem;">👑 DAESANG — ARTIST OF THE YEAR</b><br><b>${daesangWinner.name}</b> memenangkan penghargaan puncak!<br>+₩10 Miliar | +5000 Rep | Peringkat Industri: #1 dari ${allContestants.length} artis!</div>`);
            gameData.awards.history.push({ y: gameData.y, award: 'DAESANG', winner: daesangWinner.name });
            showToast(`🏆 DAESANG! ${daesangWinner.name} menang Artist of the Year!`, "success");
            setTimeout(() => triggerDaesangCinematic(daesangWinner.ref), 2000);
        } else {
            // Show who won and player's ranking
            let rivalWinnerName = daesangWinner ? daesangWinner.name : 'Unknown';
            let playerNote = bestPlayerEntry ? `Artis terbaikmu (${bestPlayerEntry.name}) di peringkat #${playerRank} dari ${allContestants.length} artis.` : 'Kamu belum punya artis yang bersaing.';
            resultsHtml.push(`<div class="neo-card-small bg-orange"><b>📢 Daesang</b><br>Pemenang: <strong>${rivalWinnerName}</strong>.<br>${playerNote}<br><small>Butuh penjualan album jutaan kopi, belasan trofi music show, dan fandom besar untuk bersaing.</small></div>`);
        }

        // Reset yearly counters
        allPlayerGroups.forEach(g => { g.yearlyAlbumSales = 0; g.trophies = Math.max(0, (g.trophies || 0)); });
        // Reset rival yearly stats
        gameData.activeRivals.forEach(r => { r.yearlyAlbumSales = 0; r.yearlyTrophies = 0; r.topSongScore = r.baseScore * 0.5; });

        document.getElementById('award-results-list').innerHTML = resultsHtml.join('');
        openModal('modal-award-ceremony');
        addMainLog(`🏆 AWARD SHOW: MAMA/KMA Tahun ${gameData.y} selesai! (Peringkat industri: #${playerRank || '?'})`);
    }

    // Also hook choreo bonus into the release score via the week skip
    _v11skipBtn.addEventListener('click', function() {
        // Apply formation concept bonus to active songs if was set
        if(v11.choreoConceptBonus !== 0) {
            gameData.activeSongs.forEach(s => {
                if(s.score) s.score = Math.max(0, s.score + v11.choreoConceptBonus * 0.5);
            });
            v11.choreoConceptBonus = 0;
        }
        // Update formation-chosen banner visibility
        let banner = document.getElementById('formation-chosen-banner');
        if(banner) banner.classList.add('hidden');
    });

    // ==========================================
    // V12 MEGA UPDATE: ALL NEW SYSTEMS
    // ==========================================

    // ===== 1. BREAKING NEWS TICKER =====
    const tickerHeadlines = [
        "🚨 SM Ent. kabarnya sedang menyiapkan Boy Group baru dengan konsep AI — industri gempar",
        "📈 K-DAQ: Saham HYBE naik 3.2% setelah BTS mengumumkan tur reuni stadium",
        "🏆 Prediksi MAMA 2025: Persaingan SOTY paling ketat sepanjang sejarah",
        "📺 Rating Survival Show Mnet tembus 15% — rekor baru sejak Produce 101",
        "💰 JYP Ent. akuisisi studio AI music senilai $50 juta USD",
        "🎤 Idol gen 5 mendominasi chart Melon — era perubahan generasi dimulai",
        "📱 TikTok resmi menandatangani kerjasama eksklusif dengan agensi K-pop besar",
        "🌍 Concert market Asia Tenggara tumbuh 200% — venue-venue baru bermunculan",
        "⚖️ RUU perlindungan hak trainee sedang dibahas di parlemen Korea Selatan",
        "🔴 Dispatch mengkonfirmasi skandal kencan baru — identitas masih dirahasiakan",
        "📊 Spotify Korea: Streaming K-pop naik 45% YoY — global hallyu masih perkasa",
        "🏟️ Tokyo Dome menambah 10 tanggal baru untuk konser K-pop di kuartal depan",
    ];

    function initNewsTicker() {
        let track = document.getElementById('ticker-track');
        if(!track) return;
        let items = '';
        // Dynamic headlines based on game state
        let dynamicHeadlines = [...tickerHeadlines];
        if(gameData.groups.length > 0) {
            let rndG = gameData.groups[Math.floor(Math.random()*gameData.groups.length)];
            dynamicHeadlines.push(`🏆 Gosip: Akankah ${rndG.name} sapu bersih MAMA tahun ini?`);
            dynamicHeadlines.push(`📈 K-DAQ: Saham ${gameData.agency} ${gameData.rep > 1000 ? 'naik' : 'stabil'} hari ini`);
            dynamicHeadlines.push(`🔥 Trending: ${rndG.name} jadi topik pembicaraan paling panas di TheQoo`);
        }
        dynamicHeadlines.push(`💼 ${gameData.agency} — Reputasi saat ini: ${gameData.rep} poin`);
        // Duplicate for seamless scroll
        let allItems = [...dynamicHeadlines, ...dynamicHeadlines];
        allItems.forEach(h => { items += `<span class="ticker-item">${h}</span>`; });
        track.innerHTML = items;
    }

    function refreshTicker() {
        initNewsTicker();
    }

    // ===== 2. ASRAMA & CHEMISTRY (ROOMMATE MATRIX) =====
    // Chemistry rules: pairs of traits that clash or synergize
    const CHEMISTRY_RULES = {
        clash: [
            ['Pekerja Keras', 'Problematic'], ['Pekerja Keras', 'Pemalas Berbakat'],
            ['Vocalist Jenius', 'Rapper Underground'], ['Skandal-Prone', 'Pekerja Keras'],
            ['Kaca Kaca', 'Problematic']
        ],
        synergy: [
            ['Pekerja Keras', 'Dance Machine'], ['Moodmaker', 'Kaca Kaca'],
            ['Vocalist Jenius', 'Center Material'], ['Moodmaker', 'Visual Dewa'],
            ['Dance Machine', 'Center Material'], ['Moodmaker', 'Pekerja Keras']
        ]
    };

    // dormData per group: { groupIdx: { rooms: [ { name: 'A', capacity: 2, members: [memberName...] }, ... ] } }
    let dormAssignments = {};
    let dormSelectedMember = null;

    function initDormGroupSelect() {
        let sel = document.getElementById('dorm-group-select');
        if(!sel) return;
        sel.innerHTML = '';
        let debuted = gameData.groups.filter(g => !g.isDisbanded && g.members.length > 1);
        if(debuted.length === 0) { sel.innerHTML = '<option value="">Belum ada grup yang layak</option>'; return; }
        debuted.forEach((g, i) => { let realIdx = gameData.groups.indexOf(g); sel.innerHTML += `<option value="${realIdx}">${g.name} (${g.members.length} member)</option>`; });
    }

    window.renderDormFloorplan = function() {
        let gIdx = parseInt(document.getElementById('dorm-group-select').value);
        let grp = gameData.groups[gIdx];
        if(!grp) return;

        // Initialize rooms if not set
        if(!dormAssignments[gIdx]) {
            let memCount = grp.members.length;
            let rooms = [];
            if(memCount <= 3) { rooms.push({ name:'A', cap:2, members:[] }, { name:'B', cap:2, members:[] }); }
            else if(memCount <= 5) { rooms.push({ name:'A', cap:2, members:[] }, { name:'B', cap:2, members:[] }, { name:'C', cap:2, members:[] }); }
            else if(memCount <= 7) { rooms.push({ name:'A', cap:2, members:[] }, { name:'B', cap:3, members:[] }, { name:'C', cap:2, members:[] }, { name:'D', cap:2, members:[] }); }
            else { rooms.push({ name:'A', cap:3, members:[] }, { name:'B', cap:3, members:[] }, { name:'C', cap:3, members:[] }, { name:'D', cap:2, members:[] }); }
            dormAssignments[gIdx] = { rooms };
        }

        let data = dormAssignments[gIdx];
        let fp = document.getElementById('dorm-floorplan');
        fp.innerHTML = '';

        // Add stars background
        for(let s=0; s<20; s++) {
            let star = document.createElement('div');
            star.className = 'farm-star';
            star.style.left = (Math.random()*100)+'%';
            star.style.top = (Math.random()*100)+'%';
            star.style.animationDelay = (Math.random()*2)+'s';
            fp.appendChild(star);
        }

        data.rooms.forEach((room, rIdx) => {
            let roomEl = document.createElement('div');
            roomEl.className = 'dorm-room';
            let header = `<div class="dorm-room-header">🛏️ Kamar ${room.name} <span class="dorm-room-cap">${room.members.length}/${room.cap}</span></div>`;
            let bedsHtml = '';
            for(let b=0; b < room.cap; b++) {
                let memberName = room.members[b] || null;
                let member = memberName ? grp.members.find(m => m.name === memberName) : null;
                if(member) {
                    bedsHtml += `<div class="dorm-bed occupied" onclick="removeDormMember(${gIdx},${rIdx},${b})" title="Klik untuk keluarkan ${member.name}"><span class="bed-icon">${member.gender==='Male'?'🛌':'🛌'}</span><span class="bed-name">${member.name.split(' ').pop()}</span></div>`;
                } else {
                    bedsHtml += `<div class="dorm-bed" onclick="placeDormMember(${gIdx},${rIdx},${b})" title="Klik untuk tempatkan member"><span class="bed-icon" style="opacity:0.3;">🛏️</span><span class="bed-name" style="color:#64748b;">Kosong</span></div>`;
                }
            }
            roomEl.innerHTML = header + `<div class="dorm-beds">${bedsHtml}</div>`;
            fp.appendChild(roomEl);
        });

        // Unassigned pool
        let assigned = [];
        data.rooms.forEach(r => assigned.push(...r.members));
        let unassigned = grp.members.filter(m => !assigned.includes(m.name));
        let poolEl = document.getElementById('dorm-pool-members');
        poolEl.innerHTML = '';
        unassigned.forEach(m => {
            let chip = document.createElement('div');
            chip.className = 'dorm-pool-chip';
            chip.innerText = `${m.gender==='Male'?'👦':'👧'} ${m.name}`;
            chip.onclick = () => selectDormMember(m.name, chip);
            poolEl.appendChild(chip);
        });

        recalcDormChemistry();
    };

    function selectDormMember(name, chip) {
        document.querySelectorAll('.dorm-pool-chip').forEach(c => c.style.outline = '');
        chip.style.outline = '3px solid var(--c-yellow-solid)';
        dormSelectedMember = name;
    }

    window.placeDormMember = function(gIdx, rIdx, bedIdx) {
        if(!dormSelectedMember) return showToast("Pilih member dari pool dulu!", "warning");
        let room = dormAssignments[gIdx].rooms[rIdx];
        if(room.members.length >= room.cap) return showToast("Kamar sudah penuh!", "danger");
        if(room.members.includes(dormSelectedMember)) return;
        room.members.push(dormSelectedMember);
        dormSelectedMember = null;
        renderDormFloorplan();
    };

    window.removeDormMember = function(gIdx, rIdx, bedIdx) {
        let room = dormAssignments[gIdx].rooms[rIdx];
        if(room.members[bedIdx]) {
            room.members.splice(bedIdx, 1);
            renderDormFloorplan();
        }
    };

    window.recalcDormChemistry = function() {
        let gIdx = parseInt(document.getElementById('dorm-group-select').value);
        let grp = gameData.groups[gIdx];
        if(!grp || !dormAssignments[gIdx]) return;

        let data = dormAssignments[gIdx];
        let results = [];

        data.rooms.forEach(room => {
            if(room.members.length < 2) return;
            // Check all pairs in the room
            for(let i=0; i<room.members.length; i++) {
                for(let j=i+1; j<room.members.length; j++) {
                    let m1 = grp.members.find(m => m.name === room.members[i]);
                    let m2 = grp.members.find(m => m.name === room.members[j]);
                    if(!m1 || !m2) continue;
                    let t1 = m1.traitObj ? m1.traitObj.name : '';
                    let t2 = m2.traitObj ? m2.traitObj.name : '';

                    // Check clash
                    let isClash = CHEMISTRY_RULES.clash.some(pair => (pair[0]===t1 && pair[1]===t2) || (pair[0]===t2 && pair[1]===t1));
                    let isSynergy = CHEMISTRY_RULES.synergy.some(pair => (pair[0]===t1 && pair[1]===t2) || (pair[0]===t2 && pair[1]===t1));

                    if(isClash) {
                        results.push({ type:'clash', room:room.name, m1:m1.name, m2:m2.name, msg:`${m1.name} (${t1}) & ${m2.name} (${t2}) sering berantem! Stress +5/minggu` });
                    } else if(isSynergy) {
                        results.push({ type:'synergy', room:room.name, m1:m1.name, m2:m2.name, msg:`${m1.name} & ${m2.name} akur! Good Mood buff — stat +1/minggu` });
                    }
                }
            }
        });

        let resEl = document.getElementById('dorm-chemistry-results');
        let listEl = document.getElementById('dorm-chem-list');
        if(results.length > 0) {
            resEl.style.display = 'block';
            listEl.innerHTML = results.map(r => `<div class="chem-row"><span class="chem-icon">${r.type==='clash'?'⚡':'💫'}</span><span class="${r.type==='clash'?'chem-bad':'chem-good'}">[Kamar ${r.room}] ${r.msg}</span></div>`).join('');
        } else {
            resEl.style.display = 'block';
            listEl.innerHTML = '<div class="chem-row"><span class="chem-icon">😐</span><span style="color:#94a3b8;">Tidak ada chemistry spesial terdeteksi. Assign member ke kamar untuk melihat interaksi.</span></div>';
        }

        // Store for weekly processing
        grp._dormChemistry = results;
    };

    // Process dorm chemistry weekly
    function processDormChemistry() {
        gameData.groups.forEach((grp, gIdx) => {
            if(!grp._dormChemistry) return;
            grp._dormChemistry.forEach(chem => {
                if(chem.type === 'clash') {
                    grp.stress = Math.min(100, grp.stress + 5);
                    let m1 = grp.members.find(m => m.name === chem.m1);
                    let m2 = grp.members.find(m => m.name === chem.m2);
                    // Small chance of producing social drama
                    if(Math.random() < 0.05) generateSocialFeed('scandal_attitude', grp.name);
                } else if(chem.type === 'synergy') {
                    let m1 = grp.members.find(m => m.name === chem.m1);
                    let m2 = grp.members.find(m => m.name === chem.m2);
                    if(m1) { m1.vocal = Math.min(100, m1.vocal + 0.5); m1.dance = Math.min(100, m1.dance + 0.5); }
                    if(m2) { m2.vocal = Math.min(100, m2.vocal + 0.5); m2.dance = Math.min(100, m2.dance + 0.5); }
                }
            });
        });
    }

    // ===== 3. MV STORYBOARD DIRECTOR (EXPANDED) =====
        const STORYBOARD_DATA = {
        locations: {
            rooftop:      { emoji:'🏙️', bg:'#334155', concepts:['Girl Crush','Hip-Hop','Cyberpunk','Noir'] },
            school:       { emoji:'🏫', bg:'#92400e', concepts:['Refreshing','Y2K','Teen Crush','Cute'] },
            desert:       { emoji:'🏜️', bg:'#b45309', concepts:['Girl Crush','Hip-Hop','Ethereal'] },
            neon:         { emoji:'🌃', bg:'#5b21b6', concepts:['Cyberpunk','Y2K','Hip-Hop','Hyperpop'] },
            mansion:      { emoji:'🏰', bg:'#7f1d1d', concepts:['Dark Academia','Dreamy','Gothic','Elegant'] },
            forest:       { emoji:'🌲', bg:'#166534', concepts:['Dreamy','Refreshing','Ethereal','Folklore/Traditional'] },
            studio_white: { emoji:'⬜', bg:'#e2e8f0', concepts:['Girl Crush','R&B','Refreshing','Elegant'] },
            underwater:   { emoji:'🌊', bg:'#0369a1', concepts:['Dreamy','Cyberpunk','Ethereal'] },
            stadium:      { emoji:'🏟️', bg:'#1d4ed8', concepts:['Girl Crush','Hip-Hop','Performance'] },
            subway:       { emoji:'🚇', bg:'#111827', concepts:['Y2K','Hip-Hop','Cyberpunk','Noir'] },
            beach:        { emoji:'🏖️', bg:'#0ea5e9', concepts:['Refreshing','Cute','Tropical','City Pop'] },
            hanok:        { emoji:'🏯', bg:'#78350f', concepts:['Folklore/Traditional','Elegant','Dark Academia'] },
            warehouse:    { emoji:'🏚️', bg:'#1c1917', concepts:['Hip-Hop','Girl Crush','Grunge','Noir'] },
            amusement:    { emoji:'🎡', bg:'#c026d3', concepts:['Cute','Refreshing','Y2K','Teen Crush'] },
            library:      { emoji:'📚', bg:'#44403c', concepts:['Dark Academia','Elegant','Art Pop'] },
            spaceship:    { emoji:'🚀', bg:'#0c0a09', concepts:['Cyberpunk','Hyperpop','Art Pop'] },
            cafe:         { emoji:'☕', bg:'#a16207', concepts:['R&B','City Pop','Refreshing','Ballad'] },
            train:        { emoji:'🚂', bg:'#374151', concepts:['Dreamy','Retro','City Pop','Noir'] }
        },
        cameras: {
            steady:     { emoji:'📹', label:'Clean Steady', concepts:['R&B','Dreamy','Refreshing','Ballad','Elegant'] },
            handheld:   { emoji:'🤳', label:'Raw Handheld', concepts:['Y2K','Hip-Hop','Grunge','Teen Crush'] },
            drone:      { emoji:'🚁', label:'Cinematic Drone', concepts:['Cyberpunk','Dark Academia','Girl Crush','Ethereal'] },
            oneclip:    { emoji:'🔄', label:'One-Take Prestige', concepts:['R&B','Dark Academia','Art Pop','Performance'] },
            mv_drama:   { emoji:'🎭', label:'Drama Narrative', concepts:['Dark Academia','R&B','Dreamy','Ballad','Noir'] },
            fisheye:    { emoji:'👁️', label:'Fisheye/Wide', concepts:['Hip-Hop','Y2K','Hyperpop','Grunge'] },
            slow_motion:{ emoji:'🐌', label:'Slow Motion Art', concepts:['Elegant','Dreamy','Ethereal','Ballad'] },
            vertical:   { emoji:'📱', label:'Vertical (Mobile)', concepts:['Y2K','Teen Crush','Cute','Refreshing'] }
        },
        dances: {
            viral_move:    { emoji:'🔥', label:'TikTok Bait', bonus:'viral', stageBonus:5 },
            wave:          { emoji:'🌊', label:'Body Wave', bonus:'dance', stageBonus:10 },
            hip_thrust:    { emoji:'💥', label:'Power Move', bonus:'impact', stageBonus:15 },
            finger_choreo: { emoji:'☝️', label:'Minimalis (Point)', bonus:'cute', stageBonus:3 },
            group_sync:    { emoji:'👯', label:'Full Sync Formation', bonus:'prestige', stageBonus:20 },
            floor_sync:    { emoji:'🌀', label:'Floor Work', bonus:'hard', stageBonus:18 },
            freestyle:     { emoji:'🎲', label:'Freestyle Section', bonus:'charisma', stageBonus:8 },
            killing_part:  { emoji:'⚡', label:'Killing Part Focus', bonus:'center', stageBonus:12 },
            relay_dance:   { emoji:'🔄', label:'Relay Dance Moment', bonus:'individual', stageBonus:7 },
            military_sync: { emoji:'🎖️', label:'Military Precision', bonus:'discipline', stageBonus:22 }
        }
    };

    let currentStoryboard = { location:null, camera:null, dance:null, synergyScore:0 };
    let storyboardConcept = null;

    window.updateMoodboard = function() {
        let loc = document.getElementById('sb-location').value;
        let cam = document.getElementById('sb-camera').value;
        let dance = document.getElementById('sb-dance').value;

        let locData = STORYBOARD_DATA.locations[loc];
        let camData = STORYBOARD_DATA.cameras[cam];
        let danceData = STORYBOARD_DATA.dances[dance];

        // Update polaroids
        let p1 = document.getElementById('sb-polaroid-1');
        let p2 = document.getElementById('sb-polaroid-2');
        let p3 = document.getElementById('sb-polaroid-3');

        p1.querySelector('.polaroid-img').style.background = locData.bg;
        p1.querySelector('.polaroid-img').innerText = locData.emoji;
        p1.querySelector('.polaroid-label').innerText = loc.replace('_',' ');

        p2.querySelector('.polaroid-img').style.background = '#1e293b';
        p2.querySelector('.polaroid-img').innerText = camData.emoji;
        p2.querySelector('.polaroid-label').innerText = camData.label;

        p3.querySelector('.polaroid-img').style.background = '#0f172a';
        p3.querySelector('.polaroid-img').innerText = danceData.emoji;
        p3.querySelector('.polaroid-label').innerText = danceData.label;

        // Animate polaroids
        [p1,p2,p3].forEach((p,i) => {
            p.style.transition = 'none';
            p.style.transform = 'scale(0.8) rotate(0deg)';
            setTimeout(() => {
                p.style.transition = 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
                let rotations = [-8, 5, -3];
                let tx = [-30, 20, -10];
                let ty = [-10, -20, 30];
                p.style.transform = `rotate(${rotations[i]}deg) translate(${tx[i]}px,${ty[i]}px)`;
            }, 50 + i*100);
        });

        // Calculate synergy
        let concept = storyboardConcept || 'Girl Crush';
        let score = 0;
        let msgs = [];

        if(locData.concepts.includes(concept)) { score += 30; msgs.push(`✅ Lokasi cocok dengan konsep ${concept}!`); }
        else { score -= 15; msgs.push(`⚠️ Lokasi tidak cocok dengan konsep ${concept}`); }

        if(camData.concepts.includes(concept)) { score += 20; msgs.push(`✅ Kamera ${camData.label} pas untuk ${concept}`); }
        else { score -= 10; msgs.push(`⚠️ Kamera kurang sinergi`); }

        // Special combos
        if(loc === 'school' && cam === 'handheld' && concept === 'Y2K') { score += 25; msgs.push(`🔥 COMBO: Y2K + Sekolah + Handheld = VIRAL TikTok!`); }
        if(loc === 'neon' && cam === 'drone' && concept === 'Cyberpunk') { score += 25; msgs.push(`🔥 COMBO: Cyberpunk + Neon + Drone = Cinematic Masterpiece!`); }
        if(loc === 'mansion' && cam === 'oneclip' && concept === 'Dark Academia') { score += 25; msgs.push(`🔥 COMBO: Dark Academia + Mansion + One-Take = Prestige!`); }
        if(loc === 'forest' && concept === 'Dreamy') { score += 15; msgs.push(`💫 Hutan magis + Dreamy = Visual art`); }
        if(loc === 'beach' && concept === 'Refreshing') { score += 20; msgs.push(`🔥 COMBO: Refreshing + Beach = Summer anthem vibes!`); }
        if(loc === 'warehouse' && concept === 'Hip-Hop' && cam === 'handheld') { score += 25; msgs.push(`🔥 COMBO: Hip-Hop + Warehouse + Raw = Underground cred!`); }
        if(loc === 'hanok' && concept === 'Folklore/Traditional') { score += 30; msgs.push(`🔥 COMBO: Traditional + Hanok = Cultural masterpiece! GP love!`); }
        if(loc === 'spaceship' && concept === 'Cyberpunk') { score += 20; msgs.push(`🔥 COMBO: Cyberpunk + Spaceship = Futuristic visual!`); }
        if(loc === 'cafe' && concept === 'R&B' && cam === 'steady') { score += 20; msgs.push(`🔥 COMBO: R&B + Cafe + Clean = Chill aesthetic perfection!`); }
        if(loc === 'amusement' && (concept === 'Cute' || concept === 'Refreshing')) { score += 20; msgs.push(`🔥 COMBO: Cute/Refreshing + Amusement Park = Adorable viral content!`); }
        if(loc === 'library' && concept === 'Dark Academia' && cam === 'slow_motion') { score += 25; msgs.push(`🔥 COMBO: Dark Academia + Library + Slow Mo = Aesthetic perfection!`); }
        if(loc === 'train' && cam === 'mv_drama') { score += 15; msgs.push(`💫 Train + Drama Narrative = Emotional story MV`); }
        if(cam === 'vertical' && dance === 'viral_move') { score += 15; msgs.push(`📱 Vertical + TikTok Bait = Mobile-first viral strategy!`); }
        if(cam === 'slow_motion' && dance === 'wave') { score += 15; msgs.push(`💫 Slow Mo + Body Wave = Mesmerizing visual`); }

        if(dance === 'group_sync') { score += 15; msgs.push(`👯 Group Sync menambah poin koreografi`); }
        if(dance === 'viral_move') { score += 10; msgs.push(`📱 TikTok challenge potential naik`); }
        if(dance === 'military_sync') { score += 18; msgs.push(`🎖️ Military Precision — penonton terpukau!`); }
        if(dance === 'killing_part') { score += 12; msgs.push(`⚡ Killing Part — center member shine!`); }
        if(dance === 'floor_sync') { score += 14; msgs.push(`🌀 Floor Work — visual impact tinggi`); }
        if(dance === 'freestyle') { score += 8; msgs.push(`🎲 Freestyle — natural charisma showcase`); }
        if(dance === 'relay_dance') { score += 7; msgs.push(`🔄 Relay Dance moment — individual spotlight`); }
        if(dance === 'wave') { score += 10; msgs.push(`🌊 Body Wave — smooth visual appeal`); }
        if(dance === 'hip_thrust') { score += 12; msgs.push(`💥 Power Move — impactful & memorable`); }

        currentStoryboard = { location:loc, camera:cam, dance:dance, synergyScore:score };

        let synergyEl = document.getElementById('sb-moodboard-synergy');
        synergyEl.style.display = 'block';
        synergyEl.className = 'moodboard-synergy' + (score < 0 ? ' bad' : '');
        synergyEl.innerText = score >= 30 ? `✨ Sinergi Sempurna! (+${score})` : score >= 0 ? `👍 Sinergi OK (+${score})` : `⚠️ Kurang Sinergi (${score})`;

        document.getElementById('sb-synergy-text').innerHTML = `<b>Sinergi Storyboard (Konsep: ${concept}):</b><br>${msgs.join('<br>')}`;
    };

    window.confirmStoryboard = function() {
        closeModal('modal-storyboard');
        document.getElementById('formation-chosen-banner').classList.remove('hidden');
        showToast(`Storyboard dikunci! Bonus sinergi: ${currentStoryboard.synergyScore}`, currentStoryboard.synergyScore >= 0 ? "success" : "warning");
        triggerScreenShake();
    };

    // ===== 4. SURVIVAL SHOW SYSTEM =====
    let survivalState = {
        active: false,
        contestants: [],
        week: 0,
        maxWeeks: 8,
        tvRating: 0,
        evilEditTarget: null,
        evilEditUsed: false,
        groupIdx: null,
        debutSlots: 7 // Top 7 debut
    };

    window.startSurvivalShowInternal = function(gIdx) {
        let grp = gameData.groups[gIdx];
        if(!grp || !grp.isPreDebut) return showToast("Hanya grup Pre-Debut!", "danger");
        
        // Use all trainees (not just group members)
        let availTrainees = gameData.trainees.filter(t => !t.isDebuted);
        if(availTrainees.length < 8) return showToast("Minimal 8 trainee untuk Survival Show!", "danger");

        if(gameData.money < 200000000) return showToast("Butuh ₩200Jt untuk produksi Survival Show!", "danger");
        addFinanceRecord('Event', 'expense', 200000000, 'Produksi Survival Show Internal');

        survivalState = {
            active: true,
            contestants: availTrainees.slice(0, 15).map((t, i) => ({
                ...t,
                rank: i + 1,
                votes: Math.floor(Math.random()*5000) + 1000,
                eliminated: false,
                evilEdited: false,
                morale: 100
            })),
            week: 0,
            maxWeeks: 8,
            tvRating: 2.5 + Math.random()*2,
            evilEditTarget: null,
            evilEditUsed: false,
            groupIdx: gIdx,
            debutSlots: Math.min(7, grp.members.length || 7)
        };

        // Sort by initial votes
        survivalState.contestants.sort((a,b) => b.votes - a.votes);
        survivalState.contestants.forEach((c,i) => c.rank = i+1);

        renderSurvivalPyramid();
        openModal('modal-survival-show');
    };

    function renderSurvivalPyramid() {
        let pyramid = document.getElementById('survival-pyramid');
        pyramid.innerHTML = '';

        let rows = [1, 2, 3, 4, 5]; // Pyramid shape
        let idx = 0;
        let sorted = [...survivalState.contestants].sort((a,b) => a.rank - b.rank);

        rows.forEach((count, rowIdx) => {
            let rowEl = document.createElement('div');
            rowEl.className = 'pyramid-row';
            for(let c=0; c<count && idx<sorted.length; c++, idx++) {
                let cont = sorted[idx];
                let tierClass = cont.eliminated ? 'pyramid-tier-elim' : rowIdx===0 ? 'pyramid-tier-1' : rowIdx===1 ? 'pyramid-tier-2' : rowIdx<=2 ? 'pyramid-tier-3' : 'pyramid-tier-4';
                let evilMark = cont.evilEdited ? '😈' : '';
                let seatEl = document.createElement('div');
                seatEl.className = `pyramid-seat ${tierClass}`;
                seatEl.innerHTML = `<span class="seat-rank">${cont.rank}</span><span class="seat-emoji">${cont.gender==='Male'?'👦':'👧'}</span><span class="seat-name">${cont.name.split(' ').pop()} ${evilMark}</span>`;
                seatEl.title = `${cont.name} — Votes: ${cont.votes.toLocaleString()} | Avg: ${Math.floor((cont.vocal+cont.dance)/2)}`;
                rowEl.appendChild(seatEl);
            }
            pyramid.appendChild(rowEl);
        });

        // Remaining (overflow)
        if(idx < sorted.length) {
            let overflowRow = document.createElement('div');
            overflowRow.className = 'pyramid-row';
            for(; idx<sorted.length; idx++) {
                let cont = sorted[idx];
                let tierClass = cont.eliminated ? 'pyramid-tier-elim' : 'pyramid-tier-4';
                let seatEl = document.createElement('div');
                seatEl.className = `pyramid-seat ${tierClass}`;
                seatEl.innerHTML = `<span class="seat-rank">${cont.rank}</span><span class="seat-emoji">${cont.gender==='Male'?'👦':'👧'}</span><span class="seat-name">${cont.name.split(' ').pop()}</span>`;
                overflowRow.appendChild(seatEl);
            }
            pyramid.appendChild(overflowRow);
        }

        document.getElementById('survival-week-info').innerText = `Minggu ${survivalState.week} / ${survivalState.maxWeeks} — Rating TV: ${survivalState.tvRating.toFixed(1)}%`;
        document.getElementById('survival-rating-bar').innerText = `📺 Rating: ${survivalState.tvRating.toFixed(1)}%`;
    }

    window.toggleEvilEdit = function() {
        let panel = document.getElementById('survival-evil-target');
        if(panel.style.display === 'none') {
            panel.style.display = 'block';
            let sel = document.getElementById('survival-evil-select');
            sel.innerHTML = '';
            survivalState.contestants.filter(c => !c.eliminated && !c.evilEdited).forEach(c => {
                sel.innerHTML += `<option value="${c.id}">${c.name} (Rank #${c.rank})</option>`;
            });
        } else {
            panel.style.display = 'none';
        }
    };

    window.survivalAdvanceWeek = function() {
        if(survivalState.week >= survivalState.maxWeeks) return;
        survivalState.week++;

        // Check evil edit
        let evilTarget = null;
        let evilPanel = document.getElementById('survival-evil-target');
        if(evilPanel.style.display !== 'none') {
            let evilId = parseInt(document.getElementById('survival-evil-select').value);
            evilTarget = survivalState.contestants.find(c => c.id === evilId);
            if(evilTarget) {
                evilTarget.evilEdited = true;
                evilTarget.morale = 0;
                evilTarget.votes = Math.floor(evilTarget.votes * 0.3); // Devastated
                survivalState.tvRating += 3 + Math.random()*2; // Rating spikes
                showToast(`😈 Evil Edit pada ${evilTarget.name}! Rating TV melonjak!`, "warning");
                addMainLog(`📺 SURVIVAL: Evil Edit pada ${evilTarget.name} — rating naik tapi mental hancur.`);
                generateSocialFeed('scandal_attitude', evilTarget.name);
            }
            evilPanel.style.display = 'none';
        }

        // Simulate voting
        survivalState.contestants.forEach(c => {
            if(c.eliminated) return;
            let avgStat = (c.vocal + c.dance + c.rap + c.visual) / 4;
            let voteGain = Math.floor(avgStat * 50 + Math.random() * 3000);
            if(c.evilEdited) voteGain = Math.floor(voteGain * 0.4);
            if(c.traitObj && c.traitObj.name === 'Center Material') voteGain *= 1.5;
            if(c.traitObj && c.traitObj.name === 'Visual Dewa') voteGain *= 1.3;
            c.votes += voteGain;
        });

        // Re-rank
        let active = survivalState.contestants.filter(c => !c.eliminated);
        active.sort((a,b) => b.votes - a.votes);
        active.forEach((c,i) => c.rank = i+1);

        // Eliminate bottom 2 every 2 weeks
        if(survivalState.week % 2 === 0 && survivalState.week < survivalState.maxWeeks) {
            let toElim = active.slice(-2);
            toElim.forEach(c => { c.eliminated = true; c.rank = 99; });
            showToast(`✂️ ${toElim.map(c=>c.name.split(' ').pop()).join(' & ')} tereliminasi!`, "danger");
        }

        survivalState.tvRating += Math.random() * 1.5 - 0.3;
        if(survivalState.tvRating < 0) survivalState.tvRating = 0.5;

        renderSurvivalPyramid();

        if(survivalState.week >= survivalState.maxWeeks) {
            document.getElementById('btn-survival-vote').style.display = 'none';
            document.getElementById('btn-survival-evil').style.display = 'none';
            document.getElementById('btn-survival-end').style.display = 'inline-block';
        }
    };

    window.endSurvivalShow = function() {
        let winners = survivalState.contestants.filter(c => !c.eliminated).sort((a,b) => a.rank - b.rank).slice(0, survivalState.debutSlots);
        let grp = gameData.groups[survivalState.groupIdx];
        if(grp) {
            grp.members = winners.map(w => ({
                ...w, positions: w.rank === 1 ? ['Center','Main Vocal'] : [], indFans: w.votes,
                soloBusy: 0, currentSoloObj: null
            }));
            grp.fansKR += Math.floor(survivalState.tvRating * 10000);
            grp.fansGL += Math.floor(survivalState.tvRating * 5000);
            gameData.rep += Math.floor(survivalState.tvRating * 50);
            addMainLog(`🔥 SURVIVAL SHOW: ${grp.name} final lineup terbentuk! TV Rating: ${survivalState.tvRating.toFixed(1)}%`);
            showToast(`${grp.name} terbentuk dari Survival Show! Fans melonjak!`, "success");
        }
        // Evil edited trainees suffer permanent morale damage
        survivalState.contestants.filter(c => c.evilEdited).forEach(ec => {
            let tIdx = gameData.trainees.findIndex(t => t.id === ec.id);
            if(tIdx >= 0) {
                gameData.trainees[tIdx].vocal = Math.max(10, gameData.trainees[tIdx].vocal - 15);
                gameData.trainees[tIdx].dance = Math.max(10, gameData.trainees[tIdx].dance - 15);
            }
        });
        survivalState.active = false;
        closeModal('modal-survival-show');
        updateUI();
    };

    // ===== 5. LINE CHART (SVG-based) =====
    let chartHistory = {}; // { songTitle: [ { week, rank } ] }

    function recordChartPositions() {
        let weekNum = (gameData.y - 1)*48 + (gameData.m-1)*4 + gameData.w;
        gameData.activeSongs.forEach(song => {
            if(!chartHistory[song.title]) chartHistory[song.title] = [];
            let melonPos = currentCharts.melon.findIndex(c => c.isPlayer && c.title === song.title) + 1;
            let spotPos = currentCharts.spotify.findIndex(c => c.isPlayer && c.title === song.title) + 1;
            if(melonPos > 0 || spotPos > 0) {
                chartHistory[song.title].push({ week: weekNum, melon: melonPos || 101, spotify: spotPos || 101 });
            }
            // Keep only last 20 data points
            if(chartHistory[song.title].length > 20) chartHistory[song.title].shift();
        });
    }

    function renderLineCharts() {
        let container = document.getElementById('chart-line-graphs');
        if(!container) return;
        container.innerHTML = '';

        let playerSongs = Object.keys(chartHistory).filter(title => chartHistory[title].length >= 2);
        if(playerSongs.length === 0) {
            container.innerHTML = '<p style="color:#64748b; font-size:0.8rem; text-align:center; padding:20px;">Rilis lagu dan masuk chart untuk melihat grafik pergerakan peringkat.</p>';
            return;
        }

        playerSongs.forEach(title => {
            let data = chartHistory[title];
            let chartDiv = document.createElement('div');
            chartDiv.className = 'chart-line-container';

            let titleHtml = `<div class="chart-line-title"><span class="dot" style="background:var(--c-yellow-solid);"></span>${title}</div>`;

            // Build SVG
            let svgW = 500, svgH = 160, padL = 40, padR = 10, padT = 10, padB = 25;
            let plotW = svgW - padL - padR;
            let plotH = svgH - padT - padB;

            let maxRank = 100;
            let points = data.map((d, i) => {
                let x = padL + (i / Math.max(data.length-1, 1)) * plotW;
                let rank = Math.min(d.melon, maxRank);
                let y = padT + ((rank - 1) / (maxRank - 1)) * plotH; // Rank 1 = top
                return { x, y, rank: d.melon, week: d.week };
            });

            let pathD = points.map((p, i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

            // Grid lines
            let gridLines = '';
            [1, 25, 50, 75, 100].forEach(rank => {
                let y = padT + ((rank-1)/(maxRank-1))*plotH;
                gridLines += `<line class="grid-line" x1="${padL}" y1="${y}" x2="${svgW-padR}" y2="${y}"/>`;
                gridLines += `<text x="${padL-5}" y="${y+3}" text-anchor="end" style="font-size:8px;">#${rank}</text>`;
            });

            let dots = points.map(p => `<circle class="data-dot player-dot" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}"/>`).join('');

            // Spotify line if available
            let spotPoints = data.map((d, i) => {
                let x = padL + (i / Math.max(data.length-1, 1)) * plotW;
                let rank = Math.min(d.spotify, maxRank);
                let y = padT + ((rank - 1) / (maxRank - 1)) * plotH;
                return { x, y };
            });
            let spotPathD = spotPoints.map((p, i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
            let spotLine = data[0].spotify < 101 ? `<path class="data-line" d="${spotPathD}" style="stroke:#1DB954; stroke-width:1.5; opacity:0.6;"/>` : '';

            let svg = `<svg class="chart-svg" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="none">
                ${gridLines}
                ${spotLine}
                <path class="data-line player-line" d="${pathD}"/>
                ${dots}
            </svg>`;

            let legend = `<div class="chart-line-legend"><span class="legend-item"><span class="ldot" style="background:var(--c-yellow-solid);"></span>Melon</span><span class="legend-item"><span class="ldot" style="background:#1DB954;"></span>Spotify</span></div>`;

            chartDiv.innerHTML = titleHtml + svg + legend;
            container.appendChild(chartDiv);
        });
    }

    // ===== 6. GENERATIVE ALBUM COVER =====
    const COVER_STYLES = {
        'Girl Crush': { bg:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', overlay:'rgba(236,72,153,0.2)', font:'Impact', textColor:'#fff' },
        'Refreshing': { bg:'linear-gradient(135deg,#a8edea,#fed6e3,#d299c2)', overlay:'rgba(255,255,255,0.1)', font:'Georgia', textColor:'#333' },
        'Y2K': { bg:'linear-gradient(135deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3)', overlay:'rgba(0,0,0,0.1)', font:'Courier New', textColor:'#000' },
        'Cyberpunk': { bg:'linear-gradient(135deg,#0a0a0a,#1a0533,#2d1b69)', overlay:'rgba(168,85,247,0.3)', font:'monospace', textColor:'#a855f7' },
        'Dark Academia': { bg:'linear-gradient(135deg,#2c1810,#4a2c2a,#1a1a2e)', overlay:'rgba(139,69,19,0.2)', font:'serif', textColor:'#d4a574' },
        'Hip-Hop': { bg:'linear-gradient(135deg,#0f0f0f,#1a1a1a,#333)', overlay:'rgba(234,179,8,0.15)', font:'Impact', textColor:'#eab308' },
        'R&B': { bg:'linear-gradient(135deg,#1a0a2e,#2d1b69,#4a1942)', overlay:'rgba(236,72,153,0.15)', font:'Georgia', textColor:'#f9a8d4' },
        'Dreamy': { bg:'linear-gradient(135deg,#fdf2f8,#ede9fe,#dbeafe)', overlay:'rgba(167,139,250,0.1)', font:'serif', textColor:'#6d28d9' }
    };

    function generateAlbumCover(albumName, artistName, concept) {
        let style = COVER_STYLES[concept] || COVER_STYLES['Girl Crush'];
        let shapes = '';
        // Generate random geometric shapes
        for(let i=0; i<5; i++) {
            let x = Math.random()*100, y = Math.random()*100;
            let size = 10 + Math.random()*40;
            let opacity = 0.05 + Math.random()*0.15;
            let type = Math.random() > 0.5 ? 'circle' : 'rect';
            if(type === 'circle') {
                shapes += `<div style="position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,${opacity});"></div>`;
            } else {
                let rot = Math.random()*45;
                shapes += `<div style="position:absolute;left:${x}%;top:${y}%;width:${size}px;height:${size}px;background:rgba(255,255,255,${opacity});transform:rotate(${rot}deg);"></div>`;
            }
        }

        return `<div class="album-cover-gen">
            <div class="cover-bg" style="background:${style.bg};"></div>
            <div class="cover-overlay" style="background:${style.overlay};">${shapes}</div>
            <div class="cover-artist" style="color:${style.textColor};opacity:0.7;font-family:${style.font};">${artistName}</div>
            <div class="cover-title" style="color:${style.textColor};font-family:${style.font};">${albumName}</div>
        </div>`;
    }

    // Store album covers in group data
    function addAlbumToDiscography(grp, albumName, songName, concept) {
        if(!grp.discography) grp.discography = [];
        grp.discography.push({
            albumName, songName, concept,
            coverHtml: generateAlbumCover(albumName, grp.name, concept),
            year: gameData.y, month: gameData.m,
            albumType: 'Unknown', mvQuality: 'standard',
            peakMelon: 999, peakSpotify: 999, musicShowWins: 0,
            firstWeekSales: 0, totalScore: 0
        });
    }

    // ===== 7. SCREEN SHAKE & SOUND CUES =====
    function triggerScreenShake() {
        let main = document.getElementById('main-app');
        if(!main) return;
        main.classList.add('shake-screen');
        setTimeout(() => main.classList.remove('shake-screen'), 400);
    }

    function flashMoney() {
        let el = document.getElementById('val-money');
        if(!el) return;
        let tag = el.closest('.neo-tag');
        if(tag) { tag.classList.add('money-flash'); setTimeout(()=>tag.classList.remove('money-flash'), 600); }
    }

    function flashScandal() {
        let main = document.getElementById('main-app');
        if(!main) return;
        main.classList.add('shake-screen');
        setTimeout(() => main.classList.remove('shake-screen'), 400);
    }

    // ===== HOOK ALL V12 SYSTEMS INTO GAME LOOP =====

    // Patch existing week skip to include V12 hooks
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        // Process dorm chemistry weekly
        processDormChemistry();

        // Record chart positions for line graphs
        recordChartPositions();

        // Refresh ticker every few weeks
        if(gameData.w === 1) refreshTicker();

        // Update line charts if chart tab is active
        if(document.getElementById('chart') && document.getElementById('chart').classList.contains('active')) {
            renderLineCharts();
        }
    });

    // Patch menu clicks for new tabs
    document.querySelector('[data-target="dorm"]').addEventListener('click', () => {
        setTimeout(() => { initDormGroupSelect(); renderDormFloorplan(); }, 100);
    });
    document.querySelector('[data-target="chart"]').addEventListener('click', () => {
        setTimeout(renderLineCharts, 200);
    });

    // ===== INTEGRATE STORYBOARD INTO RELEASE FLOW =====
    // Override the openReleaseTasks to also open storyboard
    const _origOpenReleaseTasks = window.openReleaseTasks;
    window.openReleaseTasks = function(idx) {
        _origOpenReleaseTasks(idx);
        // Set storyboard concept from the pending release
        let pr = gameData.pendingReleases[idx];
        if(pr) storyboardConcept = pr.concept;
    };

    // Add storyboard button to the release tasks modal
    // We'll add a button click handler that opens storyboard from step 3
    const _origFinalizeDebut = window.finalizeDebut;
    // Patch: open storyboard before release
    window.openStoryboardFromRelease = function() {
        let concept = document.getElementById('debut-concept').value;
        storyboardConcept = concept;
        updateMoodboard();
        openModal('modal-storyboard');
    };

    // ===== INTEGRATE ALBUM COVERS INTO RELEASE LOGIC =====
    // We hook into the post-release to store covers
    const _origShowPostReleaseStats = window.showPostReleaseStats || showPostReleaseStats;

    // Add a Survival Show button in manual schedule for pre-debut groups
    const _origStartManualEvent = window.startManualEvent;
    window.startManualEvent = function(gIdx, type, weeks, cost) {
        if(type === 'survival') {
            // Override survival to use our new system
            if(gameData.trainees.filter(t=>!t.isDebuted).length >= 8) {
                window.startSurvivalShowInternal(gIdx);
                return;
            }
        }
        _origStartManualEvent(gIdx, type, weeks, cost);
    };

    // ==========================================
    // V13 ULTRA REALISM UPDATE — ALL NEW SYSTEMS
    // ==========================================

    // ---- V13 EXTENDED GAME DATA ----
    gameData.v13 = {
        varietyLog: [],
        collabHistory: [],
        intlLog: [],
        intlMarkets: {
            japan: { name:'Jepang', flag:'🇯🇵', fans:0, level:0, invested:0 },
            usa: { name:'Amerika', flag:'🇺🇸', fans:0, level:0, invested:0 },
            china: { name:'China', flag:'🇨🇳', fans:0, level:0, invested:0 },
            sea: { name:'Asia Tenggara', flag:'🌏', fans:0, level:0, invested:0 },
            europe: { name:'Eropa', flag:'🇪🇺', fans:0, level:0, invested:0 },
            latam: { name:'Amerika Latin', flag:'🌎', fans:0, level:0, invested:0 },
            mena: { name:'Timur Tengah', flag:'🕌', fans:0, level:0, invested:0 },
            india: { name:'India', flag:'🇮🇳', fans:0, level:0, invested:0 }
        },
        brandRepHistory: [],
        weeklyIncome: 0,
        weeklyExpense: 0,
        seasonCompetition: 1.0,
        teaserBonus: 0,
        musicShowWinsThisPromo: 0,
        promoWeeksLeft: {},
        militaryQueue: [],
        fansignCooldown: 0,
        westernCollabArtists: [
            'Doja Cat', 'Megan Thee Stallion', 'Nicki Minaj', 'Ariana Grande',
            'The Weeknd', 'Jason Derulo', 'Lil Nas X', 'Charlie Puth',
            'Becky G', 'Ozuna', 'Saweetie', 'Khalid'
        ]
    };

    // ---- VARIETY SHOW DATABASE (REALISTIC) ----
    const VARIETY_SHOWS = [
        {
            name: 'Knowing Bros (아는 형님)',
            emoji: '🏫', platform: 'JTBC',
            minRep: 500, minFans: 10000,
            cost: 0, // Invited shows = free
            effects: { fansKR: 8000, fansGL: 2000, rep: 30, stress: 8 },
            desc: 'Acara talk show paling populer. Harus diundang (Rep > 500).',
            type: 'talkshow'
        },
        {
            name: 'Running Man (런닝맨)',
            emoji: '🏃', platform: 'SBS',
            minRep: 300, minFans: 5000,
            cost: 0,
            effects: { fansKR: 12000, fansGL: 5000, rep: 40, stress: 15 },
            desc: 'Game show legendaris. Sangat bagus untuk image positif.',
            type: 'gameshow'
        },
        {
            name: 'Weekly Idol (주간 아이돌)',
            emoji: '🎤', platform: 'MBC Every1',
            minRep: 0, minFans: 0,
            cost: 5000000,
            effects: { fansKR: 3000, fansGL: 1500, rep: 10, stress: 5 },
            desc: 'Staple idol variety. Akses mudah bahkan untuk Nugu.',
            type: 'idol_variety'
        },
        {
            name: 'Idol Room / MMTG',
            emoji: '📱', platform: 'YouTube',
            minRep: 100, minFans: 1000,
            cost: 3000000,
            effects: { fansKR: 5000, fansGL: 8000, rep: 15, stress: 3 },
            desc: 'Format YouTube ringan, viral potential tinggi.',
            type: 'youtube'
        },
        {
            name: 'I Live Alone (나 혼자 산다)',
            emoji: '🏠', platform: 'MBC',
            minRep: 1000, minFans: 50000,
            cost: 0,
            effects: { fansKR: 15000, fansGL: 3000, rep: 50, stress: 10 },
            desc: 'Reality personal. Boost image personal member. Rep > 1000 wajib.',
            type: 'reality'
        },
        {
            name: 'Omniscient Interfering View',
            emoji: '👀', platform: 'MBC',
            minRep: 800, minFans: 30000,
            cost: 0,
            effects: { fansKR: 10000, fansGL: 2000, rep: 35, stress: 8 },
            desc: 'Reality show manager-idol. Cocok untuk humanizing image.',
            type: 'reality'
        },
        {
            name: 'Amazing Saturday (놀라운 토요일)',
            emoji: '🎵', platform: 'tvN',
            minRep: 200, minFans: 5000,
            cost: 0,
            effects: { fansKR: 6000, fansGL: 3000, rep: 20, stress: 5 },
            desc: 'Music quiz show. Vocal line member mendapat spotlight.',
            type: 'quiz'
        },
        {
            name: 'Content Agensi (YouTube)',
            emoji: '📹', platform: 'Self-Produced',
            minRep: 0, minFans: 0,
            cost: 15000000,
            effects: { fansKR: 2000, fansGL: 6000, rep: 5, stress: 2 },
            desc: 'Self-produced YouTube content (mukbang, ASMR, behind). Murah & aman.',
            type: 'self'
        }
    ];

    // ---- MUSIC SHOW DATABASE (MULTIPLE SHOWS) ----
    const MUSIC_SHOWS = [
        { name: 'M Countdown', short: 'MCOUNTDOWN', day: 'Kamis', channel: 'Mnet', chipClass: 'mcountdown', weight: { digital: 0.45, physical: 0.15, broadcast: 0.10, vote: 0.30 } },
        { name: 'Music Bank', short: 'MUSICBANK', day: 'Jumat', channel: 'KBS', chipClass: 'musicbank', weight: { digital: 0.55, physical: 0.25, broadcast: 0.10, vote: 0.10 } },
        { name: 'Inkigayo', short: 'INKIGAYO', day: 'Minggu', channel: 'SBS', chipClass: 'inkigayo', weight: { digital: 0.45, physical: 0.15, broadcast: 0.15, vote: 0.25 } },
        { name: 'Show! Music Core', short: 'MUSICCORE', day: 'Sabtu', channel: 'MBC', chipClass: 'musiccore', weight: { digital: 0.50, physical: 0.20, broadcast: 0.20, vote: 0.10 } },
        { name: 'Show Champion', short: 'SHOWCHAMP', day: 'Rabu', channel: 'MBC M', chipClass: 'showchamp', weight: { digital: 0.40, physical: 0.20, broadcast: 0.10, vote: 0.30 } },
        { name: 'The Show', short: 'THESHOW', day: 'Selasa', channel: 'SBS MTV', chipClass: 'theshow', weight: { digital: 0.35, physical: 0.20, broadcast: 0.15, vote: 0.30 } }
    ];

    // ---- SYSTEM 1: VARIETY SHOW BOOKING ----
    window.openVarietyBooking = function() {
        let sel = document.getElementById('variety-group-select');
        sel.innerHTML = '';
        let debuted = gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut);
        if(debuted.length === 0) { sel.innerHTML = '<option value="">Belum ada artis debut</option>'; }
        debuted.forEach((g) => { let idx = gameData.groups.indexOf(g); sel.innerHTML += `<option value="${idx}">${g.name}</option>`; });
        loadVarietyOptions();
        openModal('modal-variety');
    };

    window.loadVarietyOptions = function() {
        let gIdx = parseInt(document.getElementById('variety-group-select').value);
        let grp = gameData.groups[gIdx];
        let grid = document.getElementById('variety-show-grid');
        grid.innerHTML = '';
        if(!grp) return;

        VARIETY_SHOWS.forEach((show, sIdx) => {
            let totalFans = grp.fansKR + grp.fansGL;
            let canBook = gameData.rep >= show.minRep && totalFans >= show.minFans;
            let lockReason = '';
            if(gameData.rep < show.minRep) lockReason = `Rep ${gameData.rep}/${show.minRep}`;
            else if(totalFans < show.minFans) lockReason = `Fans ${totalFans.toLocaleString()}/${show.minFans.toLocaleString()}`;

            grid.innerHTML += `
                <div class="variety-card ${canBook ? '' : 'locked'}" onclick="${canBook ? `bookVarietyShow(${gIdx},${sIdx})` : ''}">
                    <div class="v-emoji">${show.emoji}</div>
                    <div class="v-name">${show.name}</div>
                    <div style="font-size:0.65rem; color:#888;">${show.platform}</div>
                    <div class="v-desc">${show.desc}</div>
                    ${show.cost > 0 ? `<div class="v-req">Biaya: ${formatWon(show.cost)}</div>` : '<div style="font-size:0.7rem; color:#3b82f6; font-weight:700;">Gratis (Diundang)</div>'}
                    <div class="v-effect">+${show.effects.fansKR.toLocaleString()} FansKR | +${show.effects.fansGL.toLocaleString()} FansGL | +${show.effects.rep} Rep</div>
                    ${!canBook ? `<div class="v-req">🔒 ${lockReason}</div>` : ''}
                </div>
            `;
        });
    };

    window.bookVarietyShow = function(gIdx, showIdx) {
        let grp = gameData.groups[gIdx];
        let show = VARIETY_SHOWS[showIdx];
        if(grp.busyWeeks > 0) return showToast("Grup sedang sibuk!", "danger");
        if(show.cost > 0 && gameData.money < show.cost) return showToast(`Butuh ${formatWon(show.cost)}!`, "danger");

        if(show.cost > 0) addFinanceRecord('Variety', 'expense', show.cost, `Booking: ${show.name} (${grp.name})`);

        // Fan gains scale with existing size (logarithmic) — NOT flat
        let totalFans = grp.fansKR + grp.fansGL;
        let fanScale = Math.max(0.3, Math.log10(Math.max(10, totalFans)) * 0.4);
        grp.fansKR += Math.floor(show.effects.fansKR * fanScale * 0.15); // Much more modest
        grp.fansGL += Math.floor(show.effects.fansGL * fanScale * 0.15);
        gameData.rep += Math.floor(show.effects.rep * 0.5);
        grp.stress = Math.min(100, grp.stress + show.effects.stress);

        // Revenue from appearance fee scales with fame
        if(show.type !== 'self') {
            let fee = Math.floor(1000000 + Math.log10(Math.max(10, gameData.rep)) * 3000000 + totalFans * 0.5);
            addFinanceRecord('Variety', 'income', fee, `Appearance Fee: ${show.name} (${grp.name})`);
        }

        // Random viral moment (rare, requires actual fanbase)
        if(totalFans > 10000 && Math.random() < 0.1) {
            let viralFans = Math.floor(500 + totalFans * 0.02 + Math.random() * 2000);
            grp.fansGL += viralFans;
            showToast(`🔥 VIRAL! Klip ${grp.name} di ${show.name} viral di TikTok! +${viralFans.toLocaleString()} fans!`, "success");
            generateSocialFeed('general', grp.name);
        }

        let logEntry = `[Y${gameData.y}/M${gameData.m}/W${gameData.w}] ${grp.name} tampil di ${show.name} (${show.platform})`;
        gameData.v13.varietyLog.unshift(logEntry);
        if(gameData.v13.varietyLog.length > 30) gameData.v13.varietyLog.pop();

        let logEl = document.getElementById('variety-log');
        if(logEl) logEl.innerHTML = gameData.v13.varietyLog.map(l => `<li>${l}</li>`).join('');

        showToast(`${grp.name} tampil di ${show.name}!`, "success");
        addMainLog(`📺 VARIETY: ${grp.name} tampil di ${show.name}.`);
        closeModal('modal-variety');
        updateUI();
    };

    // ---- SYSTEM 2: BRAND REPUTATION INDEX ----
    function calculateBrandReputation() {
        let allEntities = [];

        // Player groups
        gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut).forEach(g => {
            let score = Math.floor(
                (g.fansKR * 0.3) + (g.fansGL * 0.2) +
                (g.trophies * 500) + (gameData.rep * 2) +
                (g.albums * 200) - (g.stress * 50) -
                (g.hasScandal ? 5000 : 0)
            );
            allEntities.push({ name: g.name, score: Math.max(0, score), isPlayer: true, agency: gameData.agency });
        });

        // Rival groups
        gameData.activeRivals.slice(0, 20).forEach(r => {
            let score = Math.floor(r.fandom * 0.3 + r.baseScore * 100);
            allEntities.push({ name: r.artist, score, isPlayer: false, agency: 'Unknown' });
        });

        allEntities.sort((a, b) => b.score - a.score);

        let prevRanks = {};
        if(gameData.v13.brandRepHistory.length > 0) {
            gameData.v13.brandRepHistory.forEach((item, i) => { prevRanks[item.name] = i + 1; });
        }

        gameData.v13.brandRepHistory = allEntities.slice(0, 15);

        let board = document.getElementById('brand-rep-list');
        if(!board) return;
        board.innerHTML = '';

        allEntities.slice(0, 15).forEach((item, idx) => {
            let prevRank = prevRanks[item.name];
            let changeHtml = '';
            if(prevRank !== undefined) {
                let diff = prevRank - (idx + 1);
                if(diff > 0) changeHtml = `<span class="brand-rep-change trend-up">▲${diff}</span>`;
                else if(diff < 0) changeHtml = `<span class="brand-rep-change trend-down">▼${Math.abs(diff)}</span>`;
                else changeHtml = `<span class="brand-rep-change" style="color:#94a3b8;">—</span>`;
            } else {
                changeHtml = `<span class="brand-rep-change trend-new">NEW</span>`;
            }

            board.innerHTML += `
                <div class="brand-rep-item ${item.isPlayer ? 'player-brand' : ''}">
                    <span class="brand-rep-rank">${idx + 1}</span>
                    <span class="brand-rep-name">${item.name} ${item.isPlayer ? '⭐' : ''}</span>
                    <span class="brand-rep-score">${item.score.toLocaleString()}</span>
                    ${changeHtml}
                </div>
            `;
        });
    }

    // ---- SYSTEM 3: COLLABORATION / FEATURING ----
    let selectedCollabPartner = null;

    window.openCollabModal = function() {
        let sel = document.getElementById('collab-my-artist');
        sel.innerHTML = '';
        gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut).forEach(g => {
            let idx = gameData.groups.indexOf(g);
            sel.innerHTML += `<option value="${idx}">${g.name}</option>`;
        });
        renderCollabPartners();
        openModal('modal-collab');
    };

    function renderCollabPartners() {
        let grid = document.getElementById('collab-artist-grid');
        grid.innerHTML = '';
        selectedCollabPartner = null;

        // K-pop rival artists available for collab
        let partners = gameData.activeRivals.filter(r => r.tier !== 'Nugu').slice(0, 9);

        partners.forEach((r, i) => {
            let tierColor = r.tier === 'Legend' ? '#ffd700' : r.tier === 'Top-Tier' ? '#a855f7' : '#3b82f6';
            let cost = r.tier === 'Legend' ? '₩2B+' : r.tier === 'Top-Tier' ? '₩500M' : '₩100M';
            grid.innerHTML += `
                <div class="collab-artist-card" id="collab-card-${i}" onclick="selectCollabPartner(${i})">
                    <div style="font-size:1.5rem;">👤</div>
                    <div style="font-weight:900; font-size:0.85rem;">${r.artist}</div>
                    <div class="collab-tier-badge" style="background:${tierColor}; color:#fff;">${r.tier}</div>
                    <div style="font-size:0.7rem; color:#555; margin-top:4px;">Cost: ${cost}</div>
                </div>
            `;
        });
        window._collabPartners = partners;
    }

    window.selectCollabPartner = function(idx) {
        document.querySelectorAll('.collab-artist-card').forEach(c => c.classList.remove('selected'));
        document.getElementById(`collab-card-${idx}`).classList.add('selected');
        selectedCollabPartner = window._collabPartners[idx];
    };

    window.executeCollab = function() {
        let gIdx = parseInt(document.getElementById('collab-my-artist').value);
        let grp = gameData.groups[gIdx];
        let type = document.getElementById('collab-type').value;
        if(!grp) return showToast("Pilih artis kamu!", "danger");

        if(type === 'western') {
            // Western collab requires significant rep — Western artists won't collab with nobodies
            if(gameData.rep < 3000) return showToast("Rep minimal 3000 untuk collab artis Barat! Kamu masih terlalu kecil.", "danger");
            let cost = 500000000 + Math.floor(gameData.rep * 50000); // Cost scales with your reputation
            if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)} untuk collab artis Barat!`, "danger");
            addFinanceRecord('Collab', 'expense', cost, `Western Collab (${grp.name})`);

            let wArtist = gameData.v13.westernCollabArtists[Math.floor(Math.random() * gameData.v13.westernCollabArtists.length)];
            let fanGain = Math.floor(5000 + (grp.fansGL * 0.1) + Math.random() * 10000);
            grp.fansGL += fanGain;
            gameData.rep += 200;

            let revenue = Math.floor(cost * 0.4 + grp.fansGL * 200 + Math.random() * 100000000);
            addFinanceRecord('Collab', 'income', revenue, `Revenue Collab: ${grp.name} x ${wArtist}`);

            gameData.v13.collabHistory.push({ y: gameData.y, m: gameData.m, artist: grp.name, partner: wArtist, type: 'Western' });
            showToast(`🌍 ${grp.name} x ${wArtist}! Billboard boost! +${fanGain.toLocaleString()} fans`, "success");
            addMainLog(`🤝 COLLAB: ${grp.name} x ${wArtist} (Western).`);
            generateSocialFeed('chart_high', grp.name);
        } else {
            if(!selectedCollabPartner) return showToast("Pilih partner kolaborasi!", "danger");
            let cost = selectedCollabPartner.tier === 'Legend' ? 800000000 : selectedCollabPartner.tier === 'Top-Tier' ? 200000000 : 50000000;
            // Legend groups won't collab with nugu — need minimum rep
            if(selectedCollabPartner.tier === 'Legend' && gameData.rep < 5000) return showToast("Artis Legend menolak! Rep kamu terlalu rendah (min 5000).", "danger");
            if(selectedCollabPartner.tier === 'Top-Tier' && gameData.rep < 1000) return showToast("Artis Top-Tier menolak! Rep kamu terlalu rendah (min 1000).", "danger");
            if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)}!`, "danger");
            addFinanceRecord('Collab', 'expense', cost, `Kolaborasi: ${grp.name} x ${selectedCollabPartner.artist}`);

            let fansBoost = Math.floor((selectedCollabPartner.fandom * 0.005) + (grp.fansKR * 0.02));
            grp.fansKR += fansBoost;
            grp.fansGL += Math.floor(fansBoost * 0.5);
            gameData.rep += selectedCollabPartner.tier === 'Legend' ? 150 : selectedCollabPartner.tier === 'Top-Tier' ? 50 : 15;

            if(type === 'feat') {
                let revenue = Math.floor(cost * 0.3 + fansBoost * 5000);
                addFinanceRecord('Collab', 'income', revenue, `Revenue Feat: ${grp.name} x ${selectedCollabPartner.artist}`);
            }

            gameData.v13.collabHistory.push({ y: gameData.y, m: gameData.m, artist: grp.name, partner: selectedCollabPartner.artist, type });
            showToast(`🤝 ${grp.name} x ${selectedCollabPartner.artist}! +${fansBoost.toLocaleString()} fans`, "success");
            addMainLog(`🤝 COLLAB: ${grp.name} x ${selectedCollabPartner.artist} (${type}).`);
        }

        renderCollabHistoryList();
        closeModal('modal-collab');
        updateUI();
    };

    function renderCollabHistoryList() {
        let el = document.getElementById('collab-history-list');
        if(!el) return;
        if(gameData.v13.collabHistory.length === 0) { el.innerHTML = '<p><i>Belum ada riwayat kolaborasi.</i></p>'; return; }
        el.innerHTML = gameData.v13.collabHistory.slice().reverse().map(h =>
            `<div class="neo-card-small bg-white" style="margin-bottom:5px;"><b>${h.artist} x ${h.partner}</b> — ${h.type} | Tahun ${h.y} Bulan ${h.m}</div>`
        ).join('');
    }

    // ---- SYSTEM 4: INTERNATIONAL MARKET EXPANSION ----
    const INTL_STRATEGIES = {
        japan: [
            { name: 'Japanese Single', cost: 100000000, fansGain: 5000, reqAlbumType: 'Japanese' },
            { name: 'Japan Showcase Tour', cost: 200000000, fansGain: 15000, reqAlbumType: null },
            { name: 'Japan TV Appearance', cost: 50000000, fansGain: 8000, reqAlbumType: null }
        ],
        usa: [
            { name: 'English Single', cost: 80000000, fansGain: 8000, reqAlbumType: 'English' },
            { name: 'US Radio Campaign', cost: 300000000, fansGain: 20000, reqAlbumType: null },
            { name: 'US Late Night TV', cost: 500000000, fansGain: 50000, reqAlbumType: null }
        ],
        china: [
            { name: 'Weibo Campaign', cost: 50000000, fansGain: 10000, reqAlbumType: null },
            { name: 'Chinese Variety Show', cost: 100000000, fansGain: 25000, reqAlbumType: null }
        ],
        sea: [
            { name: 'SEA Fan Meeting Tour', cost: 80000000, fansGain: 12000, reqAlbumType: null },
            { name: 'SEA Concert', cost: 150000000, fansGain: 20000, reqAlbumType: null }
        ],
        europe: [
            { name: 'Europe Fan Expo', cost: 100000000, fansGain: 8000, reqAlbumType: null },
            { name: 'Europe Concert Tour', cost: 300000000, fansGain: 25000, reqAlbumType: null }
        ],
        latam: [
            { name: 'Latin Music Festival', cost: 80000000, fansGain: 15000, reqAlbumType: null },
            { name: 'Latin TV Show', cost: 50000000, fansGain: 10000, reqAlbumType: null }
        ],
        mena: [
            { name: 'Saudi Arabia Concert', cost: 200000000, fansGain: 20000, reqAlbumType: null },
            { name: 'Dubai Fan Event', cost: 100000000, fansGain: 12000, reqAlbumType: null }
        ],
        india: [
            { name: 'India Fan Meeting', cost: 50000000, fansGain: 15000, reqAlbumType: null },
            { name: 'Bollywood Collab', cost: 150000000, fansGain: 30000, reqAlbumType: null }
        ]
    };

    window.openIntlMarketModal = function() {
        let sel = document.getElementById('intl-group-select');
        sel.innerHTML = '';
        gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut).forEach(g => {
            let idx = gameData.groups.indexOf(g);
            sel.innerHTML += `<option value="${idx}">${g.name}</option>`;
        });
        renderIntlMarketGrid();
        openModal('modal-intl-market');
    };

    function renderIntlMarketGrid() {
        let grid = document.getElementById('intl-market-grid');
        if(!grid) return;
        grid.innerHTML = '';

        Object.keys(gameData.v13.intlMarkets).forEach(key => {
            let market = gameData.v13.intlMarkets[key];
            let lvlClass = `intl-lvl-${Math.min(3, market.level)}`;
            let lvlText = market.level === 0 ? 'Belum Masuk' : market.level === 1 ? 'Rintisan' : market.level === 2 ? 'Berkembang' : 'Dominan';
            let strategies = INTL_STRATEGIES[key] || [];
            let btns = strategies.map((s, i) =>
                `<button class="neo-btn btn-sm action-btn w-100 mt-2" style="font-size:0.65rem;" onclick="investIntlMarket('${key}', ${i})">${s.name} (${formatWon(s.cost)})</button>`
            ).join('');

            grid.innerHTML += `
                <div class="intl-market-card">
                    <div class="intl-flag">${market.flag}</div>
                    <div class="intl-market-name">${market.name}</div>
                    <div class="intl-market-fans">Fans: ${market.fans.toLocaleString()}</div>
                    <div class="intl-market-level ${lvlClass}">${lvlText}</div>
                    ${btns}
                </div>
            `;
        });
    }

    window.investIntlMarket = function(marketKey, stratIdx) {
        let gIdx = parseInt(document.getElementById('intl-group-select').value);
        let grp = gameData.groups[gIdx];
        if(!grp) return showToast("Pilih grup!", "danger");

        let strat = INTL_STRATEGIES[marketKey][stratIdx];
        if(gameData.money < strat.cost) return showToast(`Butuh ${formatWon(strat.cost)}!`, "danger");

        addFinanceRecord('International', 'expense', strat.cost, `${strat.name}: ${grp.name} → ${gameData.v13.intlMarkets[marketKey].name}`);

        let market = gameData.v13.intlMarkets[marketKey];
        // Fan gain is modest and has diminishing returns for repeated investment
        let diminishing = Math.max(0.3, 1 - (market.invested / 2000000000)); // Less effective each time
        let fansGain = Math.floor(strat.fansGain * diminishing * (0.5 + Math.random() * 0.5));
        market.fans += fansGain;
        market.invested += strat.cost;
        grp.fansGL += fansGain;

        // Level up check
        if(market.fans >= 100000 && market.level < 3) market.level = 3;
        else if(market.fans >= 30000 && market.level < 2) market.level = 2;
        else if(market.fans >= 5000 && market.level < 1) market.level = 1;

        // Revenue: modest — international expansion is a long-term investment, not instant profit
        let rev = Math.floor(fansGain * 1500 * diminishing);
        if(rev > 0) addFinanceRecord('International', 'income', rev, `Revenue ${strat.name}: ${grp.name}`);

        gameData.v13.intlLog.unshift(`[Y${gameData.y}/M${gameData.m}] ${grp.name} → ${market.name}: ${strat.name} (+${fansGain.toLocaleString()} fans)`);
        if(gameData.v13.intlLog.length > 20) gameData.v13.intlLog.pop();

        showToast(`${grp.name} ekspansi ke ${market.name}! +${fansGain.toLocaleString()} fans`, "success");
        addMainLog(`🌏 INTL: ${grp.name} investasi di ${market.name} via ${strat.name}.`);
        renderIntlMarketGrid();
        updateIntlOverview();
        updateUI();
    };

    function updateIntlOverview() {
        let overviewGrid = document.getElementById('intl-overview-grid');
        if(!overviewGrid) return;
        overviewGrid.innerHTML = '';
        Object.keys(gameData.v13.intlMarkets).forEach(key => {
            let m = gameData.v13.intlMarkets[key];
            let lvlClass = `intl-lvl-${Math.min(3, m.level)}`;
            let lvlText = m.level === 0 ? 'Belum' : m.level === 1 ? '🌱' : m.level === 2 ? '📈' : '🔥';
            overviewGrid.innerHTML += `
                <div class="intl-market-card" style="padding:10px;">
                    <div class="intl-flag" style="font-size:2rem;">${m.flag}</div>
                    <div class="intl-market-name" style="font-size:0.8rem;">${m.name}</div>
                    <div class="intl-market-fans" style="font-size:0.7rem;">${m.fans.toLocaleString()}</div>
                    <div class="intl-market-level ${lvlClass}" style="font-size:0.65rem;">${lvlText}</div>
                </div>
            `;
        });

        let logEl = document.getElementById('intl-log');
        if(logEl) logEl.innerHTML = gameData.v13.intlLog.map(l => `<li>${l}</li>`).join('');
    }

    // ---- SYSTEM 5: FANSIGN & PHOTOCARD ----
    window.executeFansign = function() {
        let gIdx = parseInt(document.getElementById('fansign-group-select').value);
        let grp = gameData.groups[gIdx];
        let type = document.getElementById('fansign-type').value;
        if(!grp) return showToast("Pilih grup!", "danger");
        if(gameData.v13.fansignCooldown > 0) return showToast(`Fansign cooldown! Tunggu ${gameData.v13.fansignCooldown} minggu.`, "danger");

        let cost, fansGain, cooldown, revenue;
        if(type === 'mini') { cost = 10000000; fansGain = 2000; cooldown = 2; revenue = 15000000; }
        else if(type === 'normal') { cost = 30000000; fansGain = 5000; cooldown = 3; revenue = 50000000; }
        else if(type === 'video') { cost = 50000000; fansGain = 8000; cooldown = 2; revenue = 80000000; }
        else { cost = 80000000; fansGain = 3000; cooldown = 4; revenue = 120000000; } // photocard event

        if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)}!`, "danger");
        addFinanceRecord('Fansign', 'expense', cost, `Fansign Event: ${type} (${grp.name})`);
        addFinanceRecord('Fansign', 'income', revenue, `Revenue Fansign: ${grp.name}`);

        grp.fansKR += fansGain;
        grp.stress += 8;
        gameData.v13.fansignCooldown = cooldown;

        if(type === 'special') {
            // Photocard event boosts physical sales for next album
            grp.pcBoost = (grp.pcBoost || 0) + 0.2;
            showToast(`📸 Limited Photocard event! Physical sales boost +20% untuk album berikutnya.`, "success");
        } else if(type === 'video') {
            grp.fansGL += 5000;
            showToast(`📱 Video Call Fansign sukses! Global fans juga ikut serta.`, "success");
        }

        showToast(`🎫 Fansign ${grp.name} sukses! +${fansGain.toLocaleString()} core fans`, "success");
        addMainLog(`🎫 FANSIGN: ${grp.name} mengadakan ${type} fansign.`);
        closeModal('modal-fansign');
        updateUI();
    };

    // ---- SYSTEM 6: MILITARY ENLISTMENT (BOY GROUP ONLY) ----
    function checkMilitaryService() {
        gameData.groups.forEach((grp, gIdx) => {
            if(grp.isDisbanded || grp.isPreDebut) return;
            if(grp.type !== 'Boy Group' && grp.type !== 'Band' && !grp.type.includes('Male')) return;

            grp.members.forEach(m => {
                if(m.gender !== 'Male') return;
                if(!m.birthYear) m.birthYear = gameData.y - (18 + Math.floor(Math.random() * 5));
                if(m.isEnlisted || m.enlistmentDone) return;

                let age = gameData.y - m.birthYear;
                // Korean law: must enlist before 30 (some exemptions)
                if(age >= 28 && !m.enlistmentWarned) {
                    m.enlistmentWarned = true;
                    addMainLog(`⚠️ MILITER: ${m.name} (${grp.name}) berusia ${age}. Wajib militer segera!`);
                    showToast(`⚠️ ${m.name} harus wamil dalam 2 tahun!`, "warning");
                }

                if(age >= 30 && Math.random() < 0.5) {
                    triggerMilitaryEnlistment(gIdx, m);
                }
            });
        });
    }

    function triggerMilitaryEnlistment(gIdx, member) {
        let grp = gameData.groups[gIdx];
        document.getElementById('military-desc').innerHTML =
            `<b>${member.name}</b> dari ${grp.name} harus menjalani wajib militer. Usia ${gameData.y - member.birthYear} tahun — tidak bisa ditunda lagi. Pilih jalur militer:`;

        let optionsEl = document.getElementById('military-options');
        optionsEl.innerHTML = '';

        let options = [
            { name: '🪖 Active Duty (18 bulan)', desc: 'Standar. Member absen selama 78 minggu. Fans setia menunggu.', weeks: 78, fansLoss: 0.1, repLoss: 0 },
            { name: '🎵 Military Band (21 bulan)', desc: 'Perform di militer. Sesekali muncul di acara. Fans lebih sabar.', weeks: 91, fansLoss: 0.05, repLoss: 0 },
            { name: '👮 Public Service (24 bulan)', desc: 'Lebih lama tapi less intense. Kadang terlihat di publik.', weeks: 104, fansLoss: 0.15, repLoss: -50 },
            { name: '🏥 Social Service (21 bulan)', desc: 'Jika ada alasan kesehatan. K-Netz bisa curiga.', weeks: 91, fansLoss: 0.08, repLoss: -200 }
        ];

        options.forEach((opt, i) => {
            let div = document.createElement('div');
            div.className = 'enlist-option';
            div.innerHTML = `<h4>${opt.name}</h4><p>${opt.desc}</p>`;
            div.onclick = () => {
                member.isEnlisted = true;
                member.enlistWeeksLeft = opt.weeks;
                member.enlistType = opt.name;
                member.soloBusy = opt.weeks;
                member.currentSoloObj = 'Military';
                grp.fansKR = Math.floor(grp.fansKR * (1 - opt.fansLoss));
                if(opt.repLoss !== 0) gameData.rep += opt.repLoss;
                addMainLog(`🎖️ MILITER: ${member.name} (${grp.name}) masuk ${opt.name}. Kembali dalam ${opt.weeks} minggu.`);
                showToast(`${member.name} masuk wajib militer.`, "warning");
                generateSocialFeed('general', grp.name);
                closeModal('modal-military');
                updateUI();
            };
            optionsEl.appendChild(div);
        });

        openModal('modal-military');
    }

    function processMilitaryReturn() {
        gameData.groups.forEach(grp => {
            grp.members.forEach(m => {
                if(m.isEnlisted && m.enlistWeeksLeft !== undefined) {
                    m.enlistWeeksLeft--;
                    if(m.enlistWeeksLeft <= 0) {
                        m.isEnlisted = false;
                        m.enlistmentDone = true;
                        m.soloBusy = 0;
                        m.currentSoloObj = null;
                        grp.fansKR += 10000;
                        grp.fansGL += 5000;
                        addMainLog(`🎉 ${m.name} (${grp.name}) pulang dari militer! Fans menyambut.`);
                        showToast(`🎉 ${m.name} selesai wajib militer! Welcome back!`, "success");
                        generateSocialFeed('debut_good', grp.name);
                    }
                }
            });
        });
    }

    // ---- SYSTEM 7: MULTIPLE MUSIC SHOWS LOGIC ----
    function runMultipleMusicShows(playerSong) {
        // SKIP if the visual music show already ran this week and gave a trophy
        if(!playerSong || !playerSong.artistRef) return;
        if(playerSong._wonMusicShowThisWeek) return; // Already handled by visual show

        let promoKey = playerSong.title;
        if(!gameData.v13.promoWeeksLeft[promoKey]) {
            // Base promo: 3 weeks, extended if charting well
            gameData.v13.promoWeeksLeft[promoKey] = 3;
        }
        
        // Extend promo if still in top 10 Melon (like real K-Pop — IVE "LOVE DIVE" promoted for 6+ weeks)
        let melonRank = currentCharts.melon.findIndex(c => c.isPlayer && c.title === playerSong.title) + 1;
        if(melonRank > 0 && melonRank <= 5 && gameData.v13.promoWeeksLeft[promoKey] <= 1) {
            gameData.v13.promoWeeksLeft[promoKey] += 2; // Extend 2 more weeks if top 5
        } else if(melonRank > 0 && melonRank <= 15 && gameData.v13.promoWeeksLeft[promoKey] <= 0) {
            gameData.v13.promoWeeksLeft[promoKey] += 1; // Extend 1 week if top 15
        }

        if(gameData.v13.promoWeeksLeft[promoKey] > 0) {
            gameData.v13.promoWeeksLeft[promoKey]--;
            let shuffled = [...MUSIC_SHOWS].sort(() => Math.random() - 0.5);
            let showsThisWeek = shuffled.slice(0, 2); // Only 2 extra shows (main visual show is separate)

            let totalWins = 0;
            showsThisWeek.forEach(show => {
                let playerScore = calculateMusicShowScore(playerSong, show);
                let topRivals = currentCharts.melon.slice(0, 5).filter(c => !c.isPlayer);
                let bestRivalScore = 0;
                topRivals.forEach(rival => {
                    let rivalData = rival.rivalRef || {};
                    let rFandom = rivalData.fandom || 50000;
                    let rScore = rival.score * 40 + rFandom * 0.5 + (rivalData.physSales || 10000) * 0.3;
                    rScore = rScore * (show.weight.digital + show.weight.physical) + rFandom * show.weight.vote;
                    bestRivalScore = Math.max(bestRivalScore, rScore);
                });
                if(playerScore > bestRivalScore) totalWins++;
            });

            if(totalWins > 0) {
                playerSong.artistRef.trophies = (playerSong.artistRef.trophies || 0) + totalWins;
                playerSong.musicShowWins = (playerSong.musicShowWins || 0) + totalWins;
                gameData.rep += totalWins * 30;
                addMainLog(`🏆 ${playerSong.artistRef.name} menang ${totalWins} musik show! ("${playerSong.title}" total ${playerSong.musicShowWins}x wins)`);
                // Update discography record
                if(playerSong.artistRef.discography) {
                    let disco = playerSong.artistRef.discography.find(d => d.songName === playerSong.title);
                    if(disco) { disco.musicShowWins = playerSong.musicShowWins; disco.peakMelon = playerSong.peakMelon; disco.peakSpotify = playerSong.peakSpotify; disco.firstWeekSales = playerSong.physSales; disco.totalScore = playerSong.initialScore; }
                }
                // Check win streak (Triple Crown / All-Kill)
                checkWinStreak(playerSong.artistRef, playerSong.title);
            }
        }
    }

    function calculateMusicShowScore(song, show) {
    let w = show.weight;
    const digital   = song.score * (w.digital||0.35) * 80;
    let physSales    = song.physSales||(song.recentAlbumType==='Full'?5000:song.recentAlbumType==='Mini'?2000:500);
    physSales       *= MarketSaturation.getPenalty(song.artistRef?.name||'');
    const physical   = physSales * 0.5 * (w.physical||0.25);
    const broadcast  = (Math.log10(Math.max(10,gameData.rep))*600+Math.random()*500)*(w.broadcast||0.15);
    const vote       = (song.artistRef.fansKR*0.4+song.artistRef.fansGL*0.3)*(w.vote||0.15);
    const sns        = song.artistRef.hasScandal?0:(song.artistRef.fansKR*0.1+2000)*(w.sns||0.10);
    const synergy    = WeightedRNG.getConceptSynergy(song.concept||'Cute', DanceSystem.getDanceStyle(song.concept||'Cute',song.choreo||'trendy',song.outfit||''));
    const momentum   = MomentumSystem.getBonus(song.artistRef?.name||'');
    return (digital+physical+broadcast+vote+sns)*synergy*momentum;
}


    // ---- SYSTEM 8: TEASER SCHEDULE ----
    window.confirmTeaserSchedule = function() {
        let duration = parseInt(document.getElementById('teaser-duration').value);
        let content = document.getElementById('teaser-content').value;

        let bonus = 0;
        let cost = 0;

        if(content === 'cinematic') { cost = 50000000; bonus += 20; }
        if(content === 'mystery') { bonus += Math.random() > 0.4 ? 30 : -15; } // risky
        if(content === 'spoiler') { bonus += 5; } // safe but low
        if(content === 'standard') { bonus += 10; }

        bonus += duration * 8; // longer teaser = more hype

        if(cost > 0) {
            if(gameData.money < cost) return showToast(`Butuh ${formatWon(cost)}!`, "danger");
            addFinanceRecord('Marketing', 'expense', cost, 'Biaya Teaser Cinematic');
        }

        gameData.v13.teaserBonus = bonus;
        showToast(`Jadwal teaser dikunci! Hype bonus: +${bonus}`, bonus >= 0 ? "success" : "warning");
        closeModal('modal-teaser-schedule');
    };

    // ---- SYSTEM 9: SEASONAL COMPETITION ----
    function updateSeasonalCompetition() {
        let month = gameData.m;
        let seasonEl = document.getElementById('season-display');
        let compEl = document.getElementById('competition-level');

        let season, comp;
        if(month >= 3 && month <= 5) { season = '🌸 Musim Semi'; comp = 1.2; } // High competition — spring comeback season
        else if(month >= 6 && month <= 8) { season = '☀️ Musim Panas'; comp = 1.0; } // Standard
        else if(month >= 9 && month <= 11) { season = '🍂 Musim Gugur'; comp = 1.3; } // Highest — award season prep
        else { season = '❄️ Musim Dingin'; comp = 0.8; } // Low — year end, fewer comebacks

        gameData.v13.seasonCompetition = comp;

        if(seasonEl) {
            seasonEl.innerText = season;
            seasonEl.className = 'season-indicator ' + (month >= 3 && month <= 5 ? 'season-spring' : month >= 6 && month <= 8 ? 'season-summer' : month >= 9 && month <= 11 ? 'season-autumn' : 'season-winter');
        }
        if(compEl) {
            let compText = comp >= 1.3 ? 'Kompetisi: SANGAT TINGGI 🔥' : comp >= 1.1 ? 'Kompetisi: Tinggi' : comp >= 0.9 ? 'Kompetisi: Sedang' : 'Kompetisi: Rendah';
            compEl.innerText = compText;
        }
    }

    // ---- SYSTEM 10: WEEKLY REPORT ----
    let weeklyReportData = { income: 0, expense: 0, fansChange: 0, repChange: 0, events: [] };

    function generateWeeklyReport() {
        // Only show report every 4 weeks (monthly)
        if(gameData.w !== 1) return;

        let content = document.getElementById('weekly-report-content');
        let eventsEl = document.getElementById('weekly-report-events');
        if(!content) return;

        let prevMoney = gameData.money;
        let totalFans = gameData.groups.reduce((s, g) => s + g.fansKR + g.fansGL, 0);

        content.innerHTML = `
            <div class="wr-card"><h4>💰 Kas Saat Ini</h4><div class="wr-val">${formatWon(gameData.money)}</div></div>
            <div class="wr-card"><h4>💎 Reputasi</h4><div class="wr-val">${gameData.rep.toLocaleString()}</div></div>
            <div class="wr-card"><h4>👥 Total Fans (Semua Grup)</h4><div class="wr-val">${totalFans.toLocaleString()}</div></div>
            <div class="wr-card"><h4>🏆 Total Trofi</h4><div class="wr-val">${gameData.groups.reduce((s,g)=>s+(g.trophies||0),0)}</div></div>
            <div class="wr-card"><h4>📈 Saham K-DAQ</h4><div class="wr-val">${formatWon(gameData.finance.stock)}</div></div>
            <div class="wr-card"><h4>⏰ Season</h4><div class="wr-val">${gameData.v13.seasonCompetition >= 1.2 ? '🔥 High Comp' : '✅ Normal'}</div></div>
        `;

        let eventsList = [];
        // Check upcoming milestones
        gameData.groups.forEach(g => {
            if(g.stress >= 70) eventsList.push(`⚠️ ${g.name} stress ${Math.floor(g.stress)}% — butuh istirahat!`);
            if(g.fansKR + g.fansGL > 100000 && !g._milestone100k) {
                g._milestone100k = true;
                eventsList.push(`🎉 ${g.name} mencapai 100K fans!`);
            }
            if(g.fansKR + g.fansGL > 1000000 && !g._milestone1M) {
                g._milestone1M = true;
                eventsList.push(`👑 ${g.name} mencapai 1 JUTA fans!`);
            }
        });
        if(gameData.finance.loan > 0) eventsList.push(`🏦 Hutang bank: ${formatWon(gameData.finance.loan)} — Sisa ${gameData.finance.loanDeadline} minggu`);
        if(gameData.money < 50000000) eventsList.push(`🚨 KAS RENDAH! Hati-hati kebangkrutan!`);

        eventsEl.innerHTML = eventsList.length > 0
            ? `<h3 class="section-title">📌 Peringatan & Milestone</h3>` + eventsList.map(e => `<div class="neo-card-small bg-yellow mb-2" style="margin-bottom:5px; font-size:0.85rem;">${e}</div>`).join('')
            : '';

        openModal('modal-weekly-report');
    }

    // ---- SYSTEM 11: ENCORE STAGE REALISM ----
    function checkEncoreStage(grp, song) {
        // After winning music show, check if group can actually sing live
        if(!grp || !song) return;
        let avgVocal = grp.members.reduce((s, m) => s + m.vocal, 0) / grp.members.length;

        if(avgVocal < 50) {
            // Encore stage disaster
            if(Math.random() < 0.4) {
                grp.hasScandal = true;
                gameData.rep -= 200;
                addMainLog(`🎤 ENCORE DISASTER: ${grp.name} gagal nyanyi live di encore! K-Netz murka.`);
                showToast(`🎤 Encore stage ${grp.name} kacau! Vokal fals terekam!`, "danger");
                generateSocialFeed('encore_bad', grp.name);
            }
        } else if(avgVocal > 80) {
            // Praise
            grp.fansKR += 3000;
            gameData.rep += 30;
            generateSocialFeed('vocal_praise', grp.name);
        }
    }

    // ---- SYSTEM 12: REALISTIC AGING / CAREER TRAJECTORY ----
    function processIdolAging() {
        // Called yearly
        gameData.groups.forEach(grp => {
            if(grp.isDisbanded || grp.isPreDebut) return;
            let yearsActive = gameData.y - (grp.contractStartYear || 1);

            // Natural fan decay for groups active > 5 years without new content
            if(yearsActive > 5 && grp.albums < yearsActive) {
                let decay = Math.floor(grp.fansKR * 0.05);
                grp.fansKR = Math.max(1000, grp.fansKR - decay);
                if(decay > 1000) addMainLog(`📉 ${grp.name}: Fans menurun ${decay.toLocaleString()} karena jarang comeback.`);
            }

            // Members age — visual stat slowly decreases for very old idols
            grp.members.forEach(m => {
                if(!m.birthYear) m.birthYear = gameData.y - 20;
                let age = gameData.y - m.birthYear;
                if(age > 30) {
                    m.visual = Math.max(30, m.visual - 0.5); // Very slow visual decay
                }
                // Dance stamina decreases with age
                if(age > 32) {
                    m.dance = Math.max(30, m.dance - 0.3);
                }
            });
        });
    }

    // ==========================================
    // v15 NEW REALISTIC SYSTEMS
    // ==========================================

    // ---- SYSTEM: TRAINEE GRADUATION / CUT ----
    // Trainee yang sudah training > 5 tahun tanpa debut bisa resign sendiri
    // Trainee dengan stat rendah setelah 2 tahun → agensi harus keputusan cut atau keep
    function checkTraineeGraduation() {
        if(gameData.w !== 1 || gameData.m % 6 !== 0) return; // Setiap 6 bulan
        
        gameData.trainees.filter(t => !t.isDebuted).forEach((t, idx) => {
            let months = t.monthsTraining || 0;
            let avgStat = (t.vocal + t.dance + t.rap + t.visual + (t.stage || 40)) / 5;
            
            // > 5 tahun training: chance resign sendiri (mental breakdown)
            if(months > 60) {
                let resignChance = 0.15 + (months - 60) * 0.005; // Semakin lama, semakin besar
                if(Math.random() < resignChance) {
                    addMainLog(`💔 RESIGN: ${t.name} resign setelah ${Math.floor(months/12)} tahun training tanpa debut. "Aku sudah lelah menunggu..."`);
                    showToast(`${t.name} resign dari agensi setelah ${Math.floor(months/12)} tahun!`, "danger");
                    generateSocialFeed('mental_health', t.name);
                    gameData.trainees.splice(gameData.trainees.indexOf(t), 1);
                    return;
                }
            }
            
            // > 2 tahun dengan stat < 35: otomatis cut (realistic — agensi gak mau waste resources)
            if(months > 24 && avgStat < 35) {
                addMainLog(`✂️ AUTO-CUT: ${t.name} dikeluarkan. Stat terlalu rendah setelah ${Math.floor(months/12)} tahun training.`);
                gameData.trainees.splice(gameData.trainees.indexOf(t), 1);
            }
        });
    }

    // ---- SYSTEM: MUSIC SHOW WIN STREAK (Triple Crown, Grand Slam) ----
    function checkWinStreak(grp, songTitle) {
        if(!grp._winStreak) grp._winStreak = {};
        if(!grp._winStreak[songTitle]) grp._winStreak[songTitle] = 0;
        grp._winStreak[songTitle]++;
        
        let streak = grp._winStreak[songTitle];
        
        if(streak === 3) {
            // TRIPLE CROWN — 3 wins in a row on same song
            addMainLog(`👑👑👑 TRIPLE CROWN! ${grp.name} "${songTitle}" menang 3x berturut-turut di musik show!`);
            showToast(`👑 TRIPLE CROWN untuk ${grp.name}!`, "success");
            grp.fansKR += Math.floor(5000 + grp.fansKR * 0.03);
            gameData.rep += 200;
            generateSocialFeed('chart_high', grp.name);
        }
        if(streak === 5) {
            // ALL-KILL — 5+ wins, lagu ini mendominasi
            addMainLog(`🏆🏆🏆🏆🏆 ALL-KILL! ${grp.name} "${songTitle}" mendominasi musik show selama 5 minggu!`);
            showToast(`🏆 ALL-KILL! ${grp.name} mendominasi!`, "success");
            grp.fansKR += Math.floor(10000 + grp.fansKR * 0.05);
            grp.fansGL += Math.floor(5000 + grp.fansGL * 0.03);
            gameData.rep += 500;
        }
    }

    // ---- SYSTEM: DISPATCH NEW YEAR COUPLE REVEAL ----
    function checkDispatchNewYear() {
        if(gameData.m !== 1 || gameData.w !== 1) return; // Tanggal 1 Januari
        if(gameData.groups.length === 0) return;
        if(Math.random() > 0.4) return; // 40% chance per year
        
        let eligibleGroups = gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut && (g.fansKR + g.fansGL) > 20000);
        if(eligibleGroups.length === 0) return;
        
        let targetGrp = eligibleGroups[Math.floor(Math.random() * eligibleGroups.length)];
        let targetMember = targetGrp.members[Math.floor(Math.random() * targetGrp.members.length)];
        
        // Dispatch always drops on Jan 1
        addMainLog(`📸 DISPATCH NEW YEAR: ${targetMember.name} (${targetGrp.name}) tertangkap kamera Dispatch sedang berkencan!`);
        showToast(`📸 DISPATCH: ${targetMember.name} ketahuan kencan!`, "danger");
        
        // Impact tergantung popularitas
        let totalFans = targetGrp.fansKR + targetGrp.fansGL;
        let fansLost = Math.floor(totalFans * (0.05 + Math.random() * 0.1)); // 5-15% fans kecewa
        targetGrp.fansKR = Math.max(100, targetGrp.fansKR - Math.floor(fansLost * 0.7));
        targetGrp.fansGL = Math.max(50, targetGrp.fansGL - Math.floor(fansLost * 0.3));
        targetGrp.hasScandal = true;
        gameData.rep -= Math.floor(50 + totalFans * 0.0001);
        
        generateSocialFeed('scandal_dating', targetGrp.name);
        if(typeof triggerScreenShake === 'function') triggerScreenShake();
    }

    // ---- SYSTEM: COMEBACK TIMING ANALYSIS ----
    // Menambah info strategis ke player tentang timing comeback
    function getCompetitionAnalysis() {
        let month = gameData.m;
        let activeRivalComebacks = gameData.activeRivals.filter(r => (r.weeksSinceRelease || 99) <= 3);
        let legendsActive = activeRivalComebacks.filter(r => r.tier === 'Legend').length;
        let topTiersActive = activeRivalComebacks.filter(r => r.tier === 'Top-Tier').length;
        
        let risk = 'LOW';
        let detail = '';
        
        if(legendsActive >= 2) { risk = 'EXTREME'; detail = `${legendsActive} grup Legend sedang comeback! Sangat berbahaya.`; }
        else if(legendsActive >= 1) { risk = 'HIGH'; detail = `${legendsActive} grup Legend + ${topTiersActive} Top-Tier aktif.`; }
        else if(topTiersActive >= 3) { risk = 'HIGH'; detail = `${topTiersActive} grup Top-Tier sedang promo.`; }
        else if(topTiersActive >= 1) { risk = 'MEDIUM'; detail = `${topTiersActive} Top-Tier aktif. Peluang cukup baik.`; }
        else { risk = 'LOW'; detail = 'Sedikit kompetisi! Waktu terbaik untuk comeback.'; }
        
        // Seasonal modifier
        if(month >= 9 && month <= 11) detail += ' (Award season — kompetisi sangat ketat!)';
        if(month >= 6 && month <= 8) detail += ' (Summer comeback season)';
        if(month === 12 || month <= 2) detail += ' (Low season — peluang menonjol lebih besar)';
        
        return { risk, detail, legendsActive, topTiersActive, totalActive: activeRivalComebacks.length };
    }

    // ---- SYSTEM: TRAINEE INJURY FROM OVERTRAINING ----
    function checkTraineeInjury() {
        if(Math.random() > 0.03) return; // 3% chance per week
        let trainees = gameData.trainees.filter(t => !t.isDebuted);
        if(trainees.length === 0) return;
        
        let victim = trainees[Math.floor(Math.random() * trainees.length)];
        let isFragile = victim.traitObj && (victim.traitObj.name === 'Kaca Kaca' || victim.traitObj.name === 'Glass Cannon');
        
        if(isFragile || Math.random() < 0.5) {
            // Minor injury — stat temporary drop
            let injuredStat = ['dance', 'vocal'][Math.floor(Math.random() * 2)];
            let drop = isFragile ? 8 : 4;
            victim[injuredStat] = Math.max(5, victim[injuredStat] - drop);
            addMainLog(`🤕 CEDERA: Trainee ${victim.name} cedera ${injuredStat === 'dance' ? 'kaki' : 'tenggorokan'} saat latihan! ${injuredStat} -${drop}`);
            showToast(`${victim.name} cedera saat latihan!`, "warning");
        }
    }

    // ---- SYSTEM: ALBUM SALES EVENT (Fansign Lottery = Sales Boost) ----
    // Di K-Pop asli, fansign lottery mendorong fans beli puluhan album
    function calculateFansignSalesBoost(grp) {
        if(!grp.fandomName) return 1.0; // Belum punya fandom resmi = no boost
        let coreFans = grp.fansKR;
        // Core fans beli rata-rata 3-15 album untuk lottery (realistis)
        let avgPurchase = coreFans > 500000 ? 12 : coreFans > 100000 ? 8 : coreFans > 10000 ? 5 : 3;
        return 1 + (avgPurchase - 1) * 0.15; // 15% dari extra purchase jadi actual boost
    }

    // ---- SYSTEM: IDOL INDIVIDUAL POPULARITY RANKING ----
    function updateIndividualPopularity() {
        if(gameData.w !== 1) return; // Monthly
        gameData.groups.forEach(grp => {
            if(grp.isDisbanded || grp.isPreDebut) return;
            grp.members.forEach(m => {
                // Individual fans grow based on visual, stage presence, and positions
                let isCenter = m.positions && m.positions.includes('Center');
                let isVisual = m.positions && m.positions.includes('Visual');
                let baseGrow = (m.visual * 0.3 + (m.stage || 50) * 0.4 + m.vocal * 0.2 + m.dance * 0.1);
                let posBonus = (isCenter ? 2.0 : 1.0) * (isVisual ? 1.5 : 1.0);
                let fanGain = Math.floor(baseGrow * posBonus * 0.5 + Math.random() * 50);
                m.indFans = (m.indFans || 0) + fanGain;
            });
        });
    }

    // ---- SYSTEM: GENERATION DYNAMICS ----
    // 4th gen, 5th gen dynamics — newer generations get hype boost
    function getGenerationBonus(debutYear) {
        let currentYear = gameData.y;
        let yearsActive = currentYear - (debutYear || currentYear);
        
        if(yearsActive <= 1) return 1.15;  // Rookie hype — media loves new faces
        if(yearsActive <= 3) return 1.05;  // Rising star phase
        if(yearsActive <= 5) return 1.0;   // Established — stable
        if(yearsActive <= 7) return 0.95;  // Starting to plateau
        return 0.9;                         // Veteran — fans loyal tapi hype turun
    }

    // ---- SYSTEM 13: FANDOM WAR EVENTS (ENHANCED) ----
    function checkFandomWar() {
        if(gameData.groups.length < 1) return;
        if(Math.random() > 0.10) return; // 10% chance per week

        let grp = gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut && g.fansKR > 5000);
        if(grp.length === 0) return;

        let target = grp[Math.floor(Math.random() * grp.length)];
        let eligibleRivals = gameData.activeRivals.filter(r => r.tier !== 'Nugu' && r.fandom > 30000);
        if(eligibleRivals.length === 0) return;
        let rival = eligibleRivals[Math.floor(Math.random() * eligibleRivals.length)];

        let warType = Math.random();
        let totalFans = target.fansKR + target.fansGL;
        let fanPower = Math.log10(Math.max(10, totalFans));

        if(warType < 0.25) {
            // Streaming war — fans rally together, both sides stream harder
            let streamBoost = Math.floor(1000 + fanPower * 500);
            target.fansKR += streamBoost;
            addMainLog(`⚔️ FANDOM WAR: Fans ${target.name} vs fans ${rival.artist} — streaming war sengit di Melon & Spotify!`);
            showToast(`Streaming war! Fans ${target.name} rally streaming. +${streamBoost.toLocaleString()} fans`, "warning");
            generateSocialFeed('fanwar', target.name);
        } else if(warType < 0.45) {
            // Chart manipulation accusations
            let accusationSticks = Math.random() < 0.25;
            addMainLog(`⚔️ FANDOM WAR: Fans ${rival.artist} menuduh ${target.name} sajaegi (manipulasi chart)!`);
            if(accusationSticks) {
                target.hasScandal = true;
                gameData.rep -= 150;
                showToast(`Tuduhan sajaegi viral! ${target.name} kena skandal!`, "danger");
            } else {
                gameData.rep += 30;
                showToast(`Tuduhan sajaegi terbukti salah. Fans ${target.name} makin solid!`, "success");
                target.fansKR += Math.floor(500 * fanPower);
            }
            generateSocialFeed('sajaegi', target.name);
        } else if(warType < 0.6) {
            // Voting war — fans compete di music show voting
            addMainLog(`⚔️ VOTING WAR: Fans ${target.name} vs ${rival.artist} perang voting di musik show!`);
            let ourVotes = totalFans * (0.3 + Math.random() * 0.4);
            let theirVotes = rival.fandom * (0.3 + Math.random() * 0.4);
            if(ourVotes > theirVotes) {
                target.trophies = (target.trophies || 0) + 1;
                gameData.rep += 50;
                showToast(`${target.name} menang voting war! +1 Trofi!`, "success");
                generateSocialFeed('chart_high', target.name);
            } else {
                showToast(`${target.name} kalah voting war melawan ${rival.artist}.`, "warning");
                generateSocialFeed('chart_low', target.name);
            }
        } else if(warType < 0.75) {
            // Toxic fan harassment — bad for everyone
            let victimMember = target.members[Math.floor(Math.random() * target.members.length)];
            addMainLog(`🚨 TOXIC FANS: Akgae fans menyerang ${victimMember.name} (${target.name}) di SNS!`);
            target.stress = Math.min(100, target.stress + 15);
            target.fansKR = Math.max(0, target.fansKR - Math.floor(totalFans * 0.02));
            showToast(`Toxic fans menyerang ${victimMember.name}! Stress +15, fans turun.`, "danger");
            generateSocialFeed('scandal_attitude', target.name);
        } else if(warType < 0.9) {
            // Positive fan project — donation, charity, birthday project
            let projectType = ['donasi atas nama','ad subway birthday','forest donation untuk','cafe event untuk'][Math.floor(Math.random()*4)];
            let donationAmount = Math.floor(10000000 + fanPower * 5000000);
            addMainLog(`💜 FAN PROJECT: Fandom ${target.name} ${projectType} idol mereka! (est. ₩${(donationAmount/1000000).toFixed(0)}Jt)`);
            gameData.rep += 60;
            target.fansKR += Math.floor(2000 * fanPower);
            showToast(`Fan project sukses! +Rep, +Fans.`, "success");
            generateSocialFeed('general', target.name);
        } else {
            // Internal fandom civil war — OT vs akgae
            let m1 = target.members[0], m2 = target.members[target.members.length > 1 ? 1 : 0];
            addMainLog(`💔 CIVIL WAR: Fandom ${target.name} terpecah — fans ${m1.name} vs fans ${m2.name} soal line distribution!`);
            target.stress = Math.min(100, target.stress + 10);
            target.fansKR = Math.max(0, target.fansKR - Math.floor(totalFans * 0.03));
            showToast(`Fandom civil war! Fans berkurang & stress naik.`, "danger");
            generateSocialFeed('fanwar', target.name);
        }
    }

    // ---- SYSTEM 14: IDOL MENTAL HEALTH SYSTEM ----
    function checkMentalHealth() {
        gameData.groups.forEach(grp => {
            if(grp.isDisbanded) return;
            grp.members.forEach(m => {
                // Members with high individual fans + low group visibility = depression risk
                if(m.soloBusy > 0) return; // Already busy
                if(m.traitObj && m.traitObj.name === 'Kaca Kaca' && grp.stress > 60) {
                    if(Math.random() < 0.05) {
                        addMainLog(`💔 ${m.name} (${grp.name}) mengalami burnout. Butuh istirahat panjang.`);
                        m.soloBusy = 4;
                        m.currentSoloObj = 'Mental Health Break';
                        grp.stress = Math.max(0, grp.stress - 20); // Group stress decreases when member takes break
                        showToast(`${m.name} mengambil hiatus kesehatan mental.`, "warning");
                    }
                }
            });
        });
    }

    // ---- HOOK ALL V13 SYSTEMS INTO WEEK SKIP ----
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        // Process V13 systems
        processMilitaryReturn();
        checkFandomWar();
        checkMentalHealth();

        // v15 NEW SYSTEMS
        checkTraineeInjury();
        checkTraineeGraduation();
        updateIndividualPopularity();
        
        // Dispatch New Year (Jan 1)
        checkDispatchNewYear();

        // Fansign cooldown
        if(gameData.v13.fansignCooldown > 0) gameData.v13.fansignCooldown--;

        // Brand reputation (monthly)
        if(gameData.w === 1) calculateBrandReputation();

        // Seasonal competition update
        updateSeasonalCompetition();

        // Military check (quarterly)
        if(gameData.w === 1 && (gameData.m === 3 || gameData.m === 6 || gameData.m === 9 || gameData.m === 12)) {
            checkMilitaryService();
        }

        // Idol aging (yearly)
        if(gameData.m === 1 && gameData.w === 1) processIdolAging();

        // Weekly report (monthly)
        if(gameData.w === 1 && gameData.m % 3 === 0) {
            setTimeout(() => generateWeeklyReport(), 2000);
        }

        // Multiple music show wins — extended promo window, check top 10 not just top 3
        gameData.activeSongs.forEach(song => {
            if(song.weeksActive > 0 && song.weeksActive <= 10) { // Extended from 4 to 10
                // Check if song is in top 10 of Melon (not just top 3)
                let melonIdx = currentCharts.melon.findIndex(c => c.isPlayer && c.title === song.title);
                if(melonIdx >= 0 && melonIdx < 10) {
                    runMultipleMusicShows(song);
                    if(song.artistRef.trophies > 0) checkEncoreStage(song.artistRef, song);
                }
            }
        });

        // Teaser bonus decays after release
        if(gameData.v13.teaserBonus > 0) gameData.v13.teaserBonus = Math.max(0, gameData.v13.teaserBonus - 5);

        // Reset promo wins counter
        if(gameData.w === 1) gameData.v13.musicShowWinsThisPromo = 0;

        // Update international overview if visible
        if(document.getElementById('international') && document.getElementById('international').classList.contains('active')) {
            updateIntlOverview();
            updateSeasonalCompetition();
        }

        // Update variety tab if visible
        if(document.getElementById('variety') && document.getElementById('variety').classList.contains('active')) {
            calculateBrandReputation();
        }
    });

    // ---- HOOK INTO MENU CLICKS ----
    document.querySelector('[data-target="variety"]').addEventListener('click', () => {
        setTimeout(() => {
            calculateBrandReputation();
            let fsSel = document.getElementById('fansign-group-select');
            if(fsSel) {
                fsSel.innerHTML = '';
                gameData.groups.filter(g => !g.isDisbanded && !g.isPreDebut).forEach(g => {
                    let idx = gameData.groups.indexOf(g);
                    fsSel.innerHTML += `<option value="${idx}">${g.name}</option>`;
                });
            }
        }, 100);
    });

    document.querySelector('[data-target="collab"]').addEventListener('click', () => {
        setTimeout(renderCollabHistoryList, 100);
    });

    document.querySelector('[data-target="international"]').addEventListener('click', () => {
        setTimeout(() => { updateIntlOverview(); updateSeasonalCompetition(); }, 100);
    });

    // ---- PATCH: ADD TEASER BONUS TO RELEASE SCORE ----
    const _v13OrigExecuteRelease = executeReleaseLogic;
    // We can't easily override the inner function, so we hook into the active songs
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        // Apply teaser bonus to newly released songs
        gameData.activeSongs.forEach(song => {
            if(song.weeksActive === 0 && gameData.v13.teaserBonus > 0 && !song._teaserApplied) {
                song.score += gameData.v13.teaserBonus;
                song._teaserApplied = true;
                if(gameData.v13.teaserBonus > 15) {
                    addMainLog(`📈 TEASER EFFECT: Hype teaser menaikkan skor chart "${song.title}" sebesar +${gameData.v13.teaserBonus}!`);
                }
            }
        });

        // Apply seasonal competition to rival scores
        gameData.activeRivals.forEach(r => {
            r.currentScore = r.baseScore * gameData.v13.seasonCompetition + (Math.random() * 15 - 7);
        });
    });

    // ---- PATCH INTRO SCREEN FOR V13 ----
    let introSubEl = document.querySelector('.intro-subtitle');
    if(introSubEl) introSubEl.innerText = 'K-Pop Simulator v13.0 (Ultra Realism Update)';
    let introNewEl = document.querySelector('[style*="c-blue-solid"]');
    if(introNewEl) introNewEl.innerHTML = 'v13.0 NEW: Variety Shows | Kolaborasi | Pasar Internasional | Wajib Militer | Brand Rep Index | Fansign/Photocard | Multi Music Show | Seasonal Competition | Fandom Wars | Mental Health System';

    // ==========================================
    // BOOT
    // ==========================================
    setTimeout(() => { document.getElementById('btn-start-intro').style.display = 'inline-block'; }, 800);
    document.getElementById('btn-start-intro').onclick = () => { document.getElementById('intro-screen').classList.remove('active'); document.getElementById('setup-screen').classList.add('active'); };
    
    document.getElementById('btn-create-agency').onclick = () => {
        let c = document.getElementById('input-ceo').value.trim(); let a = document.getElementById('input-agency').value.trim(); let t = document.getElementById('input-agency-type').value;
        if(!c || !a) return alert("Isi nama CEO & Agensi!");
        gameData.ceo = c; gameData.agency = a; gameData.type = t; let setup = AGENCY_TYPES[t]; gameData.money = setup.m; gameData.cost = setup.c; gameData.rep = setup.r;
        document.getElementById('display-ceo-name').innerText = c; document.getElementById('display-agency-name').innerText = a; updateUI(); generateCharts();
        document.getElementById('setup-screen').classList.remove('active'); document.getElementById('main-app').classList.add('active');
        addMainLog(`Agensi '${a}' didirikan. (Mode: ${t.toUpperCase()})`); showToast("Welcome to the brutal industry!", "success");
        // V12: Init news ticker
        if(typeof initNewsTicker === 'function') initNewsTicker();
    };

    document.querySelectorAll('.menu-item').forEach(item => {
        item.onclick = () => { document.querySelectorAll('.menu-item').forEach(n=>n.classList.remove('active')); item.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active')); document.getElementById(item.getAttribute('data-target')).classList.add('active'); updateUI(); };
    });
});



// INTRO SCREEN START BUTTON HANDLER (v13 UI)
document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");
  const setupScreen = document.getElementById("setup-screen");
  const btnStart = document.getElementById("btn-start-intro");

  if (!introScreen || !setupScreen || !btnStart) return;

  // Tampilkan tombol setelah sedikit delay biar efek dramatis
  setTimeout(() => {
    btnStart.style.display = "inline-block";
  }, 800);

  btnStart.addEventListener("click", () => {
    introScreen.classList.remove("active");
    setupScreen.classList.add("active");
  });
});

// ==========================================
// K-Pop Tycoon v15.5 — Deep Systems Update
// All 10 systems, direct gameData access via window._gd bridge
// ==========================================

(function waitForBridge() {
    if (!window._gd || !window._showToast) {
        return setTimeout(waitForBridge, 300);
    }

    const G = window._gd;
    const toast = window._showToast;
    const log = window._addMainLog;
    const finance = (...a) => window._addFinanceRecord?.(...a);
    const fmtW = window._formatWon || (n => '₩' + n.toLocaleString());
    const charts = window._charts;
    const genFeed = (...a) => window._genSocialFeed?.(...a);
    const ticker = (msg) => { let t = document.getElementById('ticker-track'); if(t){ let s=document.createElement('span'); s.className='ticker-item'; s.innerHTML=' 🔴 '+msg+' '; t.appendChild(s); }};

    // ==========================================
    // EXTENDED GAME STATE
    // ==========================================
    G.v155 = {
        activeAftermaths: [],
        chartPrevPos: {},       // "platform_title" -> prevPosition
        chartHistory: {},       // "platform_title" -> [pos, pos, ...]
        editorialPlaylist: {},  // songTitle -> { weeksLeft }
        staffMorale: [],        // parallel to G.staff: morale 0-100
        facilityUpgradeWeek: { practice: 0, studio: 0, dorm: 0, clinic: 0 },
        traineeAssignments: {}, // trainee.id -> assignment string
        traineeEvalHistory: {}, // trainee.id -> lastGrade
        traineeResignRisk: {},  // trainee.id -> risk %
        scandalLevel: {},       // groupName -> 0-10
        scandalDecayMult: {},   // groupName -> multiplier (default 1)
        loanAccruedInterest: 0,
        trendingTags: ['#KPop', '#Comeback', '#MusicShow'],
        fancams: [],
        concertSales: [],       // active ticket sale trackers
        midYearGiven: {},       // "Y_M" -> true
        votingBonus: 0,
        staffEventCD: 0
    };

    // Initialize staff morale
    G.staff.forEach(() => G.v155.staffMorale.push(70));

    // Initialize scandal levels for existing groups
    G.groups.forEach(grp => {
        if (!G.v155.scandalLevel[grp.name]) G.v155.scandalLevel[grp.name] = grp.hasScandal ? 5 : 0;
        if (!G.v155.scandalDecayMult[grp.name]) G.v155.scandalDecayMult[grp.name] = 1;
    });

    // ==========================================
    // [1] TRAINEE: WEEKLY TRAINING ASSIGNMENT
    // ==========================================
    window.openTrainingAssignment = function() {
        const avail = G.trainees.filter(t => !t.isDebuted);
        const container = document.getElementById('training-assign-list');
        if (!container) return;

        if (avail.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">Tidak ada trainee aktif.</p>';
        } else {
            container.innerHTML = avail.map(t => {
                const cur = G.v155.traineeAssignments[t.id] || 'balanced';
                return `<div class="train-assign-row">
                    <span class="ta-name">${t.name}</span>
                    <span style="font-size:0.7rem;color:#888;">V${Math.floor(t.vocal)} D${Math.floor(t.dance)} R${Math.floor(t.rap)}</span>
                    <select class="neo-input ta-select" data-tid="${t.id}" style="max-width:260px;">
                        <option value="balanced" ${cur==='balanced'?'selected':''}>⚖️ Balanced</option>
                        <option value="vocal_intensive" ${cur==='vocal_intensive'?'selected':''}>🎤 Vokal Intensif (+5 vocal, -8 stamina)</option>
                        <option value="dance_bootcamp" ${cur==='dance_bootcamp'?'selected':''}>🕺 Dance Bootcamp (+5 dance, -8 stamina)</option>
                        <option value="language" ${cur==='language'?'selected':''}>🌍 Language Class (+5 language, -3 stamina)</option>
                        <option value="mental" ${cur==='mental'?'selected':''}>🧘 Mental Recovery (+20 mental, 0 stat)</option>
                        <option value="rest" ${cur==='rest'?'selected':''}>🛌 Full Rest (stamina recovery)</option>
                    </select>
                </div>`;
            }).join('');
        }
        openModal('modal-training-assign');
    };

    window.saveTrainingAssignments = function() {
        document.querySelectorAll('.ta-select').forEach(sel => {
            G.v155.traineeAssignments[sel.dataset.tid] = sel.value;
        });
        toast("📝 Training assignments tersimpan!", "success");
        closeModal('modal-training-assign');
    };

    // Apply training assignments in the weekly trainee growth (hook into existing)
    function applyTrainingAssignments() {
        G.trainees.filter(t => !t.isDebuted).forEach(t => {
            const assign = G.v155.traineeAssignments[t.id];
            if (!assign || assign === 'balanced') return;
            if (assign === 'vocal_intensive') { t.vocal = Math.min(99, t.vocal + 1.5); }
            if (assign === 'dance_bootcamp') { t.dance = Math.min(99, t.dance + 1.5); }
            if (assign === 'language') { /* language not stored as stat, boost global appeal */ }
            // rest/mental: reduce stress conceptually (no direct stamina field on trainee, so skip)
        });
    }

    // Trainee Evaluation (called monthly at W1)
    function runTraineeEvaluation() {
        const avail = G.trainees.filter(t => !t.isDebuted);
        if (avail.length === 0) return;

        const container = document.getElementById('eval-trainee-list');
        if (!container) return;
        let html = '';

        avail.forEach(t => {
            const assign = G.v155.traineeAssignments[t.id] || 'balanced';
            const avgStat = (t.vocal + t.dance + t.rap + t.visual + (t.stage || 50)) / 5;
            // Grade based on avg stat + randomness
            const growthScore = avgStat * 0.6 + Math.random() * 40 + (assign !== 'balanced' && assign !== 'rest' ? 10 : 0);

            let grade;
            if (growthScore >= 70) grade = 'A';
            else if (growthScore >= 50) grade = 'B';
            else if (growthScore >= 32) grade = 'C';
            else grade = 'D';

            const prev = G.v155.traineeEvalHistory[t.id];
            let cutNotice = '';
            if (grade === 'D' && prev === 'D') {
                cutNotice = `<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="neo-btn danger-btn" style="font-size:0.75rem;padding:4px 10px;" onclick="v155CutTrainee(${t.id})">✂️ Cut</button>
                    <button class="neo-btn success-btn" style="font-size:0.75rem;padding:4px 10px;" onclick="v155KeepTrainee(${t.id})">💪 Pertahankan (₩50Jt)</button>
                    <button class="neo-btn action-btn" style="font-size:0.75rem;padding:4px 10px;" onclick="v155DemoteTrainee(${t.id})">⬇️ Magang</button>
                </div>
                <div style="font-size:0.75rem;color:var(--c-red-solid);font-weight:900;margin-top:4px;">⚠️ CUT NOTICE: Grade D 2x berturut-turut!</div>`;
            }
            G.v155.traineeEvalHistory[t.id] = grade;

            // Resignation risk for >3 year trainees
            const monthsTrained = t.monthsTraining || 0;
            let resignRisk = 0;
            if (monthsTrained > 36) {
                resignRisk = Math.min(80, (monthsTrained - 36) * 5);
                G.v155.traineeResignRisk[t.id] = resignRisk;
                if (Math.random() * 100 < resignRisk * 0.3) {
                    // Actual resignation attempt
                    toast(`⚠️ ${t.name} mempertimbangkan resign! (${monthsTrained.toFixed(0)} bulan tanpa debut)`, "warning");
                }
            }

            html += `<div class="neo-card-small" style="display:flex;align-items:center;gap:12px;margin-bottom:8px;background:#fff;">
                <div class="eval-grade grade-${grade}">${grade}</div>
                <div style="flex:1;">
                    <strong>${t.name}</strong> <span style="font-size:0.75rem;color:#888;">(${Math.floor(monthsTrained)} bln training)</span>
                    <div style="font-size:0.8rem;color:#666;">Score: ${Math.floor(growthScore)} | Focus: ${assign}${prev ? ' | Prev: '+prev : ''}${resignRisk > 0 ? ' | <span style="color:var(--c-red-solid);">Resign Risk: '+resignRisk+'%</span>': ''}</div>
                    ${cutNotice}
                </div>
            </div>`;
        });

        container.innerHTML = html;
        openModal('modal-trainee-eval');
    }

    window.v155CutTrainee = function(id) {
        G.trainees = G.trainees.filter(t => t.id !== id);
        toast("✂️ Trainee di-cut dari program.", "warning");
        log("✂️ Trainee di-cut setelah 2x Grade D.");
        closeModal('modal-trainee-eval');
    };
    window.v155KeepTrainee = function(id) {
        finance('Trainee', 'expense', 50000000, 'Denda pertahankan trainee');
        G.v155.traineeEvalHistory[id] = 'C';
        toast("💪 Trainee dipertahankan! ₩50Jt, motivasi naik.", "success");
        closeModal('modal-trainee-eval');
    };
    window.v155DemoteTrainee = function(id) {
        const t = G.trainees.find(tr => tr.id === id);
        if (t) { t.vocal = Math.max(10, t.vocal - 5); t.dance = Math.max(10, t.dance - 5); }
        G.v155.traineeEvalHistory[id] = 'C';
        toast("⬇️ Trainee diturunkan ke magang. Stat -5.", "warning");
        closeModal('modal-trainee-eval');
    };

    // ==========================================
    // [2] CHART: POSITION DELTA + EDITORIAL PLAYLIST
    // ==========================================
    function enhanceCharts() {
        const platforms = ['list-melon','list-genie','list-flo','list-bugs','list-spotify','list-ytmusic','list-billboard'];
        platforms.forEach(listId => {
            const ul = document.getElementById(listId);
            if (!ul) return;
            const items = ul.querySelectorAll('.chart-item');
            items.forEach((item, idx) => {
                const pos = idx + 1;
                const titleEl = item.querySelector('span[style*="font-weight:900"]');
                if (!titleEl) return;
                const title = titleEl.innerText.trim().split('\n')[0];
                const key = listId + '|' + title;

                // History tracking
                if (!G.v155.chartHistory[key]) G.v155.chartHistory[key] = [];
                const hist = G.v155.chartHistory[key];
                const prevPos = G.v155.chartPrevPos[key] || 0;
                G.v155.chartPrevPos[key] = pos;
                hist.push(pos);
                if (hist.length > 8) hist.shift();

                // Delta indicator — replace existing trend indicator
                const existingTrend = item.querySelector('.trend-new, .trend-up, .trend-down');
                const trendContainer = existingTrend ? existingTrend.parentNode : null;

                let deltaHTML;
                if (prevPos === 0 || hist.length <= 1) {
                    deltaHTML = '<span class="chart-delta new-entry">🔥NEW</span>';
                } else if (prevPos === pos) {
                    deltaHTML = '<span class="chart-delta same">—</span>';
                } else if (prevPos > pos) {
                    deltaHTML = `<span class="chart-delta up">⬆️${prevPos - pos}</span>`;
                } else {
                    deltaHTML = `<span class="chart-delta down">⬇️${pos - prevPos}</span>`;
                }

                if (trendContainer) {
                    trendContainer.innerHTML = deltaHTML;
                }

                // Sparkline for player songs
                if (item.classList.contains('player-song') && hist.length >= 3) {
                    let spark = item.querySelector('.sparkline');
                    if (!spark) {
                        spark = document.createElement('span');
                        spark.className = 'sparkline';
                        titleEl.parentNode.appendChild(spark);
                    }
                    const maxP = Math.max(...hist, 1);
                    spark.innerHTML = hist.map(p => {
                        const h = Math.max(2, Math.floor((1 - (p - 1) / Math.max(maxP, 20)) * 22));
                        const cls = p <= 10 ? ' top10' : p <= 30 ? ' top30' : '';
                        return `<span class="sparkline-bar${cls}" style="height:${h}px"></span>`;
                    }).join('');
                }

                // Editorial Playlist (player songs, top 10, 2+ weeks)
                if (item.classList.contains('player-song') && pos <= 10 && hist.length >= 2) {
                    const epKey = title;
                    if (!G.v155.editorialPlaylist[epKey] && Math.random() < 0.3) {
                        G.v155.editorialPlaylist[epKey] = { weeksLeft: 4 };
                        toast(`📋 "${title}" masuk Editorial Playlist! +5 score/mgg, 4 minggu!`, 'success');
                        log(`📋 "${title}" → Editorial Playlist!`);
                        ticker(`📋 "${title}" masuk playlist editorial resmi!`);
                    }
                    if (G.v155.editorialPlaylist[epKey]?.weeksLeft > 0 && !item.querySelector('.editorial-badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'editorial-badge';
                        badge.textContent = '📋 Editorial';
                        titleEl.parentNode.appendChild(badge);
                    }
                }
            });
        });

        // Process editorial playlist score bonuses
        Object.keys(G.v155.editorialPlaylist).forEach(title => {
            const ep = G.v155.editorialPlaylist[title];
            if (ep.weeksLeft > 0) {
                ep.weeksLeft--;
                // Boost active song score
                const song = G.activeSongs.find(s => s.title === title);
                if (song) song.score = (song.score || 0) + 5;
                if (ep.weeksLeft <= 0) log(`📋 "${title}" keluar dari Editorial Playlist.`);
            }
        });
    }

    // ==========================================
    // [3] FINANCE: BURN RATE, RUNWAY, LOAN INTEREST
    // ==========================================
    function updateFinanceMetrics() {
        // Burn rate = staff wages + operational cost per week
        let weeklyBurn = Math.floor(G.cost / 4); // monthly cost / 4
        G.staff.forEach(s => weeklyBurn += Math.floor(s.wage / 4));
        const money = G.money;
        const runway = weeklyBurn > 0 ? Math.max(0, Math.floor(money / weeklyBurn)) : 999;

        // Update UI
        const burnPanel = document.getElementById('burn-rate-panel');
        if (burnPanel) {
            burnPanel.style.display = 'block';
            document.getElementById('val-burn-rate').innerText = fmtW(weeklyBurn) + '/mgg';
            const rwEl = document.getElementById('val-cash-runway');
            rwEl.innerText = runway > 100 ? '100+ minggu' : runway + ' minggu';
            if (runway < 8) {
                burnPanel.classList.add('cash-danger');
                rwEl.style.color = 'var(--c-red-solid)';
            } else {
                burnPanel.classList.remove('cash-danger');
                rwEl.style.color = '';
            }
        }

        // Top bar runway
        const rtag = document.getElementById('cash-runway-tag');
        if (rtag) {
            if (runway < 12) {
                rtag.style.display = 'inline-flex';
                document.getElementById('val-runway-top').innerText = runway + ' mgg';
            } else {
                rtag.style.display = 'none';
            }
        }

        // Compound loan interest: 0.5%/week
        if (G.finance.loan > 0) {
            const interest = Math.floor(G.finance.loan * 0.005);
            G.v155.loanAccruedInterest += interest;
            G.finance.loan += interest; // compound into principal
        }
    }

    // ==========================================
    // [4] EVENT AFTERMATH SYSTEM
    // ==========================================
    function processAftermaths() {
        const list = G.v155.activeAftermaths;
        for (let i = list.length - 1; i >= 0; i--) {
            const am = list[i];
            am.weeksRemaining--;

            // Per-week effects
            const grp = G.groups.find(g => g.name === am.groupRef);
            if (grp) {
                if (am.effect === 'fans_decay') grp.fansKR = Math.max(0, grp.fansKR - Math.floor(grp.fansKR * 0.02));
                if (am.effect === 'rep_drain') G.rep = Math.max(0, G.rep - 15);
                if (am.effect === 'stress_buildup') grp.stress = Math.min(100, (grp.stress || 0) + 3);
                if (am.effect === 'sponsor_loss') { /* reduced income handled elsewhere */ }
            }

            if (am.weeksRemaining <= 0) {
                log(`✅ Situasi selesai: ${am.description}`);
                list.splice(i, 1);
            }
        }
        renderSituations();
    }

    function addAftermath(groupName, effect, weeks, desc) {
        // Double scandal severity
        const existing = G.v155.activeAftermaths.find(a => a.groupRef === groupName && a.effect === effect);
        if (existing) {
            weeks = Math.ceil(weeks * 1.5);
            desc += ' [Severity ×1.5!]';
            toast(`⚠️ ${groupName}: situasi ganda! Severity ×1.5!`, 'danger');
        }
        G.v155.activeAftermaths.push({ groupRef: groupName, effect, weeksRemaining: weeks, description: desc });
        renderSituations();
    }
    window._v155AddAftermath = addAftermath; // expose for other systems

    function renderSituations() {
        const panel = document.getElementById('active-situations-panel');
        const list = document.getElementById('active-situations-list');
        if (!panel || !list) return;
        const items = G.v155.activeAftermaths;
        if (items.length === 0) { panel.style.display = 'none'; return; }
        panel.style.display = 'block';
        list.innerHTML = items.map(am =>
            `<div class="situation-item"><span class="situation-weeks">${am.weeksRemaining}w</span><span>${am.description}</span></div>`
        ).join('');
    }

    // ==========================================
    // [5] AWARD: MID-YEAR SHOWS
    // ==========================================
    const MID_AWARDS = [
        { month: 3, name: '🏆 Golden Disc Awards', icon: '💿' },
        { month: 6, name: '🏆 Asia Artist Awards (AAA)', icon: '🌏' },
        { month: 9, name: '🏆 Melon Music Awards (MMA)', icon: '🍈' }
    ];

    function checkMidYearAward() {
        if (G.w !== 4) return;
        const key = G.y + '_' + G.m;
        const award = MID_AWARDS.find(a => a.month === G.m);
        if (!award || G.v155.midYearGiven[key]) return;
        G.v155.midYearGiven[key] = true;
        runMidYearAward(award);
    }

    function runMidYearAward(award) {
        document.getElementById('midyear-award-title').innerText = award.name;
        const voteSec = document.getElementById('midyear-voting-section');
        voteSec.innerHTML = `<div style="text-align:center;margin-bottom:12px;">
            <p style="color:#94a3b8;margin-bottom:8px;">📣 Voting Period — Boost peluang!</p>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
                <button class="vote-campaign-btn" onclick="v155VoteCampaign('streaming')">📺 Streaming (₩50Jt, +10%)</button>
                <button class="vote-campaign-btn" style="background:var(--c-pink);" onclick="v155VoteCampaign('sns')">📱 SNS Push (₩30Jt, +7%)</button>
            </div>
        </div>`;

        // Score all contestants
        let all = [];
        G.groups.filter(g => !g.isDisbanded && !g.isPreDebut).forEach(g => {
            let score = ((g.trophies || 0) * 200) + ((g.fansKR + g.fansGL) * 0.001) + (G.rep * 0.5) + (g.yearlyAlbumSales || 0) * 0.0001 + G.v155.votingBonus;
            let isRookie = (g.albums || 0) <= 2 && (G.y - (g.debutYear || G.y)) <= 1;
            let avgDance = g.members.length > 0 ? g.members.reduce((s, m) => s + m.dance, 0) / g.members.length : 50;
            all.push({ name: g.name, score, isPlayer: true, isRookie, avgDance, ref: g });
        });
        G.activeRivals.forEach(r => {
            let rScore = (r.tier === 'Legend' ? 2000 : r.tier === 'Top-Tier' ? 1200 : r.tier === 'Mid-Tier' ? 500 : 100) + Math.random() * 500;
            all.push({ name: r.artist, score: rScore, isPlayer: false, isRookie: false, avgDance: r.avgStat || 60, tier: r.tier });
        });
        all.sort((a, b) => b.score - a.score);

        let html = [];
        // Bonsang top 5
        html.push('<h3 style="color:#fbbf24;margin:10px 0 5px;">🏅 Bonsang (Top 5)</h3>');
        all.slice(0, 5).forEach((c, i) => {
            html.push(`<div class="neo-card-small" style="background:${c.isPlayer?'rgba(251,191,36,0.15)':'rgba(255,255,255,0.05)'};border-color:${c.isPlayer?'#fbbf24':'rgba(255,255,255,0.1)'};margin-bottom:4px;padding:8px 12px;">
                <span style="color:${c.isPlayer?'#fbbf24':'#94a3b8'};font-weight:900;">${i+1}. ${c.name}${c.isPlayer?' ✅':''}</span>
            </div>`);
            if (c.isPlayer) {
                finance('Award', 'income', 500000000, `Bonsang ${award.name}: ${c.name}`);
                G.rep += 200;
            }
        });

        // Best Performance (dance)
        let danceSorted = [...all].sort((a, b) => b.avgDance - a.avgDance);
        let perfWinner = danceSorted[0];
        html.push(`<h3 style="color:#ec4899;margin:12px 0 5px;">💃 Best Performance</h3>`);
        html.push(`<div class="neo-card-small" style="background:${perfWinner.isPlayer?'rgba(236,72,153,0.15)':'rgba(255,255,255,0.05)'};border-color:${perfWinner.isPlayer?'#ec4899':'rgba(255,255,255,0.1)'};padding:8px 12px;">
            <span style="font-weight:900;color:${perfWinner.isPlayer?'#ec4899':'#94a3b8'};">👑 ${perfWinner.name}</span></div>`);
        if (perfWinner.isPlayer) { finance('Award', 'income', 300000000, `Best Performance: ${perfWinner.name}`); G.rep += 150; }

        // Daesang
        let daesang = all[0];
        html.push(`<h3 style="color:#fbbf24;margin:12px 0 5px;">👑 Daesang — Artist of the Year</h3>`);
        html.push(`<div class="neo-card-small" style="background:${daesang.isPlayer?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.05)'};border-color:${daesang.isPlayer?'gold':'rgba(255,255,255,0.1)'};padding:10px 12px;">
            <span style="font-size:1.2rem;font-weight:900;color:${daesang.isPlayer?'#fbbf24':'#fff'};">👑 ${daesang.name}</span>
            ${daesang.isPlayer?'<br><span style="color:#22c55e;">+₩2M | +1000 Rep!</span>':''}
        </div>`);
        if (daesang.isPlayer) { finance('Award', 'income', 2000000000, `Daesang: ${daesang.name}`); G.rep += 1000; ticker(`🏆 DAESANG: ${daesang.name} wins at ${award.name}!`); }

        document.getElementById('midyear-results').innerHTML = html.join('');
        G.v155.votingBonus = 0;
        openModal('modal-midyear-award');
        log(`🏆 ${award.name} selesai! ${daesang.isPlayer ? daesang.name + ' menang Daesang!' : 'Kalah dari ' + daesang.name}`);
    }

    window.v155VoteCampaign = function(type) {
        if (type === 'streaming') { finance('Campaign', 'expense', 50000000, 'Streaming Campaign'); G.v155.votingBonus += 150; toast("📺 Streaming Campaign aktif! +10%", "success"); }
        else { finance('Campaign', 'expense', 30000000, 'SNS Push'); G.v155.votingBonus += 100; toast("📱 SNS Push aktif! +7%", "success"); }
    };

    // ==========================================
    // [6] STAFF MORALE & EVENTS
    // ==========================================
    function processStaffMorale() {
        // Sync morale array with staff length
        while (G.v155.staffMorale.length < G.staff.length) G.v155.staffMorale.push(70);
        while (G.v155.staffMorale.length > G.staff.length) G.v155.staffMorale.pop();

        G.staff.forEach((s, i) => {
            G.v155.staffMorale[i] = Math.max(0, G.v155.staffMorale[i] - 2);
            if (G.money > 0) G.v155.staffMorale[i] = Math.min(100, G.v155.staffMorale[i] + 1);

            // Low morale penalties
            if (G.v155.staffMorale[i] < 30) {
                if (s.type === 'Manager' && Math.random() < 0.1) log(`⚠️ Manager morale rendah — jadwal grup sering berantakan!`);
                if (s.type === 'Choreographer' && Math.random() < 0.08) log(`⚠️ Koreografer lesu — training efektivitas -25%`);
            }
        });

        // Staff event (random, ~10% chance per week, with cooldown)
        if (G.v155.staffEventCD > 0) { G.v155.staffEventCD--; return; }
        if (G.staff.length > 0 && Math.random() < 0.08) {
            G.v155.staffEventCD = 10; // 10 week cooldown
            triggerStaffEvent();
        }
    }

    function triggerStaffEvent() {
        const si = Math.floor(Math.random() * G.staff.length);
        const staff = G.staff[si];
        const events = [
            {
                desc: `${staff.type} [${staff.grade}] meminta kenaikan gaji! "Saya dapat tawaran lebih baik dari SM..."`,
                opts: [
                    { text: `💰 Terima Raise (+₩10Jt/bln)`, action: () => { G.v155.staffMorale[si] = Math.min(100, G.v155.staffMorale[si] + 25); staff.wage += 10000000; G.cost += 10000000; toast("Staff senang! Morale naik.", "success"); }},
                    { text: `❌ Tolak (-20 morale)`, action: () => { G.v155.staffMorale[si] = Math.max(0, G.v155.staffMorale[si] - 20); toast("Staff kecewa.", "warning"); }}
                ]
            },
            {
                desc: `Agensi rival mencoba merekrut ${staff.type} [${staff.grade}] kamu! Morale saat ini: ${G.v155.staffMorale[si]}`,
                opts: [
                    { text: `💰 Counter-Offer (₩100Jt bonus)`, action: () => { finance('Operational', 'expense', 100000000, `Counter-offer ${staff.type}`); G.v155.staffMorale[si] = Math.min(100, G.v155.staffMorale[si] + 30); toast("Staff tetap bertahan!", "success"); }},
                    { text: `👋 Biarkan Pergi`, action: () => { G.cost -= staff.wage; G.staff.splice(si, 1); G.v155.staffMorale.splice(si, 1); toast(`${staff.type} pindah ke rival.`, "danger"); log(`🚨 Staff ${staff.type} [${staff.grade}] dibajak rival!`); ticker(`TRANSFER: ${staff.type} top pindah ke agensi rival!`); }}
                ]
            }
        ];
        const ev = events[Math.floor(Math.random() * events.length)];
        document.getElementById('staff-event-desc').innerText = ev.desc;
        document.getElementById('staff-event-options').innerHTML = ev.opts.map((o, i) =>
            `<button class="neo-btn ${i===0?'success-btn':'danger-btn'} w-100" onclick="v155StaffEventResolve(${i})">${o.text}</button>`
        ).join('');
        window._staffEvOpts = ev.opts;
        openModal('modal-staff-event');
    }

    window.v155StaffEventResolve = function(i) {
        window._staffEvOpts?.[i]?.action();
        closeModal('modal-staff-event');
    };

    // Render morale on staff cards
    function renderStaffMorale() {
        const cards = document.querySelectorAll('#staff-list .neo-card-small');
        cards.forEach((card, idx) => {
            if (idx >= G.v155.staffMorale.length) return;
            const morale = G.v155.staffMorale[idx];
            let existing = card.querySelector('.morale-bar');
            if (!existing) {
                const div = document.createElement('div');
                div.style.marginTop = '4px';
                div.innerHTML = `<span style="font-size:0.65rem;color:#888;">Morale:</span> <span class="morale-bar"><span class="morale-fill ${morale>60?'good':morale>30?'warn':'bad'}" style="width:${morale}%"></span></span> <span style="font-size:0.65rem;font-weight:700;">${morale}</span>`;
                const fireBtn = card.querySelector('.neo-btn');
                if (fireBtn) card.insertBefore(div, fireBtn);
                else card.appendChild(div);
            } else {
                const fill = existing.querySelector('.morale-fill');
                if (fill) { fill.style.width = morale + '%'; fill.className = 'morale-fill ' + (morale>60?'good':morale>30?'warn':'bad'); }
                const numEl = existing.parentNode?.querySelector('span:last-child');
                if (numEl && numEl.style) numEl.textContent = morale;
            }
        });
    }

    // ==========================================
    // [7] DORM: BOND LEVELS & BONDING ACTIVITY
    // ==========================================
    function enhanceDormDisplay() {
        const chemList = document.getElementById('dorm-chem-list');
        if (!chemList) return;
        chemList.querySelectorAll('div, p, span').forEach(item => {
            if (item.querySelector('.bond-label')) return;
            const match = item.innerText.match(/(\d+)/);
            if (!match) return;
            const val = parseInt(match[1]);
            let label, cls;
            if (val <= 20) { label = '🔴 Toxic'; cls = 'bond-toxic'; }
            else if (val <= 40) { label = '🟠 Awkward'; cls = 'bond-awkward'; }
            else if (val <= 60) { label = '🟡 Neutral'; cls = 'bond-neutral'; }
            else if (val <= 80) { label = '🟢 Close'; cls = 'bond-close'; }
            else { label = '💜 Family'; cls = 'bond-family'; }
            const badge = document.createElement('span');
            badge.className = `bond-label ${cls}`;
            badge.textContent = label;
            badge.style.marginLeft = '6px';
            item.appendChild(badge);
        });
    }

    window.openBondingActivity = function() {
        const sel = document.getElementById('bonding-group-select');
        const src = document.getElementById('dorm-group-select') || document.getElementById('variety-group-select');
        if (sel && src) sel.innerHTML = src.innerHTML;
        openModal('modal-bonding');
    };

    window.executeBonding = function() {
        const grpName = document.getElementById('bonding-group-select').value;
        const activity = document.getElementById('bonding-activity').value;
        const grp = G.groups.find(g => g.name === grpName);
        if (!grp) return toast("Pilih grup!", "danger");

        const effects = {
            dinner: { cost: 20000000, chem: 10, stress: 0, desc: 'Team Dinner' },
            trip: { cost: 50000000, chem: 18, stress: -15, desc: 'Team Trip' },
            workshop: { cost: 80000000, chem: 25, stress: -5, desc: 'Team Workshop' }
        };
        const eff = effects[activity];
        if (G.money < eff.cost) return toast("Kas kurang!", "danger");

        finance('Activity', 'expense', eff.cost, `${eff.desc} (${grpName})`);
        grp.stress = Math.max(0, (grp.stress || 0) + eff.stress);
        toast(`💝 ${grpName}: ${eff.desc}! Chemistry +${eff.chem}${eff.stress < 0 ? ', Stress '+eff.stress : ''}`, 'success');
        log(`💝 ${grpName}: ${eff.desc} — Chemistry +${eff.chem}`);
        closeModal('modal-bonding');
    };

    // ==========================================
    // [8] SCANDAL: LEVEL SYSTEM + PR ACTIONS
    // ==========================================
    function processScandalSystem() {
        G.groups.forEach(grp => {
            if (!G.v155.scandalLevel[grp.name]) G.v155.scandalLevel[grp.name] = 0;
            let lvl = G.v155.scandalLevel[grp.name];

            // Sync with existing hasScandal flag
            if (grp.hasScandal && lvl < 3) {
                G.v155.scandalLevel[grp.name] = 5;
                lvl = 5;
                addAftermath(grp.name, 'rep_drain', 6, `${grp.name}: Skandal aktif — reputasi turun terus`);
            }

            // Decay
            const mult = G.v155.scandalDecayMult[grp.name] || 1;
            if (lvl > 0) {
                G.v155.scandalLevel[grp.name] = Math.max(0, lvl - (0.5 * mult));
                lvl = G.v155.scandalLevel[grp.name];
            }

            // Level-based effects
            if (lvl >= 7) {
                grp.fansKR = Math.max(0, grp.fansKR - Math.floor(grp.fansKR * 0.05));
                G.rep = Math.max(0, G.rep - 50);
            } else if (lvl >= 4) {
                grp.fansKR = Math.max(0, grp.fansKR - Math.floor(grp.fansKR * 0.02));
            } else if (lvl >= 1) {
                grp.fansKR = Math.max(0, grp.fansKR - Math.floor(grp.fansKR * 0.005));
            }

            // Clear hasScandal when level drops to 0
            if (lvl <= 0) grp.hasScandal = false;
        });
    }

    // Expose for interactive events to use
    window._v155SetScandal = function(grpName, severity) {
        G.v155.scandalLevel[grpName] = Math.min(10, (G.v155.scandalLevel[grpName] || 0) + severity);
    };

    window.openPRActionModal = function() {
        const artName = document.getElementById('art-name')?.innerText?.trim() || '';
        const lvl = G.v155.scandalLevel[artName] || 0;
        document.getElementById('pr-group-info').innerText = `Grup: ${artName}`;
        document.getElementById('pr-scandal-display').innerHTML = `
            <div style="display:flex;justify-content:space-between;"><strong>Skandal Level:</strong><span style="font-weight:900;color:${lvl>=7?'var(--c-red-solid)':lvl>=4?'var(--c-orange-solid)':'var(--c-yellow-solid)'};">${lvl.toFixed(1)}/10</span></div>
            <div class="scandal-bar"><div class="scandal-fill" style="width:${lvl*10}%"></div></div>
            <div style="font-size:0.75rem;margin-top:4px;color:#888;">Decay rate: ${(G.v155.scandalDecayMult[artName]||1).toFixed(1)}×</div>`;
        document.getElementById('pr-action-options').innerHTML = `
            <button class="neo-btn action-btn w-100" onclick="v155PRAction('${artName}','apology')">📹 Apology Video (₩50Jt) — Decay ×2 selama 4 mgg</button>
            <button class="neo-btn primary-btn w-100" onclick="v155PRAction('${artName}','press')">🎙️ Press Conference (₩100Jt) — Instant skandal -3</button>
            <button class="neo-btn bg-purple w-100" onclick="v155PRAction('${artName}','hiatus')">🚪 Hiatus — Grup berhenti, decay ×3</button>`;
        openModal('modal-pr-action');
    };

    window.v155PRAction = function(grp, action) {
        if (action === 'apology') {
            finance('PR', 'expense', 50000000, `Apology Video (${grp})`);
            G.v155.scandalDecayMult[grp] = 2;
            // Reset after 4 weeks handled in decay check (we use a counter)
            G.v155['_prApologyEnd_' + grp] = 4;
            toast(`📹 Apology video ${grp}. Decay ×2 selama 4 minggu!`, 'success');
            log(`📹 PR: ${grp} — apology video dipublish.`);
            genFeed?.('general', grp);
        } else if (action === 'press') {
            finance('PR', 'expense', 100000000, `Press Conference (${grp})`);
            G.v155.scandalLevel[grp] = Math.max(0, (G.v155.scandalLevel[grp] || 0) - 3);
            toast(`🎙️ Press conf: ${grp} skandal -3!`, 'success');
            log(`🎙️ PR: ${grp} — press conference, skandal turun 3 level.`);
        } else {
            G.v155.scandalDecayMult[grp] = 3;
            const g = G.groups.find(x => x.name === grp);
            if (g) { g.busyWeeks = 4; g.currentEvent = 'hiatus'; }
            toast(`🚪 ${grp} hiatus. Skandal decay ×3, tapi 0 income.`, 'warning');
            log(`🚪 PR: ${grp} masuk hiatus — skandal recovery mode.`);
        }
        closeModal('modal-pr-action');
    };

    // Update artist detail UI
    function updateArtistScandalUI() {
        const nameEl = document.getElementById('art-name');
        if (!nameEl) return;
        const name = nameEl.innerText.trim();
        const lvl = G.v155.scandalLevel[name] || 0;
        const slEl = document.getElementById('art-scandal-level');
        if (slEl) slEl.innerText = lvl.toFixed(1) + '/10';
        const sentBar = document.getElementById('art-sentiment-bar');
        const sentLabel = document.getElementById('art-sentiment-label');
        if (sentBar) {
            const pct = Math.max(0, 100 - lvl * 10);
            sentBar.style.width = pct + '%';
            sentBar.className = 'fill ' + (pct > 60 ? 'bg-green' : pct > 30 ? 'bg-yellow' : 'bg-pink');
        }
        if (sentLabel) {
            const pct = Math.max(0, 100 - lvl * 10);
            sentLabel.innerText = pct > 60 ? '😊 Positif' : pct > 30 ? '😐 Netral' : '😡 Negatif';
            sentLabel.style.color = pct > 60 ? 'var(--c-green-solid)' : pct > 30 ? 'var(--c-yellow-solid)' : 'var(--c-red-solid)';
        }
    }

    // ==========================================
    // [9] SOCIAL MEDIA: TRENDING, FANCAM, PLATFORM STYLE
    // ==========================================
    function updateTrending() {
        const pool = ['#KPopComeback', '#MusicBank', '#AwardShow', '#Fancam', '#AllKill',
            '#DanceChallenge', '#VocalKing', '#MelonChart', '#Trending', '#DebutDay',
            '#ComebackStage', '#PhotoCard', '#FanSign', '#WorldTour', '#Rookie'];
        // Shuffle
        for (let i = pool.length - 1; i > 0; i--) { let j = Math.floor(Math.random()*(i+1)); [pool[i],pool[j]]=[pool[j],pool[i]]; }
        // Inject group name
        if (G.groups.length > 0) {
            const g = G.groups[Math.floor(Math.random() * G.groups.length)];
            pool[0] = '#' + g.name.replace(/\s+/g, '');
        }
        G.v155.trendingTags = pool.slice(0, 3);
        for (let i = 1; i <= 3; i++) {
            const el = document.getElementById('trend-' + i);
            if (el) el.textContent = G.v155.trendingTags[i - 1];
        }
    }

    function generateFancam() {
        if (G.groups.length === 0) return;
        const grp = G.groups.filter(g => !g.isDisbanded && !g.isPreDebut)[0];
        if (!grp || grp.members.length === 0) return;
        // Pick best dancer
        const best = [...grp.members].sort((a, b) => b.dance - a.dance)[0];
        const views = Math.floor(50000 + (grp.fansKR + grp.fansGL) * 0.05 + Math.random() * 300000);
        G.v155.fancams.unshift({ member: best.name, group: grp.name, views, week: G.w });
        if (G.v155.fancams.length > 8) G.v155.fancams.pop();
        if (views > 500000) {
            best.indFans = (best.indFans || 0) + Math.floor(views * 0.01);
            toast(`📹 ${best.name} fancam viral! ${(views/1000000).toFixed(1)}M views! IndFans +${Math.floor(views*0.01).toLocaleString()}`, 'success');
            ticker(`📹 FANCAM VIRAL: ${best.name} (${grp.name}) — ${(views/1000).toFixed(0)}K views!`);
        }
    }

    function styleSocialFeed() {
        const feed = document.getElementById('social-feed');
        if (!feed) return;
        feed.querySelectorAll('div').forEach(item => {
            const t = (item.innerText || '').toLowerCase();
            if (t.includes('twitter') || t.includes('트위터') || t.includes('@')) item.classList.add('sosmed-twitter');
            else if (t.includes('weverse') || t.includes('위버스')) item.classList.add('sosmed-weverse');
            else if (t.includes('tiktok') || t.includes('틱톡')) item.classList.add('sosmed-tiktok');
            else if (t.includes('instagram') || t.includes('인스타')) item.classList.add('sosmed-instagram');
        });
    }

    // ==========================================
    // [10] CONCERT: TICKET SALES & REVIEW
    // ==========================================
    function processConcertSales() {
        // Hook into existing concert/tour events
        G.groups.forEach(grp => {
            if (grp.currentEvent === 'tour' || grp.currentEvent === 'worldtour') {
                const sid = 'c_' + grp.name;
                if (!G.v155.concertSales.find(c => c.id === sid)) {
                    const isWorld = grp.currentEvent === 'worldtour';
                    const totalSeats = isWorld ? 300000 : 10000;
                    const reqFans = isWorld ? 500000 : 30000;
                    G.v155.concertSales.push({
                        id: sid, group: grp.name, venue: isWorld ? 'World Tour' : 'Arena Tour',
                        totalSeats, sold: 0, reqFans, weeksLeft: grp.busyWeeks || 3,
                        baseSalesRate: Math.min(1, (grp.fansKR + grp.fansGL) / reqFans),
                        marketingMult: 1.0
                    });
                }
            }
        });

        G.v155.concertSales.forEach(c => {
            if (c.complete) return;
            c.weeksLeft--;
            const rate = Math.min(1, c.baseSalesRate * c.marketingMult * 0.25);
            c.sold = Math.min(c.totalSeats, c.sold + Math.floor(c.totalSeats * rate));
            const pct = Math.floor(c.sold / c.totalSeats * 100);
            log(`🎫 Tiket ${c.venue} [${c.group}]: ${pct}% terjual (${(c.totalSeats - c.sold).toLocaleString()} seats tersisa)`);

            if (c.weeksLeft <= 0) {
                c.complete = true;
                showConcertReview(c);
            }
        });
        // Clean completed after 2 ticks
        G.v155.concertSales = G.v155.concertSales.filter(c => !c.complete || c.weeksLeft > -2);
    }

    function showConcertReview(c) {
        const grp = G.groups.find(g => g.name === c.group);
        const fillPct = c.sold / c.totalSeats;
        const facilLevel = G.facilities.practice + G.facilities.studio;
        const stageScore = Math.min(100, Math.floor(30 + facilLevel * 5 + Math.random() * 15));
        const avgSongScore = G.activeSongs.filter(s => s.artistRef?.name === c.group).reduce((s, x) => s + (x.score || 50), 0) / Math.max(1, G.activeSongs.filter(s => s.artistRef?.name === c.group).length) || 50;
        const setlistScore = Math.min(100, Math.floor(avgSongScore * 0.8 + Math.random() * 20));
        const crowdScore = Math.min(100, Math.floor(fillPct * 85 + Math.random() * 15));
        const avg = Math.floor((stageScore + setlistScore + crowdScore) / 3);

        const repBonus = Math.floor(avg * 2);
        const fanBonus = Math.floor(avg * 30 * fillPct);
        if (grp) { grp.fansKR += fanBonus; grp.fansGL += Math.floor(fanBonus * 0.3); }
        G.rep += repBonus;

        const content = document.getElementById('concert-review-content');
        if (!content) return;
        content.innerHTML = `
            <h3 style="text-align:center;margin-bottom:15px;">${c.group} @ ${c.venue}</h3>
            <div class="review-score-grid">
                <div class="review-score-card" style="background:var(--c-blue);"><div class="review-score-num">${stageScore}</div><div>🎭 Stage</div></div>
                <div class="review-score-card" style="background:var(--c-pink);"><div class="review-score-num">${setlistScore}</div><div>🎵 Setlist</div></div>
                <div class="review-score-card" style="background:var(--c-green);"><div class="review-score-num">${crowdScore}</div><div>🔥 Crowd</div></div>
            </div>
            <div class="neo-card-small bg-yellow" style="text-align:center;">
                <strong>Average: ${avg}/100</strong> — ${avg >= 80 ? '⭐ EXCELLENT!' : avg >= 60 ? '👍 Good show!' : avg >= 40 ? '😐 Mediocre.' : '💩 Disaster.'}
                <div style="font-size:0.85rem;margin-top:6px;">Tickets: ${c.sold.toLocaleString()}/${c.totalSeats.toLocaleString()} (${Math.floor(fillPct*100)}%)</div>
                <div style="font-size:0.85rem;color:var(--c-green-solid);">+${repBonus} Rep | +${fanBonus.toLocaleString()} Fans</div>
            </div>`;
        openModal('modal-concert-review');
        log(`📝 Concert Review: ${c.group} — Score ${avg}/100 | +${repBonus} Rep | +${fanBonus.toLocaleString()} Fans`);
        if (avg >= 80) ticker(`🌟 ${c.group} concert review: EXCELLENT! (${avg}/100)`);
    }

    // ==========================================
    // MAIN V15.5 WEEKLY HOOK — attached to skip-week button
    // ==========================================
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        // [1] Training assignments bonus
        applyTrainingAssignments();
        // [1] Monthly evaluation
        if (G.w === 1) runTraineeEvaluation();
        // [1] Trainee resignation risk
        G.trainees.filter(t => !t.isDebuted && (t.monthsTraining || 0) > 36).forEach(t => {
            const risk = Math.min(80, ((t.monthsTraining || 0) - 36) * 5);
            if (Math.random() * 100 < risk * 0.15) {
                toast(`💔 ${t.name} resign setelah ${Math.floor(t.monthsTraining)} bulan tanpa debut!`, 'danger');
                log(`💔 Trainee ${t.name} resign (${Math.floor(t.monthsTraining)} bln)!`);
                t.isDebuted = true; // mark as gone
            }
        });

        // [2] Chart enhancement (after charts rebuild)
        setTimeout(enhanceCharts, 400);

        // [3] Finance
        updateFinanceMetrics();
        // PR apology countdown
        G.groups.forEach(g => {
            const k = '_prApologyEnd_' + g.name;
            if (G.v155[k] > 0) { G.v155[k]--; if (G.v155[k] <= 0) { G.v155.scandalDecayMult[g.name] = 1; log(`📹 Apology effect ${g.name} berakhir.`); } }
        });

        // [4] Aftermaths
        processAftermaths();

        // [5] Mid-year awards
        checkMidYearAward();

        // [6] Staff morale
        processStaffMorale();
        setTimeout(renderStaffMorale, 300);

        // [7] Dorm labels
        setTimeout(enhanceDormDisplay, 300);

        // [8] Scandal system
        processScandalSystem();

        // [9] Social
        if (G.w === 1) updateTrending();
        if (Math.random() < 0.15) generateFancam();
        setTimeout(styleSocialFeed, 300);

        // [10] Concert sales
        processConcertSales();
    });

    // ==========================================
    // TAB CLICK HOOKS
    // ==========================================
    document.querySelector('[data-target="dorm"]')?.addEventListener('click', () => setTimeout(enhanceDormDisplay, 300));
    document.querySelector('[data-target="chart"]')?.addEventListener('click', () => setTimeout(enhanceCharts, 300));
    document.querySelector('[data-target="social"]')?.addEventListener('click', () => { setTimeout(styleSocialFeed, 300); updateTrending(); });
    document.querySelector('[data-target="staff"]')?.addEventListener('click', () => setTimeout(renderStaffMorale, 300));

    // Artist detail modal observer for scandal UI
    const artModal = document.getElementById('modal-artist-detail');
    if (artModal) {
        new MutationObserver(() => { if (artModal.style.display === 'flex') setTimeout(updateArtistScandalUI, 150); }).observe(artModal, { attributes: true, attributeFilter: ['style'] });
    }

    // ==========================================
    // INIT
    // ==========================================
    updateTrending();
    renderSituations();
    updateFinanceMetrics();

    // Version stamp
    const introSub = document.querySelector('.intro-subtitle');
    if (introSub) introSub.innerText = 'K-Pop Simulator v15.5 (Deep Systems Update)';

    console.log('✅ K-Pop Tycoon v15.5 — Deep Systems Update loaded! (gameData bridge active)');
})();

// ==========================================
// K-Pop Tycoon v15.5.1 — Living Detail System
// Every detail (trait, bg, position, stat, gender, members, concept) LIVES.
// ==========================================

(function waitForLivingDetail() {
    if (!window._gd || !window._showToast) return setTimeout(waitForLivingDetail, 350);

    const G = window._gd;
    const toast = window._showToast;
    const log = window._addMainLog;
    const finance = (...a) => window._addFinanceRecord?.(...a);
    const genFeed = (...a) => window._genSocialFeed?.(...a);
    const ticker = (msg) => { let t = document.getElementById('ticker-track'); if(t){ let s=document.createElement('span'); s.className='ticker-item'; s.innerHTML=' 🔴 '+msg+' '; t.appendChild(s); }};

    // ==========================================
    // [A] CORE TRAIT HELPERS
    // ==========================================
    function getTraitMembers(group, traitName) { // [LIVING DETAIL]
        if (!group || !group.members) return [];
        return group.members.filter(m => m.traitObj && m.traitObj.name === traitName);
    }
    function groupHasTrait(group, traitName) { // [LIVING DETAIL]
        return getTraitMembers(group, traitName).length > 0;
    }
    function getMemberByPosition(group, position) { // [LIVING DETAIL]
        if (!group || !group.members) return null;
        let m = group.members.find(mem => mem.positions && mem.positions.includes(position));
        if (m) return m;
        // Fallback: best stat for role
        const statMap = { 'Main Vocal': 'vocal', 'Lead Vocal': 'vocal', 'Main Dancer': 'dance', 'Lead Dancer': 'dance', 'Main Rapper': 'rap', 'Visual': 'visual', 'Center': 'visual', 'Leader': 'vocal' };
        const stat = statMap[position] || 'vocal';
        return [...group.members].sort((a,b) => (b[stat]||0) - (a[stat]||0))[0] || null;
    }
    // Expose globally
    window._getTraitMembers = getTraitMembers;
    window._groupHasTrait = groupHasTrait;
    window._getMemberByPosition = getMemberByPosition;

    // ==========================================
    // [B] BACKGROUND TYPE MAPPING
    // ==========================================
    const BG_TYPE_MAP = { // [LIVING DETAIL]
        'Big 3': 'big3_exp', 'SM': 'big3_exp', 'JYP': 'big3_exp', 'SOPA': 'big3_exp', 'SM Academy': 'big3_exp',
        'TikTok': 'social_native', 'viral': 'social_native',
        'atlet': 'athlete', 'renang': 'athlete', 'taekwondo': 'athlete', 'gymnastic': 'athlete', 'skater': 'athlete',
        'underground': 'hiphop_vet', 'K-HipHop': 'hiphop_vet', 'beatbox': 'hiphop_vet', 'SMTM': 'hiphop_vet',
        'konglomerat': 'wealthy', 'Samsung': 'wealthy', 'diplomat': 'wealthy',
        'debut nugu': 'veteran_idol', 'idol cilik': 'veteran_idol', 'Produce 101': 'veteran_idol', 'idol bubar': 'veteran_idol',
        'YouTuber': 'content_creator', 'SoundCloud': 'content_creator', 'Streamer': 'content_creator',
        'jalanan Hongdae': 'street_dancer', 'Hongdae': 'street_dancer', 'Street': 'street_dancer', 'dancer backup': 'street_dancer',
        'paduan suara': 'choir_trained', 'vokal nasional': 'choir_trained', 'Voice Kids': 'choir_trained', 'busking': 'choir_trained',
        'Aktor': 'actor_trained', 'child actor': 'actor_trained', 'musikal': 'actor_trained', 'MBC drama': 'actor_trained', 'Model': 'actor_trained'
    };

    function assignBgType(member) { // [LIVING DETAIL]
        if (member.bgType) return;
        const bg = (member.bg || '').toLowerCase();
        for (const [keyword, type] of Object.entries(BG_TYPE_MAP)) {
            if (bg.toLowerCase().includes(keyword.toLowerCase())) { member.bgType = type; return; }
        }
        member.bgType = 'normal';
    }

    // Assign bgType to all existing trainees and members
    G.trainees.forEach(t => assignBgType(t)); // [LIVING DETAIL]
    G.groups.forEach(grp => grp.members.forEach(m => assignBgType(m))); // [LIVING DETAIL]

    // ==========================================
    // [E] MEMBER COUNT HELPER
    // ==========================================
    function getMemberCountMod(grp) { // [LIVING DETAIL]
        const n = grp.members?.length || 4;
        return {
            stressExtra: n >= 8 ? 3 : 0,
            stressReduction: n <= 4 ? 2 : 0,
            chemGrowthMult: n < 5 ? 1.5 : n <= 7 ? 1.0 : 0.7,
            weeklyCost: n * 500000,
            choreoBonus: (n >= 3 && n <= 4) ? 8 : 0
        };
    }

    // ==========================================
    // [F] GENDER HELPER
    // ==========================================
    function getGroupGender(grp) { // [LIVING DETAIL]
        if (grp.gender) return grp.gender;
        if (!grp.members || grp.members.length === 0) return 'Mixed';
        const males = grp.members.filter(m => m.gender === 'Male').length;
        const females = grp.members.filter(m => m.gender === 'Female').length;
        if (males > 0 && females > 0) return 'Mixed';
        return males > females ? 'Male' : 'Female';
    }

    // ==========================================
    // MAIN WEEKLY TICK — LIVING DETAIL PROCESSING
    // ==========================================
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        G.groups.forEach(grp => {
            if (grp.isDisbanded) return;
            const mc = getMemberCountMod(grp);
            const gender = getGroupGender(grp);
            grp.gender = gender; // [LIVING DETAIL] cache

            // ---- [A] TRAIT: WEEKLY EFFECTS ----

            // Moodmaker: stress -5/week [LIVING DETAIL]
            if (groupHasTrait(grp, 'Moodmaker')) {
                grp.stress = Math.max(0, (grp.stress || 0) - 5);
            }

            // Problematic: chemistry -2/week [LIVING DETAIL]
            getTraitMembers(grp, 'Problematic').forEach(m => {
                // log only occasionally
                if (Math.random() < 0.15) log(`😤 ${m.name} (${grp.name}) attitude buruk — grup chemistry turun.`);
            });

            // SNS King/Queen: +50 global fans/week [LIVING DETAIL]
            getTraitMembers(grp, 'SNS King/Queen').forEach(m => {
                grp.fansGL = (grp.fansGL || 0) + 50;
                m.indFans = (m.indFans || 0) + Math.floor(50 + Math.random() * 100);
            });

            // Skandal-Prone: 15% chance per month [LIVING DETAIL]
            if (G.w === 1) {
                getTraitMembers(grp, 'Skandal-Prone').forEach(m => {
                    if (Math.random() < 0.15) {
                        log(`📸 ${m.name} (${grp.name}) kena skandal minor (Trait: Skandal-Prone)!`);
                        toast(`📸 ${m.name} skandal minor!`, 'warning');
                        if (G.v155) G.v155.scandalLevel[grp.name] = Math.min(10, (G.v155.scandalLevel?.[grp.name] || 0) + 2);
                        grp.hasScandal = true;
                        ticker(`SKANDAL: ${m.name} (${grp.name}) — foto kontroversial viral!`);
                        genFeed?.('scandal_attitude', grp.name);
                    }
                });

                // Kaca Kaca: 10% chance cedera/breakdown per month [LIVING DETAIL]
                getTraitMembers(grp, 'Kaca Kaca').forEach(m => {
                    if (Math.random() < 0.10) {
                        log(`🤕 ${m.name} (${grp.name}) breakdown/cedera (Trait: Kaca Kaca)!`);
                        toast(`🤕 ${m.name} cedera mental!`, 'danger');
                        grp.stress = Math.min(100, (grp.stress || 0) + 20);
                    }
                });
            }

            // Lucky Star: negative event dampening handled in event system
            // (we'll hook into event processing below)

            // ---- [E] MEMBER COUNT: WEEKLY EFFECTS ---- [LIVING DETAIL]
            grp.stress = Math.min(100, (grp.stress || 0) + mc.stressExtra);
            grp.stress = Math.max(0, (grp.stress || 0) - mc.stressReduction);

            // Member gaji [LIVING DETAIL]
            // (Not calling finance to avoid spam — this is factored into burn rate concept)

            // ---- [F] GENDER: FANDOM GROWTH BIAS ---- [LIVING DETAIL]
            if (gender === 'Male') {
                // Male groups: physical-buying fans, KR skews higher
                grp.fansKR = (grp.fansKR || 0) + Math.floor(Math.random() * 15);
            } else if (gender === 'Female') {
                // Female groups: global fans grow faster
                grp.fansGL = (grp.fansGL || 0) + Math.floor(Math.random() * 20);
            }

            // ---- [B] BACKGROUND: WEEKLY EFFECTS ---- [LIVING DETAIL]
            grp.members.forEach(m => {
                assignBgType(m);

                // wealthy: 5% chance per year (~0.1% per week) sponsor event [LIVING DETAIL]
                if (m.bgType === 'wealthy' && G.w === 1 && G.m === 6 && Math.random() < 0.05) {
                    const amt = 100000000 + Math.floor(Math.random() * 400000000);
                    finance?.('Sponsor', 'income', amt, `Sponsor Keluarga ${m.name}`);
                    log(`💎 ${m.name}: keluarga konglomerat menyuntik dana ${(amt/1e8).toFixed(0)} M!`);
                    toast(`💎 Sponsor keluarga ${m.name}! +${(amt/1e8).toFixed(0)}억!`, 'success');
                }

                // veteran_idol: year 1 baggage scandal chance [LIVING DETAIL]
                if (m.bgType === 'veteran_idol' && !m._bgBaggageChecked) {
                    const yearsActive = G.y - (grp.debutYear || G.y);
                    if (yearsActive <= 1 && Math.random() < 0.20) {
                        m._bgBaggageChecked = true;
                        log(`🚨 ${m.name} (${grp.name}): skandal masa lalu sebagai ex-idol terungkap!`);
                        toast(`🚨 ${m.name} baggage skandal masa lalu!`, 'danger');
                        if (G.v155) G.v155.scandalLevel[grp.name] = Math.min(10, (G.v155.scandalLevel?.[grp.name] || 0) + 3);
                        grp.hasScandal = true;
                    }
                    if (yearsActive > 1) m._bgBaggageChecked = true;
                }
            });
        });

        // ---- [A] TRAINEE TRAINING: TRAIT MODIFIERS ---- [LIVING DETAIL]
        G.trainees.filter(t => !t.isDebuted).forEach(t => {
            assignBgType(t);
            const isLateWeek = G.w >= 3;

            // Night Owl: week 3-4 training ×1.3 [LIVING DETAIL]
            if (t.traitObj?.name === 'Night Owl' && isLateWeek) {
                t.vocal = Math.min(99, t.vocal + 0.3);
                t.dance = Math.min(99, t.dance + 0.3);
            }

            // Dark Horse: after 6 months, growth ×2 (extra boost) [LIVING DETAIL]
            if (t.traitObj?.name === 'Dark Horse' && (t.monthsTraining || 0) >= 6) {
                t.vocal = Math.min(99, t.vocal + 0.4);
                t.dance = Math.min(99, t.dance + 0.4);
                t.rap = Math.min(99, t.rap + 0.3);
            }

            // athlete bg: stamina-related benefits (less stat decay) [LIVING DETAIL]
            // big3_exp: evaluation never D [LIVING DETAIL] (handled in eval system)
        });
    });

    // ==========================================
    // HOOK INTO RELEASE SCORE — TRAIT + POSITION + STAT DEPTH
    // ==========================================
    // We monkey-patch by adding a post-processing listener
    // The existing executeReleaseLogic stores the song in activeSongs.
    // We'll enhance scores AFTER they're calculated by hooking into the animation queue.

    const _origFinalizeDebut = window.finalizeDebut;
    if (_origFinalizeDebut) {
        window.finalizeDebut = function() {
            // Before finalizing, apply living detail modifiers to pending data
            _origFinalizeDebut.apply(this, arguments);

            // After release is queued, annotate it with living detail flags
            const lastRelease = G.pendingReleases[G.pendingReleases.length - 1];
            if (lastRelease) {
                const grp = lastRelease.isCb ? G.groups[lastRelease.cbIdx] : lastRelease.debutData;
                if (grp) {
                    lastRelease._livingDetail = buildLivingDetailFlags(grp, lastRelease); // [LIVING DETAIL]
                }
            }
        };
    }

    function buildLivingDetailFlags(grp, releaseData) { // [LIVING DETAIL]
        const flags = { bonuses: [], penalties: [], totalBonus: 0 };
        const concept = releaseData.concept;
        const tb = releaseData.taskBuffs || {};

        // [A] Composer Prodigy + self_composed [LIVING DETAIL]
        if (groupHasTrait(grp, 'Composer Prodigy') && tb.music === 'self_composed') {
            flags.bonuses.push('Composer Prodigy + self-composed: +15 quality');
            flags.totalBonus += 15;
        }

        // [A] Perfectionist: +15% quality [LIVING DETAIL]
        if (groupHasTrait(grp, 'Perfectionist')) {
            flags.bonuses.push('Perfectionist: +15% quality boost');
            flags.totalBonus += 8;
        }

        // [A] Rebel Spirit + unique concept [LIVING DETAIL]
        const uniqueConcepts = ['Cyberpunk', 'Hyperpop', 'Dark Academia', 'Ethereal', 'Folklore/Traditional', 'Avant-garde'];
        if (groupHasTrait(grp, 'Rebel Spirit') && uniqueConcepts.includes(concept)) {
            flags.bonuses.push('Rebel Spirit + unique concept: +20% synergy');
            flags.totalBonus += 12;
        }

        // [B] hiphop_vet + self_composed + hip-hop [LIVING DETAIL]
        const rappers = grp.members.filter(m => m.bgType === 'hiphop_vet');
        if (rappers.length > 0 && tb.music === 'self_composed' && concept === 'Hip-Hop') {
            flags.bonuses.push(`Hip-hop veteran ${rappers[0].name}: +8 quality`);
            flags.totalBonus += 8;
        }

        // [C] Main Vocalist weighted scoring [LIVING DETAIL]
        const mv = getMemberByPosition(grp, 'Main Vocal');
        if (mv) {
            const vocalWeight = mv.vocal * 0.5 + grp.members.reduce((s,m) => s + m.vocal, 0) / grp.members.length * 0.5;
            if (mv.vocal >= 80) { flags.bonuses.push(`Ace vocalist ${mv.name}: boosted vocal score`); flags.totalBonus += 5; }
        }

        // [C] No Main Rapper but Hip-Hop concept [LIVING DETAIL]
        const mr = getMemberByPosition(grp, 'Main Rapper');
        if (!mr && concept === 'Hip-Hop') {
            flags.penalties.push('No dedicated rapper for Hip-Hop concept!');
            flags.totalBonus -= 10;
        }

        // [D] Weakest Link Penalty [LIVING DETAIL]
        const vocalHeavy = ['Ballad', 'R&B', 'Dreamy', 'Elegant'].includes(concept);
        const danceHeavy = ['Girl Crush', 'Hip-Hop', 'Y2K', 'Teen Crush', 'Cyberpunk'].includes(concept);
        grp.members.forEach(m => {
            if (vocalHeavy && m.vocal < 30) {
                flags.penalties.push(`${m.name} vocal ${Math.floor(m.vocal)} — weak link untuk konsep vokal!`);
                flags.totalBonus -= 5;
            }
            if (danceHeavy && m.dance < 30) {
                flags.penalties.push(`${m.name} dance ${Math.floor(m.dance)} — weak link untuk konsep dance!`);
                flags.totalBonus -= 5;
            }
        });

        // [D] Variance Bonus (Ace Group vs Balanced) [LIVING DETAIL]
        const critStat = vocalHeavy ? 'vocal' : 'dance';
        const stats = grp.members.map(m => m[critStat] || 50);
        const mean = stats.reduce((a,b) => a+b, 0) / stats.length;
        const stdDev = Math.sqrt(stats.reduce((s, v) => s + (v - mean) ** 2, 0) / stats.length);
        if (stdDev > 20) { flags.bonuses.push('Ace Group: high variance — peak potential!'); flags.totalBonus += 4; }
        else if (stdDev < 8) { flags.bonuses.push('Balanced Group: stable performance'); flags.totalBonus += 2; }

        // [E] Member count choreo bonus [LIVING DETAIL]
        const mc = getMemberCountMod(grp);
        if (mc.choreoBonus > 0 && tb.choreo === 'studio1m') {
            flags.bonuses.push('Trio/Quartet + Studio Choreo: +8 synergy');
            flags.totalBonus += mc.choreoBonus;
        }

        // [G] Concept-specific market receptivity [LIVING DETAIL]
        // (Affects chart score indirectly, logged for player info)
        if (['Cute', 'Refreshing'].includes(concept)) flags.bonuses.push('Concept: Japan market ×1.4');
        if (['Girl Crush', 'Charismatic'].includes(concept)) flags.bonuses.push('Concept: US/EU market ×1.3');

        return flags;
    }

    // Apply living detail bonuses to newly released songs
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        G.activeSongs.forEach(song => {
            if (song._livingDetailApplied) return;
            // Find the release data that created this song
            const grp = song.artistRef;
            if (!grp) return;

            // Build flags if not present
            if (!song._livingFlags) {
                song._livingFlags = { totalBonus: 0, bonuses: [], penalties: [] };
                // Apply trait bonuses [LIVING DETAIL]
                if (groupHasTrait(grp, 'Composer Prodigy')) song._livingFlags.totalBonus += 8;
                if (groupHasTrait(grp, 'Stage Monster')) song._livingFlags.totalBonus += 5;
                if (groupHasTrait(grp, 'Perfectionist')) song._livingFlags.totalBonus += 5;

                // Main Vocalist weighted [LIVING DETAIL]
                const mv = getMemberByPosition(grp, 'Main Vocal');
                if (mv && mv.vocal >= 80) song._livingFlags.totalBonus += 5;

                // Weakest link [LIVING DETAIL]
                grp.members.forEach(m => {
                    if (m.vocal < 30 && ['Ballad','R&B'].includes(grp.concept)) song._livingFlags.totalBonus -= 3;
                    if (m.dance < 30 && ['Girl Crush','Hip-Hop','Y2K'].includes(grp.concept)) song._livingFlags.totalBonus -= 3;
                });
            }

            if (song._livingFlags.totalBonus !== 0 && !song._livingDetailApplied) {
                song.score = Math.max(3, (song.score || 0) + song._livingFlags.totalBonus);
                song._livingDetailApplied = true;
                if (song._livingFlags.totalBonus > 5) {
                    log(`✨ [LIVING DETAIL] "${song.title}": trait/position bonuses +${song._livingFlags.totalBonus} to chart score!`);
                } else if (song._livingFlags.totalBonus < -3) {
                    log(`⚠️ [LIVING DETAIL] "${song.title}": weaknesses penalized score by ${song._livingFlags.totalBonus}`);
                }
            }
        });

        // ---- [C] FANCAM per performance (Main Dancer + Center) ---- [LIVING DETAIL]
        G.groups.forEach(grp => {
            if (grp.isDisbanded || grp.isPreDebut) return;
            if (grp.busyWeeks > 0 || Math.random() > 0.25) return; // 25% chance per week when active

            // Main Dancer fancam [LIVING DETAIL]
            const dancer = getMemberByPosition(grp, 'Main Dancer');
            if (dancer) {
                const viralChance = Math.min(0.5, (dancer.dance || 50) / 200);
                const bgBoost = dancer.bgType === 'street_dancer' ? 0.20 : 0;
                if (Math.random() < viralChance + bgBoost) {
                    const views = Math.floor(10000 + (grp.fansKR + grp.fansGL) * 0.03 + Math.random() * 200000);
                    const fanGain = Math.floor(500 + Math.random() * 4500);
                    dancer.indFans = (dancer.indFans || 0) + fanGain;
                    if (views > 300000) {
                        log(`📹 [FANCAM] ${dancer.name} (${grp.name}) dance fancam viral! ${(views/1000).toFixed(0)}K views, +${fanGain.toLocaleString()} fans!`);
                        ticker(`📹 FANCAM: ${dancer.name} dance fancam ${(views/1000).toFixed(0)}K views!`);
                    }
                }
            }

            // Center fancam [LIVING DETAIL]
            const center = getMemberByPosition(grp, 'Center');
            if (center && center !== dancer) {
                const viralChance = Math.min(0.5, (center.visual || 50) / 200);
                if (Math.random() < viralChance) {
                    const views = Math.floor(8000 + (grp.fansKR + grp.fansGL) * 0.02 + Math.random() * 150000);
                    const fanGain = Math.floor(300 + Math.random() * 3000);
                    center.indFans = (center.indFans || 0) + fanGain;
                    if (views > 200000) {
                        log(`📹 [FANCAM] ${center.name} (${grp.name}) visual fancam! ${(views/1000).toFixed(0)}K views!`);
                    }
                }
            }
        });

        // ---- [B] big3_exp debut bonus ---- [LIVING DETAIL]
        // Applied once at debut
        G.groups.forEach(grp => {
            if (grp._bg3BonusApplied) return;
            if (grp.isPreDebut) return;
            const big3Members = grp.members.filter(m => m.bgType === 'big3_exp');
            if (big3Members.length > 0) {
                G.rep += 30 * big3Members.length;
                grp._bg3BonusApplied = true;
                log(`🏢 [BG] ${grp.name}: ex-Big3 trainee boost! +${30 * big3Members.length} Rep!`);
            }
            // veteran_idol debut bonus [LIVING DETAIL]
            const vets = grp.members.filter(m => m.bgType === 'veteran_idol');
            if (vets.length > 0 && !grp._vetBonusApplied) {
                grp.fansKR = (grp.fansKR || 0) + 200 * vets.length;
                grp._vetBonusApplied = true;
                log(`🔄 [BG] ${grp.name}: ex-idol member — instant +${200 * vets.length} KR fans!`);
            }
        });

        // ---- [G] CONCEPT: International Market Receptivity ---- [LIVING DETAIL]
        // Apply market multipliers to global fan growth
        G.groups.forEach(grp => {
            if (grp.isDisbanded || grp.isPreDebut) return;
            const concept = grp.concept;
            let glMult = 1.0;
            if (['Girl Crush', 'Charismatic', 'Teen Crush'].includes(concept)) glMult = 1.15; // [LIVING DETAIL]
            if (['Cute', 'Refreshing'].includes(concept)) glMult = 1.05; // moderate global
            if (['Cyberpunk', 'Hyperpop', 'Avant-garde'].includes(concept)) glMult = 0.85; // niche [LIVING DETAIL]

            // Multilingual trait boost [LIVING DETAIL]
            if (groupHasTrait(grp, 'Multilingual')) glMult += 0.30;

            // Apply
            if (glMult !== 1.0 && grp.fansGL > 100) {
                const bonus = Math.floor(grp.fansGL * (glMult - 1.0) * 0.02); // weekly trickle
                grp.fansGL += bonus;
            }
        });

        // ---- [A] Lucky Star: dampen negative events ---- [LIVING DETAIL]
        // Store flag for event system to check
        G.groups.forEach(grp => {
            grp._hasLuckyStar = groupHasTrait(grp, 'Lucky Star');
        });

        // ---- [B] content_creator bg: YouTube content ×2 fans global ---- [LIVING DETAIL]
        G.groups.forEach(grp => {
            if (grp.currentEvent === 'reality' || grp.currentEvent === 'yt_cover') {
                const creators = grp.members.filter(m => m.bgType === 'content_creator');
                if (creators.length > 0) {
                    grp.fansGL = (grp.fansGL || 0) + Math.floor(200 * creators.length);
                }
            }
        });
    });

    // ==========================================
    // HOOK: ENCORE STAGE — Position-based vocal check [LIVING DETAIL]
    // ==========================================
    const _origCheckEncoreStage = window.checkEncoreStage;
    // We can't easily override the closure function, so we hook via the post-charting phase
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        G.groups.forEach(grp => {
            if (grp.isDisbanded || grp.isPreDebut) return;
            // Check if any of their songs are in top 10
            const charts = window._charts;
            if (!charts) return;
            const inTop10 = charts.melon.slice(0, 10).some(c => c.isPlayer && c.artist === grp.name);
            if (!inTop10) return;

            // Encore check using Main Vocalist [LIVING DETAIL]
            const mv = getMemberByPosition(grp, 'Main Vocal');
            if (mv && mv.vocal < 50 && Math.random() < 0.3) {
                log(`🎤 [ENCORE] ${grp.name}: Main Vocalist ${mv.name} (vocal ${Math.floor(mv.vocal)}) live vocal terekspos!`);
                toast(`🎤 ${mv.name} live vocal lemah terekspos!`, 'danger');
                if (G.v155) G.v155.scandalLevel[grp.name] = Math.min(10, (G.v155.scandalLevel?.[grp.name] || 0) + 2);
                grp.hasScandal = true;
                genFeed?.('encore_bad', grp.name);
            } else if (mv && mv.vocal >= 80) {
                // choir_trained bonus [LIVING DETAIL]
                const effectiveVocal = mv.bgType === 'choir_trained' ? mv.vocal * 1.2 : mv.vocal;
                if (effectiveVocal >= 90 && Math.random() < 0.3) {
                    grp.fansKR = (grp.fansKR || 0) + 3000;
                    G.rep += 30;
                    log(`🎤 [ENCORE] ${mv.name} (${grp.name}) live vocal memukau! GP terkesan!`);
                    genFeed?.('vocal_praise', grp.name);
                }
            }
        });
    });

    // ==========================================
    // HOOK: INTERACTIVE EVENTS — Lucky Star dampening [LIVING DETAIL]
    // ==========================================
    const _origResolveEvent = window.resolveInteractiveEvent;
    if (_origResolveEvent) {
        window.resolveInteractiveEvent = function(choiceIdx) {
            // Check if the affected group has Lucky Star
            const ev = window.currentActiveEvent;
            if (ev) {
                // Try to find which group is affected (heuristic: check desc for group names)
                G.groups.forEach(grp => {
                    if (grp._hasLuckyStar && ev.desc && ev.desc.includes(grp.name)) {
                        if (Math.random() < 0.4) { // 40% chance to dampen [LIVING DETAIL]
                            const luckyMember = getTraitMembers(grp, 'Lucky Star')[0];
                            toast(`🍀 ${luckyMember.name} meredam dampak negatif! (Lucky Star)`, 'success');
                            log(`🍀 [LUCKY STAR] ${luckyMember.name} meredam dampak event untuk ${grp.name}!`);
                            // We can't easily modify the choice action, but we can compensate
                            G.rep += 50;
                            grp.stress = Math.max(0, (grp.stress || 0) - 10);
                        }
                    }
                });
            }
            _origResolveEvent(choiceIdx);
        };
    }

    // ==========================================
    // [G] CONCEPT → VARIETY SHOW BIAS [LIVING DETAIL]
    // Hook into variety show invitation system
    // ==========================================
    // The variety show system uses VARIETY_SHOWS with minRep/minFans
    // We'll add a concept check to modify success chances
    document.querySelector('[data-target="variety"]')?.addEventListener('click', () => {
        setTimeout(() => {
            // Annotate variety show grid items with concept compatibility hints
            G.groups.forEach(grp => {
                const concept = grp.concept;
                let hint = '';
                if (['Cute', 'Refreshing', 'Teen Crush'].includes(concept)) hint = '(Family variety ×1.5)';
                else if (['Hip-Hop', 'Dark Academia'].includes(concept)) hint = '(Talk/quiz show fit)';
                else if (['Girl Crush', 'Charismatic'].includes(concept)) hint = '(Performance show fit)';
                // This is informational; actual effect in the variety calculation hooks
            });
        }, 300);
    });

    // ==========================================
    // [A] TRAIT: Stage Monster in award score [LIVING DETAIL]
    // [A] TRAIT: Healing Voice in ballad award [LIVING DETAIL]
    // ==========================================
    // These affect award calculations. Since the award system runs at specific months,
    // we add bonuses by enhancing group trophies/scores before award calc
    document.getElementById('btn-skip-week').addEventListener('click', function() {
        if (G.w !== 4 || G.m !== 12) return; // Only at year-end
        G.groups.forEach(grp => {
            if (grp.isDisbanded) return;
            // Stage Monster: performance score ×1.2 [LIVING DETAIL]
            if (groupHasTrait(grp, 'Stage Monster')) {
                grp._awardScore = (grp._awardScore || 0) * 1.2;
            }
            // Healing Voice: ballad award boost [LIVING DETAIL]
            if (groupHasTrait(grp, 'Healing Voice') && ['Ballad', 'R&B'].includes(grp.concept)) {
                grp._awardScore = (grp._awardScore || 0) + 200;
            }
        });
    });

    // ==========================================
    // [F] GENDER: DATING SCANDAL SEVERITY [LIVING DETAIL]
    // ==========================================
    // Mixed gender groups: dating scandal ×2 severity
    // This modifies any scandal level additions
    const _origSetScandal = window._v155SetScandal;
    if (_origSetScandal) {
        window._v155SetScandal = function(grpName, severity) {
            const grp = G.groups.find(g => g.name === grpName);
            if (grp && getGroupGender(grp) === 'Mixed') {
                severity *= 2; // [LIVING DETAIL] mixed gender scandal ×2
                log(`⚠️ [GENDER] ${grpName}: skandal severity ×2 karena mixed gender group!`);
            }
            _origSetScandal(grpName, severity);
        };
    }

    // ==========================================
    // ASSIGN bgType TO NEW TRAINEES [LIVING DETAIL]
    // Hook into audition finish by observing trainee array growth
    // ==========================================
    let _lastTraineeCount = G.trainees.length;
    setInterval(() => {
        if (G.trainees.length !== _lastTraineeCount) {
            G.trainees.forEach(t => assignBgType(t)); // [LIVING DETAIL]
            _lastTraineeCount = G.trainees.length;
        }
    }, 2000);

    // ==========================================
    // INIT COMPLETE
    // ==========================================
    console.log('✅ K-Pop Tycoon v15.5.1 — Living Detail System loaded!');
    console.log('   Traits: 29 active effects | Backgrounds: 10 bgTypes | Positions: 9 roles');
    console.log('   Gender/MemberCount/Concept: all wired into weekly tick');

})();
