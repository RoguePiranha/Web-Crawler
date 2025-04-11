import { Form } from '@marccent/util/form';
import { post } from '@marccent/util';
import 'bootstrap';
import '../css/global.css';
import '@marccent/util/css/form';

const urlEndpoint = 'http://localhost:8000/url/';
const ai_res = document.querySelector('.ai_response');
// Callback function will run when last step is submitted
const formormCallback = (form, val) => {
  return new Promise( async (resolve) => {
    const headers = {
      'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
    }
    const dt = await post(urlEndpoint, val, headers);
    console.log(val, dt);
    ai_res.innerHTML = dt.ai_response;
    resolve(true);
  });
}

const form = new Form(document.querySelector('#contact-info'), formormCallback);

