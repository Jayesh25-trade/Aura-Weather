    lucide.createIcons();

    /* =========================
       DIRECT API KEYS (from your code)
       ========================= */
    const OPENWEATHER_API_KEY = "20fa1719b4021409b5c9147b32e70840";
    const PEXELS_API_KEY      = "jM8TL4DUTs1TW69Z22UYEMPZtlrIjGoatADCx1LUQXkSR6GXXdM8TBPc";
    const UNSPLASH_ACCESS_KEY = "Bl1lOvFGB5YdqFIbaCotFn6z3Gc_HWHOXux-MNTHQdo";

    /* =========================
       DOM REFERENCES
       ========================= */
    const el = {
      bgVideo: document.getElementById('bgVideo'),
      bgImage: document.getElementById('bgImage'),
      bgOverlay: document.getElementById('bgOverlay'),
      particles: document.getElementById('particles'),
      fx: document.getElementById('fx'),
      loading: document.getElementById('loadingOverlay'),
      loadingText: document.getElementById('loadingText'),
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      unitBtn: document.getElementById('unitBtn'),
      clockBtn: document.getElementById('clockBtn'),
      locationText: document.getElementById('locationText'),
      temperature: document.getElementById('temperature'),
      condition: document.getElementById('condition'),
      description: document.getElementById('description'),
      feelsLike: document.getElementById('feelsLike'),
      windSpeed: document.getElementById('windSpeed'),
      humidity: document.getElementById('humidity'),
      visibility: document.getElementById('visibility'),
      pressure: document.getElementById('pressure'),
      sunrise: document.getElementById('sunrise'),
      sunset: document.getElementById('sunset'),
      weatherIcon: document.getElementById('weatherIcon'),
      hourly: document.getElementById('hourlyForecast'),
      daily: document.getElementById('dailyForecast'),
      attribution: document.getElementById('attribution'),
      mainCard: document.getElementById('mainCard'),
      recentWrap: document.getElementById('recentWrap'),
      recentChips: document.getElementById('recentChips'),
      aqiPill: document.getElementById('aqiPill'),
      aqDetails: document.getElementById('aqDetails'),
      aqList: document.getElementById('aqList'),
      uvIndex: document.getElementById('uvIndex')
    };

    /* =========================
       STATE
       ========================= */
    let unit = localStorage.getItem('weatherUnit') || 'metric';
    let is24h = JSON.parse(localStorage.getItem('clock24') ?? 'true');
    let lastMediaByCity = new Map();
    let currentLoc = null;

    function setLoading(msg='Loading…'){ el.loadingText.textContent = msg; el.loading.classList.remove('hidden'); }
    function clearLoading(){ el.loading.classList.add('hidden'); }
    function updateUnitBtn(){ el.unitBtn.textContent = unit==='metric'?'°C':'°F'; }
    function updateClockBtn(){ el.clockBtn.textContent = is24h ? '24h' : '12h'; }
    function toTitle(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : ''; }

    /* =========================
       HELPERS
       ========================= */
    function formatTime(ts, tzOffset){
      const d = new Date((ts + tzOffset) * 1000);
      let h = d.getUTCHours();
      const mm = d.getUTCMinutes().toString().padStart(2,'0');
      if (is24h) return `${h.toString().padStart(2,'0')}:${mm}`;
      const ampm = h>=12?'PM':'AM';
      h = h%12 || 12;
      return `${h}:${mm} ${ampm}`;
    }
    function getDaypartFromLocalClock(cityCurrentDt, tzOffset){
      const d = new Date((cityCurrentDt + tzOffset) * 1000);
      const h = d.getUTCHours();
      if (h>=5 && h<11) return 'morning';
      if (h>=11 && h<16) return 'afternoon';
      if (h>=16 && h<20) return 'evening';
      return 'night';
    }
    function effectFor(main, wind=0){
      const m = (main||'').toLowerCase();
      if (m.includes('snow')) return 'snow';
      if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return 'rain';
      return '';
    }
    function iconFor(main){
      const m = (main||'').toLowerCase();
      if (m.includes('cloud')) return '<i data-lucide="cloud" class="w-16 h-16 text-gray-300"></i>';
      if (m.includes('rain')) return '<i data-lucide="cloud-rain" class="w-16 h-16 text-blue-400"></i>';
      if (m.includes('snow')) return '<i data-lucide="snowflake" class="w-16 h-16 text-white"></i>';
      if (m.includes('thunder')) return '<i data-lucide="zap" class="w-16 h-16 text-yellow-400"></i>';
      return '<i data-lucide="sun" class="w-16 h-16 text-yellow-400"></i>';
    }
    function normKey(s=''){ return s.toLowerCase().replace(/[^a-z0-9]/g,''); }
    function daypartKeyword(dp){
      if (dp==='morning') return 'morning sunrise';
      if (dp==='afternoon') return 'afternoon daylight';
      if (dp==='evening') return 'evening sunset golden hour';
      return 'night city lights';
    }
    function condKeyword(cond){
      const c=(cond||'').toLowerCase();
      if (c.includes('snow')) return 'snow';
      if (c.includes('rain')||c.includes('drizzle')) return 'rain';
      if (c.includes('cloud')) return 'cloudy';
      if (c.includes('thunder')) return 'storm';
      return 'clear sky';
    }

    /* =========================
       LANDMARKS (trimmed for brevity — same as your list)
       ========================= */
    const LANDMARKS = {
      mumbai: ["Gateway of India", "Marine Drive", "Bandra-Worli Sea Link", "Chhatrapati Shivaji Terminus"],
      delhi: ["India Gate", "Qutub Minar", "Lotus Temple", "Red Fort"],
      paris: ["Eiffel Tower", "Louvre", "Seine", "Notre Dame", "Arc de Triomphe"],
      london: ["Tower Bridge", "Big Ben", "London Eye", "Thames", "Westminster"],
      newyork: ["Times Square", "Brooklyn Bridge", "Central Park", "Statue of Liberty"],
      tokyo: ["Shibuya Crossing", "Tokyo Tower", "Skytree"],
      dubai: ["Burj Khalifa", "Dubai Marina", "Palm Jumeirah", "Burj Al Arab"],
      sydney: ["Opera House", "Harbour Bridge", "Circular Quay", "Bondi Beach"],
      rome: ["Colosseum", "Trevi Fountain", "Vatican", "Pantheon"],
      singapore: ["Marina Bay Sands", "Gardens by the Bay", "Merlion"],
      bangkok: ["Wat Arun", "Grand Palace", "Chao Phraya"],
      istanbul: ["Hagia Sophia", "Blue Mosque", "Bosphorus", "Galata Tower"],
      barcelona: ["Sagrada Familia", "Park Guell", "Gothic Quarter", "Las Ramblas"],
      amsterdam: ["Canals", "Rijksmuseum", "Vondelpark", "Damrak"],
      cairo: ["Pyramids", "Sphinx", "Nile"],
      capetown: ["Table Mountain", "Waterfront", "Robben Island", "Cape Point"],
      rio: ["Christ the Redeemer", "Copacabana", "Sugarloaf", "Ipanema"],
      losangeles: ["Hollywood Sign", "Santa Monica Pier", "Griffith Observatory", "Venice Beach"],
      sanfrancisco: ["Golden Gate Bridge", "Alcatraz", "Lombard Street", "Embarcadero"],
      chicago: ["Millennium Park", "Navy Pier", "Willis Tower", "Lake Michigan"],
      miami: ["South Beach", "Art Deco", "Biscayne Bay", "Wynwood"]
      /* (Indian states list omitted here for space; you can paste your full list back if you want) */
    };

    /* =========================
       WEATHER FETCH
       ========================= */
    async function geocodeCity(q){
      const url=`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const r=await fetch(url); const j=await r.json();
      if(!Array.isArray(j)||!j.length) throw new Error('City not found');
      return j[0];
    }

    async function reverseGeocode(lat,lon){
      const url=`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OPENWEATHER_API_KEY}`;
      const r=await fetch(url); const j=await r.json();
      return j?.[0] || {name:'Your Location', country:''};
    }

    async function fetchWeather(lat,lon){
      // Try One Call 2.5 (legacy) first
      const url25=`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${unit}&appid=${OPENWEATHER_API_KEY}`;
      let r=await fetch(url25);
      if(r.ok) return r.json();

      // Fallback: current + forecast (3h steps)
      const cur=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${OPENWEATHER_API_KEY}`;
      const fc=`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${OPENWEATHER_API_KEY}`;
      const [rc,rf]=await Promise.all([fetch(cur),fetch(fc)]);
      const current=await rc.json(); const forecast=await rf.json();

      const tz = typeof forecast?.city?.timezone === 'number' ? forecast.city.timezone : 0;
      const hourly = (forecast.list||[]).slice(0,12).map(it=>({dt:it.dt,temp:it.main?.temp,weather:it.weather,pop:it.pop??0}));
      const dayMap={};
      (forecast.list||[]).forEach(it=>{
        const d = new Date((it.dt+tz)*1000);
        const key = d.getUTCFullYear()+"-"+(d.getUTCMonth()+1)+"-"+d.getUTCDate();
        if(!dayMap[key]) dayMap[key]={min:+Infinity,max:-Infinity,item:it,pop:0,count:0};
        dayMap[key].min=Math.min(dayMap[key].min,it.main.temp_min);
        dayMap[key].max=Math.max(dayMap[key].max,it.main.temp_max);
        dayMap[key].pop+= (it.pop??0); dayMap[key].count++;
      });
      const daily = Object.values(dayMap).slice(0,7).map(({min,max,item,pop,count})=>({dt:item.dt,temp:{min,max},weather:item.weather,pop:(pop/(count||1))}));

      return {
        timezone_offset: tz,
        current:{
          dt: current.dt,
          temp: current.main?.temp,
          feels_like: current.main?.feels_like,
          humidity: current.main?.humidity,
          pressure: current.main?.pressure,
          visibility: (current.visibility??10000)/1000,
          wind_speed: current.wind?.speed,
          sunrise: current.sys?.sunrise,
          sunset: current.sys?.sunset,
          uvi: current.uvi, // may be undefined in this mode
          weather: current.weather
        },
        hourly, daily
      };
    }

    async function fetchAir(lat,lon){
      const url=`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
      const r=await fetch(url); if(!r.ok) return null;
      const j=await r.json();
      return j?.list?.[0] || null;
    }

    /* =========================
       PEXELS / UNSPLASH MEDIA
       ========================= */
    function buildQueries(city,country,dp,cond){
      const key=normKey(city);
      const lms = LANDMARKS[key] || [];
      const dpK = daypartKeyword(dp);
      const cK  = condKeyword(cond);
      const combos = [
        `${city} ${lms[0]||''} ${dpK} ${cK}`,
        `${city} skyline ${dpK}`,
        `${city} cityscape ${dpK}`,
        `${city} ${cK} ${dpK}`,
        `${country||''} ${city} ${dpK}`,
        `${lms[1]||''} ${dpK}`,
        `${lms[2]||''} ${dpK}`,
        `${city} timelapse ${dpK}`,
        `${city} aerial ${dpK}`,
        `${city}`
      ].map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean);
      return [...new Set(combos)];
    }
    function scorePexels(city,country,landmarks,dp,cond,video){
      const url=(video.url||'').toLowerCase();
      let s=0;
      const w=video.width||0, dur=video.duration||0;
      if(w>=3840) s+=6; else if(w>=1920) s+=4; else if(w>=1280) s+=2;
      if(dur>=10 && dur<=45) s+=4; else if(dur>=6 && dur<=65) s+=2;
      const cK = normKey(city), countryK = normKey(country||'');
      if(cK && url.includes(cK)) s+=8;
      if(countryK && url.includes(countryK)) s+=2;
      (landmarks||[]).forEach(lm=>{ const k=normKey(lm); if(k && url.includes(k)) s+=6; });
      daypartKeyword(dp).split(' ').forEach(k=>{ if(k && url.includes(k)) s+=1; });
      condKeyword(cond).split(' ').forEach(k=>{ if(k && url.includes(k)) s+=1; });
      return s;
    }
    function pickBestFile(video){
      const arr=(video.video_files||[]).filter(f=>f.link && (f.quality==='hd' || (f.width||0)>=1280));
      if(!arr.length) return null;
      return arr.sort((a,b)=>(b.width||0)-(a.width||0))[0];
    }
    async function pexelsSearch(q,page=1){
      const url=`https://api.pexels.com/videos/search?query=${encodeURIComponent(q)}&per_page=15&page=${page}&orientation=landscape`;
      const res=await fetch(url,{headers:{Authorization:PEXELS_API_KEY}});
      if(!res.ok) return null;
      return res.json();
    }
    async function findBestVideo(city,country,dp,cond){
      const queries=buildQueries(city,country,dp,cond);
      const landmarks = LANDMARKS[normKey(city)] || [];
      let best=null, bestScore=-Infinity;
      for(const q of queries){
        for(let page=1; page<=2; page++){
          const data=await pexelsSearch(q,page);
          if(!data) continue;
          (data.videos||[]).filter(v=>(v.width||0)>=1280 && (v.duration||0)>=6).forEach(v=>{
            const score=scorePexels(city,country,landmarks,dp,cond,v);
            if(score>bestScore){
              const file=pickBestFile(v);
              if(file){ best={src:file.link, poster:v.image, url:v.url}; bestScore=score; }
            }
          });
          if(bestScore>=10) break;
        }
        if(bestScore>=10) break;
      }
      return best ? { src:best.src, poster:best.poster, credit:`Video: <a class="underline" href="${best.url}" target="_blank" rel="noreferrer">Pexels</a>` } : null;
    }
    async function findFallbackImage(city,dp){
      const q=`${city} ${dp}`;
      const url=`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;
      const r=await fetch(url); if(!r.ok) return null;
      const j=await r.json();
      const img=j.results && j.results[0];
      if(!img) return null;
      const src = img.urls.regular || img.urls.full || img.urls.raw;
      const author = img.user?.name || 'Unsplash';
      const link = img.links?.html || 'https://unsplash.com';
      return { src, credit:`Photo by <a class="underline" href="${link}" target="_blank" rel="noreferrer">${author}</a> on <a class="underline" href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>` };
    }
    async function setBackground(city,country,dp,cond){
      const cacheKey = `${city}|${dp}|${cond}|${unit}`;
      if(lastMediaByCity.has(cacheKey)){ applyMedia(lastMediaByCity.get(cacheKey)); return; }
      let media = await findBestVideo(city,country,dp,cond);
      if(!media) media = await findFallbackImage(city,dp);
      if(!media){ el.attribution.textContent = 'No background media found'; return; }
      lastMediaByCity.set(cacheKey, media);
      applyMedia(media);
    }
    function applyMedia(media){
      el.attribution.innerHTML = media.credit || '';
      if((media.src.endsWith('.mp4') || media.type==='video') && el.bgVideo){
        el.bgImage.classList.remove('active');
        el.bgVideo.src = media.src;
        if(media.poster) el.bgVideo.poster = media.poster;
        el.bgVideo.load();
        el.bgVideo.play().catch(()=>{});
        requestAnimationFrame(()=> el.bgVideo.classList.add('active'));
      }else{
        el.bgVideo.classList.remove('active');
        el.bgImage.onload = ()=> el.bgImage.classList.add('active');
        el.bgImage.src = media.src;
      }
    }

    /* =========================
       RENDER WEATHER
       ========================= */
    function renderAQI(aqi){
      // 1 Good, 2 Fair, 3 Moderate, 4 Poor, 5 Very Poor
      const map = {1:['Good','#22c55e'],2:['Fair','#84cc16'],3:['Moderate','#eab308'],4:['Poor','#f59e0b'],5:['Very Poor','#ef4444']};
      return map[aqi] || ['—','#888'];
    }

    function renderWeather(data, loc, airData){
      const cur = data.current || {};
      const w = (cur.weather && cur.weather[0]) || {main:'',description:''};
      const tz = data.timezone_offset || 0;
      const unitSymbol = unit==='metric' ? '°C' : '°F';
      const wind = unit==='metric' ? Math.round((cur.wind_speed||0)*3.6)+' km/h' : Math.round((cur.wind_speed||0)*2.23694)+' mph';

      el.locationText.textContent = `${loc.name}, ${loc.country || ''}`.trim();
      el.temperature.textContent = `${Math.round(cur.temp||0)}°`;
      el.condition.textContent = w.main || '';
      el.description.textContent = toTitle(w.description||'');
      el.feelsLike.textContent = `Feels like ${Math.round(cur.feels_like||0)}${unitSymbol}`;
      el.windSpeed.textContent = wind;
      el.humidity.textContent = `${cur.humidity ?? '--'}%`;
      el.visibility.textContent = `${Math.round((cur.visibility ?? 10))} km`;
      el.pressure.textContent = `${cur.pressure ?? '--'} hPa`;
      el.sunrise.textContent = cur.sunrise ? formatTime(cur.sunrise, tz) : '--:--';
      el.sunset.textContent  = cur.sunset  ? formatTime(cur.sunset, tz)  : '--:--';
      el.weatherIcon.innerHTML = iconFor(w.main||'');
      lucide.createIcons();

      // UV (if present)
      if (typeof cur.uvi === 'number'){
        el.uvIndex.textContent = `UV ${Math.round(cur.uvi)}`;
        el.uvIndex.classList.remove('hidden');
      } else {
        el.uvIndex.classList.add('hidden');
      }

      // Air quality
      if (airData){
        const [label,color]=renderAQI(airData.main?.aqi);
        el.aqiPill.textContent = `AQI ${label}`;
        el.aqiPill.style.backgroundColor = 'rgba(255,255,255,.10)';
        el.aqiPill.style.border = '1px solid rgba(255,255,255,.15)';
        el.aqiPill.style.boxShadow = `0 0 0 9999px transparent`;
        el.aqiPill.style.color = '#fff';
        el.aqiPill.style.textShadow = '0 0 12px rgba(0,0,0,.35)';
        el.aqiPill.classList.remove('hidden');

        // breakdown
        const c = airData.components || {};
        el.aqList.innerHTML = '';
        const items = [
          ['PM2.5', c.pm2_5],
          ['PM10', c.pm10],
          ['O₃', c.o3],
          ['NO₂', c.no2],
          ['SO₂', c.so2],
          ['CO', c.co]
        ];
        items.forEach(([k,v])=>{
          const d=document.createElement('div');
          d.className='glass-card p-3 rounded-lg text-center';
          d.innerHTML = `<div class="text-white/60 text-xs mb-1">${k}</div><div class="text-lg font-semibold">${v ? Math.round(v) : '—'} µg/m³</div>`;
          el.aqList.appendChild(d);
        });
        el.aqDetails.classList.remove('hidden');
      } else {
        el.aqiPill.classList.add('hidden');
        el.aqDetails.classList.add('hidden');
      }

      el.fx.className = `effect ${effectFor(w.main||'', cur.wind_speed||0)}`;

      // hourly
      el.hourly.innerHTML = '';
      (data.hourly||[]).slice(0,12).forEach(h=>{
        const t = formatTime(h.dt, tz);
        const wh = (h.weather && h.weather[0]) || {};
        const pop = Math.round((h.pop ?? 0)*100);
        const card = document.createElement('div');
        card.className = 'min-w-[130px] glass-card p-4 rounded-xl text-center';
        card.innerHTML = `
          <p class="text-white/70 text-sm mb-2">${t}</p>
          <div class="flex justify-center mb-2">${iconFor(wh.main||'').replace('w-16 h-16','w-8 h-8')}</div>
          <p class="text-xl font-semibold">${Math.round(h.temp)}°</p>
          <p class="text-white/60 text-xs mt-1 flex items-center justify-center gap-1"><i data-lucide="umbrella" class="w-3 h-3"></i>${pop}%</p>
        `;
        el.hourly.appendChild(card);
        lucide.createIcons();
      });

      // daily
      el.daily.innerHTML = '';
      (data.daily||[]).slice(0,7).forEach((d,i)=>{
        const date = new Date((d.dt + tz)*1000);
        const day  = i===0 ? 'Today' : date.toLocaleDateString(undefined,{weekday:'short'});
        const wd   = (d.weather && d.weather[0]) || {};
        const pop  = Math.round((d.pop ?? 0)*100);
        const row  = document.createElement('div');
        row.className = 'glass-card p-4 rounded-xl flex items-center justify-between';
        row.innerHTML = `
          <div class="flex items-center gap-4">
            <span class="min-w-[80px] font-medium">${day}</span>
            <span class="flex items-center">${iconFor(wd.main||'').replace('w-16 h-16','w-6 h-6')}</span>
            <span class="text-white/70 text-sm">${toTitle(wd.main||'')}</span>
            <span class="text-white/60 text-xs flex items-center gap-1 ml-2"><i data-lucide="umbrella" class="w-3 h-3"></i>${pop}%</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-white/60">${Math.round(d.temp.min)}°</span>
            <span class="font-semibold">${Math.round(d.temp.max)}°</span>
          </div>
        `;
        el.daily.appendChild(row);
        lucide.createIcons();
      });

      const dp = getDaypartFromLocalClock(cur.dt || Math.floor(Date.now()/1000), tz);
      return { daypart: dp, condition: (w.main||'').toLowerCase() };
    }

    /* =========================
       RECENT SEARCHES
       ========================= */
    function saveRecent(city){
      const key='recentCities';
      let arr=JSON.parse(localStorage.getItem(key) || '[]');
      city = city.trim();
      arr = [city, ...arr.filter(c=>c.toLowerCase()!==city.toLowerCase())].slice(0,8);
      localStorage.setItem(key, JSON.stringify(arr));
      renderRecent();
    }
    function renderRecent(){
      const arr=JSON.parse(localStorage.getItem('recentCities') || '[]');
      el.recentChips.innerHTML='';
      if (!arr.length){ el.recentWrap.style.display='none'; return; }
      el.recentWrap.style.display='';
      arr.forEach(c=>{
        const b=document.createElement('button');
        b.className='chip'; b.textContent=c;
        b.addEventListener('click', ()=> searchCity(c));
        el.recentChips.appendChild(b);
      });
    }

    /* =========================
       SEARCH FLOW
       ========================= */
    async function searchCity(q){
      try{
        setLoading('Finding location…');
        const loc = await geocodeCity(q);
        currentLoc = loc;

        setLoading('Fetching weather…');
        const [weather, air] = await Promise.all([
          fetchWeather(loc.lat, loc.lon),
          fetchAir(loc.lat, loc.lon)
        ]);

        const { daypart, condition } = renderWeather(weather, loc, air);

        setLoading('Loading background…');
        await setBackground(loc.name, loc.country, daypart, condition);

        saveRecent(loc.name);
        clearLoading();
      }catch(err){
        console.error(err);
        clearLoading();
        el.locationText.textContent = 'Error loading weather';
        el.condition.textContent = 'Please try again';
        el.description.textContent = err.message || 'Unknown error';
        el.attribution.textContent = '';
      }
    }

    /* =========================
       PARALLAX (scroll + mouse)
       ========================= */
    function makeParticles(){
      const count = 30;
      for(let i=0;i<count;i++){
        const p = document.createElement('div');
        p.className='particle';
        p.style.left = Math.random()*100+'%';
        p.style.top  = Math.random()*100+'%';
        p.style.width = p.style.height = (6+Math.random()*12) + 'px';
        p.style.opacity = 0.35 + Math.random()*0.3;
        p.style.animationDelay = (Math.random()*8)+'s';
        el.particles.appendChild(p);
      }
    }
    makeParticles();

    function parallaxScroll(){
      const y = window.scrollY || 0;
      // Background moves slower for depth
      const translate = y * -0.06;
      const overlayT = y * -0.03;
      el.bgVideo.style.transform = `translateY(${translate}px) scale(1.03)`;
      el.bgImage.style.transform = `translateY(${translate}px) scale(1.03)`;
      el.bgOverlay.style.transform = `translateY(${overlayT}px)`;

      // Foreground cards subtle lift
      document.querySelectorAll('[data-depth]').forEach(node=>{
        const depth = parseFloat(node.getAttribute('data-depth') || 0);
        node.style.transform = `translateY(${y*depth}px)`;
      });
    }
    window.addEventListener('scroll', parallaxScroll, {passive:true});

    // Mouse parallax for main card cluster
    const mouseParallaxTargets = [el.mainCard, document.querySelector('[data-depth="0.08"]'), document.querySelector('[data-depth="0.05"]')].filter(Boolean);
    window.addEventListener('mousemove', (e)=>{
      const cx = window.innerWidth/2, cy = window.innerHeight/2;
      const dx = (e.clientX - cx)/cx;
      const dy = (e.clientY - cy)/cy;
      el.bgVideo.style.transform = `translate(${dx*-10}px, ${dy*-10}px) scale(1.03)`;
      el.bgImage.style.transform = `translate(${dx*-10}px, ${dy*-10}px) scale(1.03)`;
      mouseParallaxTargets.forEach((n,i)=>{
        const factor = (i+1)*3;
        n.style.transform = `translate(${dx*factor}px, ${dy*factor}px)`;
      });
    });

    /* =========================
       EVENTS
       ========================= */
    el.searchBtn.addEventListener('click', ()=>{
      const q = el.searchInput.value.trim();
      if(q) searchCity(q);
    });
    el.searchInput.addEventListener('keydown',(e)=>{
      if(e.key==='Enter'){ el.searchBtn.click(); }
    });
    el.unitBtn.addEventListener('click', ()=>{
      unit = unit==='metric' ? 'imperial' : 'metric';
      localStorage.setItem('weatherUnit', unit);
      updateUnitBtn();
      const currentCity = (el.locationText.textContent.split(',')[0] || '').trim();
      if (currentCity) searchCity(currentCity);
    });
    el.clockBtn.addEventListener('click', ()=>{
      is24h = !is24h;
      localStorage.setItem('clock24', JSON.stringify(is24h));
      updateClockBtn();
      if (currentLoc) searchCity(currentLoc.name);
    });

    /* =========================
       3D TILT HANDLER (unchanged)
       ========================= */
    (function enableTilt(){
      const card = el.mainCard;
      if (!card) return;

      let frame = null;
      let current = { rx: 0, ry: 0 };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function onMove(e){
        if (reduceMotion) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const ry = ((x - cx) / cx) * 10;
        const rx = (-(y - cy) / cy) * 6;

        current = { rx, ry };
        if (!frame){
          frame = requestAnimationFrame(()=>{
            card.style.transform = `perspective(1200px) rotateX(${current.rx}deg) rotateY(${current.ry}deg) scale(1.02)`;
            frame = null;
          });
        }
      }
      function onLeave(){
        if (reduceMotion) return;
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      card.addEventListener('mouseenter', ()=>{
        if (reduceMotion) return;
        card.style.transition = 'transform 200ms ease';
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1.01)';
        setTimeout(()=>{ card.style.transition = 'transform 250ms ease'; }, 200);
      });
    })();

    /* =========================
       INIT
       ========================= */
    async function initWithGeo(){
      if (!navigator.geolocation) return false;
      try{
        setLoading('Getting your location…');
        const pos = await new Promise((res,rej)=>{
          navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:true, timeout:7000, maximumAge:60000});
        });
        const {latitude:lat, longitude:lon} = pos.coords;
        const loc = await reverseGeocode(lat,lon);
        el.searchInput.value = loc.name || 'Mumbai';
        await searchCity(loc.name || 'Mumbai');
        return true;
      }catch(_e){
        return false;
      }
    }

    document.addEventListener('DOMContentLoaded', async ()=>{
      updateUnitBtn();
      updateClockBtn();
      renderRecent();

      const usedGeo = await initWithGeo();
      if (!usedGeo){
        el.searchInput.value = 'Mumbai';
        searchCity('Mumbai');
      }
    });
