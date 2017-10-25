const emailPattern = /[^\s]+@[^\s]+/i;

const FormValidation = {
	init: init,
	setupFormControls: setupFormControls,

	validateHandle: validateHandle,
	validateField: validateField,
	validate: validate
};

function newFormValidation(formEl, options){
	const formValidation = Object.create(FormValidation);
	formValidation.init(formEl, options);
	return formValidation;
}

function init(formEl, options){
	if(!formEl){
		return;
	}

	this.formEl = formEl;

	if(typeof this.formEl == 'string'){
		this.formEl = document.querySelector(this.formEl);
	}

	if(!this.formEl){
		return;
	}

	if(!options){
		options = {};
	}

	this.invalidClass = options.invalidClass || 'control--invalid';
	this.validClass = options.validClass || 'control--valid';

	this.validateField = this.validateField.bind(this);
	this.validateHandle = this.validateHandle.bind(this);
	this.validate = this.validate.bind(this);

	this.setupFormControls();
	addEventListeners.call(this);
}

function setupFormControls(){
	const requiredFields = Array.prototype.slice.call(this.formEl.querySelectorAll('[required]'));
	this.fields = [];
	this.fieldsArray = [];

	const confirmArray = [];

	for (let i = 0; i < requiredFields.length; i++) {
		this.fieldsArray.push(requiredFields[i]);

		let confirmEl = false;
		if(requiredFields[i].getAttribute('data-confirm-for')){
			confirmEl = this.formEl.querySelector('#'+requiredFields[i].getAttribute('data-confirm-for'));
			confirmArray.push({
				index: i,
				confirmEl: confirmEl
			});
		}

		this.fields.push({
			fieldEl: requiredFields[i],
			isDirty: false,
			isValid: true,
			wasValid: false,
			pattern: requiredFields[i].getAttribute('data-pattern') || /./,
			confirmEl: confirmEl,
			confirmField: false
		});
	}

	let index = 0;
	for (let i = 0; i < confirmArray.length; i++) {
		index = this.fieldsArray.indexOf(confirmArray[i].confirmEl);
		const confirmField = this.fields[confirmArray[i].index];
		const field = this.fields[index];
		field.confirmField = confirmField;
	}
}

function addEventListeners(){
	this.formEl.addEventListener('change', this.validateHandle);
	this.formEl.addEventListener('keyup', this.validateHandle);
}

function validateHandle(evt){
	const index = this.fieldsArray.indexOf(evt.target);
	if(!~index){
		return;
	}

	const field = this.fields[index];
	this.validateField(field, evt.type);
}

function validateField(field, type){
	if(!field.isDirty && (!type || type == 'change')){
		field.isDirty = true;
	}

	if(!field.isDirty){
		return;
	}

	if(field.isValid){
		field.wasValid = true;
	}else{
		field.wasValid = false;
	}

	this.validate(field);

	if(
		(field.wasValid && (!type || type == 'change')) ||
		!field.wasValid
	){
		if(field.isValid){
			field.fieldEl.classList.remove(this.invalidClass);
			field.fieldEl.classList.add(this.validClass);
		}else{
			field.fieldEl.classList.add(this.invalidClass);
			field.fieldEl.classList.remove(this.validClass);
		}
	}

	if(field.confirmField && field.confirmField.isDirty){
		this.validateField(field.confirmField, 'change');
	}
}

function validate(field){
	let pattern;
	const fieldType = field.fieldEl.getAttribute('type');

	if(fieldType == 'email'){
		pattern = emailPattern;
	}else{
		pattern = field.pattern;
	}
	let isValid = pattern.test(field.fieldEl.value);
	if(field.confirmEl){
		if(field.confirmEl.value != field.fieldEl.value){
			isValid = false;
		}
	}
	field.isValid = isValid;
}

export default newFormValidation;
