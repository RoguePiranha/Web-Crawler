import { Form } from '@marccent/util/form';
import { post } from '@marccent/util';
import 'bootstrap';
import '../css/global.css';
import '@marccent/util/css/form';

const urlEndpoint = 'http://localhost:8000/url/';
const ai_res = document.querySelector('.ai_response');
const add_url = document.querySelector('.add_url');
const remove_url = document.querySelector('.remove_url');
const status = document.querySelector('.status');
// Callback function will run when last step is submitted
const formormCallback = (form, val) => {
  return new Promise( async (resolve) => {
    const headers = {
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
    }
    const dt = await post(urlEndpoint, val, headers);
    console.log(val, dt);
    ai_res.innerHTML = `<pre>${dt.ai_response}</pre>`;
    resolve(true);
  });
}

const form = new Form(document.querySelector('#crawler'), formormCallback);
add_url.addEventListener('click', (e) => {
  let list = document.querySelectorAll('[id*="url_field"]');
  list[list.length - 1].insertAdjacentHTML("afterend", `
    <div class="input-group mb-3" id="url_field_1">
      <span class="input-group-text" id="basic-addon2">Domain</span>
      <input type="text" class="form-input form-control" 
        name="url_${list.length + 1}" required placeholder="Enter URL #${list.length + 1}">
    </div>
  `);

  remove_url.disabled = document.querySelectorAll('[id*="url_field"]').length > 1 ? false : true;
});

remove_url.addEventListener('click', (e) => {
  const list = document.querySelectorAll('[id*="url_field"]');
  console.log(list.length)
  const last = list[list.length - 1];
  const input = last.querySelector('input');
  if (input.value !== '') {
    status.innerHTML = `
      <div class="alert alert-danger mt-2">
        <div>${input.getAttribute('placeholder')} need to be empty in order to delete.</div>
      </div>
    `;
    return;
  } else {
    status.innerHTML = `
      <div class="alert alert-success mt-2">
        <div>${input.getAttribute('placeholder')} has been deleted.</div>
      </div>
    `;
    last.remove();
  }
  remove_url.disabled = document.querySelectorAll('[id*="url_field"]').length < 2 ? true : false;
})

