import { exists, Form, ajax, msgError } from './utilities.js';

class Agile {
  constructor(agileData) {
    this.url = 'https://agileisp.com/api/';
    this.token = localStorage.getItem('agile_token');
    this.autoLogin = false;
    this.tokenVerified = false;
    this.loginBg = document.querySelector('.login-bg');
    this.loginForm = document.querySelector('.check-login');

    // AGILE DATA
    this.email_preference = false;
    this.sms_preference = false;
    this.update_existing = true;
    this.same_billing = true;
    this.create_account = agileData.create_account;
    this.service_street = agileData.line1;
    this.service_street2 = agileData.line2;
    this.service_city = agileData.locality;
    this.service_state = agileData.region;
    this.service_zip = agileData.postal_code;
    this.email = agileData.email;
    this.phone = agileData.phone;
    this.first_name = agileData.given_name;
    this.last_name = agileData.family_name;
    this.org_id_list = agileData.o;

    this.getToken();
  }

  request(endpoint, method, body=false, auth=false) {
    let headers = { 'Content-Type': 'application/json; charset=utf-8' }
    if (auth) headers['Authorization'] = `JWT ${this.token}`
    let api = {
      url: `${this.url}${endpoint}`,
      headers: new Headers(headers),
      method: method
    }
    if (body) api.body = JSON.stringify(body);
    return ajax(api).then( res => res ); 
  }
  verifyToken() {
    let verified = this.request('auth-token/verify/', 'POST', {token: this.token}, false);
    return verified.token ? true : false;
  }
  refreshToken() {
    return this.request('auth-token/refresh/', 'POST', {token: this.token}, false);
  }
  requestNewToken() {
    if (this.autoLogin) {
      // GET TOKEN FROM SERVER
      // USE CREDENTIALS STORED ON DB
    } else {
      // USER LOGIN
     this.login();
    }
  }
  requestTokenFromServer() {

  }
  updateTokenOnDB() {
    let api = {
      body: `action=agile_token&token=${token}`,
      method: 'POST',
      url: agile_token.ajax_url
    }
    return ajax(api).then(res => {
      localStorage.setItem("agile_token", res.token);
      return res.token;
    });
  }
  async getToken() {
    // If token is null request brand new token
    if (!exists.includes(this.token)) {
      // check if agile token is valid. 
      let verified = await this.verifyToken();
      if (!verified) {
        // Attempt to refresh token if no longer valid
        let refreshed = await this.refreshToken();
        if (refreshed.token) {
          this.token = refreshed.token;
          localStorage.setItem("agile_token", this.token);
        } else {
          this.requestNewToken();
        }
      } 
    } else {
      this.requestNewToken();
    }
  }
  checkList (val) {
    let params = new URLSearchParams(val);
    let endpoint = `workorder/get_fiber_checklist/?${params.toString()}`; 
    return this.request(endpoint, 'GET', false, true);
  }
  login() {
    const formCallback = async (form, val) => {
      let attempt = await this.request('auth-token/', 'POST', val, false);
      if (!attempt.ok) {
        let status = '';
        for (let i of attempt.non_field_errors) status += `<div>${i}</div>`;
        form.status.innerHTML = msgError(status);
        return false;
      }
      return new Promise( async (resolve) => {
        this.loginBg.style.display = 'none';
        this.token = attempt.token;
        localStorage.setItem("agile_token", this.token);
        resolve(true);
      });
    }
    const checkLogin = new Form(this.loginForm, formCallback);
    this.loginBg.style.display = 'flex';
    return false;
  }
  widthinZone(val) {
    val.address = `${val.line1}, ${val.locality}, ${val.region} ${val.postal_code}`;
    let params = new URLSearchParams(val);
    params.delete('project_id'); // Issue in agile when stringifying project_id
    let endpoint = `fiber-tool/zone_status/?${params}&project_id=${val.project_id}`;
    return this.request(endpoint, 'GET', false, true);
  }
  async makeSale(workbook_id, elem) {
    let recursiveCnt = 0;
    let val = {
      workbook_id: workbook_id
    }
    let attempt = await this.request('sales/make_sale/', 'POST', val, false, true);
    if (attempt.status === 500 && recursiveCnt < 4) {
      console.log(`Error ${res.status} - Trying again in 5 seconds, try #${recursiveCnt++}`);
      var timeout = setTimeout( async () => await makeSale(workbook_id, elem), 5000);
    } else {
      clearTimeout(timeout);
      return attempt;
    }
  }
}

export { Agile }