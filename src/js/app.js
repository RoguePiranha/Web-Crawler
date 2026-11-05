window.addEventListener('DOMContentLoaded', async event => {
  let dt_temp = localStorage.getItem("anthem_dt");
  let dt = dt_temp ? JSON.parse(dt_temp) : {};
  const smart_farm = document.querySelector('.smart-farm');
  const farm_img = document.querySelectorAll('.smart-farm .con .cent img');
  const templateCon = document.querySelectorAll('.temp-container');
  const grass = document.querySelector('.grass');
  const roots = document.querySelector('.roots');
  const light = document.querySelectorAll('.light');
  const sec = document.querySelectorAll('.raw-html');
  const hero = document.querySelector('.fiber-hero');
  const mine = document.querySelector('.mine.bg');
  const headqtr = document.querySelector('.headqtr.bg');
  const wirelessHouse = document.querySelector('.wireless-house');
  let bubbleCon = document.querySelector('.bubblecontainer');
  let digit =  window.innerWidth > 768 ? 16 : 8;
  const nav = document.querySelector('.main-nav');
  const domain = window.location.hostname;
  const infusionsoft_forms = document.querySelectorAll('.infusion-form');
  const referral_link = document.querySelector('.referral_link');
  const accordion = document.querySelectorAll('[data-accordion="accordion"]');
  const parCon = document.querySelectorAll('[data-parallax-container]');
  let mouseX = 0;
  let mouseY = 0;
  const states = ['id', 'idaho', 'nv', 'nevada', 'or', 'oregon', 'mt', 'montana'];
  const agileUrl = 'https://agileisp.com/api/';
  let count = 0;
  const securityHero = document.querySelector('.security-hero');
  const houseFront = document.querySelector('.house-front');
  const garage = document.querySelector('#garage');
  const garageClosed = document.querySelector('#garage-closed');
  const garageOpen = document.querySelector('#garage-open');
  const windows = document.querySelector('.windows');
  const lightsOff = document.querySelector('#lights-off');
  const lightsOn = document.querySelector('#lights-on');
  const thermostat = document.querySelector('#thermostat');
  const locked = document.querySelector('#door-locked');
  const unlocked = document.querySelector('#door-unlocked');
  const lockedOn = document.querySelector('.lock .on');
  const lockedOff = document.querySelector('.lock .off');
  const phoneCont = document.querySelector('.cont');
  const fire = document.querySelectorAll('.fire');
  const smokecloud = document.querySelectorAll('.smokecloud');
  const floodTrigger = document.querySelector('#flood-trigger');
  const fireTrigger = document.querySelector('#fire-trigger');
  const carboonMonTrigger = document.querySelector('#carbonmon-trigger');
  const livingroom = document.querySelector('.livingroom');
  const allText = document.querySelectorAll('.text');
  const move = (elem, num) => elem.style.marginTop = `${(-10 + (window.pageYOffset * num))}%`;
  const ran = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const dis = (elem, prop) => elem.style.display = prop;
  const hasProp = (obj) => Object.entries(obj).length > 0;
  const expired = (exp) => {
    const today = new Date();
    const expDate = new Date(exp);
    return today > expDate;
  }
  const setExpiration = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    return today;
  }
  // HELPER SCRIPTS
  const renderForm = (form,  onTabChange=false) => {
    return new Promise(function (resolve) {
      const values = {};
      const status = form.querySelector(".status");
      var compiledValues = [];
      var current = form.querySelectorAll('.validate');
      multistep();
      function multistep() {
        var tabList = form.querySelectorAll(".tabs");
        for (let tabs of tabList) {
          let tab = tabs.querySelectorAll(".tab");
          let next = form.querySelector('button[name="next"]');
          let next_content = next.innerHTML;
          let prev = form.querySelector('button[name="prev"]');
          let currenttab = 0;
          if (tabs.querySelector('.steps')) showsteps(tab);
          showtab(currenttab);

          function showtab(n) {
            for (let i of tab) i.style.display = 'none';
            tab[n].style.display = "flex";
            if (prev) prev.disabled = n === 0 ? true : false;
            next.innerHTML = n == (tab.length - 1) ? 'Submit' : next_content;
            currenttab = n;
            if (tabs.querySelector('.steps')) fixStepIndicator(n);
          }
      
          const increase = e => {
            e.preventDefault();
            let thistab = validate(current[currenttab]);
            for (let field of thistab) if (field.valid === false)  return false;
            for (let value of thistab) compiledValues.push(value);
            if (onTabChange) onTabChange(thistab);
            if ((currenttab + 1) >= tab.length) {
                resolve(compiledValues);
                return false;
            }
            showtab(currenttab + 1);
          }
      
          const decrease = e => {
            e.preventDefault();
            showtab(currenttab - 1);
          }

          function showsteps(tab) {
            let steps = tabs.querySelector('.steps');
            let width = steps.classList.contains('arrow') ? ` style="width:${100 / tab.length}%;"` : '';
            for (let i = 0; i < tab.length; i++) {
              let props = JSON.parse(tab[i].getAttribute("data-props"));
              steps.insertAdjacentHTML("beforeend", `
                <strong${width} class="step">
                  ${i + 1}${props ? `.${props.name.toUpperCase()}` : ''}
                </strong>
              `);
            }  
          }
      
          function fixStepIndicator(count) {
              let step = form.querySelectorAll('.step');
              for (let i = 0; i < tab.length; i++) step[i].classList.remove('active');
              if (count < tab.length) {
                  if (count > 0 ) step[count - 1].classList.add("finish");
                  step[count].classList.add('active');
              }
          }

          next.addEventListener('click', increase);
          if (!exists.includes(prev)) prev.addEventListener('click', decrease);
        }
      }
      
      function validate(current) { 
        let values = current.querySelectorAll("input, textarea, select"), msg = '', data = [], dup = [];
        for (let field of values) {
          if (field.type === 'radio') {
            let options = [...values].filter(i => i.name === field.name);
            let checked = options.filter(i => i.checked);
            if (checked.length > 0) field = checked[0];
          }
          if (field.type === 'checkbox') {
            if (!field.checked) field.value = '';
          }
          if (field.type === 'select-one') {
            field.placeholder = field.getAttribute('data-placeholder');
          }
          if (!dup.includes(field.name)) data.push({'name': field.name, 'valid': field.validity.valid, 'field': field});
          dup.push(field.name);
        }
        Object.keys(data).forEach(i => {
          if (!data[i].valid) {
            data[i].field.style.border= '1px solid red';
            msg += `<div style="color:red;">${data[i].field.placeholder}: ${data[i].field.validationMessage}</div>`;
          } else {
            data[i].field.style.border= '1px solid green';
          }
        });
        status.innerHTML = msg;
        return Array.from(data).filter(i => i.field.classList.contains('form-input')); // THIS MIGHT RETURN TRUE INSTEAD
      }
    });
  }

  const prompt = (a) => {
    let background = document.querySelector('#popup-background');
    if (a.container) {
      if (a.container === 'popup') {
        var popup = `<div id="popup"><div class="close primary">X</div><div class="content">${a.content}</div></div>`;
        a.content = popup;
      }
    }
    background.style.background = a.background ? a.background : 'rgba(0, 0, 0, 0.8)';
    background.innerHTML = a.content;
    background.classList.remove('hidden');

    if (a.remove) close();
    if (popup) {
      let closeList = background.querySelectorAll('#popup .close');
      for (let i of closeList) i.addEventListener('click', close);
    }

    function close() {
      background.classList.add('hidden');
      background.innerHTML = '';
    }
  }

  const ajax = (api, callback=false) => {
    if (!api.method) api.method = 'GET';
    if (!api.credentials) api.credentials = 'same-origin';
    if (!api.headers) api.headers = new Headers({ 
      'Content-Type': 'application/x-www-form-urlencoded; application/json; charset=utf-8' 
    });
    if (api.report) console.log(api);
    var temp;
    return fetch(api.url, api).then(res => {
      if (res.status === 500) return res.status;
      temp = res.status;
      if (api.report) console.log(res);
      return api.res ? res.text() : res.json();
    }).then(data => {
      data.status = temp;
      return data;
    });
  }
  
  const custP = [
    'thank-you', 'myaccount', 'stage-2', 'security2', 'lp-stage-2', 
    'cancel', 'share-save-link', 'share-save', 'security-thank-you',
    'speed-test',  'faq', 'resources', 'lp-stage-2',
  ];
  
  // AGILE SCRIPTS
  const verifyToken = tok => {
    let api = {
      url: `${agileUrl}auth-token/verify/`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      method: 'POST',
      body: JSON.stringify({token: tok})
    }
    return ajax(api).then(res => {
      if (res === 500) return res;
      return res.token ? true : false;
    });
  }
  const refreshToken = tok => {
    let api = {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      url: `${agileUrl}auth-token/refresh/`,
      method: 'POST',
      body: JSON.stringify({token: tok})
    }
    return ajax(api).then(res => {
      dt.token = res.token
      localStorage.setItem("anthem_dt", JSON.stringify(dt));
      return res;
    });
  }
  const requestNewToken = () => {
    let api = {
      method: 'GET',
      url: `/api/agile/new-token/`,
      credentials: 'same-origin',
      headers: new Headers({'Content-Type': 'application/json', 'Accept': 'application/json'}),
    }
    return ajax(api).then(res => {
      dt.token = res.token
      localStorage.setItem("anthem_dt", JSON.stringify(dt));
      console.log('new token stored');
      return res.token;
    });
  }
  const getToken = async () => {
    let agileToken = dt.token;
    // If token is null request brand new token
    if (exists.includes(agileToken)) return requestNewToken();
    // check if agile token is valid. 
    // Attempt to refresh token if no longer valid
    let verified = await verifyToken(agileToken);
    if (verified === 500) {
      //server is not responding correctly
      console.log('server is not responding correctly');
      return 500;
    }
    if (verified) {
      return agileToken;
    } else {
      // Try to refresh Agile token
      let newToken = await refreshToken(agileToken);
      // If refreshtoken is sucessfull, send new token to server
      // If refreshtoken is not sucessfull, request server for a brand new token
      return newToken.token ? newToken.token : requestNewToken(); 
    }
  }
  const generateContent = (url) => {
    return `
      <div class="head primary" style="padding-bottom:0;">
        <h2>Congratulations!</h2>
        <h4>It looks like you are in one of our fiber networks. You will be redirected to the appropriate information.</h4>
      </div>
      <div class="body flex-center" style="background:#017d87;">
        ${counterContent}
      </div>
      <div class="footer flex-center" style="padding-top:0;">
        <a href="${url}" class="btn secondary">Go Now</a>
      </div>
    `;
  }
  const showForm = async (token) => {
    
    const verifyAddress = await getTemplate('form/verify-address');
    const content = `
      <h3 class="head primary">
        Please provide an address to see what plans and services are available in your area
      </h3>
      <div class="body">${verifyAddress}</div>
    `;
    prompt({ container: 'popup', content: content });
    let close = document.querySelector('#popup .close');
    close.addEventListener('click', () => {
      dt.coverage = 'declined';
      localStorage.setItem("anthem_dt", JSON.stringify(dt));
      checkCoverage();
    });
    await renderForm(document.querySelector('.verify-address')).then( async a => {
      let data = {}
      let values = {}
      for (let i of a) values[i.field.name] = i.field.value;
      let addr = `${values.line1}, ${values.locality}, ${values.region} ${values.postal_code}`;
      data.address = addr;
      data.expiration = setExpiration();

      if (states.includes(values.region.toLowerCase())) {
        
        let api = {
          url: `${agileUrl}fiber-tool/zone_status/?address=${addr}`,
          headers: new Headers({ 
            'Content-Type': 'application/json; charset=utf-8', 
            'Authorization': `JWT ${token}` 
          })
        }
        let status = await ajax(api);
        if (status.result[0].id === -1) status.result = [];
        let tmp = status.result;
        status.result = tmp.filter(i => i['x-vetro'].plan_id !== 1);
        if (status.result.length > 0) {
          let api = {
            url: `${agileUrl}fiber-tool/zone_status/?address=${addr}&project_id=v%3A58`,
            headers: new Headers({ 
              'Content-Type': 'application/json; charset=utf-8', 
              'Authorization': `JWT ${token}` 
            })
          }
          let elkoCheck = await ajax(api);
          // UPDATE SECOND VALUE TO ELKO ONCE ZONES CAN BE FILTERED BY PROJECT ID
          data.coverage = elkoCheck.result.length > 0 ? 'elko' : 'fiber';
        } else {
          data.coverage = 'wireless';
        }
      } else {
        data.coverage = 'no-coverage';
      }
      dt.coverage = data;
      localStorage.setItem("anthem_dt", JSON.stringify(dt));
      switch(data.coverage) {
        case 'elko':
          let url = `https://elko.anthembroadband.com/?`;
          let param = `address=${values.line1}&city=${values.locality}&state=${values.region}&zip=${values.postal_code}`;
          let callback = () => window.location.href = `${url}${param}`;
          prompt({ container: 'popup', content: generateContent(url+param) });
          CounterFunction({callback: callback});
          break;
        case 'fiber':
          let redirect = () => window.location.href = `/fiber`;
          prompt({ container: 'popup', content: generateContent('/fiber') });
          CounterFunction({callback: redirect});
          break;
        case 'no-coverage':
          let noCoverage = `
            <h3 class="head primary">It looks like you are outside of our coverage area.</h3>
            <div class="body">
              <p>You can either continue anyways or submit a request for future coverage.</p>
              <div style="display:flex;justify-content:flex-start;">
                <button class="close btn primary">Continue</button>
                <a href="/request-coverage" class="btn primary">Request Coverage</a>
              </div>
            </div>
          `;
          prompt({ container: 'popup', content: noCoverage });
          break;
        default:
          let wireless = `
            <div class="head primary">
              <h2>Got it!</h2> 
              <h4>It looks like you are within our coverage area.</h4>
            </div>
            <div class="body flex-center" style="background:#017d87;">
                ${counterContent}
              </div>
              <div class="footer flex-center" style="padding-top:0;">
                <button class="close btn cta">Continue Now</button>
              </div>
            </div>
          `;
          prompt({ container: 'popup', content: wireless });
          CounterFunction({callback: () =>  prompt({ remove: true })});
      }
      
      // prompt({ remove: true });
      checkCoverage();
      return;
    });
  }
  const checkCoverage = async () => {
    if (count > 3) return false;
    count++;
    console.log('check coverage', count);
    let prompt = document.querySelector('#add-prompt');

    if (dt.coverage === 'declined') {
      console.log('Coverage Declined');
      if (prompt) prompt.style.display = 'flex';
      return;
    }

    if (!dt.coverage) {
      console.log('Coverage Form Prompt');
      const token = await getToken();
      if (token === 500) {
        dt.coverage = 'declined'
        localStorage.setItem("anthem_dt", JSON.stringify(dt));
        checkCoverage();
        return;
      }
      await showForm(token);
      checkCoverage();
      return;
    }
    // CHECK FOR EXPIRATION DATE
    // IF EXPIRED REMOVE COVERAGE AND RUN CHECKCOVERAGE AGAIN
    if (expired(dt.coverage.expiration)) {
      console.log('Coverage expired');
      delete dt.coverage;
      checkCoverage();
    }

    prompt.style.display = 'none';
    getPackages();
  }
  const singlePackageTemplate = (animation, i, active, templateId, dbtn, container) => {
    let innerContent = '';
    let products = '';
    if (i.products.length > 0) {
      for (let o of i.products) products += `<small style="font-size:0.8rem;">${o.name}</small>`
    }
    let accordion = `<details style="color:#fff;"><summary class="col-12">Details</summary>${products}</details>`;
    let temp2Content = `
      <h5 class="title">${i.name}</h5>
      ${animation}
      <h3 class="amount">$${i.price}</h3>
      <div class="action" data-id="id-${i.id}" data-html="Select">Select</div>
    `;
    let temp1Content = `
      <h3 class="amount" style="color:#fff;">$${i.price}</h3>
      ${animation}   
      <h3 class="title flex-center">${i.name}</h3>
      <h5 style="color:#fff;">${i.speed}</h5>
      ${accordion}
      <div class="action" data-id="${i.id}" data-html="${dbtn}">${dbtn}</div>
      ${i.id === active ? '<div class="main">MOST POPULAR</div>' : ''}
    `;

    if (templateId === 1) {
      innerContent = temp1Content;
    } else if (templateId == 2) {
      innerContent = temp2Content;
    } else {}
    container.insertAdjacentHTML("beforeend", `
      <input type="radio" data-price="${i.price}" placeholder="Package" class="form-input" name="package" value="${i.id}" id="id-${i.id}">
      <label for="id-${i.id}" class="paq ${i.id === active ? 'active' : ''}">${innerContent}</label>
    `);

    let checkbox = document.querySelector(`[data-id="${i.id}"]`);
    checkbox.addEventListener('click', (elem) => {
      let btns = document.querySelectorAll(`[data-html]`);
      for (let i of btns) i.innerHTML = i.getAttribute('data-html');
      elem.target.innerHTML = 'Selected';
    });
  }
  const packAnim = (cell, percent) => {
    return `<div class="anim-container">
      <div class="pack-anim">${cell}</div>
      <div class="hide" style="left:${percent}%"></div>
    </div>`;
  }
  const loadPackages = async () => {
    console.log(dt.packages);
    console.log(exists.includes(dt.packages));
    if (exists.includes(dt.packages)) {
      const token = await getToken();
      if (token) {
          const packages = {
            commercial: {},
            residential: {}
          }
          setTimeout( async () => {
            let api = {
              url: `${agileUrl}sales-workbook/get_choices/?o=1&choice_set=packages&return_dates=false`,
              method: 'GET',
              headers: new Headers({'Content-Type': 'application/json; charset=utf-8', 'Authorization': `JWT ${token}`})
            }
            await ajax(api).then(res => {
              if ([200, 201, 202, 203].includes(res.status)) {
                let m = res.result.choices.packages;
                packages.commercial.wireless = m.filter(i => i.cat_id === 4 && i.prod_line_id === 84 && i.id !== 17);
                packages.commercial.fiber = m.filter(i => i.cat_id === 5 && i.prod_line_id === 84);
                packages.residential.fiber = m.filter(i => i.cat_id === 2 && i.prod_line_id === 83);
                packages.residential.wireless = m.filter(i => i.cat_id === 1 && i.prod_line_id === 83 && i.id !== 2 && i.id !== 149 && i.id !== 167);
              } else {
                console.log(`Agile: ${res.detail}`);
              }
            });
            api.url = `${agileUrl}sales-workbook/get_choices/?o=5&choice_set=packages&return_dates=false`;
            await ajax(api).then(res => {
              if ([200, 201, 202, 203].includes(res.status)) {
                let m = res.result.choices.packages;
                packages.residential.elko = m.filter(i => i.cat_id === 2 && i.prod_line_id === 83 && i.id !== 68);
                packages.commercial.elko = m.filter(i => i.cat_id === 5 && i.prod_line_id === 84);
              } else {
                console.log(`Agile: ${res.detail}`);
              }
            });
            if (hasProp(packages.commercial) && hasProp(packages.residential)) {
              dt.packages = packages
              dt.packages.expiration = setExpiration();
              localStorage.setItem("anthem_dt", JSON.stringify(dt));
              console.log('Packages Data Loaded...');
            }
          }, 1000);
        }
    } else {
      if (expired(dt.packages.expiration)) {
        delete dt.packages;
        loadPackages();
      }
      console.log('Packages Data Already Exists...');
    }
  }
  const getPackages = (pProductLine=false, pType=false) => {
    const packages = dt.packages;
    const containerList = document.querySelectorAll('[data-packages]');
    let cell = '';
    for (let i = 0; i < 9; i++) cell += '<div class="w-cell"></div>';
    for (let container of containerList) {
      container.innerHTML = '';
      const type = pType ? pType : container.getAttribute('data-type');
      const productline = pProductLine ? pProductLine : container.getAttribute('data-productline');
      const dbtn = container.getAttribute('data-btn') ? container.getAttribute('data-btn') : 'Select';
      if (packages) {
        let pack = packages[productline][type].sort((a, b) => a.price - b.price);
        let percent = 0;
        let active = pack[pack.length - 2].id;
        let templateId = parseInt(container.getAttribute('data-template'));
        for (let i of pack) {
          percent = percent + (100 / pack.length);
          let animation = packAnim(cell, percent);
          singlePackageTemplate(animation, i, active, templateId, dbtn, container);
        }
      }
    }
  }

  // SCRIPTS
  const flicker = (wait, elem, min, max) => {
    setTimeout((time=ran(min,max)) => {
      elem.style.animationDuration = `0.${time}s`;
      flicker(time * 100, elem, time);
    }, wait);  
  }
  function rotate() {
    for (let i of farm_img) {
      i.style.zIndex = `4`;
      i.style.opacity = `1`;
      i.parentNode.querySelector('span').style.opacity = `0`;
      i.parentNode.querySelector('span').style.zIndex = `auto`;
    }
    this.parentNode.querySelector('span').style.opacity = `1`;
    this.parentNode.querySelector('span').style.zIndex = `4`;
    this.style.opacity = `0`;
    this.style.zIndex = `auto`;
    document.querySelector('#rotator').style.transform = `rotate(${this.dataset.deg}deg)`;
  }
  function matrixAnimation(elem, stop, size=70, special=0) {
    if (stop) return false;
    let width = parseInt(elem.offsetWidth / size);
    let height = parseInt(elem.offsetHeight / size);
    const removeClass = item => {
      if (item.classList.contains('active')) item.classList.remove('active');
    }
    let row = '';
    let content = '';
    let shadow = `
      <span class="first"></span>
      <span class="middle"></span>
      <span class="last"></span>
    `;
    for (let i = 0; i <= width; i++) {
      content += `<div class="column" style="height:${elem.offsetHeight}px;">
        <span 
          class="shadow" 
          style="
            eight:${elem.offsetHeight}px;
            animation-duration:${ran(3, 10)}s;
            animation-delay:${ran(0, 15)}s;
          ">${shadow}</span>
      </div>`;
    }
    for (let i = 0; i <= height; i++) row += `<p class="digit center">${ran(0, 1)}</p>`;
    elem.innerHTML = content;
    let newrow = document.querySelectorAll('.column');
    for (let i of newrow) i.innerHTML += row;
    let digit = document.querySelectorAll('.digit');
    addClasses(digit);
    let slow = document.querySelectorAll('.digit.slow');
    let fast = document.querySelectorAll('.digit.fast');
    setInterval(() => {for (let i of fast) i.innerHTML = ran(0, 1) }, 100);
    setInterval(() => {for (let i of slow)  i.innerHTML = ran(0,1)}, 2000);
    function addClasses(digit) {
      let glowArray = ranArray(digit.length, special);
      let fastChangeArray = ranArray(digit.length, special);
      let slowChangeArray = ranArray(digit.length, special);
      for (let i of glowArray) digit[i].classList.add('fast');
      for (let i of fastChangeArray) digit[i].classList.add('glow');
      for (let i of slowChangeArray) digit[i].classList.add('slow');
    }
    function ranArray(max, len) {
      let random = []
      for (let i = 0; random.length < len; i++){
        let ran_num = Math.floor(Math.random() * max);
        if (!random.includes(ran_num)) random.push(ran_num);
      }
      return random;
    }
  }

  // SECURITY
  const clearLivingRoom = (e) => {
    if (e.classList.remove('fire')) e.classList.remove('fire');
    if (e.classList.remove('water')) e.classList.remove('water');
    if (e.classList.remove('co')) e.classList.remove('co');
  }
  const disList = (list) => {
    for (let i of list) dis(i[0], i[1]);
  }
  const addRemoveActive = (remove, add) => {
    // Expects 2 arrays, the first one contains 1.element, 2.class to be removed
    // The second array should contain 1.element, class to be added
    remove[0].classList.remove(remove[1]);
    add[0].classList.add(add[1]);
  }
  const showHideText = (e) => {
    for (let i of allText) i.style.opacity = 0;
    e.querySelector('.text').style.opacity = '1';
  }

  const parallax = (elem, num) => {
    const el = window.pageYOffset;
    const lo = elem.parentNode.getBoundingClientRect().top;
    elem.style.transform = `translate3d(0px, ${(el * num)}px, 0px)`;
  }
  const counterContent = `
    <div id="wrap">
      <div class="c"></div>
      <div class="o"></div>
      <div class="u"></div>
      <div class="n"></div>
      <div class="t"></div>
    </div>
    <svg style="display:none;">
      <defs>
        <filter id="filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10" result="filter" />
          <feComposite in="SourceGraphic" in2="filter" operator="atop" />
        </filter>
      </defs>
    </svg>
  `;
  const CounterFunction = (elem) => {
    let counterCount = 5;
    let counterWrap = document.querySelector('#wrap');
    function countDown() {
      if (counterCount < 0) if (elem.callback) elem.callback();
      counterWrap.removeAttribute('class');
      setTimeout(function(){
        counterWrap.classList.add('wrap-' + counterCount);
        setTimeout(function(){
          counterCount--;
          countDown();
        }, 1000);
      }, 600);
    }
    countDown();
  }
  const endOfMonth = () => {
    let list = document.querySelectorAll('.endofmonth');

    if (list.length > 0) {
      let l = new Date();
      let o = new Date(l.getFullYear(), l.getMonth() + 1, 0);
      for (let i of list) {
        i.innerHTML = `${o.getMonth() + 1}/${o.getDate()}/${o.getFullYear()}`;
      }
    }
  }
  const getTemplate = (endPoint) => {
    let api = {
      url: `/api/${endPoint}`,
      method: 'GET',
      res: 'text'
    }
    return ajax(api).then(res => res);
  }
  const parallaxExists = (e) => {
    let current = e.querySelectorAll('[data-parallax]');
    if (current.length > 0) {
      for (let i of current) {
        parallax(i, i.getAttribute("data-parallax"));
      }
    }
  }
  const isInView = (el, i=0) => {
    let top = el.offsetTop;
    let height = el.offsetHeight;

    while (el.offsetParent) {
      el = el.offsetParent;
      top += el.offsetTop;
    }

    return (top + i < (window.pageYOffset + window.innerHeight) && (top + height - i) > window.pageYOffset);
  }
  const nav_change = () => {
    if (window.pageYOffset > 0) {
      nav.classList.add('transparent-nav');
    } else {
      nav.classList.remove('transparent-nav');
    }
  }
  const add_accordion = (i) => {
      let head = i.querySelector('[data-accordion="head"]');
      let body = i.querySelector('[data-accordion="body"]');
      head.addEventListener('click', function() {
        head.classList.contains('active') ? head.classList.remove('active') : head.classList.add('active');
        body.classList.contains('active') ? body.classList.remove('active') : body.classList.add('active');
      });
  }
  const createBubble = (bubbleAmount, min, max) => {
    let bubbles = '';
    for (let i = 0; i < bubbleAmount; i++) {
      let left = ((100 / bubbleAmount) * i) + 2;
      let size = ran(min, max);
      bubbles += `<div 
        class="bubble" 
        style="width:${size}vw;
        height:${size}vw;
        left:${left}%;
        animation-duration: ${ran(5, 15)}s;
        animation-delay: ${ran(0, 8)}s;"
      ></div>`;
    }
    return bubbles;
  }
  const createFire = () => {
    let embers = '';
    for (let i = 0; i < 25; i++) {
      embers += `<div 
        class="ember" 
        style="
          left: ${ran(10, 40)}%;
          animation-delay: 0.${ran(1, 100)}s;
        ">
      </div>`;
    }
    return embers;
  }
  const createSmoke = () => {
    let smoke = '';
    let direction = ['smokeleft', 'smokecenter', 'smokeright'];
    for (let i = 0; i < 25; i++) {
      smoke += `<div 
        class="smoke ${direction[ran(0,2)]}" 
        style="
          left: ${ran(20, 50)}%;
          animation-delay: ${ran(0, 5)}.${ran(1, 100)}s;
        ">
      </div>`;
    }
    return smoke;
  }
  const requestQuote = () => {
    let acc = document.querySelector('.quote-request-form');
    let head = acc.querySelector('[data-accordion="head"]');
    let body = acc.querySelector('[data-accordion="body"]');
    head.classList.add('active');
    body.classList.add('active');
  }

  if (grass) grass.parentElement.style.overflow = 'visible';
  if (roots) roots.parentElement.style.overflow = 'visible';
  if(smart_farm) smart_farm.parentElement.classList.add('farm-smart');

  if (page.slug === 'fiber') {
    let innerhmtl = bubbleCon.innerHTML;
    bubbleCon.innerHTML = createBubble(5, 1, 6);
    bubbleCon.innerHTML += innerhmtl;
  }
  for (let i of farm_img) i.addEventListener('click',  rotate);
  
  // SECURITY
  
  if (page.slug === 'security') {
    // Garage 
    garageClosed.addEventListener('click', () => {
      showHideText(garageOpen);
      addRemoveActive([garage, 'active'], [garage, 'inactive']);
      disList([[garageClosed, 'none'], [garageOpen, 'flex']]);
    });
    garageOpen.addEventListener('click', () => {
      showHideText(garageClosed);
      addRemoveActive([garage, 'inactive'], [garage, 'active']);
      disList([[garageClosed, 'flex'], [garageOpen, 'none']]);
    });
    // Lights
    lightsOff.addEventListener('click', () => {
      showHideText(lightsOn);
      addRemoveActive([windows, 'active'], [windows, 'inactive']);
      disList([[lightsOff, 'none'], [lightsOn, 'flex']]);
    });
    lightsOn.addEventListener('click', () => {
      showHideText(lightsOff);
      addRemoveActive([windows, 'inactive'], [windows, 'active']);
      disList([[lightsOff, 'flex'], [lightsOn, 'none']]);
    });
    // Door
    locked.addEventListener('click', () => {
      showHideText(unlocked);
      addRemoveActive([lockedOff, 'active'], [lockedOn, 'active']);
      disList([[unlocked, 'flex'], [locked, 'none']]);
    });
    unlocked.addEventListener('click', () => {
      showHideText(locked);
      addRemoveActive([lockedOn, 'active'], [lockedOff, 'active']);
      disList([[locked, 'flex'], [unlocked, 'none']]);
    });
    // Temperature
    thermostat.addEventListener('click', () => {
      showHideText(thermostat);
      if ( windows.classList.contains('thermostaton')) {
        windows.classList.remove('thermostaton');
      } else {
        windows.classList.add('thermostaton');
      }
    });
    // Fire
    fireTrigger.addEventListener('click', () => {
      if (!phoneCont.classList.contains('on')) {
        phoneCont.classList.add('on');
      }
      if (!livingroom.classList.contains('fire')) {
        showHideText(fireTrigger);
        clearLivingRoom(livingroom);
        livingroom.classList.add('fire');
      }
    });
    // Carbon Monoxide
    carboonMonTrigger.addEventListener('click', () => {
      if (!phoneCont.classList.contains('on')) {
        phoneCont.classList.add('on');
      }
      if (!livingroom.classList.contains('co')) {
        showHideText(carboonMonTrigger);
        clearLivingRoom(livingroom);
        livingroom.classList.add('co');
      }
    });
    // Water
    floodTrigger.addEventListener('click', () => {
      if (!phoneCont.classList.contains('on')) {
        phoneCont.classList.add('on');
      }
      if (!livingroom.classList.contains('water')) {
        showHideText(floodTrigger);
        clearLivingRoom(livingroom);
        livingroom.classList.add('water');
      }
    });
    let fireContent = createFire();
    let smokeContent = createSmoke();
    let bubblesContent = createBubble(10, 1, 9);
    for (let i of fire)  i.innerHTML = fireContent;
    bubbleCon.innerHTML += bubblesContent;
    for (let i of smokecloud) i.innerHTML = smokeContent;

    houseFront.parentElement.style.overflow = 'visible';
  }

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('scroll', () => {
    nav_change();

    if (sec.length > 0) {
      for (let i of sec) {
        isInView(i, 150) ? i.classList.add('active') : i.classList.remove('active');
      }
    }
    
    if (mine) {
      if (mine.parentNode.classList.contains('active')) {
        if (!mine.parentNode.classList.contains('running')) {
          mine.parentNode.classList.add('running');
          matrixAnimation(document.querySelector('.mine.bg > .matrix'), false, digit, 30);
        } 
      } else {
        mine.parentNode.classList.remove('running');
        matrixAnimation(document.querySelector('.mine.bg > .matrix'), true);
      }
    }

    if(headqtr) {
      if (headqtr.parentNode.classList.contains('active')) {
        if (!headqtr.parentNode.classList.contains('running')) {
          headqtr.parentNode.classList.add('running');
          matrixAnimation(document.querySelector('.headqtr.bg > .matrix'), false, digit, 30);
        } 
      } else {
        headqtr.parentNode.classList.remove('running');
        matrixAnimation(document.querySelector('.headqtr.bg > .matrix'), true);
      }
    }

    if (hero) {
      if (isInView(hero)) {
        move(roots.parentNode, 0.008);
      }
    }

    if (wirelessHouse) {
      let house = wirelessHouse.querySelector('.front-house');
      let rooms = document.querySelector('#transparent');
      house.parentElement.style.overflow = 'visible';
      if (isInView(rooms, 100)) rooms.classList.add('transparent');
    }
    
    if (light.length > 0) {
      for (let i of light) {
        if (i.parentNode.parentNode.classList.contains('active')) {
          flicker(2000, i, 4, 9);
        }
      }
    }

    if (parCon.length > 0) {
      for (let i of parCon) {
        if (isInView(i)) parallaxExists(i);
      }
    }

    if (securityHero) {
      if (isInView(securityHero)) {
        move(houseFront.parentNode, -0.06);
      }
    }

  });

});
